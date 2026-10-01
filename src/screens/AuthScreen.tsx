import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';

import { auth } from '@/firebaseConfig';

type AuthMode = 'login' | 'register';

function getAuthErrorMessage(code?: string) {
  const messages: Record<string, string> = {
    'auth/invalid-credential': 'El correo o la contraseña no son correctos.',
    'auth/user-not-found': 'No existe una cuenta con ese correo.',
    'auth/wrong-password': 'El correo o la contraseña no son correctos.',
    'auth/email-already-in-use': 'Ese correo ya tiene una cuenta.',
    'auth/invalid-email': 'Escribe un correo válido.',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
    'auth/network-request-failed': 'No se pudo conectar. Revisa tu conexión.',
  };

  return messages[code ?? ''] ?? 'No se pudo completar la operación. Inténtalo de nuevo.';
}

export default function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const isRegistering = mode === 'register';

  async function submit() {
    const normalizedEmail = email.trim();
    if (!normalizedEmail || !password) {
      setError('Completa el correo y la contraseña.');
      return;
    }
    if (isRegistering && password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      } else {
        await signInWithEmailAndPassword(auth, normalizedEmail, password);
      }
    } catch (authError) {
      setError(getAuthErrorMessage((authError as { code?: string }).code));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <Text style={styles.eyebrow}>TU BIBLIOTECA</Text>
            <Text style={styles.title}>Guildly</Text>
            <Text style={styles.subtitle}>
              {isRegistering ? 'Crea tu cuenta para continuar.' : 'Inicia sesión para continuar.'}
            </Text>

            <View style={styles.form}>
              <Text style={styles.label}>Correo electrónico</Text>
              <TextInput
                style={styles.input}
                placeholder="nombre@correo.com"
                placeholderTextColor="#8b8b96"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
                value={email}
                onChangeText={setEmail}
              />

              <Text style={styles.label}>Contraseña</Text>
              <TextInput
                style={styles.input}
                placeholder={isRegistering ? 'Mínimo 6 caracteres' : 'Tu contraseña'}
                placeholderTextColor="#8b8b96"
                secureTextEntry
                textContentType={isRegistering ? 'newPassword' : 'password'}
                value={password}
                onChangeText={setPassword}
                onSubmitEditing={submit}
                returnKeyType="go"
              />

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Pressable
                accessibilityRole="button"
                disabled={submitting}
                onPress={submit}
                style={({ pressed }) => [styles.submitButton, pressed && styles.pressed]}>
                {submitting ? (
                  <ActivityIndicator color="#15151b" />
                ) : (
                  <Text style={styles.submitText}>
                    {isRegistering ? 'Crear cuenta' : 'Iniciar sesión'}
                  </Text>
                )}
              </Pressable>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>
                  {isRegistering ? '¿Ya tienes cuenta?' : '¿Aún no tienes cuenta?'}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setError('');
                    setMode(isRegistering ? 'login' : 'register');
                  }}>
                  <Text style={styles.switchAction}>
                    {isRegistering ? 'Inicia sesión' : 'Regístrate'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f4f4f6' },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  content: { width: '100%', maxWidth: 420, alignSelf: 'center' },
  eyebrow: { color: '#bd8615', fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  title: { color: '#15151b', fontSize: 38, fontWeight: '900', marginTop: 6 },
  subtitle: { color: '#686873', fontSize: 16, marginTop: 8 },
  form: { marginTop: 38 },
  label: { color: '#24242b', fontSize: 14, fontWeight: '700', marginBottom: 8 },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#d9d9df',
    borderRadius: 8,
    backgroundColor: '#fff',
    color: '#18181d',
    paddingHorizontal: 14,
    fontSize: 16,
    marginBottom: 20,
  },
  error: { color: '#b42332', fontSize: 14, marginBottom: 14 },
  submitButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f2bf4b',
    borderRadius: 8,
    marginTop: 4,
  },
  pressed: { opacity: 0.78 },
  submitText: { color: '#15151b', fontSize: 16, fontWeight: '800' },
  switchRow: { flexDirection: 'row', justifyContent: 'center', gap: 5, marginTop: 22 },
  switchLabel: { color: '#686873', fontSize: 14 },
  switchAction: { color: '#15151b', fontSize: 14, fontWeight: '800' },
});