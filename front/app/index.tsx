import { Redirect } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

export default function Index() {
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const role = useSelector((state: RootState) => state.auth.role);

  if (accessToken) {
    if (role === 'GYM') {
      return <Redirect href="/admin" />;
    }
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/login" />;
}
