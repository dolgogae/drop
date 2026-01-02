import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AddressSearchModal, { AddressData } from '../../components/AddressSearchModal';
import { useI18n } from '../../contexts/i18n';
import axiosInstance from '../../utils/axiosInstance';
import styles from './styles';

// 전화번호 포맷팅 함수: xxx-xxxx-xxxx 형식으로 변환
const formatPhoneNumber = (value: string): string => {
  const numbers = value.replace(/[^0-9]/g, '');
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
};

// 전화번호 유효성 검사: xxx-xxxx-xxxx 형식인지 확인
const isValidPhoneNumber = (phone: string): boolean => {
  const pattern = /^0\d{2}-\d{3,4}-\d{4}$/;
  return pattern.test(phone);
};

export default function CrossfitBoxRegisterScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const params = useLocalSearchParams<{
    username: string;
    email: string;
    password: string;
  }>();

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [etcInfo, setEtcInfo] = useState('');
  const [parking, setParking] = useState(false);
  const [wear, setWear] = useState(false);
  const [locker, setLocker] = useState(false);

  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<AddressData | null>(null);
  const [detailAddress, setDetailAddress] = useState('');

  const handlePhoneNumberChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setPhoneNumber(formatted);

    // 입력 중에는 에러 메시지 초기화, 완성된 형태일 때만 검증
    if (formatted.length === 0) {
      setPhoneError('');
    } else if (formatted.length >= 12) {
      // 최소 길이에 도달했을 때 유효성 검사
      if (!isValidPhoneNumber(formatted)) {
        setPhoneError(t('validation.invalidPhoneNumber'));
      } else {
        setPhoneError('');
      }
    } else {
      setPhoneError('');
    }
  };

  const handleAddressSelect = (address: AddressData) => {
    setSelectedAddress(address);
  };

  const handleRegister = async () => {
    if (!name || !selectedAddress || !phoneNumber) {
      Alert.alert(t('crossfitBox.requiredFields'));
      return;
    }

    if (!isValidPhoneNumber(phoneNumber)) {
      setPhoneError(t('validation.invalidPhoneNumber'));
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post('/auth/sign-up/crossfit-box', {
        username: params.username,
        email: params.email,
        password: params.password,
        name,
        phoneNumber,
        etcInfo,
        address: {
          countryCode: 'KR',
          postalCode: selectedAddress.postalCode,
          addressLine1: selectedAddress.addressLine1,
          addressLine2: detailAddress || null,
          jibunAddress: selectedAddress.jibunAddress || null,
          buildingName: selectedAddress.buildingName || null,
          addressSource: selectedAddress.addressSource,
        },
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
        <Text style={styles.title}>{t('crossfitBox.title')}</Text>

        <Text style={styles.sectionTitle}>{t('crossfitBox.info')}</Text>
        <TextInput
          style={styles.input}
          placeholder={`${t('crossfitBox.name')} ${t('common.required')}`}
          placeholderTextColor="#A3B18A"
          value={name}
          onChangeText={setName}
        />

        {/* Address Section */}
        <Text style={styles.sectionTitle}>{t('address.title')}</Text>

        <TouchableOpacity
          style={styles.addressButton}
          onPress={() => setAddressModalVisible(true)}
        >
          <Ionicons name="search" size={20} color="#588157" />
          <Text style={styles.addressButtonText}>
            {selectedAddress ? t('address.change') : t('address.search')}
          </Text>
        </TouchableOpacity>

        {selectedAddress && (
          <View style={styles.selectedAddressContainer}>
            <Text style={styles.postalCode}>[{selectedAddress.postalCode}]</Text>
            <Text style={styles.addressLine}>{selectedAddress.addressLine1}</Text>
            {selectedAddress.buildingName && (
              <Text style={styles.buildingName}>({selectedAddress.buildingName})</Text>
            )}
          </View>
        )}

        <TextInput
          style={styles.input}
          placeholder={`${t('address.detail')} ${t('common.optional')}`}
          placeholderTextColor="#A3B18A"
          value={detailAddress}
          onChangeText={setDetailAddress}
          editable={!!selectedAddress}
        />

        <TextInput
          style={[styles.input, phoneError ? styles.inputError : null]}
          placeholder={`${t('crossfitBox.phoneNumber')} ${t('common.required')}`}
          placeholderTextColor="#A3B18A"
          value={phoneNumber}
          onChangeText={handlePhoneNumberChange}
          keyboardType="phone-pad"
          maxLength={13}
        />
        {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
        <TextInput
          style={styles.input}
          placeholder={t('crossfitBox.etcInfo')}
          placeholderTextColor="#A3B18A"
          value={etcInfo}
          onChangeText={setEtcInfo}
        />

        <Text style={styles.sectionTitle}>{t('crossfitBox.facilityInfo')}</Text>
        <View style={styles.checkboxContainer}>
          <CheckboxItem
            label={t('crossfitBox.parking')}
            checked={parking}
            onPress={() => setParking(!parking)}
          />
          <CheckboxItem
            label={t('crossfitBox.wear')}
            checked={wear}
            onPress={() => setWear(!wear)}
          />
          <CheckboxItem
            label={t('crossfitBox.locker')}
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

      <AddressSearchModal
        visible={addressModalVisible}
        onClose={() => setAddressModalVisible(false)}
        onSelect={handleAddressSelect}
      />
    </ScrollView>
  );
}
