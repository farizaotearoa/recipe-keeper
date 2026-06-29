import { Ingredient } from '../types/recipe';

const FRACTIONS: Array<[number, string]> = [
  [0.125, '1/8'],
  [0.25, '1/4'],
  [0.333, '1/3'],
  [0.375, '3/8'],
  [0.5, '1/2'],
  [0.625, '5/8'],
  [0.667, '2/3'],
  [0.75, '3/4'],
  [0.875, '7/8'],
];

function formatFraction(value: number): string | null {
  const whole = Math.floor(value);
  const remainder = value - whole;

  if (remainder < 0.01) {
    return whole > 0 ? String(whole) : null;
  }

  for (const [decimal, label] of FRACTIONS) {
    if (Math.abs(remainder - decimal) < 0.02) {
      return whole > 0 ? `${whole} ${label}` : label;
    }
  }

  const rounded = Math.round(value * 100) / 100;
  return String(rounded);
}

export function formatAmount(amount: number | null): string {
  if (amount === null) {
    return '';
  }

  if (amount <= 0) {
    return '0';
  }

  return formatFraction(amount) ?? String(amount);
}

export function scaleIngredient(ingredient: Ingredient, factor: number): Ingredient {
  if (ingredient.amount === null) {
    return ingredient;
  }

  return {
    ...ingredient,
    amount: Math.round(ingredient.amount * factor * 1000) / 1000,
  };
}

export function scaleServings(servings: number, factor: number): number {
  return Math.round(servings * factor * 10) / 10;
}

export function formatIngredientLine(ingredient: Ingredient): string {
  const parts: string[] = [];

  if (ingredient.amount !== null) {
    parts.push(formatAmount(ingredient.amount));
  }

  if (ingredient.unit.trim()) {
    parts.push(ingredient.unit.trim());
  }

  parts.push(ingredient.name.trim());

  return parts.join(' ');
}
