import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

const allInterests = ['Sports', 'Culture', 'Food & Drink', 'Tech', 'Networking', 'Music', 'Travel', 'Volunteering'];

interface ProfileScreenProps {
  onMyEvents: () => void;
  onSettings: () => void;
  onFAQ: () => void;
  onLogout: () => void;
}

const ProfileScreen = ({ onMyEvents, onSettings, onFAQ, onLogout }: ProfileScreenProps) => {
  const { colors } = useTheme();
  const [showInterests, setShowInterests] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Sports', 'Food & Drink']);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const menuItems = [
    {
      icon: 'calendar-clear-outline' as const,
      label: 'My Events',
      onPress: onMyEvents,
      danger: false,
    },
    {
      icon: 'settings-outline' as const,
      label: 'App Settings',
      onPress: onSettings,
      danger: false,
    },
    {
      icon: 'help-circle-outline' as const,
      label: 'FAQ',
      onPress: onFAQ,
      danger: false,
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
          <Text style={[styles.avatarText, { color: colors.primary }]}>TT</Text>
        </View>
        <Text style={[styles.name, { color: colors.foreground }]}>Taylan Taşkın</Text>
        <Text style={[styles.role, { color: colors.mutedForeground }]}>Member</Text>
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
              onPress={() => {
                Alert.alert('Preferences saved!', `${selectedInterests.length} interests selected.`);
                setShowInterests(false);
              }}
            >
              <Text style={styles.saveBtnText}>Save Preferences</Text>
            </TouchableOpacity>
          </View>
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
});

export default ProfileScreen;
