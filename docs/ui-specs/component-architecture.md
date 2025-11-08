# FieldMappingCard Component Architecture

## Component Hierarchy

```
FieldMappingCard (Main Container)
│
├── CollapsedView (Default State)
│   ├── StatusIndicator
│   │   ├── StatusBadge (Required/Recommended/Optional)
│   │   └── ResolutionIcon (✓/○/✗/⚠)
│   │
│   ├── MappingDisplay
│   │   ├── CSVColumn (code element)
│   │   ├── MappingArrow (→)
│   │   └── ACPField (code element)
│   │
│   ├── DataInfo
│   │   ├── DataPreview (sample text)
│   │   └── MappingStats
│   │       ├── ResolutionLabel
│   │       └── DataCount
│   │
│   └── ExpandToggle (button with chevron)
│
└── ExpandedView (AnimatePresence wrapper)
    ├── ExpandedHeader
    │   ├── FieldInfo
    │   │   ├── FieldTitle (h3)
    │   │   └── FieldName (code)
    │   └── CloseButton
    │
    ├── MappingInfo
    │   ├── CurrentMapping (display mode)
    │   │   └── MappingText
    │   └── MappingEditor (edit mode)
    │       ├── ColumnSelector (dropdown)
    │       ├── SaveButton
    │       └── CancelButton
    │
    ├── TabNavigation
    │   ├── ContextTab (button)
    │   ├── ValidationTab (button)
    │   └── DataTab (button)
    │
    ├── TabContent (conditional render)
    │   ├── ContextPanel
    │   │   ├── WhyItMatters (section)
    │   │   ├── ChatGPTUsage (section)
    │   │   ├── Requirements (list)
    │   │   ├── GoodExample (code block)
    │   │   └── BestPractices (list)
    │   │
    │   ├── ValidationPanel
    │   │   ├── ValidationStatus (colored box)
    │   │   ├── ValidationMessages
    │   │   │   └── ValidationMessage[]
    │   │   │       ├── MessageIcon
    │   │   │       ├── MessageText
    │   │   │       ├── MessageLine
    │   │   │       └── MessageSuggestion
    │   │   └── ConfidenceInfo
    │   │       ├── ConfidenceMeter
    │   │       └── ConfidenceText
    │   │
    │   └── DataPanel
    │       ├── SampleValues (section)
    │       │   └── SampleValue[]
    │       │       ├── SampleIndex
    │       │       └── SampleText
    │       └── DataAnalysis (section)
    │           └── DataStats (grid)
    │               ├── DataType (stat)
    │               ├── Coverage (stat)
    │               ├── UniqueValues (stat)
    │               ├── TotalRecords (stat)
    │               └── EmptyValues (stat)
    │
    └── ActionBar
        ├── EditMappingButton
        └── ResolveButton
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         Parent Component                         │
│                                                                  │
│  State:                                                          │
│  - fieldMappings: Record<string, FieldMapping>                  │
│  - resolutions: Record<string, FieldResolution>                 │
│  - validations: Record<string, FieldValidation>                 │
│                                                                  │
└───────────────────┬─────────────────────────────────────────────┘
                    │
        ┌───────────▼──────────────┐
        │  Props passed down:      │
        │  - field                 │
        │  - mapping               │
        │  - validation            │
        │  - resolution            │
        │  - onResolve             │
        │  - onEditMapping         │
        └───────────┬──────────────┘
                    │
        ┌───────────▼──────────────┐
        │   FieldMappingCard       │
        │                          │
        │  Local State:            │
        │  - isExpanded: boolean   │
        │  - activeTab: TabType    │
        │  - isEditing: boolean    │
        │  - selectedColumn: str   │
        │                          │
        └───────────┬──────────────┘
                    │
        ┌───────────▼──────────────┐
        │  User Interactions:      │
        │  - Click to expand       │───┐
        │  - Switch tabs           │   │
        │  - Edit mapping          │   │
        │  - Mark as resolved      │   │
        └──────────────────────────┘   │
                                       │
        ┌──────────────────────────────▼────────────────────┐
        │  Callbacks fire:                                   │
        │  - onExpand(fieldName)                            │
        │  - onEditMapping(fieldName, newColumn)            │
        │  - onResolve(fieldName)                           │
        └──────────────────────────────┬────────────────────┘
                                       │
        ┌──────────────────────────────▼────────────────────┐
        │  Parent updates state:                             │
        │  - Update mapping                                  │
        │  - Update resolution                               │
        │  - Trigger validation re-run                       │
        └──────────────────────────────┬────────────────────┘
                                       │
        ┌──────────────────────────────▼────────────────────┐
        │  React re-renders with new props                   │
        │  Component reflects updated state                  │
        └────────────────────────────────────────────────────┘
```

