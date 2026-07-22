import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';

// A chevron-down glyph that smoothly rotates 180° when expanded, instead of
// swapping between separate ▲/▼ text glyphs.
export function ExpandChevron({ expanded, size = 16 }: { expanded: boolean; size?: number }) {
  const theme = useTheme();
  const rotation = useRef(new Animated.Value(expanded ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(rotation, { toValue: expanded ? 1 : 0, useNativeDriver: true, friction: 8, tension: 80 }).start();
  }, [expanded, rotation]);

  const rotate = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  return (
    <Animated.View style={{ transform: [{ rotate }] }}>
      <Feather name="chevron-down" size={size} color={theme.colors.textMuted} />
    </Animated.View>
  );
}
