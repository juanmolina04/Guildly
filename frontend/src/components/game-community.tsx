import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, Image, View } from 'react-native';

import { PostTagBadge } from '@/components/post-tag';
import { Game, POST_TAGS, Post, PostTag, TopMember, getPosts, postImageUrl, getTop } from '@/services/api';
import { timeAgo } from '@/utils/time';

type Tab = 'posts' | 'top';

type Props = {
  game: Game;
  refreshKey: number;
  onOpenPost: (post: Post) => void;
};

export function GameCommunity({ game, refreshKey, onOpenPost }: Props) {
  const [tab, setTab] = useState<Tab>('posts');
  const [tag, setTag] = useState<PostTag | undefined>(undefined);
  const [posts, setPosts] = useState<Post[]>([]);
  const [top, setTop] = useState<TopMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === 'posts') setPosts(await getPosts(game.id, tag));
      else setTop(await getTop(game.id));
      setError('');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [game.id, tab, tag]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <Pressable style={[styles.tab, tab === 'posts' && styles.tabActive]} onPress={() => setTab('posts')}>
          <Text style={[styles.tabText, tab === 'posts' && styles.tabTextActive]}>Publicaciones</Text>
        </Pressable>
        <Pressable style={[styles.tab, tab === 'top' && styles.tabActive]} onPress={() => setTab('top')}>
          <Text style={[styles.tabText, tab === 'top' && styles.tabTextActive]}>Top del gremio</Text>
        </Pressable>
      </View>

      {tab === 'posts' && (
        <>
         <View style={styles.filters}>
            <Pressable style={[styles.chip, !tag && styles.chipActive]} onPress={() => setTag(undefined)}>
              <Text style={[styles.chipText, !tag && styles.chipTextActive]}>Todas</Text>
            </Pressable>
            {POST_TAGS.map((t) => (
              <Pressable
                key={t.id}
                style={[styles.chip, tag === t.id && styles.chipActive]}
                onPress={() => setTag(t.id)}>
                <Text style={[styles.chipText, tag === t.id && styles.chipTextActive]}>{t.label}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {loading ? (
        <ActivityIndicator color="#4f6f4a" style={styles.status} />
      ) : error ? (
        <Pressable onPress={load}>
          <Text style={styles.statusText}>{error} Toca para reintentar.</Text>
        </Pressable>
      ) : tab === 'posts' ? (
        posts.length === 0 ? (
          <Text style={styles.statusText}>
            {tag ? 'No hay publicaciones con esa etiqueta.' : 'Aún no hay publicaciones. ¡Crea la primera!'}
          </Text>
        ) : (
          posts.map((post) => (
            <Pressable
              key={post.id}
              style={({ pressed }) => [styles.post, pressed && styles.pressed]}
              onPress={() => onOpenPost(post)}>
              <PostTagBadge tag={post.tag} />
              <Text style={styles.postTitle}>{post.title}</Text>
              <Text style={styles.postBody} numberOfLines={2}>
                {post.body}
              </Text>
              {post.hasImage && <Image source={{ uri: postImageUrl(post.id) }} style={styles.postImage} />}
              <Text style={styles.postMeta}>
                {post.authorName} · Nivel {post.authorLevel} · {timeAgo(post.createdAt)} ·{' '}
                {post.commentCount} {post.commentCount === 1 ? 'comentario' : 'comentarios'}
              </Text>
            </Pressable>
          ))
        )
      ) : top.length === 0 ? (
        <Text style={styles.statusText}>Aún no hay miembros en el gremio. ¡Publica o comenta para entrar al Top!</Text>
      ) : (
        top.map((member) => (
          <View key={member.userId} style={styles.topRow}>
            <Text style={[styles.position, member.position === 1 && styles.positionFirst]}>#{member.position}</Text>
            <View style={styles.topInfo}>
              <Text style={styles.topName}>{member.userName}</Text>
              <Text style={styles.topMeta}>
                {member.posts} publicaciones · {member.comments} comentarios
              </Text>
            </View>
            <View style={styles.levelBox}>
              <Text style={styles.levelText}>Nivel {member.level}</Text>
              <Text style={styles.points}>{member.points} pts</Text>
            </View>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 28 },
  tabs: { flexDirection: 'row', backgroundColor: '#e9e9ee', borderRadius: 12, padding: 4, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: 'center' },
  tabActive: { backgroundColor: '#15370d' },
  tabText: { color: '#3d5736', fontWeight: '800', fontSize: 14 },
  tabTextActive: { color: '#e5cd82' },
  newPostButton: { backgroundColor: '#e5cd82', padding: 14, borderRadius: 12, alignItems: 'center' },
  newPostText: { color: '#15370d', fontWeight: '800', fontSize: 15 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14, marginBottom: 6 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, backgroundColor: '#e9e9ee' },
  chipActive: { backgroundColor: '#15370d' },
  chipText: { color: '#3d5736', fontWeight: '700', fontSize: 13 },
  chipTextActive: { color: '#e5cd82' },
  status: { marginTop: 24 },
  statusText: { textAlign: 'center', color: '#6b7f66', marginTop: 24, fontSize: 15 },
  post: { backgroundColor: '#fff', padding: 14, borderRadius: 14, marginTop: 10, gap: 6 },
  pressed: { opacity: 0.75 },
  postTitle: { fontSize: 17, fontWeight: '800', color: '#15370d' },
  postBody: { fontSize: 14, color: '#3d5736', lineHeight: 20 },
  postImage: { width: '100%', height: 150, borderRadius: 10, backgroundColor: '#ddd' },
  postMeta: { fontSize: 12, color: '#7f9079' },
  topRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 14, borderRadius: 14, marginTop: 10, gap: 14 },
  position: { fontSize: 20, fontWeight: '900', color: '#7f9079', width: 40 },
  positionFirst: { color: '#4f6f4a' },
  topInfo: { flex: 1, gap: 2 },
  topName: { fontSize: 16, fontWeight: '800', color: '#15370d' },
  topMeta: { fontSize: 12, color: '#7f9079' },
  levelBox: { alignItems: 'flex-end', gap: 2 },
  levelText: { fontSize: 14, fontWeight: '800', color: '#4f6f4a' },
  points: { fontSize: 12, color: '#7f9079' },
});
