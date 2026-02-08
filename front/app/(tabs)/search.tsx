import React, { useCallback, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import CrossfitBoxSearch, { CrossfitBoxResult } from '../../components/CrossfitBoxSearch';
import { getRecentSearchedBoxes, saveRecentSearchedBox, RecentBox } from '../../utils/recentStorage';

export default function SearchScreen() {
  const router = useRouter();
  const [recentSearches, setRecentSearches] = useState<RecentBox[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadRecentSearches();
    }, [])
  );

  const loadRecentSearches = async () => {
    const boxes = await getRecentSearchedBoxes();
    setRecentSearches(boxes);
  };

  const handleCrossfitBoxPress = async (crossfitBox: CrossfitBoxResult) => {
    await saveRecentSearchedBox(crossfitBox.id, crossfitBox.name);
    router.push(`/crossfit-box/${crossfitBox.id}`);
  };

  const handleKeywordChange = (keyword: string) => {
    setIsSearching(keyword.trim().length > 0);
  };

  const handleRecentBoxPress = (box: RecentBox) => {
    router.push(`/crossfit-box/${box.id}` as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>박스 검색</Text>
        </View>

        <View style={styles.content}>
          <CrossfitBoxSearch
            onSelect={handleCrossfitBoxPress}
            onKeywordChange={handleKeywordChange}
            placeholder="예: 크로스핏 XXX"
          />

          {!isSearching && recentSearches.length > 0 && (
            <View style={styles.recentSection}>
              <Text style={styles.recentTitle}>최근 검색한 박스</Text>
              {recentSearches.map((box) => (
                <TouchableOpacity
                  key={box.id}
                  style={styles.recentItem}
                  onPress={() => handleRecentBoxPress(box)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="time-outline" size={20} color="#A3B18A" />
                  <Text style={styles.recentItemText} numberOfLines={1}>{box.name}</Text>
                  <Ionicons name="chevron-forward" size={18} color="#A3B18A" />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#344E41',
  },
  content: {
    paddingHorizontal: 20,
  },
  recentSection: {
    marginTop: 24,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#344E41',
    marginBottom: 12,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 10,
  },
  recentItemText: {
    flex: 1,
    fontSize: 15,
    color: '#344E41',
  },
});
