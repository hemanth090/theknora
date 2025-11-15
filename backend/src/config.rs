use serde::{Deserialize, Serialize};
use std::env;
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub app_name: String,
    pub app_version: String,
    pub vector_store_path: PathBuf,
    pub upload_dir: PathBuf,
    pub embedding_model: String,
    pub default_chunk_size: usize,
    pub default_chunk_overlap: usize,
    pub groq_api_key: String,
    pub server_host: String,
    pub server_port: u16,
    pub default_llm_model: String,
}

impl AppConfig {
    pub fn from_env() -> Self {
        dotenv::dotenv().ok();

        let groq_api_key = env::var("GROQ_API_KEY")
            .unwrap_or_else(|_| {
                eprintln!("Warning: GROQ_API_KEY not set");
                String::new()
            });

        let vector_store_path = env::var("VECTOR_STORE_PATH")
            .unwrap_or_else(|_| "data/vector_store".to_string());

        let upload_dir = env::var("UPLOAD_DIR")
            .unwrap_or_else(|_| "data/uploads".to_string());

        let embedding_model = env::var("EMBEDDING_MODEL")
            .unwrap_or_else(|_| "all-MiniLM-L6-v2".to_string());

        let server_host = env::var("SERVER_HOST")
            .unwrap_or_else(|_| "127.0.0.1".to_string());

        let server_port = env::var("SERVER_PORT")
            .unwrap_or_else(|_| "8000".to_string())
            .parse::<u16>()
            .unwrap_or(8000);

        let default_llm_model = env::var("DEFAULT_LLM_MODEL")
            .unwrap_or_else(|_| "openai/gpt-oss-120b".to_string());

        AppConfig {
            app_name: "KnoRa AI Knowledge Assistant".to_string(),
            app_version: "2.0.0".to_string(),
            vector_store_path: PathBuf::from(vector_store_path),
            upload_dir: PathBuf::from(upload_dir),
            embedding_model,
            default_chunk_size: 1000,
            default_chunk_overlap: 200,
            groq_api_key,
            server_host,
            server_port,
            default_llm_model,
        }
    }

    pub fn server_addr(&self) -> String {
        format!("{}:{}", self.server_host, self.server_port)
    }
}

#[derive(Debug, Clone)]
#[allow(dead_code)]
pub struct EmbeddingModels;

#[allow(dead_code)]
impl EmbeddingModels {
    pub const ALL_MINILM_L6_V2: &'static str = "all-MiniLM-L6-v2";
    pub const ALL_MPNET_BASE_V2: &'static str = "all-mpnet-base-v2";
    pub const ALL_DISTILROBERTA_V1: &'static str = "all-distilroberta-v1";
    pub const PARAPHRASE_MINILM_L6_V2: &'static str = "paraphrase-MiniLM-L6-v2";
    pub const PARAPHRASE_MPNET_BASE_V2: &'static str = "paraphrase-mpnet-base-v2";

    pub fn get_dimension(model: &str) -> usize {
        match model {
            Self::ALL_MINILM_L6_V2 => 384,
            Self::ALL_MPNET_BASE_V2 => 768,
            Self::ALL_DISTILROBERTA_V1 => 768,
            Self::PARAPHRASE_MINILM_L6_V2 => 384,
            Self::PARAPHRASE_MPNET_BASE_V2 => 768,
            _ => 384,
        }
    }
}
