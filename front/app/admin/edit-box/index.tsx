import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AddressSearchModal, { AddressData } from '../../../components/AddressSearchModal';
import { useI18n } from '../../../contexts/i18n';
import axiosInstance from '../../../utils/axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface BoxInfo {
  id: number;
  name: string;
  phoneNumber: string;
  etcInfo: string;
  address: {
    countryCode: string;
    postalCode: string;
    addressLine1: string;
    addressLine2: string;
    jibunAddress: string;
    buildingName: string;
    addressSource: string;
  } | null;
  usageInfo: {
    parking: boolean;
    wear: boolean;
    locker: boolean;
  } | null;
}

const formatPhoneNumber = (value: string): string => {
  const numbers = value.replace(/[^0-9]/g, '');
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
};

const isValidPhoneNumber = (phone: string): boolean => {
  const pattern = /^0\d{2}-\d{3,4}-\d{4}$/;
  return pattern.test(phone);
};

export default function EditBoxScreen() {
  const router = useRouter();
  const { t } = useI18n();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  useEffect(() => {
    loadBoxInfo();
  }, []);

  const loadBoxInfo = async () => {
    try {
      const response = await axiosInstance.get('/box/my');
      const boxInfo: BoxInfo = response.data.data;

      setName(boxInfo.name || '');
      setPhoneNumber(boxInfo.phoneNumber || '');
      setEtcInfo(boxInfo.etcInfo || '');

      if (boxInfo.address) {
        setSelectedAddress({
          postalCode: boxInfo.address.postalCode || '',
          addressLine1: boxInfo.address.addressLine1 || '',
          jibunAddress: boxInfo.address.jibunAddress || '',
          buildingName: boxInfo.address.buildingName || '',
          addressSource: boxInfo.address.addressSource as any,
        });
        setDetailAddress(boxInfo.address.addressLine2 || '');
      }

      if (boxInfo.usageInfo) {
        setParking(boxInfo.usageInfo.parking || false);
        setWear(boxInfo.usageInfo.wear || false);
        setLocker(boxInfo.usageInfo.locker || false);
      }
    } catch (error) {
      console.error('박스 정보 로드 실패:', error);
      Alert.alert(t('common.error'), t('validation.error'));
    } finally {
      setLoading(false);
    }
  };

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

  const handleSave = async () => {
    if (!name || !selectedAddress || !phoneNumber) {
      Alert.alert(t('crossfitBox.requiredFields'));
      return;
    }

    if (!isValidPhoneNumber(phoneNumber)) {
      setPhoneError(t('validation.invalidPhoneNumber'));
      return;
    }

    setSaving(true);
    try {
      const response = await axiosInstance.put('/box/my', {
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
        usageInfo: {
          parking,
          wear,
          locker,
        },
      });

      if (response.status === 200) {
        // 프로필 정보 업데이트
        const profileStr = await AsyncStorage.getItem('profile');
        if (profileStr) {
          const profile = JSON.parse(profileStr);
          profile.name = name;
          await AsyncStorage.setItem('profile', JSON.stringify(profile));
        }

        Alert.alert(t('common.success'), t('mypage.profileUpdated'), [
          { text: t('common.confirm'), onPress: () => router.back() },
        ]);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || t('validation.error');
      Alert.alert(t('common.error'), message);
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#588157" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#344E41" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('crossfitBox.editTitle')}</Text>
        <TouchableOpacity
          onPress={handleSave}
          style={styles.saveButton}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#588157" />
          ) : (
            <Text style={styles.saveButtonText}>{t('common.save')}</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Box Name */}
          <Text style={styles.sectionTitle}>{t('crossfitBox.info')}</Text>
          <Text style={styles.inputLabel}>{t('crossfitBox.name')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('crossfitBox.name')}
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

          <Text style={styles.inputLabel}>{t('address.detail')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('address.detail')}
            placeholderTextColor="#A3B18A"
            value={detailAddress}
            onChangeText={setDetailAddress}
            editable={!!selectedAddress}
          />

          {/* Phone Number */}
          <Text style={styles.inputLabel}>{t('crossfitBox.phoneNumber')}</Text>
          <TextInput
            style={[styles.input, phoneError ? styles.inputError : null]}
            placeholder="010-1234-5678"
            placeholderTextColor="#A3B18A"
            value={phoneNumber}
            onChangeText={handlePhoneNumberChange}
            keyboardType="phone-pad"
            maxLength={13}
          />
          {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}

          {/* Etc Info */}
          <Text style={styles.inputLabel}>{t('crossfitBox.etcInfo')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('crossfitBox.etcInfoPlaceholder')}
            placeholderTextColor="#A3B18A"
            value={etcInfo}
            onChangeText={setEtcInfo}
          />

          {/* Facility Info */}
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
        </ScrollView>
      </KeyboardAvoidingView>

      <AddressSearchModal
        visible={addressModalVisible}
        onClose={() => setAddressModalVisible(false)}
        onSelect={handleAddressSelect}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  flex: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#344E41',
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#588157',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#344E41',
    marginBottom: 16,
    marginTop: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 48,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#081C15',
    backgroundColor: '#F8F9FA',
  },
  inputError: {
    borderColor: '#D32F2F',
    borderWidth: 2,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 13,
    marginTop: -12,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  addressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 48,
    borderColor: '#588157',
    borderWidth: 1.5,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#F8F9FA',
    gap: 8,
  },
  addressButtonText: {
    color: '#588157',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedAddressContainer: {
    width: '100%',
    padding: 16,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#588157',
  },
  postalCode: {
    fontSize: 14,
    color: '#588157',
    fontWeight: '600',
    marginBottom: 4,
  },
  addressLine: {
    fontSize: 15,
    color: '#344E41',
    lineHeight: 22,
  },
  buildingName: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  checkboxContainer: {
    width: '100%',
    marginBottom: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#FAFAFA',
  },
  checkboxRowSelected: {
    borderColor: '#588157',
    backgroundColor: '#E8F5E9',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#588157',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#588157',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
  },
});
