import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useTheme } from '../theme/ThemeProvider';

const { width: W, height: H } = Dimensions.get('window');

function starPath(cx: number, cy: number, outerR: number, innerR: number, points: number): string {
  const step = Math.PI / points;
  let d = '';
  for (let i = 0; i < points * 2; i++) {
    const angle = i * step - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    d += `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)} `;
  }
  return d + 'Z';
}

function rosettePath(cx: number, cy: number, r: number): string {
  const segs: string[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const a2 = ((i + 0.5) * Math.PI) / 4;
    const x1 = cx + r * Math.cos(a);
    const y1 = cy + r * Math.sin(a);
    const mx = cx + (r * 0.42) * Math.cos(a2);
    const my = cy + (r * 0.42) * Math.sin(a2);
    const x2 = cx + r * Math.cos(a + Math.PI / 4);
    const y2 = cy + r * Math.sin(a + Math.PI / 4);
    segs.push(`M ${cx.toFixed(1)} ${cy.toFixed(1)} L ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)} Z`);
  }
  return segs.join(' ');
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const start = (Math.PI / 180) * startDeg;
  const end = (Math.PI / 180) * endDeg;
  const x1 = cx + r * Math.cos(start);
  const y1 = cy + r * Math.sin(start);
  const x2 = cx + r * Math.cos(end);
  const y2 = cy + r * Math.sin(end);
  const largeArc = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
  const sweep = endDeg > startDeg ? 1 : 0;
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r.toFixed(2)} ${r.toFixed(2)} 0 ${largeArc} ${sweep} ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

const BURST_PIECES = 8; // number of geometric pieces radiating out

export interface ActivityBurstHandle {
  fire: () => void;
}

