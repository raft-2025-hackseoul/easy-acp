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

    const prompt = `You are a data mapping assistant. Map CSV column headers to ACP (Agentic Commerce Protocol) product feed fields.

CSV Headers: ${csvHeaders.join(', ')}

${sampleData ? `Sample Data (first 3 rows):
${JSON.stringify(sampleData.slice(0, 3), null, 2)}` : ''}

ACP Fields:
${JSON.stringify(acpFieldNames, null, 2)}

For each CSV header, suggest the best matching ACP field. Return a JSON array with this structure:
[
  {
    "sourceField": "csv_column_name",
    "targetField": "acp_field_name",
    "confidence": 0.95,
    "reasoning": "brief explanation"
  }
]

Rules:
1. Only suggest mappings where you're confident (confidence > 0.5)
2. Each CSV field should map to at most one ACP field
3. Consider field names, descriptions, and sample data
4. If unsure, don't include the mapping

Return only valid JSON, no markdown formatting.`;

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
    const mappings = Array.isArray(parsedResponse)
      ? parsedResponse
      : parsedResponse.mappings || [];

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
      product_name: 'title',
      name: 'title',
      product_title: 'title',
      desc: 'description',
      product_description: 'description',
      cost: 'price',
      product_price: 'price',
      amount: 'price',
      stock: 'inventory_quantity',
      quantity: 'inventory_quantity',
      qty: 'inventory_quantity',
      in_stock: 'availability',
      stock_status: 'availability',
      image: 'image_link',
      img: 'image_link',
      photo: 'image_link',
      picture: 'image_link',
      url: 'link',
      product_url: 'link',
      manufacturer: 'brand',
      make: 'brand',
      type: 'product_type',
      cat: 'category',
      product_category: 'category',
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
