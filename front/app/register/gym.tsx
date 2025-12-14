import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View, ScrollView } from 'react-native';
import axiosInstance from '../../utils/axiosInstance';
import { useI18n } from '../../contexts/i18n';
import styles from './styles';

export default function GymRegisterScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const params = useLocalSearchParams<{
    username: string;
    email: string;
    password: string;
  }>();

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [etcInfo, setEtcInfo] = useState('');
  const [parking, setParking] = useState(false);
  const [wear, setWear] = useState(false);
  const [locker, setLocker] = useState(false);

  const handleRegister = async () => {
    if (!name || !location || !phoneNumber) {
      Alert.alert(t('gym.requiredFields'));
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post('/auth/sign-up/gym', {
        username: params.username,
        email: params.email,
        password: params.password,
        name,
        location,
        phoneNumber,
        etcInfo,
        usageInfoDto: {
          parking,
          wear,
          locker,
        },
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

  const CheckboxItem = ({
    label,
    checked,
    onPress,
  }: {
    label: string;
    checked: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.checkboxRow, checked && styles.checkboxRowSelected]}
      onPress={onPress}
    >
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>{t('gym.title')}</Text>

        <Text style={styles.sectionTitle}>{t('gym.info')}</Text>
        <TextInput
          style={styles.input}
          placeholder={`${t('gym.name')} ${t('common.required')}`}
          placeholderTextColor="#A3B18A"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder={`${t('gym.location')} ${t('common.required')}`}
          placeholderTextColor="#A3B18A"
          value={location}
          onChangeText={setLocation}
        />
        <TextInput
          style={styles.input}
          placeholder={`${t('gym.phoneNumber')} ${t('common.required')}`}
          placeholderTextColor="#A3B18A"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />
        <TextInput
          style={styles.input}
          placeholder={t('gym.etcInfo')}
          placeholderTextColor="#A3B18A"
          value={etcInfo}
          onChangeText={setEtcInfo}
        />

        <Text style={styles.sectionTitle}>{t('gym.facilityInfo')}</Text>
        <View style={styles.checkboxContainer}>
          <CheckboxItem
            label={t('gym.parking')}
            checked={parking}
            onPress={() => setParking(!parking)}
          />
          <CheckboxItem
            label={t('gym.wear')}
            checked={wear}
            onPress={() => setWear(!wear)}
          />
          <CheckboxItem
            label={t('gym.locker')}
            checked={locker}
            onPress={() => setLocker(!locker)}
          />
        </View>

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
