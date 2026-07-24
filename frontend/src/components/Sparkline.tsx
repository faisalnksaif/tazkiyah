import React from 'react';
import Svg, { Line, Path } from 'react-native-svg';
import { useTheme } from '../theme/ThemeProvider';

interface SparklineProps {
  points: number[];
  width?: number;
  height?: number;
  color?: string;
}

// Deliberately minimal — no axis, no gridlines, no legend: a single series
// riding inside a row that already carries the identity (name/avatar), so
// only the shape of the trend matters here. See dataviz skill: a lone
// series needs no legend box.
export function Sparkline({ points, width = 56, height = 22, color }: SparklineProps) {
  const theme = useTheme();
  const stroke = color ?? theme.colors.primary;
  const pad = 2;
  const plotHeight = height - pad * 2;
  const max = Math.max(1, ...points);

  if (points.every((v) => v === 0)) {
    return (
      <Svg width={width} height={height}>
        <Line x1={0} y1={height / 2} x2={width} y2={height / 2} stroke={theme.colors.border} strokeWidth={1} />
      </Svg>
    );
  }

  const path = points
    .map((v, i) => {
      const x = points.length > 1 ? (i / (points.length - 1)) * width : width / 2;
      const y = pad + plotHeight - (v / max) * plotHeight;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return (
    <Svg width={width} height={height}>
      <Path d={path} stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}
