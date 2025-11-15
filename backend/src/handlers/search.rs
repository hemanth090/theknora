use actix_web::{web, HttpResponse, HttpRequest};
use log::info;
use crate::models::{SearchRequest, SearchResponse};
use crate::services::VectorStore;
use std::sync::Mutex;
use std::collections::HashMap;
use serde_json::json;

/// Check if request has valid authentication token
fn verify_auth(req: &HttpRequest) -> bool {
    let required_token = std::env::var("AUTH_TOKEN")
        .unwrap_or_else(|_| "dev-token-change-in-production".to_string());

    let auth_header = req
        .headers()
        .get("Authorization")
        .and_then(|h| h.to_str().ok())
        .unwrap_or("");

    if !auth_header.starts_with("Bearer ") {
        return false;
    }

    let token = &auth_header[7..];
    token == required_token
}

pub async fn search(
    req: web::Json<SearchRequest>,
    vector_store: web::Data<Mutex<VectorStore>>,
) -> HttpResponse {
    let store = vector_store.lock().unwrap();
    let k = req.k.unwrap_or(5);
    let score_threshold = req.score_threshold.unwrap_or(0.0);

    match store.search(&req.query, k, score_threshold) {
        Ok(results) => {
            let count = results.len();
            info!("Search query '{}' returned {} results", req.query, count);
            HttpResponse::Ok().json(SearchResponse {
                results,
                query: req.query.clone(),
                count,
            })
        }
        Err(e) => {
            log::error!("Error during search: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": format!("Search error: {}", e)
            }))
        }
    }
}

pub async fn get_vector_store_stats(
    vector_store: web::Data<Mutex<VectorStore>>,
) -> HttpResponse {
    let store = vector_store.lock().unwrap();

    match store.get_stats() {
        Ok(stats) => {
            info!("Retrieved vector store statistics");
            HttpResponse::Ok().json(stats)
        }
        Err(e) => {
            log::error!("Error retrieving stats: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": format!("Error retrieving statistics: {}", e)
            }))
        }
    }
}

pub async fn add_documents(
    documents: web::Json<Vec<crate::models::ProcessedDocument>>,
    vector_store: web::Data<Mutex<VectorStore>>,
) -> HttpResponse {
    let mut store = vector_store.lock().unwrap();
    let doc_count = documents.len();

    match store.add_documents(documents.into_inner()) {
        Ok(_) => {
            info!("Successfully added {} documents to vector store", doc_count);
            HttpResponse::Ok().json(serde_json::json!({
                "success": true,
                "message": format!("Added {} documents to vector store", doc_count)
            }))
        }
        Err(e) => {
            log::error!("Error adding documents: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": format!("Error adding documents: {}", e)
            }))
        }
    }
}

pub async fn delete_document(
    query: web::Query<HashMap<String, String>>,
    vector_store: web::Data<Mutex<VectorStore>>,
) -> HttpResponse {
    let file_path = match query.get("file_path") {
        Some(path) => path,
        None => {
            return HttpResponse::BadRequest().json(serde_json::json!({
                "error": "file_path query parameter is required"
            }))
        }
    };

    let mut store = vector_store.lock().unwrap();

    match store.delete_document(file_path.as_str()) {
        Ok(deleted) => {
            if deleted {
                info!("Deleted document: {}", file_path);
                HttpResponse::Ok().json(serde_json::json!({
                    "success": true,
                    "message": format!("Document deleted: {}", file_path)
                }))
            } else {
                HttpResponse::NotFound().json(serde_json::json!({
                    "success": false,
                    "message": "Document not found"
                }))
            }
        }
        Err(e) => {
            log::error!("Error deleting document: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": format!("Error deleting document: {}", e)
            }))
        }
    }
}

pub async fn clear_store(
    vector_store: web::Data<Mutex<VectorStore>>,
) -> HttpResponse {
    let mut store = vector_store.lock().unwrap();

    match store.clear_store() {
        Ok(_) => {
            info!("Vector store cleared");
            HttpResponse::Ok().json(serde_json::json!({
                "success": true,
                "message": "Vector store cleared successfully"
            }))
        }
        Err(e) => {
            log::error!("Error clearing store: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": format!("Error clearing store: {}", e)
            }))
        }
    }
}

