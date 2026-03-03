import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, borderRadius, withOpacity, shadows } from '@/constants/design';
import { Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const compactLayout = width < 380;
  const { colors: themeColors, isDark } = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: themeColors.textTertiary,
        tabBarStyle: {
          backgroundColor: isDark ? 'rgba(10, 10, 11, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          borderTopColor: 'transparent',
          height: Platform.OS === 'ios' ? 64 + insets.bottom : 70,
          paddingBottom: Platform.OS === 'ios' ? Math.max(insets.bottom, 12) : 12,
          paddingTop: 12,
          paddingHorizontal: 16,
          position: 'absolute',
          borderTopLeftRadius: borderRadius.xxxl,
          borderTopRightRadius: borderRadius.xxxl,
          ...shadows.lg,
        },
        tabBarItemStyle: {
          borderRadius: borderRadius.xl,
          height: 48,
        },
        tabBarLabelStyle: {
          ...typography.tinyBold,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          marginTop: 2,
        },
        tabBarActiveBackgroundColor: withOpacity(colors.primary, 0.1),
        tabBarHideOnKeyboard: true,
        sceneStyle: {
          backgroundColor: themeColors.background,
          paddingBottom: Platform.OS === 'ios' ? 64 + insets.bottom : 70,
        },
        headerStyle: {
          backgroundColor: themeColors.background,
          borderBottomColor: themeColors.border,
          borderBottomWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          ...typography.h3,
          color: themeColors.text,
        },
        headerTintColor: themeColors.text,
        headerTitleAlign: 'left',
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explore',
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'compass' : 'compass-outline'}
              size={26}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="buddies"
        options={{
          title: 'Buddies',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'people' : 'people-outline'}
              size={26}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={26}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}