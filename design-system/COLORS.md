# Color System

## Neutral Palette

Soft grays with near-white surfaces and muted dark text for clarity and readability.

| Token | Value | Use Case |
|-------|-------|----------|
| Neutral 0 | #ffffff | Primary background, cards, modals |
| Neutral 50 | #f7f7f7 | Sidebar, alternate surfaces |
| Neutral 100 | #f0f0f0 | Hover states, secondary surfaces |
| Neutral 200 | #e5e5e5 | Borders, subtle dividers |
| Neutral 300 | #d4d4d4 | Medium borders, input focus rings |
| Neutral 400 | #a1a1a1 | Disabled states, muted icons |
| Neutral 500 | #737373 | Secondary text, helper text |
| Neutral 600 | #525252 | Secondary text, labels |
| Neutral 700 | #404040 | Primary text, body copy |
| Neutral 800 | #262626 | Emphasis, dark surfaces (dark theme) |
| Neutral 900 | #171717 | Maximum contrast text |

## Accent Colors

Notion-like subtle blue for primary interactions and focus states.

| Token | Value | Use Case |
|-------|-------|----------|
| Accent Primary | #3f5efb | Primary buttons, links, focus indicators |
| Accent Primary Hover | #3349cc | Primary button hover state |
| Accent Muted | #dce3ff | Light backgrounds, badges, highlights |

## Semantic Colors

Standardized colors for communicating state and feedback.

| Token | Value | Use Case |
|-------|-------|----------|
| Success | #16a34a | Confirmations, successful actions, checkmarks |
| Warning | #ca8a04 | Alerts, cautions, pending states |
| Danger | #dc2626 | Errors, destructive actions, alerts |
| Info | #2563eb | Informational messages, notifications |

## Theme Variants

### Light Theme

| Element | Color |
|---------|-------|
| Background | Neutral 0 (#ffffff) |
| Surface | Neutral 50 (#f7f7f7) |
| Text Primary | Neutral 900 (#171717) |
| Text Secondary | Neutral 600 (#525252) |
| Border | Neutral 200 (#e5e5e5) |

### Dark Theme

Notion-style muted dark, not pure black.

| Element | Color |
|---------|-------|
| Background | #1f1f1f |
| Surface | #262626 |
| Text Primary | #f5f5f5 |
| Text Secondary | #a3a3a3 |
| Border | #3a3a3a |
| Accent Primary | #6583ff |

## Color Application Rules

- Use Neutral 0 as primary application background
- Use Neutral 50 for sidebar and container surfaces
- Use Neutral 200 for subtle borders and dividers
- Use Neutral 700 for primary body text in light theme
- Reserve semantic colors for actionable feedback only
- Apply Accent Primary to interactive elements (buttons, links, focus states)
- Use Accent Muted for secondary highlights and background tints
- Maintain sufficient contrast for WCAG AA compliance (minimum 4.5:1 for text)