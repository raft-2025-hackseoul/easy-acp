# FieldMappingCard Component

An expandable, accessible card component for displaying and managing ACP (Agent Commerce Protocol) field mappings in the product feed validator.

## Overview

The FieldMappingCard component provides a comprehensive interface for users to:

- View field mapping relationships between CSV columns and ACP fields
- Understand field requirements and usage in ChatGPT
- Validate data quality and fix issues
- Mark mappings as resolved after review

## Features

- **Expandable Interface**: Click to expand/collapse detailed information
- **Tabbed Content**: Context, Validation, and Data Preview tabs
- **Visual Status Indicators**: Required/Recommended/Optional badges
- **Validation Feedback**: Clear error and warning messages
- **Data Preview**: Sample data with statistics
- **Inline Editing**: Change column mappings without leaving the card
- **Keyboard Navigation**: Full keyboard accessibility support
- **Mobile Responsive**: Optimized for all screen sizes
- **Animation**: Smooth transitions and animations

## Installation

```bash
# The component is part of the @easy-acp/web package
npm install @easy-acp/acp-types framer-motion
```

## Basic Usage

```tsx
import { FieldMappingCard } from '@/components/FieldMappingCard';
import type { FieldMappingCardProps } from '@/components/FieldMappingCard';
import { ACP_FIELDS } from '@easy-acp/acp-types';

function MyComponent() {
  const handleResolve = (fieldName: string) => {
    console.log('Field resolved:', fieldName);
  };

  const handleEditMapping = (fieldName: string, newColumn: string) => {
    console.log('Mapping updated:', fieldName, '->', newColumn);
  };

  return (
    <FieldMappingCard
      field={ACP_FIELDS.find((f) => f.name === 'title')}
      mapping={{
        csvColumn: 'product_title',
        acpField: 'title',
        confidence: 0.95,
        sampleData: ['Product 1', 'Product 2', 'Product 3'],
        totalCount: 250,
      }}
      validation={{
        status: 'valid',
        messages: [],
      }}
      resolution={{
        isResolved: false,
      }}
      availableColumns={['product_title', 'title', 'name']}
      onResolve={handleResolve}
      onEditMapping={handleEditMapping}
    />
  );
}
```

## Props

### Required Props

| Prop            | Type                                             | Description                               |
| --------------- | ------------------------------------------------ | ----------------------------------------- |
| `field`         | `ACPFieldMetadata`                               | ACP field metadata with optional context  |
| `mapping`       | `FieldMapping`                                   | Field mapping information                 |
| `validation`    | `FieldValidation`                                | Validation status and messages            |
| `resolution`    | `FieldResolution`                                | Resolution state                          |
| `onResolve`     | `(fieldName: string) => void`                    | Callback when field is marked as resolved |
| `onEditMapping` | `(fieldName: string, newColumn: string) => void` | Callback when mapping is edited           |

### Optional Props

| Prop               | Type                          | Description                       |
| ------------------ | ----------------------------- | --------------------------------- |
| `availableColumns` | `string[]`                    | Available CSV columns for mapping |
| `onExpand`         | `(fieldName: string) => void` | Callback when card is expanded    |

## Type Definitions

```typescript
interface FieldMapping {
  csvColumn: string;
  acpField: string;
  confidence: number;
  sampleData: string[];
  dataType?: string;
  uniqueValues?: number;
  nullCount?: number;
  totalCount?: number;
}

interface FieldValidation {
  status: 'valid' | 'warning' | 'error';
  messages: ValidationMessage[];
}

interface ValidationMessage {
  type: 'error' | 'warning' | 'info';
  message: string;
  line?: number;
  suggestion?: string;
}

interface FieldResolution {
  isResolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
}
```

## Examples

### Required Field with Valid Data

```tsx
<FieldMappingCard
  field={{
    ...ACP_FIELDS.find((f) => f.name === 'title'),
    chatgptUsage: 'Primary display name in search results',
    bestPractices: ['Include brand name', 'Add key features', 'Keep concise'],
  }}
  mapping={{
    csvColumn: 'product_title',
    acpField: 'title',
    confidence: 0.95,
    sampleData: [
      'Wireless Bluetooth Headphones - Black',
      'Premium Noise Canceling Earbuds - White',
    ],
    totalCount: 250,
  }}
  validation={{ status: 'valid', messages: [] }}
  resolution={{ isResolved: false }}
  onResolve={handleResolve}
  onEditMapping={handleEditMapping}
/>
```

### Field with Validation Errors

```tsx
<FieldMappingCard
  field={priceField}
  mapping={{
    csvColumn: 'price',
    acpField: 'price',
    confidence: 0.87,
    sampleData: ['99.99', '$79.99', 'N/A'],
    totalCount: 250,
  }}
  validation={{
    status: 'error',
    messages: [
      {
        type: 'error',
        message: 'Price must include currency code',
        line: 2,
        suggestion: 'Add "USD" after the price',
      },
    ],
  }}
  resolution={{ isResolved: false }}
  onResolve={handleResolve}
  onEditMapping={handleEditMapping}
/>
```

### Optional Field (Resolved)

```tsx
<FieldMappingCard
  field={colorField}
  mapping={{
    csvColumn: 'product_color',
    acpField: 'color',
    confidence: 0.98,
    sampleData: ['Black', 'White', 'Red'],
    totalCount: 250,
  }}
  validation={{ status: 'valid', messages: [] }}
  resolution={{
    isResolved: true,
    resolvedBy: 'user@example.com',
    resolvedAt: new Date(),
  }}
  onResolve={handleResolve}
  onEditMapping={handleEditMapping}
/>
```

## States

### Visual States

