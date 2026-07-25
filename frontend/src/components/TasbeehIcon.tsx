import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface TasbeehIconProps {
  color: string;
  size?: number;
}

// 11 evenly-spaced beads around a circle + 1 larger marker bead at the top
// + a short tassel hanging off the loop join point.
export function TasbeehIcon({ color, size = 64 }: TasbeehIconProps) {
  const cx = 32;
  const cy = 29;
  const loopR = 17;          // radius of the bead ring
  const beadR = size * 0.055; // small bead radius
  const markerR = beadR * 1.6; // large marker bead

  const BEAD_COUNT = 11;
  // Beads start just past the top (the "tie" point), going clockwise
  const beads = Array.from({ length: BEAD_COUNT }, (_, i) => {
    const angle = (i / BEAD_COUNT) * 2 * Math.PI - Math.PI / 2 + (0.18);
    return {
      x: cx + loopR * Math.cos(angle),
      y: cy + loopR * Math.sin(angle),
    };
  });

  const strokeWidth = Math.max(1.4, size * 0.028);
  // Ring string (thin circle)
  const ringD = `M ${cx} ${cy - loopR} a ${loopR} ${loopR} 0 1 1 -0.01 0`;

  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* String */}
      <Path d={ringD} stroke={color} strokeWidth={strokeWidth * 0.5} fill="none" opacity={0.35} />

      {/* Small evenly-spaced beads */}
      {beads.map((b, i) => (
        <Circle key={i} cx={b.x} cy={b.y} r={beadR} fill={color} opacity={0.88} />
      ))}

      {/* Large marker bead at top of loop */}
      <Circle cx={cx} cy={cy - loopR} r={markerR} fill={color} opacity={0.97} />

      {/* Tassel string */}
      <Path
        d={`M ${cx} ${cy - loopR + markerR} L ${cx} ${cy - loopR + markerR + size * 0.16}`}
        stroke={color}
        strokeWidth={strokeWidth * 0.7}
        strokeLinecap="round"
        opacity={0.85}
      />
      {/* Tassel knot */}
      <Circle
        cx={cx}
        cy={cy - loopR + markerR + size * 0.16}
        r={beadR * 0.75}
        fill={color}
        opacity={0.9}
      />
      {/* Tassel fringe */}
      <Path
        d={`M ${cx - beadR * 1.4} ${cy - loopR + markerR + size * 0.16 + beadR * 0.75} L ${cx} ${cy - loopR + markerR + size * 0.21}`}
        stroke={color}
        strokeWidth={strokeWidth * 0.6}
        strokeLinecap="round"
        opacity={0.65}
      />
      <Path
        d={`M ${cx} ${cy - loopR + markerR + size * 0.16 + beadR * 0.75} L ${cx} ${cy - loopR + markerR + size * 0.22}`}
        stroke={color}
        strokeWidth={strokeWidth * 0.6}
        strokeLinecap="round"
        opacity={0.75}
      />
      <Path
        d={`M ${cx + beadR * 1.4} ${cy - loopR + markerR + size * 0.16 + beadR * 0.75} L ${cx} ${cy - loopR + markerR + size * 0.21}`}
        stroke={color}
        strokeWidth={strokeWidth * 0.6}
        strokeLinecap="round"
        opacity={0.65}
      />
    </Svg>
  );
}
