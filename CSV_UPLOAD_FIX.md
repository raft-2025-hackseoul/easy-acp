# CSV Upload LLM Validation Fix

## Issue

When uploading a CSV file, the LLM validation would timeout or not respond because it was trying to validate **all products** in the file, which could take several minutes for large files.

## Root Cause

The `/api/product-feed/upload-with-llm` endpoint was calling `validateProductsCombined()` which would validate every single product with the LLM API:

- 15 products × 3-5 seconds each = 45-75 seconds
- This could exceed HTTP request timeouts
- Expensive API costs
- Poor user experience

## Solution

Modified the validation to use **sample-based LLM validation** by default:

1. **Default behavior**: Validates only the first **5 products** with LLM
2. **Configurable**: Can adjust via query parameter `?llmSampleSize=N` (max 50)
3. **All products**: Still get traditional validation
4. **Better logging**: Shows progress in server console
5. **Rate limiting**: Processes max 3 products concurrently

## How It Works Now

### CSV Upload Flow

1. ✅ Upload CSV file
2. ✅ Parse all products
3. ✅ Map fields with AI (all products)
4. ✅ **Traditional validation** (all products)
5. ✅ **LLM validation** (sample of 5 products by default)
6. ✅ Return results with both validations

### Benefits

- **Fast response**: ~15-20 seconds instead of 60+ seconds
- **Lower cost**: Only validate sample with LLM
- **Still useful**: Sample validation catches common issues
- **Flexible**: Can increase sample size if needed

## Usage

### Default (5 products with LLM)

```bash
curl -X POST http://localhost:3001/api/product-feed/upload-with-llm \
  -F "file=@products.csv"
```

Response includes:

```json
{
  "success": true,
  "data": {
    "totalRows": 15,
    "validation": {
      "traditional": {
        "totalErrors": 12,
        "totalWarnings": 8
      },
      "llm": {
        "totalProducts": 5,
        "overallSummary": "Validated 5 products. Average score: 72.3. (Sample of 5/15 products)"
      },
      "hasLLMValidation": true
    }
  }
}
```

### Custom Sample Size

Validate first 10 products with LLM:

```bash
curl -X POST "http://localhost:3001/api/product-feed/upload-with-llm?llmSampleSize=10" \
  -F "file=@products.csv"
```

Validate all products (use with caution!):

```bash
curl -X POST "http://localhost:3001/api/product-feed/upload-with-llm?llmSampleSize=50" \
  -F "file=@products.csv"
```

**Note**: Maximum llmSampleSize is 50 to prevent excessive costs and timeouts.

## Server Console Output

When processing a CSV, you'll now see helpful logging:

```
📊 Processing 15 products...
📊 LLM will validate first 5 products
🤖 LLM validating 5 of 15 products...
✅ LLM validation completed in 14.23s
```

## For Validating All Products

If you need to validate all products with LLM:

### Option 1: Use the dedicated endpoint (recommended)

```bash
# First, upload and map the CSV
curl -X POST http://localhost:3001/api/product-feed/upload \
  -F "file=@products.csv" > mapped_products.json

# Then validate with LLM in batches
curl -X POST http://localhost:3001/api/product-feed/llm/validate \
  -H "Content-Type: application/json" \
  -d @mapped_products.json
```

### Option 2: Increase sample size (not recommended for >20 products)

```bash
curl -X POST "http://localhost:3001/api/product-feed/upload-with-llm?llmSampleSize=50" \
  -F "file=@products.csv"
```

**Warning**: This can take several minutes and cost money!

## Configuration

You can customize the default behavior by editing `product-feed.routes.ts`:

```typescript
const validation = await validateProductsCombined(mappedProducts, {
  llmSampleSize: 10, // Default sample size
  maxConcurrent: 5, // Concurrent API requests
});
```

## Cost Estimation

Assuming each LLM validation costs ~$0.01:

| Products | Sample (5) | Sample (10) | All   |
| -------- | ---------- | ----------- | ----- |
| 15       | $0.05      | $0.10       | $0.15 |
| 50       | $0.05      | $0.10       | $0.50 |
| 100      | $0.05      | $0.10       | $1.00 |

## Troubleshooting

### Issue: LLM validation not included in response

**Check**:

```bash
curl http://localhost:3001/api/product-feed/llm/status
```

If not available:

- Verify `OPENROUTER_API_KEY` in `.env`
- Restart the server
- Check server console for errors

### Issue: Timeout on large files

**Solutions**:

- Use default sample size (5)
- Process in smaller batches
- Use traditional validation for quick checks
- Validate full set separately

### Issue: Want to validate more products

**Options**:

1. Increase sample size: `?llmSampleSize=20`
2. Process in batches using `/llm/validate` endpoint
3. Implement background job processing

## Testing

Test the fix with the debug script:

```bash
cd apps/api
node debug-upload.js
```

Expected output:

```
✅ Upload completed in 18.5s
- Has LLM validation: true
- LLM Summary: Validated 5 products... (Sample of 5/15 products)
```

## Next Steps

For production use:

1. **Monitor costs**: Track OpenRouter usage
2. **Adjust sample size**: Based on your needs
3. **Consider caching**: Cache validation results
4. **Background jobs**: For large files, process async
5. **User feedback**: Show progress to users

## Related Files

- `apps/api/src/services/validation.service.ts` - Sample-based validation logic
- `apps/api/src/routes/product-feed.routes.ts` - Upload endpoint with query params
- `docs/LLM_VALIDATION.md` - Full LLM validation documentation
