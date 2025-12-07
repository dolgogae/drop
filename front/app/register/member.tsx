import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View, ScrollView } from 'react-native';
import axiosInstance from '../../utils/axiosInstance';
import { useI18n } from '../../contexts/i18n';
import styles from './styles';

export default function MemberRegisterScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const params = useLocalSearchParams<{
    username: string;
    email: string;
    password: string;
  }>();

  const [loading, setLoading] = useState(false);
  const [exampleColumn, setExampleColumn] = useState('');

  const handleRegister = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/auth/sign-up/member', {
        username: params.username,
        email: params.email,
        password: params.password,
        exampleColumn,
      });

      if (response.status === 200 || response.status === 201) {
        Alert.alert(t('auth.registerSuccess'), t('auth.redirectToLogin'));
        router.replace('/login');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || t('validation.error');
      Alert.alert(t('auth.registerFailed'), message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>{t('member.title')}</Text>

        <Text style={styles.sectionTitle}>{t('info.additional')}</Text>
        <TextInput
          style={styles.input}
          placeholder={`${t('member.additionalInfo')} ${t('common.optional')}`}
          placeholderTextColor="#A3B18A"
          value={exampleColumn}
          onChangeText={setExampleColumn}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? t('auth.registering') : t('auth.completeRegister')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} style={styles.linkBtn}>
          <Text style={styles.link}>{t('common.back')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
