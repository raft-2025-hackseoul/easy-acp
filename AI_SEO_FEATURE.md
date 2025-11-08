# AI SEO Feature Documentation

## Overview

The **AI SEO** feature helps small business owners optimize their product listings for maximum visibility in ChatGPT's ACP (Affiliate Content Protocol). This tool uses AI to provide field-by-field optimization suggestions for your products.

## Features

### 🎯 AI-Powered Optimizations
- **Field-by-Field Suggestions**: Get specific recommendations for each product field
- **Impact Assessment**: Each suggestion is rated (high/medium/low impact)
- **Before/After Comparison**: See current vs. suggested values side-by-side
- **Detailed Reasoning**: Understand why each change will improve visibility

### 📊 Analytics Dashboard
- **Overall Scores**: Current SEO score (1-10) for each product
- **Potential Improvement**: Percentage increase in visibility potential
- **Aggregate Statistics**: Total suggestions, average scores, and more

### 📥 Export Functionality
- Export optimized product feed as CSV
- Ready to upload to your e-commerce platform
- Preserves all original data while applying optimizations

## File Structure

### Frontend Components

```
apps/web/src/
├── pages/
│   ├── AISEOPage.tsx          # Main AI SEO page component
│   └── AISEOPage.css          # Page styling
├── components/
│   ├── OptimizationSuggestions.tsx  # Shows product optimizations
│   └── OptimizationSuggestions.css
└── services/
    └── api.ts                 # API service functions (updated)
```

### Backend Services

```
apps/api/src/
├── services/
│   └── ai-seo.service.ts      # AI SEO analysis logic
└── routes/
    └── ai-seo.routes.ts       # API endpoints
```

## API Endpoints

### POST `/api/ai-seo/analyze`
Analyzes uploaded product CSV and returns trend analysis + optimization suggestions.

**Request**: `multipart/form-data` with CSV file
**Response**:
```json
{
  "success": true,
  "data": {
    "totalProducts": 50,
    "trendAnalysis": {
      "category": "Electronics",
      "trends": ["..."],
      "searchTerms": ["..."],
      "competitiveInsights": ["..."],
      "summary": "..."
    },
    "productOptimizations": [
      {
        "productId": "123",
        "productName": "Product Name",
        "overallScore": 7,
        "potentialImprovement": 25,
        "optimizations": [
          {
            "field": "description",
            "currentValue": "...",
            "suggestedValue": "...",
            "reasoning": "...",
            "impact": "high"
          }
        ]
      }
    ],
    "summary": "Overall analysis summary",
    "timestamp": "2025-11-08T..."
  }
}
```

### POST `/api/ai-seo/export`
Exports optimized products to CSV.

**Request**:
```json
{
  "products": [...]
}
```

**Response**: CSV file download

### GET `/api/ai-seo/status`
Checks if AI SEO service is available (API keys configured).

## How to Use

### 1. Setup
Ensure you have either OpenAI or OpenRouter API key configured:

```bash
# .env file
OPENAI_API_KEY=your-openai-key
# OR
OPENROUTER_API_KEY=your-openrouter-key
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet
```

### 2. Navigate to AI SEO Page
Click on "AI SEO" in the sidebar navigation.

### 3. Upload Product CSV
Drag and drop your product catalog CSV file or click to browse.

### 4. Review Optimizations
The page will display:
- **Summary**: Overview of analyzed products and potential improvements
- **Product Optimizations**: Expandable cards for each product showing:
  - Current SEO score
  - Potential improvement percentage
  - Field-by-field optimization suggestions
  - Before/after comparison
  - Reasoning for each change

### 5. Export Optimized Feed
Click "Export Optimized CSV" to download your improved product feed.

## Technical Details

### AI Analysis Process

1. **CSV Parsing**: Uploaded file is parsed and validated
2. **Product Name Extraction**: 
   - Intelligently detects product names from various field formats
   - Supports: `title`, `name`, `product_name`, `product_title`, etc.
   - Auto-generates IDs from `id`, `product_id`, `sku`, etc.
3. **Product Optimization**:
   - Products are processed in batches (3 at a time)
   - Up to 50 products analyzed per upload
   - Each product receives:
     - Overall SEO score (1-10)
     - Field-specific suggestions
     - Impact ratings (high/medium/low)
     - Detailed reasoning
4. **Result Compilation**: All data is aggregated and returned to frontend

### API Integration

The service uses:
- **OpenRouter** (preferred): For Claude 3.5 Sonnet access
- **OpenAI** (fallback): For GPT-4o-mini

Prompts are engineered to:
- Request JSON responses for parsing
- Focus on ChatGPT/ACP optimization
- Incorporate current trends
- Provide actionable suggestions

### Cost Considerations

- Analysis is limited to first 50 products to control API costs
- Products are batched (3 per request) to optimize API usage
- Fallback responses are provided if API calls fail
- No separate trend analysis call needed

## User Interface

### Main Page Layout

1. **Header Section**
   - Clean title and subtitle
   - Minimal, professional design

2. **File Upload Area**
   - Drag-and-drop interface
   - Loading spinner during analysis

3. **Results Section**
   - Summary card with overall insights
   - Optimization suggestions (expandable product cards)
   - Export button
   - Reset button to analyze another file

### Design Highlights

- **Clean shadcn/ui Style**: Neutral colors with subtle borders
- **Impact Badges**: Color-coded (red=high, yellow=medium, green=low)
- **Expandable Cards**: Click to reveal detailed optimizations
- **Responsive Design**: Works on desktop and mobile
- **Loading States**: Spinner and progress messages during analysis
- **Minimal Shadows**: Subtle depth without heavy effects

## Navigation Integration

The AI SEO page is integrated into:
- **App.tsx**: Route added at `/ai-seo`
- **Sidebar.tsx**: Navigation link "AI SEO"

## Error Handling

The feature handles:
- Missing API keys (graceful degradation)
- CSV parsing errors
- API request failures (with fallback data)
- Invalid file uploads
- Network timeouts

## Future Enhancements

Possible improvements:
- [ ] Process all products (currently limited to 50)
- [ ] Batch export with progress tracking
- [ ] A/B testing suggestions
- [ ] Historical trend tracking
- [ ] Custom optimization rules
- [ ] Integration with product feed workflow
- [ ] Saved optimization templates

## Dependencies

### Frontend
- `react`: UI framework
- `react-dropzone`: File upload
- Existing components: `FileUpload`

### Backend
- `openai`: AI API client
- `express`: Web framework
- `multer`: File upload handling

## Testing

To test the feature:

1. Start the backend:
```bash
cd apps/api
npm run dev
```

2. Start the frontend:
```bash
cd apps/web
npm run dev
```

3. Navigate to `http://localhost:5173/ai-seo`

4. Upload a CSV file with products (see `example-products.csv`)

5. Review the analysis and suggestions

## Troubleshooting

### "AI SEO service not available"
- Check that `OPENAI_API_KEY` or `OPENROUTER_API_KEY` is set in `.env`
- Restart the backend server after adding keys

### Analysis takes too long
- The service analyzes up to 50 products in batches of 3
- Each batch takes ~5-10 seconds
- Consider reducing product count for testing

### Products showing "Unknown" names
- Ensure CSV has proper product name fields (`title`, `name`, `product_name`, etc.)
- Check that CSV headers are not empty
- Review backend logs for parsing errors

## Credits

Built for Easy ACP - helping small business owners optimize for ChatGPT's Affiliate Content Protocol.

## License

Part of the Easy ACP project.

