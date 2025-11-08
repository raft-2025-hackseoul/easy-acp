# Testing LLM Validation

## Quick Start

### 1. Configure Environment

Make sure you have set up your `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and add your OpenRouter API key:

```bash
OPENROUTER_API_KEY=your-actual-api-key-here
```

### 2. Build and Run

```bash
# Build the project
npm run build

# Start the server
npm run dev
```

### 3. Test the Setup

Run the diagnostic test:

```bash
node test-llm-validation.js
```

Expected output:

```
✅ LLM validation should work!
LLM validation available: ✅ Yes
```

### 4. Test the API

In a new terminal, run the API test:

```bash
cd apps/api
chmod +x test-api.sh
./test-api.sh
```

## Manual Testing

### Check LLM Status

```bash
curl http://localhost:3001/api/product-feed/llm/status
```

Expected response:

```json
{
  "success": true,
  "data": {
    "available": true,
    "message": "LLM validation is available"
  }
}
```

### Validate a Single Product

```bash
curl -X POST http://localhost:3001/api/product-feed/llm/validate-one \
  -H "Content-Type: application/json" \
  -d '{
    "product": {
      "id": "TEST-001",
      "title": "Wireless Headphones",
      "description": "Premium headphones with noise cancellation",
      "price": "149.99 USD",
      "image_link": "https://example.com/headphones.jpg",
      "link": "https://example.com/products/headphones",
      "brand": "AudioPro",
      "availability": "in_stock",
      "inventory_quantity": 50,
      "enable_search": true,
      "enable_checkout": true
    }
  }'
```

### Upload CSV with LLM Validation

```bash
curl -X POST http://localhost:3001/api/product-feed/upload-with-llm \
  -F "file=@../../example-products.csv"
```

## Common Issues

### Issue: "LLM validation is not available"

**Cause**: OPENROUTER_API_KEY not configured

**Solution**:

1. Check your `.env` file exists
2. Verify OPENROUTER_API_KEY is set
3. Make sure it's not the placeholder value
4. Restart the server after changing .env

### Issue: "Failed to load ACP specification"

**Cause**: Spec file not found

**Solution**:
This should be fixed now with multiple path resolution, but if it still occurs:

1. Verify `src/specs/acp-product-feed-spec.md` exists
2. Run `npm run build` to recompile
3. Check the console for the actual path being used

### Issue: API returns 500 error

**Cause**: Various runtime errors

**Solution**:

1. Check server console logs for detailed error
2. Verify all dependencies are installed: `npm install`
3. Rebuild: `npm run build`
4. Check your OpenRouter API key is valid

### Issue: Validation is slow

**Cause**: LLM API calls take time

**Solution**:

- Each product takes 2-5 seconds to validate
- Use batch validation for multiple products
- Consider validating in background for large feeds
- Use traditional validation for quick checks

## Validation Response Format

### Single Product Validation

```json
{
  "success": true,
  "data": {
    "isValid": false,
    "overallScore": 65,
    "issues": [
      {
        "field": "gtin",
        "severity": "error",
        "message": "Missing required field: gtin or mpn",
        "suggestion": "Add a GTIN (8-14 digits) or MPN (max 70 chars)"
      }
    ],
    "suggestions": ["Add missing required fields", "Ensure URLs use HTTPS"],
    "summary": "Product has 3 errors and 2 warnings"
  }
}
```

### Batch Validation

```json
{
  "success": true,
  "data": {
    "totalProducts": 15,
    "validProducts": 12,
    "invalidProducts": 3,
    "results": [
      {
        "product": { ... },
        "validation": { ... }
      }
    ],
    "overallSummary": "Validated 15 products. Average quality score: 78.5. Found 12 errors and 8 warnings."
  }
}
```

## Performance Tips

### 1. Batch Products Wisely

- Default: 5 products at a time
- Adjust with `maxConcurrent` parameter
- Balance between speed and API limits

### 2. Choose the Right Model

- Fast: `openai/gpt-4o-mini`, `google/gemini-flash`
- Balanced: `anthropic/claude-3.5-sonnet` (recommended)
- Quality: `openai/gpt-4o`, `anthropic/claude-opus`

### 3. Cache Results

- Validate once, store results
- Re-validate only when product data changes
- Use traditional validation for quick checks

### 4. Monitor Costs

- Check OpenRouter dashboard
- Set usage limits
- Use LLM validation selectively

## Integration Examples

### React Frontend

```typescript
import { uploadCSVWithLLM, checkLLMValidationStatus } from './services/api';

// Check if available
const status = await checkLLMValidationStatus();
if (status.available) {
  // Upload with LLM validation
  const result = await uploadCSVWithLLM(file);

  if (result.data.validation.hasLLMValidation) {
    console.log('LLM Results:', result.data.validation.llm);
  }
}
```

### Node.js Backend

```javascript
const { validateProductsWithLLM } = require('./services/validation.service');

const products = [
  /* your products */
];
const result = await validateProductsWithLLM(products);

result.results.forEach(({ product, validation }) => {
  console.log(`${product.id}: ${validation.overallScore}/100`);
  validation.issues.forEach((issue) => {
    console.log(`  - ${issue.message}`);
  });
});
```

## Next Steps

1. ✅ Test with your own product data
2. ✅ Integrate with your frontend application
3. ✅ Set up monitoring and alerts
4. ✅ Configure rate limiting as needed
5. ✅ Review and act on validation feedback

## Support

For issues or questions:

- Check the main documentation: `docs/LLM_VALIDATION.md`
- Review API routes: `src/routes/product-feed.routes.ts`
- Check service implementation: `src/services/llm-validator.service.ts`
