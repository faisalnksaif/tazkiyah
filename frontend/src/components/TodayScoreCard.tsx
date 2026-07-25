import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { CircularProgress } from './CircularProgress';
import { AnimatedNumber } from './AnimatedNumber';
import { Card } from './Card';

interface TodayScoreCardProps {
  score: number;
  maxScore: number;
}

export function TodayScoreCard({ score, maxScore }: TodayScoreCardProps) {
  const theme = useTheme();
  const useIslamicTheme = theme.variant === 'islamic';
  const ratio = maxScore > 0 ? score / maxScore : 0;
  const bob = useRef(new Animated.Value(0)).current;
  const halo = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const bobLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 2600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 2600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    const haloLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(halo, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(halo, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    const shimmerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 4200, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );

    bobLoop.start();
    haloLoop.start();
    shimmerLoop.start();

    return () => {
      bobLoop.stop();
      haloLoop.stop();
      shimmerLoop.stop();
    };
  }, [bob, halo, shimmer]);

  const styles = StyleSheet.create({
    card: {
      overflow: 'hidden',
      borderWidth: useIslamicTheme ? 1 : 0,
      borderColor: useIslamicTheme ? (theme.mode === 'dark' ? 'rgba(203,167,102,0.38)' : 'rgba(182,150,80,0.28)') : theme.colors.border,
      backgroundColor: useIslamicTheme ? (theme.mode === 'dark' ? '#1D3530' : '#F4EEDF') : theme.colors.surface,
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
    },
    ringGlow: {
      position: 'absolute',
      left: '50%',
      top: '50%',
      width: 238,
      height: 238,
      marginLeft: -119,
      marginTop: -119,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: useIslamicTheme ? (theme.mode === 'dark' ? 'rgba(216,177,106,0.22)' : 'rgba(182,150,80,0.18)') : 'rgba(95,203,160,0.12)',
      opacity: useIslamicTheme ? 1 : 0.35,
    },
    orbA: {
      position: 'absolute',
      top: -34,
      left: -18,
      width: 170,
      height: 120,
      borderRadius: 90,
      backgroundColor: useIslamicTheme ? (theme.mode === 'dark' ? 'rgba(109, 190, 163, 0.24)' : 'rgba(147, 198, 172, 0.22)') : 'rgba(95,203,160,0.12)',
      transform: [{ rotate: '-8deg' }],
    },
    orbB: {
      position: 'absolute',
      right: -24,
      bottom: -42,
      width: 170,
      height: 120,
      borderRadius: 90,
      backgroundColor: useIslamicTheme ? (theme.mode === 'dark' ? 'rgba(216, 177, 106, 0.2)' : 'rgba(211, 173, 98, 0.18)') : 'rgba(199,154,63,0.12)',
      transform: [{ rotate: '10deg' }],
    },
    floatLayer: {
      position: 'relative',
      zIndex: 1,
      alignItems: 'center',
      paddingVertical: useIslamicTheme ? theme.spacing.md : theme.spacing.lg,
    },
    innerGlow: {
      position: 'absolute',
      left: '50%',
      top: '50%',
      width: 180,
      height: 180,
      borderRadius: 90,
      marginLeft: -90,
      marginTop: -90,
      backgroundColor: useIslamicTheme ? (theme.mode === 'dark' ? 'rgba(89,193,160,0.14)' : 'rgba(29,127,102,0.1)') : 'rgba(95,203,160,0.08)',
    },
    scoreNumber: { fontSize: 44, fontWeight: theme.fontWeights.bold, color: theme.colors.text },
    maxScore: { fontSize: theme.fontSizes.sm, color: theme.colors.textMuted, marginTop: 2 },
    shimmerBar: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: 80,
      backgroundColor: useIslamicTheme ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.08)',
      transform: [{ skewX: '-18deg' }],
    },
  });

  const bobY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -4] });
  const haloScale = halo.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1.06] });
  const haloOpacity = halo.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] });
  const shimmerTranslate = shimmer.interpolate({ inputRange: [0, 1], outputRange: [-120, 260] });

  return (
    <Card style={styles.card}>
      {useIslamicTheme ? (
        <View pointerEvents="none" style={styles.backdrop}>
          <View style={styles.orbA} />
          <View style={styles.orbB} />
          <View style={styles.ringGlow} />
        </View>
      ) : null}
      <Animated.View style={[styles.floatLayer, { transform: [{ translateY: bobY }] }]}>
        <View pointerEvents="none" style={styles.innerGlow} />
        <Animated.View pointerEvents="none" style={[styles.shimmerBar, { opacity: useIslamicTheme ? 0.3 : 0.15, transform: [{ translateX: shimmerTranslate }, { skewX: '-18deg' }] }]} />
        <View style={{ alignItems: 'center' }}>
          <CircularProgress ratio={ratio} size={208} strokeWidth={14}>
            <AnimatedNumber value={score} style={styles.scoreNumber} decimals={0} />
            {maxScore > 0 ? <Text style={styles.maxScore}>of 100</Text> : null}
          </CircularProgress>
        </View>
      </Animated.View>
    </Card>
  );
}
