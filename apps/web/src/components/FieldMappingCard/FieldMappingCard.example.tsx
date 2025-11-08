/**
 * FieldMappingCard Example Usage
 *
 * This file demonstrates how to use the FieldMappingCard component
 * with various states and scenarios.
 */

import React, { useState } from 'react';
import { FieldMappingCard } from './FieldMappingCard';
import type {
  FieldMappingCardProps,
  FieldMapping,
  FieldValidation,
  FieldResolution,
} from './FieldMappingCard';
import { ACP_FIELDS } from '@repo/acp-types';

// Example 1: Complete Field Mapping Display
export const CompleteFieldMappingExample: React.FC = () => {
  const [resolutions, setResolutions] = useState<Record<string, boolean>>({});

  const handleResolve = (fieldName: string) => {
    setResolutions((prev) => ({ ...prev, [fieldName]: true }));
    console.log('Field resolved:', fieldName);
  };

  const handleEditMapping = (fieldName: string, newColumn: string) => {
    console.log('Mapping edited:', fieldName, '->', newColumn);
  };

  // Example data for "title" field
  const titleMapping: FieldMapping = {
    csvColumn: 'product_title',
    acpField: 'title',
    confidence: 0.95,
    sampleData: [
      'Wireless Bluetooth Headphones Pro Max - Black',
      'Premium Noise Canceling Earbuds - White',
      'Gaming Headset with RGB Lighting',
      'Studio Monitor Headphones Professional',
      'True Wireless Earbuds with Charging Case',
    ],
    dataType: 'string',
    uniqueValues: 245,
    nullCount: 0,
    totalCount: 250,
  };

  const titleValidation: FieldValidation = {
    status: 'valid',
    messages: [],
  };

  const titleResolution: FieldResolution = {
    isResolved: resolutions['title'] || false,
    resolvedBy: resolutions['title'] ? 'user@example.com' : undefined,
    resolvedAt: resolutions['title'] ? new Date() : undefined,
  };

  // Get field metadata
  const titleField = ACP_FIELDS.find((f) => f.name === 'title')!;

  // Enrich with additional context for the component
  const enrichedTitleField = {
    ...titleField,
    chatgptUsage:
      'The title is displayed as the primary product name in ChatGPT search results. It is used for semantic matching and is the most important field for discoverability.',
    validationRules: [
      { rule: 'maxLength', value: 150, message: 'Title must be 150 characters or less' },
      { rule: 'required', message: 'Title is required for all products' },
      { rule: 'noHtml', message: 'HTML tags are not allowed' },
    ],
    bestPractices: [
      'Include the brand name for better recognition',
      'Add key product features or characteristics',
      'Keep it concise but descriptive',
      'Avoid excessive capitalization or special characters',
    ],
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <h2>Complete Field Mapping Example</h2>
      <FieldMappingCard
        field={enrichedTitleField}
        mapping={titleMapping}
        validation={titleValidation}
        resolution={titleResolution}
        availableColumns={['product_title', 'product_name', 'title', 'name']}
        onResolve={handleResolve}
        onEditMapping={handleEditMapping}
      />
    </div>
  );
};

// Example 2: Error State
export const ErrorStateExample: React.FC = () => {
  const priceMapping: FieldMapping = {
    csvColumn: 'price',
    acpField: 'price',
    confidence: 0.87,
    sampleData: [
      '99.99',
      '149.50',
      '$79.99', // Invalid: currency symbol
      '199.99',
      'N/A', // Invalid: not a number
    ],
    dataType: 'mixed',
    uniqueValues: 198,
    nullCount: 12,
    totalCount: 250,
  };

  const priceValidation: FieldValidation = {
    status: 'error',
    messages: [
      {
        type: 'error',
        message: 'Price must include ISO 4217 currency code (e.g., "99.99 USD")',
        line: 3,
        suggestion: 'Remove currency symbols and add three-letter currency code after the price',
      },
      {
        type: 'error',
        message: 'Invalid price format: "N/A" is not a valid price',
        line: 5,
        suggestion: 'Replace with actual price or remove the product from the feed',
      },
      {
        type: 'warning',
        message: '12 products have missing price values',
        suggestion: 'Add prices to all products or remove products without prices',
      },
    ],
  };

  const priceResolution: FieldResolution = {
    isResolved: false,
  };

  const priceField = ACP_FIELDS.find((f) => f.name === 'price')!;
  const enrichedPriceField = {
    ...priceField,
    chatgptUsage:
      'Used to display product pricing and filter results by price range. Required for all searchable products.',
    validationRules: [
      { rule: 'format', message: 'Must follow format: "amount CURRENCY_CODE" (e.g., "99.99 USD")' },
      { rule: 'currency', message: 'Currency code must be valid ISO 4217 (USD, EUR, GBP, etc.)' },
      { rule: 'numeric', message: 'Price amount must be a valid number' },
    ],
    bestPractices: [
      'Always include the currency code',
      'Use consistent decimal places (usually 2)',
      'Ensure prices are up to date',
      'Include sale prices in the separate sale_price field',
    ],
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <h2>Error State Example</h2>
      <FieldMappingCard
        field={enrichedPriceField}
        mapping={priceMapping}
        validation={priceValidation}
        resolution={priceResolution}
        availableColumns={['price', 'cost', 'product_price', 'selling_price']}
        onResolve={() => console.log('Cannot resolve with errors')}
        onEditMapping={(field, col) => console.log('Edit mapping:', field, col)}
      />
    </div>
  );
};

