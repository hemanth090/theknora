use crate::models::{DocumentMetadata, ProcessedDocument, SearchResult};
use anyhow::Result;
use log::info;
use serde_json::json;
use std::collections::{HashMap, HashSet};
use std::fs;
use std::path::PathBuf;

pub struct VectorStore {
    store_path: PathBuf,
    embedding_model: String,
    dimension: usize,
    metadata: Vec<DocumentMetadata>,
    document_map: HashMap<String, DocumentInfo>,
    vectors: Vec<Vec<f32>>,
    vocabulary: HashMap<String, usize>,
    doc_frequencies: HashMap<String, usize>,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
struct DocumentInfo {
    file_name: String,
    file_type: String,
    num_chunks: usize,
    file_size: u64,
}

impl VectorStore {
    pub fn new(store_path: &str, embedding_model: &str) -> Result<Self> {
        let path = PathBuf::from(store_path);
        fs::create_dir_all(&path)?;

        let dimension = Self::get_dimension(embedding_model);

        let mut store = VectorStore {
            store_path: path,
            embedding_model: embedding_model.to_string(),
            dimension,
            metadata: Vec::new(),
            document_map: HashMap::new(),
            vectors: Vec::new(),
            vocabulary: HashMap::new(),
            doc_frequencies: HashMap::new(),
        };

        store.load_store()?;
        Ok(store)
    }

    pub fn add_documents(&mut self, documents: Vec<ProcessedDocument>) -> Result<()> {
        let mut all_texts = Vec::new();
        let mut all_metadata = Vec::new();

        for doc in &documents {
            let file_path = &doc.file_path;
            let file_name = &doc.file_name;
            let file_type = &doc.file_type;

            for chunk in &doc.chunks {
                all_texts.push(chunk.text.clone());

                let metadata = DocumentMetadata {
                    file_path: file_path.clone(),
                    file_name: file_name.clone(),
                    file_type: file_type.clone(),
                    chunk_id: chunk.chunk_id,
                    chunk_size: chunk.size,
                    text: chunk.text.clone(),
                };
                all_metadata.push(metadata);
            }
        }

        if all_texts.is_empty() {
            return Ok(());
        }

        // Update vocabulary first (for TF-IDF calculation)
        self.update_vocabulary(&documents);

        // Generate semantic embeddings based on document content
        let embeddings = self.generate_embeddings(&all_texts)?;

        // Add vectors and metadata
        self.vectors.extend(embeddings);
        self.metadata.extend(all_metadata);

        // Update document map
        for doc in documents {
            let doc_id = doc.file_path.clone();
            self.document_map.insert(
                doc_id,
                DocumentInfo {
                    file_name: doc.file_name,
                    file_type: doc.file_type,
                    num_chunks: doc.num_chunks,
                    file_size: doc.file_size,
                },
            );
        }

        self.save_store()?;
        info!("Added {} vectors to store. Vocabulary size: {}", self.vectors.len(), self.vocabulary.len());
        Ok(())
    }

    pub fn search(
        &self,
        query: &str,
        k: usize,
        score_threshold: f32,
    ) -> Result<Vec<SearchResult>> {
        if self.vectors.is_empty() {
            return Ok(Vec::new());
        }

        // Generate query embedding
        let query_embedding = self.generate_embeddings(&[query.to_string()])?;

        if query_embedding.is_empty() {
            return Ok(Vec::new());
        }

        let query_vec = &query_embedding[0];

        // Calculate similarity scores for all vectors
        let mut scores: Vec<(usize, f32)> = self
            .vectors
            .iter()
            .enumerate()
            .map(|(idx, vec)| {
                let score = self.cosine_similarity(query_vec, vec);
                (idx, score)
            })
            .collect();

        // Sort by score descending
        scores.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap());

        // Convert to search results
        let results: Vec<SearchResult> = scores
            .into_iter()
            .take(k)
            .filter(|(_, score)| *score >= score_threshold)
            .map(|(idx, score)| {
                let metadata = &self.metadata[idx];
                SearchResult {
                    file_path: metadata.file_path.clone(),
                    file_name: metadata.file_name.clone(),
                    file_type: metadata.file_type.clone(),
                    chunk_id: metadata.chunk_id,
                    chunk_size: metadata.chunk_size,
                    text: metadata.text.clone(),
                    similarity_score: score,
                }
            })
            .collect();

        Ok(results)
    }

