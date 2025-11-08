# Field Mapping Component - Visual Wireframes

## ASCII Wireframes

### 1. Collapsed State - Required Field (Unresolved)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ┌──────────┐  ┌──────────────────────────────────────────┐             │
│ │ Required │○ │ product_title  →  Title                  │  [▼]        │
│ └──────────┘  └──────────────────────────────────────────┘             │
│ ──────────────────────────────────────────────────────────────────────  │
│ Sample: "Wireless Bluetooth Headphones Pro Max - Black..."             │
│ ⚠ Needs review  |  250 items                                            │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2. Collapsed State - Recommended Field (Resolved)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ┌──────────────┐  ┌──────────────────────────────────────┐             │
│ │ Recommended  │✓ │ manufacturer  →  Brand               │  [▼]        │
│ └──────────────┘  └──────────────────────────────────────┘             │
│ ──────────────────────────────────────────────────────────────────────  │
│ Sample: "Sony"                                                          │
│ ✓ Resolved  |  245 items                                               │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3. Collapsed State - Optional Field

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ┌──────────┐  ┌──────────────────────────────────────────┐             │
│ │ Optional │○ │ product_color  →  Color                  │  [▼]        │
│ └──────────┘  └──────────────────────────────────────────┘             │
│ ──────────────────────────────────────────────────────────────────────  │
│ Sample: "Midnight Black"                                                │
│ ⚠ Needs review  |  165 items (85 empty)                                │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4. Expanded State - Context Tab

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ┌──────────┐                                                         [✗]│
│ │ Required │                                                            │
│ └──────────┘                                                            │
│ ──────────────────────────────────────────────────────────────────────  │
│ Product Title (title)                                                   │
│ CSV Column: product_title  →  ACP Field: title                         │
│                                                                          │
│ [Context]  Validation  Data Preview                                    │
│ ════════════════════════════════════════════════════════════════════    │
│                                                                          │
│ ┌─ WHY THIS FIELD MATTERS ─────────────────────────────────────────┐   │
│ │ The product title is the primary identifier shown to users in     │   │
│ │ ChatGPT search results. It directly impacts discoverability       │   │
│ │ and click-through rates.                                          │   │
│ └───────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│ ┌─ CHATGPT USAGE ──────────────────────────────────────────────────┐   │
│ │ • Displayed as the main product name in search results           │   │
│ │ • Used for natural language matching                             │   │
│ │ • Indexed for semantic search                                    │   │
│ └───────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│ ┌─ REQUIREMENTS ───────────────────────────────────────────────────┐   │
│ │ • Maximum 150 characters                                         │   │
│ │ • Plain text only (no HTML/markdown)                            │   │
│ │ • Must be unique within your catalog                            │   │
│ └───────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│ ┌─ GOOD EXAMPLE ───────────────────────────────────────────────────┐   │
│ │ "Sony WH-1000XM4 Wireless Noise Canceling Headphones - Black"   │   │
│ └───────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│ ──────────────────────────────────────────────────────────────────────  │
│ [Edit Mapping]  [Mark as Resolved]                                     │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5. Expanded State - Validation Tab (With Errors)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ┌──────────┐                                                         [✗]│
│ │ Required │                                                            │
│ └──────────┘                                                            │
│ ──────────────────────────────────────────────────────────────────────  │
│ Price (price)                                                           │
│ CSV Column: price  →  ACP Field: price                                 │
│                                                                          │
│  Context  [Validation]  Data Preview                                   │
│ ════════════════════════════════════════════════════════════════════    │
│                                                                          │
│ ┌─ VALIDATION STATUS ──────────────────────────────────────────────┐   │
│ │ ✗ Critical issues found                                          │   │
│ └───────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│ ┌─ ISSUES FOUND ───────────────────────────────────────────────────┐   │
│ │                                                                   │   │
│ │ ┌─ ✗ ERROR ─────────────────────────────────────────────────┐   │   │
│ │ │ Price must include ISO 4217 currency code                 │   │   │
│ │ │ Line 3                                                     │   │   │
│ │ │ Suggestion: Remove currency symbols and add code after    │   │   │
│ │ │ the price (e.g., "99.99 USD")                            │   │   │
│ │ └───────────────────────────────────────────────────────────┘   │   │
│ │                                                                   │   │
│ │ ┌─ ✗ ERROR ─────────────────────────────────────────────────┐   │   │
│ │ │ Invalid price format: "N/A" is not a valid price          │   │   │
│ │ │ Line 5                                                     │   │   │
│ │ │ Suggestion: Replace with actual price or remove product   │   │   │
│ │ └───────────────────────────────────────────────────────────┘   │   │
│ │                                                                   │   │
│ │ ┌─ ⚠ WARNING ───────────────────────────────────────────────┐   │   │
│ │ │ 12 products have missing price values                     │   │   │
│ │ │ Suggestion: Add prices or remove products                 │   │   │
│ │ └───────────────────────────────────────────────────────────┘   │   │
│ └───────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│ ┌─ MAPPING CONFIDENCE ─────────────────────────────────────────────┐   │
│ │ [████████████████████░░░░░░] 87%                                │   │
│ │ 87% confident in this mapping                                    │   │
│ └───────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│ ──────────────────────────────────────────────────────────────────────  │
│ [Edit Mapping]  [Mark as Resolved] (disabled)                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6. Expanded State - Data Preview Tab

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ┌──────────┐                                                         [✗]│
│ │ Required │                                                            │
│ └──────────┘                                                            │
│ ──────────────────────────────────────────────────────────────────────  │
│ Product Title (title)                                                   │
│ CSV Column: product_title  →  ACP Field: title                         │
│                                                                          │
│  Context  Validation  [Data Preview]                                   │
│ ════════════════════════════════════════════════════════════════════    │
│                                                                          │
│ ┌─ SAMPLE VALUES ──────────────────────────────────────────────────┐   │
│ │ 1. "Wireless Bluetooth Headphones Pro Max - Black"              │   │
│ │ 2. "Premium Noise Canceling Earbuds - White"                    │   │
│ │ 3. "Gaming Headset with RGB Lighting - Red"                     │   │
│ │ 4. "Studio Monitor Headphones Professional - Gray"              │   │
│ │ 5. "True Wireless Earbuds with Charging Case"                   │   │
│ │ 6. "Bone Conduction Sports Headphones"                          │   │
│ │ 7. "Kids Safe Volume Limiting Headphones - Blue"                │   │
│ │ 8. "USB-C Wired Earbuds with Microphone"                        │   │
│ │ 9. "Bluetooth 5.3 Neckband Earphones - Black"                   │   │
│ │ 10. "Audiophile Open-Back Headphones"                           │   │
│ └───────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│ ┌─ DATA ANALYSIS ──────────────────────────────────────────────────┐   │
│ │ ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │   │
│ │ │ Data Type   │  │ Coverage    │  │ Unique      │              │   │
│ │ │ string      │  │ 100%        │  │ 245         │              │   │
│ │ └─────────────┘  └─────────────┘  └─────────────┘              │   │
│ │                                                                   │   │
│ │ ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │   │
│ │ │ Total       │  │ Empty       │  │ Duplicates  │              │   │
│ │ │ 250         │  │ 0           │  │ 5           │              │   │
│ │ └─────────────┘  └─────────────┘  └─────────────┘              │   │
│ └───────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│ ──────────────────────────────────────────────────────────────────────  │
│ [Edit Mapping]  [Mark as Resolved]                                     │
└─────────────────────────────────────────────────────────────────────────┘
```

### 7. Edit Mapping State

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ┌──────────┐                                                         [✗]│
│ │ Required │                                                            │
│ └──────────┘                                                            │
│ ──────────────────────────────────────────────────────────────────────  │
│ Product Title (title)                                                   │
│                                                                          │
│ ┌─ EDIT MAPPING ───────────────────────────────────────────────────┐   │
│ │ CSV Column: [▼ product_title      ▼]                            │   │
│ │             [                      ]  [Save] [Cancel]           │   │
│ │                                                                   │   │
│ │ Available columns:                                                │   │
│ │   • product_title (current)                                      │   │
│ │   • product_name                                                 │   │
│ │   • title                                                        │   │
│ │   • name                                                         │   │
│ └───────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  Context  Validation  Data Preview                                     │
│ ════════════════════════════════════════════════════════════════════    │
│                                                                          │
│ [Content continues below...]                                            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 8. Mobile View - Collapsed

```
┌──────────────────────┐
│ ┌────────┐           │
│ │Required│ ✓         │
│ └────────┘           │
│ ──────────────────── │
│ product_title        │
│        ↓             │
│ Title                │
│ ──────────────────── │
│ Sample: "Wireless    │
│ Bluetooth Head..."   │
│ ──────────────────── │
│ ✓ Resolved           │
│ 250 items            │
│ ──────────────────── │
│         [▼]          │
└──────────────────────┘
```

### 9. Mobile View - Bottom Sheet (Expanded)

```
┌──────────────────────┐
│ ════ (drag handle)   │
│                      │
│ Product Title    [✗] │
│ ──────────────────── │
│ product_title        │
│        ↓             │
│ title                │
│ ──────────────────── │
│                      │
│ <Swipe Tabs>        │
│ Context             │
│ ──────────────────── │
│                      │
│ WHY THIS FIELD       │
│ MATTERS              │
│                      │
│ [Scrollable content] │
│                      │
│                      │
│ ──────────────────── │
│ [Edit Mapping]       │
│ [Mark as Resolved]   │
└──────────────────────┘
```

## Interaction Flow Diagrams

### User Journey 1: Review and Resolve Valid Mapping

```
┌────────────┐
│  User sees │
│ collapsed  │──┐
│   card     │  │
└────────────┘  │
                │
        ┌───────▼────────┐
        │ Clicks to      │
        │ expand card    │
        └───────┬────────┘
                │
        ┌───────▼────────┐
        │ Reviews        │
        │ Context tab    │──┐ Understands field
        └────────────────┘  │ requirements
                            │
        ┌───────────────────▼─────────┐
        │ Switches to Validation tab  │
        │ Sees "All checks passed"    │
        └───────────┬─────────────────┘
                    │
        ┌───────────▼─────────────┐
        │ Switches to Data tab    │
        │ Reviews sample values   │
        └───────────┬─────────────┘
                    │
        ┌───────────▼─────────────┐
        │ Clicks "Mark as         │
        │ Resolved" button        │
        └───────────┬─────────────┘
                    │
        ┌───────────▼─────────────┐
        │ Card shows resolved     │
        │ state (green bg)        │
        └─────────────────────────┘
