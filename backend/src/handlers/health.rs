use actix_web::HttpResponse;
use log::info;

pub async fn health_check() -> HttpResponse {
    info!("Health check endpoint called");
    HttpResponse::Ok().json(serde_json::json!({
        "status": "healthy",
        "service": "KnoRa AI Backend",
        "version": "2.0.0"
    }))
}
