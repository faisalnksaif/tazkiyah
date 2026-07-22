import React, { useEffect, useRef, useState } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

interface ProgressSliderProps {
  total: number;
  targetValue: number;
  step: number;
  onDragValueChange?: (value: number | null) => void; // null when not dragging
  onCommitDelta: (delta: number) => void;
}

const TRACK_HEIGHT = 8;
const THUMB_SIZE = 22;

// Fully custom-built slider — no native/OS control, no third-party chrome.
// The progress bar IS the input: its fill always reflects today's logged
// total. Dragging right logs an additional increment on release, capped at
// the activity's target — the slider finishes at 100%, it can't go past it.
// Dragging left logs a correcting (negative) increment — e.g. to undo a
// mistaken over-add — since totals never go below 0.
export function ProgressSlider({ total, targetValue, step, onDragValueChange, onCommitDelta }: ProgressSliderProps) {
  const theme = useTheme();
  // If a total already exceeds the target (e.g. historical data from before
  // this cap existed), let the slider reflect it rather than clamp visually —
  // but never allow dragging further past the target from here on.
  const max = Math.max(targetValue || step, total);

  const [dragValue, setDragValue] = useState(total);
  const dragValueRef = useRef(total);
  const draggingRef = useRef(false);

  const trackRef = useRef<View>(null);
  const trackPageX = useRef(0);
  const trackWidth = useRef(0);
  const [measuredWidth, setMeasuredWidth] = useState(0);

  // Keep the thumb synced to the real total whenever it actually changes
  // externally (after the parent's reload completes). Deliberately does NOT
  // depend on dragging state — reacting to that would re-sync from the stale
  // pre-commit total the instant the drag ends (before the reload lands),
  // snapping the thumb back and then forward again once the real value
  // arrives. Guarding with a ref (not a dependency) avoids that flicker.
  useEffect(() => {
    if (!draggingRef.current) {
      setDragValue(total);
      dragValueRef.current = total;
    }
  }, [total]);

  const setValue = (v: number) => {
    const clamped = Math.max(0, Math.min(v, max));
    const stepped = Math.round(clamped / step) * step;
    setDragValue(stepped);
    dragValueRef.current = stepped;
    onDragValueChange?.(stepped);
  };

  const valueFromPageX = (pageX: number) => {
    if (trackWidth.current <= 0) return dragValueRef.current;
    const ratio = (pageX - trackPageX.current) / trackWidth.current;
    return ratio * max;
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      draggingRef.current = true;
      trackRef.current?.measure((_x, _y, width, _height, pageX) => {
        trackWidth.current = width;
        trackPageX.current = pageX;
        setValue(valueFromPageX(evt.nativeEvent.pageX));
      });
    },
    onPanResponderMove: (evt) => {
      setValue(valueFromPageX(evt.nativeEvent.pageX));
    },
    onPanResponderRelease: () => {
      draggingRef.current = false;
      onDragValueChange?.(null);
      if (dragValueRef.current !== total) onCommitDelta(dragValueRef.current - total);
    },
  });

  const ratio = max > 0 ? dragValue / max : 0;
  const thumbLeft = measuredWidth > 0 ? Math.max(0, Math.min(ratio, 1)) * measuredWidth - THUMB_SIZE / 2 : -THUMB_SIZE / 2;

  const styles = StyleSheet.create({
    // Fixed height equal to the thumb size, with the track centered inside via
    // justifyContent — avoids relying on padding-box vs. border-box behavior
    // for the absolutely-positioned thumb (RN and web disagree on that), so
    // centering can't drift between platforms.
    touchArea: { height: THUMB_SIZE, justifyContent: 'center' },
    track: {
      height: TRACK_HEIGHT,
      borderRadius: TRACK_HEIGHT / 2,
      backgroundColor: theme.colors.border,
      overflow: 'hidden',
    },
    fill: {
      height: '100%',
      borderRadius: TRACK_HEIGHT / 2,
      backgroundColor: theme.colors.primary,
      width: `${Math.max(0, Math.min(ratio, 1)) * 100}%`,
    },
    thumb: {
      position: 'absolute',
      top: 0,
      left: thumbLeft,
      width: THUMB_SIZE,
      height: THUMB_SIZE,
      borderRadius: THUMB_SIZE / 2,
      backgroundColor: theme.colors.white,
    },
  });

  return (
    <View
      style={styles.touchArea}
      onLayout={() => {
        trackRef.current?.measure((_x, _y, width, _height, pageX) => {
          trackWidth.current = width;
          trackPageX.current = pageX;
          setMeasuredWidth(width);
        });
      }}
      {...panResponder.panHandlers}
    >
      <View ref={trackRef} style={styles.track}>
        <View style={styles.fill} />
      </View>
      <View style={styles.thumb} pointerEvents="none" />
    </View>
  );
}