// Example 3: Warning State
export const WarningStateExample: React.FC = () => {
  const brandMapping: FieldMapping = {
    csvColumn: 'manufacturer',
    acpField: 'brand',
    confidence: 0.72,
    sampleData: [
      'Sony',
      'Apple Inc.', // Too formal
      'samsung', // Lowercase
      'MICROSOFT', // All caps
      'Bose',
    ],
    dataType: 'string',
    uniqueValues: 45,
    nullCount: 18,
    totalCount: 250,
  };

  const brandValidation: FieldValidation = {
    status: 'warning',
    messages: [
      {
        type: 'warning',
        message: 'Brand names should use proper title case (e.g., "Apple" not "APPLE" or "apple")',
        suggestion: 'Standardize brand name capitalization',
      },
      {
        type: 'warning',
        message: '18 products (7.2%) are missing brand information',
        suggestion: 'Brand is recommended for better searchability and user trust',
      },
      {
        type: 'info',
        message:
          'This is a recommended field. While not required, including it improves product ranking.',
      },
    ],
  };

  const brandResolution: FieldResolution = {
    isResolved: false,
  };

  const brandField = ACP_FIELDS.find((f) => f.name === 'brand')!;
  const enrichedBrandField = {
    ...brandField,
    chatgptUsage:
      'Used for brand filtering, recognition, and improving search relevance. Strongly recommended for better ranking.',
    validationRules: [
      { rule: 'maxLength', value: 70, message: 'Brand name must be 70 characters or less' },
      { rule: 'titleCase', message: 'Use proper title case (e.g., "Sony" not "SONY")' },
    ],
    bestPractices: [
      'Use the official brand name',
      'Apply consistent capitalization',
      'Avoid including legal suffixes (Inc., LLC, etc.) unless part of the brand',
      'Use the same brand name across all products from that manufacturer',
    ],
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <h2>Warning State Example</h2>
      <FieldMappingCard
        field={enrichedBrandField}
        mapping={brandMapping}
        validation={brandValidation}
        resolution={brandResolution}
        availableColumns={['manufacturer', 'brand', 'make', 'vendor']}
        onResolve={() => console.log('Resolved with warnings')}
        onEditMapping={(field, col) => console.log('Edit mapping:', field, col)}
      />
    </div>
  );
};

// Example 4: Optional Field
export const OptionalFieldExample: React.FC = () => {
  const colorMapping: FieldMapping = {
    csvColumn: 'product_color',
    acpField: 'color',
    confidence: 0.98,
    sampleData: ['Midnight Black', 'Arctic White', 'Rose Gold', 'Space Gray', 'Pacific Blue'],
    dataType: 'string',
    uniqueValues: 15,
    nullCount: 85, // Many products don't have color
    totalCount: 250,
  };

  const colorValidation: FieldValidation = {
    status: 'valid',
    messages: [
      {
        type: 'info',
        message: 'This is an optional field. 85 products (34%) do not have color information.',
      },
    ],
  };

  const colorResolution: FieldResolution = {
    isResolved: true,
    resolvedBy: 'user@example.com',
    resolvedAt: new Date('2025-01-10'),
  };

  const colorField = ACP_FIELDS.find((f) => f.name === 'color')!;
  const enrichedColorField = {
    ...colorField,
    chatgptUsage:
      'Used for product variant differentiation and filtering. Helpful when products come in multiple colors.',
    validationRules: [
      { rule: 'maxLength', value: 40, message: 'Color name must be 40 characters or less' },
    ],
    bestPractices: [
      'Use descriptive color names (e.g., "Midnight Black" instead of "Black")',
      'Be consistent across product variants',
      'Match the color names used on your website',
      'Consider localization if selling internationally',
    ],
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <h2>Optional Field Example (Resolved)</h2>
      <FieldMappingCard
        field={enrichedColorField}
        mapping={colorMapping}
        validation={colorValidation}
        resolution={colorResolution}
        availableColumns={['product_color', 'color', 'colour', 'variant_color']}
        onResolve={() => console.log('Already resolved')}
        onEditMapping={(field, col) => console.log('Edit mapping:', field, col)}
      />
    </div>
  );
};

