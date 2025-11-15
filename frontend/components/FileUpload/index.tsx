"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import { apiService } from "@/lib/api";
import { useStore } from "@/lib/store";
import {
  Upload,
  Loader,
  Trash2,
  AlertCircle,
  CheckCircle,
  FileText,
  X,
  Info,
} from "lucide-react";

interface UploadedFile {
  file: File;
  progress: number;
  error?: string;
  status: "pending" | "uploading" | "success" | "error";
}

interface SupportedFormat {
  extension: string;
  name: string;
  max_size_mb: number;
}

// Default supported formats - used as fallback and for offline mode
const DEFAULT_FORMATS: SupportedFormat[] = [
  { extension: ".pdf", name: "PDF Document", max_size_mb: 100 },
  { extension: ".txt", name: "Plain Text", max_size_mb: 100 },
  { extension: ".docx", name: "Word Document", max_size_mb: 100 },
  { extension: ".doc", name: "Word Document (97-2003)", max_size_mb: 100 },
  { extension: ".csv", name: "CSV Spreadsheet", max_size_mb: 100 },
  { extension: ".xlsx", name: "Excel Spreadsheet", max_size_mb: 100 },
  { extension: ".xls", name: "Excel Spreadsheet (97-2003)", max_size_mb: 100 },
  { extension: ".md", name: "Markdown", max_size_mb: 100 },
  { extension: ".pptx", name: "PowerPoint", max_size_mb: 100 },
  { extension: ".json", name: "JSON Data", max_size_mb: 100 },
];

