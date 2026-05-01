import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import type { User } from '../types/user.types';
import { usersService } from '../services/usersService';

interface UserProfileScreenProps {
  userId: string;
  onBack: () => void;
}

const UserProfileScreen = ({ userId, onBack }: UserProfileScreenProps) => {
  const { colors } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const u = await usersService.getById(userId);
        if (!cancelled) setUser(u);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Could not load profile.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Member</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="person-outline" size={48} color={colors.mutedForeground} />
          <Text style={{ color: colors.mutedForeground, textAlign: 'center', paddingHorizontal: 24 }}>
            {error}
          </Text>
        </View>
      ) : user ? (
        <ScrollView contentContainerStyle={styles.body}>
          <View style={[styles.avatar, { backgroundColor: colors.primary + '1A', borderColor: colors.primary + '40' }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>
              {(user.username ?? user.name ?? '?').slice(0, 2).toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.name, { color: colors.foreground }]}>
            {user.name ?? user.username}
          </Text>
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>@{user.username}</Text>
          {user.email ? (
            <View style={styles.row}>
              <Ionicons name="mail-outline" size={18} color={colors.primary} />
              <Text style={[styles.rowText, { color: colors.foreground }]}>{user.email}</Text>
            </View>
          ) : null}
          <View style={styles.row}>
            <Ionicons name="shield-checkmark-outline" size={18} color={colors.mutedForeground} />
            <Text style={[styles.rowText, { color: colors.mutedForeground }]}>
              {user.type === 'GM' ? 'Group Manager' : user.type}
            </Text>
          </View>
        </ScrollView>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  body: { padding: 24, alignItems: 'center', gap: 8 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    marginBottom: 8,
  },
  avatarText: { fontSize: 28, fontWeight: '800' },
  name: { fontSize: 22, fontWeight: '800', marginTop: 4 },
  meta: { fontSize: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12, alignSelf: 'stretch', paddingHorizontal: 8 },
  rowText: { fontSize: 15, flex: 1 },
});

export default UserProfileScreen;
