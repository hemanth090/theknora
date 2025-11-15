use actix_web::{web, HttpResponse};
use log::info;
use crate::models::{ProcessFileRequest, ProcessFileResponse};
use crate::services::DocumentProcessor;
use std::sync::Mutex;
use std::collections::HashMap;

pub async fn process_file(
    req: web::Json<ProcessFileRequest>,
    processor: web::Data<Mutex<DocumentProcessor>>,
) -> HttpResponse {
    let processor = processor.lock().unwrap();

    match processor.process_file(&req.file_path) {
        Ok(document) => {
            info!("Successfully processed file: {}", req.file_path);
            HttpResponse::Ok().json(ProcessFileResponse {
                success: true,
                message: format!("File processed successfully: {}", document.file_name),
                document: Some(document),
            })
        }
        Err(e) => {
            log::error!("Error processing file: {}", e);
            HttpResponse::BadRequest().json(ProcessFileResponse {
                success: false,
                message: format!("Error processing file: {}", e),
                document: None,
            })
        }
    }
}

pub async fn get_file_stats(
    query: web::Query<HashMap<String, String>>,
    processor: web::Data<Mutex<DocumentProcessor>>,
) -> HttpResponse {
    let file_path = match query.get("file_path") {
        Some(path) => path,
        None => {
            return HttpResponse::BadRequest().json(serde_json::json!({
                "error": "file_path query parameter is required"
            }))
        }
    };

    let processor = processor.lock().unwrap();

    match processor.process_file(file_path.as_str()) {
        Ok(document) => {
            HttpResponse::Ok().json(serde_json::json!({
                "file_name": document.file_name,
                "file_type": document.file_type,
                "file_size": document.file_size,
                "num_chunks": document.num_chunks,
                "text_length": document.text.len(),
            }))
        }
        Err(e) => {
            HttpResponse::NotFound().json(serde_json::json!({
                "error": format!("File not found: {}", e)
            }))
        }
    }
}
