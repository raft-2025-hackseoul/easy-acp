/**
 * FieldMappingCard Storybook Stories
 *
 * Visual documentation and testing for the FieldMappingCard component
 */

import type { Meta, StoryObj } from '@storybook/react';
import { FieldMappingCard } from './FieldMappingCard';
import type { FieldMappingCardProps } from './FieldMappingCard';
import { ACP_FIELDS } from '@repo/acp-types';

const meta: Meta<typeof FieldMappingCard> = {
  title: 'Components/FieldMappingCard',
  component: FieldMappingCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'An expandable card component for displaying and managing ACP field mappings with validation and contextual information.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    field: {
      description: 'ACP field metadata with additional context',
      control: { type: 'object' },
    },
    mapping: {
      description: 'Field mapping information including CSV column and sample data',
      control: { type: 'object' },
    },
    validation: {
      description: 'Validation status and messages',
      control: { type: 'object' },
    },
    resolution: {
      description: 'Resolution state of the field mapping',
      control: { type: 'object' },
    },
    onResolve: { action: 'resolved' },
    onEditMapping: { action: 'mapping edited' },
    onExpand: { action: 'expanded' },
  },
};

export default meta;
type Story = StoryObj<typeof FieldMappingCard>;

// Base field data
const baseField = {
  ...ACP_FIELDS.find((f) => f.name === 'title')!,
  chatgptUsage:
    'The title is displayed as the primary product name in ChatGPT search results. It is used for semantic matching and is the most important field for discoverability.',
  validationRules: [
    { rule: 'maxLength', value: 150, message: 'Title must be 150 characters or less' },
    { rule: 'required', message: 'Title is required for all products' },
  ],
  bestPractices: [
    'Include the brand name for better recognition',
    'Add key product features',
    'Avoid excessive capitalization',
  ],
};

// Default story - Valid required field
export const Default: Story = {
  args: {
    field: baseField,
    mapping: {
      csvColumn: 'product_title',
      acpField: 'title',
      confidence: 0.95,
      sampleData: [
        'Wireless Bluetooth Headphones Pro Max - Black',
        'Premium Noise Canceling Earbuds - White',
        'Gaming Headset with RGB Lighting',
      ],
      dataType: 'string',
      uniqueValues: 245,
      nullCount: 0,
      totalCount: 250,
    },
    validation: {
      status: 'valid',
      messages: [],
    },
    resolution: {
      isResolved: false,
    },
    availableColumns: ['product_title', 'product_name', 'title', 'name'],
  },
};

// Resolved state
export const Resolved: Story = {
  args: {
    ...Default.args,
    resolution: {
      isResolved: true,
      resolvedBy: 'user@example.com',
      resolvedAt: new Date(),
    },
  },
};

// Error state
export const WithErrors: Story = {
  args: {
    field: {
      ...ACP_FIELDS.find((f) => f.name === 'price')!,
      chatgptUsage: 'Used to display product pricing and filter results by price range.',
      validationRules: [{ rule: 'format', message: 'Must follow format: "amount CURRENCY_CODE"' }],
      bestPractices: ['Always include the currency code', 'Use consistent decimal places'],
    },
    mapping: {
      csvColumn: 'price',
      acpField: 'price',
      confidence: 0.87,
      sampleData: ['99.99', '149.50', '$79.99', '199.99', 'N/A'],
      dataType: 'mixed',
      uniqueValues: 198,
      nullCount: 12,
      totalCount: 250,
    },
    validation: {
      status: 'error',
      messages: [
        {
          type: 'error',
          message: 'Price must include ISO 4217 currency code',
          line: 3,
          suggestion: 'Remove currency symbols and add three-letter currency code',
        },
        {
          type: 'error',
          message: 'Invalid price format: "N/A"',
          line: 5,
          suggestion: 'Replace with actual price or remove product',
        },
      ],
    },
    resolution: {
      isResolved: false,
    },
    availableColumns: ['price', 'cost', 'product_price', 'selling_price'],
  },
};

// Warning state
export const WithWarnings: Story = {
  args: {
    field: {
      ...ACP_FIELDS.find((f) => f.name === 'brand')!,
      chatgptUsage: 'Used for brand filtering and improving search relevance.',
      validationRules: [
        { rule: 'maxLength', value: 70, message: 'Brand name must be 70 characters or less' },
      ],
      bestPractices: ['Use the official brand name', 'Apply consistent capitalization'],
    },
    mapping: {
      csvColumn: 'manufacturer',
      acpField: 'brand',
      confidence: 0.72,
      sampleData: ['Sony', 'Apple Inc.', 'samsung', 'MICROSOFT', 'Bose'],
      dataType: 'string',
      uniqueValues: 45,
      nullCount: 18,
      totalCount: 250,
    },
    validation: {
      status: 'warning',
      messages: [
        {
          type: 'warning',
          message: 'Brand names should use proper title case',
          suggestion: 'Standardize brand name capitalization',
        },
        {
          type: 'info',
          message: 'This is a recommended field for better ranking',
        },
      ],
    },
    resolution: {
      isResolved: false,
    },
    availableColumns: ['manufacturer', 'brand', 'make', 'vendor'],
  },
};

