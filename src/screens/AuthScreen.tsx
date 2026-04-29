import React, { useState } from 'react';
import { authService } from '../services';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface AuthScreenProps {
  onLogin: () => void;
}

const AuthScreen = ({ onLogin }: AuthScreenProps) => {
  const { colors } = useTheme();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const handleLogin = async () => {
    try {
      setIsSubmitting(true);
      // 1. Sabit stringleri sildik, kullanıcının ekrana yazdığı form verilerini gönderiyoruz.
      const user = await authService.login({
        email: loginForm.email.trim(),
        password: loginForm.password.trim(),
      });

      console.log(user.username); // "test"
      console.log(user.type);     // "GM"

      // 2. Olmayan 'navigation' yerine, yukarıdan aldığımız 'onLogin' prop'unu tetikliyoruz.
      onLogin();

    } catch (error: any) {
      // (Opsiyonel) Kullanıcıya hatayı göstermek için bir Alert ekleyebilirsin
      Alert.alert('Giriş Başarısız', error.message || 'Lütfen bilgilerinizi kontrol edin.');
      console.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = () => {
    if (registerForm.password !== registerForm.confirmPassword) {
      Alert.alert("Passwords don't match");
      return;
    }
    onLogin();
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    inner: {
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingTop: 56,
      paddingBottom: 40,
    },
    brand: { fontSize: 30, fontWeight: '800', color: colors.primary, letterSpacing: -0.5, marginBottom: 32 },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: colors.muted,
      borderRadius: 14,
      padding: 4,
      width: '100%',
      marginBottom: 32,
    },
    tabBtn: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 10,
      alignItems: 'center',
    },
    tabActive: { backgroundColor: colors.primary, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    tabText: { fontSize: 14, fontWeight: '700', color: colors.mutedForeground },
    tabTextActive: { color: '#fff' },
    form: { width: '100%', gap: 16 },
    inputWrap: {
      height: 52,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      paddingHorizontal: 16,
      fontSize: 15,
      color: colors.foreground,
      justifyContent: 'center',
    },
    inputText: { color: colors.foreground, fontSize: 15 },
    passwordRow: { position: 'relative' },
    eyeBtn: { position: 'absolute', right: 14, top: 14 },
    forgotRow: { alignItems: 'flex-end' },
    forgotText: { fontSize: 13, color: colors.primary, fontWeight: '500' },
    hint: { fontSize: 11, color: colors.mutedForeground, textAlign: 'center' },
    primaryBtn: {
      height: 52,
      backgroundColor: colors.primary,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.primary,
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },
    dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    divider: { flex: 1, height: 1, backgroundColor: colors.border },
    dividerText: { fontSize: 11, color: colors.mutedForeground, fontWeight: '600' },
    googleBtn: {
      height: 52,
      borderRadius: 999,
      borderWidth: 1.5,
      borderColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 8,
    },
    googleBtnText: { fontSize: 13, fontWeight: '700', color: colors.primary },
    bottomText: { fontSize: 13, color: colors.mutedForeground, textAlign: 'center' },
    link: { color: colors.primary, fontWeight: '700' },
    phoneRow: { flexDirection: 'row', gap: 8 },
    phonePrefix: {
      height: 52,
      paddingHorizontal: 12,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    phonePrefixText: { fontSize: 14, fontWeight: '600', color: colors.foreground },
  });

  const renderInput = (
    placeholder: string,
    value: string,
    onChange: (v: string) => void,
    opts?: { secure?: boolean; show?: boolean; onToggle?: () => void; keyboard?: 'email-address' | 'phone-pad' | 'default' }
  ) => (
    <View style={opts?.secure ? s.passwordRow : undefined}>
      <View style={s.inputWrap}>
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          value={value}
          onChangeText={onChange}
          secureTextEntry={opts?.secure && !opts.show}
          keyboardType={opts?.keyboard ?? 'default'}
          autoCapitalize="none"
          style={s.inputText}
        />
      </View>
      {opts?.secure && (
        <TouchableOpacity style={s.eyeBtn} onPress={opts.onToggle}>
          <Ionicons
            name={opts.show ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={colors.mutedForeground}
          />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={s.inner} keyboardShouldPersistTaps="handled">
        <Text style={s.brand}>Sarajevo Expats</Text>

        <View style={s.tabContainer}>
          {(['login', 'register'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[s.tabBtn, tab === t && s.tabActive]}
              onPress={() => setTab(t)}
            >
              <Text style={[s.tabText, tab === t && s.tabTextActive]}>
                {t === 'login' ? 'Login' : 'Register'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === 'login' ? (
          <View style={s.form}>
            {renderInput('Email or Username *', loginForm.email, (v) => setLoginForm({ ...loginForm, email: v }), { keyboard: 'email-address' })}
            {renderInput('Password *', loginForm.password, (v) => setLoginForm({ ...loginForm, password: v }), {
              secure: true, show: showPassword, onToggle: () => setShowPassword(!showPassword),
            })}
            <View style={s.forgotRow}>
              <Text style={s.forgotText}>Forgot Password?</Text>
            </View>
            <Text style={s.hint}>Giris test hesabi: admin@sarajevoexpats.com / admin123</Text>
            <TouchableOpacity
              style={[s.primaryBtn, isSubmitting && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={isSubmitting}
            >
              <Text style={s.primaryBtnText}>{isSubmitting ? 'LOGGING IN...' : 'LOGIN'}</Text>
            </TouchableOpacity>
            <View style={s.dividerRow}>
              <View style={s.divider} />
              <Text style={s.dividerText}>OR</Text>
              <View style={s.divider} />
            </View>
            <TouchableOpacity style={s.googleBtn} onPress={onLogin}>
              <Text style={{ fontSize: 18 }}>G</Text>
              <Text style={s.googleBtnText}>CONTINUE WITH GOOGLE</Text>
            </TouchableOpacity>
            <Text style={s.bottomText}>
              Don't have an account?{' '}
              <Text style={s.link} onPress={() => setTab('register')}>Register</Text>
            </Text>
          </View>
        ) : (
          <View style={s.form}>
            {renderInput('Username *', registerForm.username, (v) => setRegisterForm({ ...registerForm, username: v }))}
            {renderInput('Email Address *', registerForm.email, (v) => setRegisterForm({ ...registerForm, email: v }), { keyboard: 'email-address' })}
            <View>
              <Text style={{ fontSize: 13, fontWeight: '500', color: colors.foreground, marginBottom: 6 }}>Phone Number *</Text>
              <View style={s.phoneRow}>
                <View style={s.phonePrefix}>
                  <Text>🇧🇦</Text>
                  <Text style={s.phonePrefixText}>+387</Text>
                </View>
                <View style={[s.inputWrap, { flex: 1 }]}>
                  <TextInput
                    placeholder="Phone number"
                    placeholderTextColor={colors.mutedForeground}
                    value={registerForm.phone}
                    onChangeText={(v) => setRegisterForm({ ...registerForm, phone: v })}
                    keyboardType="phone-pad"
                    style={s.inputText}
                  />
                </View>
              </View>
            </View>
            {renderInput('Password *', registerForm.password, (v) => setRegisterForm({ ...registerForm, password: v }), {
              secure: true, show: showPassword, onToggle: () => setShowPassword(!showPassword),
            })}
            {renderInput('Confirm Password *', registerForm.confirmPassword, (v) => setRegisterForm({ ...registerForm, confirmPassword: v }), {
              secure: true, show: showConfirm, onToggle: () => setShowConfirm(!showConfirm),
            })}
            <TouchableOpacity style={s.primaryBtn} onPress={handleRegister}>
              <Text style={s.primaryBtnText}>CREATE ACCOUNT</Text>
            </TouchableOpacity>
            <Text style={s.bottomText}>
              Already have an account?{' '}
              <Text style={s.link} onPress={() => setTab('login')}>Login</Text>
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AuthScreen;
