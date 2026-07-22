import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { challengeService } from '../../services/ChallengeService';
import { ChallengeStatus } from '../../types';
import { Card } from '../../components/Card';
import { InputField } from '../../components/InputField';
import { Button } from '../../components/Button';
import { useTheme } from '../../theme/ThemeProvider';
import { appConfig } from '../../config/appConfig';
import { toDateKey } from '../../utils/dateUtils';

export function ChallengeConfigScreen() {
  const theme = useTheme();
  const [status, setStatus] = useState<ChallengeStatus | null>(null);
  const [startDate, setStartDate] = useState(toDateKey());
  const [durationDays, setDurationDays] = useState(String(appConfig.defaultChallengeDurationDays));
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    challengeService.getStatus().then((s) => {
      setStatus(s);
      if (s.startDate) setStartDate(s.startDate);
      if (s.totalDays) setDurationDays(String(s.totalDays));
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleSave = async () => {
    setSubmitting(true);
    try {
      await challengeService.configure(startDate, Number(durationDays) || appConfig.defaultChallengeDurationDays);
      load();
    } finally {
      setSubmitting(false);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.md },
    statusText: { color: theme.colors.text, marginBottom: theme.spacing.sm },
  });

  return (
    <ScrollView style={styles.container}>
      <Card>
        <Text style={styles.statusText}>
          {status?.started ? `Currently: Day ${status.dayNumber} of ${status.totalDays}` : 'Challenge has not started yet'}
        </Text>
        <InputField label="Start date (YYYY-MM-DD)" value={startDate} onChangeText={setStartDate} />
        <InputField
          label={`Duration in days (default ${appConfig.defaultChallengeDurationDays}, but fully editable)`}
          keyboardType="numeric"
          value={durationDays}
          onChangeText={setDurationDays}
        />
        <Button title="Save Challenge Settings" onPress={handleSave} loading={submitting} />
      </Card>
    </ScrollView>
  );
}
