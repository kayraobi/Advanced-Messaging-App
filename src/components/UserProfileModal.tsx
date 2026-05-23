import React from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import type { ProfilePreview } from '../hooks/useUserProfile';

interface Props {
  visible: boolean;
  onClose: () => void;
  profilePreview: ProfilePreview | null;
  profileLoading: boolean;
  colors: Record<string, string>;
}

const UserProfileModal: React.FC<Props> = ({
  visible,
  onClose,
  profilePreview,
  profileLoading,
  colors,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={[styles.sheet, { backgroundColor: colors.card }]}
          onPress={() => {}}
        >
          {/* Handle bar */}
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          {profilePreview && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 24 }}
            >
              {/* Avatar */}
              <View style={styles.avatarWrap}>
                {profilePreview.user?.displayUrl ? (
                  <Image
                    source={{ uri: profilePreview.user.displayUrl }}
                    style={styles.avatar}
                  />
                ) : (
                  <View
                    style={[
                      styles.avatarPlaceholder,
                      { backgroundColor: colors.primary + '22' },
                    ]}
                  >
                    <Text style={[styles.avatarInitials, { color: colors.primary }]}>
                      {profilePreview.initials}
                    </Text>
                  </View>
                )}
              </View>

              {/* Name */}
              <Text style={[styles.name, { color: colors.foreground }]}>
                {profilePreview.user?.name ?? profilePreview.senderName}
              </Text>
              <Text style={[styles.username, { color: colors.mutedForeground }]}>
                @{profilePreview.user?.username ?? profilePreview.senderName}
              </Text>

              {/* Role badge */}
              {profilePreview.user?.type && profilePreview.user.type !== 'user' && (
                <View style={[styles.badge, { backgroundColor: colors.primary + '18' }]}>
                  <Text style={[styles.badgeText, { color: colors.primary }]}>
                    {profilePreview.user.type}
                  </Text>
                </View>
              )}

              {/* Loading spinner */}
              {profileLoading && (
                <ActivityIndicator
                  size="small"
                  color={colors.primary}
                  style={{ marginTop: 16 }}
                />
              )}

              {/* Interests */}
              {!profileLoading &&
                profilePreview.user?.interests &&
                profilePreview.user.interests.length > 0 && (
                  <View style={styles.interestsSection}>
                    <Text style={[styles.interestsLabel, { color: colors.mutedForeground }]}>
                      Interests
                    </Text>
                    <View style={styles.interestsTags}>
                      {profilePreview.user.interests.map((tag, i) => (
                        <View
                          key={i}
                          style={[
                            styles.interestTag,
                            {
                              backgroundColor: colors.primary + '15',
                              borderColor: colors.primary + '30',
                            },
                          ]}
                        >
                          <Text style={[styles.interestTagText, { color: colors.primary }]}>
                            {tag}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
            </ScrollView>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: '75%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  avatarWrap: { alignItems: 'center', marginBottom: 12 },
  avatar: { width: 88, height: 88, borderRadius: 44 },
  avatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: { fontSize: 28, fontWeight: '700' },
  name: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  username: { fontSize: 14, textAlign: 'center', marginTop: 2, marginBottom: 8 },
  badge: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 16,
  },
  badgeText: { fontSize: 12, fontWeight: '600' },
  interestsSection: { marginTop: 16 },
  interestsLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  interestsTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  interestTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  interestTagText: { fontSize: 13, fontWeight: '500' },
});

export default UserProfileModal;
