"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  FileText,
  Search,
  Zap,
  Shield,
  BarChart3,
  Clock,
} from "lucide-react";

export default function LandingPage() {
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({});

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="min-h-screen bg-neutral-0">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-neutral-0/95 backdrop-blur-sm border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Premium K Logo */}
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-slate-950 via-black to-slate-900 shadow-lg"></div>
              <div className="absolute inset-0.5 rounded-md bg-gradient-to-br from-slate-800 via-black to-slate-950 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-slate-700/10 to-transparent opacity-60"></div>
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 relative z-10"
                  fill="none"
                >
                  <text
                    x="5"
                    y="17"
                    fontSize="16"
                    fontWeight="800"
                    fill="white"
                    fontFamily="system-ui"
                  >
                    K
                  </text>
                  <path
                    d="M16 3.5 L17.5 6 L16 8.5 L14.5 6 Z"
                    fill="url(#navLuxuryGradient)"
                    opacity="0.85"
                  />
                  <defs>
                    <linearGradient
                      id="navLuxuryGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#fbbf24" />
                      <stop offset="50%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#d97706" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="absolute top-0 left-1 right-1 h-px bg-gradient-to-r from-transparent via-slate-400/50 to-transparent"></div>
              <div className="absolute bottom-0 left-1.5 right-1.5 h-0.5 bg-gradient-to-r from-transparent via-slate-500/40 to-transparent rounded-full"></div>
            </div>
            <div
              style={{
                fontFamily:
                  "Avenir Next, Avenir, -apple-system, BlinkMacSystemFont, Segoe UI, Poppins, sans-serif",
              }}
            >
              <h1 className="text-lg font-bold text-neutral-900">KnoRa</h1>
              <p className="text-xs text-neutral-600">AI Knowledge Assistant</p>
            </div>
          </div>
          <Link
            href="/app?tab=query"
            className="px-6 py-2 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 transition-all"
            style={{
              fontFamily:
                "Avenir Next, Avenir, -apple-system, BlinkMacSystemFont, Segoe UI, Poppins, sans-serif",
            }}
          >
            Launch App
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        className="relative"
        style={{
          fontFamily:
            "Avenir Next, Avenir, -apple-system, BlinkMacSystemFont, Segoe UI, Poppins, sans-serif",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-24 md:py-40 space-y-16">
          <div className="space-y-6 text-center max-w-3xl mx-auto">
            <h1
              className="text-5xl md:text-6xl font-bold text-neutral-900 leading-tight"
              style={{
                fontFamily:
                  "Avenir Next, Avenir, -apple-system, BlinkMacSystemFont, Segoe UI, Poppins, sans-serif",
                letterSpacing: "-0.02em",
              }}
            >
              Your Documents, Intelligent Answers
            </h1>
            <p
              className="text-xl text-neutral-600 leading-relaxed"
              style={{
                fontFamily:
                  "Avenir Next, Avenir, -apple-system, BlinkMacSystemFont, Segoe UI, Poppins, sans-serif",
              }}
            >
              Extract insights from your documents with AI-powered search and
              analysis. Private, fast, and built for professionals.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center flex-wrap pt-4">
            <Link
              href="/app?tab=ingestion"
              className="px-8 py-3 bg-neutral-900 text-white rounded-lg font-semibold hover:bg-neutral-800 transition-all"
              style={{
                fontFamily:
                  "Avenir Next, Avenir, -apple-system, BlinkMacSystemFont, Segoe UI, Poppins, sans-serif",
              }}
            >
              Get Started Free
            </Link>
            <button
              className="px-8 py-3 bg-neutral-100 text-neutral-900 rounded-lg font-semibold hover:bg-neutral-200 transition-all border border-neutral-200"
              style={{
                fontFamily:
                  "Avenir Next, Avenir, -apple-system, BlinkMacSystemFont, Segoe UI, Poppins, sans-serif",
              }}
              onClick={() =>
                document
                  .getElementById("features")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Learn More
            </button>
          </div>

          {/* Hero Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-neutral-200">
            {[
              { label: "Supported Formats", value: "10+" },
              { label: "Processing Speed", value: "Real-time" },
              { label: "Data Privacy", value: "100% Private" },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <p
                  className="text-3xl md:text-4xl font-bold text-neutral-900 mb-2"
                  style={{
                    fontFamily:
                      "Avenir Next, Avenir, -apple-system, BlinkMacSystemFont, Segoe UI, Poppins, sans-serif",
                  }}
                >
                  {stat.value}
                </p>
                <p
                  className="text-neutral-600"
                  style={{
                    fontFamily:
                      "Avenir Next, Avenir, -apple-system, BlinkMacSystemFont, Segoe UI, Poppins, sans-serif",
                  }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="border-t border-neutral-200 py-24 md:py-32"
        style={{
          fontFamily:
            "Avenir Next, Avenir, -apple-system, BlinkMacSystemFont, Segoe UI, Poppins, sans-serif",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-8 space-y-16">
          <div className="text-center space-y-4">
            <h2
              className="text-4xl md:text-5xl font-bold text-neutral-900"
              style={{
                fontFamily:
                  "Avenir Next, Avenir, -apple-system, BlinkMacSystemFont, Segoe UI, Poppins, sans-serif",
                letterSpacing: "-0.01em",
              }}
            >
              Professional Features
            </h2>
            <p
              className="text-xl text-neutral-600"
              style={{
                fontFamily:
                  "Avenir Next, Avenir, -apple-system, BlinkMacSystemFont, Segoe UI, Poppins, sans-serif",
              }}
            >
              Built for teams that need accurate, reliable document intelligence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: FileText,
                title: "Universal Document Support",
                desc: "Upload PDFs, Word documents, Excel spreadsheets, PowerPoint presentations, and text files. Intelligent parsing ensures accurate content extraction.",
              },
              {
                icon: Search,
                title: "Semantic Intelligence",
                desc: "Advanced search using AI embeddings. Find relevant information across documents instantly, not just keyword matches. Understand context, not just words.",
              },
              {
                icon: Zap,
                title: "Instant Answers",
                desc: "Ask questions and get precise answers with source attribution. Know exactly where information came from. Multiple LLM models available.",
              },
              {
                icon: Shield,
                title: "Enterprise Privacy",
                desc: "Your documents stay on your server. No cloud uploads. Complete control over your data. GDPR and compliance ready.",
              },
              {
                icon: BarChart3,
                title: "Analytics Dashboard",
                desc: "Track document processing, search patterns, and usage insights. Understand how your team uses KnoRa.",
              },
              {
                icon: Clock,
                title: "Real-time Processing",
                desc: "No waiting. Instant document indexing and search. Optimized for production workloads.",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-neutral-0 border border-neutral-200 rounded-lg p-8 hover:border-neutral-300 transition-all"
                style={{
                  fontFamily:
                    "Avenir Next, Avenir, -apple-system, BlinkMacSystemFont, Segoe UI, Poppins, sans-serif",
                }}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-100">
                  <feature.icon size={24} className="text-neutral-700" />
                </div>
                <h3
                  className="text-lg font-semibold text-neutral-900 mb-3"
                  style={{
                    fontFamily:
                      "Avenir Next, Avenir, -apple-system, BlinkMacSystemFont, Segoe UI, Poppins, sans-serif",
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-neutral-600 text-sm leading-relaxed"
                  style={{
                    fontFamily:
                      "Avenir Next, Avenir, -apple-system, BlinkMacSystemFont, Segoe UI, Poppins, sans-serif",
                  }}
                >
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        className="border-t border-neutral-200 py-24 md:py-32 bg-neutral-50"
        style={{
          fontFamily:
            "Avenir Next, Avenir, -apple-system, BlinkMacSystemFont, Segoe UI, Poppins, sans-serif",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-8 space-y-16">
          <div className="text-center space-y-4">
            <h2
              className="text-4xl md:text-5xl font-bold text-neutral-900"
              style={{
                fontFamily:
                  "Avenir Next, Avenir, -apple-system, BlinkMacSystemFont, Segoe UI, Poppins, sans-serif",
                letterSpacing: "-0.01em",
              }}
            >
              Simple Workflow
            </h2>
            <p
              className="text-xl text-neutral-600"
              style={{
                fontFamily:
                  "Avenir Next, Avenir, -apple-system, BlinkMacSystemFont, Segoe UI, Poppins, sans-serif",
              }}
            >
              From documents to insights in three steps
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-0">
            {[
              {
                step: "1",
                title: "Upload Documents",
                desc: "Drag and drop your files into KnoRa. We support 10+ file formats with automatic text extraction.",
              },
              {
                step: "2",
                title: "Ask Questions",
                desc: "Use natural language to query your documents. AI understands context and finds relevant information.",
              },
              {
                step: "3",
                title: "Get Answers",
                desc: "Receive accurate answers with source attribution. Know exactly where information came from.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-0 w-full md:w-auto"
              >
                <div className="bg-neutral-0 border border-neutral-200 rounded-lg p-8 w-full md:w-80 text-center flex-shrink-0">
                  <div
                    className="mb-6 inline-flex items-center justify-center w-16 h-16 bg-neutral-900 text-white rounded-full font-bold text-2xl"
                    style={{
                      fontFamily:
                        "Avenir Next, Avenir, -apple-system, BlinkMacSystemFont, Segoe UI, Poppins, sans-serif",
                    }}
                  >
                    {item.step}
                  </div>
                  <h3
                    className="text-lg font-semibold text-neutral-900 mb-3"
                    style={{
                      fontFamily:
                        "Avenir Next, Avenir, -apple-system, BlinkMacSystemFont, Segoe UI, Poppins, sans-serif",
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="text-neutral-600 text-sm leading-relaxed"
                    style={{
                      fontFamily:
                        "Avenir Next, Avenir, -apple-system, BlinkMacSystemFont, Segoe UI, Poppins, sans-serif",
                    }}
                  >
                    {item.desc}
                  </p>
                </div>

                {idx < 2 && (
                  <div className="hidden md:flex flex-shrink-0 w-12 justify-center items-center">
                    <ArrowRight size={24} className="text-neutral-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Specifications */}
      <section
        className="border-t border-neutral-200 py-24 md:py-32"
        style={{
          fontFamily:
            "Avenir Next, Avenir, -apple-system, BlinkMacSystemFont, Segoe UI, Poppins, sans-serif",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-8 space-y-16">
          <div className="text-center space-y-4">
            <h2
              className="text-4xl md:text-5xl font-bold text-neutral-900"
              style={{
                fontFamily:
                  "Avenir Next, Avenir, -apple-system, BlinkMacSystemFont, Segoe UI, Poppins, sans-serif",
                letterSpacing: "-0.01em",
              }}
            >
              Built for Enterprise
            </h2>
            <p
              className="text-xl text-neutral-600"
              style={{
                fontFamily:
                  "Avenir Next, Avenir, -apple-system, BlinkMacSystemFont, Segoe UI, Poppins, sans-serif",
              }}
            >
              Technical excellence meets real-world reliability
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: "Supported File Formats",
                items: [
                  "PDF Documents",
                  "Microsoft Word (.docx, .doc)",
                  "Excel Spreadsheets",
                  "PowerPoint Presentations",
                  "Text Files (.txt, .md)",
                  "CSV & TSV Data",
                ],
              },
              {
                title: "AI Models Available",
                items: [
                  "Mixtral 8x7B (Groq)",
                  "LLaMA 3 70B",
                  "LLaMA 3 8B",
                  "Gemma 7B",
                  "Multiple models switchable per query",
                ],
              },
              {
                title: "Security & Privacy",
                items: [
                  "Self-hosted deployment",
                  "No cloud data uploads",
                  "Local vector storage",
                  "Complete data ownership",
                  "GDPR compliant",
                  "No third-party tracking",
                ],
              },
              {
                title: "Performance",
                items: [
                  "Real-time document indexing",
                  "Sub-second search latency",
                  "Batch processing support",
                  "Automatic content chunking",
                  "Optimized embeddings",
                  "Scalable architecture",
                ],
              },
            ].map((spec, idx) => (
              <div
                key={idx}
                className="bg-neutral-50 border border-neutral-200 rounded-lg p-8"
              >
                <h3
                  className="text-lg font-semibold text-neutral-900 mb-6"
                  style={{
                    fontFamily:
                      "Avenir Next, Avenir, -apple-system, BlinkMacSystemFont, Segoe UI, Poppins, sans-serif",
                  }}
                >
                  {spec.title}
                </h3>
                <ul className="space-y-3">
                  {spec.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex items-start gap-3">
                      <div className="flex-shrink-0 h-5 w-5 flex items-center justify-center">
                        <div className="h-2 w-2 bg-neutral-400 rounded-full"></div>
                      </div>
                      <span
                        className="text-neutral-600"
                        style={{
                          fontFamily:
                            "Avenir Next, Avenir, -apple-system, BlinkMacSystemFont, Segoe UI, Poppins, sans-serif",
                        }}
                      >
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        className="border-t border-neutral-200 py-24 md:py-32 bg-neutral-50"
        style={{
          fontFamily:
            "Avenir Next, Avenir, -apple-system, BlinkMacSystemFont, Segoe UI, Poppins, sans-serif",
        }}
      >
        <div className="max-w-4xl mx-auto px-4 md:px-8 space-y-12">
          <div className="text-center space-y-4">
            <h2
              className="text-4xl md:text-5xl font-bold text-neutral-900"
              style={{
                fontFamily:
                  "Avenir Next, Avenir, -apple-system, BlinkMacSystemFont, Segoe UI, Poppins, sans-serif",
                letterSpacing: "-0.01em",
              }}
            >
              Frequently Asked Questions
            </h2>
            <p
              className="text-xl text-neutral-600"
              style={{
                fontFamily:
                  "Avenir Next, Avenir, -apple-system, BlinkMacSystemFont, Segoe UI, Poppins, sans-serif",
              }}
            >
              Common questions answered
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Is my data stored in the cloud?",
                a: "No. KnoRa is designed for self-hosted deployment. All your documents and embeddings stay on your infrastructure. We never access or store your data.",
              },
              {
                q: "What file types are supported?",
                a: "We support PDFs, Word documents (.docx, .doc), Excel files, PowerPoint presentations, and plain text files. Files are automatically parsed and converted to searchable content.",
              },
              {
                q: "Can I use different AI models?",
                a: "Yes. We support multiple Groq-hosted models including Mixtral 8x7B, LLaMA 3 70B/8B, and Gemma 7B. You can switch models per query or set a default.",
              },
              {
                q: "What's the maximum file size?",
                a: "Single files up to 100MB are supported. Files are automatically chunked for efficient processing and search accuracy.",
              },
              {
                q: "How long does processing take?",
                a: "Document indexing is real-time. Search queries return results in milliseconds. Processing speed depends on file size and content complexity, not file format.",
              },
              {
                q: "Is this suitable for production use?",
                a: "Yes. KnoRa is built for production workloads with real-time processing, scalable architecture, and enterprise security. Used by teams managing thousands of documents.",
              },
            ].map((item, idx) => (
              <button
                key={idx}
                onClick={() => toggleSection(`faq-${idx}`)}
                className="w-full text-left bg-neutral-0 border border-neutral-200 rounded-lg p-6 hover:border-neutral-300 transition-all"
                style={{
                  fontFamily:
                    "Avenir Next, Avenir, -apple-system, BlinkMacSystemFont, Segoe UI, Poppins, sans-serif",
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <h3
                    className="font-semibold text-neutral-900 text-lg"
                    style={{
                      fontFamily:
                        "Avenir Next, Avenir, -apple-system, BlinkMacSystemFont, Segoe UI, Poppins, sans-serif",
                    }}
                  >
                    {item.q}
                  </h3>
                  {expandedSections[`faq-${idx}`] ? (
                    <ChevronUp
                      size={20}
                      className="flex-shrink-0 text-neutral-600"
                    />
                  ) : (
                    <ChevronDown
                      size={20}
                      className="flex-shrink-0 text-neutral-600"
                    />
                  )}
                </div>
                {expandedSections[`faq-${idx}`] && (
                  <p
                    className="text-neutral-600 text-sm mt-4"
                    style={{
                      fontFamily:
                        "Avenir Next, Avenir, -apple-system, BlinkMacSystemFont, Segoe UI, Poppins, sans-serif",
                    }}
                  >
                    {item.a}
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="border-t border-neutral-200 py-24 md:py-32"
        style={{
          fontFamily:
            "Avenir Next, Avenir, -apple-system, BlinkMacSystemFont, Segoe UI, Poppins, sans-serif",
        }}
      >
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center space-y-8">
          <div className="space-y-4">
            <h2
              className="text-4xl md:text-5xl font-bold text-neutral-900"
              style={{
                fontFamily:
                  "Avenir Next, Avenir, -apple-system, BlinkMacSystemFont, Segoe UI, Poppins, sans-serif",
                letterSpacing: "-0.01em",
              }}
            >
              Ready to Get Started?
            </h2>
            <p
              className="text-xl text-neutral-600 max-w-2xl mx-auto"
              style={{
                fontFamily:
                  "Avenir Next, Avenir, -apple-system, BlinkMacSystemFont, Segoe UI, Poppins, sans-serif",
              }}
            >
              Upload your first document today and experience intelligent
              document analysis.
            </p>
          </div>
          <Link
            href="/app?tab=ingestion"
            className="inline-block px-8 py-4 bg-neutral-900 text-white rounded-lg font-semibold hover:bg-neutral-800 transition-all"
            style={{
              fontFamily:
                "Avenir Next, Avenir, -apple-system, BlinkMacSystemFont, Segoe UI, Poppins, sans-serif",
            }}
          >
            Launch KnoRa
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="border-t border-neutral-200 bg-neutral-50 py-16"
        style={{
          fontFamily:
            "Avenir Next, Avenir, -apple-system, BlinkMacSystemFont, Segoe UI, Poppins, sans-serif",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="relative w-10 h-10">
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-slate-950 via-black to-slate-900 shadow-lg"></div>
                  <div className="absolute inset-0.5 rounded-md bg-gradient-to-br from-slate-800 via-black to-slate-950 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-slate-700/10 to-transparent opacity-60"></div>
                    <svg
                      viewBox="0 0 24 24"
                      className="w-5 h-5 relative z-10"
                      fill="none"
                    >
                      <text
                        x="5"
                        y="17"
                        fontSize="16"
                        fontWeight="800"
                        fill="white"
                        fontFamily="system-ui"
                      >
                        K
                      </text>
                      <path
                        d="M16 3.5 L17.5 6 L16 8.5 L14.5 6 Z"
                        fill="url(#footerLuxuryGradient)"
                        opacity="0.85"
                      />
                      <defs>
                        <linearGradient
                          id="footerLuxuryGradient"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
                          <stop offset="0%" stopColor="#fbbf24" />
                          <stop offset="50%" stopColor="#f59e0b" />
                          <stop offset="100%" stopColor="#d97706" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <div className="absolute top-0 left-1 right-1 h-px bg-gradient-to-r from-transparent via-slate-400/50 to-transparent"></div>
                  <div className="absolute bottom-0 left-1.5 right-1.5 h-0.5 bg-gradient-to-r from-transparent via-slate-500/40 to-transparent rounded-full"></div>
                </div>
                <span
                  className="font-bold text-neutral-900"
                  style={{
                    fontFamily:
                      "Avenir Next, Avenir, -apple-system, BlinkMacSystemFont, Segoe UI, Poppins, sans-serif",
                  }}
                >
                  KnoRa
                </span>
              </div>
              <p
                className="text-sm text-neutral-600"
                style={{
                  fontFamily:
                    "Avenir Next, Avenir, -apple-system, BlinkMacSystemFont, Segoe UI, Poppins, sans-serif",
                }}
              >
                Intelligent document analysis and question answering system.
              </p>
            </div>
            <div>
              <h4
                className="font-semibold text-neutral-900 mb-4"
                style={{
                  fontFamily:
                    "Avenir Next, Avenir, -apple-system, BlinkMacSystemFont, Segoe UI, Poppins, sans-serif",
                }}
              >
                Product
              </h4>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li>
                  <Link
                    href="/app?tab=ingestion"
                    className="hover:text-neutral-900 transition-colors"
                  >
                    Get Started
                  </Link>
                </li>
                <li>
                  <Link
                    href="#features"
                    className="hover:text-neutral-900 transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-neutral-900 transition-colors"
                  >
                    Documentation
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4
                className="font-semibold text-neutral-900 mb-4"
                style={{
                  fontFamily:
                    "Avenir Next, Avenir, -apple-system, BlinkMacSystemFont, Segoe UI, Poppins, sans-serif",
                }}
              >
                Security
              </h4>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li>Self-Hosted</li>
                <li>Data Privacy</li>
                <li>Enterprise Ready</li>
              </ul>
            </div>
            <div>
              <h4
                className="font-semibold text-neutral-900 mb-4"
                style={{
                  fontFamily:
                    "Avenir Next, Avenir, -apple-system, BlinkMacSystemFont, Segoe UI, Poppins, sans-serif",
                }}
              >
                Company
              </h4>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li>
                  <a
                    href="#"
                    className="hover:text-neutral-900 transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-neutral-900 transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-neutral-200 pt-8 text-center text-sm text-neutral-600">
            <p
              style={{
                fontFamily:
                  "Avenir Next, Avenir, -apple-system, BlinkMacSystemFont, Segoe UI, Poppins, sans-serif",
              }}
            >
              © 2024 KnoRa. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
