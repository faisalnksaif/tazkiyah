import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { activityService } from '../../services/ActivityService';
import { Activity, ActivityType } from '../../types';
import { Card } from '../../components/Card';
import { InputField } from '../../components/InputField';
import { Button } from '../../components/Button';
import { useTheme } from '../../theme/ThemeProvider';

const TYPES: ActivityType[] = ['counter', 'duration', 'checkbox', 'checklist'];

export function ManageActivitiesScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const [activities, setActivities] = useState<Activity[]>([]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ActivityType>('counter');
  const [targetValue, setTargetValue] = useState('1');
  const [unit, setUnit] = useState('');
  const [pointsWeight, setPointsWeight] = useState('10');
  const [subItemsText, setSubItemsText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    activityService.list(true).then(setActivities);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const resetForm = () => {
    setName('');
    setDescription('');
    setType('counter');
    setTargetValue('1');
    setUnit('');
    setPointsWeight('10');
    setSubItemsText('');
  };

  const handleCreate = async () => {
    setSubmitting(true);
    try {
      await activityService.create({
        name,
        description,
        type,
        targetValue: Number(targetValue) || 1,
        unit,
        pointsWeight: Number(pointsWeight) || 10,
        order: activities.length,
        subItems: type === 'checklist' ? subItemsText.split(',').map((s) => ({ label: s.trim() })).filter((s) => s.label) : undefined,
      });
      resetForm();
      load();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    await activityService.remove(id);
    load();
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.md },
    sectionTitle: { fontSize: theme.fontSizes.lg, fontWeight: theme.fontWeights.bold, marginBottom: theme.spacing.sm, color: theme.colors.text },
    navRow: { flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.md },
    navLink: { color: theme.colors.primary, fontWeight: theme.fontWeights.medium },
    typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs, marginBottom: theme.spacing.md },
    typeChip: { paddingVertical: theme.spacing.xs, paddingHorizontal: theme.spacing.sm, borderRadius: theme.radii.pill, borderWidth: 1, borderColor: theme.colors.border },
    typeChipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    typeChipText: { color: theme.colors.text },
    typeChipTextActive: { color: theme.colors.white },
    activityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    activityName: { fontSize: theme.fontSizes.md, fontWeight: theme.fontWeights.medium, color: theme.colors.text },
    activityMeta: { fontSize: theme.fontSizes.xs, color: theme.colors.textMuted },
    inactive: { opacity: 0.5 },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.navRow}>
        <Pressable onPress={() => navigation.navigate('ChallengeConfig')}>
          <Text style={styles.navLink}>Challenge Settings</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('AllUsersScores')}>
          <Text style={styles.navLink}>All Users Scores</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Add Activity</Text>
      <Card>
        <InputField label="Name" value={name} onChangeText={setName} />
        <InputField label="Description" value={description} onChangeText={setDescription} />

        <Text style={{ color: theme.colors.textMuted, marginBottom: theme.spacing.xs }}>Type</Text>
        <View style={styles.typeRow}>
          {TYPES.map((t) => (
            <Pressable key={t} onPress={() => setType(t)} style={[styles.typeChip, type === t && styles.typeChipActive]}>
              <Text style={[styles.typeChipText, type === t && styles.typeChipTextActive]}>{t}</Text>
            </Pressable>
          ))}
        </View>

        {type === 'checklist' ? (
          <InputField label="Sub-items (comma separated)" value={subItemsText} onChangeText={setSubItemsText} placeholder="Fajr, Dhuhr, Asr, Maghrib, Isha" />
        ) : (
          <>
            <InputField label="Target value" keyboardType="numeric" value={targetValue} onChangeText={setTargetValue} />
            <InputField label="Unit" value={unit} onChangeText={setUnit} placeholder="count, minutes, km" />
          </>
        )}

        <InputField label="Points weight" keyboardType="numeric" value={pointsWeight} onChangeText={setPointsWeight} />

        <Button title="Create Activity" onPress={handleCreate} loading={submitting} />
      </Card>

      <Text style={styles.sectionTitle}>Existing Activities</Text>
      <FlatList
        data={activities}
        keyExtractor={(a) => a._id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <Card style={!item.isActive ? styles.inactive : undefined}>
            <View style={styles.activityRow}>
              <View>
                <Text style={styles.activityName}>{item.name}</Text>
                <Text style={styles.activityMeta}>
                  {item.type} · {item.pointsWeight} pts {!item.isActive ? '· inactive' : ''}
                </Text>
              </View>
              {item.isActive && <Button title="Remove" variant="danger" onPress={() => handleDelete(item._id)} />}
            </View>
          </Card>
        )}
      />
    </ScrollView>
  );
}
