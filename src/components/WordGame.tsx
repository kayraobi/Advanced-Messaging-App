import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;

type TileState = 'correct' | 'present' | 'absent' | 'empty' | 'active';

interface WordEntry {
  word: string;
  hint: string;
  description: string;
}

interface Category {
  id: string;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  words: WordEntry[];
}

const CATEGORIES: Category[] = [
  {
    id: 'food',
    label: 'Food & Drinks',
    icon: 'restaurant-outline',
    color: '#f97316',
    words: [
      { word: 'CEVAP', hint: 'Sarajevo\'s iconic street food', description: 'Tiny grilled minced-meat sausages served in a somun bread with onions. The #1 thing to eat in Sarajevo.' },
      { word: 'BUREK', hint: 'Flaky pastry with savoury filling', description: 'Layers of thin dough filled with meat or cheese, baked in a spiral. A Bosnian breakfast staple.' },
      { word: 'SOMUN', hint: 'The bread that comes with ćevapi', description: 'A fluffy, slightly charred flatbread baked in a wood-fired oven — the perfect vessel for ćevapi.' },
      { word: 'DOLMA', hint: 'Stuffed vegetables, Balkan style', description: 'Peppers or vine leaves filled with spiced minced meat and rice, slow-cooked in tomato sauce.' },
      { word: 'AJVAR', hint: 'Red pepper spread from the Balkans', description: 'A roasted red pepper and eggplant relish — smoky, rich, and eaten on everything from bread to grilled meat.' },
      { word: 'HALVA', hint: 'Sweet sesame or semolina dessert', description: 'A dense, crumbly Middle Eastern sweet brought to Bosnia via the Ottoman Empire — found in every baščaršija shop.' },
      { word: 'PILAV', hint: 'Bosnian rice dish', description: 'Rice cooked in meat broth, often served alongside a stew. The Bosnian version is richer than plain rice.' },
    ],
  },
  {
    id: 'places',
    label: 'Places',
    icon: 'location-outline',
    color: '#10b981',
    words: [
      { word: 'BAZAR', hint: 'The old market district of Sarajevo', description: 'Baščaršija — the Ottoman-era bazaar at the heart of Sarajevo, full of copper craftsmen, tea houses, and mosques.' },
      { word: 'LATIN', hint: 'The bridge where WWI began', description: 'Latin Bridge — the site of Archduke Franz Ferdinand\'s assassination in 1914, triggering the First World War.' },
      { word: 'PLAZA', hint: 'An open public square', description: 'Sarajevo\'s city centre has several open squares used for markets, concerts, and daily life year-round.' },
      { word: 'TOWER', hint: 'Sahat kula — tells time the old way', description: 'The 17th-century Ottoman clock tower near Baščaršija uses lunar hours — one of the last in the world to do so.' },
      { word: 'TRAMS', hint: 'Oldest public transport in Sarajevo', description: 'Sarajevo\'s tram network dates to 1885, making it one of the oldest in Europe still in daily operation.' },
      { word: 'HILLS', hint: 'Sarajevo is completely surrounded by these', description: 'The city sits in a narrow valley ringed by forested mountains — beautiful in summer, used as ski slopes in winter.' },
      { word: 'CABLE', hint: 'Rides up Mount Trebević', description: 'The Trebević cable car was destroyed in the 1990s war and fully restored in 2018. Stunning panoramic views.' },
    ],
  },
  {
    id: 'history',
    label: 'History',
    icon: 'time-outline',
    color: '#6366f1',
    words: [
      { word: 'SIEGE', hint: 'Sarajevo endured the longest one in modern history', description: 'The Siege of Sarajevo (1992–1996) lasted 1,425 days — longer than the Siege of Leningrad in WWII.' },
      { word: 'PEACE', hint: 'What the Dayton Agreement brought', description: 'The Dayton Peace Agreement (1995) ended the Bosnian War and divided the country into two entities.' },
      { word: 'RUINS', hint: 'What war leaves behind', description: 'Bullet-scarred buildings still visible across Sarajevo serve as a reminder of the 1990s conflict.' },
      { word: 'FRANZ', hint: 'The archduke whose death started WWI', description: 'Archduke Franz Ferdinand was assassinated on Sarajevo\'s Latin Bridge on June 28, 1914.' },
      { word: 'FRONT', hint: 'The battle line during a conflict', description: 'During the 1992–95 siege, the front lines ran directly through city neighbourhoods, dividing families.' },
      { word: 'TRUCE', hint: 'A temporary halt in fighting', description: 'Multiple ceasefires were attempted during the Bosnian War before the final peace deal was reached.' },
      { word: 'VAULT', hint: 'Underground storage or shelter', description: 'The Tunnel of Hope — a hand-dug underground passage — was Sarajevo\'s lifeline during the siege for food and fuel.' },
    ],
  },
  {
    id: 'expat',
    label: 'Expat Life',
    icon: 'earth-outline',
    color: '#3b82f6',
    words: [
      { word: 'EXPAT', hint: 'Someone living outside their home country', description: 'Short for expatriate — someone who has relocated abroad, either temporarily or permanently.' },
      { word: 'LEASE', hint: 'What you sign to rent an apartment', description: 'Finding a good long-term lease in Sarajevo is competitive — the market is small and landlords prefer expats.' },
      { word: 'LOCAL', hint: 'A person from the place you moved to', description: 'Building friendships with locals is the fastest way to feel at home in Sarajevo — and to find the best ćevapi spots.' },
      { word: 'TAXIS', hint: 'How you get around before learning the trams', description: 'Sarajevo taxis are affordable by Western standards — but always agree on the price or use the meter first.' },
      { word: 'TOURS', hint: 'How newcomers discover a city', description: 'Sarajevo has excellent war history and food tours — a great way to understand the city before you settle in.' },
      { word: 'BANKS', hint: 'Where you sort out your finances', description: 'Opening a bank account in Bosnia as a foreigner requires patience — bring every document you own, twice.' },
      { word: 'VISAS', hint: 'What lets you stay in a country', description: 'EU citizens can stay in Bosnia up to 90 days without a visa. Longer stays require a temporary residence permit.' },
    ],
  },
  {
    id: 'culture',
    label: 'Culture',
    icon: 'musical-notes-outline',
    color: '#ec4899',
    words: [
      { word: 'MUSIC', hint: 'Sevdalinka is Sarajevo\'s soul', description: 'Sevdalinka is a traditional Bosnian genre — deeply emotional, Ottoman-influenced folk music about love and longing.' },
      { word: 'CRAFT', hint: 'What Baščaršija artisans produce', description: 'Copper engraving, filigree jewellery, and leather goods — handmade crafts sold in the old bazaar for centuries.' },
      { word: 'MURAL', hint: 'Street art painted on a wall', description: 'Sarajevo\'s streets are covered in murals and graffiti — a visual diary of the city\'s trauma, resilience, and humour.' },
      { word: 'FILMS', hint: 'Sarajevo hosts a famous summer festival for these', description: 'The Sarajevo Film Festival (August) is the biggest in Southeast Europe, drawing directors and stars from around the world.' },
      { word: 'DANCE', hint: 'The kolo is a Balkan version of this', description: 'The kolo is a traditional circle dance performed at weddings and festivals across Bosnia and the Balkans.' },
      { word: 'CHOIR', hint: 'Group of singers performing together', description: 'Choral music thrives in Sarajevo — both sacred and secular traditions have centuries of history in the city.' },
      { word: 'BOOKS', hint: 'Sarajevo has a famous library rebuilt after war', description: 'The Vijećnica — Sarajevo\'s stunning Austro-Hungarian city hall — was a library burnt in 1992 and restored in 2014.' },
    ],
  },
];

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫'],
];

