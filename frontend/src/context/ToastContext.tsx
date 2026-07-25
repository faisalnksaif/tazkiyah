import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Toast } from '../components/Toast';
import { ActivityLogToast } from '../components/ActivityLogToast';
import { ActivityBurst, ActivityBurstHandle } from '../components/ActivityBurst';

export interface ToastMessage {
  id: number;
  message: string;
  variant?: 'success' | 'error' | 'info';
  duration?: number;
}

export interface ActivityToastMessage {
  id: number;
  emoji: string;
  phrase: string;
  detail: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastMessage['variant'], duration?: number) => void;
  showActivityToast: (emoji: string, phrase: string, detail: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

let nextId = 1;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [activityToasts, setActivityToasts] = useState<ActivityToastMessage[]>([]);
  const burstRef = useRef<ActivityBurstHandle>(null);

  const showToast = useCallback((message: string, variant: ToastMessage['variant'] = 'success', duration?: number) => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, variant, duration }]);
  }, []);

  const showActivityToast = useCallback((emoji: string, phrase: string, detail: string, duration?: number) => {
    const id = nextId++;
    setActivityToasts((prev) => [...prev, { id, emoji, phrase, detail, duration }]);
    burstRef.current?.fire();
  }, []);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const removeActivity = useCallback((id: number) => {
    setActivityToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, showActivityToast }}>
      {children}
      <ActivityBurst ref={burstRef} />
      <View style={styles.container} pointerEvents="none">
        {activityToasts.map((t) => (
          <ActivityLogToast
            key={t.id}
            emoji={t.emoji}
            phrase={t.phrase}
            detail={t.detail}
            duration={t.duration}
            onDone={() => removeActivity(t.id)}
          />
        ))}
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDone={() => remove(toast.id)} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90,
    left: 16,
    right: 16,
    alignItems: 'center',
  },
});