export const ActivityBurst = forwardRef<ActivityBurstHandle>(function ActivityBurst(_, ref) {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);

  const masterOpacity = useRef(new Animated.Value(0)).current;
  const pieces = useRef(
    Array.from({ length: BURST_PIECES }, (_, i) => ({
      angle: (i / BURST_PIECES) * 2 * Math.PI,
      scale: new Animated.Value(0),
      opacity: new Animated.Value(0),
      translateX: new Animated.Value(0),
      translateY: new Animated.Value(0),
      rotate: new Animated.Value(0),
    }))
  ).current;

  const centerScale = useRef(new Animated.Value(0)).current;
  const centerOpacity = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.3)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const ringSpin = useRef(new Animated.Value(0)).current;

  useImperativeHandle(ref, () => ({ fire }));

  function fire() {
    // Reset everything
    masterOpacity.setValue(0);
    centerScale.setValue(0);
    centerOpacity.setValue(0);
    ringScale.setValue(0.3);
    ringOpacity.setValue(0);
    ringSpin.setValue(0);
    pieces.forEach((p) => {
      p.scale.setValue(0);
      p.opacity.setValue(0);
      p.translateX.setValue(0);
      p.translateY.setValue(0);
      p.rotate.setValue(0);
    });

    setVisible(true);
    Animated.timing(masterOpacity, { toValue: 1, duration: 80, useNativeDriver: true }).start();

    // Center star burst
    Animated.parallel([
      Animated.spring(centerScale, { toValue: 1, friction: 5, tension: 180, useNativeDriver: true }),
      Animated.timing(centerOpacity, { toValue: 1, duration: 140, useNativeDriver: true }),
    ]).start();

    // Expanding ring
    Animated.parallel([
      Animated.timing(ringScale, { toValue: 1.6, duration: 700, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(ringSpin, { toValue: 1, duration: 880, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.sequence([
        Animated.timing(ringOpacity, { toValue: 0.7, duration: 120, useNativeDriver: true }),
        Animated.timing(ringOpacity, { toValue: 0, duration: 480, delay: 120, useNativeDriver: true }),
      ]),
    ]).start();

    // Radial pieces
    const pieceAnims = pieces.map((p) => {
      const dist = 80 + Math.random() * 60;
      const tx = Math.cos(p.angle) * dist;
      const ty = Math.sin(p.angle) * dist;
      return Animated.parallel([
        Animated.spring(p.scale, { toValue: 1, friction: 6, tension: 160, delay: 60, useNativeDriver: true }),
        Animated.timing(p.opacity, { toValue: 1, duration: 160, delay: 60, useNativeDriver: true }),
        Animated.timing(p.translateX, { toValue: tx, duration: 620, delay: 60, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(p.translateY, { toValue: ty, duration: 620, delay: 60, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(p.rotate, { toValue: 1, duration: 620, delay: 60, useNativeDriver: true }),
      ]);
    });
    Animated.parallel(pieceAnims).start();

    // Fade out everything together
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(masterOpacity, { toValue: 0, duration: 380, useNativeDriver: true }),
        Animated.timing(centerOpacity, { toValue: 0, duration: 380, useNativeDriver: true }),
        ...pieces.map((p) => Animated.timing(p.opacity, { toValue: 0, duration: 380, useNativeDriver: true })),
      ]).start(() => setVisible(false));
    }, 560);
  }

  if (!visible) return null;

  const dark = theme.mode === 'dark';
  const islamic = theme.variant === 'islamic';
  const starColor = islamic
    ? (dark ? 'rgba(114,212,206,0.92)' : 'rgba(46,124,123,0.85)')
    : (dark ? 'rgba(95,203,160,0.92)'  : 'rgba(21,154,114,0.85)');
  const goldColor = islamic
    ? (dark ? 'rgba(232,196,122,0.88)' : 'rgba(201,164,90,0.8)')
    : (dark ? 'rgba(216,178,92,0.88)'  : 'rgba(199,154,63,0.8)');
  const ringColor = islamic
    ? (dark ? 'rgba(114,212,206,0.55)' : 'rgba(46,124,123,0.45)')
    : (dark ? 'rgba(95,203,160,0.55)'  : 'rgba(21,154,114,0.45)');
  const ringAccent = islamic
    ? (dark ? 'rgba(232,196,122,0.45)' : 'rgba(201,164,90,0.36)')
    : (dark ? 'rgba(216,178,92,0.42)'  : 'rgba(199,154,63,0.34)');

  const ringRotation = ringSpin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '130deg'] });

  const star8  = starPath(0, 0, 18, 7,  8);
  const star6  = starPath(0, 0, 14, 6,  6);
  const star5  = starPath(0, 0, 12, 5,  5);
  const rosette = rosettePath(0, 0, 13.5);
  const crescentOuter = arcPath(0, 0, 8.5, 235, 30);
  const crescentInner = arcPath(2.2, 0, 6.1, 235, 30);

  return (
    <Animated.View style={[styles.overlay, { opacity: masterOpacity }]} pointerEvents="none">
      {/* Expanding ring */}
      <Animated.View
        style={[
          styles.ring,
          {
            opacity: ringOpacity,
            transform: [{ scale: ringScale }, { rotate: ringRotation }],
            borderColor: ringColor,
          },
        ]}
      />

      <Animated.View
        style={[
          styles.ringAccent,
          {
            opacity: ringOpacity,
            transform: [{ scale: ringScale }, { rotate: ringRotation }],
            borderColor: ringAccent,
          },
        ]}
      />

      {/* Center 8-point star */}
      <Animated.View
        style={[
          styles.center,
          {
            opacity: centerOpacity,
            transform: [{ scale: centerScale }],
          },
        ]}
      >
        <Svg width={48} height={48} viewBox="-24 -24 48 48">
          <Path d={star8} fill={starColor} />
          <Path d={rosette} fill={goldColor} opacity={0.9} />
          <Circle cx={0} cy={0} r={4.7} fill={goldColor} />
          <Path d={crescentOuter} stroke={starColor} strokeWidth={2.1} strokeLinecap="round" fill="none" />
          <Path d={crescentInner} stroke={goldColor} strokeWidth={1.3} strokeLinecap="round" fill="none" opacity={0.9} />
        </Svg>
      </Animated.View>

      {/* Radial burst pieces */}
      {pieces.map((p, i) => {
        const isGold = i % 3 === 0;
        const pathD = i % 3 === 0 ? star8 : i % 3 === 1 ? star6 : star5;
        const size = 40;
        const rotation = p.rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${(i % 2 === 0 ? 1 : -1) * 180}deg`] });
        return (
          <Animated.View
            key={i}
            style={[
              styles.piece,
              {
                opacity: p.opacity,
                transform: [
                  { translateX: p.translateX },
                  { translateY: p.translateY },
                  { scale: p.scale },
                  { rotate: rotation },
                ],
              },
            ]}
          >
            <Svg width={size} height={size} viewBox={`-${size / 2} -${size / 2} ${size} ${size}`}>
              <Path d={pathD} fill={isGold ? goldColor : starColor} />
            </Svg>
          </Animated.View>
        );
      })}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 998,
  },
  ring: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1.5,
  },
  ringAccent: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  center: {
    position: 'absolute',
  },
  piece: {
    position: 'absolute',
  },
});
