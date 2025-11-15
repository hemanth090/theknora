import axios, { AxiosInstance, AxiosError } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

// Request interceptor to handle multipart form data and add auth token
apiClient.interceptors.request.use(
  (config) => {
    // For FormData, let axios auto-detect Content-Type with boundary
    if (!(config.data instanceof FormData)) {
      // Only set Content-Type for non-FormData requests
      if (!config.headers["Content-Type"]) {
        config.headers["Content-Type"] = "application/json";
      }
    }

    // Add authentication token if available
    const authToken =
      process.env.NEXT_PUBLIC_AUTH_TOKEN || "dev-token-change-in-production";
    if (authToken) {
      config.headers["Authorization"] = `Bearer ${authToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor with better error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Preserve original error for caller to handle
    return Promise.reject(error);
  },
);

// ============ TYPES ============

export interface ProcessFileRequest {
  file_path: string;
  chunk_size?: number;
  chunk_overlap?: number;
}

export interface DocumentChunk {
  text: string;
  size: number;
  chunk_id: number;
}

export interface ProcessedDocument {
  file_path: string;
  file_name: string;
  file_type: string;
  text: string;
  chunks: DocumentChunk[];
  num_chunks: number;
  file_size: number;
}

export interface ProcessFileResponse {
  success: boolean;
  message: string;
  document?: ProcessedDocument;
}

export interface SearchRequest {
  query: string;
  k?: number;
  score_threshold?: number;
}

export interface SearchResult {
  file_path: string;
  file_name: string;
  file_type: string;
  chunk_id: number;
  chunk_size: number;
  text: string;
  similarity_score: number;
}

export interface SearchResponse {
  results: SearchResult[];
  query: string;
  count: number;
}

export interface AnswerRequest {
  query: string;
  retrieved_chunks: SearchResult[];
  max_tokens?: number;
  temperature?: number;
}

export interface AnswerResponse {
  answer: string;
  sources: Record<string, any>[];
  context_used: string;
  num_sources: number;
  llm_type: string;
  model_used: string;
}

export interface VectorStoreStats {
  total_vectors: number;
  total_documents: number;
  embedding_model: string;
  dimension: number;
  store_path: string;
  documents: string[];
  storage_size_mb: number;
}

export interface LLMModel {
  id: string;
  name: string;
  max_tokens: number;
}

export interface ModelInfo {
  model_id: string;
  name: string;
  max_tokens: number;
  context_window: number;
  provider: string;
}

export interface SupportedFormat {
  extension: string;
  name: string;
  max_size_mb: number;
}

export interface SupportedFormatsResponse {
  formats: SupportedFormat[];
}

export interface StorageInfo {
  total_files: number;
  total_size_bytes: number;
  total_size_mb: string;
  files: Array<{
    name: string;
    size_bytes: number;
    size_mb: string;
  }>;
}

export interface CleanupResponse {
  freed_space_mb: number;
  deleted_files: number;
}

// ============ ERROR HANDLING ============

export class APIError extends Error {
  constructor(
    public statusCode: number | undefined,
    public originalError: AxiosError | Error,
    message?: string,
  ) {
    super(message || originalError.message);
    this.name = "APIError";
  }
}

// Extract meaningful error message from various error formats
export const getErrorMessage = (error: any): string => {
  if (error instanceof APIError) {
    return error.message;
  }

  if (axios.isAxiosError(error)) {
    // Handle timeout
    if (error.code === "ECONNABORTED") {
      return "Request timeout - backend is not responding";
    }

    // Handle network errors
    if (error.code === "ERR_NETWORK" || !error.response) {
      return "Network error - check your connection and backend status";
    }

    // Handle server errors with message
    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    // Handle various HTTP status codes
    switch (error.response?.status) {
      case 400:
        return "Invalid request - check your input";
      case 404:
        return "Resource not found";
      case 408:
        return "Request timeout";
      case 413:
        return "File too large";
      case 429:
        return "Too many requests - please wait";
      case 500:
        return "Server error - please try again later";
      case 503:
        return "Server is unavailable - please try again later";
      default:
        return error.response?.statusText || "Unknown error occurred";
    }
  }

  return error?.message || "Unknown error occurred";
};

// ============ RETRY LOGIC ============

interface RetryConfig {
  maxRetries: number;
  delayMs: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 2,
  delayMs: 500,
  backoffMultiplier: 1.5,
};

const shouldRetry = (
  error: any,
  attemptNumber: number,
  maxRetries: number,
): boolean => {
  // Don't retry if we've hit the max
  if (attemptNumber >= maxRetries) {
    return false;
  }

  if (!axios.isAxiosError(error)) {
    return false;
  }

  // Retry on network errors and timeouts
  if (error.code === "ECONNABORTED" || error.code === "ERR_NETWORK") {
    return true;
  }

  // Retry on 5xx errors (server errors)
  if (error.response?.status && error.response.status >= 500) {
    return true;
  }

  // Retry on 408 (Request Timeout) and 429 (Too Many Requests)
  if (error.response?.status === 408 || error.response?.status === 429) {
    return true;
  }

  return false;
};

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ============ API METHODS ============

export const apiService = {
  // Health
  checkHealth: () => apiClient.get("/health"),

  // Documents
  processFile: (data: ProcessFileRequest) =>
    apiClient.post<ProcessFileResponse>("/documents/process", data),
  getFileStats: (filePath: string) =>
    apiClient.get("/documents/stats", { params: { file_path: filePath } }),

  // File Upload
  uploadFile: (formData: FormData) =>
    apiClient.post<ProcessFileResponse>("/documents/upload", formData),
  getSupportedFormats: () =>
    apiClient.get<SupportedFormatsResponse>("/documents/formats"),

  // Search with retry logic
  search: async (data: SearchRequest) => {
    let lastError: any;
    const retryConfig = DEFAULT_RETRY_CONFIG;

    for (let attempt = 0; attempt < retryConfig.maxRetries; attempt++) {
      try {
        return await apiClient.post<SearchResponse>("/search", data);
      } catch (error) {
        lastError = error;

        if (shouldRetry(error, attempt, retryConfig.maxRetries)) {
          const waitTime =
            retryConfig.delayMs *
            Math.pow(retryConfig.backoffMultiplier, attempt);
          await delay(waitTime);
          continue;
        }

        throw error;
      }
    }

    throw lastError;
  },

  getVectorStoreStats: () => apiClient.get<VectorStoreStats>("/search/stats"),
  addDocuments: (documents: ProcessedDocument[]) =>
    apiClient.post<{ success: boolean; message: string }>(
      "/search/add",
      documents,
    ),
  addDocumentsToVectorStore: (documents: ProcessedDocument[]) =>
    apiClient.post("/search/add", documents),
  deleteDocument: (filePath: string) =>
    apiClient.delete("/search/delete", { params: { file_path: filePath } }),
  clearStore: () => apiClient.delete("/search/clear"),

  // LLM
  generateAnswer: async (data: AnswerRequest) => {
    let lastError: any;
    const retryConfig = DEFAULT_RETRY_CONFIG;

    for (let attempt = 0; attempt < retryConfig.maxRetries; attempt++) {
      try {
        return await apiClient.post<AnswerResponse>("/llm/answer", data);
      } catch (error) {
        lastError = error;

        if (shouldRetry(error, attempt, retryConfig.maxRetries)) {
          const waitTime =
            retryConfig.delayMs *
            Math.pow(retryConfig.backoffMultiplier, attempt);
          await delay(waitTime);
          continue;
        }

        throw error;
      }
    }

    throw lastError;
  },

  getModelInfo: () => apiClient.get<ModelInfo>("/llm/model-info"),
  getSupportedModels: () => apiClient.get<LLMModel[]>("/llm/models"),

  // Storage Management
  getStorageInfo: () => apiClient.get<StorageInfo>("/search/storage"),
  cleanupOldFiles: () =>
    apiClient.post<CleanupResponse>("/search/storage/cleanup", {}),
};

export default apiClient;
