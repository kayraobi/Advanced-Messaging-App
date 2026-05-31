import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

const COLS = 16;
const ROWS = 14;
const TICK_MS = 200;

type Dir = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Cell = { x: number; y: number };

function randomFood(snake: Cell[]): Cell {
  let cell: Cell;
  do {
    cell = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
  } while (snake.some((s) => s.x === cell.x && s.y === cell.y));
  return cell;
}

const INIT_SNAKE: Cell[] = [
  { x: 8, y: 7 },
  { x: 7, y: 7 },
  { x: 6, y: 7 },
];
const INIT_DIR: Dir = 'RIGHT';
const INIT_FOOD: Cell = { x: 12, y: 7 };

export default function SnakeGame() {
  const { colors } = useTheme();
  const [snake, setSnake] = useState<Cell[]>(INIT_SNAKE);
  const [food, setFood] = useState<Cell>(INIT_FOOD);
  const [dir, setDir] = useState<Dir>(INIT_DIR);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [state, setState] = useState<'idle' | 'running' | 'dead'>('idle');

  const snakeRef = useRef(snake);
  const dirRef = useRef(dir);
  const foodRef = useRef(food);
  const nextDirRef = useRef<Dir>(INIT_DIR);
  const scoreRef = useRef(0);

  snakeRef.current = snake;
  dirRef.current = dir;
  foodRef.current = food;

  const reset = useCallback(() => {
    const s = [...INIT_SNAKE];
    const f = randomFood(s);
    setSnake(s);
    setFood(f);
    setDir(INIT_DIR);
    setScore(0);
    setState('idle');
    nextDirRef.current = INIT_DIR;
    scoreRef.current = 0;
    snakeRef.current = s;
    foodRef.current = f;
  }, []);

  const changeDirRef = useRef<(d: Dir) => void>(() => {});

  const changeDir = useCallback((d: Dir) => {
    const cur = dirRef.current;
    const opp: Record<Dir, Dir> = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
    if (d !== opp[cur]) nextDirRef.current = d;
  }, []);

  changeDirRef.current = changeDir;

  // Swipe handler
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderRelease: (_, g) => {
        const { dx, dy } = g;
        if (Math.abs(dx) > Math.abs(dy)) {
          changeDirRef.current(dx > 0 ? 'RIGHT' : 'LEFT');
        } else {
          changeDirRef.current(dy > 0 ? 'DOWN' : 'UP');
        }
      },
    }),
  ).current;

  useEffect(() => {
    if (state !== 'running') return;

    const interval = setInterval(() => {
      const d = nextDirRef.current;
      const head = snakeRef.current[0];
      const delta: Record<Dir, Cell> = {
        UP: { x: 0, y: -1 },
        DOWN: { x: 0, y: 1 },
        LEFT: { x: -1, y: 0 },
        RIGHT: { x: 1, y: 0 },
      };
      const next = { x: head.x + delta[d].x, y: head.y + delta[d].y };

      // Wall collision
      if (next.x < 0 || next.x >= COLS || next.y < 0 || next.y >= ROWS) {
        setState('dead');
        setBest((b) => Math.max(b, scoreRef.current));
        return;
      }
      // Self collision
      if (snakeRef.current.some((s) => s.x === next.x && s.y === next.y)) {
        setState('dead');
        setBest((b) => Math.max(b, scoreRef.current));
        return;
      }

      const ate = next.x === foodRef.current.x && next.y === foodRef.current.y;
      const newSnake = ate
        ? [next, ...snakeRef.current]
        : [next, ...snakeRef.current.slice(0, -1)];

      if (ate) {
        const newFood = randomFood(newSnake);
        foodRef.current = newFood;
        setFood(newFood);
        scoreRef.current += 1;
        setScore((s) => s + 1);
      }

      setDir(d);
      snakeRef.current = newSnake;
      setSnake([...newSnake]);
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [state]);

  const accentColor = colors.primary ?? '#f97316';

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.title, { color: colors.foreground }]}>🐍 Snake</Text>
          <Text style={[styles.sub, { color: colors.mutedForeground }]}>Swipe or tap arrows</Text>
        </View>
        <View style={styles.scores}>
          <View style={styles.scoreBox}>
            <Text style={[styles.scoreLabel, { color: colors.mutedForeground }]}>Score</Text>
            <Text style={[styles.scoreVal, { color: accentColor }]}>{score}</Text>
          </View>
          <View style={[styles.scoreDivider, { backgroundColor: colors.border }]} />
          <View style={styles.scoreBox}>
            <Text style={[styles.scoreLabel, { color: colors.mutedForeground }]}>Best</Text>
            <Text style={[styles.scoreVal, { color: colors.foreground }]}>{best}</Text>
          </View>
        </View>
      </View>

      {/* Grid */}
      <View
        style={[styles.grid, { backgroundColor: colors.background, borderColor: colors.border }]}
        {...panResponder.panHandlers}
      >
        {Array.from({ length: ROWS }).map((_, row) => (
          <View key={row} style={styles.row}>
            {Array.from({ length: COLS }).map((_, col) => {
              const isHead = snake[0].x === col && snake[0].y === row;
              const isBody = !isHead && snake.slice(1).some((s) => s.x === col && s.y === row);
              const isFood = food.x === col && food.y === row;
              return (
                <View
                  key={col}
                  style={[
                    styles.cell,
                    isHead && { backgroundColor: accentColor, borderRadius: 3 },
                    isBody && { backgroundColor: accentColor + 'BB', borderRadius: 2 },
                    isFood && { backgroundColor: '#ef4444', borderRadius: 99 },
                  ]}
                />
              );
            })}
          </View>
        ))}

        {/* Overlay */}
        {state !== 'running' && (
          <View style={styles.overlay}>
            {state === 'dead' ? (
              <View style={styles.overlayContent}>
                <Text style={styles.overlayEmoji}>💀</Text>
                <Text style={styles.overlayTitle}>Game Over</Text>
                <Text style={styles.overlayScore}>Score: {score}</Text>
                <TouchableOpacity
                  style={[styles.playBtn, { backgroundColor: accentColor }]}
                  onPress={() => { reset(); setState('running'); }}
                >
                  <Text style={styles.playBtnText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.overlayContent}>
                <Text style={styles.overlayEmoji}>🐍</Text>
                <Text style={styles.overlayTitle}>Snake</Text>
                <TouchableOpacity
                  style={[styles.playBtn, { backgroundColor: accentColor }]}
                  onPress={() => setState('running')}
                >
                  <Ionicons name="play" size={16} color="#fff" />
                  <Text style={styles.playBtnText}>Play</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>

      {/* D-pad */}
      <View style={styles.dpad}>
        <TouchableOpacity style={[styles.arrow, { backgroundColor: colors.muted }]} onPress={() => changeDir('UP')}>
          <Ionicons name="chevron-up" size={18} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.dpadRow}>
          <TouchableOpacity style={[styles.arrow, { backgroundColor: colors.muted }]} onPress={() => changeDir('LEFT')}>
            <Ionicons name="chevron-back" size={18} color={colors.foreground} />
          </TouchableOpacity>
          <View style={[styles.arrowCenter, { backgroundColor: colors.muted }]} />
          <TouchableOpacity style={[styles.arrow, { backgroundColor: colors.muted }]} onPress={() => changeDir('RIGHT')}>
            <Ionicons name="chevron-forward" size={18} color={colors.foreground} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={[styles.arrow, { backgroundColor: colors.muted }]} onPress={() => changeDir('DOWN')}>
          <Ionicons name="chevron-down" size={18} color={colors.foreground} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    paddingBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: { gap: 2 },
  title: { fontSize: 15, fontWeight: '700' },
  sub: { fontSize: 11 },
  scores: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  scoreBox: { alignItems: 'center' },
  scoreLabel: { fontSize: 10, fontWeight: '600' },
  scoreVal: { fontSize: 18, fontWeight: '800' },
  scoreDivider: { width: 1, height: 28 },
  grid: {
    marginHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  row: { flexDirection: 'row' },
  cell: { width: 20, height: 18 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayContent: { alignItems: 'center', gap: 6 },
  overlayEmoji: { fontSize: 32 },
  overlayTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  overlayScore: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600' },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 6,
  },
  playBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  dpad: { alignItems: 'center', marginTop: 10, gap: 2 },
  dpadRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  arrow: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowCenter: { width: 38, height: 38, borderRadius: 10 },
});
