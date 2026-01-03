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
import { crossfitBoxEvents } from '../../utils/crossfitBoxEvents';

interface CrossfitBox {
  id: number;
  name: string;
  location: string;
  phoneNumber: string | null;
  latitude: number;
  longitude: number;
}

const NEARBY_DELTA = 0.025; // 약 2.5km 반경

export default function NearbyCrossfitBoxesScreen() {
  const router = useRouter();
  const { lat, lng, address } = useLocalSearchParams<{
    lat?: string;
    lng?: string;
    address?: string;
  }>();

  const [crossfitBoxes, setCrossfitBoxes] = useState<CrossfitBox[]>([]);
  const [myCrossfitBoxIds, setMyCrossfitBoxIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [addingCrossfitBoxId, setAddingCrossfitBoxId] = useState<number | null>(null);

  useEffect(() => {
    if (lat && lng) {
      fetchNearbyCrossfitBoxes();
      fetchMyCrossfitBoxes();
    }
  }, [lat, lng]);

  const fetchNearbyCrossfitBoxes = async () => {
    if (!lat || !lng) return;

    try {
      setIsLoading(true);
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);

      const response = await axiosInstance.get('/crossfit-boxes/map/bounds', {
        params: {
          swLat: latitude - NEARBY_DELTA,
          swLng: longitude - NEARBY_DELTA,
          neLat: latitude + NEARBY_DELTA,
          neLng: longitude + NEARBY_DELTA,
        },
      });

      if (response.data?.data) {
        // 거리순으로 정렬
        const sorted = response.data.data.sort((a: CrossfitBox, b: CrossfitBox) => {
          const distA = Math.sqrt(
            Math.pow(a.latitude - latitude, 2) + Math.pow(a.longitude - longitude, 2)
          );
          const distB = Math.sqrt(
            Math.pow(b.latitude - latitude, 2) + Math.pow(b.longitude - longitude, 2)
          );
          return distA - distB;
        });
        setCrossfitBoxes(sorted);
      }
    } catch (error) {
      console.error('근처 크로스핏박스 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyCrossfitBoxes = async () => {
    try {
      const response = await axiosInstance.get('/member-crossfit-box');
      if (response.data?.data) {
        const ids = new Set<number>(response.data.data.map((c: any) => c.crossfitBoxId));
        setMyCrossfitBoxIds(ids);
      }
    } catch (error) {
      console.error('내 크로스핏박스 목록 조회 실패:', error);
    }
  };

  const handleAddToMyCrossfitBoxes = async (crossfitBoxId: number) => {
    try {
      setAddingCrossfitBoxId(crossfitBoxId);
      await axiosInstance.post('/member-crossfit-box', { crossfitBoxId, isFavorite: false });
      setMyCrossfitBoxIds((prev) => new Set(prev).add(crossfitBoxId));
      crossfitBoxEvents.emit();
      Alert.alert('성공', '내 크로스핏박스에 추가되었습니다.');
    } catch (error: any) {
      const message = error.response?.data?.message || '추가에 실패했습니다.';
      Alert.alert('오류', message);
    } finally {
      setAddingCrossfitBoxId(null);
    }
  };

  const handleRemoveFromMyCrossfitBoxes = async (crossfitBoxId: number) => {
    try {
      setAddingCrossfitBoxId(crossfitBoxId);
      await axiosInstance.delete(`/member-crossfit-box/${crossfitBoxId}`);
      setMyCrossfitBoxIds((prev) => {
        const next = new Set(prev);
        next.delete(crossfitBoxId);
        return next;
      });
      crossfitBoxEvents.emit();
      Alert.alert('성공', '내 크로스핏박스에서 제거되었습니다.');
    } catch (error: any) {
      const message = error.response?.data?.message || '제거에 실패했습니다.';
      Alert.alert('오류', message);
    } finally {
      setAddingCrossfitBoxId(null);
    }
  };

  const handleCrossfitBoxPress = (crossfitBoxId: number) => {
    router.push(`/crossfit-box/${crossfitBoxId}` as any);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#588157" />
          <Text style={styles.loadingText}>근처 크로스핏박스를 찾는 중...</Text>
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
          <Text style={styles.headerTitle}>근처 크로스핏박스</Text>
          {address && <Text style={styles.headerSubtitle}>{address}</Text>}
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {crossfitBoxes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="fitness-outline" size={64} color="#A3B18A" />
            <Text style={styles.emptyText}>근처에 크로스핏박스가 없습니다</Text>
          </View>
        ) : (
          <>
            <Text style={styles.resultCount}>{crossfitBoxes.length}개의 크로스핏박스</Text>
            {crossfitBoxes.map((crossfitBox) => {
              const isMyCrossfitBox = myCrossfitBoxIds.has(crossfitBox.id);
              const isProcessing = addingCrossfitBoxId === crossfitBox.id;

              return (
                <TouchableOpacity
                  key={crossfitBox.id}
                  style={styles.crossfitBoxCard}
                  onPress={() => handleCrossfitBoxPress(crossfitBox.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.crossfitBoxInfo}>
                    <Text style={styles.crossfitBoxName}>{crossfitBox.name}</Text>
                    {crossfitBox.location && <Text style={styles.crossfitBoxLocation}>{crossfitBox.location}</Text>}
                    {crossfitBox.phoneNumber && <Text style={styles.crossfitBoxPhone}>{crossfitBox.phoneNumber}</Text>}
                  </View>
                  <TouchableOpacity
                    style={[styles.addButton, isMyCrossfitBox && styles.addButtonActive]}
                    onPress={() =>
                      isMyCrossfitBox ? handleRemoveFromMyCrossfitBoxes(crossfitBox.id) : handleAddToMyCrossfitBoxes(crossfitBox.id)
                    }
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <ActivityIndicator size="small" color={isMyCrossfitBox ? '#588157' : '#fff'} />
                    ) : (
                      <>
                        <Ionicons
                          name={isMyCrossfitBox ? 'checkmark' : 'add'}
                          size={18}
                          color={isMyCrossfitBox ? '#588157' : '#fff'}
                        />
                        <Text style={[styles.addButtonText, isMyCrossfitBox && styles.addButtonTextActive]}>
                          {isMyCrossfitBox ? '추가됨' : '추가'}
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
  crossfitBoxCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  crossfitBoxInfo: {
    flex: 1,
  },
  crossfitBoxName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#344E41',
  },
  crossfitBoxLocation: {
    fontSize: 14,
    color: '#588157',
    marginTop: 4,
  },
  crossfitBoxPhone: {
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
