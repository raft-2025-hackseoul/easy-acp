# LLM Validation for ACP Product Feeds

## Overview

The LLM Validation feature provides AI-powered validation of product CSV files against the Agentic Commerce Protocol (ACP) specification using OpenRouter's LLM API layer. This feature offers deeper, more intelligent validation compared to traditional rule-based validation.

## Features

- **Intelligent Validation**: Uses LLM models to understand context and business rules
- **Detailed Feedback**: Provides specific, actionable feedback for each validation issue
- **Quality Scoring**: Assigns an overall quality score (0-100) to each product
- **Multi-Severity Issues**: Categorizes issues as errors, warnings, or info
- **Batch Processing**: Efficiently validates multiple products with rate limiting
- **Spec-Aware**: Uses the complete ACP specification document for validation context

## Architecture

### Components

1. **ACP Specification Document** (`apps/api/src/specs/acp-product-feed-spec.md`)
   - Complete ACP Product Feed specification in markdown format
   - Used as context for LLM validation
   - Extracted from https://developers.openai.com/commerce/specs/feed

2. **LLM Validator Service** (`apps/api/src/services/llm-validator.service.ts`)
   - OpenRouter client configuration
   - Validation logic and prompt engineering
   - Result parsing and normalization
   - Batch processing with concurrency control

3. **Enhanced Validation Service** (`apps/api/src/services/validation.service.ts`)
   - Integration point for traditional and LLM validation
   - Combined validation mode
   - Availability checks

4. **API Routes** (`apps/api/src/routes/product-feed.routes.ts`)
   - `GET /api/product-feed/llm/status` - Check LLM availability
   - `POST /api/product-feed/llm/validate` - Validate multiple products
   - `POST /api/product-feed/llm/validate-one` - Validate single product
   - `POST /api/product-feed/upload-with-llm` - Upload CSV with LLM validation

## Setup

### 1. Get OpenRouter API Key

1. Visit https://openrouter.ai/keys
2. Sign up or log in
3. Create a new API key
4. Copy the API key

### 2. Configure Environment Variables

Edit `apps/api/.env`:

```bash
# OpenRouter API Configuration
OPENROUTER_API_KEY=your-openrouter-api-key-here

# Optional: Specify the model (default: anthropic/claude-3.5-sonnet)
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet

# Optional: Your app URL for OpenRouter analytics
APP_URL=http://localhost:3000
```

### 3. Available Models

OpenRouter supports multiple LLM models:

- `anthropic/claude-3.5-sonnet` (Recommended) - Best balance of quality and speed
- `openai/gpt-4o` - OpenAI's latest model
- `openai/gpt-4-turbo` - Cost-effective alternative
- `meta-llama/llama-3.1-70b-instruct` - Open-source option
- See https://openrouter.ai/models for complete list

## Usage

### API Endpoints

#### Check LLM Validation Status

```bash
GET /api/product-feed/llm/status
```

Response:
```json
{
  "success": true,
  "data": {
    "available": true,
    "message": "LLM validation is available"
  }
}
```

#### Validate Products with LLM

```bash
POST /api/product-feed/llm/validate
Content-Type: application/json

{
  "products": [
    {
      "id": "PROD-001",
      "title": "Example Product",
      "price": "29.99 USD",
      ...
    }
  ]
}
```

Response:
```json
{
  "success": true,
  "data": {
    "totalProducts": 1,
    "validProducts": 0,
    "invalidProducts": 1,
    "results": [
      {
        "product": { ... },
        "validation": {
          "isValid": false,
          "overallScore": 65,
          "issues": [
            {
              "field": "description",
              "severity": "error",
              "message": "Description is missing (required field)",
              "suggestion": "Add a detailed product description (max 5,000 characters)"
            }
          ],
          "suggestions": [
            "Add missing required fields",
            "Ensure all URLs are HTTPS"
          ],
          "summary": "Product missing 3 required fields and has 2 format issues"
        }
      }
    ],
    "overallSummary": "Validated 1 products. Average quality score: 65.0. Found 3 errors and 2 warnings."
  }
}
```

#### Upload CSV with LLM Validation

```bash
POST /api/product-feed/upload-with-llm
Content-Type: multipart/form-data

file: <CSV file>
```

Response includes both traditional and LLM validation results:
```json
{
  "success": true,
  "data": {
    "totalRows": 10,
    "validProducts": 7,
    "invalidProducts": 3,
    "products": [...],
    "fieldMappings": [...],
    "validation": {
      "traditional": {
        "missingRequired": [...],
        "missingRecommended": [...],
        "totalErrors": 15,
        "totalWarnings": 8
      },
      "llm": {
        "totalProducts": 10,
        "validProducts": 7,
        "invalidProducts": 3,
        "results": [...],
        "overallSummary": "..."
      },
      "hasLLMValidation": true
    }
  }
}
```

### Frontend Integration

