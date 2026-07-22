import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export function ProgressBar({ ratio }: { ratio: number }) {
  const theme = useTheme();
  const clamped = Math.max(0, Math.min(ratio, 1));
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, { toValue: clamped, duration: 450, useNativeDriver: false }).start();
  }, [clamped, widthAnim]);

  const styles = StyleSheet.create({
    track: {
      height: 8,
      borderRadius: theme.radii.pill,
      backgroundColor: theme.colors.border,
      overflow: 'hidden',
      width: '100%',
    },
    fill: {
      height: '100%',
      borderRadius: theme.radii.pill,
      backgroundColor: clamped >= 1 ? theme.colors.success : theme.colors.primary,
    },
  });

  return (
    <View style={styles.track}>
      <Animated.View
        style={[
          styles.fill,
          { width: widthAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
        ]}
      />
    </View>
  );
}
