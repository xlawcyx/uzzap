import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAppTheme } from '@/hooks/useAppTheme';
import { colors } from '@/constants/design';

interface RuleSectionProps {
  title: string;
  rules: string[];
}

export function RuleSection({ title, rules }: RuleSectionProps) {
  const { colors: themeColors } = useAppTheme();

  return (
    <Animated.View 
      style={[styles.section, { backgroundColor: themeColors.backgroundSecondary }]}
      entering={FadeInDown.duration(400).delay(200)}
    >
      <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{title}</Text>
      {rules.map((rule, index) => (
        <View key={index} style={styles.ruleContainer}>
          <Text style={[styles.bulletPoint, { color: colors.primary }]}>•</Text>
          <Text style={[styles.ruleText, { color: themeColors.textSecondary }]}>{rule}</Text>
        </View>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  ruleContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingRight: 8,
  },
  bulletPoint: {
    fontSize: 14,
    marginRight: 8,
    color: '#007AFF',
    top: 2,
  },
  ruleText: {
    fontSize: 14,
    color: '#3C3C43',
    lineHeight: 20,
    flex: 1,
  },
});