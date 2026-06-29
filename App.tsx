import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { HomeScreen } from './src/screens/HomeScreen';
import { RecipeDetailScreen } from './src/screens/RecipeDetailScreen';
import { RecipeFormScreen } from './src/screens/RecipeFormScreen';
import { deleteRecipe, getRecipe, getRecipes, saveRecipe } from './src/storage/recipes';
import { Recipe, RecipeInput } from './src/types/recipe';
import { colors } from './src/theme';

type Screen =
  | { name: 'home' }
  | { name: 'detail'; recipeId: string }
  | { name: 'form'; recipeId?: string };

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshRecipes = useCallback(async () => {
    const nextRecipes = await getRecipes();
    setRecipes(nextRecipes);
  }, []);

  useEffect(() => {
    refreshRecipes().finally(() => setLoading(false));
  }, [refreshRecipes]);

  useEffect(() => {
    async function loadActiveRecipe() {
      if (screen.name === 'detail') {
        const recipe = await getRecipe(screen.recipeId);
        setActiveRecipe(recipe);
        return;
      }

      if (screen.name === 'form' && screen.recipeId) {
        const recipe = await getRecipe(screen.recipeId);
        setActiveRecipe(recipe);
        return;
      }

      setActiveRecipe(null);
    }

    loadActiveRecipe();
  }, [screen]);

  async function handleSave(input: RecipeInput, id?: string) {
    await saveRecipe(input, id);
    await refreshRecipes();
    setScreen({ name: 'home' });
  }

  async function handleDelete(recipeId: string) {
    await deleteRecipe(recipeId);
    await refreshRecipes();
    setScreen({ name: 'home' });
  }

  if (loading) {
    return (
      <SafeAreaProvider>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
        <StatusBar style="dark" />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      {screen.name === 'home' ? (
        <HomeScreen
          recipes={recipes}
          onOpenRecipe={(recipeId) => setScreen({ name: 'detail', recipeId })}
          onAddRecipe={() => setScreen({ name: 'form' })}
        />
      ) : null}

      {screen.name === 'detail' && activeRecipe ? (
        <RecipeDetailScreen
          recipe={activeRecipe}
          onBack={() => setScreen({ name: 'home' })}
          onEdit={() => setScreen({ name: 'form', recipeId: activeRecipe.id })}
          onDelete={() => handleDelete(activeRecipe.id)}
        />
      ) : null}

      {screen.name === 'form' ? (
        <RecipeFormScreen
          recipe={screen.recipeId ? activeRecipe ?? undefined : undefined}
          onBack={() =>
            screen.recipeId
              ? setScreen({ name: 'detail', recipeId: screen.recipeId })
              : setScreen({ name: 'home' })
          }
          onSave={handleSave}
        />
      ) : null}

      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