## State Management

```
┌─ Component Internal State ──────────────────────────────────────┐
│                                                                  │
│  const [isExpanded, setIsExpanded] = useState(false);          │
│    └─ Controls collapsed/expanded view                         │
│                                                                  │
│  const [activeTab, setActiveTab] = useState<TabType>('context');│
│    └─ Controls which tab is displayed                          │
│                                                                  │
│  const [isEditingMapping, setIsEditingMapping] = useState(false);│
│    └─ Controls edit mode for mapping                           │
│                                                                  │
│  const [selectedColumn, setSelectedColumn] = useState(string);  │
│    └─ Temporary state for column selection                     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

┌─ Parent/External State ──────────────────────────────────────────┐
│                                                                  │
│  Field Metadata (from ACP_FIELDS)                               │
│    └─ Static reference data                                     │
│                                                                  │
│  Mapping Data (from CSV analysis)                               │
│    └─ csvColumn, confidence, sampleData                         │
│                                                                  │
│  Validation Results (from validation engine)                    │
│    └─ status, messages                                          │
│                                                                  │
│  Resolution State (from user actions)                           │
│    └─ isResolved, resolvedBy, resolvedAt                        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Event Flow

```
User Action                Component Handler              Parent Callback
═══════════════            ═════════════════              ═══════════════

Click Card
    │
    └──▶ handleToggle()
            │
            └──▶ setIsExpanded(!isExpanded)
                    │
                    └──▶ onExpand?.(fieldName)


Click Tab
    │
    └──▶ handleTabChange(tab)
            │
            └──▶ setActiveTab(tab)


Click "Edit Mapping"
    │
    └──▶ handleEditMapping()
            │
            └──▶ setIsEditingMapping(true)


Select New Column
    │
    └──▶ handleColumnChange(e)
            │
            └──▶ setSelectedColumn(e.target.value)


Click "Save"
    │
    └──▶ handleSaveMapping()
            │
            ├──▶ onEditMapping(fieldName, selectedColumn)
            │
            └──▶ setIsEditingMapping(false)


Click "Mark as Resolved"
    │
    └──▶ handleResolve()
            │
            └──▶ onResolve(fieldName)


Press Escape Key
    │
    └──▶ useEffect keyboard handler
            │
            └──▶ setIsExpanded(false)
```

## Rendering Logic

```typescript
// Simplified rendering logic

