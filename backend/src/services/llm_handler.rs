use anyhow::{anyhow, Result};
use serde_json::json;
use std::collections::HashMap;

pub struct GroqLLM {
    api_key: String,
    model: String,
    client: reqwest::Client,
}

impl GroqLLM {
    pub fn new(api_key: String, model: String) -> Result<Self> {
        if api_key.is_empty() {
            return Err(anyhow!(
                "Groq API key required. Set GROQ_API_KEY environment variable."
            ));
        }

        let supported_models = vec![
            "openai/gpt-oss-120b",
            "llama-3.1-70b-versatile",
            "llama-3.1-8b-instant",
            "mixtral-8x7b-32768",
            "gemma2-9b-it",
        ];

        let selected_model = if supported_models.contains(&model.as_str()) {
            model
        } else {
            "openai/gpt-oss-120b".to_string()
        };

        Ok(GroqLLM {
            api_key,
            model: selected_model,
            client: reqwest::Client::new(),
        })
    }

    pub async fn generate_response(
        &self,
        query: &str,
        context: &str,
        max_tokens: usize,
        temperature: f32,
    ) -> Result<String> {
        let system_prompt = "You are an expert AI assistant specializing in document analysis and knowledge extraction.\n\nYour responsibilities:\n- Provide accurate, well-structured answers based solely on the provided context\n- Cite specific information from the context when possible\n- Clearly state when information is insufficient to answer the question\n- Maintain professional, concise communication\n- Focus on factual accuracy over speculation";

        let user_prompt = format!(
            "Context Information:\n{}\n\nUser Question: {}\n\nPlease provide a comprehensive answer based on the context above. If the context doesn't contain sufficient information, clearly state this limitation.",
            context, query
        );

        let body = json!({
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": temperature,
            "max_completion_tokens": max_tokens,
            "top_p": 1.0,
            "stream": false
        });

        let response = self
            .client
            .post("https://api.groq.com/openai/v1/chat/completions")
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("Content-Type", "application/json")
            .json(&body)
            .send()
            .await?;

        if !response.status().is_success() {
            let error_text = response.text().await?;
            return Err(anyhow!("Groq API error: {}", error_text));
        }

        let result: serde_json::Value = response.json().await?;

        let answer = result["choices"][0]["message"]["content"]
            .as_str()
            .ok_or_else(|| anyhow!("No response from LLM"))?
            .trim()
            .to_string();

        Ok(answer)
    }

    pub fn get_model_info(&self) -> serde_json::Value {
        json!({
            "provider": "groq",
            "model": self.model,
            "supports_streaming": true,
            "max_tokens": 8192
        })
    }
}

pub struct LLMHandler {
    llm: GroqLLM,
    response_cache: std::sync::Arc<std::sync::Mutex<HashMap<String, String>>>,
}

impl LLMHandler {
    pub fn new(api_key: String, model: String) -> Result<Self> {
        let llm = GroqLLM::new(api_key, model)?;

        Ok(LLMHandler {
            llm,
            response_cache: std::sync::Arc::new(std::sync::Mutex::new(HashMap::new())),
        })
    }

    pub async fn generate_answer(
        &self,
        query: &str,
        retrieved_chunks: &[crate::models::SearchResult],
        max_tokens: usize,
        temperature: f32,
    ) -> Result<serde_json::Value> {
        if retrieved_chunks.is_empty() {
            return Ok(json!({
                "answer": "I couldn't find any relevant information in the knowledge base to answer your question.",
                "sources": [],
                "context_used": "",
                "num_sources": 0,
                "llm_type": "groq",
                "model_used": self.llm.model
            }));
        }

        // Prepare context from top chunks
        let mut context_parts = Vec::new();
        let mut sources = Vec::new();

        for (i, chunk) in retrieved_chunks.iter().take(5).enumerate() {
            context_parts.push(format!("[Source {}] {}", i + 1, chunk.text));
            sources.push(json!({
                "file_name": chunk.file_name,
                "file_path": chunk.file_path,
                "similarity_score": chunk.similarity_score,
                "chunk_id": chunk.chunk_id
            }));
        }

        let context = context_parts.join("\n\n");

        // Check cache
        let cache_key = format!("{}_{:x}", query, calculate_hash(&context));
        {
            let cache = self.response_cache.lock().unwrap();
            if let Some(cached_answer) = cache.get(&cache_key) {
                return Ok(json!({
                    "answer": cached_answer,
                    "sources": sources,
                    "context_used": context,
                    "num_sources": sources.len(),
                    "llm_type": "groq",
                    "model_used": self.llm.model
                }));
            }
        }

        // Generate answer
        let answer = self
            .llm
            .generate_response(query, &context, max_tokens, temperature)
            .await?;

        // Cache result
        {
            let mut cache = self.response_cache.lock().unwrap();
            cache.insert(cache_key, answer.clone());
        }

        Ok(json!({
            "answer": answer,
            "sources": sources,
            "context_used": context,
            "num_sources": sources.len(),
            "llm_type": "groq",
            "model_used": self.llm.model
        }))
    }

    pub fn get_model_info(&self) -> serde_json::Value {
        self.llm.get_model_info()
    }
}

fn calculate_hash(input: &str) -> u64 {
    use std::collections::hash_map::DefaultHasher;
    use std::hash::{Hash, Hasher};

    let mut hasher = DefaultHasher::new();
    input.hash(&mut hasher);
    hasher.finish()
}
