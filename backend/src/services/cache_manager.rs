use std::collections::HashMap;
use std::sync::Mutex;
use log::info;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[allow(dead_code)]
pub struct CacheStats {
    pub size: usize,
    pub max_size: usize,
    pub hits: usize,
    pub misses: usize,
    pub hit_rate: String,
}

#[allow(dead_code)]
pub struct EmbeddingCache {
    max_size: usize,
    cache: Mutex<HashMap<String, Vec<f32>>>,
    hits: Mutex<usize>,
    misses: Mutex<usize>,
}

impl EmbeddingCache {
    #[allow(dead_code)]
    pub fn new(max_size: usize) -> Self {
        EmbeddingCache {
            max_size,
            cache: Mutex::new(HashMap::new()),
            hits: Mutex::new(0),
            misses: Mutex::new(0),
        }
    }

    #[allow(dead_code)]
    fn get_key(text: &str) -> String {
        use sha2::{Sha256, Digest};
        use hex::encode;

        let mut hasher = Sha256::new();
        hasher.update(text);
        encode(hasher.finalize())
    }

    #[allow(dead_code)]
    pub fn get(&self, text: &str) -> Option<Vec<f32>> {
        let key = Self::get_key(text);
        let cache = self.cache.lock().unwrap();

        if let Some(embedding) = cache.get(&key) {
            let mut hits = self.hits.lock().unwrap();
            *hits += 1;
            info!("Cache hit for embedding (hits: {})", *hits);
            return Some(embedding.clone());
        }

        let mut misses = self.misses.lock().unwrap();
        *misses += 1;
        None
    }

    #[allow(dead_code)]
    pub fn put(&self, text: &str, embedding: Vec<f32>) {
        let key = Self::get_key(text);
        let mut cache = self.cache.lock().unwrap();

        if cache.len() >= self.max_size {
            if let Some(oldest_key) = cache.keys().next().cloned() {
                cache.remove(&oldest_key);
                info!("Evicted oldest embedding from cache");
            }
        }

        cache.insert(key, embedding);
    }

    #[allow(dead_code)]
    pub fn get_stats(&self) -> CacheStats {
        let cache = self.cache.lock().unwrap();
        let hits = *self.hits.lock().unwrap();
        let misses = *self.misses.lock().unwrap();
        let total = hits + misses;
        let hit_rate = if total > 0 {
            format!("{:.1}%", (hits as f64 / total as f64) * 100.0)
        } else {
            "0.0%".to_string()
        };

        CacheStats {
            size: cache.len(),
            max_size: self.max_size,
            hits,
            misses,
            hit_rate,
        }
    }

    #[allow(dead_code)]
    pub fn clear(&self) {
        let mut cache = self.cache.lock().unwrap();
        cache.clear();
        *self.hits.lock().unwrap() = 0;
        *self.misses.lock().unwrap() = 0;
        info!("Embedding cache cleared");
    }
}

#[allow(dead_code)]
pub struct QueryResponseCache {
    max_size: usize,
    cache: Mutex<HashMap<String, serde_json::Value>>,
    hits: Mutex<usize>,
    misses: Mutex<usize>,
}

impl QueryResponseCache {
    #[allow(dead_code)]
    pub fn new(max_size: usize) -> Self {
        QueryResponseCache {
            max_size,
            cache: Mutex::new(HashMap::new()),
            hits: Mutex::new(0),
            misses: Mutex::new(0),
        }
    }

    #[allow(dead_code)]
    fn get_key(query: &str, context_hash: &str) -> String {
        use sha2::{Sha256, Digest};
        use hex::encode;

        let combined = format!("{}_{}", query, context_hash);
        let mut hasher = Sha256::new();
        hasher.update(combined);
        encode(hasher.finalize())
    }

    #[allow(dead_code)]
    pub fn get(&self, query: &str, context_hash: &str) -> Option<serde_json::Value> {
        let key = Self::get_key(query, context_hash);
        let cache = self.cache.lock().unwrap();

        if let Some(response) = cache.get(&key) {
            let mut hits = self.hits.lock().unwrap();
            *hits += 1;
            info!("Cache hit for query response (hits: {})", *hits);
            return Some(response.clone());
        }

        let mut misses = self.misses.lock().unwrap();
        *misses += 1;
        None
    }

    #[allow(dead_code)]
    pub fn put(&self, query: &str, context_hash: &str, response: serde_json::Value) {
        let key = Self::get_key(query, context_hash);
        let mut cache = self.cache.lock().unwrap();

        if cache.len() >= self.max_size {
            if let Some(oldest_key) = cache.keys().next().cloned() {
                cache.remove(&oldest_key);
                info!("Evicted oldest response from cache");
            }
        }

        cache.insert(key, response);
    }

    #[allow(dead_code)]
    pub fn get_stats(&self) -> CacheStats {
        let cache = self.cache.lock().unwrap();
        let hits = *self.hits.lock().unwrap();
        let misses = *self.misses.lock().unwrap();
        let total = hits + misses;
        let hit_rate = if total > 0 {
            format!("{:.1}%", (hits as f64 / total as f64) * 100.0)
        } else {
            "0.0%".to_string()
        };

        CacheStats {
            size: cache.len(),
            max_size: self.max_size,
            hits,
            misses,
            hit_rate,
        }
    }

    #[allow(dead_code)]
    pub fn clear(&self) {
        let mut cache = self.cache.lock().unwrap();
        cache.clear();
        *self.hits.lock().unwrap() = 0;
        *self.misses.lock().unwrap() = 0;
        info!("Query response cache cleared");
    }
}
