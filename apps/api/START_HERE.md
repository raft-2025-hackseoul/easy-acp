# Quick Start: CSV Validation with LLM

## The Problem (FIXED ✅)

CSV upload with LLM validation was not responding because it tried to validate ALL products, which could take minutes and timeout.

## The Solution

Now validates only a **sample** of products with LLM by default for fast response:

- Default: First **5 products** validated with LLM
- Configurable: Use `?llmSampleSize=N` to adjust (max 50)
- All products still get traditional validation
- Response time: ~15-20 seconds instead of 60+ seconds

---

## Setup (One-Time)

### 1. Configure Environment

```bash
# Make sure .env file exists and has your OpenRouter API key
OPENROUTER_API_KEY=your-actual-api-key-here
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet
```

Get your key from: https://openrouter.ai/keys

### 2. Start the Server

```bash
npm run build
npm run dev
```

You should see:

```
✅ Loaded ACP spec from: .../src/specs/acp-product-feed-spec.md
🚀 API server running on http://localhost:3001
```

---

## Test It Works

### Quick Test

```bash
# Test LLM is available
curl http://localhost:3001/api/product-feed/llm/status

# Expected: {"success":true,"data":{"available":true, ...}}
```

### Upload a CSV

```bash
# Upload the example CSV
curl -X POST http://localhost:3001/api/product-feed/upload-with-llm \
  -F "file=@../../example-products.csv"
```

**What happens:**

1. Parses all 15 products
2. Maps CSV columns to ACP fields using AI
3. Validates all 15 products traditionally
4. Validates first 5 products with LLM (configurable)
5. Returns in ~15-20 seconds

**Response includes:**

```json
{
  "success": true,
  "data": {
    "totalRows": 15,
    "products": [...],
    "validation": {
      "traditional": {
        "totalErrors": 12,
        "totalWarnings": 8
      },
      "llm": {
        "totalProducts": 5,
        "validProducts": 3,
        "invalidProducts": 2,
        "overallSummary": "Validated 5 products. Average score: 72.3. (Sample of 5/15 products)"
      },
      "hasLLMValidation": true
    }
  }
}
```

---

## Important Notes

### ✅ CSV Columns Are Flexible

Your CSV can have ANY column names! The system:

1. Uses AI to map your columns to ACP fields automatically
2. Works with various CSV formats
3. LLM validation understands context, not just fixed rules

Example CSV column names that work:

- `product_name` → maps to `title`
- `SKU` → maps to `id`
- `price_usd` → maps to `price`
- `stock_status` → maps to `availability`

### ⚙️ Configure Sample Size

```bash
# Validate first 10 products with LLM
curl -X POST "http://localhost:3001/api/product-feed/upload-with-llm?llmSampleSize=10" \
  -F "file=@products.csv"

# Validate more products (careful with costs!)
curl -X POST "http://localhost:3001/api/product-feed/upload-with-llm?llmSampleSize=20" \
  -F "file=@products.csv"
```

**Max: 50 products per request**

### 💰 Cost Awareness

Each LLM validation ~$0.01-0.02 depending on model:

| Sample Size | Estimated Cost |
| ----------- | -------------- |
| 5 (default) | ~$0.05         |
| 10          | ~$0.10         |
| 20          | ~$0.20         |
| 50 (max)    | ~$0.50         |

---

## API Endpoints

### 1. Check LLM Status

```bash
GET /api/product-feed/llm/status
```

### 2. Upload CSV with LLM Validation

```bash
POST /api/product-feed/upload-with-llm?llmSampleSize=5
Form-Data: file=<csv_file>
```

### 3. Validate Specific Products

```bash
POST /api/product-feed/llm/validate
Content-Type: application/json
Body: { "products": [...] }
```

### 4. Validate Single Product

```bash
POST /api/product-feed/llm/validate-one
Content-Type: application/json
Body: { "product": {...} }
```

---

## Troubleshooting

### "LLM validation is not available"

**Fix:**

1. Check `.env` has `OPENROUTER_API_KEY`
2. Verify key is not the placeholder value
3. Restart server: `npm run dev`
4. Check status: `curl http://localhost:3001/api/product-feed/llm/status`

### "hasLLMValidation: false" in response

**Possible causes:**

1. LLM validation failed (check server logs)
2. API key invalid or out of credits
3. Rate limit hit
4. Network issues

**Check server console for:**

```
🤖 LLM validating 5 of 15 products...
❌ LLM validation failed, continuing with traditional validation only: <error>
```

### Timeout or very slow response

**Solutions:**

1. Use default sample size (5) - fastest
2. Reduce sample: `?llmSampleSize=3`
3. Check server isn't processing other requests
4. Verify OpenRouter API is responsive

---

## Workflow

### Recommended Usage

1. **Quick validation** - Upload with default settings (5 product sample)
2. **Review sample results** - Check LLM feedback on first 5 products
3. **Fix common issues** - Apply LLM suggestions to your data
4. **Re-upload** - Verify improvements

### For Large Files (100+ products)

1. Upload normally (gets traditional validation)
2. Fix critical errors first
3. Then validate cleaned data with larger LLM sample

---

## Server Console Output

When working correctly, you'll see:

```
📊 Processing 15 products...
📊 LLM will validate first 5 products
🤖 LLM validating 5 of 15 products...
✅ LLM validation completed in 14.23s
```

---

## Next Steps

1. ✅ Upload your CSV files
2. ✅ Review LLM validation feedback
3. ✅ Improve your product data based on suggestions
4. ✅ Export cleaned data in ACP format

## Documentation

- **This Fix**: `CSV_UPLOAD_FIX.md` - Detailed fix explanation
- **Full Docs**: `docs/LLM_VALIDATION.md` - Complete LLM documentation
- **Testing**: `TESTING.md` - Testing guide
- **Issue Summary**: `ISSUE_FIX_SUMMARY.md` - Path resolution fix

## Support

If issues persist:

1. Check server console logs
2. Run diagnostic: `node test-llm-validation.js`
3. Test upload: `node debug-upload.js`
4. Review error messages carefully

---

**The system is now working and ready to validate your CSV files with AI! 🎉**
