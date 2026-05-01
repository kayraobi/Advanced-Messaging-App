import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { sponsorsService, Sponsor } from '../services/sponsorsService';

interface SponsorDetailScreenProps {
  sponsorId: string;
  onBack: () => void;
}

const sponsorImage = (s: Sponsor) =>
  (s.logo ?? s.displayUrl ?? s.image ?? null) as string | null;

const sponsorLink = (s: Sponsor) =>
  (s.website ?? s.url ?? s.link ?? '') as string;

const SponsorDetailScreen = ({ sponsorId, onBack }: SponsorDetailScreenProps) => {
  const { colors } = useTheme();
  const [sponsor, setSponsor] = useState<Sponsor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sponsorsService
      .getById(sponsorId)
      .then(setSponsor)
      .catch(() => setSponsor(null))
      .finally(() => setLoading(false));
  }, [sponsorId]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!sponsor) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.mutedForeground }}>Sponsor not found.</Text>
        <TouchableOpacity onPress={onBack} style={{ marginTop: 16 }}>
          <Text style={{ color: colors.primary, fontWeight: '700' }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const title = (sponsor.name ?? sponsor.title ?? 'Sponsor') as string;
  const img = sponsorImage(sponsor);
  const link = sponsorLink(sponsor).trim();
  const desc = (sponsor.description ?? '') as string;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>
          {title}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {img ? (
          <Image source={{ uri: img }} style={[styles.logo, { backgroundColor: colors.muted }]} resizeMode="contain" />
        ) : (
          <View style={[styles.logoPlaceholder, { backgroundColor: colors.muted }]}>
            <Ionicons name="ribbon-outline" size={48} color={colors.mutedForeground} />
          </View>
        )}

        <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>

        {desc ? (
          <Text style={[styles.desc, { color: colors.mutedForeground }]}>{desc}</Text>
        ) : null}

        {link ? (
          <TouchableOpacity
            style={[styles.linkBtn, { backgroundColor: colors.primary }]}
            onPress={() => Linking.openURL(link.startsWith('http') ? link : `https://${link}`)}
          >
            <Ionicons name="open-outline" size={18} color="#fff" />
            <Text style={styles.linkBtnText}>Visit website</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700' },
  body: { padding: 20, paddingBottom: 48, alignItems: 'center', gap: 16 },
  logo: { width: 200, height: 120, borderRadius: 12 },
  logoPlaceholder: {
    width: 200,
    height: 120,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  desc: { fontSize: 15, lineHeight: 22, textAlign: 'center' },
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  linkBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default SponsorDetailScreen;
