import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ManageActivitiesScreen } from '../screens/admin/ManageActivitiesScreen';
import { ChallengeConfigScreen } from '../screens/admin/ChallengeConfigScreen';
import { AllUsersScoresScreen } from '../screens/admin/AllUsersScoresScreen';

export type AdminStackParamList = {
  ManageActivities: undefined;
  ChallengeConfig: undefined;
  AllUsersScores: undefined;
};

const Stack = createNativeStackNavigator<AdminStackParamList>();

export function AdminNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ManageActivities" component={ManageActivitiesScreen} options={{ title: 'Manage Activities' }} />
      <Stack.Screen name="ChallengeConfig" component={ChallengeConfigScreen} options={{ title: 'Challenge Settings' }} />
      <Stack.Screen name="AllUsersScores" component={AllUsersScoresScreen} options={{ title: 'All Users Scores' }} />
    </Stack.Navigator>
  );
}
