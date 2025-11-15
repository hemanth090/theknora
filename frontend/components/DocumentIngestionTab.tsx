"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { apiService } from "@/lib/api";
import { useStore } from "@/lib/store";
import FileUploadComponent from "@/components/FileUpload";
import { Trash2, AlertCircle } from "lucide-react";

export default function DocumentIngestionTab() {
  const { documents, removeDocument } = useStore();

  const handleDelete = async (filePath: string) => {
    try {
      await apiService.deleteDocument(filePath);
      removeDocument(filePath);
      toast.success("✓ Document removed from vector store");
    } catch (error: any) {
      toast.error("Failed to delete document");
      console.error("Delete error:", error);
    }
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith(".pdf")) return "📄";
    if (fileName.endsWith(".txt")) return "📝";
    if (fileName.endsWith(".doc") || fileName.endsWith(".docx")) return "📋";
    if (fileName.endsWith(".csv") || fileName.endsWith(".xlsx")) return "📊";
    if (fileName.endsWith(".md")) return "📑";
    if (fileName.endsWith(".pptx")) return "🎯";
    if (fileName.endsWith(".json")) return "{}";
    return "📁";
  };

  return (
    <div className="space-y-24px animate-fade-in">
      {/* File Upload Component */}
      <div className="animate-slide-up">
        <FileUploadComponent />
      </div>

      {/* Documents List */}
      {documents.length > 0 && (
        <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="card bg-neutral-0 border border-neutral-200 rounded-medium p-32px">
            <h3
              className="text-heading-md font-bold text-neutral-900 mb-16px flex items-center gap-8px"
              style={{
                fontFamily:
                  "Avenir Next, Avenir, -apple-system, BlinkMacSystemFont, Segoe UI, Poppins, sans-serif",
              }}
            >
              📄 Processed Documents ({documents.length})
            </h3>
            <div className="space-y-12px">
              {documents.map((doc) => (
                <div
                  key={doc.file_path}
                  className="bg-neutral-50 p-16px rounded-medium border border-neutral-200 hover:border-accent-primary hover:shadow-subtle transition-all group"
                >
                  <div className="flex items-start justify-between gap-16px">
                    <div className="flex-1">
                      <div className="flex items-center gap-8px mb-12px">
                        <span className="text-xl">
                          {getFileIcon(doc.file_name)}
                        </span>
                        <p className="font-medium text-neutral-900">
                          {doc.file_name}
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-12px text-sm text-neutral-600">
                        <div>
                          <span className="text-xs text-neutral-500 block">
                            Type
                          </span>
                          <p className="text-black font-medium">
                            {doc.file_type}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs text-neutral-500 block">
                            Chunks
                          </span>
                          <p className="text-semantic-success font-medium">
                            {doc.num_chunks}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs text-neutral-500 block">
                            Size
                          </span>
                          <p className="text-neutral-700 font-medium">
                            {(doc.file_size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(doc.file_path)}
                      className="px-8px py-8px bg-black text-white rounded-subtle hover:bg-neutral-800 transition-all opacity-0 group-hover:opacity-100"
                      title="Delete document"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {documents.length === 0 && (
        <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="card bg-neutral-50 border border-dashed border-neutral-300 rounded-medium p-32px text-center">
            <AlertCircle
              size={40}
              className="text-neutral-400 mx-auto mb-16px"
            />
            <p className="text-neutral-600 mb-8px font-medium">
              No documents processed yet
            </p>
            <p className="text-sm text-neutral-500">
              Upload a document above to get started
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
