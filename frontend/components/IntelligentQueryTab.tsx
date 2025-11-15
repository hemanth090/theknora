"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import { apiService, SearchResult, LLMModel, getErrorMessage } from "@/lib/api";
import { useStore } from "@/lib/store";
import { Send, Loader, Copy, Volume2, Settings2, Cpu, X } from "lucide-react";
import ReactMarkdown from "react-markdown";

// Minimal, performant text cleaning
const cleanText = (text: string): string => {
  if (!text) return "";

  let cleaned = text
    .replace(/\[\d+\]/g, "")
    .replace(/\(Source:\s*\d+\)/gi, "")
    .replace(/Reference:\s*\d+/gi, "");

  cleaned = cleaned
    .split("\n\n")
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
    .join("\n\n");

  return cleaned;
};

const formatSearchResult = (text: string): string => {
  if (!text) return "";
  return text
    .replace(/\[\d+\]/g, "")
    .replace(/\(Source:\s*\d+\)/gi, "")
    .substring(0, 500);
};

export default function IntelligentQueryTab() {
  const {
    searchResults,
    setSearchResults,
    clearSearchResults,
    currentQuery,
    setCurrentQuery,
    currentAnswer,
    setCurrentAnswer,
    clearQueryState,
    searchK,
    setSearchK,
    scoreThreshold,
    setScoreThreshold,
    temperature,
    setTemperature,
    maxTokens,
    setMaxTokens,
    selectedModel,
    setSelectedModel,
    isSearching,
    setIsSearching,
  } = useStore();

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [answerSources, setAnswerSources] = useState<string[]>([]);
  const [availableModels, setAvailableModels] = useState<LLMModel[]>([]);
  const [modelInfoLoading, setModelInfoLoading] = useState(false);
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load models once on mount
  useEffect(() => {
    let isMounted = true;

    const fetchModels = async () => {
      setModelInfoLoading(true);
      try {
        const response = await apiService.getSupportedModels();
        if (isMounted && response.data && Array.isArray(response.data)) {
          setAvailableModels(response.data);
          if (response.data.length > 0 && !selectedModel) {
            setSelectedModel(response.data[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch models:", err);
        if (isMounted) {
          setAvailableModels([]);
        }
      } finally {
        if (isMounted) {
          setModelInfoLoading(false);
        }
      }
    };

    fetchModels();

    return () => {
      isMounted = false;
    };
  }, []);

  // Memoize cleaned answer
  const cleanedAnswer = useMemo(() => {
    return currentAnswer ? cleanText(currentAnswer) : "";
  }, [currentAnswer]);

  // Cancel search function
  const handleCancelSearch = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsSearching(false);
      toast.success("Search cancelled");
    }
  }, [abortController, setIsSearching]);

  // Handle search and answer generation
  const handleSearch = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!currentQuery.trim()) {
        toast.error("Please enter a query");
        return;
      }

      // Clear previous results
      setError(null);
      setAnswerSources([]);
      clearSearchResults();

      const controller = new AbortController();
      setAbortController(controller);
      setIsSearching(true);

      try {
        // Search for relevant documents
        const searchResponse = await apiService.search({
          query: currentQuery,
          k: searchK,
          score_threshold: scoreThreshold,
        });

        if (controller.signal.aborted) {
          return;
        }

        const results = searchResponse.data.results || [];

        if (results.length === 0) {
          setError("No relevant documents found for this query");
          setCurrentAnswer("");
          setSearchResults([]);
          setIsSearching(false);
          return;
        }

        setSearchResults(results);

        // Generate answer from search results
        try {
          const answerResponse = await apiService.generateAnswer({
            query: currentQuery,
            retrieved_chunks: results,
            max_tokens: maxTokens,
            temperature,
          });

          if (controller.signal.aborted) {
            return;
          }

          if (answerResponse.data.answer) {
            setCurrentAnswer(answerResponse.data.answer);

            // Extract source file names
            const sourceDocs = answerResponse.data.sources
              ? Array.isArray(answerResponse.data.sources)
                ? answerResponse.data.sources
                    .map((s: any) =>
                      typeof s === "string" ? s : s.file_name || s.source || "",
                    )
                    .filter(Boolean)
                : []
              : [];

            setAnswerSources(sourceDocs);
            setError(null);
            toast.success("Answer generated successfully");
          } else {
            setError("Failed to generate answer - empty response");
            setCurrentAnswer("");
          }
        } catch (answerErr: any) {
          const errorMsg = getErrorMessage(answerErr);
          setError(`Failed to generate answer: ${errorMsg}`);
          setCurrentAnswer("");
          console.error("Answer generation error:", answerErr);
        }
      } catch (searchErr: any) {
        if (controller.signal.aborted) {
          return;
        }

        const errorMsg = getErrorMessage(searchErr);
        setError(`Search failed: ${errorMsg}`);
        setCurrentAnswer("");
        setSearchResults([]);
        console.error("Search error:", searchErr);
      } finally {
        if (!controller.signal.aborted) {
          setAbortController(null);
          setIsSearching(false);
        }
      }
    },
    [
      currentQuery,
      searchK,
      scoreThreshold,
      maxTokens,
      temperature,
      setSearchResults,
      clearSearchResults,
      setCurrentAnswer,
      setIsSearching,
    ],
  );

  // Copy answer to clipboard
  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(cleanedAnswer).then(() => {
      toast.success("Copied to clipboard");
    });
  }, [cleanedAnswer]);

  // Text-to-speech functionality
  const speakText = useCallback(() => {
    if (!window.speechSynthesis) {
      toast.error("Speech synthesis not supported in your browser");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanedAnswer);
    utterance.rate = 1;
    utterance.onend = () => {
      toast.success("Finished reading");
    };
    utterance.onerror = () => {
      toast.error("Error reading text");
    };
    window.speechSynthesis.speak(utterance);
  }, [cleanedAnswer]);

  // Clear all results
  const handleClear = useCallback(() => {
    clearQueryState();
    setAnswerSources([]);
    setError(null);
  }, [clearQueryState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortController) {
        abortController.abort();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [abortController]);

  return (
    <div className="space-y-24px animate-fade-in">
      {/* Query Form */}
      <div className="animate-slide-up">
        <div className="card bg-neutral-0 border border-neutral-200 rounded-medium p-32px">
          <form onSubmit={handleSearch} className="space-y-24px">
            <div>
              <label
                htmlFor="query-input"
                className="block text-sm font-medium text-neutral-700 mb-8px"
              >
                Your Question{" "}
                <span className="text-semantic-danger" aria-label="required">
                  *
                </span>
              </label>
              <textarea
                id="query-input"
                value={currentQuery}
                onChange={(e) => setCurrentQuery(e.target.value)}
                placeholder="Ask a question about your documents..."
                disabled={isSearching}
                rows={3}
                className="w-full px-12px py-8px bg-neutral-0 border border-neutral-300 rounded-subtle focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-muted disabled:opacity-50 disabled:cursor-not-allowed text-neutral-900 placeholder-neutral-400 transition-all resize-none"
                aria-label="Query input"
              />
            </div>

            {/* Basic Search Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-24px">
              <div>
                <label
                  htmlFor="search-k"
                  className="block text-sm font-medium text-neutral-700 mb-8px"
                >
                  Results (k):{" "}
                  <span className="text-black font-semibold">{searchK}</span>
                </label>
                <input
                  id="search-k"
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  value={searchK}
                  onChange={(e) => setSearchK(Number(e.target.value))}
                  disabled={isSearching}
                  className="w-full h-2 bg-neutral-200 rounded-full appearance-none cursor-pointer disabled:opacity-50 accent-accent-primary"
                  aria-label="Number of search results"
                />
                <p className="text-xs text-neutral-500 mt-6px">
                  Number of results to retrieve
                </p>
              </div>

              <div>
                <label
                  htmlFor="score-threshold"
                  className="block text-sm font-medium text-neutral-700 mb-8px"
                >
                  Threshold:{" "}
                  <span className="text-black font-semibold">
                    {scoreThreshold.toFixed(2)}
                  </span>
                </label>
                <input
                  id="score-threshold"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={scoreThreshold}
                  onChange={(e) => setScoreThreshold(Number(e.target.value))}
                  disabled={isSearching}
                  className="w-full h-2 bg-neutral-200 rounded-full appearance-none cursor-pointer disabled:opacity-50 accent-accent-primary"
                  aria-label="Similarity threshold"
                />
                <p className="text-xs text-neutral-500 mt-6px">
                  Minimum similarity score
                </p>
              </div>
            </div>

            {/* Advanced Settings Toggle */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-8px text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
              aria-expanded={showAdvanced}
            >
              <Settings2 size={16} />
              <span>{showAdvanced ? "Hide" : "Show"} Advanced Settings</span>
            </button>

            {/* Advanced Settings */}
            {showAdvanced && (
              <div className="space-y-24px pt-16px border-t border-neutral-200 animate-slide-down">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-24px">
                  <div>
                    <label
                      htmlFor="temperature"
                      className="block text-sm font-medium text-neutral-700 mb-8px"
                    >
                      Temperature:{" "}
                      <span className="text-black font-semibold">
                        {temperature.toFixed(2)}
                      </span>
                    </label>
                    <input
                      id="temperature"
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(Number(e.target.value))}
                      disabled={isSearching}
                      className="w-full h-2 bg-neutral-200 rounded-full appearance-none cursor-pointer disabled:opacity-50 accent-accent-primary"
                      aria-label="Temperature setting"
                    />
                    <p className="text-xs text-neutral-500 mt-6px">
                      Higher = more creative, Lower = more focused
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="max-tokens"
                      className="block text-sm font-medium text-neutral-700 mb-8px"
                    >
                      Max Tokens:{" "}
                      <span className="text-black font-semibold">
                        {maxTokens}
                      </span>
                    </label>
                    <input
                      id="max-tokens"
                      type="range"
                      min="256"
                      max="8192"
                      step="256"
                      value={maxTokens}
                      onChange={(e) => setMaxTokens(Number(e.target.value))}
                      disabled={isSearching}
                      className="w-full h-2 bg-neutral-200 rounded-full appearance-none cursor-pointer disabled:opacity-50 accent-accent-primary"
                      aria-label="Maximum token limit"
                    />
                    <p className="text-xs text-neutral-500 mt-6px">
                      Maximum response length
                    </p>
                  </div>
                </div>

                {availableModels.length > 0 && (
                  <div>
                    <label
                      htmlFor="llm-model"
                      className="block text-sm font-medium text-neutral-700 mb-8px"
                    >
                      <Cpu size={16} className="inline mr-8px" />
                      LLM Model
                    </label>
                    <select
                      id="llm-model"
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      disabled={isSearching || modelInfoLoading}
                      className="w-full px-12px py-8px bg-neutral-0 border border-neutral-300 rounded-subtle focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-muted disabled:opacity-50 disabled:cursor-not-allowed text-neutral-900 transition-all"
                      aria-label="Select LLM model"
                    >
                      {availableModels.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-12px pt-8px">
              <button
                type="submit"
                disabled={isSearching || !currentQuery.trim()}
                className="flex-1 px-16px py-8px btn-primary rounded-medium font-medium text-white transition-all shadow-subtle hover:shadow-medium disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-8px"
                aria-busy={isSearching}
              >
                {isSearching ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Search & Answer</span>
                  </>
                )}
              </button>

              {isSearching && (
                <button
                  type="button"
                  onClick={handleCancelSearch}
                  className="px-12px py-8px btn-secondary rounded-medium font-medium transition-all flex items-center justify-center gap-8px"
                  aria-label="Cancel search"
                >
                  <X size={18} />
                  <span className="hidden sm:inline">Cancel</span>
                </button>
              )}

              {(currentAnswer || searchResults.length > 0) && !isSearching && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-12px py-8px btn-secondary rounded-medium font-medium transition-all"
                  aria-label="Clear results"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="animate-slide-up bg-semantic-danger/10 border border-semantic-danger rounded-medium p-16px flex items-start gap-12px">
          <div className="flex-shrink-0 text-semantic-danger text-xl">⚠️</div>
          <div className="flex-1">
            <p className="text-sm text-semantic-danger font-medium">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="flex-shrink-0 text-semantic-danger hover:opacity-70 transition-opacity"
            aria-label="Dismiss error"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Answer Section */}
      {currentAnswer && (
        <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="card bg-neutral-0 border border-neutral-200 rounded-medium p-32px">
            <div className="flex items-center justify-between mb-16px">
              <h3 className="text-heading-md font-bold text-neutral-900">
                Answer
              </h3>
              <div className="flex items-center gap-8px">
                <button
                  onClick={copyToClipboard}
                  className="p-8px hover:bg-neutral-100 rounded-medium transition-colors"
                  title="Copy answer to clipboard"
                  aria-label="Copy answer"
                >
                  <Copy size={18} className="text-black" />
                </button>
                <button
                  onClick={speakText}
                  className="p-8px hover:bg-neutral-100 rounded-medium transition-colors"
                  title="Read answer aloud"
                  aria-label="Read answer"
                >
                  <Volume2 size={18} className="text-black" />
                </button>
              </div>
            </div>

            <div className="prose prose-sm max-w-none text-neutral-700">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-heading-lg font-bold text-neutral-900 mt-16px mb-12px">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-heading-md font-bold text-neutral-900 mt-16px mb-12px">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-heading-sm font-semibold text-neutral-900 mt-12px mb-8px">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-neutral-700 leading-relaxed mb-12px">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside mb-12px space-y-6px text-neutral-700">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside mb-12px space-y-6px text-neutral-700">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => <li>{children}</li>,
                  code: ({ children }) => (
                    <code className="bg-neutral-100 px-8px py-4px rounded-subtle font-mono text-sm text-neutral-800">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-neutral-100 p-12px rounded-subtle overflow-x-auto mb-12px">
                      {children}
                    </pre>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-black pl-12px py-8px italic text-neutral-600 my-12px">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {cleanedAnswer}
              </ReactMarkdown>
            </div>

            {/* Sources */}
            {answerSources.length > 0 && (
              <div className="mt-24px pt-24px border-t border-neutral-200">
                <p className="text-sm font-semibold text-neutral-600 mb-12px">
                  Sources ({answerSources.length}):
                </p>
                <div className="space-y-8px">
                  {answerSources.map((source, idx) => (
                    <div
                      key={idx}
                      className="text-sm text-neutral-600 bg-neutral-50 p-8px rounded-subtle border border-neutral-200"
                    >
                      {source}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <div className="card bg-neutral-0 border border-neutral-200 rounded-medium p-32px">
            <h3 className="text-heading-md font-bold text-neutral-900 mb-16px">
              Search Results ({searchResults.length})
            </h3>
            <div className="space-y-16px max-h-96 overflow-y-auto">
              {searchResults.map((result: SearchResult, idx) => (
                <div
                  key={idx}
                  className="bg-neutral-50 p-16px rounded-medium border border-neutral-200 hover:border-accent-primary hover:shadow-subtle transition-all"
                >
                  <div className="flex items-start justify-between mb-8px flex-wrap gap-8px">
                    <p className="font-medium text-neutral-900">
                      Chunk {result.chunk_id || idx + 1}
                    </p>
                    <span className="badge text-xs">
                      Score: {(result.similarity_score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-neutral-600 text-sm leading-relaxed mb-8px">
                    {formatSearchResult(result.text)}
                  </p>
                  <p className="text-xs text-neutral-500">
                    From: <span className="font-mono">{result.file_name}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!currentAnswer &&
        searchResults.length === 0 &&
        !isSearching &&
        !error && (
          <div className="animate-slide-up">
            <div className="card bg-neutral-50 border border-dashed border-neutral-300 rounded-medium p-32px text-center">
              <Send size={36} className="text-neutral-400 mx-auto mb-16px" />
              <p className="text-neutral-600 mb-8px font-medium">
                No results yet
              </p>
              <p className="text-sm text-neutral-500">
                Ask a question above to search documents and generate answers
              </p>
            </div>
          </div>
        )}
    </div>
  );
}
