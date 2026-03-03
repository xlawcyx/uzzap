import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';

import { Button, Container } from '@/components/ui';
import { borderRadius, colors, spacing, typography } from '@/constants/design';
import { useAppTheme } from '@/hooks/useAppTheme';
import { PH_REGIONS } from '@/constants/onboardingData';

export default function LocationSetupScreen() {
  const router = useRouter();
  const { colors: themeColors } = useAppTheme();
  const [region, setRegion] = useState(Object.keys(PH_REGIONS)[0]);
  const [province, setProvince] = useState(PH_REGIONS[Object.keys(PH_REGIONS)[0]][0]);
  const [detecting, setDetecting] = useState(false);

  const provinces = useMemo(() => PH_REGIONS[region] ?? [], [region]);

  const handleDetect = async () => {
    setDetecting(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location access was not granted. You can select manually.');
        return;
      }

      const current = await Location.getCurrentPositionAsync({});
      const geocode = await Location.reverseGeocodeAsync(current.coords);
      const place = geocode[0];
      if (!place) return;

      const foundRegion = Object.keys(PH_REGIONS).find((candidate) =>
        `${place.region || ''} ${place.subregion || ''}`.toLowerCase().includes(candidate.toLowerCase().split(' ')[0]),
      );

      if (foundRegion) {
        setRegion(foundRegion);
        setProvince(PH_REGIONS[foundRegion][0]);
      }

      Alert.alert('Location updated', 'We used your device location. Please confirm details before continuing.');
    } catch (error: any) {
      Alert.alert('Unable to detect location', error?.message || 'Please select your location manually.');
    } finally {
      setDetecting(false);
    }
  };

  return (
    <Container style={styles.container} backgroundColor={themeColors.background}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: themeColors.text }]}>Confirm your location</Text>
        <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>We use this to suggest nearby chatrooms and local buddy communities.</Text>

        <Button variant="outline" onPress={handleDetect} loading={detecting}>
          Auto-detect location
        </Button>

        <Text style={[styles.label, { color: themeColors.text }]}>Region</Text>
        <View style={styles.optionsWrap}>
          {Object.keys(PH_REGIONS).map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => {
                setRegion(item);
                setProvince(PH_REGIONS[item][0]);
              }}
              style={[
                styles.option,
                { borderColor: themeColors.border, backgroundColor: themeColors.backgroundSecondary },
                item === region && {
                  backgroundColor: themeColors.optionActiveBackground,
                  borderColor: themeColors.optionActiveText,
                },
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  { color: themeColors.textSecondary },
                  item === region && { color: themeColors.optionActiveText, fontWeight: '700' },
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { color: themeColors.text }]}>Province / Area</Text>
        <View style={styles.optionsWrap}>
          {provinces.map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setProvince(item)}
              style={[
                styles.option,
                { borderColor: themeColors.border, backgroundColor: themeColors.backgroundSecondary },
                item === province && {
                  backgroundColor: themeColors.optionActiveBackground,
                  borderColor: themeColors.optionActiveText,
                },
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  { color: themeColors.textSecondary },
                  item === province && { color: themeColors.optionActiveText, fontWeight: '700' },
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <Button variant="outline" onPress={() => router.back()}>
            Back
          </Button>
          <Button variant="primary" onPress={() => router.push('/(auth)/username-check' as any)}>
            Continue
          </Button>
        </View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {},
  content: { flexGrow: 1, padding: spacing.lg, gap: spacing.md },
  title: { ...typography.h2 },
  subtitle: { ...typography.body },
  label: { ...typography.captionBold, marginTop: spacing.sm },
  optionsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  option: {
    borderWidth: 1,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  optionActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  optionText: { ...typography.small },
  optionTextActive: { fontWeight: '700' },
  footer: { marginTop: 'auto', flexDirection: 'row', gap: spacing.sm },
});
