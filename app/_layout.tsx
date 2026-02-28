import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { getToken } from '@/utils/storage';
import { UserProvider } from '@/context/UserContext';
import { UserMenuButton } from '@/components/user-menu-button';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [tokenChecked, setTokenChecked] = useState(false);

  useEffect(() => {
    getToken().then((token) => {
      if (!token) router.replace('/login');
      setTokenChecked(true);
    });
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <UserProvider>
        <Stack screenOptions={{ headerRight: () => <UserMenuButton /> }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false, headerRight: undefined }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>

      {/* Overlay hides the tab content until the auth check completes */}
      {!tokenChecked && (
        <View style={[StyleSheet.absoluteFillObject, styles.loading, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
          <ActivityIndicator size="large" />
        </View>
      )}

        <StatusBar style="auto" />
      </UserProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