```

### User Journey 2: Fix Validation Error

```
┌────────────┐
│ User sees  │
│ error card │──┐ Red accent visible
│ (collapsed)│  │
└────────────┘  │
                │
        ┌───────▼────────┐
        │ Expands card   │
        │ to investigate │
        └───────┬────────┘
                │
        ┌───────▼────────┐
        │ Goes to        │
        │ Validation tab │──┐ Sees error messages
        └────────────────┘  │
                            │
        ┌───────────────────▼─────────┐
        │ Reads error: "Must include  │
        │ currency code"              │
        └───────────┬─────────────────┘
                    │
        ┌───────────▼─────────────┐
        │ Switches to Data tab    │
        │ to see actual values    │
        └───────────┬─────────────┘
                    │
        ┌───────────▼─────────────┐
        │ Understands the issue:  │
        │ wrong CSV column mapped │
        └───────────┬─────────────┘
                    │
        ┌───────────▼─────────────┐
        │ Clicks "Edit Mapping"   │
        └───────────┬─────────────┘
                    │
        ┌───────────▼─────────────┐
        │ Selects correct column  │
        │ from dropdown           │
        └───────────┬─────────────┘
                    │
        ┌───────────▼─────────────┐
        │ Clicks "Save"           │
        └───────────┬─────────────┘
                    │
        ┌───────────▼─────────────┐
        │ Validation re-runs      │
        │ automatically           │
        └───────────┬─────────────┘
                    │
        ┌───────────▼─────────────┐
        │ Error resolved, can now │
        │ mark as resolved        │
        └─────────────────────────┘
