import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { servicesService, Service } from '../services/servicesService';

interface ServiceDetailScreenProps {
  serviceId: string;
  onBack: () => void;
}

const ServiceDetailScreen = ({ serviceId, onBack }: ServiceDetailScreenProps) => {
  const { colors } = useTheme();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    servicesService.getById(serviceId)
      .then(setService)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [serviceId]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!service) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Ionicons name="briefcase-outline" size={48} color={colors.mutedForeground} />
        <Text style={{ color: colors.mutedForeground }}>Service not found.</Text>
      </View>
    );
  }

  const title = service.name ?? service.title ?? 'Service';
  const coverImage = service.displayUrl ?? service.pictures?.[0] ?? null;
  const typeLabel = typeof service.serviceType === 'object'
    ? service.serviceType?.name
    : service.serviceType ?? null;

  const contactItems = [
    service.phone   && { icon: 'call-outline'   as const, label: service.phone,   action: () => Linking.openURL(`tel:${service.phone}`) },
    service.email   && { icon: 'mail-outline'   as const, label: service.email,   action: () => Linking.openURL(`mailto:${service.email}`) },
    service.website && { icon: 'globe-outline'  as const, label: service.website, action: () => Linking.openURL(service.website!) },
    (service.address ?? service.location) && {
      icon: 'location-outline' as const,
      label: service.address ?? service.location!,
      action: undefined,
    },
  ].filter(Boolean) as { icon: any; label: string; action?: () => void }[];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>

        {/* Cover */}
        <View style={styles.cover}>
          {coverImage ? (
            <Image source={{ uri: coverImage }} style={styles.coverImage} />
          ) : (
            <View style={[styles.coverImage, { backgroundColor: colors.muted, alignItems: 'center', justifyContent: 'center' }]}>
              <Ionicons name="briefcase-outline" size={60} color={colors.mutedForeground} />
            </View>
          )}
          <View style={styles.coverOverlay} />
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Ionicons name="arrow-back" size={20} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.body}>

          {typeLabel ? (
            <View style={[styles.badge, { backgroundColor: '#8b5cf6' + '1A' }]}>
              <Text style={[styles.badgeText, { color: '#8b5cf6' }]}>{typeLabel}</Text>
            </View>
          ) : null}

          <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>

          {service.price ? (
            <View style={styles.metaRow}>
              <Ionicons name="pricetag-outline" size={16} color={colors.primary} />
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                {typeof service.price === 'number' ? `€${service.price}` : service.price}
              </Text>
            </View>
          ) : null}

          {service.description ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>About</Text>
              <Text style={[styles.description, { color: colors.mutedForeground }]}>
                {service.description}
              </Text>
            </View>
          ) : null}

          {contactItems.length > 0 ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Contact</Text>
              <View style={[styles.contactCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {contactItems.map((item, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={item.action}
                    disabled={!item.action}
                    style={[
                      styles.contactRow,
                      { borderBottomColor: colors.border },
                      i === contactItems.length - 1 && { borderBottomWidth: 0 },
                    ]}
                  >
                    <View style={[styles.contactIcon, { backgroundColor: colors.primary + '1A' }]}>
                      <Ionicons name={item.icon} size={16} color={colors.primary} />
                    </View>
                    <Text style={[styles.contactText, { color: item.action ? colors.primary : colors.foreground }]}>
                      {item.label}
                    </Text>
                    {item.action ? (
                      <Ionicons name="chevron-forward" size={14} color={colors.mutedForeground} />
                    ) : null}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  cover: { position: 'relative', height: 260 },
  coverImage: { width: '100%', height: '100%' },
  coverOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.15)' },
  backBtn: {
    position: 'absolute', top: 48, left: 16,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center', justifyContent: 'center',
  },
  body: { padding: 20, gap: 14 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  title: { fontSize: 22, fontWeight: '800', lineHeight: 30 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaText: { fontSize: 14 },
  section: { gap: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  description: { fontSize: 14, lineHeight: 22 },
  contactCard: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  contactRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 14, paddingVertical: 13, borderBottomWidth: 1,
  },
  contactIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  contactText: { flex: 1, fontSize: 14 },
});

export default ServiceDetailScreen;
