/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        neutral: {
          0: "#faf8f3",
          50: "#f5f2eb",
          100: "#f0ede5",
          200: "#e8e3d8",
          300: "#ddd6cc",
          400: "#a1a1a1",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
        },
        accent: {
          primary: "#000000",
          "primary-hover": "#1a1a1a",
          muted: "#f0ede5",
        },
        semantic: {
          success: "#16a34a",
          warning: "#ca8a04",
          danger: "#dc2626",
          info: "#2563eb",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Avenir Next",
          "Avenir",
          "Poppins",
          "sans-serif",
        ],
        mono: ["Fira Code", "Courier New", "monospace"],
      },
      fontSize: {
        xs: "12px",
        sm: "14px",
        base: "16px",
        lg: "18px",
        "heading-sm": "20px",
        "heading-md": "24px",
        "heading-lg": "30px",
        "heading-xl": "36px",
      },
      fontWeight: {
        regular: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
      },
      lineHeight: {
        tight: "1.2",
        normal: "1.4",
        relaxed: "1.6",
      },
      spacing: {
        "2px": "2px",
        "4px": "4px",
        "6px": "6px",
        "8px": "8px",
        "12px": "12px",
        "16px": "16px",
        "20px": "20px",
        "24px": "24px",
        "32px": "32px",
        "48px": "48px",
        "64px": "64px",
      },
      borderRadius: {
        none: "0",
        subtle: "4px",
        medium: "6px",
        large: "8px",
      },
      boxShadow: {
        none: "none",
        subtle: "0px 1px 2px rgba(0, 0, 0, 0.05)",
        medium: "0px 2px 6px rgba(0, 0, 0, 0.08)",
        popover: "0px 4px 12px rgba(0, 0, 0, 0.10)",
      },
      maxWidth: {
        page: "880px",
      },
      width: {
        sidebar: "250px",
      },
      height: {
        toolbar: "48px",
        "touch-target": "36px",
      },
    },
  },
  plugins: [],
};