// Example 5: Multiple Fields in a Container
export const MultipleFieldsExample: React.FC = () => {
  const [resolutions, setResolutions] = useState<Record<string, boolean>>({
    title: true,
    price: false,
    description: false,
  });

  const handleResolve = (fieldName: string) => {
    setResolutions((prev) => ({ ...prev, [fieldName]: true }));
  };

  const handleEditMapping = (fieldName: string, newColumn: string) => {
    console.log('Mapping edited:', fieldName, '->', newColumn);
  };

  const fields = [
    {
      field: ACP_FIELDS.find((f) => f.name === 'title')!,
      mapping: {
        csvColumn: 'product_title',
        acpField: 'title',
        confidence: 0.95,
        sampleData: ['Product 1', 'Product 2', 'Product 3'],
        totalCount: 250,
      },
      validation: { status: 'valid' as const, messages: [] },
      resolution: { isResolved: resolutions.title },
    },
    {
      field: ACP_FIELDS.find((f) => f.name === 'price')!,
      mapping: {
        csvColumn: 'price',
        acpField: 'price',
        confidence: 0.87,
        sampleData: ['99.99', '149.50', '$79.99'],
        totalCount: 250,
      },
      validation: {
        status: 'error' as const,
        messages: [
          {
            type: 'error' as const,
            message: 'Invalid price format',
            suggestion: 'Add currency code',
          },
        ],
      },
      resolution: { isResolved: resolutions.price },
    },
    {
      field: ACP_FIELDS.find((f) => f.name === 'description')!,
      mapping: {
        csvColumn: 'product_description',
        acpField: 'description',
        confidence: 0.92,
        sampleData: ['High quality product...', 'Premium features...'],
        totalCount: 250,
      },
      validation: {
        status: 'warning' as const,
        messages: [
          {
            type: 'warning' as const,
            message: 'Some descriptions are very short',
            suggestion: 'Add more detail',
          },
        ],
      },
      resolution: { isResolved: resolutions.description },
    },
  ];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <h2>Multiple Field Mappings</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {fields.map((item) => (
          <FieldMappingCard
            key={item.field.name}
            field={item.field as any}
            mapping={item.mapping as any}
            validation={item.validation}
            resolution={item.resolution}
            availableColumns={['product_title', 'price', 'product_description']}
            onResolve={handleResolve}
            onEditMapping={handleEditMapping}
          />
        ))}
      </div>

      <div
        style={{ marginTop: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}
      >
        <h3>Resolution Summary</h3>
        <p>
          Resolved: {Object.values(resolutions).filter(Boolean).length} / {fields.length}
        </p>
        <button
          onClick={() => setResolutions({ title: true, price: true, description: true })}
          style={{
            padding: '10px 20px',
            background: '#0066CC',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Resolve All Valid Mappings
        </button>
      </div>
    </div>
  );
};

// Example 6: Custom Hook for Managing Field Mappings
export const useFieldMappings = () => {
  const [mappings, setMappings] = useState<Record<string, any>>({});
  const [resolutions, setResolutions] = useState<Record<string, boolean>>({});

  const resolveField = (fieldName: string) => {
    setResolutions((prev) => ({ ...prev, [fieldName]: true }));
  };

  const updateMapping = (fieldName: string, newColumn: string) => {
    setMappings((prev) => ({
      ...prev,
      [fieldName]: { ...prev[fieldName], csvColumn: newColumn },
    }));
  };

  const resolveAllValid = () => {
    // Logic to resolve all fields with validation status "valid"
    const validFields = Object.entries(mappings)
      .filter(([_, mapping]: [string, any]) => mapping.validation?.status === 'valid')
      .map(([fieldName]) => fieldName);

    const newResolutions = { ...resolutions };
    validFields.forEach((fieldName) => {
      newResolutions[fieldName] = true;
    });
    setResolutions(newResolutions);
  };

  return {
    mappings,
    resolutions,
    resolveField,
    updateMapping,
    resolveAllValid,
  };
};

// Example 7: Integration with Form
export const FieldMappingFormExample: React.FC = () => {
  const { resolveField, updateMapping, resolveAllValid } = useFieldMappings();

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <div
        style={{
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h2>Product Feed Field Mapping</h2>
        <button
          onClick={resolveAllValid}
          style={{
            padding: '10px 20px',
            background: '#0066CC',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          Resolve All Valid
        </button>
      </div>

      <div
        style={{
          padding: '15px',
          background: '#E7F3FF',
          borderRadius: '6px',
          marginBottom: '20px',
          borderLeft: '4px solid #0066CC',
        }}
      >
        <p style={{ margin: 0, fontSize: '14px' }}>
          Review each field mapping below. Click on a field to see detailed information, validation
          rules, and sample data. Mark fields as resolved once you have verified the mapping is
          correct.
        </p>
      </div>

      {/* Add FieldMappingCard components here */}
    </div>
  );
};

export default {
  CompleteFieldMappingExample,
  ErrorStateExample,
  WarningStateExample,
  OptionalFieldExample,
  MultipleFieldsExample,
  FieldMappingFormExample,
};
