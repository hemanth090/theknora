"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { FileText, Search, BarChart3, Menu, X } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useStore } from "@/lib/store";

type TabId = "ingestion" | "query" | "analytics";

interface Tab {
  id: TabId;
  label: string;
  icon: typeof FileText;
}

const tabs: Tab[] = [
  { id: "ingestion", label: "Document Ingestion", icon: FileText },
  { id: "query", label: "Intelligent Query", icon: Search },
  { id: "analytics", label: "Knowledge Analytics", icon: BarChart3 },
];

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setActiveTab } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Derive active tab directly from URL (source of truth)
  const activeTab = useMemo(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["ingestion", "query", "analytics"].includes(tabParam)) {
      return tabParam as TabId;
    }
    return "query"; // Default tab
  }, [searchParams]);

  // Keep store in sync with URL
  useEffect(() => {
    setActiveTab(activeTab);
  }, [activeTab, setActiveTab]);

  // Close mobile menu when URL changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname, searchParams]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        !menuButtonRef.current?.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [mobileMenuOpen]);

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [mobileMenuOpen]);

  const handleTabClick = (tabId: TabId) => {
    router.push(`/app?tab=${tabId}`);
    setMobileMenuOpen(false);
  };

  const handleLogoClick = () => {
    router.push("/app?tab=query");
  };

  return (
    <nav className="sticky top-0 z-50 bg-neutral-0 border-b border-neutral-200 shadow-subtle">
      <div className="page-container max-w-full px-4 md:px-8">
        <div className="flex items-center justify-between h-16 md:h-toolbar">
          {/* KnoRa Branding */}
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary rounded-medium p-1"
            aria-label="KnoRa - Go to app"
            title="Go to app"
          >
            <div className="relative w-10 h-10">
              {/* Premium outer ring with deep gradient */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-slate-950 via-black to-slate-900 shadow-xl"></div>

              {/* Inner premium gradient with subtle glow */}
              <div className="absolute inset-0.5 rounded-md bg-gradient-to-br from-slate-800 via-black to-slate-950 flex items-center justify-center overflow-hidden">
                {/* Subtle inner glow effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-slate-700/10 to-transparent opacity-60"></div>

                {/* K with luxury styling */}
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 relative z-10"
                  fill="none"
                >
                  {/* K letter - bold and premium */}
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
                  {/* Premium knowledge spark - golden accent */}
                  <path
                    d="M16 3.5 L17.5 6 L16 8.5 L14.5 6 Z"
                    fill="url(#luxuryGradient)"
                    opacity="0.85"
                  />
                  <defs>
                    <linearGradient
                      id="luxuryGradient"
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

              {/* Premium top accent edge */}
              <div className="absolute top-0 left-1 right-1 h-px bg-gradient-to-r from-transparent via-slate-400/50 to-transparent"></div>

              {/* Premium bottom accent edge */}
              <div className="absolute bottom-0 left-1.5 right-1.5 h-0.5 bg-gradient-to-r from-transparent via-slate-500/40 to-transparent rounded-full"></div>
            </div>
            <div
              className="hidden sm:block"
              style={{
                fontFamily:
                  "Avenir Next, Avenir, -apple-system, BlinkMacSystemFont, Segoe UI, Poppins, sans-serif",
              }}
            >
              <h1
                className="text-heading-sm font-bold text-neutral-900"
                style={{
                  fontFamily:
                    "Avenir Next, Avenir, -apple-system, BlinkMacSystemFont, Segoe UI, Poppins, sans-serif",
                }}
              >
                KnoRa
              </h1>
              <p
                className="text-xs text-neutral-500"
                style={{
                  fontFamily:
                    "Avenir Next, Avenir, -apple-system, BlinkMacSystemFont, Segoe UI, Poppins, sans-serif",
                }}
              >
                Knowledge Assistant
              </p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`px-4 py-2 rounded-medium font-medium transition-all flex items-center gap-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-primary ${
                    isActive
                      ? "bg-black text-white shadow-subtle"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                  title={`Navigate to ${tab.label}`}
                  style={{
                    fontFamily:
                      "Avenir Next, Avenir, -apple-system, BlinkMacSystemFont, Segoe UI, Poppins, sans-serif",
                  }}
                >
                  <Icon size={16} aria-hidden="true" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            ref={menuButtonRef}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-neutral-100 rounded-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {mobileMenuOpen ? (
              <X size={20} className="text-neutral-700" aria-hidden="true" />
            ) : (
              <Menu size={20} className="text-neutral-700" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            id="mobile-menu"
            className="md:hidden border-t border-neutral-200 bg-neutral-50 py-2 animate-slide-down"
            role="navigation"
            aria-label="Mobile navigation menu"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`w-full px-4 py-3 flex items-center gap-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-primary ${
                    isActive
                      ? "bg-black text-white font-medium"
                      : "text-neutral-600 hover:bg-neutral-100"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                  style={{
                    fontFamily:
                      "Avenir Next, Avenir, -apple-system, BlinkMacSystemFont, Segoe UI, Poppins, sans-serif",
                  }}
                >
                  <Icon size={18} aria-hidden="true" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
