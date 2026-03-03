import React from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/design';
import { withOpacity } from '@/constants/design';

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

  return (
    <View style={[styles.outerContainer, { backgroundColor: themeColors.backgroundSecondary, borderTopColor: themeColors.border }]}>
      {replyTo && (
        <View style={[styles.replyBar, { backgroundColor: themeColors.backgroundSecondary, borderColor: themeColors.border }]}>
          <View style={styles.replyBarAccent} />
          <View style={{ flex: 1 }}>
            <Text style={styles.replyLabel}>
              Replying to {replyTo.sender?.display_name || 'message'}
            </Text>
            <Text style={[styles.replySnippet, { color: themeColors.textSecondary }]} numberOfLines={1}>
              {replyTo.content}
            </Text>
          </View>
          <TouchableOpacity onPress={onCancelReply} style={styles.replyClose}>
            <Ionicons name="close" size={16} color={themeColors.textTertiary} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: themeColors.backgroundTertiary, borderColor: themeColors.border }]}
          onPress={onImagePicker}
          disabled={sending}
        >
          <Ionicons name="image-outline" size={22} color={sending ? themeColors.textDisabled : themeColors.textSecondary} />
        </TouchableOpacity>

        <TextInput
          style={[styles.input, { backgroundColor: themeColors.backgroundTertiary, borderColor: themeColors.border, color: themeColors.text }]}
          placeholder="Type a message..."
          placeholderTextColor={themeColors.textTertiary}
          value={message}
          onChangeText={onMessageChange}
          multiline
          maxLength={2000}
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            canSend ? styles.sendButtonActive : { backgroundColor: themeColors.backgroundElevated, borderColor: themeColors.border, borderWidth: 1 }
          ]}
          onPress={onSend}
          disabled={!canSend}
        >
          {sending ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Ionicons name="send" size={18} color={canSend ? colors.white : themeColors.textTertiary} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    borderTopWidth: 1,
    paddingTop: spacing.xs,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 2,
  },
  input: {
    flex: 1,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    ...typography.body,
    maxHeight: 120,
    fontSize: 15,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  sendButtonActive: {
    backgroundColor: colors.primary,
    ...shadows.glow,
  },
  replyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.sm,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  replyBarAccent: {
    width: 3,
    alignSelf: 'stretch',
    backgroundColor: colors.primary,
  },
  replyLabel: {
    ...typography.tinyBold,
    color: colors.primary,
    letterSpacing: 0.2,
  },
  replySnippet: {
    ...typography.caption,
    marginTop: 2,
  },
  replyClose: {
    padding: spacing.sm,
  },
});
