# Automatic Field Generation Feature

## Overview

The automatic field generation feature uses AI to intelligently fill missing required and recommended ACP fields after CSV upload and validation. This dramatically reduces manual data entry and ensures product feeds meet ACP compliance requirements.

## How It Works

### 1. Upload & Validation Flow

```
CSV Upload → Field Mapping → Validation → Field Generation → Export
```

1. **Upload CSV**: User uploads a product CSV file
2. **AI Field Mapping**: System automatically maps CSV columns to ACP fields
3. **Validation**: System identifies missing required and recommended fields
4. **Field Generation** (NEW): AI generates missing fields based on existing product data
5. **Export**: User exports the enhanced, ACP-compliant feed

### 2. Field Generation Process

The system uses the following approach:

- **Context-Aware**: Analyzes existing product fields (title, price, etc.) to generate realistic values
- **Intelligent Inference**: Makes smart assumptions (e.g., inferring category from title, brand from product name)
- **Batch Processing**: Processes all products with a small delay to avoid rate limiting
- **Change Tracking**: Records all generated fields with explanations
- **Quality Scoring**: Estimates quality improvement for each product

### 3. User Interface

After CSV upload and validation, if missing fields are detected:

- **Field Generation Panel** appears between ValidationSummary and FieldMapping
- **Generate Button**: Click to start automatic field generation
- **Progress Indicator**: Shows generation is in progress
- **Results Summary**: Displays:
  - Total fields generated
  - Required fields filled
  - Recommended fields filled
  - Processing time
  - Any errors encountered
- **View Details**: Expandable section showing specific changes per product

## Architecture

### Backend Components

#### 1. Missing Field Generator Service

**Location**: `apps/api/src/services/missing-field-generator.service.ts`

```typescript
interface MissingFieldGenerationResult {
  enhancedProducts: PartialACPProduct[];
  changes: Map<string, ProductChange[]>;
  summary: GenerationSummary;
  errors: GenerationError[];
}
```

**Key Methods**:

- `generateMissingFields()`: Generate fields for multiple products
- `generateSpecificFields()`: Generate specific fields for a single product
- `estimateProcessingTime()`: Estimate processing duration
- `isAvailable()`: Check if service is configured

#### 2. Product Enhancer Service (Existing)

**Location**: `apps/api/src/services/product-enhancer.service.ts`

Powers the field generation with:

- LLM-based product enhancement
- ACP specification compliance
- Intelligent field inference
- Change tracking and explanation

#### 3. API Routes

**Location**: `apps/api/src/routes/product-feed.routes.ts`

**New Endpoints**:

```typescript
// Generate missing fields
POST /api/product-feed/generate-missing-fields
{
  products: ACPProduct[],
  missingRequired: string[],
  missingRecommended: string[]
}

// Check if generation is available
GET /api/product-feed/generation-status
```

### Frontend Components

#### 1. FieldGenerationPanel Component

**Location**: `apps/web/src/components/FieldGenerationPanel.tsx`

**Features**:

- Generate button with loading state
- Progress indicator during generation
- Success summary with statistics
- Error display
- Detailed change viewer
- Availability status warning

#### 2. ProductFeedPage Integration

**Location**: `apps/web/src/pages/ProductFeedPage.tsx`

**State Management**:

- `isGenerationAvailable`: Service availability
- `isGenerating`: Generation in progress
- `generationResult`: Generation results
- Automatic status check on mount
- Product data update after generation

#### 3. API Client

**Location**: `apps/web/src/services/api.ts`

**New Functions**:

```typescript
checkFieldGenerationStatus(): Promise<FieldGenerationStatus>
generateMissingFields(products, missingRequired, missingRecommended): Promise<MissingFieldGenerationResult>
```

## Configuration

### Required Environment Variables

```bash
# .env file
OPENROUTER_API_KEY=your-openrouter-api-key-here
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet  # Optional, defaults to this
APP_URL=http://localhost:3000  # Optional, for API referrer
```

### Getting an OpenRouter API Key

1. Visit https://openrouter.ai
2. Sign up for an account
3. Generate an API key
4. Add credits to your account (pay-as-you-go pricing)
5. Add the key to your `.env` file

**Cost Estimate**:

- ~$0.01-0.03 per product enhanced (using Claude 3.5 Sonnet)
- Batch processing 100 products ≈ $1-3

## Usage Guide

### For End Users

1. **Upload CSV**
   - Navigate to Product Feed Automator
   - Upload your product CSV file
   - Wait for validation to complete

2. **Review Validation**
   - Check ValidationSummary for missing fields
   - Review field mappings

