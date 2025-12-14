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

interface MyGym {
  gymId: number;
  name: string;
  location: string;
  isFavorite: boolean;
}

export default function MyGymsScreen() {
  const router = useRouter();
  const [gyms, setGyms] = useState<MyGym[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const fetchMyGyms = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/api/member-gym');
      if (response.data?.data) {
        setGyms(response.data.data);
      }
    } catch (error) {
      console.error('내 체육관 목록 조회 실패:', error);
      Alert.alert('오류', '목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMyGyms();
  }, [fetchMyGyms]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMyGyms();
  };

  const handleToggleFavorite = async (gymId: number) => {
    try {
      setTogglingId(gymId);
      const response = await axiosInstance.patch(`/api/member-gym/${gymId}/favorite`);
      if (response.data?.data) {
        setGyms((prev) =>
          prev.map((g) =>
            g.gymId === gymId ? { ...g, isFavorite: response.data.data.isFavorite } : g
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

  const handleRemoveGym = async (gymId: number, gymName: string) => {
    Alert.alert(
      '내 체육관에서 제거',
      `"${gymName}"을(를) 내 체육관에서 제거하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '제거',
          style: 'destructive',
          onPress: async () => {
            try {
              await axiosInstance.delete(`/api/member-gym/${gymId}`);
              setGyms((prev) => prev.filter((g) => g.gymId !== gymId));
            } catch (error: any) {
              const message = error.response?.data?.message || '제거에 실패했습니다.';
              Alert.alert('오류', message);
            }
          },
        },
      ]
    );
  };

  const renderGymItem = ({ item }: { item: MyGym }) => {
    const isToggling = togglingId === item.gymId;

    return (
      <View style={styles.gymItem}>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => handleToggleFavorite(item.gymId)}
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

        <View style={styles.gymInfo}>
          <Text style={styles.gymName}>{item.name}</Text>
          <Text style={styles.gymLocation}>{item.location}</Text>
        </View>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveGym(item.gymId, item.name)}
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
          <Text style={styles.headerTitle}>내 체육관</Text>
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
        <Text style={styles.headerTitle}>내 체육관</Text>
        <View style={styles.headerSpacer} />
      </View>

      {gyms.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="fitness-outline" size={64} color="#A3B18A" />
          <Text style={styles.emptyText}>등록된 체육관이 없습니다</Text>
          <Text style={styles.emptySubtext}>지도에서 체육관을 추가해보세요</Text>
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
          data={gyms}
          keyExtractor={(item) => item.gymId.toString()}
          renderItem={renderGymItem}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListHeaderComponent={
            <Text style={styles.listHeader}>
              총 {gyms.length}개의 체육관
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
  gymItem: {
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
  gymInfo: {
    flex: 1,
    marginLeft: 8,
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
