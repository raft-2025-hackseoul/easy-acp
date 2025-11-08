# Expandable Field Information Component - UI/UX Design Specification

## 1. Component Overview

The Expandable Field Information Component is a critical interface element in the ACP Product Feed Validator that provides contextual information about field mappings between CSV columns and ACP protocol fields. It serves as both an educational tool and a validation interface.

### Purpose

- Display field mapping relationships clearly
- Provide comprehensive field documentation on demand
- Enable users to validate and resolve mapping decisions
- Educate users about ACP protocol requirements

### User Goals

- Understand why each field is required
- Verify mapping correctness
- Learn ACP protocol specifications
- Quickly resolve validation issues

## 2. Component Structure

### 2.1 Container Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ FieldMappingCard                                             │
│ ┌───────────────────────────────────────────────────────────┤
│ │ CollapsedView (default)                                    │
│ │ ├── StatusIndicator                                        │
│ │ ├── MappingDisplay                                         │
│ │ ├── DataPreview                                            │
│ │ └── ExpandToggle                                           │
│ └───────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────────────────┤
│ │ ExpandedView (on interaction)                              │
│ │ ├── FieldHeader                                            │
│ │ ├── TabNavigation                                          │
│ │ ├── TabContent                                             │
│ │ │   ├── ContextTab                                         │
│ │ │   ├── ValidationTab                                      │
│ │ │   └── DataTab                                            │
│ │ └── ActionBar                                              │
│ └───────────────────────────────────────────────────────────┤
└─────────────────────────────────────────────────────────────┘
```

## 3. Visual States

### 3.1 Collapsed State (Default)

#### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ [■] Required  product_title → Title                        [▼]  │
│ ─────────────────────────────────────────────────────────────── │
│ Sample: "Wireless Bluetooth Headphones Pro Max..."              │
│ Status: ✓ Resolved | 250 products mapped                        │
└─────────────────────────────────────────────────────────────────┘
```

#### Visual Specifications

- **Height**: 80px (collapsed)
- **Background**:
  - Default: `#FFFFFF`
  - Hover: `#F8F9FA`
  - Resolved: `#F0FFF4`
- **Border**:
  - Required: 2px solid `#DC3545` (left border)
  - Recommended: 2px solid `#F39C12` (left border)
  - Optional: 2px solid `#6C757D` (left border)
- **Border Radius**: 8px
- **Padding**: 16px
- **Shadow**: `0 1px 3px rgba(0,0,0,0.08)`
- **Transition**: All properties 200ms ease-in-out

#### Status Indicators

- **Required Badge**:
  - Background: `#DC3545`
  - Text: `#FFFFFF`
  - Font: 11px, 600 weight, uppercase
- **Recommended Badge**:
  - Background: `#F39C12`
  - Text: `#FFFFFF`
- **Optional Badge**:
  - Background: `#6C757D`
  - Text: `#FFFFFF`

#### Resolution Status

- **Unresolved**:
  - Icon: ⚠️ Warning triangle
  - Color: `#FFC107`
- **Resolved**:
  - Icon: ✓ Check circle
  - Color: `#28A745`
- **Error**:
  - Icon: ✗ Error circle
  - Color: `#DC3545`

### 3.2 Expanded State

#### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ [■] Required                                               [✗]  │
│ ─────────────────────────────────────────────────────────────── │
│ Product Title (title)                                           │
│ CSV Column: product_title → ACP Field: title                    │
│                                                                  │
│ [Context] [Validation] [Data Preview]                          │
│ ─────────────────────────────────────────────────────────────── │
│                                                                  │
│ Why This Field Matters                                          │
│ The product title is the primary identifier shown to users in   │
│ ChatGPT search results. It directly impacts discoverability     │
│ and click-through rates.                                        │
│                                                                  │
│ ChatGPT Usage                                                   │
│ • Displayed as the main product name in search results         │
│ • Used for natural language matching                           │
│ • Indexed for semantic search                                  │
│                                                                  │
│ Requirements                                                    │
│ • Maximum 150 characters                                       │
│ • Plain text only (no HTML/markdown)                          │
│ • Must be unique within your catalog                          │
│                                                                  │
│ Good Example                                                    │
│ "Sony WH-1000XM4 Wireless Noise Canceling Headphones - Black"  │
│                                                                  │
│ ─────────────────────────────────────────────────────────────── │
│ [Edit Mapping] [Mark as Resolved]                              │
└─────────────────────────────────────────────────────────────────┘
```

#### Visual Specifications

- **Min Height**: 400px
- **Max Height**: 600px (scrollable content)
- **Background**: `#FFFFFF`
- **Animation**:
  - Expand: 300ms cubic-bezier(0.4, 0, 0.2, 1)
  - Content fade-in: 200ms ease-in (50ms delay)

