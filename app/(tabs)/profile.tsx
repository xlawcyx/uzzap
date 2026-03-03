import React, { useEffect, useState } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity,
  ScrollView, Alert, RefreshControl, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius, shadows, withOpacity } from '@/constants/design';
import { Card, Avatar, Container, Button, Input } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Href, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';

type SettingItem = {
  icon: string;
  label: string;
  route?: string;
  color: string;
  bgColor: string;
  onPress?: () => void;
  danger?: boolean;
};

const gradients = {
  profileHeader: ['#8A2BE2', '#4B0082', '#1A1A2E'], // Electric Violet palette
};

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile, updateProfile, signOut, isLoading } = useAuthStore();
  const { colors: themeColors, isDark } = useAppTheme();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [statusMessage, setStatusMessage] = useState(profile?.status_message || '');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    setDisplayName(profile?.display_name || '');
    setStatusMessage(profile?.status_message || '');
  }, [profile?.display_name, profile?.status_message]);

  const handleUpdateProfile = async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Display name cannot be empty');
      return;
    }
    setUpdating(true);
    try {
      await updateProfile({
        display_name: displayName.trim(),
        status_message: statusMessage.trim() || null,
      });
      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateAvatar = async () => {
    if (!profile || updating) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow photo access to update your avatar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    const asset = result.assets?.[0];
    if (result.canceled || !asset?.uri) return;

    setUpdating(true);
    try {
      const uri = asset.uri;
      const uriParts = uri.split('.');
      const rawExt = uriParts[uriParts.length - 1]?.toLowerCase().split('?')[0] || 'jpg';
      const ext = ['jpg', 'jpeg', 'png', 'webp'].includes(rawExt) ? rawExt : 'jpg';
      const contentType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
      const path = `avatars/${profile.id}-${Date.now()}.${ext}`;

      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, arrayBuffer, { upsert: true, contentType });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      await updateProfile({ avatar_url: data.publicUrl });
      Alert.alert('Success', 'Avatar updated!');
    } catch (error: any) {
      Alert.alert('Upload failed', error.message || 'Unable to update avatar.');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  const settingGroups: SettingItem[][] = [
    [
      { icon: 'notifications-outline', label: 'Notifications', route: '/settings/notifications', color: colors.warning, bgColor: withOpacity(colors.warning, 0.12) },
      { icon: 'shield-checkmark-outline', label: 'Privacy & Security', route: '/settings/privacy', color: colors.primary, bgColor: withOpacity(colors.primary, 0.12) },
      { icon: 'color-palette-outline', label: 'Appearance', route: '/settings/appearance', color: colors.info, bgColor: withOpacity(colors.info, 0.12) },
    ],
    [
      { icon: 'help-circle-outline', label: 'Help, Legal & Trust', route: '/settings/help-legal-trust', color: colors.gold, bgColor: withOpacity(colors.gold, 0.12) },
      { icon: 'options-outline', label: 'Settings & App Controls', route: '/settings/app-controls', color: colors.info, bgColor: withOpacity(colors.info, 0.12) },
      { icon: 'information-circle-outline', label: 'About', route: '/settings/about', color: colors.textSecondary, bgColor: withOpacity(colors.textSecondary, 0.1) },
    ],
  ];

  if (isLoading && !profile) {
    return (
      <Container style={[styles.centered, { backgroundColor: themeColors.background }]}>
        <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>Loading Profile...</Text>
      </Container>
    );
  }

  return (
    <Container style={[styles.container, { backgroundColor: themeColors.background }]}>
      <LinearGradient
        colors={isDark ? ['#1E1B4B', '#000000'] : ['#F5F3FF', '#FFFFFF']}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => useAuthStore.getState().initialize()}
            tintColor={colors.primary}
          />
        }
      >
        {/* Hero Header */}
        <Animated.View entering={FadeIn.duration(800)}>
          <LinearGradient
            colors={gradients.profileHeader}
            style={styles.header}
          >
            <View style={styles.avatarContainer}>
              <Avatar
                source={profile?.avatar_url ? { uri: profile.avatar_url } : undefined}
                size="xxl"
                style={styles.avatar}
              />
              <TouchableOpacity
                style={[styles.editAvatarBtn, { backgroundColor: colors.primary, borderColor: themeColors.background }]}
                onPress={handleUpdateAvatar}
                disabled={updating}
              >
                {updating
                  ? <ActivityIndicator size="small" color="#FFF" />
                  : <Ionicons name="camera" size={20} color="#FFF" />
                }
              </TouchableOpacity>
            </View>

            <Text style={[styles.userName, { color: themeColors.text }]}>{profile?.display_name || 'Buddy'}</Text>
            <Text style={[styles.userHandle, { color: colors.primary }]}>@{profile?.username || 'username'}</Text>
            
            {profile?.status_message ? (
              <View style={[styles.statusBubble, { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.1)' }]}>
                <Text style={[styles.userStatus, { color: themeColors.textSecondary }]}>{profile.status_message}</Text>
              </View>
            ) : null}

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: themeColors.text }]}>2024</Text>
                <Text style={[styles.statLabel, { color: themeColors.textTertiary }]}>Joined</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.1)' }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: themeColors.text }]}>12</Text>
                <Text style={[styles.statLabel, { color: themeColors.textTertiary }]}>Buddies</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.1)' }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: themeColors.text }]}>5</Text>
                <Text style={[styles.statLabel, { color: themeColors.textTertiary }]}>Groups</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        <View style={styles.content}>
          {/* Action Buttons */}
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}
              onPress={() => setEditing(true)}
            >
              <Ionicons name="create-outline" size={20} color={colors.primary} />
              <Text style={[styles.actionBtnText, { color: themeColors.text }]}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}
              onPress={() => router.push('/settings/appearance')}
            >
              <Ionicons name="color-palette-outline" size={20} color={colors.primary} />
              <Text style={[styles.actionBtnText, { color: themeColors.text }]}>Appearance</Text>
            </TouchableOpacity>
          </View>

          {editing && (
            <Animated.View entering={FadeInUp} style={[styles.editCard, { backgroundColor: themeColors.backgroundElevated, borderColor: themeColors.border }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: themeColors.text }]}>Edit Profile</Text>
                <TouchableOpacity onPress={() => setEditing(false)}>
                  <Ionicons name="close" size={24} color={themeColors.textTertiary} />
                </TouchableOpacity>
              </View>
              <Input
                label="Display Name"
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Enter display name"
              />
              <View style={{ height: spacing.md }} />
              <Input
                label="Status Message"
                value={statusMessage}
                onChangeText={setStatusMessage}
                placeholder="What's on your mind?"
                multiline
              />
              <Button
                variant="primary"
                onPress={handleUpdateProfile}
                loading={updating}
                style={styles.saveBtn}
              >
                Save Changes
              </Button>
            </Animated.View>
          )}

          {/* Settings Groups */}
          <Text style={[styles.sectionHeader, { color: themeColors.textTertiary }]}>Settings</Text>
          {settingGroups.map((group, groupIndex) => (
            <View key={groupIndex} style={styles.settingsGroup}>
              {group.map((item, index) => (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.settingItem, 
                    { 
                      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                      borderColor: themeColors.border 
                    },
                    index === 0 && styles.settingItemFirst,
                    index === group.length - 1 && styles.settingItemLast
                  ]}
                  onPress={item.route ? () => router.push(item.route as Href) : item.onPress}
                  activeOpacity={0.7}
                >
                  <View style={[styles.settingIconContainer, { backgroundColor: item.bgColor }]}>
                    <Ionicons name={item.icon as any} size={20} color={item.color} />
                  </View>
                  <Text style={[styles.settingText, { color: themeColors.text }]}>
                    {item.label}
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color={themeColors.textTertiary} />
                </TouchableOpacity>
              ))}
            </View>
          ))}

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { ...typography.body, color: colors.textSecondary },

  // Header
  header: {
    alignItems: 'center',
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: borderRadius.xxxl,
    borderBottomRightRadius: borderRadius.xxxl,
  },
  avatarContainer: { position: 'relative', marginBottom: spacing.lg },
  avatar: {
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    ...shadows.md,
  },
  userName: { ...typography.h2, textAlign: 'center' },
  userHandle: { ...typography.bodyBold, marginTop: 2 },
  statusBubble: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  userStatus: { ...typography.caption, fontStyle: 'italic' },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
    gap: spacing.xl,
  },
  statItem: { alignItems: 'center' },
  statValue: { ...typography.h3 },
  statLabel: { ...typography.tinyBold, textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 },
  statDivider: { width: 1, height: 24 },

  // Content
  content: { padding: spacing.lg },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: borderRadius.xl,
  },
  actionBtnText: { ...typography.smallBold },

  editCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    marginBottom: spacing.xl,
    ...shadows.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardTitle: { ...typography.h4 },
  saveBtn: { marginTop: spacing.lg },

  sectionHeader: {
    ...typography.tinyBold,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  settingsGroup: {
    marginBottom: spacing.xl,
    gap: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
  },
  settingItemFirst: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  settingItemLast: {
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingText: { ...typography.body, flex: 1 },

  logoutBtn: {
    marginTop: spacing.md,
    alignItems: 'center',
    padding: spacing.md,
  },
  logoutText: { ...typography.bodyBold, color: colors.error },
});