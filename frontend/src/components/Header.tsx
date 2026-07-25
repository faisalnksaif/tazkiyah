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
  const useIslamicTheme = theme.variant === 'islamic';
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
    ornamentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.sm,
      gap: theme.spacing.xs,
    },
    ornamentLine: {
      flex: 1,
      height: 1,
      backgroundColor: useIslamicTheme ? theme.colors.secondary : theme.colors.border,
      opacity: useIslamicTheme ? 0.8 : 0,
    },
    ornamentDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: useIslamicTheme ? theme.colors.primary : theme.colors.primary,
      opacity: useIslamicTheme ? 1 : 0,
    },
  });
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        {useIslamicTheme ? (
          <View style={styles.ornamentRow}>
            <View style={styles.ornamentLine} />
            <View style={styles.ornamentDot} />
            <View style={styles.ornamentLine} />
          </View>
        ) : null}
      </View>
      {right}
    </View>
  );
}
