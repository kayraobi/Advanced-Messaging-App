import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface ScreenHeaderProps {
  title: string;
  onBack: () => void;
  right?: React.ReactNode;
}

/**
 * Reusable header for stack screens.
 * Automatically handles notch / Dynamic Island via useSafeAreaInsets.
 */
const ScreenHeader = ({ title, onBack, right }: ScreenHeaderProps) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
          paddingTop: insets.top + 10,
        },
      ]}
    >
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Ionicons name="chevron-back" size={22} color={colors.foreground} />
      </TouchableOpacity>
      <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
        {title}
      </Text>
      {/* Sağ alan: aksion butonu varsa göster, yoksa boş bırak (hizalama için) */}
      <View style={styles.right}>{right ?? null}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingBottom: 12,
    gap: 10,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  right: {
    width: 36,
    alignItems: 'flex-end',
  },
});

export default ScreenHeader;
