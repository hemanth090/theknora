use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Represents a chunk of a document
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocumentChunk {
    pub text: String,
    pub size: usize,
    pub chunk_id: usize,
}

/// Represents a processed document with its metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcessedDocument {
    pub file_path: String,
    pub file_name: String,
    pub file_type: String,
    pub text: String,
    pub chunks: Vec<DocumentChunk>,
    pub num_chunks: usize,
    pub file_size: u64,
}

/// Represents a search result from the vector store
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResult {
    pub file_path: String,
    pub file_name: String,
    pub file_type: String,
    pub chunk_id: usize,
    pub chunk_size: usize,
    pub text: String,
    pub similarity_score: f32,
}

/// Represents a response from the LLM
#[derive(Debug, Clone, Serialize, Deserialize)]
#[allow(dead_code)]
pub struct LLMResponse {
    pub answer: String,
    pub sources: Vec<HashMap<String, serde_json::Value>>,
    pub context_used: String,
    pub num_sources: usize,
    pub llm_type: String,
    pub model_used: String,
}

/// Represents statistics from the vector store
#[derive(Debug, Clone, Serialize, Deserialize)]
#[allow(dead_code)]
pub struct VectorStoreStats {
    pub total_vectors: usize,
    pub total_documents: usize,
    pub embedding_model: String,
    pub dimension: usize,
    pub store_path: String,
    pub documents: Vec<String>,
    pub storage_size_mb: f64,
}

/// Request to process files
#[derive(Debug, Deserialize)]
pub struct ProcessFileRequest {
    pub file_path: String,
    #[allow(dead_code)]
    pub chunk_size: Option<usize>,
    #[allow(dead_code)]
    pub chunk_overlap: Option<usize>,
}

/// Response from processing files
#[derive(Debug, Serialize)]
pub struct ProcessFileResponse {
    pub success: bool,
    pub message: String,
    pub document: Option<ProcessedDocument>,
}

/// Request to search documents
#[derive(Debug, Deserialize)]
pub struct SearchRequest {
    pub query: String,
    pub k: Option<usize>,
    pub score_threshold: Option<f32>,
}

/// Response from search
#[derive(Debug, Serialize)]
pub struct SearchResponse {
    pub results: Vec<SearchResult>,
    pub query: String,
    pub count: usize,
}

/// Request to generate answer
#[derive(Debug, Deserialize)]
pub struct AnswerRequest {
    pub query: String,
    pub retrieved_chunks: Vec<SearchResult>,
    pub max_tokens: Option<usize>,
    pub temperature: Option<f32>,
}

/// Response from LLM
#[derive(Debug, Serialize)]
#[allow(dead_code)]
pub struct AnswerResponse {
    pub answer: String,
    pub sources: Vec<HashMap<String, serde_json::Value>>,
    pub context_used: String,
    pub num_sources: usize,
    pub llm_type: String,
    pub model_used: String,
}

/// Document metadata for storage
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocumentMetadata {
    pub file_path: String,
    pub file_name: String,
    pub file_type: String,
    pub chunk_id: usize,
    pub chunk_size: usize,
    pub text: String,
}

/// Cache statistics
#[derive(Debug, Serialize)]
#[allow(dead_code)]
pub struct CacheStats {
    pub size: usize,
    pub max_size: usize,
    pub hits: usize,
    pub misses: usize,
    pub hit_rate: String,
}

/// Supported file extensions
#[allow(dead_code)]
pub const SUPPORTED_EXTENSIONS: &[&str] = &[".pdf", ".txt", ".doc", ".docx", ".csv", ".xlsx", ".xls", ".md", ".pptx"];

/// LLM Models
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LLMModel {
    pub id: String,
    pub name: String,
    pub max_tokens: usize,
}

pub fn get_supported_models() -> Vec<LLMModel> {
    vec![
        LLMModel {
            id: "openai/gpt-oss-120b".to_string(),
            name: "OpenAI GPT-OSS 120B".to_string(),
            max_tokens: 8192,
        },
        LLMModel {
            id: "llama-3.1-70b-versatile".to_string(),
            name: "LLaMA 3.1 70B Versatile".to_string(),
            max_tokens: 8192,
        },
        LLMModel {
            id: "llama-3.1-8b-instant".to_string(),
            name: "LLaMA 3.1 8B Instant".to_string(),
            max_tokens: 8192,
        },
        LLMModel {
            id: "mixtral-8x7b-32768".to_string(),
            name: "Mixtral 8x7B".to_string(),
            max_tokens: 32768,
        },
        LLMModel {
            id: "gemma2-9b-it".to_string(),
            name: "Gemma2 9B IT".to_string(),
            max_tokens: 8192,
        },
    ]
}
