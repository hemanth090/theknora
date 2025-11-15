import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { SearchResult, ProcessedDocument, VectorStoreStats } from "./api";

export interface AppState {
  // UI Navigation
  activeTab: "ingestion" | "query" | "analytics";
  setActiveTab: (tab: "ingestion" | "query" | "analytics") => void;

  // Error State
  error: string | null;
  setError: (error: string | null) => void;

  // Documents (Ingestion)
  documents: ProcessedDocument[];
  setDocuments: (docs: ProcessedDocument[]) => void;
  addDocument: (doc: ProcessedDocument) => void;
  removeDocument: (filePath: string) => void;

  // Search Results (Query - not persisted)
  searchResults: SearchResult[];
  setSearchResults: (results: SearchResult[]) => void;
  clearSearchResults: () => void;

  // Query & Answer (Query - not persisted)
  currentQuery: string;
  setCurrentQuery: (query: string) => void;
  currentAnswer: string | null;
  setCurrentAnswer: (answer: string | null) => void;
  clearQueryState: () => void;

  // Stats (Analytics)
  stats: VectorStoreStats | null;
  setStats: (stats: VectorStoreStats | null) => void;

  // Ingestion Parameters (persisted)
  chunkSize: number;
  setChunkSize: (size: number) => void;
  chunkOverlap: number;
  setChunkOverlap: (overlap: number) => void;

  // Search Parameters (persisted)
  searchK: number;
  setSearchK: (k: number) => void;
  scoreThreshold: number;
  setScoreThreshold: (threshold: number) => void;

  // LLM Parameters (persisted)
  temperature: number;
  setTemperature: (temp: number) => void;
  maxTokens: number;
  setMaxTokens: (tokens: number) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;

  // Backend Status
  backendConnected: boolean;
  setBackendConnected: (connected: boolean) => void;

  // In-flight request tracking
  isSearching: boolean;
  setIsSearching: (searching: boolean) => void;
  searchAbortSignal: AbortSignal | null;
  setSearchAbortSignal: (signal: AbortSignal | null) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // UI
      activeTab: "query",
      setActiveTab: (tab) => set({ activeTab: tab }),

      // Error
      error: null,
      setError: (error) => set({ error }),

      // Documents
      documents: [],
      setDocuments: (docs) => set({ documents: docs }),
      addDocument: (doc) =>
        set((state) => ({
          documents: [...state.documents, doc],
        })),
      removeDocument: (filePath) =>
        set((state) => ({
          documents: state.documents.filter((d) => d.file_path !== filePath),
        })),

      // Search Results (not persisted)
      searchResults: [],
      setSearchResults: (results) => set({ searchResults: results }),
      clearSearchResults: () => set({ searchResults: [] }),

      // Query & Answer (not persisted)
      currentQuery: "",
      setCurrentQuery: (query) => set({ currentQuery: query }),
      currentAnswer: null,
      setCurrentAnswer: (answer) => set({ currentAnswer: answer }),
      clearQueryState: () =>
        set({
          currentQuery: "",
          currentAnswer: null,
          searchResults: [],
        }),

      // Stats (not persisted)
      stats: null,
      setStats: (stats) => set({ stats }),

      // Ingestion Parameters
      chunkSize: 1000,
      setChunkSize: (size) => set({ chunkSize: size }),
      chunkOverlap: 200,
      setChunkOverlap: (overlap) => set({ chunkOverlap: overlap }),

      // Search Parameters
      searchK: 5,
      setSearchK: (k) => set({ searchK: k }),
      scoreThreshold: 0.0,
      setScoreThreshold: (threshold) => set({ scoreThreshold: threshold }),

      // LLM Parameters
      temperature: 0.7,
      setTemperature: (temp) => set({ temperature: temp }),
      maxTokens: 2048,
      setMaxTokens: (tokens) => set({ maxTokens: tokens }),
      selectedModel: "mixtral-8x7b-32768",
      setSelectedModel: (model) => set({ selectedModel: model }),

      // Backend Status
      backendConnected: false,
      setBackendConnected: (connected) => set({ backendConnected: connected }),

      // In-flight request tracking
      isSearching: false,
      setIsSearching: (searching) => set({ isSearching: searching }),
      searchAbortSignal: null,
      setSearchAbortSignal: (signal) => set({ searchAbortSignal: signal }),
    }),
    {
      name: "knora-store",
      partialize: (state) => ({
        activeTab: state.activeTab,
        chunkSize: state.chunkSize,
        chunkOverlap: state.chunkOverlap,
        searchK: state.searchK,
        scoreThreshold: state.scoreThreshold,
        temperature: state.temperature,
        maxTokens: state.maxTokens,
        selectedModel: state.selectedModel,
      }),
    },
  ),
);
