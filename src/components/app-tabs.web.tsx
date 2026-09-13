import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { SymbolName } from '@/constants/denuncias';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="home" href="/" asChild>
            <TabButton
              label="Inicio"
              icon={{ ios: 'house', android: 'home', web: 'home' }}
            />
          </TabTrigger>
          <TabTrigger name="explore" href="/explore" asChild>
            <TabButton
              label="Explorar"
              icon={{ ios: 'safari', android: 'explore', web: 'explore' }}
            />
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

type TabButtonProps = TabTriggerSlotProps & {
  label: string;
  icon: SymbolName;
};

export function TabButton({ children: _children, isFocused, label, icon, ...props }: TabButtonProps) {
  const theme = useTheme();

  return (
    <Pressable {...props} style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}>
      <SymbolView
        name={icon}
        size={20}
        tintColor={isFocused ? theme.primary : theme.textSecondary}
      />
      <ThemedText type="small" themeColor={isFocused ? 'primary' : 'textSecondary'}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  const insets = useSafeAreaInsets();

  return (
    <View {...props} style={[styles.tabListContainer, { paddingBottom: insets.bottom || Spacing.two }]}>
      <ThemedView type="backgroundElement" style={styles.innerContainer}>
        {props.children}
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: Spacing.two,
    paddingHorizontal: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.four,
  },
  pressed: {
    opacity: 0.7,
  },
  tabButton: {
    alignItems: 'center',
    gap: 2,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.four,
  },
});