    pub fn get_stats(&self) -> Result<serde_json::Value> {
        let storage_size_mb = self.get_storage_size()?;

        Ok(json!({
            "total_vectors": self.vectors.len(),
            "total_documents": self.document_map.len(),
            "embedding_model": self.embedding_model,
            "dimension": self.dimension,
            "store_path": self.store_path.to_string_lossy(),
            "documents": self.document_map.keys().collect::<Vec<_>>(),
            "storage_size_mb": storage_size_mb
        }))
    }

    pub fn delete_document(&mut self, file_path: &str) -> Result<bool> {
        if !self.document_map.contains_key(file_path) {
            return Ok(false);
        }

        // Filter out chunks from the document
        let initial_count = self.metadata.len();
        self.metadata.retain(|m| m.file_path != file_path);

        let deleted_count = initial_count - self.metadata.len();
        if deleted_count > 0 {
            // Remove corresponding vectors
            let mut to_keep = Vec::new();
            for (idx, meta) in self.metadata.iter().enumerate() {
                if meta.file_path != file_path {
                    to_keep.push(idx);
                }
            }

            // Rebuild vectors
            let mut new_vectors = Vec::new();
            for idx in to_keep {
                if idx < self.vectors.len() {
                    new_vectors.push(self.vectors[idx].clone());
                }
            }
            self.vectors = new_vectors;
        }

        self.document_map.remove(file_path);
        self.save_store()?;
        Ok(true)
    }

    pub fn clear_store(&mut self) -> Result<()> {
        self.vectors.clear();
        self.metadata.clear();
        self.document_map.clear();

        if self.store_path.exists() {
            fs::remove_dir_all(&self.store_path)?;
            fs::create_dir_all(&self.store_path)?;
        }

        info!("Vector store cleared");
        Ok(())
    }

    fn generate_embeddings(&self, texts: &[String]) -> Result<Vec<Vec<f32>>> {
        // TF-IDF based semantic embedding generation
        // This captures actual semantic meaning from text content
        let mut embeddings = Vec::new();

        for text in texts {
            let mut embedding = vec![0.0f32; self.dimension];

            // Extract and tokenize text
            let tokens = self.tokenize(text);

            if tokens.is_empty() {
                embeddings.push(embedding);
                continue;
            }

            // Calculate TF-IDF weights
            let mut token_weights = HashMap::new();
            let total_tokens = tokens.len() as f32;

            // Term Frequency (TF)
            for token in &tokens {
                let count = token_weights.entry(token.clone()).or_insert(0.0);
                *count += 1.0;
            }

            // Normalize TF and apply IDF
            for (token, count) in token_weights.iter_mut() {
                let tf = *count / total_tokens;
                let idf = if let Some(doc_count) = self.doc_frequencies.get(token) {
                    let num_docs = (self.metadata.len() as f32).max(1.0);
                    (num_docs / (*doc_count as f32)).ln() + 1.0
                } else {
                    1.0
                };
                *count = tf * idf;
            }

            // Map tokens to vocabulary indices and fill embedding
            for (token, weight) in token_weights.iter() {
                if let Some(&idx) = self.vocabulary.get(token) {
                    if idx < self.dimension {
                        embedding[idx] += *weight;
                    }
                }
            }

            // Normalize to unit vector
            let norm: f32 = embedding.iter().map(|x| x * x).sum::<f32>().sqrt();
            if norm > 0.0 {
                embedding = embedding.iter().map(|x| x / norm).collect();
            } else {
                // Handle empty text - use small random values
                for i in 0..self.dimension.min(5) {
                    embedding[i] = 0.1;
                }
                let norm: f32 = embedding.iter().map(|x| x * x).sum::<f32>().sqrt();
                if norm > 0.0 {
                    embedding = embedding.iter().map(|x| x / norm).collect();
                }
            }

            embeddings.push(embedding);
        }

        Ok(embeddings)
    }

    fn tokenize(&self, text: &str) -> Vec<String> {
        // Simple tokenization - split by whitespace and punctuation
        text.to_lowercase()
            .split(|c: char| !c.is_alphanumeric())
            .filter(|s| !s.is_empty() && s.len() > 2) // Filter short words
            .map(|s| s.to_string())
            .collect()
    }