// Optional field
export const OptionalField: Story = {
  args: {
    field: {
      ...ACP_FIELDS.find((f) => f.name === 'color')!,
      chatgptUsage: 'Used for product variant differentiation and filtering.',
      validationRules: [
        { rule: 'maxLength', value: 40, message: 'Color name must be 40 characters or less' },
      ],
      bestPractices: ['Use descriptive color names', 'Be consistent across variants'],
    },
    mapping: {
      csvColumn: 'product_color',
      acpField: 'color',
      confidence: 0.98,
      sampleData: ['Midnight Black', 'Arctic White', 'Rose Gold', 'Space Gray'],
      dataType: 'string',
      uniqueValues: 15,
      nullCount: 85,
      totalCount: 250,
    },
    validation: {
      status: 'valid',
      messages: [
        {
          type: 'info',
          message: '85 products (34%) do not have color information',
        },
      ],
    },
    resolution: {
      isResolved: false,
    },
    availableColumns: ['product_color', 'color', 'colour', 'variant_color'],
  },
};

// Recommended field
export const RecommendedField: Story = {
  args: {
    field: {
      ...ACP_FIELDS.find((f) => f.name === 'gtin')!,
      chatgptUsage: 'Used for precise product identification and matching.',
      validationRules: [
        { rule: 'format', message: 'Must be 8-14 digits' },
        { rule: 'checksum', message: 'Must have valid check digit' },
      ],
      bestPractices: [
        'Use manufacturer-provided GTIN',
        'Include check digit',
        'Verify barcode accuracy',
      ],
    },
    mapping: {
      csvColumn: 'barcode',
      acpField: 'gtin',
      confidence: 0.85,
      sampleData: ['00123456789012', '00987654321098', '00555555555555'],
      dataType: 'string',
      uniqueValues: 180,
      nullCount: 70,
      totalCount: 250,
    },
    validation: {
      status: 'valid',
      messages: [],
    },
    resolution: {
      isResolved: false,
    },
    availableColumns: ['barcode', 'upc', 'ean', 'gtin', 'isbn'],
  },
};

// Low confidence mapping
export const LowConfidence: Story = {
  args: {
    field: {
      ...ACP_FIELDS.find((f) => f.name === 'description')!,
      chatgptUsage: 'Provides detailed product information for better understanding.',
      validationRules: [
        { rule: 'maxLength', value: 5000, message: 'Description must be 5000 characters or less' },
      ],
      bestPractices: [
        'Provide comprehensive details',
        'Use plain text only',
        'Include key features and benefits',
      ],
    },
    mapping: {
      csvColumn: 'short_desc',
      acpField: 'description',
      confidence: 0.45,
      sampleData: ['Great product', 'High quality', 'Buy now'],
      dataType: 'string',
      uniqueValues: 240,
      nullCount: 5,
      totalCount: 250,
    },
    validation: {
      status: 'warning',
      messages: [
        {
          type: 'warning',
          message: 'Mapping confidence is low (45%)',
          suggestion: 'Verify this is the correct column for product descriptions',
        },
        {
          type: 'warning',
          message: 'Many descriptions are very short',
          suggestion: 'Consider using a different column with more detailed descriptions',
        },
      ],
    },
    resolution: {
      isResolved: false,
    },
    availableColumns: ['short_desc', 'long_desc', 'description', 'product_info'],
  },
};

// Missing data
export const MissingData: Story = {
  args: {
    field: {
      ...ACP_FIELDS.find((f) => f.name === 'image_link')!,
      chatgptUsage: 'Primary product image displayed in search results.',
      validationRules: [
        { rule: 'format', message: 'Must be a valid URL' },
        { rule: 'type', message: 'Must be JPEG or PNG format' },
      ],
      bestPractices: [
        'Use high-resolution images',
        'Show product clearly',
        'Use white or transparent background',
      ],
    },
    mapping: {
      csvColumn: 'image_url',
      acpField: 'image_link',
      confidence: 0.92,
      sampleData: [
        'https://example.com/img1.jpg',
        'https://example.com/img2.jpg',
        '',
        'https://example.com/img4.png',
      ],
      dataType: 'string',
      uniqueValues: 195,
      nullCount: 55,
      totalCount: 250,
    },
    validation: {
      status: 'error',
      messages: [
        {
          type: 'error',
          message: '55 products (22%) are missing image URLs',
          suggestion: 'Add images for all products or remove products without images',
        },
      ],
    },
    resolution: {
      isResolved: false,
    },
    availableColumns: ['image_url', 'image', 'img_link', 'photo_url'],
  },
};

