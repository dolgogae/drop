import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useMemo } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AddressSearchModal, { AddressData } from '../../components/AddressSearchModal';
import { useI18n } from '../../contexts/i18n';
import axiosInstance from '../../utils/axiosInstance';
import styles from './styles';

const validatePassword = (password: string): boolean => {
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const hasMinLength = password.length >= 8;
  return hasLowercase && hasNumber && hasSpecialChar && hasMinLength;
};

const formatPhoneNumber = (value: string): string => {
  const numbers = value.replace(/[^0-9]/g, '');

  // 4자리 지역번호 (0504, 0505 등 인터넷 전화)
  if (numbers.startsWith('050') && numbers.length > 3) {
    if (numbers.length <= 4) return numbers;
    if (numbers.length <= 8) return `${numbers.slice(0, 4)}-${numbers.slice(4)}`;
    return `${numbers.slice(0, 4)}-${numbers.slice(4, 8)}-${numbers.slice(8, 12)}`;
  }

  // 2자리 지역번호 (02 서울)
  if (numbers.startsWith('02')) {
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 5) return `${numbers.slice(0, 2)}-${numbers.slice(2)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 2)}-${numbers.slice(2, 5)}-${numbers.slice(5)}`;
    return `${numbers.slice(0, 2)}-${numbers.slice(2, 6)}-${numbers.slice(6, 10)}`;
  }

  // 3자리 지역번호 (010, 031, 070 등)
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
};

const isValidPhoneNumber = (phone: string): boolean => {
  const pattern = /^0\d{1,3}-\d{3,4}-\d{4}$/;
  return pattern.test(phone);
};

export default function CrossfitBoxStandaloneRegisterScreen() {
  const router = useRouter();
  const { t } = useI18n();

  // Basic info
  const [username, setUsername] = useState('');
  const [boxId, setBoxId] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  // Validation states
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [passwordConfirmTouched, setPasswordConfirmTouched] = useState(false);

  // CrossFit Box info
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

  const isPasswordValid = useMemo(() => validatePassword(password), [password]);
  const isPasswordMatch = useMemo(() => password === passwordConfirm, [password, passwordConfirm]);

  const showPasswordError = passwordTouched && password.length > 0 && !isPasswordValid;
  const showPasswordMismatch = passwordConfirmTouched && passwordConfirm.length > 0 && !isPasswordMatch;

  const handlePhoneNumberChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setPhoneNumber(formatted);

    if (formatted.length === 0) {
      setPhoneError('');
    } else if (formatted.length >= 12) {
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
    // Basic validation
    if (!username || !boxId || !password || !passwordConfirm) {
      Alert.alert(t('validation.fillAll'));
      return;
    }
    if (!isPasswordValid) {
      Alert.alert(t('validation.invalidPassword'));
      return;
    }
    if (!isPasswordMatch) {
      Alert.alert(t('validation.passwordMismatch'));
      return;
    }

    // CrossFit Box validation
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
        username,
        email: boxId,
        password,
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
        router.replace('/login/gym-admin');
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

        {/* Basic Info Section */}
        <Text style={styles.sectionTitle}>{t('info.basic')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('auth.name')}
          placeholderTextColor="#A3B18A"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder={t('auth.boxId')}
          placeholderTextColor="#A3B18A"
          value={boxId}
          onChangeText={setBoxId}
          autoCapitalize="none"
        />
        <TextInput
          style={[styles.input, showPasswordError && styles.inputError]}
          placeholder={t('auth.password')}
          placeholderTextColor="#A3B18A"
          value={password}
          onChangeText={setPassword}
          onBlur={() => setPasswordTouched(true)}
          secureTextEntry
        />
        {showPasswordError && (
          <Text style={styles.errorText}>{t('validation.invalidPassword')}</Text>
        )}
        <TextInput
          style={[styles.input, showPasswordMismatch && styles.inputError]}
          placeholder={t('auth.passwordConfirm')}
          placeholderTextColor="#A3B18A"
          value={passwordConfirm}
          onChangeText={setPasswordConfirm}
          onBlur={() => setPasswordConfirmTouched(true)}
          secureTextEntry
        />
        {showPasswordMismatch && (
          <Text style={styles.errorText}>{t('validation.passwordMismatch')}</Text>
        )}

        {/* CrossFit Box Info Section */}
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
          maxLength={14}
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

        <TouchableOpacity onPress={() => router.push('/login/gym-admin')} style={styles.linkBtn}>
          <Text style={styles.link}>{t('auth.goToLogin')}</Text>
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
