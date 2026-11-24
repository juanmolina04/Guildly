import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { Game, GameStats, getGameStats } from '@/services/api';
import { formatDate } from '@/utils/time';
import { ActivityGauge } from '@/components/activity-gauge';

type Props = {
  game: Game;
  isFavorite: boolean;
  refreshKey: number;
  onToggleFavorite: () => void;
  onNewPost: () => void;
};

export function GamePanel({ game, isFavorite, refreshKey, onToggleFavorite, onNewPost }: Props) {
  const [stats, setStats] = useState<GameStats | null>(null);

  useEffect(() => {
    getGameStats(game.id)
      .then(setStats)
      .catch(() => {});
  }, [game.id, isFavorite, refreshKey]);

  const items = [
    { label: 'Miembros', value: stats ? String(stats.members) : '–' },
    { label: 'Seguidores', value: stats ? String(stats.followers) : '–' },
    { label: 'Activos (7 d)', value: stats ? String(stats.activeUsers) : '–' },
    { label: 'Publicaciones', value: stats ? String(stats.posts) : '–' },
    { label: 'Comentarios', value: stats ? String(stats.comments) : '–' },
    { label: 'Creada el', value: stats ? formatDate(stats.createdAt) : '–' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.heroRow}>
        <View style={styles.hero}>
          <Image source={game.image} style={styles.heroImage} />
          <View style={styles.heroCaption}>
            <Text style={styles.heroName}>{game.name}</Text>
            <Text style={styles.heroMeta}>
              {game.genre}  ·  ★ {game.rating}
            </Text>
          </View>
        </View>


      <ActivityGauge score={stats ? stats.activity.score : null} label={stats ? stats.activity.label : ''} />
      </View>

      <View style={styles.actions}>
        <Pressable style={({ pressed }) => [styles.postButton, pressed && styles.pressed]} onPress={onNewPost}>
          <Text style={styles.postButtonText}>+ Hacer post</Text>
        </Pressable>
        <Pressable
          accessibilityLabel={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          style={({ pressed }) => [styles.heartButton, pressed && styles.pressed]}
          onPress={onToggleFavorite}>
          <Text style={[styles.heart, isFavorite && styles.heartActive]}>{isFavorite ? '♥' : '♡'}</Text>
        </Pressable>
      </View>

      <View style={styles.info}>
        <Text style={styles.description}>{game.description}</Text>
        <View style={styles.grid}>
          {items.map((item) => (
            <View key={item.label} style={styles.stat}>
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  heroRow: { flexDirection: 'row', gap: 12 },
  hero: { flex: 1, height: 150, borderRadius: 16, overflow: 'hidden', backgroundColor: '#ddd' },
  heroImage: { width: '100%', height: '100%' },
  heroCaption: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(21,21,27,0.72)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  heroName: { color: '#fff', fontSize: 20, fontWeight: '900' },
  heroMeta: { color: '#d4d4da', fontSize: 12, marginTop: 2 },
  activityBox: {
    width: 120,
    height: 150,
    backgroundColor: '#15370d',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    gap: 4,
  },
  activityTitle: { color: '#b9c9b2', fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  activityValue: { color: '#728e6d', fontSize: 32, fontWeight: '900' },
  activityLabel: { color: '#fff8dc', fontSize: 13, fontWeight: '700', textAlign: 'center' },
  actions: { flexDirection: 'row', gap: 12 },
  postButton: {
    flex: 1,
    height: 52,
    backgroundColor: '#e5cd82',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postButtonText: { color: '#15370d', fontSize: 16, fontWeight: '800' },
  heartButton: {
    width: 52,
    height: 52,
    backgroundColor: '#15370d',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heart: { color: '#b9c9b2', fontSize: 28 },
  heartActive: { color: '#e05263' },
  pressed: { opacity: 0.75 },
  info: { backgroundColor: '#fff', borderRadius: 16, padding: 14, gap: 12 },
  description: { color: '#2f4a28', fontSize: 14, lineHeight: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 12 },
  stat: { width: '33.33%', gap: 2 },
  statValue: { color: '#15370d', fontSize: 18, fontWeight: '900' },
  statLabel: { color: '#7f9079', fontSize: 12 },
});