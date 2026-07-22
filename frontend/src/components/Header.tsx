import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

interface HeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string; // small uppercase accent-colored label above the title
  right?: React.ReactNode; // optional trailing slot (e.g. a compact badge)
}

export function Header({ title, subtitle, eyebrow, right }: HeaderProps) {
  const theme = useTheme();
  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
    },
    left: { flex: 1 },
    eyebrow: {
      fontSize: 13,
      fontWeight: theme.fontWeights.medium,
      color: theme.colors.primary,
      textTransform: 'uppercase',
      letterSpacing: 1.5,
      marginBottom: theme.spacing.xs,
    },
    title: { fontSize: theme.fontSizes.xxl, fontWeight: theme.fontWeights.bold, color: theme.colors.text },
    subtitle: { fontSize: theme.fontSizes.sm, color: theme.colors.textMuted, marginTop: theme.spacing.xs },
  });
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}
