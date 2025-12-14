import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { useI18n } from '../../contexts/i18n';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';
import { setTokens } from '../../store';
import axiosInstance from '../../utils/axiosInstance';
import styles from './styles';

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useI18n();
  const { signInWithGoogle, isLoading: googleLoading, isReady: googleReady } = useGoogleAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('validation.fillAll'));
      return;
    }
    setLoading(true);
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      const data = response.data;
      if (response.status === 200 && data.data?.accessToken) {
        dispatch(setTokens({
          accessToken: data.data.accessToken,
          refreshToken: data.data.refreshToken,
        }));
        Alert.alert(t('auth.loginSuccess'));
        router.replace('/');
      } else {
        Alert.alert(t('auth.loginFailed'), data.message || t('validation.error'));
      }
    } catch (e: any) {
      if (e.response) {
        // HTTP 에러 응답을 받은 경우 (서버가 응답함)
        const message = e.response.data?.message || t('validation.invalidCredentials');
        console.log(message);
        Alert.alert(t('auth.loginFailed'), message);
      } else {
        // 네트워크 에러 (서버 연결 실패)
        Alert.alert(t('auth.loginFailed'), t('validation.networkError'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const result = await signInWithGoogle();

    if (result.success && result.idToken) {
      try {
        const response = await axiosInstance.post('/auth/oauth/google', {
          idToken: result.idToken,
          accessToken: result.accessToken,
        });

        const data = response.data;
        if (response.status === 200 && data.data?.accessToken) {
          dispatch(setTokens({
            accessToken: data.data.accessToken,
            refreshToken: data.data.refreshToken,
          }));
          Alert.alert(t('auth.loginSuccess'));
          router.replace('/');
        } else {
          Alert.alert(t('auth.loginFailed'), data.message || t('validation.error'));
        }
      } catch (e: any) {
        const message = e.response?.data?.message || t('validation.error');
        Alert.alert(t('auth.loginFailed'), message);
      }
    } else if (result.error) {
      Alert.alert(t('auth.loginFailed'), result.error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('auth.login')}</Text>
      <TextInput
        style={styles.input}
        placeholder={t('auth.email')}
        placeholderTextColor="#A3B18A"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder={t('auth.password')}
        placeholderTextColor="#A3B18A"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? t('auth.loggingIn') : t('auth.login')}
        </Text>
      </TouchableOpacity>

      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>{t('auth.or')}</Text>
        <View style={styles.divider} />
      </View>

      <TouchableOpacity
        style={[styles.socialButton, styles.googleButton]}
        onPress={handleGoogleLogin}
        disabled={googleLoading || !googleReady}
      >
        <Text style={styles.googleIcon}>G</Text>
        <Text style={styles.socialButtonText}>
          {googleLoading ? t('auth.loggingIn') : t('auth.googleLogin')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/register')} style={styles.linkBtn}>
        <Text style={styles.link}>{t('auth.goToRegister')}</Text>
      </TouchableOpacity>
    </View>
  );
}