3. **Generate Missing Fields**
   - Click "Generate Missing Fields" button
   - Wait for AI to analyze and enhance products
   - Review the generation summary

4. **Review Changes**
   - Click "View Details" to see what was generated
   - Each change includes the field, old/new value, and reason

5. **Export Feed**
   - Export as CSV or JSON
   - Feed is now ACP-compliant with all required fields

### For Developers

#### Testing the Feature

Run the test script:

```bash
# Start API server first
cd apps/api
npm run dev

# In another terminal, run the test
node test-field-generation.js
```

The test script will:

- Check service availability
- Generate fields for sample products
- Display detailed results

#### Manual API Testing

```bash
# Check status
curl http://localhost:3001/api/product-feed/generation-status

# Generate fields
curl -X POST http://localhost:3001/api/product-feed/generate-missing-fields \
  -H "Content-Type: application/json" \
  -d '{
    "products": [{
      "product_id": "test-001",
      "title": "Organic Cotton T-Shirt",
      "price": "29.99 USD"
    }],
    "missingRequired": ["description", "product_category"],
    "missingRecommended": ["brand"]
  }'
```

## Performance Considerations

### Processing Time

- **Per Product**: ~2 seconds (LLM inference time)
- **100 Products**: ~3.5 minutes
- **1000 Products**: ~35 minutes

### Optimization Strategies

1. **Batch Size Limits**: Consider processing in smaller batches for large datasets
2. **Caching**: Future enhancement could cache common field values
3. **Parallel Processing**: Could be enhanced with parallel LLM calls (with rate limiting)
4. **Selective Generation**: Only generate truly missing fields, not all possible fields

## Error Handling

The system handles errors gracefully:

1. **Service Unavailable**: Shows warning if OPENROUTER_API_KEY not configured
2. **API Errors**: Displays error message without breaking the UI
3. **Per-Product Errors**: Continues processing other products if one fails
4. **Network Issues**: Proper error messages and retry opportunities

## Future Enhancements

Potential improvements:

1. **Streaming Updates**: Real-time progress updates during generation
2. **Manual Review Mode**: Approve/reject generated fields before applying
3. **Custom Rules**: User-defined rules for field generation
4. **Templates**: Save common generation patterns
5. **Bulk Export**: Generate and export in one step
6. **Field History**: Track generation history for products
7. **A/B Testing**: Compare generated vs manual fields
8. **Quality Metrics**: Score field quality and suggest improvements

## Troubleshooting

### Service Not Available

**Problem**: "Field generation requires OPENROUTER_API_KEY to be configured"

**Solution**:

1. Check `.env` file has `OPENROUTER_API_KEY=...`
2. Restart API server after adding the key
3. Verify API key is valid on OpenRouter dashboard

### Generation Fails for All Products

**Problem**: All products show errors in the results

**Solution**:

1. Check OpenRouter account has credits
2. Verify network connectivity
3. Check API server logs for detailed errors
4. Ensure ACP spec file is loaded correctly

### Slow Performance

**Problem**: Generation takes too long

**Solution**:

1. Process smaller batches (< 100 products at a time)
2. Check OpenRouter model selection (some models are faster)
3. Consider using a faster model for development
4. Monitor rate limits

### Generated Fields Don't Make Sense

**Problem**: AI generates unrealistic or incorrect values

**Solution**:

1. Ensure input data has good quality (title, price, etc.)
2. Provide more context fields in the CSV
3. Review and manually correct after generation
4. Consider filing an issue with specific examples

## Code Examples

### Adding Custom Validation After Generation

```typescript
// In ProductFeedPage.tsx
const handleGenerateMissingFields = async () => {
  // ... existing code ...

  const result = await generateMissingFields(...);

  // Add custom validation
  const customValidation = validateCustomRules(result.enhancedProducts);

  if (!customValidation.passed) {
    setError('Generated fields need review: ' + customValidation.message);
  }
};
```

### Extending the Generator Service

```typescript
// In missing-field-generator.service.ts
export class MissingFieldGeneratorService {
  // Add custom generation rules
  public async generateWithRules(
    products: PartialACPProduct[],
    rules: GenerationRules
  ): Promise<MissingFieldGenerationResult> {
    // Custom implementation
  }
}
```

## Related Documentation

- [LLM Validation Documentation](./docs/LLM_VALIDATION.md)
- [ACP Product Feed Specification](./apps/api/src/specs/acp-product-feed-spec.md)
- [API Documentation](./apps/api/START_HERE.md)
- [Developer Guide](./DEVELOPER_GUIDE.md)

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review existing GitHub issues
3. Create a new issue with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Sample data (anonymized)
   - Environment details
