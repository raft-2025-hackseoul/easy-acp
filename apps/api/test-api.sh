#!/bin/bash

# Test script for LLM validation API
# Make sure the server is running: npm run dev

API_URL="http://localhost:3001/api/product-feed"
CSV_FILE="../../example-products.csv"

echo "🧪 Testing LLM Validation API"
echo "================================"
echo ""

# Check if server is running
echo "1️⃣ Checking if API server is running..."
if curl -s "${API_URL%/product-feed}/health" > /dev/null 2>&1; then
    echo "   ✅ Server is running"
else
    echo "   ❌ Server is not running!"
    echo "   Start it with: npm run dev"
    exit 1
fi
echo ""

# Check LLM validation status
echo "2️⃣ Checking LLM validation status..."
STATUS=$(curl -s "$API_URL/llm/status")
echo "   Response: $STATUS"

AVAILABLE=$(echo "$STATUS" | grep -o '"available":[^,}]*' | grep -o 'true\|false')
if [ "$AVAILABLE" = "true" ]; then
    echo "   ✅ LLM validation is available"
else
    echo "   ❌ LLM validation is not available"
    echo "   Check your OPENROUTER_API_KEY in .env"
    exit 1
fi
echo ""

# Test validation with sample product
echo "3️⃣ Testing LLM validation with sample product..."
SAMPLE_PRODUCT='{
  "product": {
    "id": "TEST-001",
    "title": "Test Product",
    "description": "This is a test product",
    "price": "29.99 USD",
    "image_link": "https://example.com/image.jpg",
    "link": "https://example.com/product",
    "brand": "TestBrand",
    "availability": "in_stock",
    "inventory_quantity": 100
  }
}'

RESULT=$(curl -s -X POST "$API_URL/llm/validate-one" \
  -H "Content-Type: application/json" \
  -d "$SAMPLE_PRODUCT")

echo "   Response received (truncated):"
echo "$RESULT" | python3 -m json.tool 2>/dev/null | head -30

IS_VALID=$(echo "$RESULT" | grep -o '"isValid":[^,}]*' | grep -o 'true\|false')
SCORE=$(echo "$RESULT" | grep -o '"overallScore":[0-9]*' | grep -o '[0-9]*')

if [ -n "$IS_VALID" ]; then
    echo ""
    echo "   Validation Result:"
    echo "   - Is Valid: $IS_VALID"
    echo "   - Quality Score: ${SCORE:-N/A}/100"
    echo "   ✅ LLM validation working!"
else
    echo "   ⚠️ Unexpected response format"
fi
echo ""

# Test CSV upload (if file exists)
if [ -f "$CSV_FILE" ]; then
    echo "4️⃣ Testing CSV upload with LLM validation..."
    echo "   Uploading: $CSV_FILE"

    UPLOAD_RESULT=$(curl -s -X POST "$API_URL/upload-with-llm" \
      -F "file=@$CSV_FILE")

    SUCCESS=$(echo "$UPLOAD_RESULT" | grep -o '"success":[^,}]*' | grep -o 'true\|false')

    if [ "$SUCCESS" = "true" ]; then
        TOTAL=$(echo "$UPLOAD_RESULT" | grep -o '"totalRows":[0-9]*' | grep -o '[0-9]*')
        VALID=$(echo "$UPLOAD_RESULT" | grep -o '"validProducts":[0-9]*' | grep -o '[0-9]*')
        echo "   ✅ Upload successful!"
        echo "   - Total rows: ${TOTAL:-N/A}"
        echo "   - Valid products: ${VALID:-N/A}"

        HAS_LLM=$(echo "$UPLOAD_RESULT" | grep -o '"hasLLMValidation":[^,}]*' | grep -o 'true\|false')
        echo "   - LLM validation: $HAS_LLM"
    else
        echo "   ❌ Upload failed"
        echo "$UPLOAD_RESULT" | python3 -m json.tool 2>/dev/null | head -20
    fi
else
    echo "4️⃣ Skipping CSV upload test (file not found: $CSV_FILE)"
fi
echo ""

echo "================================"
echo "✅ API Tests Complete!"
echo ""
echo "Next steps:"
echo "  - Test with your own CSV files"
echo "  - Integrate with the frontend"
echo "  - Check validation results in detail"
