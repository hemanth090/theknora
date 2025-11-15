"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import Navigation from "@/components/Navigation";
import DocumentIngestionTab from "@/components/DocumentIngestionTab";
import IntelligentQueryTab from "@/components/IntelligentQueryTab";
import KnowledgeAnalyticsTab from "@/components/KnowledgeAnalyticsTab";
import { useStore } from "@/lib/store";
import { apiService } from "@/lib/api";

function AppContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    activeTab,
    setActiveTab,
    setBackendConnected,
    error,
    setError,
    backendConnected,
  } = useStore();

  // Sync URL query params with active tab
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    const isValidTab = (
      tab: string,
    ): tab is "ingestion" | "query" | "analytics" => {
      return ["ingestion", "query", "analytics"].includes(tab);
    };

    if (tabParam && isValidTab(tabParam) && activeTab !== tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams, activeTab, setActiveTab]);

  // Check backend health on mount and periodically
  useEffect(() => {
    let isMounted = true;
    let healthCheckInterval: NodeJS.Timeout;

    const checkBackendHealth = async () => {
      if (!isMounted) return;

      try {
        await apiService.checkHealth();
        if (isMounted && !backendConnected) {
          setBackendConnected(true);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted && backendConnected) {
          setBackendConnected(false);
          setError("Backend is not accessible at http://localhost:8000");
        }
      }
    };

    // Check immediately
    checkBackendHealth();

    // Check periodically
    healthCheckInterval = setInterval(checkBackendHealth, 30000);

    return () => {
      isMounted = false;
      clearInterval(healthCheckInterval);
    };
  }, [backendConnected, setBackendConnected, setError]);

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-0 flex items-center justify-center p-4">
        <div className="bg-semantic-danger/10 border border-semantic-danger rounded-large p-8 max-w-md text-center animate-fade-in">
          <h2 className="text-heading-md font-bold text-semantic-danger mb-4">
            ⚠️ Connection Error
          </h2>
          <p className="text-neutral-600 mb-6 text-sm">{error}</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={() => window.location.reload()}
              className="btn-primary px-6 py-2"
            >
              Retry Connection
            </button>
            <button
              onClick={() => setError(null)}
              className="btn-secondary px-6 py-2"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-0">
      <Navigation />

      <main className="page-container animate-fade-in">
        {activeTab === "ingestion" && <DocumentIngestionTab />}
        {activeTab === "query" && <IntelligentQueryTab />}
        {activeTab === "analytics" && <KnowledgeAnalyticsTab />}
      </main>
    </div>
  );
}

export default function AppPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-0 flex items-center justify-center">
          <div className="text-center animate-fade-in">
            <div className="w-12 h-12 rounded-full border-2 border-neutral-300 border-t-black animate-spin mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading application...</p>
          </div>
        </div>
      }
    >
      <AppContent />
    </Suspense>
  );
}
