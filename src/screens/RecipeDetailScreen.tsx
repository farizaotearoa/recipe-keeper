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

import { Recipe } from '../types/recipe';
import { colors } from '../theme';
import {
  formatIngredientLine,
  scaleIngredient,
  scaleServings,
} from '../utils/scaleIngredients';

type Props = {
  recipe: Recipe;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

const SCALE_OPTIONS = [
  { label: 'Half', factor: 0.5 },
  { label: 'Original', factor: 1 },
  { label: 'Double', factor: 2 },
];

export function RecipeDetailScreen({ recipe, onBack, onEdit, onDelete }: Props) {
  const [scaleFactor, setScaleFactor] = useState(1);
  const [customScale, setCustomScale] = useState('');

  const scaledServings = useMemo(
    () => scaleServings(recipe.servings, scaleFactor),
    [recipe.servings, scaleFactor],
  );

  const scaledIngredients = useMemo(
    () => recipe.ingredients.map((ingredient) => scaleIngredient(ingredient, scaleFactor)),
    [recipe.ingredients, scaleFactor],
  );

  function applyCustomScale() {
    const parsed = Number(customScale.replace(',', '.'));
    if (!Number.isFinite(parsed) || parsed <= 0) {
      Alert.alert('Invalid scale', 'Enter a positive number, like 0.5 for half.');
      return;
    }

    setScaleFactor(parsed);
  }

  function confirmDelete() {
    Alert.alert('Delete recipe?', `Remove "${recipe.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onDelete },
    ]);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.topBar}>
        <Pressable onPress={onBack}>
          <Text style={styles.link}>Back</Text>
        </Pressable>
        <View style={styles.topActions}>
          <Pressable onPress={onEdit}>
            <Text style={styles.link}>Edit</Text>
          </Pressable>
          <Pressable onPress={confirmDelete}>
            <Text style={styles.dangerLink}>Delete</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{recipe.title}</Text>
        <Text style={styles.servings}>
          {scaledServings} serving{scaledServings === 1 ? '' : 's'}
          {scaleFactor !== 1 ? ` (${scaleFactor}x)` : ''}
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scale recipe</Text>
          <View style={styles.scaleRow}>
            {SCALE_OPTIONS.map((option) => {
              const active = scaleFactor === option.factor;
              return (
                <Pressable
                  key={option.label}
                  style={[styles.scaleChip, active && styles.scaleChipActive]}
                  onPress={() => {
                    setScaleFactor(option.factor);
                    setCustomScale('');
                  }}
                >
                  <Text style={[styles.scaleChipText, active && styles.scaleChipTextActive]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.customScaleRow}>
            <TextInput
              style={styles.customInput}
              value={customScale}
              onChangeText={setCustomScale}
              placeholder="Custom (e.g. 0.5)"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
            />
            <Pressable style={styles.applyButton} onPress={applyCustomScale}>
              <Text style={styles.applyButtonText}>Apply</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          {scaledIngredients.map((ingredient) => (
            <View key={ingredient.id} style={styles.ingredientRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.ingredientText}>{formatIngredientLine(ingredient)}</Text>
            </View>
          ))}
        </View>

        {recipe.instructions.trim() ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            <Text style={styles.instructions}>{recipe.instructions}</Text>
          </View>
        ) : null}
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
  topActions: {
    flexDirection: 'row',
    gap: 16,
  },
  link: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 16,
  },
  dangerLink: {
    color: colors.danger,
    fontWeight: '600',
    fontSize: 16,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  servings: {
    marginTop: 8,
    fontSize: 15,
    color: colors.textMuted,
  },
  section: {
    marginTop: 24,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  scaleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  scaleChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scaleChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  scaleChipText: {
    color: colors.text,
    fontWeight: '600',
  },
  scaleChipTextActive: {
    color: '#fff',
  },
  customScaleRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  customInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.text,
  },
  applyButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 12,
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
    width: 16,
    color: colors.primary,
    fontSize: 16,
    lineHeight: 22,
  },
  ingredientText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    color: colors.text,
  },
  instructions: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
  },
});
