import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/ThemeProvider';
import { appConfig } from '../config/appConfig';
import { InputField } from '../components/InputField';
import { Button } from '../components/Button';
import { formatApiError } from '../services/ApiClient';

export function LoginScreen() {
  const { login } = useAuth();
  const navigation = useNavigation<any>();
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', padding: theme.spacing.lg },
    title: { fontSize: theme.fontSizes.xxl, fontWeight: theme.fontWeights.bold, color: theme.colors.primary, textAlign: 'center' },
    tagline: { fontSize: theme.fontSizes.sm, color: theme.colors.textMuted, textAlign: 'center', marginBottom: theme.spacing.xl },
    error: { color: theme.colors.danger, marginBottom: theme.spacing.md, textAlign: 'center' },
    link: { color: theme.colors.primary, textAlign: 'center', marginTop: theme.spacing.md },
  });

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{appConfig.appName}</Text>
        <Text style={styles.tagline}>{appConfig.tagline}</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <InputField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <InputField label="Password" value={password} onChangeText={setPassword} secureTextEntry />

        <Button title="Log In" onPress={handleLogin} loading={loading} />

        <Text style={styles.link} onPress={() => navigation.navigate('Register')}>
          Don't have an account? Register
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
