import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View, ScrollView } from 'react-native';
import axiosInstance from '../../utils/axiosInstance';
import { useI18n } from '../../contexts/i18n';
import styles from './styles';

export default function TrainerRegisterScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const params = useLocalSearchParams<{
    username: string;
    email: string;
    password: string;
  }>();

  const [loading, setLoading] = useState(false);
  const [shortIntroduction, setShortIntroduction] = useState('');
  const [longIntroduction, setLongIntroduction] = useState('');

  const handleRegister = async () => {
    if (!shortIntroduction) {
      Alert.alert(t('trainer.shortIntroRequired'));
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post('/auth/sign-up/trainer', {
        username: params.username,
        email: params.email,
        password: params.password,
        shortIntroduction,
        longIntroduction,
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
        <Text style={styles.title}>{t('trainer.title')}</Text>

        <Text style={styles.sectionTitle}>{t('trainer.info')}</Text>
        <TextInput
          style={styles.input}
          placeholder={`${t('trainer.shortIntro')} ${t('common.required')}`}
          placeholderTextColor="#A3B18A"
          value={shortIntroduction}
          onChangeText={setShortIntroduction}
        />
        <TextInput
          style={styles.textArea}
          placeholder={`${t('trainer.longIntro')} ${t('common.optional')}`}
          placeholderTextColor="#A3B18A"
          value={longIntroduction}
          onChangeText={setLongIntroduction}
          multiline
          numberOfLines={4}
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