function pickRandom(words: WordEntry[], exclude?: string): WordEntry {
  const pool = exclude ? words.filter((w) => w.word !== exclude) : words;
  return pool[Math.floor(Math.random() * pool.length)];
}

function evaluateGuess(guess: string, target: string): TileState[] {
  const result: TileState[] = Array(WORD_LENGTH).fill('absent');
  const targetArr = target.split('');
  const used = Array(WORD_LENGTH).fill(false);
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guess[i] === targetArr[i]) { result[i] = 'correct'; used[i] = true; }
  }
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (result[i] === 'correct') continue;
    const j = targetArr.findIndex((c, idx) => c === guess[i] && !used[idx]);
    if (j !== -1) { result[i] = 'present'; used[j] = true; }
  }
  return result;
}

export default function WordGame() {
  const { colors } = useTheme();
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);
  const [entry, setEntry] = useState<WordEntry | null>(null);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [results, setResults] = useState<TileState[][]>([]);
  const [current, setCurrent] = useState('');
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  const [keyStates, setKeyStates] = useState<Record<string, TileState>>({});
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  const startGame = useCallback((cat: Category) => {
    const e = pickRandom(cat.words);
    setSelectedCat(cat);
    setEntry(e);
    setGuesses([]);
    setResults([]);
    setCurrent('');
    setGameState('playing');
    setKeyStates({});
  }, []);

  const nextWord = useCallback(() => {
    if (!selectedCat || !entry) return;
    const e = pickRandom(selectedCat.words, entry.word);
    setEntry(e);
    setGuesses([]);
    setResults([]);
    setCurrent('');
    setGameState('playing');
    setKeyStates({});
  }, [selectedCat, entry]);

  const press = useCallback((key: string) => {
    if (gameState !== 'playing' || !entry) return;
    if (key === '⌫') { setCurrent((c) => c.slice(0, -1)); return; }
    if (key === 'ENTER') {
      if (current.length < WORD_LENGTH) { shake(); return; }
      const res = evaluateGuess(current, entry.word);
      const newGuesses = [...guesses, current];
      const newResults = [...results, res];
      setGuesses(newGuesses);
      setResults(newResults);
      setKeyStates((prev) => {
        const next = { ...prev };
        current.split('').forEach((ch, i) => {
          const r = res[i];
          if (r === 'correct') next[ch] = 'correct';
          else if (r === 'present' && next[ch] !== 'correct') next[ch] = 'present';
          else if (!next[ch]) next[ch] = 'absent';
        });
        return next;
      });
      if (current === entry.word) setGameState('won');
      else if (newGuesses.length >= MAX_GUESSES) setGameState('lost');
      setCurrent('');
      return;
    }
    if (current.length < WORD_LENGTH) setCurrent((c) => c + key);
  }, [current, entry, gameState, guesses, results, shake]);

  // Category picker
  if (!selectedCat) {
    return (
      <View style={styles.root}>
        <Text style={[styles.catTitle, { color: colors.foreground }]}>Choose a category</Text>
        <Text style={[styles.catSub, { color: colors.mutedForeground }]}>
          Pick a theme — the hint is always shown so you know what you're guessing.
        </Text>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.catCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => startGame(cat)}
            activeOpacity={0.85}
          >
            <View style={[styles.catIcon, { backgroundColor: cat.color + '18' }]}>
              <Ionicons name={cat.icon} size={24} color={cat.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.catLabel, { color: colors.foreground }]}>{cat.label}</Text>
              <Text style={[styles.catCount, { color: colors.mutedForeground }]}>
                {cat.words.length} words
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  const accentColor = selectedCat.color;
  const activeRow = guesses.length;

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.topRow}>
        <TouchableOpacity onPress={() => setSelectedCat(null)} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={20} color={colors.foreground} />
          <Text style={[styles.backText, { color: colors.foreground }]}>Categories</Text>
        </TouchableOpacity>
        <View style={[styles.catBadge, { backgroundColor: accentColor + '18' }]}>
          <Ionicons name={selectedCat.icon} size={13} color={accentColor} />
          <Text style={[styles.catBadgeText, { color: accentColor }]}>{selectedCat.label}</Text>
        </View>
      </View>

      {/* Hint — always visible */}
      {entry && (
        <View style={[styles.hintBox, { backgroundColor: accentColor + '12', borderColor: accentColor + '35' }]}>
          <View style={styles.hintHeader}>
            <Ionicons name="bulb-outline" size={14} color={accentColor} />
            <Text style={[styles.hintLabel, { color: accentColor }]}>Hint</Text>
          </View>
          <Text style={[styles.hintTitle, { color: colors.foreground }]}>{entry.hint}</Text>
          <Text style={[styles.hintDesc, { color: colors.mutedForeground }]}>{entry.description}</Text>
        </View>
      )}

      {/* Grid */}
      <View style={styles.grid}>
        {Array.from({ length: MAX_GUESSES }).map((_, row) => {
          const guess = row < guesses.length ? guesses[row] : row === activeRow ? current : '';
          const rowResult = row < results.length ? results[row] : null;
          const isActive = row === activeRow && gameState === 'playing';
          return (
            <Animated.View
              key={row}
              style={[styles.gridRow, isActive && { transform: [{ translateX: shakeAnim }] }]}
            >
              {Array.from({ length: WORD_LENGTH }).map((_, col) => {
                const letter = guess[col] ?? '';
                const state: TileState = rowResult ? rowResult[col] : letter ? 'active' : 'empty';
                const bg = rowResult
                  ? state === 'correct' ? '#22c55e' : state === 'present' ? '#f59e0b' : '#6b7280'
                  : 'transparent';
                const borderColor = rowResult ? bg : letter ? accentColor : colors.border;
                return (
                  <View
                    key={col}
                    style={[styles.tile, { backgroundColor: bg, borderColor, borderWidth: rowResult ? 0 : 2 }]}
                  >
                    <Text style={[styles.tileLetter, { color: rowResult ? '#fff' : colors.foreground }]}>
                      {letter}
                    </Text>
                  </View>
                );
              })}
            </Animated.View>
          );
        })}
      </View>

      {/* Game over */}
      {gameState !== 'playing' && entry && (
        <View style={[styles.banner, {
          backgroundColor: gameState === 'won' ? '#22c55e12' : '#ef444412',
          borderColor: gameState === 'won' ? '#22c55e' : '#ef4444',
        }]}>
          <Text style={[styles.bannerTitle, { color: gameState === 'won' ? '#22c55e' : '#ef4444' }]}>
            {gameState === 'won' ? `🎉 Correct! It was ${entry.word}` : `The word was ${entry.word}`}
          </Text>
          <View style={styles.bannerBtns}>
            <TouchableOpacity
              style={[styles.bannerBtn, { backgroundColor: accentColor }]}
              onPress={nextWord}
            >
              <Text style={styles.bannerBtnText}>Next word</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bannerBtn, { backgroundColor: colors.muted }]}
              onPress={() => setSelectedCat(null)}
            >
              <Text style={[styles.bannerBtnText, { color: colors.foreground }]}>Categories</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Keyboard */}
      <View style={styles.keyboard}>
        {KEYBOARD_ROWS.map((row, ri) => (
          <View key={ri} style={styles.kbRow}>
            {row.map((key) => {
              const ks = keyStates[key];
              const bg = ks === 'correct' ? '#22c55e' : ks === 'present' ? '#f59e0b' : ks === 'absent' ? '#374151' : colors.muted;
              const fg = ks ? '#fff' : colors.foreground;
              const isWide = key === 'ENTER' || key === '⌫';
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.key, { backgroundColor: bg }, isWide && styles.wideKey]}
                  onPress={() => press(key)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.keyText, { color: fg }, isWide && { fontSize: 11 }]}>{key}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 14, paddingTop: 8, paddingBottom: 12 },
  // Category picker
  catTitle: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  catSub: { fontSize: 13, lineHeight: 18, marginBottom: 16 },
  catCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  catIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  catLabel: { fontSize: 15, fontWeight: '700' },
  catCount: { fontSize: 12, marginTop: 2 },
  // Game
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  backText: { fontSize: 14, fontWeight: '600' },
  catBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  catBadgeText: { fontSize: 12, fontWeight: '600' },
  hintBox: { borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 12, gap: 3 },
  hintHeader: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  hintLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  hintTitle: { fontSize: 14, fontWeight: '700' },
  hintDesc: { fontSize: 12, lineHeight: 17 },
  grid: { alignItems: 'center', gap: 4, marginBottom: 10 },
  gridRow: { flexDirection: 'row', gap: 4 },
  tile: { width: 52, height: 52, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  tileLetter: { fontSize: 18, fontWeight: '800' },
  banner: { borderRadius: 12, borderWidth: 1.5, padding: 12, marginBottom: 10, gap: 8 },
  bannerTitle: { fontSize: 15, fontWeight: '700', textAlign: 'center' },
  bannerBtns: { flexDirection: 'row', gap: 8 },
  bannerBtn: { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: 'center' },
  bannerBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  keyboard: { gap: 5 },
  kbRow: { flexDirection: 'row', justifyContent: 'center', gap: 4 },
  key: { width: 32, height: 42, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  wideKey: { width: 48 },
  keyText: { fontSize: 13, fontWeight: '700' },
});
