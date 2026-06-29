import AsyncStorage from '@react-native-async-storage/async-storage';

import { Recipe, RecipeInput } from '../types/recipe';

const STORAGE_KEY = '@recipe_keeper/recipes';
const LEGACY_STORAGE_KEY = '@recipe_vault/recipes';

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

async function readAll(): Promise<Recipe[]> {
  let raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const legacy = await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) {
      await AsyncStorage.setItem(STORAGE_KEY, legacy);
      await AsyncStorage.removeItem(LEGACY_STORAGE_KEY);
      raw = legacy;
    }
  }
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as Recipe[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeAll(recipes: Recipe[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
}

export async function getRecipes(): Promise<Recipe[]> {
  const recipes = await readAll();
  return recipes.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export async function getRecipe(id: string): Promise<Recipe | null> {
  const recipes = await readAll();
  return recipes.find((recipe) => recipe.id === id) ?? null;
}

export async function saveRecipe(input: RecipeInput, id?: string): Promise<Recipe> {
  const recipes = await readAll();
  const now = new Date().toISOString();

  if (id) {
    const index = recipes.findIndex((recipe) => recipe.id === id);
    if (index === -1) {
      throw new Error('Recipe not found');
    }

    const updated: Recipe = {
      ...recipes[index],
      ...input,
      updatedAt: now,
    };
    recipes[index] = updated;
    await writeAll(recipes);
    return updated;
  }

  const created: Recipe = {
    id: createId(),
    ...input,
    createdAt: now,
    updatedAt: now,
  };
  recipes.push(created);
  await writeAll(recipes);
  return created;
}

export async function deleteRecipe(id: string): Promise<void> {
  const recipes = await readAll();
  await writeAll(recipes.filter((recipe) => recipe.id !== id));
}
