import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import axiosInstance from '../../utils/axiosInstance';
import { gymEvents } from '../../utils/gymEvents';

interface Gym {
  id: number;
  name: string;
  location: string;
  phoneNumber: string | null;
  latitude: number;
  longitude: number;
}

const NEARBY_DELTA = 0.025; // 약 2.5km 반경

export default function NearbyGymsScreen() {
  const router = useRouter();
  const { lat, lng, address } = useLocalSearchParams<{
    lat?: string;
    lng?: string;
    address?: string;
  }>();

  const [gyms, setGyms] = useState<Gym[]>([]);
  const [myGymIds, setMyGymIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [addingGymId, setAddingGymId] = useState<number | null>(null);

  useEffect(() => {
    if (lat && lng) {
      fetchNearbyGyms();
      fetchMyGyms();
    }
  }, [lat, lng]);

  const fetchNearbyGyms = async () => {
    if (!lat || !lng) return;

    try {
      setIsLoading(true);
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);

      const response = await axiosInstance.get('/gyms/map/bounds', {
        params: {
          swLat: latitude - NEARBY_DELTA,
          swLng: longitude - NEARBY_DELTA,
          neLat: latitude + NEARBY_DELTA,
          neLng: longitude + NEARBY_DELTA,
        },
      });

      if (response.data?.data) {
        // 거리순으로 정렬
        const sorted = response.data.data.sort((a: Gym, b: Gym) => {
          const distA = Math.sqrt(
            Math.pow(a.latitude - latitude, 2) + Math.pow(a.longitude - longitude, 2)
          );
          const distB = Math.sqrt(
            Math.pow(b.latitude - latitude, 2) + Math.pow(b.longitude - longitude, 2)
          );
          return distA - distB;
        });
        setGyms(sorted);
      }
    } catch (error) {
      console.error('근처 체육관 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyGyms = async () => {
    try {
      const response = await axiosInstance.get('/member-gym');
      if (response.data?.data) {
        const ids = new Set<number>(response.data.data.map((g: any) => g.gymId));
        setMyGymIds(ids);
      }
    } catch (error) {
      console.error('내 체육관 목록 조회 실패:', error);
    }
  };

  const handleAddToMyGyms = async (gymId: number) => {
    try {
      setAddingGymId(gymId);
      await axiosInstance.post('/member-gym', { gymId, isFavorite: false });
      setMyGymIds((prev) => new Set(prev).add(gymId));
      gymEvents.emit();
      Alert.alert('성공', '내 체육관에 추가되었습니다.');
    } catch (error: any) {
      const message = error.response?.data?.message || '추가에 실패했습니다.';
      Alert.alert('오류', message);
    } finally {
      setAddingGymId(null);
    }
  };

  const handleRemoveFromMyGyms = async (gymId: number) => {
    try {
      setAddingGymId(gymId);
      await axiosInstance.delete(`/member-gym/${gymId}`);
      setMyGymIds((prev) => {
        const next = new Set(prev);
        next.delete(gymId);
        return next;
      });
      gymEvents.emit();
      Alert.alert('성공', '내 체육관에서 제거되었습니다.');
    } catch (error: any) {
      const message = error.response?.data?.message || '제거에 실패했습니다.';
      Alert.alert('오류', message);
    } finally {
      setAddingGymId(null);
    }
  };

  const handleGymPress = (gymId: number) => {
    router.push(`/gym/${gymId}` as any);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#588157" />
          <Text style={styles.loadingText}>근처 체육관을 찾는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#344E41" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>근처 체육관</Text>
          {address && <Text style={styles.headerSubtitle}>{address}</Text>}
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {gyms.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="fitness-outline" size={64} color="#A3B18A" />
            <Text style={styles.emptyText}>근처에 체육관이 없습니다</Text>
          </View>
        ) : (
          <>
            <Text style={styles.resultCount}>{gyms.length}개의 체육관</Text>
            {gyms.map((gym) => {
              const isMyGym = myGymIds.has(gym.id);
              const isProcessing = addingGymId === gym.id;

              return (
                <TouchableOpacity
                  key={gym.id}
                  style={styles.gymCard}
                  onPress={() => handleGymPress(gym.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.gymInfo}>
                    <Text style={styles.gymName}>{gym.name}</Text>
                    {gym.location && <Text style={styles.gymLocation}>{gym.location}</Text>}
                    {gym.phoneNumber && <Text style={styles.gymPhone}>{gym.phoneNumber}</Text>}
                  </View>
                  <TouchableOpacity
                    style={[styles.addButton, isMyGym && styles.addButtonActive]}
                    onPress={() =>
                      isMyGym ? handleRemoveFromMyGyms(gym.id) : handleAddToMyGyms(gym.id)
                    }
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <ActivityIndicator size="small" color={isMyGym ? '#588157' : '#fff'} />
                    ) : (
                      <>
                        <Ionicons
                          name={isMyGym ? 'checkmark' : 'add'}
                          size={18}
                          color={isMyGym ? '#588157' : '#fff'}
                        />
                        <Text style={[styles.addButtonText, isMyGym && styles.addButtonTextActive]}>
                          {isMyGym ? '추가됨' : '추가'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#588157',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#344E41',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#A3B18A',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  resultCount: {
    fontSize: 14,
    color: '#A3B18A',
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#A3B18A',
    marginTop: 16,
  },
  gymCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  gymInfo: {
    flex: 1,
  },
  gymName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#344E41',
  },
  gymLocation: {
    fontSize: 14,
    color: '#588157',
    marginTop: 4,
  },
  gymPhone: {
    fontSize: 12,
    color: '#A3B18A',
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#588157',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 12,
    minWidth: 70,
    justifyContent: 'center',
  },
  addButtonActive: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#588157',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  addButtonTextActive: {
    color: '#588157',
  },
});