// Enum field
export const EnumField: Story = {
  args: {
    field: {
      ...ACP_FIELDS.find((f) => f.name === 'availability')!,
      chatgptUsage: 'Controls whether product is shown as available for purchase.',
      validationRules: [
        { rule: 'enum', message: 'Must be one of: in_stock, out_of_stock, preorder' },
      ],
      bestPractices: [
        'Keep inventory status up to date',
        'Use preorder for upcoming products',
        'Hide out_of_stock products if not restocking',
      ],
    },
    mapping: {
      csvColumn: 'stock_status',
      acpField: 'availability',
      confidence: 0.88,
      sampleData: ['in_stock', 'in_stock', 'out_of_stock', 'in_stock', 'preorder'],
      dataType: 'enum',
      uniqueValues: 3,
      nullCount: 0,
      totalCount: 250,
    },
    validation: {
      status: 'valid',
      messages: [],
    },
    resolution: {
      isResolved: false,
    },
    availableColumns: ['stock_status', 'availability', 'in_stock', 'status'],
  },
};

// Boolean field
export const BooleanField: Story = {
  args: {
    field: {
      ...ACP_FIELDS.find((f) => f.name === 'enable_search')!,
      chatgptUsage: 'Controls whether product can be surfaced in ChatGPT search.',
      validationRules: [{ rule: 'type', message: 'Must be true or false' }],
      bestPractices: [
        'Set to true for products you want to sell',
        'Set to false for discontinued products',
        'Required to be true for checkout functionality',
      ],
    },
    mapping: {
      csvColumn: 'searchable',
      acpField: 'enable_search',
      confidence: 0.78,
      sampleData: ['true', 'true', 'false', 'true', 'true'],
      dataType: 'boolean',
      uniqueValues: 2,
      nullCount: 0,
      totalCount: 250,
    },
    validation: {
      status: 'valid',
      messages: [
        {
          type: 'info',
          message: '15 products have enable_search set to false',
        },
      ],
    },
    resolution: {
      isResolved: false,
    },
    availableColumns: ['searchable', 'visible', 'active', 'enabled'],
  },
};

// Multiple validation issues
export const MultipleIssues: Story = {
  args: {
    field: {
      ...ACP_FIELDS.find((f) => f.name === 'link')!,
      chatgptUsage: 'Product detail page URL where users can view full information.',
      validationRules: [
        { rule: 'format', message: 'Must be a valid URL' },
        { rule: 'https', message: 'Must use HTTPS protocol' },
        { rule: 'reachable', message: 'Must return HTTP 200 status' },
      ],
      bestPractices: [
        'Use canonical URLs',
        'Ensure pages are publicly accessible',
        'Include tracking parameters if needed',
      ],
    },
    mapping: {
      csvColumn: 'product_url',
      acpField: 'link',
      confidence: 0.91,
      sampleData: [
        'https://example.com/product1',
        'http://example.com/product2',
        'example.com/product3',
        'https://example.com/product4',
      ],
      dataType: 'string',
      uniqueValues: 250,
      nullCount: 3,
      totalCount: 250,
    },
    validation: {
      status: 'error',
      messages: [
        {
          type: 'error',
          message: '3 products are missing URLs',
          suggestion: 'Add URLs for all products',
        },
        {
          type: 'error',
          message: 'Some URLs use HTTP instead of HTTPS',
          line: 2,
          suggestion: 'Update URLs to use secure HTTPS protocol',
        },
        {
          type: 'error',
          message: 'Some URLs are missing protocol',
          line: 3,
          suggestion: 'Add "https://" to the beginning of URLs',
        },
        {
          type: 'warning',
          message: '12 URLs returned 404 errors when checked',
          suggestion: 'Verify these product pages exist and are accessible',
        },
      ],
    },
    resolution: {
      isResolved: false,
    },
    availableColumns: ['product_url', 'url', 'link', 'page_url', 'permalink'],
  },
};

// Interactive playground
export const Playground: Story = {
  args: Default.args,
  parameters: {
    docs: {
      description: {
        story: 'Interact with the component using the controls panel below.',
      },
    },
  },
};
