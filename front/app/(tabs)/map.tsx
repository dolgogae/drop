import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import axiosInstance from '../../utils/axiosInstance';
import { gymEvents } from '../../utils/gymEvents';

let MapView: any = null;
let Marker: any = null;
if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
}

type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

interface Gym {
  id: number;
  name: string;
  location: string;
  phoneNumber: string;
  latitude: number;
  longitude: number;
  isMyGym?: boolean;
}

interface Cluster {
  id: string;
  latitude: number;
  longitude: number;
  gyms: Gym[];
  count: number;
}

const { width, height } = Dimensions.get('window');
const CLUSTER_DISTANCE = 0.01; // 클러스터링 거리 (약 1km)

const DEBOUNCE_DELAY = 300; // 디바운스 딜레이 (ms)

export default function MapScreen() {
  const router = useRouter();
  const { lat, lng, t } = useLocalSearchParams<{ lat?: string; lng?: string; t?: string }>();
  const mapRef = useRef<typeof MapView>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [myGymIds, setMyGymIds] = useState<Set<number>>(new Set());
  const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [addingGymId, setAddingGymId] = useState<number | null>(null);

  // 파라미터로 전달된 위치가 있으면 사용, 없으면 서울 기본값
  const initialLat = lat ? parseFloat(lat) : 37.5665;
  const initialLng = lng ? parseFloat(lng) : 126.978;

  const [region, setRegion] = useState<Region>({
    latitude: initialLat,
    longitude: initialLng,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  useEffect(() => {
    fetchGymsByBounds(region, true);
    fetchMyGyms();

    // 컴포넌트 언마운트 시 타이머 정리
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // 파라미터로 위치가 전달되면 해당 위치로 이동
  useEffect(() => {
    if (lat && lng) {
      const newLat = parseFloat(lat);
      const newLng = parseFloat(lng);
      const newRegion = {
        latitude: newLat,
        longitude: newLng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 300);
      fetchGymsByBounds(newRegion, true);
    }
  }, [lat, lng, t]);

  // 체육관 변경 이벤트 구독 (홈에서 제거 시 동기화)
  useEffect(() => {
    const unsubscribe = gymEvents.subscribe(() => {
      fetchMyGyms();
    });
    return unsubscribe;
  }, []);

  // 클러스터링을 useMemo로 최적화
  const clusters = useMemo(() => {
    if (gyms.length === 0) return [];

    const clusterDistance = CLUSTER_DISTANCE * (region.latitudeDelta / 0.1);
    const clustered: Cluster[] = [];
    const used = new Set<number>();

    gyms.forEach((gym, index) => {
      if (used.has(index)) return;

      const cluster: Cluster = {
        id: `cluster-${gym.id}`,
        latitude: gym.latitude,
        longitude: gym.longitude,
        gyms: [gym],
        count: 1,
      };

      gyms.forEach((otherGym, otherIndex) => {
        if (index === otherIndex || used.has(otherIndex)) return;

        const distance = Math.sqrt(
          Math.pow(gym.latitude - otherGym.latitude, 2) +
            Math.pow(gym.longitude - otherGym.longitude, 2)
        );

        if (distance < clusterDistance) {
          cluster.gyms.push(otherGym);
          cluster.count++;
          used.add(otherIndex);
        }
      });

      // 클러스터 중심 재계산
      if (cluster.count > 1) {
        cluster.latitude =
          cluster.gyms.reduce((sum, g) => sum + g.latitude, 0) / cluster.count;
        cluster.longitude =
          cluster.gyms.reduce((sum, g) => sum + g.longitude, 0) / cluster.count;
      }

      used.add(index);
      clustered.push(cluster);
    });

    return clustered;
  }, [gyms, region.latitudeDelta]);

  const fetchGymsByBounds = useCallback(async (currentRegion: Region, isInitial = false) => {
    try {
      // 초기 로딩일 때만 로딩 인디케이터 표시
      if (isInitial) {
        setIsInitialLoad(true);
      }

      // region에서 bounds 계산
      const swLat = currentRegion.latitude - currentRegion.latitudeDelta / 2;
      const swLng = currentRegion.longitude - currentRegion.longitudeDelta / 2;
      const neLat = currentRegion.latitude + currentRegion.latitudeDelta / 2;
      const neLng = currentRegion.longitude + currentRegion.longitudeDelta / 2;

      const response = await axiosInstance.get('/gyms/map/bounds', {
        params: { swLat, swLng, neLat, neLng },
      });
      if (response.data?.data) {
        setGyms(response.data.data);
      }
    } catch (error) {
      console.error('체육관 목록 조회 실패:', error);
    } finally {
      if (isInitial) {
        setIsInitialLoad(false);
      }
    }
  }, []);

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

  const handleClusterPress = (cluster: Cluster) => {
    // 마커 클릭 시 바로 체육관 정보 표시
    setSelectedCluster(cluster);
  };

  const handleRegionChangeComplete = useCallback((newRegion: Region) => {
    setRegion(newRegion);

    // 기존 타이머 취소
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // 디바운스 적용: 지도 이동이 멈춘 후 일정 시간 후에 API 호출
    debounceRef.current = setTimeout(() => {
      fetchGymsByBounds(newRegion);
    }, DEBOUNCE_DELAY);
  }, [fetchGymsByBounds]);

  const closeBottomSheet = () => {
    setSelectedCluster(null);
  };

  const handleGymPress = (gymId: number) => {
    router.push(`/gym/${gymId}` as any);
  };

  const renderGymItem = ({ item }: { item: Gym }) => {
    const isMyGym = myGymIds.has(item.id);
    const isProcessing = addingGymId === item.id;

    return (
      <TouchableOpacity style={styles.gymItem} onPress={() => handleGymPress(item.id)} activeOpacity={0.7}>
        <View style={styles.gymInfo}>
          <Text style={styles.gymName}>{item.name}</Text>
          <Text style={styles.gymLocation}>{item.location}</Text>
          {item.phoneNumber && (
            <Text style={styles.gymPhone}>{item.phoneNumber}</Text>
          )}
        </View>
        <TouchableOpacity
          style={[
            styles.addButton,
            isMyGym && styles.addButtonActive,
          ]}
          onPress={() =>
            isMyGym ? handleRemoveFromMyGyms(item.id) : handleAddToMyGyms(item.id)
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
  };

  // 웹에서는 대체 UI 표시
  if (Platform.OS === 'web') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.webContainer}>
          <Text style={styles.webTitle}>지도</Text>
          <Text style={styles.webSubtitle}>
            지도 기능은 모바일 앱에서 이용 가능합니다.
          </Text>
          <View style={styles.webGymList}>
            <Text style={styles.webListTitle}>등록된 체육관 목록</Text>
            {isInitialLoad ? (
              <ActivityIndicator size="large" color="#588157" />
            ) : (
              <FlatList
                data={gyms}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderGymItem}
                style={styles.gymList}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>등록된 체육관이 없습니다.</Text>
                }
              />
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (isInitialLoad) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#588157" />
        <Text style={styles.loadingText}>지도를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {MapView && (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={region}
          onRegionChangeComplete={handleRegionChangeComplete}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {clusters.map((cluster) => (
            <Marker
              key={cluster.id}
              coordinate={{
                latitude: cluster.latitude,
                longitude: cluster.longitude,
              }}
              onPress={() => handleClusterPress(cluster)}
            >
              <View
                style={[
                  styles.clusterMarker,
                  cluster.count > 1 && styles.clusterMarkerMultiple,
                ]}
              >
                {cluster.count > 1 ? (
                  <Text style={styles.clusterCount}>{cluster.count}</Text>
                ) : (
                  <View style={styles.singleMarker} />
                )}
              </View>
            </Marker>
          ))}
        </MapView>
      )}

      {/* 하단 리스트 */}
      {selectedCluster && (
        <View style={styles.bottomSheet}>
          <View style={styles.bottomSheetHeader}>
            <Text style={styles.bottomSheetTitle}>
              {selectedCluster.count === 1
                ? selectedCluster.gyms[0].name
                : `주변 체육관 ${selectedCluster.count}개`}
            </Text>
            <TouchableOpacity onPress={closeBottomSheet}>
              <Text style={styles.closeButton}>닫기</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={selectedCluster.gyms}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderGymItem}
            style={styles.gymList}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    color: '#588157',
    fontSize: 14,
  },
  map: {
    width: width,
    height: height,
  },
  clusterMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#588157',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  clusterMarkerMultiple: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#344E41',
  },
  clusterCount: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  singleMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#344E41',
  },
  closeButton: {
    fontSize: 14,
    color: '#588157',
  },
  gymList: {
    paddingHorizontal: 16,
  },
  gymItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  gymInfo: {
    flex: 1,
  },
  gymName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#344E41',
    marginBottom: 4,
  },
  gymLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  gymPhone: {
    fontSize: 12,
    color: '#A3B18A',
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
  webContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  webTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#344E41',
    textAlign: 'center',
    marginTop: 40,
  },
  webSubtitle: {
    fontSize: 14,
    color: '#A3B18A',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  webGymList: {
    flex: 1,
  },
  webListTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#344E41',
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#A3B18A',
    marginTop: 20,
  },
});
