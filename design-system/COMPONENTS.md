# Component Specifications

Notion-style components with clean, readable designs and no assumed behaviors beyond what is specified.

## Page Container

Primary container for all page content.

- Background: Neutral 0
- Padding: 32px
- Max-width: 880px
- Centered with auto margins (margin: 0 auto)

Use case: Main content wrapper, ensures consistent padding and width across all pages.

## Sidebar

Navigation and contextual information container.

- Width: 250px
- Background: Neutral 50
- Divider: Border Subtle (1px solid #e5e5e5)
- Padding: 12px
- Hover state background: Neutral 100

Use case: Navigation menu, document hierarchy, contextual filters.

## Header

Top-level toolbar and navigation area.

- Height: 48px
- Background: Neutral 0
- Border-bottom: Border Subtle (1px solid #e5e5e5)
- Layout: flex, gap 12px, align-items center

Use case: Application header, breadcrumbs, top navigation.

## Button - Primary

Main call-to-action button for significant actions.

- Background: Accent Primary (#3f5efb)
- Color: white
- Padding: 8px 14px
- Border radius: 6px
- Hover: Accent Primary Hover (#3349cc)
- Active: scale 0.98
- Disabled: background Neutral 200
- Border: none
- Font size: Text SM (14px)
- Font weight: Medium (500)
- Line height: Normal (1.4)

Use case: Submit forms, create actions, primary confirmations.

## Button - Secondary

Alternative button for less prominent actions.

- Background: Neutral 100
- Color: Neutral 700
- Padding: 8px 14px
- Border radius: 6px
- Border: 1px solid Neutral 200
- Hover: background Neutral 200
- Active: scale 0.98
- Disabled: background Neutral 100, color Neutral 400
- Font size: Text SM (14px)
- Font weight: Medium (500)
- Line height: Normal (1.4)

Use case: Secondary actions, cancel buttons, alternative options.

## Input Field

Text input for user data entry.

- Background: Neutral 0
- Border: 1px solid Neutral 300
- Border radius: 6px
- Padding: 8px 12px
- Focus: border color Accent Primary
- Focus: box-shadow 0 0 0 3px Accent Muted
- Font size: Text MD (16px)
- Font weight: Regular (400)
- Line height: Normal (1.4)
- Text color: Neutral 700

Use case: Forms, search boxes, text entry.

## Textarea

Multi-line text input for longer content.

- Background: Neutral 0
- Border: 1px solid Neutral 300
- Border radius: 6px
- Padding: 8px 12px
- Focus: border color Accent Primary
- Focus: box-shadow 0 0 0 3px Accent Muted
- Font size: Text MD (16px)
- Font weight: Regular (400)
- Line height: Normal (1.4)
- Text color: Neutral 700
- Resize: vertical

Use case: Multi-line content entry, document editing, descriptions.

## Text Block

Base element for displaying text content.

- Padding-top: 4px
- Padding-bottom: 4px
- Text color: Neutral 700
- Font size: Text MD (16px)
- Font weight: Regular (400)
- Line height: Normal (1.4)

Use case: Body copy, paragraphs, standard text.

## Callout

Emphasized box for important information or alerts.

- Background: Neutral 100
- Border-left: 3px solid Accent Primary
- Padding: 12px
- Border radius: 6px
- Text color: Neutral 700

Use case: Important notices, tips, informational highlights.

## Card

Container for grouped content.

- Background: Neutral 0
- Border: Border Medium (1px solid #d4d4d4)
- Border radius: 6px
- Padding: 16px
- Shadow: Shadow Subtle (0px 1px 2px rgba(0, 0, 0, 0.05))

Use case: Content cards, document preview, grouped information.

## Modal

Dialog overlay for focused user interactions.

- Background: Neutral 0
- Border radius: Large (8px)
- Padding: 24px
- Shadow: Shadow Popover (0px 4px 12px rgba(0, 0, 0, 0.10))
- Backdrop: rgba(0, 0, 0, 0.4)
- Z-index: above all other content

Use case: Confirmations, forms, detailed editing, alerts.

## Badge

Small label for status, tags, or categories.

- Background: Accent Muted (#dce3ff)
- Color: Accent Primary (#3f5efb)
- Padding: 4px 8px
- Border radius: Subtle (4px)
- Font size: Text XS (12px)
- Font weight: Medium (500)
- Line height: Tight (1.2)

Use case: Tags, labels, status indicators.

## Label

Form label for input identification.

- Font size: Text SM (14px)
- Font weight: Medium (500)
- Color: Neutral 700
- Margin-bottom: 4px
- Line height: Normal (1.4)

Use case: Form field labels, input descriptions.

## Divider

Visual separator between content sections.

- Height: 1px
- Background: Border Subtle (#e5e5e5)
- Margin: 16px 0

Use case: Section breaks, visual hierarchy, content separation.

## Tooltip

Small floating label for contextual information.

- Background: Neutral 800
- Color: white
- Padding: 6px 8px
- Border radius: Subtle (4px)
- Font size: Text XS (12px)
- Font weight: Regular (400)
- Shadow: Shadow Popover (0px 4px 12px rgba(0, 0, 0, 0.10))
- Z-index: above modal content

Use case: Help text, contextual hints, icon descriptions.

## Link

Inline text link for navigation and actions.

- Color: Accent Primary (#3f5efb)
- Text decoration: none
- Font weight: Regular (400)
- Hover: text decoration underline
- Active: color Accent Primary Hover (#3349cc)

Use case: Navigation, references, inline actions.

## Code Block

Container for code snippets and preformatted text.

- Background: Neutral 100
- Border: Border Subtle (1px solid #e5e5e5)
- Border radius: Medium (6px)
- Padding: 12px
- Font family: monospace
- Font size: Text SM (14px)
- Color: Neutral 800
- Overflow-x: auto

Use case: Code samples, technical documentation, preformatted content.