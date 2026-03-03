import React from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/design';
import { withOpacity } from '@/constants/design';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useAppTheme } from '@/hooks/useAppTheme';

interface ChatInputProps {
  message: string;
  onMessageChange: (text: string) => void;
  onSend: () => void;
  onImagePicker: () => void;
  sending: boolean;
  themeColors: any;
  replyTo?: any;
  onCancelReply: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  message,
  onMessageChange,
  onSend,
  onImagePicker,
  sending,
  themeColors,
  replyTo,
  onCancelReply,
}) => {
  const canSend = message.trim().length > 0 && !sending;
  const { isDark } = useAppTheme();

  return (
    <View style={[styles.outerContainer, { backgroundColor: themeColors.background }]}>
      {replyTo && (
        <Animated.View entering={FadeInUp} style={[styles.replyBar, { backgroundColor: themeColors.backgroundElevated, borderColor: themeColors.border }]}>
          <View style={[styles.replyBarAccent, { backgroundColor: colors.primary }]} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.replyLabel, { color: colors.primary }]}>
              Replying to {replyTo.sender?.display_name || 'Buddy'}
            </Text>
            <Text style={[styles.replySnippet, { color: themeColors.textSecondary }]} numberOfLines={1}>
              {replyTo.content}
            </Text>
          </View>
          <TouchableOpacity onPress={onCancelReply} style={styles.replyClose}>
            <Ionicons name="close-circle" size={20} color={themeColors.textTertiary} />
          </TouchableOpacity>
        </Animated.View>
      )}

      <View style={[styles.container, { paddingBottom: Platform.OS === 'ios' ? spacing.lg : spacing.md }]}>
        <View style={[
          styles.inputWrapper, 
          { 
            backgroundColor: themeColors.backgroundElevated, 
            borderColor: themeColors.border 
          }
        ]}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={onImagePicker}
            disabled={sending}
          >
            <Ionicons name="add-circle" size={28} color={colors.primary} />
          </TouchableOpacity>

          <TextInput
            style={[styles.input, { color: themeColors.text }]}
            placeholder="Type message..."
            placeholderTextColor={themeColors.textTertiary}
            value={message}
            onChangeText={onMessageChange}
            multiline
            maxLength={2000}
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              canSend ? { backgroundColor: colors.primary } : { backgroundColor: themeColors.backgroundTertiary }
            ]}
            onPress={onSend}
            disabled={!canSend}
          >
            {sending ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Ionicons name="arrow-up" size={22} color={canSend ? colors.white : themeColors.textDisabled} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    paddingTop: spacing.xs,
  },
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 6,
    ...shadows.md,
  },
  actionBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    ...typography.body,
    maxHeight: 120,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  replyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  replyBarAccent: {
    width: 4,
    alignSelf: 'stretch',
  },
  replyLabel: {
    ...typography.tinyBold,
    marginTop: 4,
  },
  replySnippet: {
    ...typography.caption,
    marginBottom: 4,
  },
  replyClose: {
    padding: spacing.sm,
  },
});