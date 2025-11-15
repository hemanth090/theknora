"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apiService, VectorStoreStats } from "@/lib/api";
import {
  BarChart3,
  RefreshCw,
  Loader,
  Database,
  File,
  Zap,
  HardDrive,
  Trash2,
} from "lucide-react";

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

interface StorageInfo {
  total_files: number;
  total_size_bytes: number;
  total_size_mb: string;
  files: Array<{
    name: string;
    size_bytes: number;
    size_mb: string;
  }>;
}

export default function KnowledgeAnalyticsTab() {
  const [stats, setStats] = useState<VectorStoreStats | null>(null);
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const response = await apiService.getVectorStoreStats();
      setStats(response.data);
      setRefreshError(null);
    } catch (error: any) {
      console.error("Failed to fetch analytics:", error);
      const errorMsg =
        error.response?.data?.error || "Failed to fetch analytics";
      setRefreshError(errorMsg);
      toast.error(errorMsg);
      setStats(null);
    }
  };

  const fetchStorageInfo = async () => {
    try {
      const response = await apiService.getStorageInfo();
      setStorageInfo(response.data);
      setRefreshError(null);
    } catch (error: any) {
      console.error("Failed to fetch storage info:", error);
      const errorMsg =
        error.response?.data?.error || "Failed to fetch storage info";
      setRefreshError(errorMsg);
      // Non-critical, continue without storage info
      setStorageInfo(null);
    }
  };

  const handleCleanupOldFiles = async () => {
    setIsCleaningUp(true);
    try {
      console.log("🧹 Starting cleanup...");
      const response = await apiService.cleanupOldFiles();
      console.log("✅ Cleanup response:", response.data);

      const deletedFiles = response.data.deleted_files || 0;
      const freedSpace = response.data.freed_space_mb || "0.00";

      if (deletedFiles > 0) {
        toast.success(
          `✅ Cleanup complete: Freed ${freedSpace} MB (${deletedFiles} files)`,
        );
      } else {
        toast.success("ℹ️ No files older than 30 days found");
      }

      // Force refresh storage info and stats after cleanup
      console.log("🔄 Refreshing storage info...");
      await fetchStorageInfo();
      console.log("🔄 Refreshing stats...");
      await fetchStats();
      console.log("✅ Refresh complete");
    } catch (error: any) {
      console.error("❌ Cleanup failed:", error);
      console.error("Error details:", error.response?.data || error.message);
      toast.error(
        "Cleanup failed: " + (error.response?.data?.message || error.message),
      );
    } finally {
      setIsCleaningUp(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout | null = null;

    const loadData = async () => {
      if (!isMounted) return;
      setIsLoading(true);
      try {
        await Promise.all([fetchStats(), fetchStorageInfo()]);
      } catch (error) {
        console.error("Failed to load initial data:", error);
      }
      if (isMounted) {
        setIsLoading(false);
      }
    };

    loadData();

    if (autoRefresh) {
      intervalId = setInterval(async () => {
        if (isMounted) {
          try {
            await Promise.all([fetchStats(), fetchStorageInfo()]);
          } catch (error) {
            console.error("Failed to refresh data:", error);
          }
        }
      }, 30000);
    }

    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoRefresh]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 animate-fade-in">
        <div className="text-center">
          <Loader
            size={36}
            className="animate-spin text-accent-primary mx-auto mb-16px"
          />
          <p className="text-neutral-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-semantic-warning/10 rounded-medium p-32px border border-semantic-warning/30 text-center animate-fade-in">
        <p className="text-neutral-600 mb-16px font-medium">
          No analytics data available
        </p>
        {refreshError && (
          <p className="text-sm text-semantic-warning mb-16px">
            {refreshError}
          </p>
        )}
        <button
          onClick={() => {
            setRefreshError(null);
            fetchStats();
            fetchStorageInfo();
          }}
          className="btn-primary px-16px py-8px rounded-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  const avgChunksPerDoc =
    stats.total_documents > 0
      ? (stats.total_vectors / stats.total_documents).toFixed(1)
      : "0";

  // Calculate accurate storage breakdown
  const uploadedFileSize =
    storageInfo?.total_size_mb || String(stats.storage_size_mb.toFixed(2));

  const statCards: StatCard[] = [
    {
      label: "Total Vectors",
      value: stats.total_vectors.toLocaleString(),
      icon: <Zap size={20} />,
      color: "accent-primary",
    },
    {
      label: "Total Documents",
      value: stats.total_documents,
      icon: <File size={20} />,
      color: "semantic-success",
    },
    {
      label: "Embedding Dimension",
      value: stats.dimension,
      icon: <Database size={20} />,
      color: "accent-primary",
    },
    {
      label: "Uploaded Files Size",
      value: `${uploadedFileSize} MB`,
      icon: <HardDrive size={20} />,
      color: "semantic-warning",
    },
  ];

  return (
    <div className="space-y-24px animate-fade-in">
      {/* Header with Refresh and Cleanup */}
      <div className="flex items-center justify-between flex-wrap gap-16px">
        <h2 className="text-heading-md font-bold text-neutral-900 flex items-center gap-12px">
          <div className="w-32px h-32px rounded-medium bg-black flex items-center justify-center">
            <BarChart3 size={20} className="text-white" />
          </div>
          Knowledge Analytics
        </h2>
        <div className="flex items-center gap-16px flex-wrap">
          <label className="flex items-center gap-8px cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 rounded-subtle accent-accent-primary cursor-pointer"
            />
            <span className="text-sm text-neutral-600 font-medium">
              Auto-refresh (30s)
            </span>
          </label>
          <button
            onClick={() => {
              fetchStats();
              fetchStorageInfo();
            }}
            className="p-8px hover:bg-neutral-100 rounded-medium transition-colors"
            title="Refresh stats"
          >
            <RefreshCw size={18} className="text-black" />
          </button>
          {storageInfo && storageInfo.total_files > 0 && (
            <button
              onClick={handleCleanupOldFiles}
              disabled={isCleaningUp}
              className="px-12px py-6px bg-semantic-warning/10 text-semantic-warning hover:bg-semantic-warning/20 rounded-medium transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-8px"
              title="Remove files older than 30 days"
            >
              <Trash2 size={16} />
              <span>{isCleaningUp ? "🧹 Cleaning..." : "🧹 Cleanup"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16px">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className="card bg-neutral-0 border border-neutral-200 rounded-medium p-16px hover:shadow-subtle transition-all"
          >
            <div className="flex items-start justify-between mb-12px">
              <div className="text-black p-8px bg-neutral-100 rounded-medium">
                {card.icon}
              </div>
            </div>
            <p className="text-neutral-500 text-sm mb-8px font-medium">
              {card.label}
            </p>
            <p className="text-heading-md font-bold text-neutral-900">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* System Configuration */}
      <div className="card bg-neutral-0 border border-neutral-200 rounded-medium p-32px">
        <h3 className="text-heading-md font-bold text-neutral-900 mb-24px">
          System Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-32px">
          <div>
            <p className="text-neutral-500 text-sm mb-8px font-medium">
              Embedding Model
            </p>
            <p className="text-base font-semibold text-black">
              {stats.embedding_model}
            </p>
          </div>
          <div>
            <p className="text-neutral-500 text-sm mb-8px font-medium">
              Average Chunks per Document
            </p>
            <p className="text-base font-semibold text-semantic-success">
              {avgChunksPerDoc}
            </p>
          </div>
          <div>
            <p className="text-neutral-500 text-sm mb-8px font-medium">
              Vector Dimension
            </p>
            <p className="text-base font-semibold text-neutral-700">
              {stats.dimension}
            </p>
          </div>
        </div>
      </div>

      {/* Storage Information */}
      {storageInfo && (
        <div className="card bg-neutral-0 border border-neutral-200 rounded-medium p-32px">
          <h3 className="text-heading-md font-bold text-neutral-900 mb-16px">
            📁 File Storage ({storageInfo.total_files} files)
          </h3>
          <p className="text-sm text-neutral-600 mb-16px">
            Total size:{" "}
            <span className="font-semibold">
              {storageInfo.total_size_mb} MB
            </span>
          </p>
          <p className="text-xs text-neutral-500 mb-16px">
            (Files older than 30 days can be cleaned up)
          </p>
          {storageInfo.total_files > 0 ? (
            <div className="space-y-8px max-h-96 overflow-y-auto">
              {storageInfo.files.map((file, idx) => (
                <div
                  key={idx}
                  className="bg-neutral-50 p-12px rounded-medium border border-neutral-200 hover:border-accent-primary transition-all"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-neutral-700 font-mono break-all flex-1">
                      {file.name}
                    </p>
                    <span className="ml-12px text-xs text-neutral-500 font-medium whitespace-nowrap">
                      {file.size_mb} MB
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500 text-sm">No files uploaded yet</p>
          )}
        </div>
      )}

      {/* Indexed Documents */}
      {stats.documents && stats.documents.length > 0 && (
        <div className="card bg-neutral-0 border border-neutral-200 rounded-medium p-32px">
          <h3 className="text-heading-md font-bold text-neutral-900 mb-16px">
            Indexed Documents ({stats.documents.length})
          </h3>
          <div className="space-y-8px max-h-96 overflow-y-auto">
            {stats.documents.map((doc, idx) => (
              <div
                key={idx}
                className="bg-neutral-50 p-12px rounded-medium border border-neutral-200 hover:border-accent-primary hover:shadow-subtle transition-all"
              >
                <p className="text-xs text-neutral-700 break-all font-mono">
                  {doc}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Store Path Info */}
      <div className="card bg-neutral-50 border border-neutral-200 rounded-medium p-16px">
        <p className="text-neutral-500 text-sm mb-8px font-medium">
          Vector Store Path
        </p>
        <p className="text-sm text-neutral-700 break-all font-mono bg-neutral-0 p-12px rounded-subtle border border-neutral-200">
          {stats.store_path}
        </p>
      </div>

      {/* Privacy Notice */}
      <div className="card bg-semantic-info/10 border border-semantic-info/30 rounded-medium p-16px">
        <p className="text-sm text-neutral-700">
          <span className="font-semibold">📁 Privacy:</span> All uploaded files
          are stored locally on your server. No files are sent to external
          services except for LLM processing. You can cleanup old files using
          the Cleanup button above.
        </p>
      </div>
    </div>
  );
}
