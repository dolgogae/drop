import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useI18n } from '../../contexts/i18n';

function BackButton() {
  const router = useRouter();
  return (
    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
      <Text style={styles.backText}>{'<'}</Text>
    </TouchableOpacity>
  );
}

export default function MyPageLayout() {
  const { t } = useI18n();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#fff' },
        headerTintColor: '#344E41',
        headerShadowVisible: false,
        headerLeft: () => <BackButton />,
      }}
    >
      <Stack.Screen
        name="edit-profile"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="change-password"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="profile-image"
        options={{ title: t('mypage.profileImage') }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  backButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  backText: {
    fontSize: 24,
    color: '#344E41',
    fontWeight: '300',
  },
});