function FieldMappingCard(props) {
  // 1. Derive visual classes
  const categoryClass = field.required ? 'core' :
                       field.category === 'recommended' ? 'recommended' :
                       'optional';

  const statusClass = validation.status;

  const resolvedClass = resolution.isResolved ? 'resolved' : '';

  // 2. Render container with classes
  return (
    <motion.div className={`field-mapping-card ${categoryClass} ${resolvedClass} ${statusClass}`}>

      {/* Always render collapsed view */}
      <CollapsedView ... />

      {/* Conditionally render expanded view */}
      <AnimatePresence>
        {isExpanded && (
          <ExpandedView>
            {/* Conditionally render active tab content */}
            {activeTab === 'context' && <ContextTab ... />}
            {activeTab === 'validation' && <ValidationTab ... />}
            {activeTab === 'data' && <DataTab ... />}
          </ExpandedView>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
```

## CSS Architecture

```
┌─ CSS Custom Properties (Theme) ──────────────────────────────────┐
│                                                                   │
│  :root {                                                          │
│    --color-required: #DC3545;                                    │
│    --color-recommended: #F39C12;                                 │
│    --color-optional: #6C757D;                                    │
│    --transition-smooth: 300ms cubic-bezier(0.4, 0, 0.2, 1);    │
│    /* ... more variables */                                      │
│  }                                                                │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
           │
           │ Applied to
           ▼
┌─ Component Classes ───────────────────────────────────────────────┐
│                                                                   │
│  .field-mapping-card { }          /* Base container */           │
│    .field-mapping-card.core { }  /* Required styling */          │
│    .field-mapping-card.recommended { } /* Recommended */         │
│    .field-mapping-card.optional { }  /* Optional */              │
│    .field-mapping-card.resolved { } /* Resolved state */         │
│    .field-mapping-card.error { }   /* Error state */             │
│                                                                   │
│  .collapsed-view { }              /* Collapsed container */      │
│    .status-indicator { }                                         │
│    .mapping-display { }                                          │
│    .data-info { }                                                │
│                                                                   │
│  .expanded-view { }               /* Expanded container */       │
│    .expanded-header { }                                          │
│    .tab-navigation { }                                           │
│    .tab-content { }                                              │
│    .action-bar { }                                               │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
           │
           │ Enhanced by
           ▼
┌─ Media Queries ───────────────────────────────────────────────────┐
│                                                                   │
│  @media (max-width: 768px) { }    /* Mobile styles */           │
│  @media (min-width: 768px) and (max-width: 1023px) { }          │
│                                    /* Tablet styles */           │
│  @media (prefers-reduced-motion: reduce) { }                    │
│                                    /* Accessibility */           │
│  @media (prefers-color-scheme: dark) { }                        │
│                                    /* Dark mode */               │
│  @media (prefers-contrast: high) { }                            │
│                                    /* High contrast */           │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

## Animation System

```
┌─ Expand Animation ────────────────────────────────────────────────┐
│                                                                   │
│  Component State:                                                 │
│  isExpanded: false → true                                        │
│                                                                   │
│  motion.div:                                                      │
│    initial={false}                                               │
│    animate={{ height: 'auto' }}                                 │
│    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}      │
│                                                                   │
│  ExpandedView:                                                    │
│    initial={{ opacity: 0, y: -8 }}                              │
│    animate={{ opacity: 1, y: 0 }}                               │
│    exit={{ opacity: 0, y: -8 }}                                 │
│    transition={{ duration: 0.2, delay: 0.05 }}                  │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘

┌─ Tab Switch Animation ────────────────────────────────────────────┐
│                                                                   │
│  State Change:                                                    │
│  activeTab: 'context' → 'validation'                             │
│                                                                   │
│  CSS Animation:                                                   │
│    .tab-button.active::after {                                   │
│      animation: slideIn 200ms;                                   │
│    }                                                              │
│                                                                   │
│  Content:                                                         │
│    .tab-panel {                                                   │
│      animation: fadeInTab 150ms;                                 │
│    }                                                              │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

## Performance Optimizations

```
┌─ React Optimizations ─────────────────────────────────────────────┐
│                                                                   │
│  useCallback:                                                     │
│    ├─ handleToggle() - Prevents re-creation                      │
│    ├─ handleResolve() - Stable reference                         │
│    └─ handleEditMapping() - Memoized callback                    │
│                                                                   │
│  useMemo (potential):                                             │
│    ├─ Computed statistics                                        │
│    ├─ Filtered sample data                                       │
│    └─ Formatted display values                                   │
│                                                                   │
│  React.memo (sub-components):                                     │
│    ├─ CollapsedView                                              │
│    ├─ ContextTab                                                 │
│    ├─ ValidationTab                                              │
│    └─ DataTab                                                     │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘

┌─ Lazy Loading ────────────────────────────────────────────────────┐
│                                                                   │
│  AnimatePresence:                                                 │
│    └─ ExpandedView only rendered when isExpanded=true           │
│                                                                   │
│  Conditional Rendering:                                           │
│    ├─ Tab content rendered only for activeTab                    │
│    └─ Large sample data lists truncated                          │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘

┌─ Virtual Scrolling (Future) ──────────────────────────────────────┐
│                                                                   │
│  For lists with 50+ fields:                                      │
│    ├─ Use react-window or react-virtual                          │
│    ├─ Render only visible cards                                  │
│    └─ Dramatically reduce DOM nodes                              │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

## Type System

```typescript
┌─ Core Interfaces ─────────────────────────────────────────────────┐
│                                                                   │
│  ACPFieldMetadata (from @easy-acp/acp-types)                     │
│    ├─ name: string                                               │
│    ├─ label: string                                              │
│    ├─ required: boolean                                          │
│    ├─ category: 'core' | 'recommended' | 'optional'             │
│    ├─ type: string                                               │
│    ├─ description: string                                        │
│    ├─ example: string                                            │
│    └─ enumValues?: string[]                                      │
│                                                                   │
│  Extended for Component:                                          │
│    ├─ chatgptUsage?: string                                      │
│    ├─ validationRules?: ValidationRule[]                         │
│    └─ bestPractices?: string[]                                   │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘

┌─ Component Props ─────────────────────────────────────────────────┐
│                                                                   │
│  FieldMappingCardProps {                                          │
│    field: ACPFieldMetadata & Extensions;                         │
│    mapping: FieldMapping;                                        │
│    validation: FieldValidation;                                  │
│    resolution: FieldResolution;                                  │
│    availableColumns?: string[];                                  │
│    onResolve: (fieldName: string) => void;                       │
│    onEditMapping: (field: string, col: string) => void;         │
│    onExpand?: (fieldName: string) => void;                       │
│  }                                                                │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘

┌─ Supporting Types ────────────────────────────────────────────────┐
│                                                                   │
│  FieldMapping {                                                   │
│    csvColumn: string;                                            │
│    acpField: string;                                             │
│    confidence: number;                                           │
│    sampleData: string[];                                         │
│    dataType?: string;                                            │
│    uniqueValues?: number;                                        │
│    nullCount?: number;                                           │
│    totalCount?: number;                                          │
│  }                                                                │
│                                                                   │
│  FieldValidation {                                                │
│    status: 'valid' | 'warning' | 'error';                       │
│    messages: ValidationMessage[];                                │
│  }                                                                │
│                                                                   │
│  ValidationMessage {                                              │
│    type: 'error' | 'warning' | 'info';                          │
│    message: string;                                              │
│    line?: number;                                                │
│    suggestion?: string;                                          │
│  }                                                                │
│                                                                   │
│  FieldResolution {                                                │
│    isResolved: boolean;                                          │
│    resolvedBy?: string;                                          │
│    resolvedAt?: Date;                                            │
│  }                                                                │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

## Integration Points

```
┌─ External Dependencies ───────────────────────────────────────────┐
│                                                                   │
│  React (>=18.0)                                                   │
│    └─ Core framework                                             │
│                                                                   │
│  framer-motion                                                    │
│    ├─ motion.div for animations                                  │
│    └─ AnimatePresence for conditional rendering                  │
│                                                                   │
│  @easy-acp/acp-types                                             │
│    ├─ ACPFieldMetadata interface                                 │
│    └─ ACP_FIELDS reference data                                  │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘

┌─ Parent Component Integration ────────────────────────────────────┐
│                                                                   │
│  CSV Upload & Processing                                          │
│    └─ Provides: sample data, column names                        │
│                                                                   │
│  Mapping Engine                                                   │
│    └─ Provides: confidence scores, suggested mappings            │
│                                                                   │
│  Validation Engine                                                │
│    └─ Provides: validation status, error messages                │
│                                                                   │
│  State Management                                                 │
│    └─ Manages: resolutions, edited mappings                      │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

This architecture diagram provides a comprehensive technical overview of the FieldMappingCard component's structure, data flow, and integration points.
