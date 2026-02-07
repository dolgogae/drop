import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { useI18n } from '../../contexts/i18n';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';
import { setTokens, clearTokens, clearProfile } from '../../store';
import axiosInstance from '../../utils/axiosInstance';
import styles from './styles';

const AUTH_TOKENS_KEY = 'auth_tokens';
const REMEMBER_EMAIL_KEY = 'remember_email';
const AUTO_LOGIN_KEY = 'auto_login';
const PROFILE_KEY = 'profile';

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useI18n();
  const { signInWithGoogle, isLoading: googleLoading, isReady: googleReady } = useGoogleAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoLogin, setAutoLogin] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(false);

  useEffect(() => {
    const loadSavedSettings = async () => {
      try {
        const [savedEmail, savedAutoLogin] = await Promise.all([
          AsyncStorage.getItem(REMEMBER_EMAIL_KEY),
          AsyncStorage.getItem(AUTO_LOGIN_KEY),
        ]);
        if (savedEmail) {
          setEmail(savedEmail);
          setRememberEmail(true);
        }
        if (savedAutoLogin === 'true') {
          setAutoLogin(true);
        }
      } catch (error) {
        console.error('Failed to load saved settings:', error);
      }
    };
    loadSavedSettings();
  }, []);

  const fetchAndSaveProfile = async (accessToken: string) => {
    try {
      // 기존 프로필 먼저 삭제
      await AsyncStorage.removeItem(PROFILE_KEY);

      // 새 토큰으로 직접 프로필 조회
      const response = await axiosInstance.get('/mypage/profile', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (response.data?.data) {
        await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(response.data.data));
        return response.data.data;
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
    return null;
  };

  const saveLoginSettings = async (accessToken: string, refreshToken: string, role: string) => {
    try {
      const promises: Promise<void>[] = [];

      // 자동 로그인이 체크된 경우 토큰 저장
      if (autoLogin) {
        promises.push(
          AsyncStorage.setItem(AUTH_TOKENS_KEY, JSON.stringify({ accessToken, refreshToken, role })),
          AsyncStorage.setItem(AUTO_LOGIN_KEY, 'true')
        );
      } else {
        promises.push(
          AsyncStorage.removeItem(AUTH_TOKENS_KEY),
          AsyncStorage.setItem(AUTO_LOGIN_KEY, 'false')
        );
      }

      // 아이디 기억하기가 체크된 경우 이메일 저장
      if (rememberEmail) {
        promises.push(AsyncStorage.setItem(REMEMBER_EMAIL_KEY, email));
      } else {
        promises.push(AsyncStorage.removeItem(REMEMBER_EMAIL_KEY));
      }

      await Promise.all(promises);
    } catch (error) {
      console.error('Failed to save login settings:', error);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('validation.fillAll'));
      return;
    }
    setLoading(true);
    try {
      // 기존 인증 정보 정리
      dispatch(clearTokens());
      dispatch(clearProfile());
      await AsyncStorage.multiRemove([AUTH_TOKENS_KEY, PROFILE_KEY]);

      console.log('[Login] Attempting login with email:', email);
      const response = await axiosInstance.post('/auth/login', { email, password });
      const data = response.data;
      if (response.status === 200 && data.data?.accessToken) {
        const { accessToken, refreshToken, role } = data.data;

        await saveLoginSettings(accessToken, refreshToken, role);

        // GYM은 프로필 캐싱 완료 후 토큰 dispatch (admin에서 boxName 필요)
        if (role === 'GYM') {
          await fetchAndSaveProfile(accessToken);
        }

        // dispatch 후 _layout.tsx가 role 기반으로 자동 라우팅
        dispatch(setTokens({
          accessToken,
          refreshToken,
          role,
        }));

        // MEMBER만 백그라운드 프로필 캐싱
        if (role !== 'GYM') {
          fetchAndSaveProfile(accessToken);
        }
      } else {
        Alert.alert(t('auth.loginFailed'), data.message || t('validation.error'));
      }
    } catch (e: any) {
      if (e.response) {
        const message = e.response.data?.message || t('validation.invalidCredentials');
        console.log(message);
        Alert.alert(t('auth.loginFailed'), message);
      } else {
        Alert.alert(t('auth.loginFailed'), t('validation.networkError'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    // 기존 인증 정보 정리
    dispatch(clearTokens());
    dispatch(clearProfile());
    await AsyncStorage.multiRemove([AUTH_TOKENS_KEY, PROFILE_KEY]);

    const result = await signInWithGoogle();

    if (result.success && result.idToken) {
      try {
        const response = await axiosInstance.post('/auth/oauth/google', {
          idToken: result.idToken,
          accessToken: result.accessToken,
        });

        const data = response.data;
        if (response.status === 200 && data.data?.accessToken) {
          const { accessToken, refreshToken, role } = data.data;

          await saveLoginSettings(accessToken, refreshToken, role);

          if (role === 'GYM') {
            await fetchAndSaveProfile(accessToken);
          }

          dispatch(setTokens({
            accessToken,
            refreshToken,
            role,
          }));

          if (role !== 'GYM') {
            fetchAndSaveProfile(accessToken);
          }
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

      <View style={styles.checkboxContainer}>
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setAutoLogin(!autoLogin)}
        >
          <View style={[styles.checkbox, autoLogin && styles.checkboxChecked]}>
            {autoLogin && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>{t('auth.autoLogin')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setRememberEmail(!rememberEmail)}
        >
          <View style={[styles.checkbox, rememberEmail && styles.checkboxChecked]}>
            {rememberEmail && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>{t('auth.rememberEmail')}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? t('auth.loggingIn') : t('auth.login')}
        </Text>
      </TouchableOpacity>

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

      <TouchableOpacity onPress={() => router.push('/register/member-admin')} style={styles.registerButton}>
        <Text style={styles.registerButtonText}>{t('auth.goToRegister')}</Text>
      </TouchableOpacity>

    </View>
  );
}
