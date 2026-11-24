import { Image, StyleSheet, Text, View } from 'react-native';

import { CommentsSection } from '@/components/comments-section';
import { PostTagBadge } from '@/components/post-tag';
import { Post, postImageUrl } from '@/services/api';
import { timeAgo } from '@/utils/time';

export function PostDetail({ post }: { post: Post }) {
  return (
    <View>
      <View style={styles.post}>
        <PostTagBadge tag={post.tag} />
        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.meta}>
          {post.authorName} · Nivel {post.authorLevel} · {timeAgo(post.createdAt)}
        </Text>
        <Text style={styles.body}>{post.body}</Text>
        {post.hasImage && <Image source={{ uri: postImageUrl(post.id) }} style={styles.image} resizeMode="cover" />}
      </View>
      <CommentsSection postId={post.id} />
    </View>
  );
}

const styles = StyleSheet.create({
  post: { backgroundColor: '#fff', padding: 16, borderRadius: 16, gap: 8 },
  title: { fontSize: 22, fontWeight: '900', color: '#15370d' },
  meta: { fontSize: 13, color: '#7f9079' },
  image: { width: '100%', aspectRatio: 4 / 3, borderRadius: 12, backgroundColor: '#ddd', marginTop: 8 },
  body: { fontSize: 16, color: '#2f4a28', lineHeight: 24, marginTop: 6 },
});