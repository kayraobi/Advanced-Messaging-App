import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import SnakeGame from './SnakeGame';
import WordGame from './WordGame';

type Game = 'snake' | 'word' | null;

interface Props {
  visible: boolean;
  onClose: () => void;
}

const GAMES = [
  {
    id: 'snake' as Game,
    icon: 'game-controller-outline' as const,
    title: 'Snake',
    desc: 'Classic snake — swipe or use arrows to eat and grow.',
    color: '#f97316',
  },
  {
    id: 'word' as Game,
    icon: 'keypad-outline' as const,
    title: 'Word Game',
    desc: 'Guess the 5-letter word in 6 tries. Sarajevo-themed hints!',
    color: '#6366f1',
  },
];

export default function GamesModal({ visible, onClose }: Props) {
  const { colors } = useTheme();
  const [activeGame, setActiveGame] = useState<Game>(null);

  const activeEntry = GAMES.find((g) => g.id === activeGame);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => {
        if (activeGame) setActiveGame(null);
        else onClose();
      }}
    >
      <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          {activeGame ? (
            <TouchableOpacity onPress={() => setActiveGame(null)} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={22} color={colors.foreground} />
            </TouchableOpacity>
          ) : (
            <View style={styles.backBtn} />
          )}
          <View style={styles.headerCenter}>
            {activeEntry ? (
              <>
                <Ionicons name={activeEntry.icon} size={20} color={activeEntry.color} />
                <Text style={[styles.headerTitle, { color: colors.foreground }]}>{activeEntry.title}</Text>
              </>
            ) : (
              <>
                <Ionicons name="game-controller-outline" size={20} color={colors.foreground} />
                <Text style={[styles.headerTitle, { color: colors.foreground }]}>Games</Text>
              </>
            )}
          </View>
          <TouchableOpacity
            onPress={() => { setActiveGame(null); onClose(); }}
            style={styles.closeBtn}
          >
            <Ionicons name="close" size={24} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        {!activeGame ? (
          <ScrollView contentContainerStyle={styles.lobbyContent}>
            <Text style={[styles.lobbySubtitle, { color: colors.mutedForeground }]}>
              Pick a game to play
            </Text>
            {GAMES.map((game) => (
              <TouchableOpacity
                key={game.id}
                style={[styles.gameCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => setActiveGame(game.id)}
                activeOpacity={0.85}
              >
                <View style={[styles.gameCardIcon, { backgroundColor: game.color + '1A' }]}>
                  <Ionicons name={game.icon} size={28} color={game.color} />
                </View>
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={[styles.gameCardTitle, { color: colors.foreground }]}>{game.title}</Text>
                  <Text style={[styles.gameCardDesc, { color: colors.mutedForeground }]}>{game.desc}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : activeGame === 'snake' ? (
          <ScrollView>
            <SnakeGame />
          </ScrollView>
        ) : (
          <ScrollView keyboardShouldPersistTaps="handled">
            <WordGame />
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: { width: 36, alignItems: 'flex-start' },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  headerEmoji: { fontSize: 18 },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  closeBtn: { width: 36, alignItems: 'flex-end' },
  lobbyContent: { padding: 20, gap: 14 },
  lobbySubtitle: { fontSize: 13, marginBottom: 4 },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  gameCardIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameCardTitle: { fontSize: 16, fontWeight: '700' },
  gameCardDesc: { fontSize: 13, lineHeight: 18 },
});
