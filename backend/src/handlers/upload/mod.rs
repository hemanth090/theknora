use actix_multipart::Multipart;
use actix_web::{web, HttpResponse};
use futures::StreamExt;
use serde::Serialize;
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use log::{info, error};
use crate::models::ProcessFileResponse;
use crate::services::{DocumentProcessor, VectorStore};
use std::fs;

#[derive(Serialize)]
pub struct SupportedFormat {
    pub extension: String,
    pub name: String,
    pub max_size_mb: u64,
}

#[derive(Serialize)]
pub struct SupportedFormatsResponse {
    pub formats: Vec<SupportedFormat>,
}

const MAX_FILE_SIZE: usize = 100 * 1024 * 1024;
const SUPPORTED_EXTENSIONS: &[&str] = &[
    ".pdf", ".txt", ".doc", ".docx", ".csv",
    ".xlsx", ".xls", ".md", ".pptx", ".json"
];

pub async fn upload_file(
    mut payload: Multipart,
    upload_dir: web::Data<String>,
    processor: web::Data<Mutex<DocumentProcessor>>,
    vector_store: web::Data<Mutex<VectorStore>>,
) -> HttpResponse {
    match process_upload(&mut payload, upload_dir, processor, vector_store).await {
        Ok(response) => HttpResponse::Ok().json(response),
        Err(err_msg) => {
            error!("Upload error: {}", err_msg);
            HttpResponse::BadRequest().json(ProcessFileResponse {
                success: false,
                message: format!("Upload failed: {}", err_msg),
                document: None,
            })
        }
    }
}

async fn process_upload(
    payload: &mut Multipart,
    upload_dir: web::Data<String>,
    processor: web::Data<Mutex<DocumentProcessor>>,
    vector_store: web::Data<Mutex<VectorStore>>,
) -> Result<ProcessFileResponse, String> {
    let mut file_bytes = Vec::new();
    let mut file_name = String::new();

    while let Some(field_result) = payload.next().await {
        let mut field = field_result
            .map_err(|e| format!("Failed to read form field: {}", e))?;

        if field.name() == "file" {
            // Extract filename from content disposition header
            let disposition = field.content_disposition();
            if let Some(filename) = disposition.get_filename() {
                file_name = filename.to_string();
            } else {
                return Err("No filename provided".to_string());
            }

            validate_filename(&file_name)?;

            // Read file content
            while let Some(chunk_result) = field.next().await {
                let chunk = chunk_result
                    .map_err(|e| format!("Failed to read file chunk: {}", e))?;

                if file_bytes.len() + chunk.len() > MAX_FILE_SIZE {
                    return Err(format!(
                        "File size exceeds maximum of {} MB",
                        MAX_FILE_SIZE / (1024 * 1024)
                    ));
                }

                file_bytes.extend_from_slice(&chunk);
            }
            break;
        }
    }

    if file_name.is_empty() {
        return Err("No file provided in request".to_string());
    }

    if file_bytes.is_empty() {
        return Err("File is empty".to_string());
    }

    // Create upload directory if it doesn't exist
    fs::create_dir_all(upload_dir.as_str())
        .map_err(|e| format!("Failed to create upload directory: {}", e))?;

    // Create a unique filename in the upload directory
    let upload_filename = format!("upload_{}", file_name);
    let file_path = PathBuf::from(upload_dir.as_str()).join(&upload_filename);
    let file_path_str = file_path.to_string_lossy().to_string();

    // Write file content to upload directory
    fs::write(&file_path, &file_bytes)
        .map_err(|e| format!("Failed to write file: {}", e))?;

    info!("Uploaded file to: {}", file_path_str);
    info!("Processing uploaded file: '{}'", file_name);

    // Process the file using the original filename for extension detection
    let processing_result = {
        let processor_guard = processor.lock().unwrap();
        processor_guard.process_file_with_name(&file_path_str, Some(&file_name))
    };

    let mut document = processing_result.map_err(|e| {
        let _ = fs::remove_file(&file_path);
        format!("Error processing file: {}", e)
    })?;

    // Restore original filename in document
    document.file_name = file_name.clone();

    // Add processed document to the vector store
    {
        let mut store_guard = vector_store.lock().unwrap();
        store_guard
            .add_documents(vec![document.clone()])
            .map_err(|e| {
                let _ = fs::remove_file(&file_path);
                format!("Error adding document to vector store: {}", e)
            })?;
    }

    info!("Successfully processed and indexed uploaded file: {}", file_name);

    Ok(ProcessFileResponse {
        success: true,
        message: format!("File uploaded and processed successfully: {}", file_name),
        document: Some(document),
    })
}

fn validate_filename(filename: &str) -> Result<(), String> {
    if filename.is_empty() {
        return Err("Filename cannot be empty".to_string());
    }

    if filename.len() > 255 {
        return Err("Filename is too long (max 255 characters)".to_string());
    }

    if filename.contains('/') || filename.contains('\\') {
        return Err("Invalid filename: path separators not allowed".to_string());
    }

    if filename.contains('\0') {
        return Err("Invalid filename: contains null bytes".to_string());
    }

    let extension = Path::new(filename)
        .extension()
        .and_then(|ext| ext.to_str())
        .map(|s| format!(".{}", s.to_lowercase()))
        .unwrap_or_else(|| "".to_string());

    // Only validate extension if one exists
    if !extension.is_empty() && !SUPPORTED_EXTENSIONS.contains(&extension.as_str()) {
        return Err(format!(
            "Unsupported file format: {}. Supported: {}",
            extension,
            SUPPORTED_EXTENSIONS.join(", ")
        ));
    }

    Ok(())
}

pub async fn get_supported_formats() -> HttpResponse {
    let formats = vec![
        SupportedFormat {
            extension: ".txt".to_string(),
            name: "Plain Text".to_string(),
            max_size_mb: 100,
        },
        SupportedFormat {
            extension: ".pdf".to_string(),
            name: "PDF Document".to_string(),
            max_size_mb: 100,
        },
        SupportedFormat {
            extension: ".docx".to_string(),
            name: "Word Document (2007+)".to_string(),
            max_size_mb: 100,
        },
        SupportedFormat {
            extension: ".doc".to_string(),
            name: "Word Document (97-2003)".to_string(),
            max_size_mb: 100,
        },
        SupportedFormat {
            extension: ".csv".to_string(),
            name: "CSV Spreadsheet".to_string(),
            max_size_mb: 100,
        },
        SupportedFormat {
            extension: ".xlsx".to_string(),
            name: "Excel Spreadsheet (2007+)".to_string(),
            max_size_mb: 100,
        },
        SupportedFormat {
            extension: ".xls".to_string(),
            name: "Excel Spreadsheet (97-2003)".to_string(),
            max_size_mb: 100,
        },
        SupportedFormat {
            extension: ".md".to_string(),
            name: "Markdown Document".to_string(),
            max_size_mb: 100,
        },
        SupportedFormat {
            extension: ".pptx".to_string(),
            name: "PowerPoint Presentation".to_string(),
            max_size_mb: 100,
        },
        SupportedFormat {
            extension: ".json".to_string(),
            name: "JSON Data File".to_string(),
            max_size_mb: 100,
        },
    ];

    HttpResponse::Ok().json(SupportedFormatsResponse { formats })
}
