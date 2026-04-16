import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axiosInstance from '../../utils/axiosInstance';
import { crossfitBoxEvents } from '../../utils/crossfitBoxEvents';

let MapView: any = null;
let Marker: any = null;
let Circle: any = null;
if (Platform.OS !== 'web') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  Circle = Maps.Circle;
}

type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

interface CrossfitBox {
  id: number;
  name: string;
  location: string;
  phoneNumber: string;
  latitude: number;
  longitude: number;
  isMyCrossfitBox?: boolean;
}

interface Cluster {
  id: string;
  latitude: number;
  longitude: number;
  crossfitBoxes: CrossfitBox[];
  count: number;
}

const { width, height } = Dimensions.get('window');
const CLUSTER_DISTANCE = 0.01;

const DEBOUNCE_DELAY = 300;
const REGION_CHANGE_EPSILON = 0.0005;
const METERS_PER_LATITUDE_DEGREE = 111320;

const isSameRegion = (a: Region | null, b: Region) => {
  if (!a) {
    return false;
  }

  return (
    Math.abs(a.latitude - b.latitude) < REGION_CHANGE_EPSILON &&
    Math.abs(a.longitude - b.longitude) < REGION_CHANGE_EPSILON &&
    Math.abs(a.latitudeDelta - b.latitudeDelta) < REGION_CHANGE_EPSILON &&
    Math.abs(a.longitudeDelta - b.longitudeDelta) < REGION_CHANGE_EPSILON
  );
};

const getCircleStyle = (count: number) => {
  if (count >= 10) {
    return {
      pixelRadius: 18,
      fillColor: 'rgba(88, 129, 87, 0.48)',
      strokeColor: 'rgba(52, 78, 65, 1)',
      strokeWidth: 2.5,
    };
  }

  if (count >= 4) {
    return {
      pixelRadius: 14,
      fillColor: 'rgba(88, 129, 87, 0.42)',
      strokeColor: 'rgba(52, 78, 65, 0.98)',
      strokeWidth: 2.5,
    };
  }

  return {
    pixelRadius: count > 1 ? 11 : 7,
    fillColor: count > 1 ? 'rgba(88, 129, 87, 0.34)' : 'rgba(88, 129, 87, 0.72)',
    strokeColor: count > 1 ? 'rgba(52, 78, 65, 0.96)' : 'rgba(52, 78, 65, 1)',
    strokeWidth: count > 1 ? 2.25 : 2,
  };
};

