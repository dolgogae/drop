import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import AddressInput from '../../components/AddressInput';

interface ValidAddressResult {
  valid: boolean;
  address: string;
  roadAddress: string | null;
  latitude: number | null;
  longitude: number | null;
}

export default function SearchScreen() {
  const [address, setAddress] = useState('');
  const [validatedAddress, setValidatedAddress] = useState<ValidAddressResult | null>(null);

  const handleValidAddress = (result: ValidAddressResult) => {
    setValidatedAddress(result);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>체육관 검색</Text>
          <Text style={styles.subtitle}>주소를 입력하여 검색하세요</Text>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.label}>주소</Text>
          <AddressInput
            value={address}
            onChangeText={setAddress}
            onValidAddress={handleValidAddress}
            placeholder="예: 서울시 강남구 역삼동"
          />
        </View>

        {validatedAddress && validatedAddress.valid && (
          <View style={styles.resultSection}>
            <Text style={styles.resultTitle}>검색 결과</Text>
            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>주소</Text>
              <Text style={styles.resultValue}>{validatedAddress.address}</Text>

              {validatedAddress.roadAddress && (
                <>
                  <Text style={styles.resultLabel}>도로명 주소</Text>
                  <Text style={styles.resultValue}>{validatedAddress.roadAddress}</Text>
                </>
              )}

              <Text style={styles.resultLabel}>좌표</Text>
              <Text style={styles.resultValue}>
                위도: {validatedAddress.latitude?.toFixed(6)}, 경도: {validatedAddress.longitude?.toFixed(6)}
              </Text>
            </View>
          </View>
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
  subtitle: {
    fontSize: 14,
    color: '#A3B18A',
    marginTop: 6,
  },
  inputSection: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#344E41',
    marginBottom: 8,
  },
  resultSection: {
    padding: 20,
    marginTop: 20,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#344E41',
    marginBottom: 12,
  },
  resultCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  resultLabel: {
    fontSize: 12,
    color: '#A3B18A',
    marginTop: 8,
  },
  resultValue: {
    fontSize: 14,
    color: '#344E41',
    marginTop: 2,
  },
});
