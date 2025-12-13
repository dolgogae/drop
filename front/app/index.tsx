import { Redirect } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

export default function Index() {
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  if (accessToken) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/login" />;
}
