import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

// Deterministic palette so the same name always gets the same color.
const PALETTE = ['#1D7F66', '#CFA24B', '#2F6659', '#4C8F78', '#B8883B', '#245A4C'];

function colorForName(name: string) {
  const hash = name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return PALETTE[hash % PALETTE.length];
}

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

interface AvatarProps {
  name: string;
  size?: number;
  /** Overrides the hashed palette color — e.g. a teal-tinted single-user profile avatar. */
  backgroundColor?: string;
  textColor?: string;
}

export function Avatar({ name, size = 40, backgroundColor, textColor }: AvatarProps) {
  const theme = useTheme();
  const resolvedBackground = backgroundColor ?? colorForName(name || '?');
  const resolvedText = textColor ?? theme.colors.white;
  const styles = StyleSheet.create({
    circle: {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: resolvedBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      color: resolvedText,
      fontWeight: theme.fontWeights.bold,
      fontSize: size * 0.4,
    },
  });
  return (
    <View style={styles.circle}>
      <Text style={styles.text}>{initialsFor(name)}</Text>
    </View>
  );
}
