import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert, RefreshControl } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/design';
import { Card, Avatar, Container, Button, Input } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useAuthStore } from '@/store/useAuthStore';
import { Href, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile, updateProfile, signOut, isLoading } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [statusMessage, setStatusMessage] = useState(profile?.status_message || '');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    setDisplayName(profile?.display_name || '');
    setStatusMessage(profile?.status_message || '');
  }, [profile?.display_name, profile?.status_message]);

  const handleUpdateProfile = async () => {
    if (!displayName) {
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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    const asset = result.assets?.[0];
    if (result.canceled || !asset?.uri) return;

    setUpdating(true);
    try {
      const response = await fetch(asset.uri);
      const blob = await response.blob();
      const path = `avatars/${profile.id}-${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, blob, { upsert: true, contentType: 'image/jpeg' });

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

  if (isLoading && !profile) {
    return (
      <Container style={styles.centered}>
        <Text style={styles.loadingText}>Loading Profile...</Text>
      </Container>
    );
  }

  return (
    <Container style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => useAuthStore.getState().initialize()} tintColor={colors.accent} />}
      >
        <Animated.View entering={FadeIn.duration(800)} style={styles.header}>
          <View style={styles.avatarContainer}>
            <Avatar source={profile?.avatar_url ? { uri: profile.avatar_url } : undefined} size="xl" />
            <TouchableOpacity style={styles.editAvatarBtn} onPress={handleUpdateAvatar} disabled={updating}>
              <Ionicons name="camera" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{profile?.display_name || 'Buddy'}</Text>
          <Text style={styles.userRegion}>{profile?.status_message || profile?.region || 'No status message'}</Text>
        </Animated.View>

        <View style={styles.content}>
          <Animated.View entering={FadeInUp.delay(200).duration(500)}>
            <Card variant="elevated" style={styles.infoCard}>
              <Card.Header style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Profile Information</Text>
                <TouchableOpacity
                  onPress={() => {
                    if (editing) {
                      setDisplayName(profile?.display_name || '');
                      setStatusMessage(profile?.status_message || '');
                    }
                    setEditing(!editing);
                  }}
                  disabled={updating}
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
                  </View>
                ) : (
                  <View style={styles.infoList}>
                    <View style={styles.infoItem}>
                      <Ionicons name="mail-outline" size={20} color={colors.textTertiary} />
                      <View style={styles.infoTextContainer}>
                        <Text style={styles.infoLabel}>Email</Text>
                        <Text style={styles.infoValue}>{user?.email}</Text>
                      </View>
                    </View>
                    <View style={styles.infoItem}>
                      <Ionicons name="chatbubble-outline" size={20} color={colors.textTertiary} />
                      <View style={styles.infoTextContainer}>
                        <Text style={styles.infoLabel}>Status</Text>
                        <Text style={styles.infoValue}>{profile?.status_message || 'No status message'}</Text>
                      </View>
                    </View>
                    <View style={styles.infoItem}>
                      <Ionicons name="calendar-outline" size={20} color={colors.textTertiary} />
                      <View style={styles.infoTextContainer}>
                        <Text style={styles.infoLabel}>Joined</Text>
                        <Text style={styles.infoValue}>{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}</Text>
                      </View>
                    </View>
                  </View>
                )}
              </Card.Content>
            </Card>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(400).duration(500)}>
            <Card variant="elevated" style={styles.settingsCard}>
              <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/settings/notifications')}>
                <View style={styles.settingIconContainer}>
                  <Ionicons name="notifications-outline" size={20} color={colors.accent} />
                </View>
                <Text style={styles.settingText}>Notifications</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.border} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/settings/privacy')}>
                <View style={styles.settingIconContainer}>
                  <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
                </View>
                <Text style={styles.settingText}>Privacy & Security</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.border} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/settings/help-legal-trust' as Href)}>
                <View style={styles.settingIconContainer}>
                  <Ionicons name="help-circle-outline" size={20} color={colors.warning} />
                </View>
                <Text style={styles.settingText}>Help, Legal & Trust</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.border} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/settings/app-controls' as Href)}>
                <View style={styles.settingIconContainer}>
                  <Ionicons name="options-outline" size={20} color={colors.info} />
                </View>
                <Text style={styles.settingText}>Settings & App Controls</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.border} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/settings/about' as Href)}>
                <View style={styles.settingIconContainer}>
                  <Ionicons name="information-circle-outline" size={20} color={colors.success} />
                </View>
                <Text style={styles.settingText}>About</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.border} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
                <View style={[styles.settingIconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                  <Ionicons name="log-out-outline" size={20} color={colors.error} />
                </View>
                <Text style={[styles.settingText, { color: colors.error }]}>Logout</Text>
              </TouchableOpacity>
            </Card>
          </Animated.View>
        </View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    backgroundColor: colors.backgroundSecondary,
    borderBottomLeftRadius: borderRadius.xxl,
    borderBottomRightRadius: borderRadius.xxl,
    ...shadows.md,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.backgroundSecondary,
  },
  userName: {
    ...typography.h2,
    color: colors.text,
  },
  userRegion: {
    ...typography.body,
    color: colors.accent,
    fontWeight: '600',
    marginTop: 4,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  infoCard: {
    backgroundColor: colors.backgroundSecondary,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    ...typography.h4,
    color: colors.text,
  },
  editBtnText: {
    ...typography.smallBold,
    color: colors.accent,
  },
  infoList: {
    gap: spacing.lg,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    ...typography.tiny,
    color: colors.textTertiary,
    textTransform: 'uppercase',
  },
  infoValue: {
    ...typography.body,
    color: colors.text,
    marginTop: 2,
  },
  form: {
    width: '100%',
  },
  saveBtn: {
    marginTop: spacing.lg,
  },
  settingsCard: {
    backgroundColor: colors.backgroundSecondary,
    paddingVertical: spacing.xs,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
});
