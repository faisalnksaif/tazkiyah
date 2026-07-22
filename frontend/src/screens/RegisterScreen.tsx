import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/ThemeProvider';
import { appConfig } from '../config/appConfig';
import { InputField } from '../components/InputField';
import { Button } from '../components/Button';
import { formatApiError } from '../services/ApiClient';

export function RegisterScreen() {
  const { register } = useAuth();
  const navigation = useNavigation<any>();
  const theme = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError(null);
    setLoading(true);
    try {
      await register(name, email, password);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', padding: theme.spacing.lg },
    title: { fontSize: theme.fontSizes.xl, fontWeight: theme.fontWeights.bold, color: theme.colors.primary, textAlign: 'center', marginBottom: theme.spacing.xl },
    error: { color: theme.colors.danger, marginBottom: theme.spacing.md, textAlign: 'center' },
    link: { color: theme.colors.primary, textAlign: 'center', marginTop: theme.spacing.md },
  });

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Join {appConfig.appName}</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <InputField label="Name" value={name} onChangeText={setName} />
        <InputField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <InputField label="Password" value={password} onChangeText={setPassword} secureTextEntry />

        <Button title="Register" onPress={handleRegister} loading={loading} />

        <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
          Already have an account? Log In
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