```

### User Journey 3: Bulk Resolve Multiple Fields

```
┌────────────┐
│ User sees  │
│ list of 20 │──┐
│ fields     │  │
└────────────┘  │
                │
        ┌───────▼────────┐
        │ Reviews few    │
        │ key fields     │──┐ Spot-checks critical
        └────────────────┘  │ fields individually
                            │
        ┌───────────────────▼─────────┐
        │ Notices many fields show    │
        │ "valid" status              │
        └───────────┬─────────────────┘
                    │
        ┌───────────▼─────────────┐
        │ Clicks "Resolve All     │
        │ Valid Mappings" button  │
        └───────────┬─────────────┘
                    │
        ┌───────────▼─────────────┐
        │ Confirmation modal:     │
        │ "Resolve 15 fields?"    │
        └───────────┬─────────────┘
                    │
        ┌───────────▼─────────────┐
        │ Confirms action         │
        └───────────┬─────────────┘
                    │
        ┌───────────▼─────────────┐
        │ Progress indicator      │
        │ shows: "15/15 resolved" │
        └───────────┬─────────────┘
                    │
        ┌───────────▼─────────────┐
        │ Only error/warning      │
        │ fields remain unresolved│
        └───────────┬─────────────┘
                    │
        ┌───────────▼─────────────┐
        │ User addresses          │
        │ remaining issues        │
        └─────────────────────────┘