## 4. Interaction Patterns

### 4.1 Expand/Collapse Behavior

#### Trigger Methods

1. **Click**: Anywhere on collapsed card (except action buttons)
2. **Keyboard**: Enter or Space when focused
3. **Touch**: Single tap on mobile

#### Animation Sequence

1. Height expansion (300ms)
2. Content fade-in (200ms, 50ms delay)
3. Focus management to first interactive element

### 4.2 Tab Navigation

#### Tab Structure

- **Context Tab** (Default)
  - Official ACP documentation
  - ChatGPT usage explanation
  - Business value proposition

- **Validation Tab**
  - Current validation status
  - Error messages with line numbers
  - Fix suggestions

- **Data Preview Tab**
  - First 10 sample values
  - Data type analysis
  - Coverage statistics

#### Tab Interaction

- Click or keyboard navigation (Arrow keys)
- Underline animation on active tab
- Content transition: Fade (150ms)

### 4.3 Action Buttons

#### "Mark as Resolved"

- **State Change**: Updates visual indicator immediately
- **Feedback**: Success toast notification
- **Keyboard**: Alt+R shortcut
- **Disabled When**: No valid mapping exists

#### "Edit Mapping"

- **Behavior**: Opens inline dropdown selector
- **Options**: All available CSV columns
- **Keyboard**: Alt+E shortcut

### 4.4 Bulk Actions

#### "Resolve All Valid"

- **Position**: Fixed action bar at bottom
- **Behavior**: Resolves all fields with confidence > 80%
- **Confirmation**: Modal dialog for > 10 fields
- **Feedback**: Progress indicator with count

## 5. Information Architecture

### 5.1 Content Hierarchy

```
Primary Information (Always Visible)
├── Field Status (Required/Recommended/Optional)
├── Mapping Relationship (CSV → ACP)
├── Resolution Status
└── Data Sample

Secondary Information (Expanded View)
├── Context Tab
│   ├── Purpose Statement
│   ├── ChatGPT Usage
│   ├── Business Impact
│   └── Best Practices
├── Validation Tab
│   ├── Validation Rules
│   ├── Current Errors
│   ├── Warning Messages
│   └── Fix Suggestions
└── Data Tab
    ├── Sample Values
    ├── Data Statistics
    ├── Type Analysis
    └── Coverage Report
```

### 5.2 Content Guidelines

#### Field Descriptions

- **Length**: 50-100 words
- **Tone**: Clear, educational, action-oriented
- **Structure**: What, Why, How

#### Error Messages

- **Format**: "[Issue]: [Specific problem]. [Solution]"
- **Example**: "Invalid format: Price must include currency code. Add 'USD' after the numeric value."

#### Examples

- **Good Example**: Show ideal format
- **Bad Example**: Common mistake (when helpful)
- **Your Data**: Actual value from CSV

## 6. Responsive Design

### 6.1 Breakpoints

#### Desktop (≥1024px)

- Full layout with all features
- Side-by-side mapping display
- 3-column grid for multiple cards

#### Tablet (768px - 1023px)

- 2-column grid
- Condensed tab labels
- Touch-optimized tap targets (44px minimum)

#### Mobile (< 768px)

- Single column layout
- Stacked mapping display (CSV above, ACP below)
- Bottom sheet pattern for expanded view
- Swipe gestures for tab navigation

### 6.2 Mobile-Specific Adaptations

```
Mobile Collapsed View:
┌──────────────────────┐
│ [■] Title           │
│ product_title        │
│ ↓                    │
│ title                │
│ ──────────────────── │
│ "Wireless Head..."   │
│ ✓ Resolved           │
└──────────────────────┘

Mobile Expanded (Bottom Sheet):
┌──────────────────────┐
│ ━━━━━                │ (Drag handle)
│ Product Title        │
│ [✗]                  │
│ ──────────────────── │
│ [Scrollable Content] │
│                      │
│                      │
│ [Actions]           │
└──────────────────────┘
```

