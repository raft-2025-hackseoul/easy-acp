import Papa from 'papaparse';
import { PartialACPProduct } from '@repo/acp-types';

export interface ParsedCSVResult {
  success: boolean;
  data: PartialACPProduct[];
  headers: string[];
  totalRows: number;
  errors: string[];
}

/**
 * Parse CSV file to extract product data
 */
export function parseCSV(fileContent: string): ParsedCSVResult {
  const errors: string[] = [];

  try {
    const parsed = Papa.parse<Record<string, string>>(fileContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        // Normalize headers: trim whitespace and convert to lowercase
        return header.trim().toLowerCase().replace(/\s+/g, '_');
      },
    });

    if (parsed.errors.length > 0) {
      parsed.errors.forEach((error) => {
        errors.push(`Row ${error.row}: ${error.message}`);
      });
    }

    const headers = parsed.meta.fields || [];
    const data: PartialACPProduct[] = parsed.data.map((row, index) => {
      const product: Record<string, unknown> = {};

      // Convert row data to product object
      Object.keys(row).forEach((key) => {
        const value = row[key]?.trim();
        if (value) {
          // Handle boolean fields
          if (key === 'enable_search' || key === 'enable_checkout') {
            product[key] = value.toLowerCase() === 'true' || value === '1';
          }
          // Handle numeric fields
          else if (key === 'inventory_quantity' || key === 'popularity_score' || key === 'return_rate') {
            const num = parseFloat(value);
            if (!isNaN(num)) {
              product[key] = num;
            }
          }
          // Handle string fields
          else {
            product[key] = value;
          }
        }
      });

      // Ensure id is present
      if (!product.id) {
        product.id = `product_${index + 1}`;
      }

      return product;
    });

    return {
      success: errors.length === 0,
      data,
      headers,
      totalRows: data.length,
      errors,
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      headers: [],
      totalRows: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error parsing CSV'],
    };
  }
}

/**
 * Convert products to CSV format
 */
export function convertToCSV(products: PartialACPProduct[]): string {
  return Papa.unparse(products, {
    header: true,
    columns: undefined, // Include all fields
  });
}

/**
 * Convert products to JSON format
 */
export function convertToJSON(products: PartialACPProduct[]): string {
  return JSON.stringify(products, null, 2);
}
