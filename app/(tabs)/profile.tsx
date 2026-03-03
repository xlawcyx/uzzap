import React, { useEffect, useState } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity,
  ScrollView, Alert, RefreshControl,
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

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile, updateProfile, signOut, isLoading } = useAuthStore();
  const { colors: themeColors } = useAppTheme();
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => useAuthStore.getState().initialize()}
            tintColor={colors.primary}
          />
        }
      >
        {/* Hero Header */}
        <Animated.View entering={FadeIn.duration(600)}>
          <LinearGradient
            colors={[themeColors.gradientStart, themeColors.gradientMid, themeColors.gradientEnd]}
            style={styles.header}
          >
            <View style={styles.avatarContainer}>
              <Avatar
                source={profile?.avatar_url ? { uri: profile.avatar_url } : undefined}
                size="xl"
                style={styles.avatar}
              />
              <TouchableOpacity
                style={[styles.editAvatarBtn, { borderColor: themeColors.background }]}
                onPress={handleUpdateAvatar}
                disabled={updating}
              >
                {updating
                  ? <View style={styles.avatarLoadingDot} />
                  : <Ionicons name="camera" size={16} color={themeColors.textInverse} />
                }
              </TouchableOpacity>
            </View>

            <Text style={[styles.userName, { color: themeColors.text }]}>{profile?.display_name || 'Buddy'}</Text>
            {profile?.status_message ? (
              <Text style={[styles.userStatus, { color: themeColors.textSecondary }]}>&ldquo;{profile.status_message}&rdquo;</Text>
            ) : null}

            <View style={styles.userMeta}>
              <View style={[styles.metaBadge, { backgroundColor: themeColors.backgroundTertiary, borderColor: themeColors.border }]}>
                <Ionicons name="at" size={12} color={themeColors.textTertiary} />
                <Text style={[styles.metaText, { color: themeColors.textTertiary }]}>{profile?.username || 'no-username'}</Text>
              </View>
              {profile?.region ? (
                <View style={[styles.metaBadge, { backgroundColor: themeColors.backgroundTertiary, borderColor: themeColors.border }]}>
                  <Ionicons name="location-outline" size={12} color={themeColors.textTertiary} />
                  <Text style={[styles.metaText, { color: themeColors.textTertiary }]}>{profile.region}</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {profile?.created_at ? new Date(profile.created_at).getFullYear() : '—'}
                </Text>
                <Text style={[styles.statLabel, { color: themeColors.textTertiary }]}>Joined</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: withOpacity(colors.primary, 0.2) }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>{user?.email?.split('@')[0]?.length || 0}</Text>
                <Text style={[styles.statLabel, { color: themeColors.textTertiary }]}>ID Length</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        <View style={styles.content}>
          {/* Profile Info Card */}
          <Animated.View entering={FadeInUp.delay(150).duration(500)}>
            <Card variant="elevated" style={[styles.card, { backgroundColor: themeColors.backgroundSecondary, borderColor: themeColors.border }]}>
              <Card.Header style={styles.cardHeader}>
                <View style={styles.cardTitleRow}>
                  <Ionicons name="person-circle-outline" size={18} color={colors.primary} />
                  <Text style={[styles.cardTitle, { color: themeColors.text }]}>Profile Information</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    if (editing) {
                      setDisplayName(profile?.display_name || '');
                      setStatusMessage(profile?.status_message || '');
                    }
                    setEditing(!editing);
                  }}
                  disabled={updating}
                  style={styles.editBtn}
                >
                  <Text style={styles.editBtnText}>{editing ? 'Cancel' : 'Edit'}</Text>
                </TouchableOpacity>
              </Card.Header>
              <Card.Content>
                {editing ? (
                  <View style={styles.form}>
                    <Input
                      label="Display Name"
                      value={displayName}
                      onChangeText={setDisplayName}
                      placeholder="Enter display name"
                      leftIcon={<Ionicons name="person-outline" size={18} color={themeColors.textTertiary} />}
                    />
                    <View style={{ height: spacing.md }} />
                    <Input
                      label="Status Message"
                      value={statusMessage}
                      onChangeText={setStatusMessage}
                      placeholder="What's on your mind?"
                      multiline
                      leftIcon={<Ionicons name="chatbubble-outline" size={18} color={themeColors.textTertiary} />}
                    />
                    <Button
                      variant="primary"
                      onPress={handleUpdateProfile}
                      loading={updating}
                      style={styles.saveBtn}
                    >
                      Save Changes
                    </Button>
                  </View>
                ) : (
                  <View style={styles.infoList}>
                    <View style={styles.infoItem}>
                      <View style={[styles.infoIcon, { backgroundColor: withOpacity(colors.info, 0.12) }]}>
                        <Ionicons name="mail-outline" size={16} color={colors.info} />
                      </View>
                      <View style={styles.infoTextContainer}>
                        <Text style={[styles.infoLabel, { color: themeColors.textTertiary }]}>Email</Text>
                        <Text style={[styles.infoValue, { color: themeColors.text }]}>{user?.email}</Text>
                      </View>
                    </View>
                    <View style={[styles.infoDivider, { backgroundColor: themeColors.borderMuted }]} />
                    <View style={styles.infoItem}>
                      <View style={[styles.infoIcon, { backgroundColor: withOpacity(colors.primary, 0.12) }]}>
                        <Ionicons name="chatbubble-outline" size={16} color={colors.primary} />
                      </View>
                      <View style={styles.infoTextContainer}>
                        <Text style={[styles.infoLabel, { color: themeColors.textTertiary }]}>Status</Text>
                        <Text style={[styles.infoValue, { color: themeColors.text }]}>{profile?.status_message || 'No status message'}</Text>
                      </View>
                    </View>
                    <View style={[styles.infoDivider, { backgroundColor: themeColors.borderMuted }]} />
                    <View style={styles.infoItem}>
                      <View style={[styles.infoIcon, { backgroundColor: withOpacity(colors.warning, 0.12) }]}>
                        <Ionicons name="calendar-outline" size={16} color={colors.warning} />
                      </View>
                      <View style={styles.infoTextContainer}>
                        <Text style={[styles.infoLabel, { color: themeColors.textTertiary }]}>Member Since</Text>
                        <Text style={[styles.infoValue, { color: themeColors.text }]}>
                          {profile?.created_at
                            ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric', day: 'numeric' })
                            : 'Unknown'}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              </Card.Content>
            </Card>
          </Animated.View>

          {/* Settings Groups */}
          {settingGroups.map((group, groupIndex) => (
            <Animated.View key={groupIndex} entering={FadeInUp.delay(250 + groupIndex * 100).duration(500)}>
              <Card variant="elevated" style={[styles.card, { backgroundColor: themeColors.backgroundSecondary, borderColor: themeColors.border }]}>
                <Card.Content style={styles.settingsGroupContent}>
                  {group.map((item, index) => (
                    <React.Fragment key={item.label}>
                      {index > 0 && <View style={[styles.settingDivider, { backgroundColor: themeColors.borderMuted }]} />}
                      <TouchableOpacity
                        style={styles.settingItem}
                        onPress={item.route ? () => router.push(item.route as Href) : item.onPress}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.settingIconContainer, { backgroundColor: item.bgColor }]}>
                          <Ionicons name={item.icon as any} size={18} color={item.color} />
                        </View>
                        <Text style={[styles.settingText, { color: themeColors.text }, item.danger && { color: colors.error }]}>
                          {item.label}
                        </Text>
                        <Ionicons name="chevron-forward" size={16} color={themeColors.textTertiary} />
                      </TouchableOpacity>
                    </React.Fragment>
                  ))}
                </Card.Content>
              </Card>
            </Animated.View>
          ))}

          {/* Logout */}
          <Animated.View entering={FadeInUp.delay(550).duration(500)}>
            <TouchableOpacity style={[styles.logoutBtn, { borderColor: withOpacity(colors.error, 0.25), backgroundColor: withOpacity(colors.error, 0.06) }]} onPress={handleLogout} activeOpacity={0.8}>
              <Ionicons name="log-out-outline" size={20} color={colors.error} />
              <Text style={[styles.logoutText, { color: colors.error }]}>Logout</Text>
            </TouchableOpacity>
          </Animated.View>

          <View style={{ height: spacing.xl }} />
        </View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background },
  centered: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { ...typography.body, color: colors.textSecondary },

  // Header
  header: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  avatarContainer: { position: 'relative', marginBottom: spacing.md },
  avatar: {
    borderWidth: 3,
    borderColor: withOpacity(colors.primary, 0.4),
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background,
    ...shadows.md,
  },
  avatarLoadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textInverse,
  },
  userName: { ...typography.h2, color: colors.text, textAlign: 'center' },
  userStatus: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
    textAlign: 'center',
  },
  userMeta: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.backgroundTertiary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metaText: { ...typography.small, color: colors.textTertiary },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    backgroundColor: withOpacity(colors.primary, 0.08),
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: withOpacity(colors.primary, 0.15),
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    gap: spacing.xl,
  },
  statItem: { alignItems: 'center' },
  statValue: { ...typography.h4, color: colors.primary },
  statLabel: { ...typography.tiny, color: colors.textTertiary, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  statDivider: { width: 1, height: 32, backgroundColor: withOpacity(colors.primary, 0.2) },

  // Content
  content: { padding: spacing.md, gap: spacing.md },
  card: { backgroundColor: colors.backgroundSecondary, borderWidth: 1, borderColor: colors.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  cardTitle: { ...typography.captionBold, color: colors.text, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 13 },
  editBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.md,
    backgroundColor: withOpacity(colors.primary, 0.1),
    borderWidth: 1,
    borderColor: withOpacity(colors.primary, 0.2),
  },
  editBtnText: { ...typography.smallBold, color: colors.primary },

  // Info list
  infoList: { gap: 0 },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  infoDivider: { height: 1, backgroundColor: colors.borderMuted, marginVertical: 2 },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTextContainer: { flex: 1 },
  infoLabel: { ...typography.tiny, color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { ...typography.caption, color: colors.text, marginTop: 3 },

  // Form
  form: { width: '100%', gap: 0 },
  saveBtn: { marginTop: spacing.lg },

  // Settings
  settingsGroupContent: { paddingVertical: 0, paddingHorizontal: 0 },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  settingDivider: { height: 1, backgroundColor: colors.borderMuted, marginHorizontal: spacing.md },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingText: { ...typography.body, color: colors.text, flex: 1, fontSize: 15 },

  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: withOpacity(colors.error, 0.25),
    backgroundColor: withOpacity(colors.error, 0.06),
  },
  logoutText: { ...typography.bodyBold, color: colors.error },
});
