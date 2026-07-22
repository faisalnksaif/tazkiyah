import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TextStyle } from 'react-native';

// Counts up/down toward `value` over a short duration — used for score tickers.
export function AnimatedNumber({ value, style, decimals = 1 }: { value: number; style?: TextStyle; decimals?: number }) {
  const animated = useRef(new Animated.Value(value)).current;
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const listenerId = animated.addListener(({ value: v }) => setDisplay(v));
    Animated.timing(animated, { toValue: value, duration: 600, useNativeDriver: false }).start();
    return () => animated.removeListener(listenerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <Text style={[styles.text, style]}>{display.toFixed(decimals)}</Text>;
}

const styles = StyleSheet.create({
  text: { fontVariant: ['tabular-nums'] },
});
