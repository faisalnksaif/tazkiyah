import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../theme/ThemeProvider';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CircularProgressProps {
  ratio: number; // 0..1
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
}

// Ring track + animated teal progress arc, with centered content (score,
// percentage, etc.) overlaid via absolute positioning.
export function CircularProgress({ ratio, size = 208, strokeWidth = 14, children }: CircularProgressProps) {
  const theme = useTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(ratio, 1));
  const animatedRatio = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedRatio, { toValue: clamped, duration: 700, useNativeDriver: false }).start();
  }, [clamped, animatedRatio]);

  const strokeDashoffset = animatedRatio.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  const styles = StyleSheet.create({
    container: { width: size, height: size, alignItems: 'center', justifyContent: 'center' },
    overlay: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  });

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={theme.colors.border} strokeWidth={strokeWidth} fill="none" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.colors.primary}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </Svg>
      <View style={styles.overlay}>{children}</View>
    </View>
  );
}