```

## Animation Sequences

### Expand Animation

```
Frame 1 (0ms):     Collapsed state (80px height)
                   ┌─────────┐
                   │ Card    │
                   └─────────┘

Frame 2 (100ms):   Height expanding, content fading in
                   ┌─────────┐
                   │ Card    │
                   │         │ (opacity: 0.3)
                   │         │
                   └─────────┘

Frame 3 (200ms):   Nearly complete
                   ┌─────────┐
                   │ Card    │
                   │ Content │ (opacity: 0.7)
                   │ Visible │
                   │         │
                   └─────────┘

Frame 4 (300ms):   Fully expanded (auto height)
                   ┌─────────┐
                   │ Card    │
                   │ Content │ (opacity: 1.0)
                   │ Fully   │
                   │ Visible │
                   └─────────┘
```

### Tab Switch Animation

```
Frame 1:  [Context▼]  Validation  Data
          ════════
          Context content visible

Frame 2:  Context  [Validation▼]  Data
          Crossfade (150ms)
          ────────────════════

Frame 3:  Context  [Validation▼]  Data
                   ════════════
          Validation content visible
```

## Color Coding Guide

```
┌─ STATUS COLORS ─────────────────────────────────┐
│                                                  │
│ Required Field:      ███ #DC3545 (Red)         │
│ Recommended Field:   ███ #F39C12 (Orange)      │
│ Optional Field:      ███ #6C757D (Gray)        │
│                                                  │
│ Resolved Status:     ███ #28A745 (Green)       │
│ Error Status:        ███ #DC3545 (Red)         │
│ Warning Status:      ███ #FFC107 (Yellow)      │
│ Info Status:         ███ #17A2B8 (Cyan)        │
│                                                  │
│ Interactive:         ███ #0066CC (Blue)        │
│ Interactive Hover:   ███ #0052A3 (Dark Blue)   │
│                                                  │
└──────────────────────────────────────────────────┘
```

## Spacing System

```
┌─ SPACING SCALE ─────────────────────────────────┐
│                                                  │
│ xs:   4px   ▪                                   │
│ sm:   8px   ▪▪                                  │
│ md:  16px   ▪▪▪▪                                │
│ lg:  24px   ▪▪▪▪▪▪                              │
│ xl:  32px   ▪▪▪▪▪▪▪▪                            │
│                                                  │
│ Component Padding:    16px (md)                 │
│ Card Margin:          12px                      │
│ Section Spacing:      24px (lg)                 │
│ Element Gap:           8px (sm)                 │
│                                                  │
└──────────────────────────────────────────────────┘
```

## Typography Scale

```
┌─ TYPE SCALE ────────────────────────────────────┐
│                                                  │
│ H3 (Field Name):     20px / 28px / 600         │
│ H4 (Section):        14px / 20px / 600         │
│ Body:                14px / 20px / 400         │
│ Small:               12px / 16px / 400         │
│ Micro (Badge):       11px / 14px / 600         │
│                                                  │
│ Code (Monospace):    14px / Courier            │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

_These wireframes provide a comprehensive visual guide for implementing the FieldMappingCard component with proper spacing, typography, and interaction patterns._
