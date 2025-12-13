import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import axiosInstance from '../../utils/axiosInstance';

// 네이티브에서만 MapView 임포트
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

export default function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState<Region>({
    latitude: 37.5665,
    longitude: 126.978,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  useEffect(() => {
    fetchGyms();
  }, []);

  useEffect(() => {
    if (gyms.length > 0) {
      clusterGyms(gyms, region);
    }
  }, [gyms, region]);

  const fetchGyms = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/gyms/map');
      if (response.data?.data) {
        setGyms(response.data.data);
      }
    } catch (error) {
      console.error('체육관 목록 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const clusterGyms = (gymList: Gym[], currentRegion: Region) => {
    const clusterDistance = CLUSTER_DISTANCE * (currentRegion.latitudeDelta / 0.1);
    const clustered: Cluster[] = [];
    const used = new Set<number>();

    gymList.forEach((gym, index) => {
      if (used.has(index)) return;

      const cluster: Cluster = {
        id: `cluster-${index}`,
        latitude: gym.latitude,
        longitude: gym.longitude,
        gyms: [gym],
        count: 1,
      };

      gymList.forEach((otherGym, otherIndex) => {
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

    setClusters(clustered);
  };

  const handleClusterPress = (cluster: Cluster) => {
    if (cluster.count === 1) {
      // 단일 체육관인 경우 바로 선택
      setSelectedCluster(cluster);
    } else {
      // 여러 체육관인 경우 줌인하거나 리스트 표시
      if (region.latitudeDelta > 0.02) {
        // 줌 레벨이 낮으면 줌인
        mapRef.current?.animateToRegion({
          latitude: cluster.latitude,
          longitude: cluster.longitude,
          latitudeDelta: region.latitudeDelta / 2,
          longitudeDelta: region.longitudeDelta / 2,
        });
      } else {
        // 줌 레벨이 높으면 리스트 표시
        setSelectedCluster(cluster);
      }
    }
  };

  const handleRegionChangeComplete = (newRegion: Region) => {
    setRegion(newRegion);
  };

  const closeBottomSheet = () => {
    setSelectedCluster(null);
  };

  const renderGymItem = ({ item }: { item: Gym }) => (
    <TouchableOpacity style={styles.gymItem}>
      <Text style={styles.gymName}>{item.name}</Text>
      <Text style={styles.gymLocation}>{item.location}</Text>
      {item.phoneNumber && (
        <Text style={styles.gymPhone}>{item.phoneNumber}</Text>
      )}
    </TouchableOpacity>
  );

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
            {loading ? (
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

  if (loading) {
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
