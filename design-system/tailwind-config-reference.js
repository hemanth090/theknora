/**
 * Notion-Style UI Design System - Tailwind Configuration Reference
 *
 * This file demonstrates how to map the design system tokens to Tailwind CSS.
 * Use this as a reference for configuring your tailwind.config.js file.
 */

module.exports = {
  theme: {
    extend: {
      /* Colors */
      colors: {
        neutral: {
          0: '#ffffff',
          50: '#f7f7f7',
          100: '#f0f0f0',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a1a1a1',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        accent: {
          primary: '#3f5efb',
          'primary-hover': '#3349cc',
          muted: '#dce3ff',
        },
        semantic: {
          success: '#16a34a',
          warning: '#ca8a04',
          danger: '#dc2626',
          info: '#2563eb',
        },
      },

      /* Typography */
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },

      fontSize: {
        'xs': '12px',
        'sm': '14px',
        'md': '16px',
        'lg': '18px',
        'heading-sm': '20px',
        'heading-md': '24px',
        'heading-lg': '30px',
        'heading-xl': '36px',
      },

      fontWeight: {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },

      lineHeight: {
        tight: '1.2',
        normal: '1.4',
        relaxed: '1.6',
      },

      /* Spacing */
      spacing: {
        '2px': '2px',
        '4px': '4px',
        '6px': '6px',
        '8px': '8px',
        '12px': '12px',
        '16px': '16px',
        '20px': '20px',
        '24px': '24px',
        '32px': '32px',
        '48px': '48px',
        '64px': '64px',
      },

      /* Border Radius */
      borderRadius: {
        none: '0',
        subtle: '4px',
        medium: '6px',
        large: '8px',
      },

      /* Shadows */
      boxShadow: {
        none: 'none',
        subtle: '0px 1px 2px rgba(0, 0, 0, 0.05)',
        medium: '0px 2px 6px rgba(0, 0, 0, 0.08)',
        popover: '0px 4px 12px rgba(0, 0, 0, 0.10)',
      },

      /* Layout */
      maxWidth: {
        'page': '880px',
      },

      width: {
        'sidebar': '250px',
      },

      height: {
        'toolbar': '48px',
        'touch-target': '36px',
      },

      /* Borders */
      borderColor: {
        'subtle': '#e5e5e5',
        'medium': '#d4d4d4',
      },

      borderWidth: {
        'subtle': '1px',
        'medium': '1px',
      },
    },
  },

  /* Dark Mode Configuration */
  darkMode: 'class', /* or 'media' to use prefers-color-scheme */

  /* Plugin Configuration */
  plugins: [
    /* Add any custom plugins here */
  ],

  /* Utility Examples for Reference */
  corePlugins: {
    preflight: true,
  },

  /* Content Paths */
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
};

/**
 * USAGE EXAMPLES
 *
 * Button Primary:
 * <button class="bg-accent-primary hover:bg-accent-primary-hover text-white px-4 py-2 rounded-medium font-medium text-sm active:scale-95 disabled:bg-neutral-200">
 *   Primary Button
 * </button>
 *
 * Button Secondary:
 * <button class="bg-neutral-100 text-neutral-700 border border-neutral-200 px-4 py-2 rounded-medium font-medium text-sm hover:bg-neutral-200 active:scale-95">
 *   Secondary Button
 * </button>
 *
 * Input Field:
 * <input class="bg-neutral-0 border border-neutral-300 rounded-subtle px-3 py-2 text-md focus:border-accent-primary focus:outline-none focus:shadow-[0_0_0_3px_#dce3ff]" />
 *
 * Card:
 * <div class="bg-neutral-0 border border-neutral-200 rounded-medium p-4 shadow-subtle">
 *   Card content
 * </div>
 *
 * Page Container:
 * <div class="bg-neutral-0 p-8 max-w-page mx-auto">
 *   Page content
 * </div>
 *
 * Header:
 * <header class="h-toolbar bg-neutral-0 border-b border-neutral-200 flex gap-3 items-center">
 *   Header content
 * </header>
 *
 * Sidebar:
 * <aside class="w-sidebar bg-neutral-50 border-r border-neutral-200 p-3 hover:bg-neutral-100">
 *   Sidebar content
 * </aside>
 *
 * Heading XL:
 * <h1 class="text-heading-xl font-bold leading-tight">
 *   Page Title
 * </h1>
 *
 * Heading MD:
 * <h2 class="text-heading-md font-semibold leading-tight">
 *   Section Title
 * </h2>
 *
 * Body Text:
 * <p class="text-md font-regular leading-normal text-neutral-700">
 *   Body paragraph
 * </p>
 *
 * Badge:
 * <span class="bg-accent-muted text-accent-primary px-2 py-1 rounded-subtle text-xs font-medium">
 *   Badge Label
 * </span>
 *
 * Callout:
 * <div class="bg-neutral-100 border-l-4 border-accent-primary p-3 rounded-medium">
 *   Callout content
 * </div>
 *
 * Modal:
 * <div class="bg-neutral-0 rounded-large p-6 shadow-popover">
 *   Modal content
 * </div>
 */
