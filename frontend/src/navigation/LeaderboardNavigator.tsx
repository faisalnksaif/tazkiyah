import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LeaderboardScreen } from '../screens/LeaderboardScreen';
import { MemberActivitiesScreen } from '../screens/MemberActivitiesScreen';

export type LeaderboardStackParamList = {
  LeaderboardList: undefined;
  MemberActivities: { userId: string; name: string };
};

const Stack = createNativeStackNavigator<LeaderboardStackParamList>();

export function LeaderboardNavigator() {
  return (
    <Stack.Navigator>
      {/* LeaderboardScreen renders its own custom Header, so hide the native one here. */}
      <Stack.Screen name="LeaderboardList" component={LeaderboardScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="MemberActivities"
        component={MemberActivitiesScreen}
        options={({ route }) => ({ title: `${route.params.name}'s Day` })}
      />
    </Stack.Navigator>
  );
}
