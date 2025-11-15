use actix_web::{web, App, HttpServer, middleware};
use actix_cors::Cors;
use log::info;
use std::sync::Mutex;

mod config;
mod handlers;
mod models;
mod services;

use config::AppConfig;
use services::{DocumentProcessor, VectorStore, LLMHandler};
use handlers::*;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    let config = AppConfig::from_env();
    info!("Starting {} v{}", config.app_name, config.app_version);
    info!("Server will listen on {}", config.server_addr());

    let store_path = config.vector_store_path.to_string_lossy().to_string();
    let embedding_model = config.embedding_model.clone();
    let groq_api_key = config.groq_api_key.clone();
    let default_llm_model = config.default_llm_model.clone();
    let upload_dir = config.upload_dir.to_string_lossy().to_string();

    let vector_store = match VectorStore::new(&store_path, &embedding_model) {
        Ok(store) => {
            info!("Vector store initialized successfully");
            web::Data::new(Mutex::new(store))
        }
        Err(e) => {
            eprintln!("Failed to initialize vector store: {}", e);
            panic!("Cannot start server without vector store");
        }
    };

    let document_processor = web::Data::new(Mutex::new(DocumentProcessor::new(
        config.default_chunk_size,
        config.default_chunk_overlap,
    )));

    let llm_handler = match LLMHandler::new(groq_api_key, default_llm_model) {
        Ok(handler) => {
            info!("LLM handler initialized successfully");
            web::Data::new(Mutex::new(handler))
        }
        Err(e) => {
            eprintln!("Warning: Failed to initialize LLM handler: {}", e);
            eprintln!("LLM features will be unavailable");
            panic!("Cannot start server without LLM handler");
        }
    };

    let upload_dir_data = web::Data::new(upload_dir.clone());

    let host = config.server_host.clone();
    let port = config.server_port;

    info!("Initializing HTTP server...");
    info!("Upload directory: {}", upload_dir);

    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header()
            .max_age(3600);

        App::new()
            .app_data(vector_store.clone())
            .app_data(document_processor.clone())
            .app_data(llm_handler.clone())
            .app_data(upload_dir_data.clone())
            .wrap(middleware::Logger::default())
            .wrap(cors)
            .service(
                web::scope("/api")
                    .service(
                        web::scope("/health")
                            .route("", web::get().to(health::health_check))
                    )
                    .service(
                        web::scope("/documents")
                            .route("/process", web::post().to(document::process_file))
                            .route("/stats", web::get().to(document::get_file_stats))
                            .route("/upload", web::post().to(upload::upload_file))
                            .route("/formats", web::get().to(upload::get_supported_formats))
                    )
                    .service(
                        web::scope("/search")
                            .route("", web::post().to(search::search))
                            .route("/stats", web::get().to(search::get_vector_store_stats))
                            .route("/add", web::post().to(search::add_documents))
                            .route("/delete", web::delete().to(search::delete_document))
                            .route("/clear", web::delete().to(search::clear_store))
                            .route("/storage", web::get().to(search::get_storage_info))
                            .route("/storage/cleanup", web::post().to(search::cleanup_old_files))
                    )
                    .service(
                        web::scope("/llm")
                            .route("/answer", web::post().to(llm::generate_answer))
                            .route("/model-info", web::get().to(llm::get_model_info))
                            .route("/models", web::get().to(llm::get_supported_models))
                    )
            )
    })
    .bind((host.as_str(), port))?
    .run()
    .await
}