1. **Collapsed (Default)**: Shows summary with mapping, sample data, and status
2. **Expanded**: Shows detailed tabs with context, validation, and data
3. **Resolved**: Green background indicating approved mapping
4. **Error**: Red accent indicating validation failures
5. **Warning**: Yellow accent indicating issues needing attention

### Field Categories

- **Required (Red)**: Must be present for ACP compliance
- **Recommended (Orange)**: Improves product ranking and visibility
- **Optional (Gray)**: Nice to have, enhances product information

## Keyboard Navigation

| Key           | Action                                          |
| ------------- | ----------------------------------------------- |
| `Tab`         | Navigate between cards and interactive elements |
| `Enter/Space` | Expand/collapse card                            |
| `Escape`      | Close expanded view                             |
| `Arrow Keys`  | Navigate between tabs (when expanded)           |

## Accessibility

The component follows WCAG 2.1 AA guidelines:

- **Screen Reader Support**: All interactive elements have descriptive labels
- **Keyboard Navigation**: Full functionality without mouse
- **Color Contrast**: Meets 4.5:1 ratio for text
- **Focus Indicators**: Clear visual focus states
- **ARIA Attributes**: Proper roles and states
- **Motion**: Respects `prefers-reduced-motion`

## Responsive Design

### Desktop (≥1024px)

- Full layout with all features
- Side-by-side mapping display

### Tablet (768px - 1023px)

- Condensed layout
- Touch-optimized targets

### Mobile (<768px)

- Single column layout
- Bottom sheet for expanded view
- Swipe gestures for tabs

## Performance

- **Virtual Scrolling**: Handles 50+ fields efficiently
- **Lazy Loading**: Expanded content loaded on demand
- **Memoization**: Optimized re-renders
- **Animation**: 60fps smooth animations

## Customization

### Theming

Override CSS variables in your stylesheet:

```css
:root {
  --color-required: #dc3545;
  --color-recommended: #f39c12;
  --color-optional: #6c757d;
  --color-interactive: #0066cc;
  /* ... more variables */
}
```

### Dark Mode

The component includes dark mode support via `prefers-color-scheme`:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: #1a1a1a;
    --color-text-primary: #e0e0e0;
    /* ... dark theme variables */
  }
}
```

## Integration Patterns

### With State Management

```tsx
// Using React Context
const FieldMappingContext = createContext();

function FieldMappingProvider({ children }) {
  const [resolutions, setResolutions] = useState({});

  const resolveField = (fieldName) => {
    setResolutions((prev) => ({ ...prev, [fieldName]: true }));
  };

  return (
    <FieldMappingContext.Provider value={{ resolutions, resolveField }}>
      {children}
    </FieldMappingContext.Provider>
  );
}
```

### With Form Validation

```tsx
import { useForm } from 'react-hook-form';

function FieldMappingForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    // Process resolved mappings
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {fields.map((field) => (
        <FieldMappingCard
          key={field.name}
          field={field}
          validation={{
            status: errors[field.name] ? 'error' : 'valid',
            messages: errors[field.name] ? [errors[field.name]] : [],
          }}
          // ... other props
        />
      ))}
    </form>
  );
}
```

### Bulk Operations

```tsx
function BulkResolveButton() {
  const resolveAllValid = () => {
    const validFields = fields.filter((f) => f.validation.status === 'valid');
    validFields.forEach((field) => handleResolve(field.name));
  };

  return <button onClick={resolveAllValid}>Resolve All Valid Mappings ({validCount})</button>;
}
```

## Testing

The component includes comprehensive test coverage:

```bash
# Run tests
npm test FieldMappingCard.test.tsx

# Run with coverage
npm test -- --coverage
```

### Test Examples

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { FieldMappingCard } from './FieldMappingCard';

test('expands on click', () => {
  render(<FieldMappingCard {...props} />);

  const card = screen.getByRole('button');
  fireEvent.click(card);

  expect(screen.getByText('Context')).toBeInTheDocument();
});
```

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile Safari (iOS): Latest 2 versions
- Chrome Mobile (Android): Latest 2 versions

## Troubleshooting

### Component doesn't expand

- Ensure `framer-motion` is installed
- Check for JavaScript errors in console
- Verify props are properly passed

### Animations are janky

- Check for excessive re-renders
- Use React DevTools Profiler
- Consider virtual scrolling for large lists

### Accessibility issues

- Run automated accessibility tests (axe, WAVE)
- Test with screen reader (NVDA, JAWS, VoiceOver)
- Verify keyboard navigation

## Migration Guide

### From v1 to v2

```tsx
// Before
<FieldMappingCard
  field={field}
  csvColumn="product_title"
  sampleData={['Sample 1']}
/>

// After
<FieldMappingCard
  field={field}
  mapping={{
    csvColumn: 'product_title',
    acpField: field.name,
    confidence: 0.95,
    sampleData: ['Sample 1']
  }}
  validation={{ status: 'valid', messages: [] }}
  resolution={{ isResolved: false }}
/>
```

## Related Components

- `FieldMapping`: Parent container component
- `ValidationSummary`: Overall validation summary
- `ExportOptions`: Export configuration after validation

## Contributing

Please refer to the main project's CONTRIBUTING.md for guidelines on:

- Code style and formatting
- Testing requirements
- Pull request process
- Documentation standards

## License

This component is part of the Easy ACP project. See LICENSE for details.

## Support

- Documentation: `/docs/ui-specs/expandable-field-component.md`
- Examples: `FieldMappingCard.example.tsx`
- Tests: `FieldMappingCard.test.tsx`
- Storybook: `FieldMappingCard.stories.tsx`

For issues and questions, please open a GitHub issue or contact the development team.
