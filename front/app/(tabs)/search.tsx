import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import CrossfitBoxSearch, { CrossfitBoxResult } from '../../components/CrossfitBoxSearch';

export default function SearchScreen() {
  const router = useRouter();

  const handleCrossfitBoxPress = (crossfitBox: CrossfitBoxResult) => {
    router.push(`/crossfit-box/${crossfitBox.id}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Box 검색</Text>
        </View>

        <View style={styles.content}>
          <CrossfitBoxSearch
            onSelect={handleCrossfitBoxPress}
            placeholder="예: 크로스핏 XXX"
          />
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
});
