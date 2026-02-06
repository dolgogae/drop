import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { useI18n } from '../../contexts/i18n';
import { setTokens, clearTokens, clearProfile } from '../../store';
import axiosInstance from '../../utils/axiosInstance';
import styles from './styles';

const AUTH_TOKENS_KEY = 'auth_tokens';
const REMEMBER_ID_KEY = 'remember_id_gym';
const AUTO_LOGIN_KEY = 'auto_login_gym';
const PROFILE_KEY = 'profile';

export default function GymAdminLoginScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useI18n();

  const [boxId, setBoxId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoLogin, setAutoLogin] = useState(false);
  const [rememberId, setRememberId] = useState(false);

  useEffect(() => {
    const loadSavedSettings = async () => {
      try {
        const [savedId, savedAutoLogin] = await Promise.all([
          AsyncStorage.getItem(REMEMBER_ID_KEY),
          AsyncStorage.getItem(AUTO_LOGIN_KEY),
        ]);
        if (savedId) {
          setBoxId(savedId);
          setRememberId(true);
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
      await AsyncStorage.removeItem(PROFILE_KEY);

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

  const saveLoginSettings = async (accessToken: string, refreshToken: string) => {
    try {
      const promises: Promise<void>[] = [];

      if (autoLogin) {
        promises.push(
          AsyncStorage.setItem(AUTH_TOKENS_KEY, JSON.stringify({ accessToken, refreshToken })),
          AsyncStorage.setItem(AUTO_LOGIN_KEY, 'true')
        );
      } else {
        promises.push(
          AsyncStorage.removeItem(AUTH_TOKENS_KEY),
          AsyncStorage.setItem(AUTO_LOGIN_KEY, 'false')
        );
      }

      if (rememberId) {
        promises.push(AsyncStorage.setItem(REMEMBER_ID_KEY, boxId));
      } else {
        promises.push(AsyncStorage.removeItem(REMEMBER_ID_KEY));
      }

      await Promise.all(promises);
    } catch (error) {
      console.error('Failed to save login settings:', error);
    }
  };

  const handleLogin = async () => {
    if (!boxId || !password) {
      Alert.alert(t('validation.fillAll'));
      return;
    }
    setLoading(true);
    try {
      dispatch(clearTokens());
      dispatch(clearProfile());
      await AsyncStorage.multiRemove([AUTH_TOKENS_KEY, PROFILE_KEY]);

      console.log('[GymAdminLogin] Attempting login with id:', boxId);
      const response = await axiosInstance.post('/auth/login', { email: boxId, password });
      const data = response.data;
      if (response.status === 200 && data.data?.accessToken) {
        const { accessToken, refreshToken } = data.data;

        const profile = await fetchAndSaveProfile(accessToken);

        if (profile?.role !== 'GYM') {
          Alert.alert(t('auth.loginFailed'), t('auth.gymAdminOnly'));
          return;
        }

        await saveLoginSettings(accessToken, refreshToken);

        dispatch(setTokens({
          accessToken,
          refreshToken,
        }));

        router.replace('/admin');
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('auth.gymAdminLogin')}</Text>
      <Text style={styles.subtitle}>{t('auth.gymAdminLoginDesc')}</Text>

      <TextInput
        style={styles.input}
        placeholder={t('auth.boxId')}
        placeholderTextColor="#A3B18A"
        value={boxId}
        onChangeText={setBoxId}
        autoCapitalize="none"
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
          onPress={() => setRememberId(!rememberId)}
        >
          <View style={[styles.checkbox, rememberId && styles.checkboxChecked]}>
            {rememberId && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>{t('auth.rememberId')}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? t('auth.loggingIn') : t('auth.login')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/register/crossfit-box-admin')} style={styles.linkBtn}>
        <Text style={styles.link}>{t('auth.gymRegister')}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace('/login')} style={styles.linkBtn}>
        <Text style={styles.backLink}>{t('auth.backToMemberLogin')}</Text>
      </TouchableOpacity>
    </View>
  );
}