export default function MapScreen() {
  const router = useRouter();
  const { lat, lng, t } = useLocalSearchParams<{ lat?: string; lng?: string; t?: string }>();
  const mapRef = useRef<typeof MapView>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const regionRef = useRef<Region | null>(null);
  const skipNextRegionChangeRef = useRef(false);
  const lastBoundsRequestRef = useRef<string | null>(null);
  const [crossfitBoxes, setCrossfitBoxes] = useState<CrossfitBox[]>([]);
  const [myCrossfitBoxIds, setMyCrossfitBoxIds] = useState<Set<number>>(new Set());
  const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [addingCrossfitBoxId, setAddingCrossfitBoxId] = useState<number | null>(null);

  const initialLat = lat ? parseFloat(lat) : 37.5665;
  const initialLng = lng ? parseFloat(lng) : 126.978;

  const [region, setRegion] = useState<Region>({
    latitude: initialLat,
    longitude: initialLng,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  useEffect(() => {
    regionRef.current = region;
  }, [region]);

  const fetchMyCrossfitBoxes = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/member-crossfit-box');
      if (response.data?.data) {
        const ids = new Set<number>(response.data.data.map((c: any) => c.crossfitBoxId));
        setMyCrossfitBoxIds(ids);
      }
    } catch (error) {
      console.error('내 크로스핏박스 목록 조회 실패:', error);
    }
  }, []);

  const fetchCrossfitBoxesByBounds = useCallback(async (currentRegion: Region, isInitial = false) => {
    try {
      if (isInitial) {
        setIsInitialLoad(true);
      }

      const swLat = currentRegion.latitude - currentRegion.latitudeDelta / 2;
      const swLng = currentRegion.longitude - currentRegion.longitudeDelta / 2;
      const neLat = currentRegion.latitude + currentRegion.latitudeDelta / 2;
      const neLng = currentRegion.longitude + currentRegion.longitudeDelta / 2;
      const requestKey = [swLat, swLng, neLat, neLng].map((value) => value.toFixed(6)).join(':');

      if (lastBoundsRequestRef.current === requestKey) {
        return;
      }

      lastBoundsRequestRef.current = requestKey;

      const response = await axiosInstance.get('/crossfit-boxes/map/bounds', {
        params: { swLat, swLng, neLat, neLng },
      });
      if (response.data?.data) {
        setCrossfitBoxes(response.data.data);
      }
    } catch (error) {
      console.error('크로스핏박스 목록 조회 실패:', error);
    } finally {
      if (isInitial) {
        setIsInitialLoad(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const moveToCurrentLocation = async () => {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            const fallbackRegion = regionRef.current;
            if (fallbackRegion && isActive) {
              fetchCrossfitBoxesByBounds(fallbackRegion, true);
            }
            return;
          }

          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });

          const newRegion = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          };

          if (!isActive) {
            return;
          }

          setRegion(newRegion);
          regionRef.current = newRegion;
          skipNextRegionChangeRef.current = true;
          mapRef.current?.animateToRegion(newRegion, 300);
          fetchCrossfitBoxesByBounds(newRegion, true);
        } catch (error) {
          console.error('현재 위치 조회 실패:', error);
          const fallbackRegion = regionRef.current;
          if (fallbackRegion && isActive) {
            fetchCrossfitBoxesByBounds(fallbackRegion, true);
          }
        }
      };

      moveToCurrentLocation();
      fetchMyCrossfitBoxes();

      return () => {
        isActive = false;
      };
    }, [fetchCrossfitBoxesByBounds, fetchMyCrossfitBoxes])
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

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
      regionRef.current = newRegion;
      skipNextRegionChangeRef.current = true;
      mapRef.current?.animateToRegion(newRegion, 300);
      fetchCrossfitBoxesByBounds(newRegion, true);
    }
  }, [lat, lng, t, fetchCrossfitBoxesByBounds]);

  useEffect(() => {
    const unsubscribe = crossfitBoxEvents.subscribe(() => {
      fetchMyCrossfitBoxes();
    });
    return unsubscribe;
  }, [fetchMyCrossfitBoxes]);

  const clusters = useMemo(() => {
    if (crossfitBoxes.length === 0) return [];

    const clusterDistance = CLUSTER_DISTANCE * (region.latitudeDelta / 0.1);
    const clustered: Cluster[] = [];
    const used = new Set<number>();

    crossfitBoxes.forEach((crossfitBox, index) => {
      if (used.has(index)) return;

      const cluster: Cluster = {
        id: `cluster-${crossfitBox.id}`,
        latitude: crossfitBox.latitude,
        longitude: crossfitBox.longitude,
        crossfitBoxes: [crossfitBox],
        count: 1,
      };

      crossfitBoxes.forEach((otherCrossfitBox, otherIndex) => {
        if (index === otherIndex || used.has(otherIndex)) return;

        const distance = Math.sqrt(
          Math.pow(crossfitBox.latitude - otherCrossfitBox.latitude, 2) +
            Math.pow(crossfitBox.longitude - otherCrossfitBox.longitude, 2)
        );

        if (distance < clusterDistance) {
          cluster.crossfitBoxes.push(otherCrossfitBox);
          cluster.count++;
          used.add(otherIndex);
        }
      });

      if (cluster.count > 1) {
        cluster.latitude =
          cluster.crossfitBoxes.reduce((sum, c) => sum + c.latitude, 0) / cluster.count;
        cluster.longitude =
          cluster.crossfitBoxes.reduce((sum, c) => sum + c.longitude, 0) / cluster.count;
      }

      used.add(index);
      clustered.push(cluster);
    });

    return clustered;
  }, [crossfitBoxes, region.latitudeDelta]);

  const metersPerPixel = useMemo(() => {
    const visibleHeightMeters = region.latitudeDelta * METERS_PER_LATITUDE_DEGREE;
    return Math.max(visibleHeightMeters / height, 1);
  }, [region.latitudeDelta]);

  const handleAddToMyCrossfitBoxes = async (crossfitBoxId: number) => {
    try {
      setAddingCrossfitBoxId(crossfitBoxId);
      await axiosInstance.post('/member-crossfit-box', { crossfitBoxId, isFavorite: false });
      setMyCrossfitBoxIds((prev) => new Set(prev).add(crossfitBoxId));
      crossfitBoxEvents.emit();
      Alert.alert('성공', '내 박스에 추가되었습니다.');
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
      Alert.alert('성공', '내 박스에서 제거되었습니다.');
    } catch (error: any) {
      const message = error.response?.data?.message || '제거에 실패했습니다.';
      Alert.alert('오류', message);
    } finally {
      setAddingCrossfitBoxId(null);
    }
  };

  const handleClusterPress = (cluster: Cluster) => {
    setSelectedCluster(cluster);
  };

  const handleRegionChangeComplete = useCallback((newRegion: Region) => {
    const previousRegion = regionRef.current;

    if (skipNextRegionChangeRef.current) {
      skipNextRegionChangeRef.current = false;
      if (!isSameRegion(previousRegion, newRegion)) {
        setRegion(newRegion);
        regionRef.current = newRegion;
      }
      return;
    }

    if (isSameRegion(previousRegion, newRegion)) {
      return;
    }

    setRegion(newRegion);
    regionRef.current = newRegion;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchCrossfitBoxesByBounds(newRegion);
    }, DEBOUNCE_DELAY);
  }, [fetchCrossfitBoxesByBounds]);

  const closeBottomSheet = () => {
    setSelectedCluster(null);
  };

  const handleCrossfitBoxPress = (crossfitBoxId: number) => {
    router.push(`/crossfit-box/${crossfitBoxId}` as any);
  };

  const renderCrossfitBoxItem = ({ item }: { item: CrossfitBox }) => {
    const isMyCrossfitBox = myCrossfitBoxIds.has(item.id);
    const isProcessing = addingCrossfitBoxId === item.id;

    return (
      <TouchableOpacity style={styles.crossfitBoxItem} onPress={() => handleCrossfitBoxPress(item.id)} activeOpacity={0.7}>
        <View style={styles.crossfitBoxInfo}>
          <Text style={styles.crossfitBoxName}>{item.name}</Text>
          <Text style={styles.crossfitBoxLocation}>{item.location}</Text>
          {item.phoneNumber && (
            <Text style={styles.crossfitBoxPhone}>{item.phoneNumber}</Text>
          )}
        </View>
        <TouchableOpacity
          style={[
            styles.addButton,
            isMyCrossfitBox && styles.addButtonActive,
          ]}
          onPress={() =>
            isMyCrossfitBox ? handleRemoveFromMyCrossfitBoxes(item.id) : handleAddToMyCrossfitBoxes(item.id)
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
  };

  if (Platform.OS === 'web') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.webContainer}>
          <Text style={styles.webTitle}>지도</Text>
          <Text style={styles.webSubtitle}>
            지도 기능은 모바일 앱에서 이용 가능합니다.
          </Text>
          <View style={styles.webCrossfitBoxList}>
            <Text style={styles.webListTitle}>등록된 박스 목록</Text>
            {isInitialLoad ? (
              <ActivityIndicator size="large" color="#588157" />
            ) : (
              <FlatList
                data={crossfitBoxes}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderCrossfitBoxItem}
                style={styles.crossfitBoxList}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>등록된 박스가 없습니다.</Text>
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
            (() => {
              const circleStyle = getCircleStyle(cluster.count);
              const radius = Math.min(
                Math.max(circleStyle.pixelRadius * metersPerPixel, 12),
                250
              );

              return (
                <React.Fragment
                  key={cluster.id}
                >
                  {Circle && (
                    <Circle
                      center={{
                        latitude: cluster.latitude,
                        longitude: cluster.longitude,
                      }}
                      radius={radius}
                      fillColor={circleStyle.fillColor}
                      strokeColor={circleStyle.strokeColor}
                      strokeWidth={circleStyle.strokeWidth}
                      tappable
                      onPress={() => handleClusterPress(cluster)}
                    />
                  )}
                  {Marker && (
                    <Marker
                      coordinate={{
                        latitude: cluster.latitude,
                        longitude: cluster.longitude,
                      }}
                      anchor={{ x: 0.5, y: 0.5 }}
                      tracksViewChanges={false}
                      onPress={() => handleClusterPress(cluster)}
                    >
                      <View style={styles.touchTarget} />
                    </Marker>
                  )}
                </React.Fragment>
              );
            })()
          ))}
        </MapView>
      )}

      {selectedCluster && (
        <View style={styles.bottomSheet}>
          <View style={styles.bottomSheetHeader}>
            <Text style={styles.bottomSheetTitle}>
              {selectedCluster.count === 1
                ? selectedCluster.crossfitBoxes[0].name
                : `주변 박스 ${selectedCluster.count}개`}
            </Text>
            <TouchableOpacity onPress={closeBottomSheet}>
              <Text style={styles.closeButton}>닫기</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={selectedCluster.crossfitBoxes}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderCrossfitBoxItem}
            style={styles.crossfitBoxList}
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
  touchTarget: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.01)',
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
  crossfitBoxList: {
    paddingHorizontal: 16,
  },
  crossfitBoxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  crossfitBoxInfo: {
    flex: 1,
  },
  crossfitBoxName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#344E41',
    marginBottom: 4,
  },
  crossfitBoxLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  crossfitBoxPhone: {
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
  webCrossfitBoxList: {
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
