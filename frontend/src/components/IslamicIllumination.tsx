import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Path, Polygon } from 'react-native-svg';
import { useTheme } from '../theme/ThemeProvider';

const { width: W, height: H } = Dimensions.get('window');

// Build the path for a regular star polygon (e.g. 8-pointed star).
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

// Build a path for an 8-point geometric knot rosette (classic Islamic pattern).
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

interface IlluminationProps {
  /** Only renders in Islamic theme; pass false to always render (e.g. previews). */
  gated?: boolean;
}

export function IslamicIllumination({ gated: _gated = true }: IlluminationProps) {
  const theme = useTheme();

  const dark = theme.mode === 'dark';
  const islamic = theme.variant === 'islamic';

  const starFill      = islamic
    ? (dark ? 'rgba(114,212,206,0.07)' : 'rgba(46,124,123,0.07)')
    : (dark ? 'rgba(95,203,160,0.07)'  : 'rgba(21,154,114,0.06)');
  const starStroke    = islamic
    ? (dark ? 'rgba(114,212,206,0.18)' : 'rgba(46,124,123,0.15)')
    : (dark ? 'rgba(95,203,160,0.18)'  : 'rgba(21,154,114,0.14)');
  const rosetteFill   = islamic
    ? (dark ? 'rgba(232,196,122,0.07)' : 'rgba(201,164,90,0.08)')
    : (dark ? 'rgba(216,178,92,0.07)'  : 'rgba(199,154,63,0.07)');
  const rosetteStroke = islamic
    ? (dark ? 'rgba(232,196,122,0.22)' : 'rgba(201,164,90,0.2)')
    : (dark ? 'rgba(216,178,92,0.2)'   : 'rgba(199,154,63,0.18)');
  const dotColor      = islamic
    ? (dark ? 'rgba(114,212,206,0.32)' : 'rgba(46,124,123,0.24)')
    : (dark ? 'rgba(95,203,160,0.28)'  : 'rgba(21,154,114,0.2)');
  const lineColor     = islamic
    ? (dark ? 'rgba(114,212,206,0.10)' : 'rgba(46,124,123,0.09)')
    : (dark ? 'rgba(95,203,160,0.10)'  : 'rgba(21,154,114,0.08)');

  const breathA = useRef(new Animated.Value(0)).current;
  const breathB = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loopA = Animated.loop(
      Animated.sequence([
        Animated.timing(breathA, { toValue: 1, duration: 4800, useNativeDriver: true }),
        Animated.timing(breathA, { toValue: 0, duration: 4800, useNativeDriver: true }),
      ])
    );
    const loopB = Animated.loop(
      Animated.sequence([
        Animated.delay(2400),
        Animated.timing(breathB, { toValue: 1, duration: 4800, useNativeDriver: true }),
        Animated.timing(breathB, { toValue: 0, duration: 4800, useNativeDriver: true }),
      ])
    );
    loopA.start();
    loopB.start();
    return () => { loopA.stop(); loopB.stop(); };
  }, [breathA, breathB]);

  const opA = breathA.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] });
  const opB = breathB.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0.95] });
  const scaleA = breathA.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1.03] });
  const scaleB = breathB.interpolate({ inputRange: [0, 1], outputRange: [1.02, 0.97] });

  const star8Top   = starPath(W / 2, -18, 52, 22, 8);
  const star8BL    = starPath(18, H * 0.44, 40, 17, 8);
  const star8BR    = starPath(W - 20, H * 0.58, 36, 15, 8);
  const rosetteTR  = rosettePath(W - 24, 110, 44);
  const rosetteMid = rosettePath(W * 0.18, H * 0.78, 34);
  const star6Mid   = starPath(W * 0.82, H * 0.3, 28, 13, 6);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Top-centre large 8-point star — breathing slowly */}
      <Animated.View style={{ opacity: opA, transform: [{ scale: scaleA }], ...StyleSheet.absoluteFillObject }}>
        <Svg width={W} height={140} style={styles.svgAbs}>
          <Path d={star8Top} fill={starFill} stroke={starStroke} strokeWidth={1} />
          {/* Corner dots */}
          <Circle cx={18} cy={18} r={3.5} fill={dotColor} />
          <Circle cx={W - 18} cy={18} r={3.5} fill={dotColor} />
          {/* Horizontal rule */}
          <Line x1={44} y1={2} x2={W - 44} y2={2} stroke={lineColor} strokeWidth={0.8} strokeDasharray="4 6" />
        </Svg>
      </Animated.View>

      {/* Top-right rosette */}
      <Animated.View style={{ opacity: opB, transform: [{ scale: scaleB }], ...StyleSheet.absoluteFillObject }}>
        <Svg width={W} height={200} style={styles.svgAbs}>
          <Path d={rosetteTR} fill={rosetteFill} stroke={rosetteStroke} strokeWidth={0.9} />
          <Circle cx={W - 24} cy={110} r={5} fill="none" stroke={rosetteStroke} strokeWidth={1} />
        </Svg>
      </Animated.View>

      {/* Left-side mid 8-point star */}
      <Animated.View style={{ opacity: opA, transform: [{ scale: scaleB }], ...StyleSheet.absoluteFillObject }}>
        <Svg width={W} height={H} style={styles.svgAbs}>
          <Path d={star8BL} fill={starFill} stroke={starStroke} strokeWidth={0.8} />
        </Svg>
      </Animated.View>

      {/* Right-side mid 8-point star */}
      <Animated.View style={{ opacity: opB, transform: [{ scale: scaleA }], ...StyleSheet.absoluteFillObject }}>
        <Svg width={W} height={H} style={styles.svgAbs}>
          <Path d={star8BR} fill={starFill} stroke={starStroke} strokeWidth={0.8} />
        </Svg>
      </Animated.View>

      {/* 6-pointed star right-centre */}
      <Animated.View style={{ opacity: opA, ...StyleSheet.absoluteFillObject }}>
        <Svg width={W} height={H} style={styles.svgAbs}>
          <Path d={star6Mid} fill={rosetteFill} stroke={rosetteStroke} strokeWidth={0.8} />
        </Svg>
      </Animated.View>

      {/* Bottom-left rosette */}
      <Animated.View style={{ opacity: opB, transform: [{ scale: scaleA }], ...StyleSheet.absoluteFillObject }}>
        <Svg width={W} height={H} style={styles.svgAbs}>
          <Path d={rosetteMid} fill={rosetteFill} stroke={rosetteStroke} strokeWidth={0.9} />
          <Circle cx={W * 0.18} cy={H * 0.78} r={4} fill="none" stroke={rosetteStroke} strokeWidth={1} />
        </Svg>
      </Animated.View>

      {/* Scattered small dots — like gold leaf speckling */}
      <Svg width={W} height={H} style={styles.svgAbs}>
        {[
          [W * 0.12, H * 0.14], [W * 0.88, H * 0.22], [W * 0.3, H * 0.62],
          [W * 0.72, H * 0.5],  [W * 0.5,  H * 0.88], [W * 0.6,  H * 0.12],
          [W * 0.04, H * 0.72], [W * 0.94, H * 0.76],
        ].map(([x, y], i) => (
          <Circle key={i} cx={x} cy={y} r={1.8} fill={dotColor} />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  svgAbs: { position: 'absolute', top: 0, left: 0 },
});