## 7. Accessibility Requirements

### 7.1 WCAG 2.1 AA Compliance

#### Keyboard Navigation

- **Tab Order**: Logical flow through all interactive elements
- **Focus Indicators**: 2px solid outline, 2px offset
- **Shortcuts**:
  - `Enter/Space`: Expand/collapse
  - `Escape`: Collapse expanded card
  - `Tab`: Navigate between cards
  - `Arrow Keys`: Navigate tabs

#### Screen Reader Support

- **ARIA Labels**: All interactive elements
- **ARIA Expanded**: State announcement
- **ARIA Describedby**: Link descriptions to fields
- **Live Regions**: Status changes announced

#### Visual Accessibility

- **Color Contrast**:
  - Normal text: 4.5:1 minimum
  - Large text: 3:1 minimum
  - Interactive elements: 3:1 minimum
- **Focus Indicators**: Never rely on color alone
- **Text Scaling**: Support up to 200% zoom

### 7.2 Motion Accessibility

#### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  /* Instant transitions */
  /* No animations */
  /* Maintain state changes */
}
```

## 8. Performance Specifications

### 8.1 Rendering Performance

#### Initial Load

- **Target**: < 100ms for 50 fields
- **Strategy**: Virtual scrolling for > 20 fields
- **Lazy Loading**: Expand content loaded on demand

#### Interaction Response

- **Expand/Collapse**: < 16ms (60fps)
- **Tab Switch**: < 50ms
- **Data Preview Load**: < 200ms

### 8.2 Memory Management

#### Optimization Strategies

- Virtual DOM for large lists
- Debounced search in dropdowns
- Memoized computed values
- Cleanup on unmount

## 9. Component API Structure

### 9.1 TypeScript Interfaces

```typescript
interface FieldMappingCardProps {
  field: ACPFieldMetadata;
  mapping: {
    csvColumn: string;
    acpField: string;
    confidence: number;
    sampleData: string[];
  };
  validation: {
    status: 'valid' | 'warning' | 'error';
    messages: ValidationMessage[];
  };
  resolution: {
    isResolved: boolean;
    resolvedBy?: string;
    resolvedAt?: Date;
  };
  onResolve: (fieldName: string) => void;
  onEditMapping: (fieldName: string, newColumn: string) => void;
  onExpand?: (fieldName: string) => void;
}

interface ValidationMessage {
  type: 'error' | 'warning' | 'info';
  message: string;
  line?: number;
  suggestion?: string;
}

interface ACPFieldMetadata {
  name: string;
  label: string;
  required: boolean;
  category: 'core' | 'recommended' | 'optional';
  type: string;
  description: string;
  example: string;
  chatgptUsage?: string;
  validationRules?: ValidationRule[];
  bestPractices?: string[];
}
```

## 10. Visual Design System

### 10.1 Color Palette

```scss
// Status Colors
$required: #dc3545;
$recommended: #f39c12;
$optional: #6c757d;
$resolved: #28a745;
$error: #dc3545;
$warning: #ffc107;

// UI Colors
$background: #ffffff;
$surface: #f8f9fa;
$border: #dee2e6;
$text-primary: #212529;
$text-secondary: #6c757d;
$interactive: #0066cc;
$interactive-hover: #0052a3;
```

### 10.2 Typography

```scss
// Font Stack
$font-family:
  -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
$font-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Courier New', monospace;

// Type Scale
$heading-1: 24px/32px;
$heading-2: 20px/28px;
$heading-3: 18px/24px;
$body: 14px/20px;
$small: 12px/16px;
$micro: 11px/14px;
```

### 10.3 Spacing System

```scss
// Base unit: 4px
$space-xs: 4px;
$space-sm: 8px;
$space-md: 16px;
$space-lg: 24px;
$space-xl: 32px;
$space-2xl: 48px;
```

## 11. Implementation Examples

### 11.1 React Component Structure

```tsx
// FieldMappingCard.tsx
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './FieldMappingCard.css';

