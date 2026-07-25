import React from 'react';
import { Feather } from '@expo/vector-icons';
import { ActivityIconName, getActivityIcon } from '../utils/activityIcons';
import { TasbeehIcon } from './TasbeehIcon';

interface ActivityGlyphProps {
  name: string;
  color: string;
  size?: number;
}

export function ActivityGlyph({ name, color, size = 64 }: ActivityGlyphProps) {
  const icon = getActivityIcon(name);

  if (icon === 'tasbeeh') {
    return <TasbeehIcon color={color} size={size} />;
  }

  return <Feather name={icon as Exclude<ActivityIconName, 'tasbeeh'>} size={size} color={color} />;
}