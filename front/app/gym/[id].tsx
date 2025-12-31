import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import axiosInstance from '../../utils/axiosInstance';

interface GymUsageInfo {
  parking: boolean;
  wear: boolean;
  locker: boolean;
}

interface Address {
  addressLine1: string;
  addressLine2?: string;
  zipCode?: string;
}

interface GymDetail {
  id: number;
  name: string;
  phoneNumber?: string;
  etcInfo?: string;
  address?: Address;
  latitude?: number;
  longitude?: number;
  usageInfoDto?: GymUsageInfo;
}

export default function GymDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [gym, setGym] = useState<GymDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchGymDetail();
    }
  }, [id]);

  const fetchGymDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get(`/gyms/${id}`);
      if (response.data?.data) {
        setGym(response.data.data);
      }
    } catch (err: any) {
      console.error('체육관 상세 조회 실패:', err);
      setError('체육관 정보를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleCall = async () => {
    if (gym?.phoneNumber) {
      const phoneUrl = `tel:${gym.phoneNumber}`;
      const canOpen = await Linking.canOpenURL(phoneUrl);
      if (canOpen) {
        Linking.openURL(phoneUrl);
      } else {
        Alert.alert('전화 연결', `전화번호: ${gym.phoneNumber}`, [{ text: '확인' }]);
      }
    }
  };

  const handleOpenMap = async () => {
    const address = getFullAddress();
    if (address) {
      const encodedAddress = encodeURIComponent(address);
      const naverMapAppUrl = `nmap://search?query=${encodedAddress}&appname=com.drop.app`;
      const naverMapWebUrl = `https://map.naver.com/v5/search/${encodedAddress}`;

      const canOpenNaverMap = await Linking.canOpenURL(naverMapAppUrl);
      if (canOpenNaverMap) {
        Linking.openURL(naverMapAppUrl);
      } else {
        Linking.openURL(naverMapWebUrl);
      }
    }
  };

  const getFullAddress = () => {
    if (!gym?.address) return null;
    const { addressLine1, addressLine2 } = gym.address;
    if (addressLine2) {
      return `${addressLine1} ${addressLine2}`;
    }
    return addressLine1;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="#344E41" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>체육관 정보</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#588157" />
          <Text style={styles.loadingText}>불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !gym) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="#344E41" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>체육관 정보</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#A3B18A" />
          <Text style={styles.errorText}>{error || '체육관을 찾을 수 없습니다.'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchGymDetail}>
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const fullAddress = getFullAddress();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#344E41" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>체육관 정보</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* 체육관 이름 */}
        <View style={styles.nameSection}>
          <Text style={styles.gymName}>{gym.name}</Text>
        </View>

        {/* 기본 정보 */}
        <View style={styles.infoCard}>
          {/* 주소 */}
          {fullAddress && (
            <TouchableOpacity style={styles.infoRow} onPress={handleOpenMap}>
              <View style={styles.infoIcon}>
                <Ionicons name="location-outline" size={22} color="#588157" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>주소</Text>
                <Text style={styles.infoValue}>{fullAddress}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#A3B18A" />
            </TouchableOpacity>
          )}

          {/* 전화번호 */}
          {gym.phoneNumber && (
            <TouchableOpacity style={styles.infoRow} onPress={handleCall}>
              <View style={styles.infoIcon}>
                <Ionicons name="call-outline" size={22} color="#588157" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>전화번호</Text>
                <Text style={styles.infoValue}>{gym.phoneNumber}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#A3B18A" />
            </TouchableOpacity>
          )}

          {/* 기타 정보 */}
          {gym.etcInfo && (
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="information-circle-outline" size={22} color="#588157" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>추가 정보</Text>
                <Text style={styles.infoValue}>{gym.etcInfo}</Text>
              </View>
            </View>
          )}
        </View>

        {/* 이용 정보 */}
        {gym.usageInfoDto && (
          <View style={styles.usageCard}>
            <Text style={styles.sectionTitle}>편의시설</Text>
            <View style={styles.usageGrid}>
              <View style={styles.usageItem}>
                <View style={[styles.usageIcon, gym.usageInfoDto.parking && styles.usageIconActive]}>
                  <Ionicons
                    name="car-outline"
                    size={24}
                    color={gym.usageInfoDto.parking ? '#fff' : '#A3B18A'}
                  />
                </View>
                <Text style={[styles.usageLabel, gym.usageInfoDto.parking && styles.usageLabelActive]}>
                  주차
                </Text>
              </View>

              <View style={styles.usageItem}>
                <View style={[styles.usageIcon, gym.usageInfoDto.wear && styles.usageIconActive]}>
                  <Ionicons
                    name="shirt-outline"
                    size={24}
                    color={gym.usageInfoDto.wear ? '#fff' : '#A3B18A'}
                  />
                </View>
                <Text style={[styles.usageLabel, gym.usageInfoDto.wear && styles.usageLabelActive]}>
                  운동복
                </Text>
              </View>

              <View style={styles.usageItem}>
                <View style={[styles.usageIcon, gym.usageInfoDto.locker && styles.usageIconActive]}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={24}
                    color={gym.usageInfoDto.locker ? '#fff' : '#A3B18A'}
                  />
                </View>
                <Text style={[styles.usageLabel, gym.usageInfoDto.locker && styles.usageLabelActive]}>
                  락커
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#344E41',
  },
  headerRight: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#A3B18A',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#588157',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  nameSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  gymName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#344E41',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f7f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#A3B18A',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: '#344E41',
    fontWeight: '500',
  },
  usageCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#344E41',
    marginBottom: 16,
  },
  usageGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  usageItem: {
    alignItems: 'center',
  },
  usageIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  usageIconActive: {
    backgroundColor: '#588157',
  },
  usageLabel: {
    fontSize: 13,
    color: '#A3B18A',
  },
  usageLabelActive: {
    color: '#344E41',
    fontWeight: '500',
  },
});
