import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { colors } from '@/constants/design';
import { useAuthStore } from '@/store/useAuthStore';
import { authService } from '@/services/authService';
import { notificationService } from '@/services/notificationService';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

export default function RootLayout() {
  useFrameworkReady();
  const router = useRouter();
  const segments = useSegments();
  const { initialize, isLoading, user } = useAuthStore();
  const { colors: themeColors, statusBarStyle } = useAppTheme();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!user) return;

    // Set user as online
    authService.setPresence(user.id, true);
    notificationService.registerForPushNotificationsAsync();

    // Set user as offline when app closes
    return () => {
      authService.setPresence(user.id, false);
    };
  }, [user]);

  useEffect(() => {
    if (isLoading) return;

    const topSegment = segments[0];
    const inAuthGroup = segments[0] === '(auth)';
    const atRoot = !topSegment;
    const inProtectedGroup = ['(tabs)', 'chatroom', 'chatrooms', 'profile', 'settings'].includes(topSegment);
    
    if (user && (inAuthGroup || atRoot)) {
      router.replace('/(tabs)');
    } else if (!user && inProtectedGroup) {
      router.replace('/(auth)/login');
    }
  }, [user, segments, isLoading, router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: themeColors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: themeColors.background } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)/login" />
          <Stack.Screen name="(auth)/register" />
          <Stack.Screen name="(auth)/forgot-password" />
          <Stack.Screen name="(auth)/welcome" />
          <Stack.Screen name="(auth)/interests" />
          <Stack.Screen name="(auth)/location" />
          <Stack.Screen name="(auth)/username-check" />
          <Stack.Screen name="(auth)/email-verification" />
          <Stack.Screen name="(auth)/account-recovery-status" />
          <Stack.Screen name="(auth)/complete-profile" />
          <Stack.Screen name="(auth)/invite-friends" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="chatroom/[id]" />
          <Stack.Screen name="profile/[id]" />
          <Stack.Screen name="settings/help-legal-trust" />
          <Stack.Screen name="settings/app-controls" />
          <Stack.Screen name="settings/notifications" />
          <Stack.Screen name="settings/privacy" />
          <Stack.Screen name="settings/appearance" />
          <Stack.Screen name="settings/language" />
          <Stack.Screen name="settings/data-saver" />
          <Stack.Screen name="settings/accessibility" />
          <Stack.Screen name="settings/storage-usage" />
          <Stack.Screen name="settings/connected-accounts" />
          <Stack.Screen name="settings/backup-export" />
          <Stack.Screen name="settings/diagnostics" />
          <Stack.Screen name="settings/help-center" />
          <Stack.Screen name="settings/contact-support" />
          <Stack.Screen name="settings/feedback" />
          <Stack.Screen name="settings/changelog" />
          <Stack.Screen name="settings/terms-of-service" />
          <Stack.Screen name="settings/privacy-policy" />
          <Stack.Screen name="settings/community-guidelines" />
          <Stack.Screen name="settings/open-source-licenses" />
          <Stack.Screen name="settings/about" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style={statusBarStyle} />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
