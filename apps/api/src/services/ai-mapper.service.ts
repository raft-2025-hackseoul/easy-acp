import OpenAI from 'openai';
import { FieldMappingSuggestion, ACPProduct } from '@repo/acp-types';
import { ACP_FIELDS } from '@repo/acp-types';

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

/**
 * Use AI to suggest field mappings from CSV headers to ACP fields
 */
export async function suggestFieldMapping(
  csvHeaders: string[],
  sampleData?: Record<string, string>[]
): Promise<FieldMappingSuggestion[]> {
  // Fallback to basic mapping if OpenAI is not configured
  if (!openai) {
    console.warn('OpenAI API key not configured, using basic field mapping');
    return basicFieldMapping(csvHeaders);
  }

  try {
    const acpFieldNames = ACP_FIELDS.map((f) => ({
      name: f.name,
      label: f.label,
      description: f.description,
      required: f.required,
    }));

    const prompt = `You are an expert data mapping assistant specializing in the OpenAI Agent Commerce Protocol (ACP). Map CSV column headers to ACP product feed fields according to the official specification.

## OpenAI ACP Overview
The Agent Commerce Protocol (ACP) is OpenAI's product feed specification for ChatGPT commerce integration. Products must be registered at chatgpt.com/merchants. The feed supports CSV, TSV, XML, or JSON formats with updates every 15 minutes.

## CSV Headers to Map
${csvHeaders.join(', ')}

${
  sampleData
    ? `## Sample Data (first 3 rows)
${JSON.stringify(sampleData.slice(0, 3), null, 2)}`
    : ''
}

## Available ACP Fields
${JSON.stringify(acpFieldNames, null, 2)}

## Key ACP Field Requirements (from official spec)
**Core Required Fields:**
- id (max 100 chars) - Unique product identifier
- title (max 150 chars) - Product name
- description (max 5,000 chars, plain text only)
- link - Product detail page URL (must resolve HTTP 200)
- price - Format: "amount currency_code" (e.g., "99.99 USD")
- availability - Values: in_stock, out_of_stock, preorder
- enable_search - Boolean for ChatGPT search visibility
- enable_checkout - Boolean for direct purchase (requires enable_search=true)
- inventory_quantity - Non-negative integer
- product_category - Taxonomy using ">" separator (e.g., "Electronics > Audio > Headphones")
- material (max 100 chars) - Primary material composition
- weight - With unit (e.g., "0.25 kg")
- image_link - Main product image URL (JPEG/PNG)
- seller_name (max 70 chars) - Merchant display name
- seller_url - Merchant website URL
- return_policy - Return policy URL
- return_window - Days allowed for returns

**Recommended Fields (for better ranking):**
- gtin (8-14 digits) or mpn (max 70 chars) - At least one recommended
- brand (max 70 chars) - Required except for movies, books, music
- condition - Values: new, refurbished, used
- popularity_score (0-5) - For ranking
- return_rate (0-100%) - Quality signal
- product_review_count, product_review_rating (0-5)
- seller_privacy_policy, seller_tos - Required if checkout enabled

## Mapping Instructions
For each CSV header, identify the best matching ACP field by:
1. Analyzing field names and their semantic meaning
2. Examining sample data values and formats
3. Considering ACP field requirements and constraints
4. Matching data types (string, number, boolean, enum)
5. Recognizing common field naming patterns:
   - Product identifiers: sku, product_id, item_id → id
   - Prices: cost, product_price, amount → price
   - Stock: quantity, qty, stock, in_stock → inventory_quantity, availability
   - Images: image, img, photo, picture → image_link
   - Categories: category, cat, type, product_category → product_category
   - Merchant info: seller, merchant, store → seller_name, seller_url

## Response Format
Return a JSON array with this exact structure:
[
  {
    "sourceField": "csv_column_name",
    "targetField": "acp_field_name",
    "confidence": 0.95,
    "reasoning": "Brief explanation of why this mapping makes sense"
  }
]

## Mapping Rules
1. Only suggest mappings with confidence > 0.5
2. Each CSV field maps to at most ONE ACP field
3. Consider both field names AND sample data values
4. Prioritize required ACP fields over optional ones
5. Match data types: numbers to numbers, booleans to booleans, etc.
6. For price fields, look for currency codes in data
7. For enum fields (availability, condition, gender), verify sample values match allowed values
8. If multiple CSV fields could map to the same ACP field, choose the best match
9. If uncertain, omit the mapping rather than guessing

Return ONLY valid JSON, no markdown formatting or explanations outside the JSON structure.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a data mapping expert specializing in e-commerce product feeds. Return only valid JSON.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content || '{}';
    const parsedResponse = JSON.parse(responseText);

    // Handle both direct array and wrapped array responses
    const mappings = Array.isArray(parsedResponse) ? parsedResponse : parsedResponse.mappings || [];

    return mappings.filter((m: FieldMappingSuggestion) => m.confidence > 0.5);
  } catch (error) {
    console.error('AI field mapping error:', error);
    return basicFieldMapping(csvHeaders);
  }
}

/**
 * Basic field mapping without AI (fallback)
 */
function basicFieldMapping(csvHeaders: string[]): FieldMappingSuggestion[] {
  const suggestions: FieldMappingSuggestion[] = [];

  csvHeaders.forEach((header) => {
    const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '_');

    // Direct matches
    const acpField = ACP_FIELDS.find(
      (f) => f.name.toLowerCase() === normalizedHeader || f.label.toLowerCase() === normalizedHeader
    );

    if (acpField) {
      suggestions.push({
        sourceField: header,
        targetField: acpField.name as keyof ACPProduct,
        confidence: 1.0,
        reasoning: 'Direct field name match',
      });
      return;
    }

    // Common variations
    const variations: Record<string, keyof ACPProduct> = {
      product_id: 'id',
      sku: 'id',
      item_id: 'id',
      product_name: 'title',
      name: 'title',
      product_title: 'title',
      desc: 'description',
      product_description: 'description',
      details: 'description',
      cost: 'price',
      product_price: 'price',
      amount: 'price',
      retail_price: 'price',
      stock: 'inventory_quantity',
      quantity: 'inventory_quantity',
      qty: 'inventory_quantity',
      stock_qty: 'inventory_quantity',
      in_stock: 'availability',
      stock_status: 'availability',
      available: 'availability',
      image: 'image_link',
      img: 'image_link',
      photo: 'image_link',
      picture: 'image_link',
      main_image: 'image_link',
      url: 'link',
      product_url: 'link',
      product_link: 'link',
      web_url: 'link',
      manufacturer: 'brand',
      make: 'brand',
      brand_name: 'brand',
      type: 'product_type',
      cat: 'product_category',
      category: 'product_category',
      product_cat: 'product_category',
      categories: 'product_category',
      seller: 'seller_name',
      merchant: 'seller_name',
      store: 'seller_name',
      vendor: 'seller_name',
      seller_website: 'seller_url',
      merchant_url: 'seller_url',
      store_url: 'seller_url',
      returns: 'return_policy',
      return_policy_url: 'return_policy',
      returns_url: 'return_policy',
      return_days: 'return_window',
      return_period: 'return_window',
      returns_window: 'return_window',
      product_weight: 'weight',
      item_weight: 'weight',
      shipping_weight: 'weight',
      materials: 'material',
      composition: 'material',
      made_of: 'material',
      upc: 'gtin',
      ean: 'gtin',
      isbn: 'gtin',
      barcode: 'gtin',
      part_number: 'mpn',
      mfr_part_number: 'mpn',
      model_number: 'mpn',
      rating: 'product_review_rating',
      review_rating: 'product_review_rating',
      avg_rating: 'product_review_rating',
      review_count: 'product_review_count',
      num_reviews: 'product_review_count',
      reviews: 'raw_review_data',
      customer_reviews: 'raw_review_data',
    };

    const matchedField = variations[normalizedHeader];
    if (matchedField) {
      const acpFieldMeta = ACP_FIELDS.find((f) => f.name === matchedField);
      if (acpFieldMeta) {
        suggestions.push({
          sourceField: header,
          targetField: matchedField,
          confidence: 0.8,
          reasoning: 'Common field name variation',
        });
      }
    }
  });

  return suggestions;
}

/**
 * Apply field mapping to transform CSV data to ACP format
 */
export function applyFieldMapping(
  csvData: Record<string, string>[],
  mappings: FieldMappingSuggestion[]
): any[] {
  return csvData.map((row) => {
    const mapped: any = {};

    mappings.forEach((mapping) => {
      const sourceValue = row[mapping.sourceField];
      if (sourceValue !== undefined && sourceValue !== null && sourceValue !== '') {
        const targetField = mapping.targetField;

        // Handle type conversions
        const fieldMeta = ACP_FIELDS.find((f) => f.name === targetField);
        if (fieldMeta) {
          if (fieldMeta.type === 'number') {
            const num = parseFloat(sourceValue);
            mapped[targetField] = isNaN(num) ? sourceValue : num;
          } else if (fieldMeta.type === 'boolean') {
            mapped[targetField] =
              sourceValue.toLowerCase() === 'true' ||
              sourceValue === '1' ||
              sourceValue.toLowerCase() === 'yes';
          } else {
            mapped[targetField] = sourceValue.trim();
          }
        } else {
          mapped[targetField] = sourceValue.trim();
        }
      }
    });

    return mapped;
  });
}