pub async fn get_storage_info(
    req: HttpRequest,
    upload_dir: web::Data<String>,
) -> HttpResponse {
    // Check authentication
    if !verify_auth(&req) {
        return HttpResponse::Unauthorized().json(json!({
            "success": false,
            "error": "Unauthorized - Authentication token required"
        }));
    }
    use std::fs;
    use std::path::Path;

    let dir_path = Path::new(upload_dir.as_str());

    // List all uploaded files
    let mut files = Vec::new();
    let mut total_size: u64 = 0;

    if dir_path.exists() {
        match fs::read_dir(dir_path) {
            Ok(entries) => {
                for entry in entries.flatten() {
                    if let Ok(metadata) = entry.metadata() {
                        if metadata.is_file() {
                            let file_name = entry
                                .file_name()
                                .into_string()
                                .unwrap_or_else(|_| "unknown".to_string());
                            let file_size = metadata.len();
                            total_size += file_size;

                            files.push(json!({
                                "name": file_name,
                                "size_bytes": file_size,
                                "size_mb": format!("{:.2}", file_size as f64 / (1024.0 * 1024.0))
                            }));
                        }
                    }
                }
            }
            Err(e) => {
                log::warn!("Failed to read upload directory: {}", e);
            }
        }
    }

    info!(
        "Retrieved storage info: {} files, {:.2} MB total",
        files.len(),
        total_size as f64 / (1024.0 * 1024.0)
    );

    HttpResponse::Ok().json(json!({
        "success": true,
        "upload_dir": upload_dir.as_str(),
        "total_files": files.len(),
        "total_size_bytes": total_size,
        "total_size_mb": format!("{:.2}", total_size as f64 / (1024.0 * 1024.0)),
        "files": files
    }))
}

pub async fn cleanup_old_files(
    req: HttpRequest,
    upload_dir: web::Data<String>,
    vector_store: web::Data<std::sync::Mutex<VectorStore>>,
) -> HttpResponse {
    // Check authentication
    if !verify_auth(&req) {
        return HttpResponse::Unauthorized().json(json!({
            "success": false,
            "error": "Unauthorized - Authentication token required"
        }));
    }
    use std::fs;
    use std::path::Path;
    use std::time::SystemTime;

    let dir_path = Path::new(upload_dir.as_str());
    let mut deleted_count = 0;
    let mut freed_space: u64 = 0;
    let mut deleted_documents = Vec::new();
    let days_old = 30; // Delete files older than 30 days
    let cutoff_time = SystemTime::now()
        - std::time::Duration::from_secs(days_old * 24 * 60 * 60);

    if dir_path.exists() {
        if let Ok(entries) = fs::read_dir(dir_path) {
            for entry in entries.flatten() {
                if let Ok(metadata) = entry.metadata() {
                    if metadata.is_file() {
                        if let Ok(modified) = metadata.modified() {
                            if modified < cutoff_time {
                                freed_space += metadata.len();
                                if let Some(file_name) = entry.file_name().to_str() {
                                    deleted_documents.push(file_name.to_string());
                                }
                                if let Err(e) = fs::remove_file(entry.path()) {
                                    log::warn!(
                                        "Failed to delete old file {:?}: {}",
                                        entry.file_name(),
                                        e
                                    );
                                } else {
                                    deleted_count += 1;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Also remove deleted documents from vector store
    if !deleted_documents.is_empty() {
        let mut store = vector_store.lock().unwrap();
        for doc_path in deleted_documents {
            if let Err(e) = store.delete_document(&doc_path) {
                log::warn!("Failed to delete document from vector store: {}", e);
            } else {
                log::info!("Removed document from vector store: {}", doc_path);
            }
        }
    }

    info!(
        "Cleanup: deleted {} files, freed {:.2} MB",
        deleted_count,
        freed_space as f64 / (1024.0 * 1024.0)
    );

    HttpResponse::Ok().json(json!({
        "success": true,
        "deleted_files": deleted_count,
        "freed_space_bytes": freed_space,
        "freed_space_mb": format!("{:.2}", freed_space as f64 / (1024.0 * 1024.0))
    }))
}
