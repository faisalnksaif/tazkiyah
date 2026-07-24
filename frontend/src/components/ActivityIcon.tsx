import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { getActivityIcon } from '../utils/activityIcons';

interface ActivityIconProps {
  name: string;
  complete: boolean;
}

// Large low-opacity watermark tucked in the card's corner — texture that
// belongs to the card itself rather than a separate badge/avatar floating
// on top of it. Fades in slightly + gives one gentle bounce when the
// activity completes for the day.
export function ActivityIcon({ name, complete }: ActivityIconProps) {
  const theme = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const wasComplete = useRef(complete);

  useEffect(() => {
    if (complete && !wasComplete.current) {
      scale.setValue(1);
      Animated.sequence([
        Animated.spring(scale, { toValue: 1.15, useNativeDriver: true, friction: 4, tension: 200 }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 5, tension: 200 }),
      ]).start();
    }
    wasComplete.current = complete;
  }, [complete, scale]);

  const styles = StyleSheet.create({
    watermark: { position: 'absolute', top: 2, right: 2 },
  });

  return (
    <Animated.View
      style={[styles.watermark, { transform: [{ scale }], opacity: complete ? 0.35 : 0.14 }]}
      pointerEvents="none"
    >
      <Feather name={getActivityIcon(name)} size={64} color={theme.colors.primary} />
    </Animated.View>
  );
}
