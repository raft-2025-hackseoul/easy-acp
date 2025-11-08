# CSV Validation with AI - Issue Fix Summary

## Problem Identified

The CSV file validation with AI was not working due to a file path resolution issue. The LLM validator service was trying to load the ACP specification from the compiled `dist/` directory, but the `.md` file only existed in the `src/` directory.

## Root Cause

When TypeScript compiles `.ts` files to JavaScript in the `dist/` folder, it doesn't copy non-TypeScript files like `.md` files. The code was using:

```typescript
const specPath = join(__dirname, '../specs/acp-product-feed-spec.md');
```

This would resolve to `dist/specs/acp-product-feed-spec.md` when running compiled code, but the file was actually at `src/specs/acp-product-feed-spec.md`.

## Solution Implemented

Updated `llm-validator.service.ts` to try multiple possible paths:

```typescript
const possiblePaths = [
  join(__dirname, '../specs/acp-product-feed-spec.md'), // Built version
  join(__dirname, '../../src/specs/acp-product-feed-spec.md'), // From dist/ to src/
  join(process.cwd(), 'src/specs/acp-product-feed-spec.md'), // From project root
  join(process.cwd(), 'apps/api/src/specs/acp-product-feed-spec.md'), // Monorepo root
];
```

The service now tries each path until it finds the spec file, making it work in both development and production environments.

## Verification

Run the diagnostic test to verify the fix:

```bash
cd apps/api
node test-llm-validation.js
```

Expected output:

```
✅ Loaded ACP spec from: /path/to/src/specs/acp-product-feed-spec.md
LLM validation available: ✅ Yes
```

## How to Use

### 1. Configure Your Environment

```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your OpenRouter API key
# Get your key from: https://openrouter.ai/keys
nano .env
```

Add to `.env`:

```bash
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxx
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet
```

### 2. Build and Start the Server

```bash
npm run build
npm run dev
```

You should see:

```
✅ Loaded ACP spec from: /Users/pravda/development/personal/easy-acp/apps/api/src/specs/acp-product-feed-spec.md
🚀 API server running on http://localhost:3001
```

### 3. Test the Validation

#### Option A: Use the Test Script

```bash
cd apps/api
./test-api.sh
```

#### Option B: Use cURL Manually

```bash
# Check status
curl http://localhost:3001/api/product-feed/llm/status

# Validate a product
curl -X POST http://localhost:3001/api/product-feed/llm/validate-one \
  -H "Content-Type: application/json" \
  -d '{
    "product": {
      "id": "TEST-001",
      "title": "Test Product",
      "price": "29.99 USD"
    }
  }'

# Upload CSV with LLM validation
curl -X POST http://localhost:3001/api/product-feed/upload-with-llm \
  -F "file=@../../example-products.csv"
```

## API Endpoints

The following endpoints are now working:

1. **GET /api/product-feed/llm/status**
   - Check if LLM validation is available

2. **POST /api/product-feed/llm/validate**
   - Validate multiple products with LLM

3. **POST /api/product-feed/llm/validate-one**
   - Validate a single product with LLM

4. **POST /api/product-feed/upload-with-llm**
   - Upload CSV and get both traditional + LLM validation

## Features Now Working

- ✅ ACP spec file loading from source directory
- ✅ OpenRouter LLM integration
- ✅ Intelligent CSV validation
- ✅ Quality scoring (0-100)
- ✅ Detailed issue reporting (errors, warnings, info)
- ✅ Actionable suggestions
- ✅ Batch processing with concurrency control
- ✅ Graceful fallback when LLM unavailable

## Example Response

When you validate a product, you'll get:

```json
{
  "success": true,
  "data": {
    "isValid": false,
    "overallScore": 72,
    "issues": [
      {
        "field": "gtin",
        "severity": "error",
        "message": "Missing required field: gtin or mpn must be provided",
        "suggestion": "Add a GTIN (8-14 digits) or Manufacturer Part Number"
      },
      {
        "field": "enable_search",
        "severity": "error",
        "message": "Missing required field: enable_search",
        "suggestion": "Set enable_search to true or false"
      },
      {
        "field": "title",
        "severity": "warning",
        "message": "Title should avoid all-caps formatting",
        "suggestion": "Use proper capitalization for better readability"
      }
    ],
    "suggestions": [
      "Add all required OpenAI flags (enable_search, enable_checkout)",
      "Include product identifiers (GTIN or MPN)",
      "Ensure all URLs use HTTPS for security"
    ],
    "summary": "Product has 2 required field errors and 1 formatting warning. Quality score: 72/100"
  }
}
```

## Documentation

- **Full Documentation**: `docs/LLM_VALIDATION.md`
- **Testing Guide**: `apps/api/TESTING.md`
- **ACP Specification**: `apps/api/src/specs/acp-product-feed-spec.md`

## Troubleshooting

If it's still not working:

1. **Check the diagnostic output:**

   ```bash
   node test-llm-validation.js
   ```

2. **Verify your API key:**
   - Make sure it's not the placeholder value
   - Test it at https://openrouter.ai/keys

3. **Check server logs:**
   - Look for "Loaded ACP spec from:" message
   - Check for any error messages

4. **Rebuild the project:**
   ```bash
   npm run build
   ```

## Additional Notes

- The LLM validation is optional and gracefully falls back to traditional validation
- Each LLM validation call takes 2-5 seconds
- Default model is Claude 3.5 Sonnet (can be changed in .env)
- Costs vary by model - check OpenRouter pricing
- The system batches requests to avoid rate limits

## Next Steps

1. Test with your own CSV files
2. Integrate the frontend to use the new endpoints
3. Monitor validation results and improve your product data
4. Adjust the OPENROUTER_MODEL if needed for cost/quality balance
