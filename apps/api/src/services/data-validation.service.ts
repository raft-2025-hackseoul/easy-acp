import { FieldMappingSuggestion, ACP_FIELDS } from '@repo/acp-types';

export interface DataValidationStats {
  fieldName: string;
  totalRows: number;
  emptyRows: number;
  emptyPercentage: number;
}

/**
 * Validate field data completeness for mapped fields
 * Counts how many products have empty/null values for each mapped field
 */
export function validateFieldData(
  products: any[],
  mappings: FieldMappingSuggestion[]
): DataValidationStats[] {
  const totalRows = products.length;
  const stats: DataValidationStats[] = [];

  // For each mapped field, calculate completeness statistics
  mappings.forEach((mapping) => {
    const fieldName = mapping.targetField;
    let emptyRows = 0;

    // Count empty/null values across all products
    products.forEach((product) => {
      const value = product[fieldName];
      if (value === undefined || value === null || value === '') {
        emptyRows++;
      }
    });

    const emptyPercentage = totalRows > 0 ? Math.round((emptyRows / totalRows) * 100) : 0;

    stats.push({
      fieldName,
      totalRows,
      emptyRows,
      emptyPercentage,
    });
  });

  // Sort by empty percentage (descending) to highlight problematic fields
  return stats.sort((a, b) => b.emptyPercentage - a.emptyPercentage);
}

/**
 * Identify CSV columns that were not mapped to any ACP field
 */
export function getUnmappedColumns(
  csvHeaders: string[],
  mappings: FieldMappingSuggestion[]
): string[] {
  const mappedSourceFields = new Set(mappings.map((m) => m.sourceField));
  return csvHeaders.filter((header) => !mappedSourceFields.has(header));
}

/**
 * Get field metadata for a specific ACP field name
 */
export function getFieldMetadata(fieldName: string) {
  return ACP_FIELDS.find((f) => f.name === fieldName);
}
