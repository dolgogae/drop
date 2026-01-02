import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axiosInstance from '../../utils/axiosInstance';

interface MyCrossfitBox {
  crossfitBoxId: number;
  name: string;
  location: string;
  isFavorite: boolean;
}

export default function MyCrossfitBoxesScreen() {
  const router = useRouter();
  const [crossfitBoxes, setCrossfitBoxes] = useState<MyCrossfitBox[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const fetchMyCrossfitBoxes = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/member-crossfit-box');
      if (response.data?.data) {
        setCrossfitBoxes(response.data.data);
      }
    } catch (error) {
      console.error('내 크로스핏박스 목록 조회 실패:', error);
      Alert.alert('오류', '목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMyCrossfitBoxes();
  }, [fetchMyCrossfitBoxes]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMyCrossfitBoxes();
  };

  const handleToggleFavorite = async (crossfitBoxId: number) => {
    try {
      setTogglingId(crossfitBoxId);
      const response = await axiosInstance.patch(`/api/member-crossfit-box/${crossfitBoxId}/favorite`);
      if (response.data?.data) {
        setCrossfitBoxes((prev) =>
          prev.map((c) =>
            c.crossfitBoxId === crossfitBoxId ? { ...c, isFavorite: response.data.data.isFavorite } : c
          )
        );
      }
    } catch (error: any) {
      const message = error.response?.data?.message || '즐겨찾기 변경에 실패했습니다.';
      Alert.alert('오류', message);
    } finally {
      setTogglingId(null);
    }
  };

  const handleRemoveCrossfitBox = async (crossfitBoxId: number, crossfitBoxName: string) => {
    Alert.alert(
      '내 크로스핏박스에서 제거',
      `"${crossfitBoxName}"을(를) 내 크로스핏박스에서 제거하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '제거',
          style: 'destructive',
          onPress: async () => {
            try {
              await axiosInstance.delete(`/api/member-crossfit-box/${crossfitBoxId}`);
              setCrossfitBoxes((prev) => prev.filter((c) => c.crossfitBoxId !== crossfitBoxId));
            } catch (error: any) {
              const message = error.response?.data?.message || '제거에 실패했습니다.';
              Alert.alert('오류', message);
            }
          },
        },
      ]
    );
  };

  const renderCrossfitBoxItem = ({ item }: { item: MyCrossfitBox }) => {
    const isToggling = togglingId === item.crossfitBoxId;

    return (
      <View style={styles.crossfitBoxItem}>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => handleToggleFavorite(item.crossfitBoxId)}
          disabled={isToggling}
        >
          {isToggling ? (
            <ActivityIndicator size="small" color="#FFD700" />
          ) : (
            <Ionicons
              name={item.isFavorite ? 'star' : 'star-outline'}
              size={24}
              color={item.isFavorite ? '#FFD700' : '#ccc'}
            />
          )}
        </TouchableOpacity>

        <View style={styles.crossfitBoxInfo}>
          <Text style={styles.crossfitBoxName}>{item.name}</Text>
          <Text style={styles.crossfitBoxLocation}>{item.location}</Text>
        </View>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveCrossfitBox(item.crossfitBoxId, item.name)}
        >
          <Ionicons name="trash-outline" size={20} color="#e63946" />
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#344E41" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>내 크로스핏박스</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#588157" />
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
        <Text style={styles.headerTitle}>내 크로스핏박스</Text>
        <View style={styles.headerSpacer} />
      </View>

      {crossfitBoxes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="fitness-outline" size={64} color="#A3B18A" />
          <Text style={styles.emptyText}>등록된 크로스핏박스가 없습니다</Text>
          <Text style={styles.emptySubtext}>지도에서 크로스핏박스를 추가해보세요</Text>
          <TouchableOpacity
            style={styles.goToMapButton}
            onPress={() => router.push('/(tabs)/map')}
          >
            <Ionicons name="map-outline" size={18} color="#fff" />
            <Text style={styles.goToMapButtonText}>지도로 이동</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={crossfitBoxes}
          keyExtractor={(item) => item.crossfitBoxId.toString()}
          renderItem={renderCrossfitBoxItem}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListHeaderComponent={
            <Text style={styles.listHeader}>
              총 {crossfitBoxes.length}개의 크로스핏박스
            </Text>
          }
        />
      )}
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
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#344E41',
  },
  headerSpacer: {
    width: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  listHeader: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  crossfitBoxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  favoriteButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  crossfitBoxInfo: {
    flex: 1,
    marginLeft: 8,
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
  },
  removeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#344E41',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    marginBottom: 24,
  },
  goToMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#588157',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  goToMapButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
