import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import axiosInstance from '../utils/axiosInstance';

interface MyReviewItem {
  reviewId: number;
  rating: number;
  content: string;
  crossfitBoxId: number;
  crossfitBoxName: string;
  createdAt: string;
  updatedAt: string;
}

const PAGE_SIZE = 10;

export default function MyReviewsScreen() {
  const router = useRouter();
  const [reviews, setReviews] = useState<MyReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const currentPage = useRef(0);

  const fetchMyReviews = useCallback(async (page: number = 0) => {
    try {
      if (page === 0) setLoading(true);
      else setLoadingMore(true);

      const response = await axiosInstance.get(`/mypage/reviews?page=${page}&size=${PAGE_SIZE}`);
      const data = response.data.data;

      setHasNext(data.hasNext);
      currentPage.current = data.currentPage;

      if (page === 0) {
        setReviews(data.reviews);
      } else {
        setReviews((prev) => [...prev, ...data.reviews]);
      }
    } catch (err) {
      console.error('내 리뷰 조회 실패:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      currentPage.current = 0;
      fetchMyReviews(0);
    }, [fetchMyReviews])
  );

  const loadMore = () => {
    if (!loadingMore && hasNext) {
      fetchMyReviews(currentPage.current + 1);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`;
  };

  const renderReview = ({ item }: { item: MyReviewItem }) => (
    <TouchableOpacity
      style={styles.reviewCard}
      onPress={() => router.push({ pathname: '/crossfit-box/reviews', params: { id: String(item.crossfitBoxId) } } as any)}
      activeOpacity={0.7}
    >
      <View style={styles.reviewHeader}>
        <Text style={styles.boxName} numberOfLines={1}>{item.crossfitBoxName}</Text>
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={13} color="#FFB800" />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
      </View>
      {item.content ? (
        <Text style={styles.reviewContent} numberOfLines={2}>{item.content}</Text>
      ) : null}
      <Text style={styles.reviewDate}>{formatDate(item.createdAt)}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#344E41" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>내 리뷰</Text>
        <View style={styles.headerRight} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#588157" />
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.reviewId.toString()}
          renderItem={renderReview}
          contentContainerStyle={styles.listContent}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#588157" />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubble-outline" size={48} color="#A3B18A" />
              <Text style={styles.emptyText}>작성한 리뷰가 없습니다</Text>
            </View>
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
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  boxName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#344E41',
    flex: 1,
    marginRight: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#344E41',
  },
  reviewContent: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginTop: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: '#A3B18A',
    marginTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 15,
    color: '#A3B18A',
    marginTop: 12,
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});
