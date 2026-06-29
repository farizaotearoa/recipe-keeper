import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Ingredient, Recipe, RecipeInput } from '../types/recipe';
import { UnitPicker } from '../components/UnitPicker';
import { colors } from '../theme';

type Props = {
  recipe?: Recipe;
  onBack: () => void;
  onSave: (input: RecipeInput, id?: string) => Promise<void>;
};

type IngredientDraft = {
  id: string;
  amount: string;
  unit: string;
  name: string;
};

function createIngredientDraft(partial?: Partial<IngredientDraft>): IngredientDraft {
  return {
    id: partial?.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    amount: partial?.amount ?? '',
    unit: partial?.unit ?? 'g',
    name: partial?.name ?? '',
  };
}

function toDrafts(recipe?: Recipe): IngredientDraft[] {
  if (!recipe || recipe.ingredients.length === 0) {
    return [createIngredientDraft()];
  }

  return recipe.ingredients.map((ingredient) =>
    createIngredientDraft({
      id: ingredient.id,
      amount: ingredient.amount === null ? '' : String(ingredient.amount),
      unit: ingredient.unit,
      name: ingredient.name,
    }),
  );
}

export function RecipeFormScreen({ recipe, onBack, onSave }: Props) {
  const [title, setTitle] = useState(recipe?.title ?? '');
  const [servings, setServings] = useState(recipe ? String(recipe.servings) : '8');
  const [instructions, setInstructions] = useState(recipe?.instructions ?? '');
  const [ingredients, setIngredients] = useState<IngredientDraft[]>(() => toDrafts(recipe));
  const [saving, setSaving] = useState(false);

  const isEditing = useMemo(() => Boolean(recipe), [recipe]);

  function updateIngredient(id: string, field: keyof IngredientDraft, value: string) {
    setIngredients((current) =>
      current.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  }

  function addIngredient() {
    setIngredients((current) => [...current, createIngredientDraft()]);
  }

  function removeIngredient(id: string) {
    setIngredients((current) => {
      if (current.length === 1) {
        return [createIngredientDraft()];
      }
      return current.filter((item) => item.id !== id);
    });
  }

  async function handleSave() {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      Alert.alert('Missing title', 'Give your recipe a name, like Chocolate Cake.');
      return;
    }

    const parsedServings = Number(servings.replace(',', '.'));
    if (!Number.isFinite(parsedServings) || parsedServings <= 0) {
      Alert.alert('Invalid servings', 'Enter how many servings the original recipe makes.');
      return;
    }

    const parsedIngredients: Ingredient[] = [];
    for (const draft of ingredients) {
      const name = draft.name.trim();
      const unit = draft.unit.trim();
      const amountText = draft.amount.trim();

      if (!name && !unit && !amountText) {
        continue;
      }

      if (!name) {
        Alert.alert('Missing ingredient', 'Each ingredient needs a name.');
        return;
      }

      let amount: number | null = null;
      if (amountText) {
        const parsedAmount = Number(amountText.replace(',', '.'));
        if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
          Alert.alert('Invalid amount', `Check the amount for "${name}".`);
          return;
        }
        amount = parsedAmount;
      }

      parsedIngredients.push({
        id: draft.id,
        amount,
        unit,
        name,
      });
    }

    if (parsedIngredients.length === 0) {
      Alert.alert('Add ingredients', 'Add at least one ingredient to save the recipe.');
      return;
    }

    const input: RecipeInput = {
      title: trimmedTitle,
      servings: parsedServings,
      ingredients: parsedIngredients,
      instructions: instructions.trim(),
    };

    try {
      setSaving(true);
      await onSave(input, recipe?.id);
    } catch {
      Alert.alert('Save failed', 'Could not save the recipe. Try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.topBar}>
        <Pressable onPress={onBack}>
          <Text style={styles.link}>Cancel</Text>
        </Pressable>
        <Text style={styles.topTitle}>{isEditing ? 'Edit recipe' : 'New recipe'}</Text>
        <Pressable onPress={handleSave} disabled={saving}>
          <Text style={[styles.link, saving && styles.disabledLink]}>
            {saving ? 'Saving...' : 'Save'}
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Recipe name</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Chocolate Cake"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.label}>Original servings</Text>
        <TextInput
          style={styles.input}
          value={servings}
          onChangeText={setServings}
          placeholder="8"
          placeholderTextColor={colors.textMuted}
          keyboardType="decimal-pad"
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.label}>Ingredients</Text>
          <Pressable onPress={addIngredient}>
            <Text style={styles.link}>+ Add</Text>
          </Pressable>
        </View>

        {ingredients.map((ingredient, index) => (
          <View key={ingredient.id} style={styles.ingredientCard}>
            <View style={styles.ingredientHeader}>
              <Text style={styles.ingredientNumber}>#{index + 1}</Text>
              <Pressable onPress={() => removeIngredient(ingredient.id)}>
                <Text style={styles.dangerLink}>Remove</Text>
              </Pressable>
            </View>

            <View style={styles.row}>
              <View style={styles.amountField}>
                <Text style={styles.smallLabel}>Amount</Text>
                <TextInput
                  style={styles.input}
                  value={ingredient.amount}
                  onChangeText={(value) => updateIngredient(ingredient.id, 'amount', value)}
                  placeholder="250"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.unitField}>
                <Text style={styles.smallLabel}>Unit</Text>
                <UnitPicker
                  value={ingredient.unit}
                  onChange={(value) => updateIngredient(ingredient.id, 'unit', value)}
                />
              </View>
            </View>

            <Text style={styles.smallLabel}>Ingredient</Text>
            <TextInput
              style={styles.input}
              value={ingredient.name}
              onChangeText={(value) => updateIngredient(ingredient.id, 'name', value)}
              placeholder="plain flour"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        ))}

        <Text style={styles.label}>Instructions</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={instructions}
          onChangeText={setInstructions}
          placeholder="Mix dry ingredients, bake at 350°F for 30 minutes..."
          placeholderTextColor={colors.textMuted}
          multiline
          textAlignVertical="top"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  topTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  link: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 16,
  },
  disabledLink: {
    opacity: 0.5,
  },
  dangerLink: {
    color: colors.danger,
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  label: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  smallLabel: {
    marginBottom: 6,
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 16,
  },
  textArea: {
    minHeight: 120,
  },
  sectionHeader: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ingredientCard: {
    marginTop: 12,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ingredientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  ingredientNumber: {
    fontWeight: '700',
    color: colors.textMuted,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  amountField: {
    flex: 1,
  },
  unitField: {
    flex: 1.2,
  },
});