// Cache key for localStorage
const FORMATS_CACHE_KEY = "knora_supported_formats";
const FORMATS_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export default function FileUploadComponent() {
  const { addDocument } = useStore();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [supportedFormats, setSupportedFormats] =
    useState<SupportedFormat[]>(DEFAULT_FORMATS);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  useEffect(() => {
    const loadFormats = async () => {
      // Check localStorage cache first
      const cached = localStorage.getItem(FORMATS_CACHE_KEY);
      if (cached) {
        try {
          const { formats, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < FORMATS_CACHE_TTL) {
            setSupportedFormats(formats);
            return;
          }
        } catch (e) {
          // Cache parse error, ignore and fetch fresh
        }
      }

      // Fetch fresh formats from API
      try {
        const response = await apiService.getSupportedFormats();
        if (response.data.formats) {
          setSupportedFormats(response.data.formats);
          // Cache the result
          localStorage.setItem(
            FORMATS_CACHE_KEY,
            JSON.stringify({
              formats: response.data.formats,
              timestamp: Date.now(),
            }),
          );
        }
      } catch (error) {
        console.error("Failed to fetch supported formats:", error);
        setSupportedFormats(DEFAULT_FORMATS);
      }
    };

    loadFormats();
  }, []);

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    const iconMap: Record<string, string> = {
      pdf: "📄",
      txt: "📝",
      docx: "📋",
      doc: "📋",
      csv: "📊",
      xlsx: "📊",
      xls: "📊",
      md: "📑",
      pptx: "🎯",
      json: "{}",
    };
    return iconMap[ext || ""] || "📁";
  };

  const validateFile = (file: File): boolean => {
    const extension = "." + file.name.split(".").pop()?.toLowerCase();
    const maxSizeMB = 100;

    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(
        `File "${file.name}" exceeds ${maxSizeMB}MB limit (${(file.size / (1024 * 1024)).toFixed(2)}MB)`,
      );
      return false;
    }

    const isSupported = supportedFormats.some(
      (fmt) => fmt.extension.toLowerCase() === extension.toLowerCase(),
    );

    if (!isSupported) {
      toast.error(
        `File type "${extension}" not supported. Supported types: ${supportedFormats.map((f) => f.extension).join(", ")}`,
      );
      return false;
    }

    return true;
  };

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      dragCounter.current++;
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      dragCounter.current--;
      if (dragCounter.current === 0) {
        setIsDragActive(false);
      }
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    dragCounter.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      handleFilesSelected(droppedFiles);
    }
  }, []);

  const handleFilesSelected = (selectedFiles: File[]) => {
    const validFiles = selectedFiles.filter((file) => validateFile(file));

    if (validFiles.length > 0) {
      const newFiles: UploadedFile[] = validFiles.map((file) => ({
        file,
        progress: 0,
        status: "pending" as const,
      }));

      setFiles((prev) => [...prev, ...newFiles]);
      uploadFiles(newFiles);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      handleFilesSelected(selectedFiles);
    }
  };

  const uploadFiles = async (filesToUpload: UploadedFile[]) => {
    setIsUploading(true);

    for (const uploadedFile of filesToUpload) {
      try {
        setFiles((prev) =>
          prev.map((f) =>
            f.file === uploadedFile.file
              ? { ...f, status: "uploading" as const }
              : f,
          ),
        );

        const formData = new FormData();
        formData.append("file", uploadedFile.file);

        const progressInterval = setInterval(() => {
          setFiles((prev) =>
            prev.map((f) => {
              if (f.file === uploadedFile.file && f.status === "uploading") {
                const newProgress = f.progress + Math.random() * 40;
                return {
                  ...f,
                  progress: Math.min(newProgress, 90),
                };
              }
              return f;
            }),
          );
        }, 300);

        const response = await apiService.uploadFile(formData);

        clearInterval(progressInterval);

        if (response.data.success && response.data.document) {
          addDocument(response.data.document);

          setFiles((prev) =>
            prev.map((f) =>
              f.file === uploadedFile.file
                ? {
                    ...f,
                    progress: 100,
                    status: "success" as const,
                  }
                : f,
            ),
          );

          toast.success(
            `✓ Processed: ${response.data.document.file_name} (${response.data.document.num_chunks} chunks)`,
          );
        } else {
          throw new Error(response.data.message || "Upload failed");
        }
      } catch (error: any) {
        const errorMsg =
          error.response?.data?.message ||
          error.message ||
          "Failed to upload file";

        setFiles((prev) =>
          prev.map((f) =>
            f.file === uploadedFile.file
              ? {
                  ...f,
                  status: "error" as const,
                  error: errorMsg,
                }
              : f,
          ),
        );

        toast.error(`Failed: ${uploadedFile.file.name}`);
      }
    }

    setIsUploading(false);
  };

  const removeFile = (fileName: string) => {
    setFiles((prev) => prev.filter((f) => f.file.name !== fileName));
  };

  const clearAll = () => {
    setFiles([]);
  };

  const retryUpload = (fileName: string) => {
    const fileToRetry = files.find((f) => f.file.name === fileName);
    if (fileToRetry) {
      setFiles((prev) =>
        prev.map((f) =>
          f.file.name === fileName
            ? {
                ...f,
                progress: 0,
                error: undefined,
                status: "pending" as const,
              }
            : f,
        ),
      );
      uploadFiles([fileToRetry]);
    }
  };

  return (
    <div className="space-y-24px animate-fade-in">
      {/* Upload Area */}
      <div className="animate-slide-up">
        <div className="card bg-neutral-0 border border-neutral-200 rounded-medium p-32px">
          <div className="flex items-center gap-16px mb-24px">
            <div className="w-32px h-32px rounded-medium bg-accent-primary flex items-center justify-center">
              <Upload size={20} className="text-white" />
            </div>
            <h2 className="text-heading-md font-bold text-neutral-900">
              Upload Documents
            </h2>
          </div>

          {/* Drag and Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-medium p-32px text-center cursor-pointer transition-all ${
              isDragActive
                ? "border-black bg-neutral-100"
                : "border-neutral-300 hover:border-black hover:bg-neutral-50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleInputChange}
              accept=".pdf,.txt,.doc,.docx,.csv,.xlsx,.xls,.md,.pptx,.json"
              className="hidden"
            />

            <div className="space-y-16px">
              <div className="flex justify-center">
                <div
                  className={`transition-transform ${
                    isDragActive ? "scale-110" : "scale-100"
                  }`}
                >
                  <Upload
                    size={40}
                    className={`${
                      isDragActive ? "text-black" : "text-neutral-400"
                    }`}
                  />
                </div>
              </div>

              <div>
                <p
                  className={`text-base font-medium ${
                    isDragActive ? "text-black" : "text-neutral-900"
                  }`}
                >
                  {isDragActive
                    ? "Drop files here to upload"
                    : "Drag and drop files here, or click to select"}
                </p>
                <p className="text-sm text-neutral-500 mt-8px">
                  Supported formats:{" "}
                  {supportedFormats.map((f) => f.extension).join(", ")}
                </p>
                <p className="text-xs text-neutral-400 mt-6px">
                  Maximum file size: 100 MB
                </p>
              </div>
            </div>
          </div>

          {/* Supported Formats Info */}
          <div className="mt-24px bg-neutral-50 rounded-medium p-16px border border-neutral-200">
            <div className="flex items-start gap-12px">
              <Info size={18} className="text-black flex-shrink-0 mt-2px" />
              <div className="text-sm text-neutral-700">
                <p className="font-medium mb-8px">Supported File Types:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-12px">
                  {supportedFormats.map((fmt) => (
                    <div key={fmt.extension} className="text-xs">
                      <span className="text-black font-medium block">
                        {fmt.extension}
                      </span>
                      <p className="text-neutral-500">{fmt.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Queue */}
      {files.length > 0 && (
        <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="card bg-neutral-0 border border-neutral-200 rounded-medium p-32px">
            <div className="flex items-center justify-between mb-24px">
              <h3 className="text-heading-md font-bold text-neutral-900 flex items-center gap-8px">
                📁 Upload Queue ({files.length})
              </h3>
              {files.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-sm px-12px py-6px bg-semantic-danger/10 text-semantic-danger rounded-subtle hover:bg-semantic-danger/20 transition-all font-medium"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="space-y-12px max-h-96 overflow-y-auto">
              {files.map((uploadedFile, idx) => (
                <div
                  key={uploadedFile.file.name + idx}
                  className="bg-neutral-50 p-16px rounded-medium border border-neutral-200 hover:border-accent-primary hover:shadow-subtle transition-all group"
                >
                  <div className="flex items-center gap-16px">
                    {/* File Icon */}
                    <span className="text-xl flex-shrink-0">
                      {getFileIcon(uploadedFile.file.name)}
                    </span>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-neutral-900 truncate">
                        {uploadedFile.file.name}
                      </p>
                      <p className="text-sm text-neutral-500">
                        {(uploadedFile.file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>

                    {/* Status Indicator */}
                    <div className="flex items-center gap-12px flex-shrink-0">
                      {uploadedFile.status === "uploading" && (
                        <div className="animate-spin">
                          <Loader size={18} className="text-black" />
                        </div>
                      )}

                      {uploadedFile.status === "success" && (
                        <CheckCircle
                          size={18}
                          className="text-semantic-success"
                        />
                      )}

                      {uploadedFile.status === "error" && (
                        <AlertCircle
                          size={18}
                          className="text-semantic-danger"
                        />
                      )}

                      {uploadedFile.status === "pending" && !isUploading && (
                        <button
                          onClick={() => removeFile(uploadedFile.file.name)}
                          className="px-8px py-6px bg-black text-white rounded-subtle hover:bg-neutral-800 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}

                      {uploadedFile.status === "error" && (
                        <button
                          onClick={() => retryUpload(uploadedFile.file.name)}
                          className="text-xs px-8px py-6px bg-semantic-warning/10 text-semantic-warning rounded-subtle hover:bg-semantic-warning/20 transition-all font-medium"
                        >
                          Retry
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {uploadedFile.status === "uploading" && (
                    <div className="mt-12px space-y-8px">
                      <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-accent-primary transition-all"
                          style={{ width: `${uploadedFile.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-neutral-500">
                        {Math.round(uploadedFile.progress)}% uploaded
                      </p>
                    </div>
                  )}

                  {/* Error Message */}
                  {uploadedFile.status === "error" && uploadedFile.error && (
                    <p className="mt-12px text-xs text-semantic-danger">
                      {uploadedFile.error}
                    </p>
                  )}

                  {/* Success Message */}
                  {uploadedFile.status === "success" && (
                    <p className="mt-12px text-xs text-semantic-success font-medium">
                      ✓ Successfully processed and indexed
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {files.length === 0 && (
        <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="card bg-neutral-50 border border-dashed border-neutral-300 rounded-medium p-32px text-center">
            <FileText size={36} className="text-neutral-400 mx-auto mb-16px" />
            <p className="text-neutral-600 mb-8px font-medium">
              No files uploaded yet
            </p>
            <p className="text-sm text-neutral-500">
              Start by uploading a document above to get started
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
