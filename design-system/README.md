# Notion-Style UI Design System

A comprehensive design system for building clean, minimalist interfaces inspired by Notion's design philosophy.

## Overview

This design system provides a complete foundation for consistent, accessible, and beautiful user interfaces. It includes:

- **Color System**: Neutral palette, accent colors, and semantic colors for clear communication
- **Typography**: Modern Inter font with carefully scaled sizes and weights
- **Spacing & Layout**: Breathable whitespace and flexible layout rules
- **Components**: Pre-defined Notion-style components ready for implementation
- **Themes**: Light and dark theme variants

## Quick Start

### Color System
Start with the neutral palette for backgrounds and text. Use accent colors for interactive elements. Reserve semantic colors (Success, Warning, Danger, Info) for feedback and state communication.

**File**: `COLORS.md`

### Typography
Use Inter as the primary font family with fallback to system fonts. Follow the established font size scale from 12px (Text XS) to 36px (Heading XL). Maintain proper line heights: Tight (1.2) for headings, Normal (1.4) for body text.

**File**: `TYPOGRAPHY.md`

### Spacing & Layout
Build layouts using the spacing scale: 2, 4, 6, 8, 12, 16, 20, 24, 32, 48, 64. Apply 32px padding to page containers and 12px gaps to flex layouts. Respect the 880px max-width for content.

**File**: `SPACING_LAYOUT.md`

### Components
Reference component specifications for implementation. Each component includes background color, padding, border radius, and interaction states. No behaviors are assumed beyond what is explicitly stated.

**File**: `COMPONENTS.md`

## Core Principles

### Minimalism
- Use whitespace generously
- Keep interfaces clean and uncluttered
- Avoid unnecessary visual elements

### Clarity
- Maintain sufficient contrast (minimum 4.5:1 for text)
- Use semantic colors for clear feedback
- Apply consistent typography hierarchy

### Accessibility
- Ensure all interactive elements meet 36px minimum touch target
- Use meaningful color in addition to visual indicators
- Support keyboard navigation and screen readers

### Consistency
- Apply spacing scale uniformly across all layouts
- Use defined typography rules without deviation
- Maintain color values exactly as specified

## Component Library

### Interactive Components
- Button (Primary)
- Button (Secondary)
- Input Field
- Textarea
- Link

### Layout Components
- Page Container
- Sidebar
- Header
- Divider

### Content Components
- Text Block
- Callout
- Card
- Code Block
- Badge
- Label

### Overlay Components
- Modal
- Tooltip

## Theme Variants

### Light Theme
Default theme optimized for daytime use with white backgrounds and dark text.

- Background: Neutral 0 (#ffffff)
- Text Primary: Neutral 900 (#171717)
- Accent: Accent Primary (#3f5efb)

### Dark Theme
Muted dark theme for reduced eye strain, not pure black.

- Background: #1f1f1f
- Text Primary: #f5f5f5
- Accent: #6583ff

## Color Tokens

### Neutral Palette
| Level | Usage |
|-------|-------|
| 0 | Primary backgrounds |
| 50 | Sidebar surfaces |
| 100 | Hover states |
| 200 | Borders |
| 300 | Input borders |
| 400 | Disabled states |
| 500-700 | Text hierarchy |
| 800-900 | Maximum contrast |

### Accent Colors
- **Primary**: #3f5efb (interactive elements)
- **Primary Hover**: #3349cc (button hover)
- **Muted**: #dce3ff (light backgrounds)

### Semantic Colors
- **Success**: #16a34a
- **Warning**: #ca8a04
- **Danger**: #dc2626
- **Info**: #2563eb

## Typography Reference

### Font Family
Inter, system-ui, sans-serif

### Size Scale
- Text: 12px, 14px, 16px, 18px
- Heading: 20px, 24px, 30px, 36px

### Weight Scale
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

### Line Height Scale
- Tight: 1.2 (headings)
- Normal: 1.4 (body text)
- Relaxed: 1.6 (long-form content)

## Spacing Scale

2, 4, 6, 8, 12, 16, 20, 24, 32, 48, 64

## Layout Dimensions

- **Page Max-Width**: 880px
- **Sidebar Width**: 250px
- **Toolbar Height**: 48px
- **Touch Target Minimum**: 36px height

## Border Radius

| Token | Value |
|-------|-------|
| None | 0 |
| Subtle | 4px |
| Medium | 6px |
| Large | 8px |

## Shadows

| Token | Value |
|-------|-------|
| None | none |
| Subtle | 0px 1px 2px rgba(0, 0, 0, 0.05) |
| Medium | 0px 2px 6px rgba(0, 0, 0, 0.08) |
| Popover | 0px 4px 12px rgba(0, 0, 0, 0.10) |

## Implementation Guide

### Figma
Use these tokens to set up a Figma library with design components.

### CSS/Tailwind
Map tokens to CSS custom properties or Tailwind configuration for consistent implementation.

### Component Development
Reference the COMPONENTS.md file for exact specifications. Implement only what is specified.

## File Structure

```
design-system/
├── README.md (this file)
├── COLORS.md
├── TYPOGRAPHY.md
├── SPACING_LAYOUT.md
└── COMPONENTS.md
```

## Design Rules

### Do
- Use exact color values as specified
- Follow the typography scale without deviation
- Apply spacing from the defined scale only
- Maintain consistent component specifications
- Test accessibility for all interactive elements

### Don't
- Invent or derive new colors
- Mix typography scales without purpose
- Apply arbitrary spacing values
- Add behaviors not explicitly specified
- Assume component interactions beyond documentation

## Updates & Maintenance

This design system is the source of truth for all design decisions. Changes should be:

1. Documented in the appropriate file
2. Propagated across all implementations
3. Version controlled with clear commit messages
4. Communicated to the entire team

## Questions?

Refer to the specific documentation file for your need:
- Colors: `COLORS.md`
- Typography: `TYPOGRAPHY.md`
- Spacing: `SPACING_LAYOUT.md`
- Components: `COMPONENTS.md`

All values are explicitly provided—no assumptions or deviations are permitted.