import React from 'react';
import { Stack } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Container, Card } from '@/components/ui';
import { colors, spacing, typography, borderRadius, withOpacity } from '@/constants/design';
import { ThemePreference, useAppSettingsStore, BubbleStyle } from '@/store/useAppSettingsStore';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Ionicons } from '@expo/vector-icons';

const themes: ThemePreference[] = ['system', 'light', 'dark'];
const bubbleStyles: BubbleStyle[] = ['modern', 'classic', 'minimalist', 'playful'];

const bubbleColors = [
  { name: 'Emerald', color: '#1D5C3E' },
  { name: 'Blue', color: '#1D4ED8' },
  { name: 'Indigo', color: '#4338CA' },
  { name: 'Violet', color: '#6D28D9' },
  { name: 'Fuchsia', color: '#A21CAF' },
  { name: 'Pink', color: '#BE185D' },
  { name: 'Rose', color: '#BE123C' },
  { name: 'Amber', color: '#B45309' },
  { name: 'Orange', color: '#C2410C' },
  { name: 'Slate', color: '#334155' },
  { name: 'Zink', color: '#3F3F46' },
];

export default function AppearanceSettingsScreen() {
  const { theme, setTheme, bubbleColor, setBubbleColor, bubbleStyle, setBubbleStyle } = useAppSettingsStore();
  const { resolvedTheme, colors: themeColors } = useAppTheme();

  return (
    <Container style={{ ...styles.container, backgroundColor: themeColors.background }}>
      <Stack.Screen options={{ headerShown: true, title: 'Appearance', headerStyle: { backgroundColor: themeColors.backgroundSecondary }, headerTintColor: themeColors.text }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card variant="elevated" style={{ ...styles.card, backgroundColor: themeColors.backgroundSecondary }}>
          <Card.Content>
            <Text style={[styles.header, { color: themeColors.text }]}>Choose theme</Text>
            <View style={styles.themeGrid}>
              {themes.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.themeOption,
                    { backgroundColor: themeColors.background, borderColor: themeColors.border },
                    theme === item && {
                      borderColor: colors.primary,
                      backgroundColor: withOpacity(colors.primary, 0.1),
                    },
                  ]}
                  onPress={() => setTheme(item)}
                >
                  <Ionicons 
                    name={item === 'dark' ? 'moon' : item === 'light' ? 'sunny' : 'settings-outline'} 
                    size={24} 
                    color={theme === item ? colors.primary : themeColors.textSecondary} 
                  />
                  <Text
                    style={[
                      styles.optionText,
                      { color: theme === item ? colors.primary : themeColors.text, marginTop: spacing.xs },
                    ]}
                  >
                    {item[0].toUpperCase() + item.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[styles.helper, { color: themeColors.textSecondary }]}>Current applied theme: {resolvedTheme}</Text>
          </Card.Content>
        </Card>

        <Card variant="elevated" style={{ ...styles.card, marginTop: spacing.lg, backgroundColor: themeColors.backgroundSecondary }}>
          <Card.Content>
            <Text style={[styles.header, { color: themeColors.text }]}>Chat bubble color</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorScroll}>
              {bubbleColors.map((item) => (
                <TouchableOpacity
                  key={item.color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: item.color },
                    bubbleColor === item.color && styles.activeColorOption,
                  ]}
                  onPress={() => setBubbleColor(item.color)}
                >
                  {bubbleColor === item.color && (
                    <Ionicons name="checkmark" size={20} color="white" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.header, { color: themeColors.text, marginTop: spacing.lg }]}>Chat bubble style</Text>
            <View style={styles.styleGrid}>
              {bubbleStyles.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.styleOption,
                    { backgroundColor: themeColors.background, borderColor: themeColors.border },
                    bubbleStyle === item && {
                      borderColor: colors.primary,
                      backgroundColor: withOpacity(colors.primary, 0.1),
                    },
                  ]}
                  onPress={() => setBubbleStyle(item)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: bubbleStyle === item ? colors.primary : themeColors.text },
                    ]}
                  >
                    {item[0].toUpperCase() + item.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.previewContainer}>
              <Text style={[styles.previewLabel, { color: themeColors.textSecondary }]}>Preview</Text>
              <View style={[
                styles.previewBubble, 
                styles[`bubbleStyle_${bubbleStyle}` as keyof typeof styles],
                { backgroundColor: bubbleColor }
              ]}>
                <Text style={styles.previewText}>This is a preview of your chat bubble!</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {},
  content: { padding: spacing.md },
  card: { borderRadius: borderRadius.xl },
  header: { ...typography.h4, marginBottom: spacing.md },
  themeGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  themeOption: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorScroll: {
    flexDirection: 'row',
    paddingVertical: spacing.xs,
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeColorOption: {
    borderColor: 'white',
  },
  styleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  styleOption: {
    flex: 1,
    minWidth: '45%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  previewContainer: {
    marginTop: spacing.xl,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'flex-end',
  },
  previewLabel: {
    ...typography.tinyBold,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  previewBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: '80%',
  },
  previewText: {
    ...typography.body,
    color: 'white',
  },
  bubbleStyle_modern: {
    borderRadius: borderRadius.xl,
    borderBottomRightRadius: 4,
  },
  bubbleStyle_classic: {
    borderRadius: borderRadius.md,
    borderBottomRightRadius: 0,
  },
  bubbleStyle_minimalist: {
    borderRadius: 0,
    borderBottomRightRadius: 0,
    borderLeftWidth: 4,
    borderLeftColor: 'white',
  },
  bubbleStyle_playful: {
    borderRadius: borderRadius.xxl,
    borderBottomRightRadius: 10,
  },
  optionText: { ...typography.body },
  helper: { ...typography.caption, marginTop: spacing.md },
});