```typescript
import {
  checkLLMValidationStatus,
  validateProductsWithLLM,
  validateProductWithLLM,
  uploadCSVWithLLM,
} from './services/api';

// Check if LLM validation is available
const status = await checkLLMValidationStatus();
console.log(status.available); // true or false

// Validate products with LLM
const result = await validateProductsWithLLM(products);
console.log(`Average score: ${result.results.reduce((sum, r) => sum + r.validation.overallScore, 0) / result.results.length}`);

// Upload CSV with LLM validation
const uploadResult = await uploadCSVWithLLM(file);
if (uploadResult.data.validation.hasLLMValidation) {
  console.log('LLM validation:', uploadResult.data.validation.llm);
}
```

## Validation Results Structure

### LLMValidationResult

```typescript
interface LLMValidationResult {
  isValid: boolean;           // True if no errors (warnings OK)
  overallScore: number;        // 0-100 quality score
  issues: LLMValidationIssue[]; // List of validation issues
  suggestions: string[];       // Overall improvement suggestions
  summary: string;             // Brief validation summary
}
```

### LLMValidationIssue

```typescript
interface LLMValidationIssue {
  field?: string;              // Field name (if applicable)
  severity: 'error' | 'warning' | 'info';
  message: string;             // Clear issue description
  suggestion?: string;         // How to fix (if available)
}
```

## Benefits Over Traditional Validation

### Traditional Validation
- Rule-based checking
- Fixed validation logic
- Binary pass/fail
- Limited context understanding
- No quality scoring

### LLM Validation
- Context-aware validation
- Understands business rules and intent
- Quality scoring (0-100)
- Detailed, actionable feedback
- Catches subtle issues (e.g., "avoid all-caps titles")
- Suggests improvements
- Validates against full spec including prohibited products

## Performance & Cost

### Batch Processing
- Default concurrency: 5 products at a time
- Configurable via `maxConcurrent` parameter
- Prevents API rate limiting

### Cost Optimization
- Uses efficient models (Claude 3.5 Sonnet recommended)
- Batch validation reduces overhead
- Only validates when explicitly requested
- Falls back to traditional validation if unavailable

### Typical Response Times
- Single product: 2-5 seconds
- 10 products (batch): 10-20 seconds
- 100 products (batch): 60-120 seconds

## Error Handling

The LLM validator gracefully handles errors:

1. **Missing API Key**: Returns clear error message
2. **API Errors**: Falls back or returns detailed error
3. **Invalid Responses**: Parses and normalizes results
4. **Rate Limiting**: Automatically queues requests

## Best Practices

### 1. Use Combined Validation
Get both traditional and LLM validation for comprehensive results:
```typescript
const result = await validateProductsCombined(products);
```

### 2. Check Availability First
Always check if LLM validation is available:
```typescript
if (await checkLLMValidationStatus().available) {
  // Use LLM validation
} else {
  // Use traditional validation
}
```

### 3. Monitor Quality Scores
Track average quality scores to monitor feed improvements:
```typescript
const avgScore = results.reduce((sum, r) =>
  sum + r.validation.overallScore, 0
) / results.length;
```

### 4. Act on Suggestions
LLM provides actionable suggestions - use them:
```typescript
result.suggestions.forEach(suggestion => {
  console.log('Improvement:', suggestion);
});
```

## Troubleshooting

### LLM Validation Not Available

**Problem**: `isLLMValidationAvailable()` returns `false`

**Solutions**:
1. Check `OPENROUTER_API_KEY` is set in `.env`
2. Verify API key is valid at https://openrouter.ai/keys
3. Check `acp-product-feed-spec.md` exists
4. Restart the API server after changing `.env`

### Validation Errors

**Problem**: LLM validation returns errors

**Solutions**:
1. Check API key has sufficient credits
2. Verify model name is correct
3. Check network connectivity
4. Review error logs for details

### Slow Performance

**Problem**: Validation takes too long

**Solutions**:
1. Reduce `maxConcurrent` parameter
2. Switch to faster model (e.g., `gpt-4o-mini`)
3. Validate in smaller batches
4. Use traditional validation for quick checks

## Development

### Adding New Validation Rules

Edit `apps/api/src/specs/acp-product-feed-spec.md` to add or update validation rules. The LLM will automatically use the updated spec.

### Customizing Validation Prompts

Edit `buildValidationPrompt()` in `llm-validator.service.ts` to customize how validation is performed.

### Testing

```bash
# Start API server with LLM validation
cd apps/api
npm run dev

# Test status endpoint
curl http://localhost:3001/api/product-feed/llm/status

# Test validation with sample product
curl -X POST http://localhost:3001/api/product-feed/llm/validate-one \
  -H "Content-Type: application/json" \
  -d '{"product": {"id": "TEST-001", "title": "Test Product"}}'
```

## References

- [ACP Product Feed Specification](https://developers.openai.com/commerce/specs/feed)
- [OpenRouter Documentation](https://openrouter.ai/docs)
- [OpenAI SDK](https://github.com/openai/openai-node)
