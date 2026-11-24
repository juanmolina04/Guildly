import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';

import { auth } from '@/firebaseConfig';

type AuthMode = 'login' | 'register';

const BLUE = 'rgb(17, 32, 82)';
const BLUE_CLEAR = 'rgba(17, 32, 82, 0)';

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
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

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

  const info = (
    <View style={[styles.infoPanel, isWide && styles.panelWide]}>
      <View style={styles.infoContent}>
        <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
        <Text style={styles.eyebrow}>TU BIBLIOTECA</Text>
        <Text style={styles.title}>Guildly</Text>
        <Text style={styles.description}>
          Una comunidad para cada videojuego. Descubre nuevas experiencias y mira su nivel de actividad, comparte guías, haz preguntas, conversa con otros
          jugadores y sube de nivel mientras participas.
        </Text>
        <View style={styles.features}>
          {[
            'Un gremio por cada juego',
            'Guías, preguntas, discusiones y noticias',
            'Niveles y Top de cada comunidad',
          ].map((text) => (
            <View key={text} style={styles.featureRow}>
              <View style={styles.featureBar} />
              <Text style={styles.feature}>{text}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const card = (
    <View style={[styles.formPanel, isWide && styles.panelWide]}>
      <View style={styles.form}>
        <Text style={styles.formTitle}>{isRegistering ? 'Crea tu cuenta' : 'Inicia sesión'}</Text>

        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput
          style={styles.input}
          placeholder="nombre@correo.com"
          placeholderTextColor="#7f9079"
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
          placeholderTextColor="#7f9079"
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
            <ActivityIndicator color="#fff2b4" />
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
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Imagen del catálogo de fondo */}
      <Image
        source={require('../../assets/images/catalogo.png')}
        style={styles.background}
        resizeMode="cover"
      />

      {/* Desvanecido a azul: empieza antes de la mitad y desde la mitad es azul sólido */}
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(17, 32, 82, 0.35)', BLUE_CLEAR, BLUE, BLUE]}
        locations={[0, 0.25, 0.5, 1]}
        start={isWide ? { x: 0, y: 0.55 } : { x: 0, y: 0 }}
        end={isWide ? { x: 1, y: 0 } : { x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(0, 0, 0, 0.72)', 'rgba(0, 0, 0, 0.38)', 'rgba(0, 0, 0, 0)']}
        locations={[0, 0.55, 1]}
        start={isWide ? { x: 0, y: 0.5 } : { x: 0, y: 0 }}
        end={isWide ? { x: 1, y: 0.5 } : { x: 0, y: 1 }}
        style={[styles.leftShade, isWide ? styles.leftShadeWide : styles.leftShadeNarrow]}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, isWide && styles.scrollContentWide]}
          keyboardShouldPersistTaps="handled">
          {info}
          {card}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BLUE, overflow: 'hidden' },
  background: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  leftShade: { position: 'absolute', top: 0, left: 0 },
  leftShadeWide: { width: '72%', height: '100%' },
  leftShadeNarrow: { width: '100%', height: '68%' },
  flex: { flex: 1 },

  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 28 },
  scrollContentWide: { flexDirection: 'row', alignItems: 'center', padding: 0, gap: 0 },
  panelWide: { flex: 1, padding: 40 },

  infoPanel: { width: '100%' },
  infoContent: { width: '100%', maxWidth: 540, alignSelf: 'center' },
  logo: { width: 88, height: 88, marginBottom: 12 },
  eyebrow: { color: '#e5cd82', fontSize: 13, fontWeight: '800', letterSpacing: 1.5 },
  title: { color: '#fff2b4', fontSize: 48, fontWeight: '900', marginTop: 4 },
  description: { color: '#eef3ea', fontSize: 30, lineHeight: 30, marginTop: 10 },
  features: { marginTop: 18, gap: 12 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureBar: { width: 4, height: 19, borderRadius: 2, backgroundColor: '#e5cd82' },
  feature: { color: '#d5e0cf', fontSize: 16, flexShrink: 1 },

  formPanel: { width: '100%', alignItems: 'center', justifyContent: 'center' },
  form: {
    width: '100%',
    maxWidth: 420,
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 248, 220, 0.96)',
  },
  formTitle: { color: '#15370d', fontSize: 20, fontWeight: '900', marginBottom: 16 },
  label: { color: '#1d4513', fontSize: 14, fontWeight: '700', marginBottom: 8 },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#dccf9a',
    borderRadius: 8,
    backgroundColor: '#fff',
    color: '#15370d',
    paddingHorizontal: 14,
    fontSize: 16,
    marginBottom: 20,
  },
  error: { color: '#b42332', fontSize: 14, marginBottom: 14 },
  submitButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#15370d',
    borderRadius: 8,
    marginTop: 4,
  },
  pressed: { opacity: 0.78 },
  submitText: { color: '#fff2b4', fontSize: 16, fontWeight: '800' },
  switchRow: { flexDirection: 'row', justifyContent: 'center', gap: 5, marginTop: 22 },
  switchLabel: { color: '#5d7258', fontSize: 14 },
  switchAction: { color: '#15370d', fontSize: 14, fontWeight: '800' },
});