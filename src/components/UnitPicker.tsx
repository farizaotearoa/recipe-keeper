import { Platform, StyleSheet, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import { getUnitOptions } from '../constants/recipeUnits';
import { colors } from '../theme';

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function UnitPicker({ value, onChange }: Props) {
  const options = getUnitOptions(value);

  return (
    <View style={styles.container}>
      <Picker
        selectedValue={value}
        onValueChange={onChange}
        style={styles.picker}
        dropdownIconColor={colors.textMuted}
        mode="dropdown"
      >
        {options.map((option) => (
          <Picker.Item key={option.value || 'none'} label={option.label} value={option.value} />
        ))}
      </Picker>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    ...Platform.select({
      android: {
        height: 50,
      },
      ios: {
        height: 120,
      },
    }),
  },
  picker: {
    color: colors.text,
    ...Platform.select({
      android: {
        marginVertical: -8,
      },
      ios: {
        height: 120,
      },
    }),
  },
});
