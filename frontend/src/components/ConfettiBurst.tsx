import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet } from 'react-native';

const PIECES = ['🎉', '✨', '🌟', '💫', '🎊'];
const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Piece {
  emoji: string;
  left: number;
  fall: Animated.Value;
  rotate: Animated.Value;
  delay: number;
}

// Lightweight celebratory burst for a fully-completed day — no external
// animation library required, just the Animated API already in RN core.
export function ConfettiBurst({ trigger }: { trigger: number }) {
  const piecesRef = useRef<Piece[]>(
    Array.from({ length: 16 }).map((_, i) => ({
      emoji: PIECES[i % PIECES.length],
      left: Math.random() * SCREEN_WIDTH,
      fall: new Animated.Value(0),
      rotate: new Animated.Value(0),
      delay: Math.random() * 250,
    }))
  );

  useEffect(() => {
    if (trigger === 0) return;
    const animations = piecesRef.current.map((piece) => {
      piece.fall.setValue(0);
      piece.rotate.setValue(0);
      return Animated.parallel([
        Animated.timing(piece.fall, { toValue: 1, duration: 1600, delay: piece.delay, useNativeDriver: true }),
        Animated.timing(piece.rotate, { toValue: 1, duration: 1600, delay: piece.delay, useNativeDriver: true }),
      ]);
    });
    Animated.stagger(20, animations).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  if (trigger === 0) return null;

  return (
    <>
      {piecesRef.current.map((piece, i) => (
        <Animated.Text
          key={i}
          style={[
            styles.piece,
            {
              left: piece.left,
              opacity: piece.fall.interpolate({ inputRange: [0, 0.85, 1], outputRange: [1, 1, 0] }),
              transform: [
                { translateY: piece.fall.interpolate({ inputRange: [0, 1], outputRange: [0, 380] }) },
                { rotate: piece.rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) },
              ],
            },
          ]}
        >
          {piece.emoji}
        </Animated.Text>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  piece: {
    position: 'absolute',
    top: 0,
    fontSize: 22,
    zIndex: 999,
  },
});