export const FieldMappingCard: React.FC<FieldMappingCardProps> = ({
  field,
  mapping,
  validation,
  resolution,
  onResolve,
  onEditMapping,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'context' | 'validation' | 'data'>('context');

  const handleToggle = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleResolve = useCallback(() => {
    onResolve(field.name);
  }, [field.name, onResolve]);

  return (
    <motion.div
      className={`field-mapping-card ${field.category} ${resolution.isResolved ? 'resolved' : ''}`}
      layout
      initial={false}
      animate={{ height: isExpanded ? 'auto' : 80 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      <CollapsedView
        field={field}
        mapping={mapping}
        resolution={resolution}
        onToggle={handleToggle}
        isExpanded={isExpanded}
      />

      <AnimatePresence>
        {isExpanded && (
          <ExpandedView
            field={field}
            mapping={mapping}
            validation={validation}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onResolve={handleResolve}
            onEditMapping={onEditMapping}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
```

### 11.2 CSS Implementation

```css
/* FieldMappingCard.css */
.field-mapping-card {
  position: relative;
  background: var(--color-background);
  border-radius: 8px;
  border-left: 3px solid transparent;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: all 200ms ease-in-out;
  overflow: hidden;
  margin-bottom: 12px;
}

.field-mapping-card.core {
  border-left-color: var(--color-required);
}

.field-mapping-card.recommended {
  border-left-color: var(--color-recommended);
}

.field-mapping-card.optional {
  border-left-color: var(--color-optional);
}

.field-mapping-card.resolved {
  background: var(--color-resolved-bg);
}

.field-mapping-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  cursor: pointer;
}

.field-mapping-card:focus-within {
  outline: 2px solid var(--color-interactive);
  outline-offset: 2px;
}

/* Collapsed View */
.collapsed-view {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 16px;
  padding: 16px;
  min-height: 80px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: white;
}

.status-badge.required {
  background: var(--color-required);
}

.mapping-display {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: var(--font-mono);
  font-size: 14px;
  color: var(--color-text-primary);
}

.mapping-arrow {
  color: var(--color-text-secondary);
  font-size: 18px;
}

.data-preview {
  font-size: 12px;
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 300px;
}

.expand-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: transform 200ms ease;
}

.expand-toggle[aria-expanded='true'] {
  transform: rotate(180deg);
}

/* Expanded View */
.expanded-view {
  padding: 0 16px 16px;
  animation: fadeIn 200ms ease-in-out 50ms both;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tab-navigation {
  display: flex;
  gap: 24px;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 16px;
}

.tab-button {
  background: none;
  border: none;
  padding: 8px 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  position: relative;
  transition: color 150ms ease;
}

.tab-button:hover {
  color: var(--color-text-primary);
}

.tab-button.active {
  color: var(--color-interactive);
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--color-interactive);
  animation: slideIn 200ms ease;
}

@keyframes slideIn {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

.tab-content {
  min-height: 200px;
  max-height: 400px;
  overflow-y: auto;
  padding: 16px 0;
}

.action-bar {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}

.action-button {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms ease;
}

.action-button.primary {
  background: var(--color-interactive);
  color: white;
  border: none;
}

.action-button.primary:hover {
  background: var(--color-interactive-hover);
}

.action-button.secondary {
  background: transparent;
  color: var(--color-interactive);
  border: 1px solid var(--color-interactive);
}

.action-button.secondary:hover {
  background: var(--color-interactive);
  color: white;
}

/* Mobile Adaptations */
@media (max-width: 768px) {
  .collapsed-view {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .mapping-display {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .mapping-arrow {
    transform: rotate(90deg);
    align-self: center;
  }

  .expanded-view {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    border-radius: 16px 16px 0 0;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
    padding: 24px 16px;
    max-height: 80vh;
    overflow-y: auto;
    z-index: 1000;
  }

  .drag-handle {
    width: 40px;
    height: 4px;
    background: var(--color-border);
    border-radius: 2px;
    margin: 0 auto 16px;
  }
}

/* Accessibility: Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .field-mapping-card,
  .expand-toggle,
  .tab-button,
  .action-button {
    transition: none;
  }

  .expanded-view {
    animation: none;
  }

  .tab-button.active::after {
    animation: none;
  }
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
  .field-mapping-card {
    border: 2px solid currentColor;
  }

  .status-badge {
    border: 1px solid currentColor;
  }

  .action-button {
    border: 2px solid currentColor;
  }
}
```

## 12. Testing Scenarios

### 12.1 Functional Tests

1. **Expand/Collapse**
   - Click to expand
   - Keyboard navigation
   - Multiple cards expanded simultaneously
   - Animation completion

2. **Tab Navigation**
   - Tab switching
   - Content loading
   - Keyboard navigation between tabs

3. **Resolution Flow**
   - Mark as resolved
   - Bulk resolve
   - Persistence after page refresh

4. **Edit Mapping**
   - Dropdown population
   - Selection persistence
   - Validation trigger

### 12.2 Accessibility Tests

1. **Screen Reader**
   - Announcement of state changes
   - Tab content reading
   - Action button labels

2. **Keyboard Only**
   - Full navigation without mouse
   - Focus management
   - Escape to close

3. **Visual**
   - 200% zoom support
   - High contrast mode
   - Color blind safe

### 12.3 Performance Tests

1. **Load Performance**
   - 50 fields render < 100ms
   - 100 fields with virtual scrolling
   - Memory usage stable

2. **Interaction Performance**
   - 60fps animations
   - No jank on expand
   - Smooth scrolling

## 13. Future Enhancements

### Phase 2 Features

- AI-powered mapping suggestions
- Inline editing of sample data
- Custom validation rule creation
- Mapping templates and presets

### Phase 3 Features

- Collaborative resolution (multi-user)
- Version history for mappings
- Advanced filtering and search
- Export mapping configurations

## 14. Implementation Checklist

### Development Tasks

- [ ] Create base component structure
- [ ] Implement collapsed view
- [ ] Implement expanded view with tabs
- [ ] Add animation system
- [ ] Create responsive layouts
- [ ] Implement accessibility features
- [ ] Add keyboard navigation
- [ ] Create action handlers
- [ ] Implement virtual scrolling
- [ ] Add testing suite

### Design Assets Needed

- [ ] Icon set (status, actions, navigation)
- [ ] Loading states
- [ ] Empty states
- [ ] Error illustrations
- [ ] Success animations

### Documentation Required

- [ ] Component usage guide
- [ ] Accessibility documentation
- [ ] Performance benchmarks
- [ ] Integration examples

---

## Appendix A: Mock Data Structure

```json
{
  "fieldMapping": {
    "field": {
      "name": "title",
      "label": "Product Title",
      "required": true,
      "category": "core",
      "type": "string",
      "description": "Product title - max 150 characters",
      "example": "Wireless Bluetooth Headphones Pro Max",
      "chatgptUsage": "Primary display name in search results",
      "validationRules": [
        {
          "rule": "maxLength",
          "value": 150,
          "message": "Title must be 150 characters or less"
        },
        {
          "rule": "required",
          "message": "Title is required"
        }
      ],
      "bestPractices": [
        "Include brand name for recognition",
        "Add key product features",
        "Avoid excessive capitalization"
      ]
    },
    "mapping": {
      "csvColumn": "product_title",
      "acpField": "title",
      "confidence": 0.95,
      "sampleData": [
        "Wireless Bluetooth Headphones Pro Max - Black",
        "Premium Noise Canceling Earbuds - White",
        "Gaming Headset with RGB Lighting"
      ]
    },
    "validation": {
      "status": "valid",
      "messages": []
    },
    "resolution": {
      "isResolved": false,
      "resolvedBy": null,
      "resolvedAt": null
    }
  }
}
```

## Appendix B: Component Usage Example

```tsx
import { FieldMappingCard } from './components/FieldMappingCard';
import { useFieldMappings } from './hooks/useFieldMappings';

function FieldMappingView() {
  const { mappings, updateMapping, resolveField } = useFieldMappings();

  return (
    <div className="field-mapping-container">
      <div className="mapping-header">
        <h2>Field Mappings</h2>
        <button onClick={resolveAllValid}>Resolve All Valid Mappings</button>
      </div>

      <div className="mapping-grid">
        {mappings.map((mapping) => (
          <FieldMappingCard
            key={mapping.field.name}
            field={mapping.field}
            mapping={mapping.mapping}
            validation={mapping.validation}
            resolution={mapping.resolution}
            onResolve={resolveField}
            onEditMapping={updateMapping}
          />
        ))}
      </div>
    </div>
  );
}
```

---

_This specification document provides comprehensive guidance for implementing the Expandable Field Information Component. All measurements, colors, and interactions have been designed to create an intuitive, accessible, and performant user experience._
