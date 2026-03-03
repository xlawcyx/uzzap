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
          backgroundColor: isDark ? '#111111' : themeColors.backgroundSecondary,
          borderTopColor: isDark ? colors.border : themeColors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 62 + insets.bottom : 62,
          paddingBottom: Platform.OS === 'ios' ? Math.max(insets.bottom, 10) : 10,
          paddingTop: compactLayout ? 8 : 10,
          paddingHorizontal: compactLayout ? 4 : 8,
          ...shadows.sm,
        },
        tabBarItemStyle: {
          borderRadius: borderRadius.lg,
          marginHorizontal: 2,
        },
        tabBarLabelStyle: {
          ...typography.smallBold,
          fontSize: 11,
          marginTop: -2,
        },
        tabBarActiveBackgroundColor: withOpacity(colors.primary, isDark ? 0.14 : 0.08),
        tabBarHideOnKeyboard: true,
        sceneStyle: {
          backgroundColor: themeColors.background,
        },
        headerStyle: {
          backgroundColor: isDark ? '#111111' : themeColors.backgroundSecondary,
          borderBottomColor: isDark ? colors.border : themeColors.border,
          borderBottomWidth: 1,
        },
        headerTitleStyle: {
          ...typography.h4,
          color: themeColors.text,
        },
        headerTintColor: themeColors.text,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Chatrooms',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'chatbubbles' : 'chatbubbles-outline'}
              size={size}
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
              size={size}
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
              name={focused ? 'person-circle' : 'person-circle-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
