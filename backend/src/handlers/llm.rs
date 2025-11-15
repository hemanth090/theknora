use actix_web::{web, HttpResponse};
use log::info;
use crate::models::AnswerRequest;
use crate::services::LLMHandler;
use std::sync::Mutex;

pub async fn generate_answer(
    req: web::Json<AnswerRequest>,
    llm_handler: web::Data<Mutex<LLMHandler>>,
) -> HttpResponse {
    let handler = llm_handler.lock().unwrap();
    let max_tokens = req.max_tokens.unwrap_or(8192);
    let temperature = req.temperature.unwrap_or(1.0);

    match handler
        .generate_answer(
            &req.query,
            &req.retrieved_chunks,
            max_tokens,
            temperature,
        )
        .await
    {
        Ok(response) => {
            info!("Successfully generated answer for query: {}", req.query);
            HttpResponse::Ok().json(response)
        }
        Err(e) => {
            log::error!("Error generating answer: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": format!("Error generating answer: {}", e)
            }))
        }
    }
}

pub async fn get_model_info(
    llm_handler: web::Data<Mutex<LLMHandler>>,
) -> HttpResponse {
    let handler = llm_handler.lock().unwrap();
    let model_info = handler.get_model_info();

    info!("Retrieved LLM model information");
    HttpResponse::Ok().json(model_info)
}

pub async fn get_supported_models() -> HttpResponse {
    let models = crate::models::get_supported_models();
    info!("Retrieved list of supported LLM models");
    HttpResponse::Ok().json(models)
}
