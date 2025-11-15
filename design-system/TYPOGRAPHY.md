# Typography System

## Font Family

Inter, system-ui, sans-serif

Modern neutral typeface consistent with Notion-style UI. Fallback to system fonts for compatibility.

## Font Sizes

| Token | Size | Use Case |
|-------|------|----------|
| Text XS | 12px | Captions, helper text, metadata |
| Text SM | 14px | Secondary labels, small UI text |
| Text MD | 16px | Body text, default UI text |
| Text LG | 18px | Large body text, emphasized paragraphs |
| Heading SM | 20px | Section headings, minor titles |
| Heading MD | 24px | Page subheadings, block titles |
| Heading LG | 30px | Major section headings |
| Heading XL | 36px | Page titles, primary headings |

## Font Weights

| Token | Weight | Use Case |
|-------|--------|----------|
| Regular | 400 | Body text, default paragraph content |
| Medium | 500 | Secondary labels, UI emphasis |
| Semibold | 600 | Subheadings, emphasis, table headers |
| Bold | 700 | Main headings, strong emphasis, callouts |

## Line Heights

| Token | Value | Use Case |
|-------|-------|----------|
| Tight | 1.2 | Headings, compact labels |
| Normal | 1.4 | Body text, default UI elements |
| Relaxed | 1.6 | Long-form content, blocks, readability focus |

## Typography Scale Reference

### Headings

| Level | Size | Weight | Line Height |
|-------|------|--------|-------------|
| XL (H1) | 36px | Bold (700) | Tight (1.2) |
| LG (H2) | 30px | Bold (700) | Tight (1.2) |
| MD (H3) | 24px | Semibold (600) | Tight (1.2) |
| SM (H4) | 20px | Semibold (600) | Normal (1.4) |

### Body Text

| Type | Size | Weight | Line Height |
|------|------|--------|-------------|
| Large | 18px | Regular (400) | Normal (1.4) |
| Default | 16px | Regular (400) | Normal (1.4) |
| Small | 14px | Regular (400) | Normal (1.4) |
| Extra Small | 12px | Regular (400) | Normal (1.4) |

### Labels & UI

| Type | Size | Weight | Line Height |
|------|------|--------|-------------|
| Label Medium | 14px | Medium (500) | Normal (1.4) |
| Label Small | 12px | Medium (500) | Tight (1.2) |
| Button | 14px | Medium (500) | Normal (1.4) |
| Caption | 12px | Regular (400) | Normal (1.4) |

## Typography Application Rules

- Use Heading XL (36px, Bold) for page titles only
- Use Heading LG (30px, Bold) for major section breaks
- Use Heading MD (24px, Semibold) for block/component titles
- Use Heading SM (20px, Semibold) for subsection headings
- Use Text LG (18px, Regular) for emphasized body paragraphs
- Use Text MD (16px, Regular) as default body text
- Use Text SM (14px, Regular) for secondary or compact text
- Use Text XS (12px, Regular) for captions and metadata only
- Apply Relaxed line height (1.6) to long-form content blocks
- Apply Normal line height (1.4) to all body text and UI elements
- Apply Tight line height (1.2) to headings only
- Use Medium weight (500) for UI labels and button text
- Use Semibold weight (600) for subheadings and emphasis
- Reserve Bold weight (700) for main headings and strong callouts
- Maintain minimum 14px for body text in primary content areas
- Never use pure black text; pair with Neutral 700 or Neutral 900 for accessibility
