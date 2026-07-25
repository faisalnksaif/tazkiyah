import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const theme = useTheme();
  const useIslamicTheme = theme.variant === 'islamic';
  const styles = StyleSheet.create({
    card: {
      backgroundColor: useIslamicTheme ? theme.colors.surface : theme.colors.surface,
      borderRadius: theme.radii.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      overflow: 'hidden',
      ...theme.shadow.card,
      borderWidth: useIslamicTheme ? 1 : 0,
      borderColor: useIslamicTheme ? theme.colors.border : 'transparent',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
    },
    orbA: {
      position: 'absolute',
      top: -30,
      left: -18,
      width: 142,
      height: 104,
      borderRadius: 90,
      backgroundColor: useIslamicTheme
        ? theme.mode === 'dark' ? 'rgba(114,212,206,0.14)' : 'rgba(90,183,178,0.11)'
        : 'rgba(29,127,102,0.08)',
      transform: [{ rotate: '-12deg' }],
    },
    orbB: {
      position: 'absolute',
      right: -24,
      bottom: -36,
      width: 142,
      height: 104,
      borderRadius: 90,
      backgroundColor: useIslamicTheme
        ? theme.mode === 'dark' ? 'rgba(232,196,122,0.16)' : 'rgba(213,181,106,0.12)'
        : 'rgba(207,162,75,0.08)',
      transform: [{ rotate: '12deg' }],
    },
    patternDotA: {
      position: 'absolute',
      top: 18,
      right: 24,
      width: 5,
      height: 5,
      borderRadius: 3,
      backgroundColor: useIslamicTheme
        ? theme.mode === 'dark' ? 'rgba(114,212,206,0.5)' : 'rgba(90,183,178,0.35)'
        : 'transparent',
    },
    patternDotB: {
      position: 'absolute',
      top: 28,
      right: 40,
      width: 3,
      height: 3,
      borderRadius: 2,
      backgroundColor: useIslamicTheme
        ? theme.mode === 'dark' ? 'rgba(232,196,122,0.55)' : 'rgba(213,181,106,0.42)'
        : 'transparent',
    },
    content: { zIndex: 1 },
  });
  return (
    <View style={[styles.card, style]}>
      {useIslamicTheme ? (
        <View pointerEvents="none" style={styles.backdrop}>
          <View style={styles.orbA} />
          <View style={styles.orbB} />
          <View style={styles.patternDotA} />
          <View style={styles.patternDotB} />
        </View>
      ) : null}
      <View style={styles.content}>{children}</View>
    </View>
  );
}
