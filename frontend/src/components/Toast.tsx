import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { ToastMessage } from '../context/ToastContext';

const ICONS = {
  success: 'check-circle',
  error: 'alert-circle',
  info: 'info',
} as const;

export function Toast({ toast, onDone }: { toast: ToastMessage; onDone: () => void }) {
  const theme = useTheme();
  const translateY = useRef(new Animated.Value(16)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, friction: 9, tension: 80 }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, { toValue: 16, duration: 180, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start(onDone);
    }, toast.duration ?? 2200);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const variant = toast.variant ?? 'info';
  const accentColor = { success: theme.colors.primary, error: theme.colors.danger, info: theme.colors.primary }[variant];

  const styles = StyleSheet.create({
    toast: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    iconCircle: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: `${accentColor}22`,
      marginRight: theme.spacing.sm,
    },
    text: { color: theme.colors.text, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, flexShrink: 1 },
  });

  return (
    <Animated.View style={[styles.toast, { transform: [{ translateY }], opacity }]}>
      <View style={styles.iconCircle}>
        <Feather name={ICONS[variant]} size={16} color={accentColor} />
      </View>
      <Text style={styles.text}>{toast.message}</Text>
    </Animated.View>
  );
}
