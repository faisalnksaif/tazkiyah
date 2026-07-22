import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

interface InputFieldProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function InputField({ label, error, style, ...rest }: InputFieldProps) {
  const theme = useTheme();
  const styles = StyleSheet.create({
    container: { marginBottom: theme.spacing.md },
    label: { fontSize: theme.fontSizes.sm, color: theme.colors.textMuted, marginBottom: theme.spacing.xs },
    input: {
      borderWidth: error ? 1 : 0,
      borderColor: theme.colors.danger,
      borderRadius: theme.radii.sm,
      paddingVertical: theme.spacing.sm + 2,
      paddingHorizontal: theme.spacing.md,
      fontSize: theme.fontSizes.md,
      color: theme.colors.text,
      backgroundColor: theme.colors.background,
    },
    error: { color: theme.colors.danger, fontSize: theme.fontSizes.xs, marginTop: theme.spacing.xs },
  });

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput style={[styles.input, style]} placeholderTextColor={theme.colors.textMuted} {...rest} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}
