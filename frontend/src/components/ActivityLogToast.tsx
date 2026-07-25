import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

interface ActivityLogToastProps {
  emoji: string;
  phrase: string;
  detail: string;
  onDone: () => void;
  duration?: number;
}

const SPARKLE_COUNT = 6;
const CLASSIC_SPARKLE_COLORS = ['#FFD700', '#72D4CE', '#FF9F5A', '#B5EAD7', '#FFC8DD', '#C7CEEA'];
const ISLAMIC_SPARKLE_COLORS_DARK = ['#E8C47A', '#72D4CE', '#5FBFAD', '#F2D9A4', '#9DE5DC', '#E3C16D'];
const ISLAMIC_SPARKLE_COLORS_LIGHT = ['#C9A45A', '#2E7C7B', '#3E9B8E', '#D8B26A', '#6CBAB0', '#A9823E'];

export function ActivityLogToast({ emoji, phrase, detail, onDone, duration = 2600 }: ActivityLogToastProps) {
  const theme = useTheme();
  const islamicSparkleColors = theme.mode === 'dark' ? ISLAMIC_SPARKLE_COLORS_DARK : ISLAMIC_SPARKLE_COLORS_LIGHT;
  const sparkleColors = theme.variant === 'islamic' ? islamicSparkleColors : CLASSIC_SPARKLE_COLORS;
  const translateY = useRef(new Animated.Value(60)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.72)).current;
  const shimmer = useRef(new Animated.Value(0)).current;
  const emojiScale = useRef(new Animated.Value(0.4)).current;

  const sparkles = useRef(
    Array.from({ length: SPARKLE_COUNT }, (_, i) => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(0),
      angle: (i / SPARKLE_COUNT) * 2 * Math.PI,
    }))
  ).current;

  useEffect(() => {
    // Entry: slide up + scale bounce
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, friction: 7, tension: 120, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 6, tension: 140, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();

    // Emoji bounce
    Animated.sequence([
      Animated.delay(120),
      Animated.spring(emojiScale, { toValue: 1.35, friction: 3, tension: 200, useNativeDriver: true }),
      Animated.spring(emojiScale, { toValue: 1, friction: 4, tension: 200, useNativeDriver: true }),
    ]).start();

    // Sparkle burst
    const sparkleAnims = sparkles.map((s) => {
      const dist = 28 + Math.random() * 14;
      return Animated.parallel([
        Animated.timing(s.opacity, { toValue: 1, duration: 100, delay: 100, useNativeDriver: true }),
        Animated.timing(s.x, { toValue: Math.cos(s.angle) * dist, duration: 520, delay: 100, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(s.y, { toValue: Math.sin(s.angle) * dist, duration: 520, delay: 100, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(s.opacity, { toValue: 0, duration: 260, delay: 360, useNativeDriver: true }),
      ]);
    });
    Animated.parallel(sparkleAnims).start();

    // Shimmer sweep
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 0, useNativeDriver: true }),
        Animated.delay(1400),
      ])
    ).start();

    // Exit
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, { toValue: 60, duration: 220, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.8, duration: 220, useNativeDriver: true }),
      ]).start(onDone);
    }, duration);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shimmerX = shimmer.interpolate({ inputRange: [0, 1], outputRange: [-120, 240] });

  const styles = StyleSheet.create({
    wrapper: {
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.lg,
      borderWidth: 1.5,
      borderColor: theme.variant === 'islamic'
        ? theme.mode === 'dark' ? 'rgba(114,212,206,0.45)' : 'rgba(46,124,123,0.3)'
        : theme.colors.primary + '55',
      paddingVertical: theme.spacing.sm + 2,
      paddingHorizontal: theme.spacing.md,
      overflow: 'hidden',
      minWidth: 260,
      maxWidth: 320,
    },
    shimmerBar: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: 60,
      backgroundColor: theme.variant === 'islamic'
        ? 'rgba(232,196,122,0.18)'
        : 'rgba(255,255,255,0.14)',
      transform: [{ skewX: '-16deg' }],
    },
    emojiWrap: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.variant === 'islamic'
        ? theme.mode === 'dark' ? 'rgba(114,212,206,0.18)' : 'rgba(46,124,123,0.1)'
        : theme.colors.primary + '18',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.sm,
    },
    emojiText: { fontSize: 20 },
    textWrap: { flex: 1 },
    phrase: {
      fontSize: theme.fontSizes.sm,
      fontWeight: theme.fontWeights.bold,
      color: theme.variant === 'islamic'
        ? theme.mode === 'dark' ? '#72D4CE' : '#2E7C7B'
        : theme.colors.primary,
      marginBottom: 1,
    },
    detail: {
      fontSize: theme.fontSizes.xs,
      color: theme.colors.textMuted,
    },
    sparkle: {
      position: 'absolute',
      width: 6,
      height: 6,
      borderRadius: 3,
      left: 20,
      top: 20,
    },
  });

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ translateY }, { scale }], opacity }]}>
      {/* Sparkles */}
      {sparkles.map((s, i) => (
        <Animated.View
          key={i}
          pointerEvents="none"
          style={[
            styles.sparkle,
            {
              backgroundColor: sparkleColors[i % sparkleColors.length],
              borderRadius: theme.variant === 'islamic' ? 1.5 : 3,
              opacity: s.opacity,
              transform: [
                { translateX: s.x },
                { translateY: s.y },
                { rotate: theme.variant === 'islamic' ? '45deg' : '0deg' },
              ],
            },
          ]}
        />
      ))}

      <View style={styles.card}>
        {/* Shimmer */}
        <Animated.View
          pointerEvents="none"
          style={[styles.shimmerBar, { transform: [{ translateX: shimmerX }, { skewX: '-16deg' }] }]}
        />

        {/* Emoji */}
        <View style={styles.emojiWrap}>
          <Animated.Text style={[styles.emojiText, { transform: [{ scale: emojiScale }] }]}>
            {emoji}
          </Animated.Text>
        </View>

        {/* Text */}
        <View style={styles.textWrap}>
          <Text style={styles.phrase}>{phrase}</Text>
          <Text style={styles.detail}>{detail}</Text>
        </View>
      </View>
    </Animated.View>
  );
}
