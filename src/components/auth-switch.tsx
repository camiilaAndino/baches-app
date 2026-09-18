import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colores } from '@/constants/auth-colors';

type Props = {
  question: string;
  actionLabel: string;
  href: '/login' | '/registro';
};

export function AuthSwitch({ question, actionLabel, href }: Props) {
  return (
    <View>
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>o</Text>
        <View style={styles.dividerLine} />
      </View>

      <Text style={styles.question}>{question}</Text>

      <Link href={href} asChild>
        <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colores.line200,
  },
  dividerText: {
    fontSize: 12,
    color: Colores.textMuted,
  },
  question: {
    textAlign: 'center',
    fontSize: 13,
    color: Colores.textMuted,
    marginBottom: 10,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: Colores.asphalt900,
  },
  pressed: {
    opacity: 0.7,
  },
  buttonText: {
    color: Colores.asphalt900,
    fontSize: 15,
    fontWeight: '600',
  },
});
