export type RecipeUnitOption = {
  value: string;
  label: string;
};

export const RECIPE_UNITS: RecipeUnitOption[] = [
  { value: '', label: 'None' },
  { value: 'g', label: 'g (grams)' },
  { value: 'kg', label: 'kg (kilograms)' },
  { value: 'mg', label: 'mg (milligrams)' },
  { value: 'ml', label: 'ml (milliliters)' },
  { value: 'L', label: 'L (liters)' },
  { value: 'dl', label: 'dl (deciliters)' },
  { value: 'cl', label: 'cl (centiliters)' },
  { value: 'pcs', label: 'pcs (pieces)' },
];

export function getUnitOptions(currentUnit?: string): RecipeUnitOption[] {
  const normalized = currentUnit?.trim() ?? '';
  if (!normalized) {
    return RECIPE_UNITS;
  }

  const exists = RECIPE_UNITS.some((option) => option.value === normalized);
  if (exists) {
    return RECIPE_UNITS;
  }

  return [...RECIPE_UNITS, { value: normalized, label: `${normalized} (saved)` }];
}
