import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
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
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import axiosInstance from '../../utils/axiosInstance';

interface ReviewItem {
  reviewId: number;
  memberId: number;
  memberUsername: string;
  memberProfileImage: string | null;
  rating: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const CONTENT_MAX_LINES = 3;
const PAGE_SIZE = 10;

export default function ReviewsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const profile = useSelector((state: RootState) => state.user.profile);

  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const currentPage = useRef(0);

  const fetchReviews = useCallback(async (page: number = 0) => {
    try {
      if (page === 0) setLoading(true);
      else setLoadingMore(true);

      const response = await axiosInstance.get(`/crossfit-boxes/${id}/reviews?page=${page}&size=${PAGE_SIZE}`);
      const data = response.data.data;

      setAverageRating(data.averageRating);
      setReviewCount(data.reviewCount);
      setHasNext(data.hasNext);
      currentPage.current = data.currentPage;

      if (page === 0) {
        setReviews(data.reviews);
      } else {
        setReviews((prev) => [...prev, ...data.reviews]);
      }
    } catch (err) {
      console.error('리뷰 조회 실패:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      if (id) {
        currentPage.current = 0;
        fetchReviews(0);
      }
    }, [id, fetchReviews])
  );

  const loadMore = () => {
    if (!loadingMore && hasNext) {
      fetchReviews(currentPage.current + 1);
    }
  };

  const toggleExpand = (reviewId: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(reviewId)) next.delete(reviewId);
      else next.add(reviewId);
      return next;
    });
  };

  const handleDelete = (reviewId: number) => {
    Alert.alert('리뷰 삭제', '정말 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await axiosInstance.delete(`/crossfit-boxes/${id}/reviews/${reviewId}`);
            currentPage.current = 0;
            fetchReviews(0);
          } catch (err) {
            console.error('리뷰 삭제 실패:', err);
            Alert.alert('오류', '리뷰 삭제에 실패했습니다.');
          }
        },
      },
    ]);
  };

  const handleEdit = (review: ReviewItem) => {
    router.push({
      pathname: '/crossfit-box/write-review',
      params: {
        id,
        reviewId: review.reviewId.toString(),
        rating: review.rating.toString(),
        content: review.content,
      },
    });
  };

  const handleWrite = () => {
    router.push({
      pathname: '/crossfit-box/write-review',
      params: { id },
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`;
  };

  const renderStars = (rating: number, size: number = 14) => (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={star <= rating ? 'star' : 'star-outline'}
          size={size}
          color="#FFB800"
          style={{ marginRight: 1 }}
        />
      ))}
    </View>
  );

  const renderReview = ({ item }: { item: ReviewItem }) => {
    const isOwner = profile?.id === item.memberId;
    const isExpanded = expandedIds.has(item.reviewId);

    return (
      <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <View style={styles.reviewAuthor}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={18} color="#A3B18A" />
            </View>
            <View>
              <Text style={styles.authorName}>{item.memberUsername || '익명'}</Text>
              <Text style={styles.reviewDate}>{formatDate(item.createdAt)}</Text>
            </View>
          </View>
          {renderStars(item.rating)}
        </View>
        {item.content ? (
          <>
            <Text
              style={styles.reviewContent}
              numberOfLines={isExpanded ? undefined : CONTENT_MAX_LINES}
            >
              {item.content}
            </Text>
            {item.content.length > 100 && (
              <TouchableOpacity onPress={() => toggleExpand(item.reviewId)}>
                <Text style={styles.moreText}>{isExpanded ? '접기' : '더보기'}</Text>
              </TouchableOpacity>
            )}
          </>
        ) : null}
        {isOwner && (
          <View style={styles.reviewActions}>
            <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionButton}>
              <Text style={styles.editText}>수정</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item.reviewId)} style={styles.actionButton}>
              <Text style={styles.deleteText}>삭제</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#344E41" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>리뷰</Text>
        <View style={styles.headerRight} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#588157" />
        </View>
      ) : (
        <>
          <View style={styles.summaryCard}>
            <Text style={styles.averageRating}>
              {averageRating?.toFixed(1) || '0.0'}
            </Text>
            {renderStars(Math.round(averageRating || 0), 20)}
            <Text style={styles.reviewCountText}>리뷰 {reviewCount || 0}개</Text>
          </View>

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
                <Text style={styles.emptyText}>아직 리뷰가 없습니다.</Text>
              </View>
            }
          />

          <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.writeButton} onPress={handleWrite}>
              <Ionicons name="create-outline" size={20} color="#fff" />
              <Text style={styles.writeButtonText}>리뷰 작성</Text>
            </TouchableOpacity>
          </View>
        </>
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
  summaryCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 8,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  averageRating: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#344E41',
    marginBottom: 8,
  },
  reviewCountText: {
    fontSize: 14,
    color: '#A3B18A',
    marginTop: 8,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 100,
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
    marginBottom: 10,
  },
  reviewAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f7f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#344E41',
  },
  reviewDate: {
    fontSize: 12,
    color: '#A3B18A',
    marginTop: 2,
  },
  reviewContent: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  moreText: {
    fontSize: 13,
    color: '#588157',
    fontWeight: '500',
    marginTop: 4,
  },
  reviewActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
  },
  actionButton: {
    marginLeft: 16,
  },
  editText: {
    fontSize: 13,
    color: '#588157',
    fontWeight: '500',
  },
  deleteText: {
    fontSize: 13,
    color: '#e74c3c',
    fontWeight: '500',
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
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  writeButton: {
    backgroundColor: '#588157',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  writeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
});