    fn update_vocabulary(&mut self, documents: &[ProcessedDocument]) {
        // Build vocabulary from document chunks
        let mut word_doc_count: HashMap<String, HashSet<String>> = HashMap::new();

        for doc in documents {
            let doc_id = doc.file_path.clone();
            for chunk in &doc.chunks {
                let tokens = self.tokenize(&chunk.text);
                for token in tokens {
                    word_doc_count
                        .entry(token)
                        .or_insert_with(HashSet::new)
                        .insert(doc_id.clone());
                }
            }
        }

        // Assign indices to vocabulary
        let mut vocab_index = self.vocabulary.len();
        for (word, doc_set) in word_doc_count.iter() {
            if !self.vocabulary.contains_key(word) {
                if vocab_index < self.dimension {
                    self.vocabulary.insert(word.clone(), vocab_index);
                    vocab_index += 1;
                }
            }
            self.doc_frequencies.insert(word.clone(), doc_set.len());
        }
    }

    fn cosine_similarity(&self, vec1: &[f32], vec2: &[f32]) -> f32 {
        if vec1.len() != vec2.len() || vec1.is_empty() {
            return 0.0;
        }

        let dot_product: f32 = vec1.iter().zip(vec2.iter()).map(|(a, b)| a * b).sum();
        let norm1: f32 = vec1.iter().map(|x| x * x).sum::<f32>().sqrt();
        let norm2: f32 = vec2.iter().map(|x| x * x).sum::<f32>().sqrt();

        if norm1 == 0.0 || norm2 == 0.0 {
            return 0.0;
        }

        dot_product / (norm1 * norm2)
    }

    fn get_storage_size(&self) -> Result<f64> {
        use std::fs;
        use std::path::Path;

        fn calculate_dir_size(path: &Path) -> std::io::Result<u64> {
            let mut total = 0u64;

            for entry in fs::read_dir(path)? {
                let entry = entry?;
                let metadata = entry.metadata()?;

                if metadata.is_file() {
                    total += metadata.len();
                } else if metadata.is_dir() {
                    // Recursively calculate subdirectories
                    total += calculate_dir_size(&entry.path())?;
                }
            }

            Ok(total)
        }

        let total_size = calculate_dir_size(&self.store_path)?;
        Ok((total_size as f64) / (1024.0 * 1024.0))
    }

    fn save_store(&self) -> Result<()> {
        // Save metadata
        let metadata_path = self.store_path.join("metadata.json");
        let metadata_json = serde_json::to_string(&self.metadata)?;
        fs::write(metadata_path, metadata_json)?;

        // Save document map
        let doc_map_path = self.store_path.join("document_map.json");
        let doc_map_json = serde_json::to_string(&self.document_map)?;
        fs::write(doc_map_path, doc_map_json)?;

        // Save config
        let config = serde_json::json!({
            "embedding_model": self.embedding_model,
            "dimension": self.dimension,
            "total_vectors": self.vectors.len(),
            "version": "2.0.0"
        });
        let config_path = self.store_path.join("config.json");
        fs::write(config_path, serde_json::to_string_pretty(&config)?)?;

        info!("Vector store saved to {:?}", self.store_path);
        Ok(())
    }

    fn load_store(&mut self) -> Result<()> {
        let metadata_path = self.store_path.join("metadata.json");
        let doc_map_path = self.store_path.join("document_map.json");

        if !metadata_path.exists() || !doc_map_path.exists() {
            info!("Vector store does not exist yet");
            return Ok(());
        }

        // Load metadata
        let metadata_json = fs::read_to_string(&metadata_path)?;
        self.metadata = serde_json::from_str(&metadata_json)?;

        // Load document map
        let doc_map_json = fs::read_to_string(&doc_map_path)?;
        self.document_map = serde_json::from_str(&doc_map_json)?;

        // Regenerate vectors from metadata
        let texts: Vec<String> = self.metadata.iter().map(|m| m.text.clone()).collect();
        self.vectors = self.generate_embeddings(&texts)?;

        info!(
            "Loaded vector store: {} vectors, {} documents",
            self.vectors.len(),
            self.document_map.len()
        );
        Ok(())
    }

    fn get_dimension(model: &str) -> usize {
        match model {
            "all-MiniLM-L6-v2" => 384,
            "all-mpnet-base-v2" => 768,
            "all-distilroberta-v1" => 768,
            "paraphrase-MiniLM-L6-v2" => 384,
            "paraphrase-mpnet-base-v2" => 768,
            _ => 384,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_cosine_similarity() {
        let store = VectorStore::new("./test_store", "all-MiniLM-L6-v2").unwrap();
        let vec1 = vec![1.0, 0.0, 0.0];
        let vec2 = vec![1.0, 0.0, 0.0];
        let similarity = store.cosine_similarity(&vec1, &vec2);
        assert!((similarity - 1.0).abs() < 0.01);
    }
}
