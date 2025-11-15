# Spacing & Layout System

## Spacing Scale

Notion-uses soft increments and breathable whitespace.

| Token | Value | Use Case |
|-------|-------|----------|
| 2px | 2 | Minimal gaps, icon spacing |
| 4px | 4 | Tight spacing, small margins |
| 6px | 6 | Compact spacing, element gaps |
| 8px | 8 | Standard spacing, button padding |
| 12px | 12 | Default spacing, component margins |
| 16px | 16 | Medium spacing, section gaps |
| 20px | 20 | Larger spacing, block separators |
| 24px | 24 | Large spacing, major section gaps |
| 32px | 32 | Extra large spacing, page margins |
| 48px | 48 | Jumbo spacing, layout separators |
| 64px | 64 | Maximum spacing, major layout breaks |

## Border Radius

| Token | Value | Use Case |
|-------|-------|----------|
| None | 0 | Sharp corners, dividers |
| Subtle | 4px | Slight rounding, inputs, small elements |
| Medium | 6px | Standard rounding, buttons, cards |
| Large | 8px | Pronounced rounding, modals, large components |

## Borders

| Token | Value | Use Case |
|-------|-------|----------|
| Border Subtle | 1px solid #e5e5e5 | Dividers, light separations, secondary borders |
| Border Medium | 1px solid #d4d4d4 | Primary borders, input fields, component edges |

## Shadows

Notion uses extremely light shadows for depth without heaviness.

| Token | Value | Use Case |
|-------|-------|----------|
| Shadow None | none | No elevation |
| Shadow Subtle | 0px 1px 2px rgba(0, 0, 0, 0.05) | Hover states, slight lift |
| Shadow Medium | 0px 2px 6px rgba(0, 0, 0, 0.08) | Cards, elevated components |
| Shadow Popover | 0px 4px 12px rgba(0, 0, 0, 0.10) | Modals, popovers, dropdowns |

## Layout Dimensions

| Element | Dimension | Use Case |
|---------|-----------|----------|
| Page Max-Width | 880px | Content container maximum width |
| Sidebar Width | 250px | Navigation sidebar |
| Toolbar Height | 48px | Header/toolbar height |
| Touch Target Minimum | 36px height | Minimum interactive element size |

## Layout Rules

- Page max-width of 880px centers content on wide screens with auto margins
- Sidebar width of 250px maintains comfortable navigation without crowding
- Toolbar height of 48px accommodates text and icons comfortably
- Touch target minimum of 36px ensures mobile accessibility and ease of interaction
- Use 32px padding on page containers for breathing room
- Apply consistent 12px gaps between flex items in headers and toolbars
- Maintain vertical rhythm using spacing scale increments

## Container Structure

### Page Container
- Background: Neutral 0
- Padding: 32px
- Max-width: 880px
- Centered with auto margins (margin: 0 auto)

### Sidebar
- Width: 250px
- Background: Neutral 50
- Divider: Border Subtle
- Padding: 12px
- Hover state background: Neutral 100

## Grid & Flex Patterns

### Header Layout
- Display: flex
- Align items: center
- Gap: 12px
- Height: 48px
- Border-bottom: Border Subtle

### Card Grid
- Gap: 16px
- Responsive columns (2-3 columns on desktop, 1 on mobile)

### Vertical Stack
- Gap: 12px for tight spacing
- Gap: 16px for standard spacing
- Gap: 24px for loose spacing

## Responsive Breakpoints

While not explicitly specified, apply these layout principles:
- Mobile: Single column, full-width containers
- Tablet: 2-column layouts, reduced max-width
- Desktop: Full layout, 880px max-width enforced

## Spacing Application Rules

- Use 8px as default padding for buttons and small components
- Use 12px for gaps between flex items and standard margins
- Use 16px for padding in cards and larger components
- Use 24px for spacing between major sections
- Use 32px for page container padding
- Maintain consistent rhythm across all spacing decisions
- Never mix spacing scales arbitrarily; stick to defined tokens
- Apply relaxed spacing (24px+) to improve visual breathing room in dense layouts