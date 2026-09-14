import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type SearchBarProps = {
  value?: string;
  onChangeText?: (value: string) => void;
  placeholder?: string;
};

export function SearchBar({ value, onChangeText, placeholder }: SearchBarProps = {}) {
  const theme = useTheme();
  const [queryInterno, setQueryInterno] = useState('');
  const query = value ?? queryInterno;
  const setQuery = onChangeText ?? setQueryInterno;

  return (
    <ThemedView type="backgroundElement" style={styles.container}>
      <SymbolView
        name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
        size={16}
        tintColor={theme.textSecondary}
      />
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder={placeholder ?? 'Buscar por palabra clave o zona'}
        placeholderTextColor={theme.textSecondary}
        style={[styles.input, { color: theme.text }]}
      />
      {query.length > 0 && (
        <Pressable onPress={() => setQuery('')} hitSlop={8}>
          <SymbolView
            name={{ ios: 'xmark', android: 'close', web: 'close' }}
            size={14}
            tintColor={theme.textSecondary}
          />
        </Pressable>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
  },
  input: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
});
