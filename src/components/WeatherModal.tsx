import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import type { WeatherData } from '../hooks/useWeather';

interface Props {
  visible: boolean;
  weather: WeatherData | null;
  onClose: () => void;
}

const WeatherModal = ({ visible, weather, onClose }: Props) => {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View>
            <Text style={[styles.title, { color: colors.foreground }]}>Sarajevo Weather</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              {weather ? weather.description : 'Loading…'}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {weather && (
          <ScrollView contentContainerStyle={styles.content}>
            {/* Hero */}
            <View style={[styles.hero, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}>
              <MaterialCommunityIcons name={weather.icon as any} size={72} color={colors.primary} />
              <Text style={[styles.bigTemp, { color: colors.foreground }]}>{weather.temp}°C</Text>
              <Text style={[styles.description, { color: colors.mutedForeground }]}>{weather.description}</Text>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
              <StatCard
                icon="thermometer"
                iconColor={colors.primary}
                value={`${weather.feelsLike}°C`}
                label="Feels like"
                colors={colors}
              />
              <StatCard
                icon="water-percent"
                iconColor="#3b82f6"
                value={`${weather.humidity}%`}
                label="Humidity"
                colors={colors}
              />
              <StatCard
                icon="weather-windy"
                iconColor="#64748b"
                value={`${weather.windSpeed} km/h`}
                label="Wind"
                colors={colors}
              />
            </View>

            {/* Hourly */}
            {weather.hourly.length > 0 && (
              <View>
                <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
                  HOURLY FORECAST
                </Text>
                <View style={styles.hourlyRow}>
                  {weather.hourly.map((h, i) => (
                    <View
                      key={i}
                      style={[styles.hourlyCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                    >
                      <Text style={[styles.hourlyTime, { color: colors.mutedForeground }]}>{h.time}</Text>
                      <MaterialCommunityIcons name={h.icon as any} size={22} color={colors.primary} />
                      <Text style={[styles.hourlyTemp, { color: colors.foreground }]}>{h.temp}°</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <Text style={[styles.poweredBy, { color: colors.mutedForeground }]}>
              Powered by Open-Meteo · Updates every 30 min
            </Text>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
};

// ── Sub-component ────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: string;
  iconColor: string;
  value: string;
  label: string;
  colors: any;
}

const StatCard = ({ icon, iconColor, value, label, colors }: StatCardProps) => (
  <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
    <MaterialCommunityIcons name={icon as any} size={26} color={iconColor} />
    <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
    <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
  </View>
);

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: { fontSize: 18, fontWeight: '700' },
  subtitle: { fontSize: 12, marginTop: 2 },
  content: { padding: 20, gap: 20 },
  hero: {
    alignItems: 'center',
    paddingVertical: 28,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  bigTemp: { fontSize: 52, fontWeight: '700', lineHeight: 60 },
  description: { fontSize: 15, marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  statValue: { fontSize: 16, fontWeight: '700' },
  statLabel: { fontSize: 11, fontWeight: '500' },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10,
  },
  hourlyRow: { flexDirection: 'row', gap: 8 },
  hourlyCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  hourlyTime: { fontSize: 10, fontWeight: '600' },
  hourlyTemp: { fontSize: 13, fontWeight: '700' },
  poweredBy: { fontSize: 11, textAlign: 'center', marginTop: 4 },
});

export default WeatherModal;
