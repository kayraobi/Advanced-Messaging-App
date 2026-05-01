import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
  FlatList,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { authService } from '../services/authService';
import { realEstateService } from '../services/realEstateService';
import type { RealEstate } from '../services/realEstateService';
import type { User } from '../types/user.types';

const allInterests = ['Sports', 'Culture', 'Food & Drink', 'Tech', 'Networking', 'Music', 'Travel', 'Volunteering'];

interface ProfileScreenProps {
  onMyEvents: () => void;
  onSettings: () => void;
  onFaq: () => void;
  onLogout: () => void;
  /** Opens real-estate detail (`GET /api/realEstate/{id}`) */
  onRealEstatePress?: (id: string) => void;
}

const ProfileScreen = ({
  onMyEvents,
  onSettings,
  onFaq,
  onLogout,
  onRealEstatePress,
}: ProfileScreenProps) => {
  const { colors } = useTheme();
  const [showInterests, setShowInterests] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Sports', 'Food & Drink']);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [interestsSaving, setInterestsSaving] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [showListings, setShowListings] = useState(false);
  const [myListings, setMyListings] = useState<RealEstate[]>([]);
  const [myListingsLoading, setMyListingsLoading] = useState(false);

  const listingTitle = (r: RealEstate) =>
    (r.title ?? r.name ?? (r.description ?? r.content ?? '').split('\n')[0]?.trim()) || 'Listing';
  const listingImage = (r: RealEstate) => r.displayUrl ?? r.pictures?.[0] ?? null;

  useEffect(() => {
    const loadUser = async () => {
      // Önce stored user'ı göster (hızlı)
      const stored = await authService.getStoredUser();
      if (stored) setUser(stored);
      // Sonra API'den güncel veriyi çek
      const fresh = await authService.getMe();
      if (fresh) setUser(fresh);
      setUserLoading(false);
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (!user) return;
    setEditName(user.name ?? user.username ?? '');
    setEditPhone(user.phone ?? '');
    if (user.interests && user.interests.length > 0) {
      setSelectedInterests(user.interests);
    }
  }, [user]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const openMyListings = async () => {
    if (!onRealEstatePress) return;
    if (!user?._id) {
      Alert.alert('Sign in required', 'Log in to see your property listings.');
      return;
    }
    setShowListings(true);
    setMyListingsLoading(true);
    try {
      const rows = await realEstateService.getByUserId(user._id);
      setMyListings(rows);
    } catch (e) {
      Alert.alert(
        'Could not load listings',
        e instanceof Error ? e.message : 'Try again later.',
      );
      setMyListings([]);
    } finally {
      setMyListingsLoading(false);
    }
  };

  const menuItems = [
    {
      icon: 'calendar-clear-outline' as const,
      label: 'My Events',
      onPress: onMyEvents,
    },
    ...(onRealEstatePress
      ? [
          {
            icon: 'home-outline' as const,
            label: 'My listings',
            onPress: openMyListings,
          },
        ]
      : []),
    {
      icon: 'help-circle-outline' as const,
      label: 'FAQ',
      onPress: onFaq,
    },
    {
      icon: 'settings-outline' as const,
      label: 'App Settings',
      onPress: onSettings,
    },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={[styles.avatar, { backgroundColor: colors.primary + '1A', borderColor: colors.primary + '30' }]}>
          {userLoading && !user ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={[styles.avatarText, { color: colors.primary }]}>
              {(user?.username ?? user?.name ?? '?').slice(0, 2).toUpperCase()}
            </Text>
          )}
        </View>
        <Text style={[styles.name, { color: colors.foreground }]}>
          {user?.name ?? user?.username ?? '—'}
        </Text>
        <Text style={[styles.role, { color: colors.mutedForeground }]}>
          {user?.type === 'GM' ? 'Group Manager' : user?.type ?? 'Member'}
        </Text>
        {user?.email ? (
          <Text style={[styles.email, { color: colors.mutedForeground }]}>{user.email}</Text>
        ) : null}
      </View>

      {/* Edit profile */}
      <View style={{ paddingHorizontal: 16, marginBottom: 10 }}>
        <TouchableOpacity
          onPress={() => setShowEditProfile(true)}
          style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={[styles.menuIcon, { backgroundColor: colors.primary + '1A' }]}>
            <Ionicons name="person-outline" size={20} color={colors.primary} />
          </View>
          <Text style={[styles.menuLabel, { color: colors.foreground }]}>Edit profile</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      {/* Menu Items */}
      <View style={styles.menu}>
        {menuItems.map(({ icon, label, onPress }) => (
          <TouchableOpacity
            key={label}
            onPress={onPress}
            style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.menuIcon, { backgroundColor: colors.primary + '1A' }]}>
              <Ionicons name={icon} size={20} color={colors.primary} />
            </View>
            <Text style={[styles.menuLabel, { color: colors.foreground }]}>{label}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        ))}

        {/* Edit Interests */}
        <TouchableOpacity
          onPress={() => setShowInterests(true)}
          style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={[styles.menuIcon, { backgroundColor: colors.primary + '1A' }]}>
            <Ionicons name="heart-outline" size={20} color={colors.primary} />
          </View>
          <Text style={[styles.menuLabel, { color: colors.foreground }]}>Edit Interests</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity
          onPress={() => setShowLogoutConfirm(true)}
          style={[styles.menuItem, styles.logoutItem, { backgroundColor: colors.card, borderColor: '#fca5a5' }]}
        >
          <View style={[styles.menuIcon, { backgroundColor: '#fef2f2' }]}>
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          </View>
          <Text style={[styles.menuLabel, { color: '#ef4444' }]}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Edit profile modal */}
      <Modal
        visible={showEditProfile}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditProfile(false)}
      >
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <View>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Edit profile</Text>
              <Text style={[styles.modalSub, { color: colors.mutedForeground }]}>Update how others see you in the app</Text>
            </View>
            <TouchableOpacity onPress={() => setShowEditProfile(false)}>
              <Ionicons name="close" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>
          <View style={styles.interestsContent}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Display name</Text>
            <TextInput
              value={editName}
              onChangeText={setEditName}
              placeholder="Your name"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.textField, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
            />
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Phone</Text>
            <TextInput
              value={editPhone}
              onChangeText={setEditPhone}
              placeholder="+387 ..."
              placeholderTextColor={colors.mutedForeground}
              keyboardType="phone-pad"
              style={[styles.textField, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
            />
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
              disabled={profileSaving}
              onPress={async () => {
                setProfileSaving(true);
                try {
                  await authService.updateMe({
                    name: editName.trim(),
                    phone: editPhone.trim(),
                  });
                  const fresh = await authService.getMe();
                  if (fresh) setUser(fresh);
                  Alert.alert('Profile updated');
                  setShowEditProfile(false);
                } catch (e) {
                  Alert.alert(
                    'Update failed',
                    e instanceof Error ? e.message : 'PATCH /api/users/me may not be enabled on this server.',
                  );
                } finally {
                  setProfileSaving(false);
                }
              }}
            >
              {profileSaving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Interests Modal */}
      <Modal
        visible={showInterests}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowInterests(false)}
      >
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <View>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Edit Interests</Text>
              <Text style={[styles.modalSub, { color: colors.mutedForeground }]}>Select topics you're interested in</Text>
            </View>
            <TouchableOpacity onPress={() => setShowInterests(false)}>
              <Ionicons name="close" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>
          <View style={styles.interestsContent}>
            <View style={styles.interestChips}>
              {allInterests.map((interest) => {
                const sel = selectedInterests.includes(interest);
                return (
                  <TouchableOpacity
                    key={interest}
                    onPress={() => toggleInterest(interest)}
                    style={[
                      styles.interestChip,
                      sel
                        ? { backgroundColor: colors.primary, borderColor: colors.primary }
                        : { backgroundColor: colors.card, borderColor: colors.border },
                    ]}
                  >
                    <Text style={[styles.interestChipText, { color: sel ? '#fff' : colors.foreground }]}>
                      {interest}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
              disabled={interestsSaving}
              onPress={async () => {
                setInterestsSaving(true);
                try {
                  await authService.updateMyInterests(selectedInterests);
                  const fresh = await authService.getMe();
                  if (fresh) setUser(fresh);
                  Alert.alert('Saved', `${selectedInterests.length} interests synced to your account.`);
                  setShowInterests(false);
                } catch (e) {
                  Alert.alert(
                    'Could not save interests',
                    e instanceof Error ? e.message : 'Check your connection or API configuration.',
                  );
                } finally {
                  setInterestsSaving(false);
                }
              }}
            >
              {interestsSaving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>Save Preferences</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* My real-estate listings (`GET /api/realEstate/user/{userId}`) */}
      <Modal
        visible={showListings}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowListings(false)}
      >
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <View>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>My listings</Text>
              <Text style={[styles.modalSub, { color: colors.mutedForeground }]}>
                Your properties from the server
              </Text>
            </View>
            <TouchableOpacity onPress={() => setShowListings(false)}>
              <Ionicons name="close" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>
          {myListingsLoading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <FlatList
              data={myListings}
              keyExtractor={(item) => item._id}
              contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 12 }}
              ListEmptyComponent={
                <Text style={{ color: colors.mutedForeground, textAlign: 'center', paddingVertical: 24 }}>
                  No listings yet.
                </Text>
              }
              renderItem={({ item }) => {
                const uri = listingImage(item);
                return (
                  <TouchableOpacity
                    onPress={() => {
                      setShowListings(false);
                      onRealEstatePress?.(item._id);
                    }}
                    style={[styles.listingRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                  >
                    {uri ? (
                      <Image source={{ uri }} style={styles.listingThumb} />
                    ) : (
                      <View style={[styles.listingThumb, { backgroundColor: colors.muted, justifyContent: 'center', alignItems: 'center' }]}>
                        <Ionicons name="home-outline" size={28} color={colors.mutedForeground} />
                      </View>
                    )}
                    <View style={{ flex: 1, gap: 4 }}>
                      <Text style={{ color: colors.foreground, fontWeight: '700' }} numberOfLines={2}>
                        {listingTitle(item)}
                      </Text>
                      {item.address || item.location ? (
                        <Text style={{ color: colors.mutedForeground, fontSize: 12 }} numberOfLines={1}>
                          {item.address ?? item.location}
                        </Text>
                      ) : null}
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      </Modal>

      {/* Logout Confirm Modal */}
      <Modal
        visible={showLogoutConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutConfirm(false)}
      >
        <View style={styles.backdrop}>
          <View style={[styles.logoutCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.logoutTitle, { color: colors.foreground }]}>Are you sure you want to log out?</Text>
            <Text style={[styles.logoutDesc, { color: colors.mutedForeground }]}>
              You'll need to sign in again to access your events and chats.
            </Text>
            <View style={styles.logoutBtns}>
              <TouchableOpacity
                style={[styles.logoutCancel, { borderColor: colors.border }]}
                onPress={() => setShowLogoutConfirm(false)}
              >
                <Text style={[styles.logoutCancelText, { color: colors.foreground }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.logoutConfirm}
                onPress={() => { setShowLogoutConfirm(false); onLogout(); }}
              >
                <Text style={styles.logoutConfirmText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  profileHeader: { alignItems: 'center', paddingTop: 40, paddingBottom: 24, paddingHorizontal: 16 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
  avatarText: { fontSize: 28, fontWeight: '800' },
  name: { marginTop: 14, fontSize: 22, fontWeight: '800' },
  role: { marginTop: 4, fontSize: 14 },
  email: { marginTop: 2, fontSize: 12 },
  menu: { paddingHorizontal: 16, gap: 10 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  logoutItem: { marginTop: 14 },
  menuIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '600' },
  modal: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalSub: { fontSize: 12, marginTop: 2 },
  interestsContent: { padding: 20, gap: 20 },
  interestChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  interestChip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  interestChipText: { fontSize: 14, fontWeight: '600' },
  saveBtn: { height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  fieldLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  textField: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', paddingHorizontal: 24 },
  logoutCard: { borderRadius: 20, padding: 24, gap: 12 },
  logoutTitle: { fontSize: 17, fontWeight: '700' },
  logoutDesc: { fontSize: 14, lineHeight: 20 },
  logoutBtns: { flexDirection: 'row', gap: 10, marginTop: 4 },
  logoutCancel: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutCancelText: { fontSize: 15, fontWeight: '600' },
  logoutConfirm: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutConfirmText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  listingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  listingThumb: { width: 72, height: 72, borderRadius: 10 },
});

export default ProfileScreen;
