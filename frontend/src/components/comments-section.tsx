import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Comment, getComments, postComment } from '@/services/api';
import { timeAgo } from '@/utils/time';

function CommentItem({
  comment,
  isReply,
  onReply,
}: {
  comment: Comment;
  isReply?: boolean;
  onReply: (comment: Comment) => void;
}) {
  return (
    <View style={[styles.comment, isReply && styles.reply]}>
      <Text style={styles.author}>
        {comment.authorName} · Nivel {comment.authorLevel}
        <Text style={styles.time}>  {timeAgo(comment.createdAt)}</Text>
      </Text>
      <Text style={styles.text}>{comment.text}</Text>
      <Pressable onPress={() => onReply(comment)} hitSlop={8}>
        <Text style={styles.replyAction}>Responder</Text>
      </Pressable>
    </View>
  );
}

export function CommentsSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [text, setText] = useState('');
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    try {
      setComments(await getComments(postId));
      setError('');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    load();
  }, [load]);

  async function send() {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await postComment(postId, text.trim(), replyingTo?.id);
      setText('');
      setReplyingTo(null);
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSending(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Comentarios</Text>

      {replyingTo && (
        <View style={styles.replyBanner}>
          <Text style={styles.replyBannerText}>Respondiendo a {replyingTo.authorName}</Text>
          <Pressable onPress={() => setReplyingTo(null)} hitSlop={8}>
            <Text style={styles.cancel}>Cancelar</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder={replyingTo ? 'Escribe tu respuesta...' : 'Escribe un comentario...'}
          placeholderTextColor="#7f9079"
          value={text}
          onChangeText={setText}
          maxLength={500}
          multiline
        />
        <Pressable style={[styles.sendButton, sending && styles.disabled]} onPress={send} disabled={sending}>
          <Text style={styles.sendText}>{sending ? '...' : 'Enviar'}</Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {loading ? (
        <ActivityIndicator color="#4f6f4a" style={styles.loading} />
      ) : comments.length === 0 ? (
        <Text style={styles.empty}>Aún no hay comentarios. ¡Sé el primero!</Text>
      ) : (
        comments.map((comment) => (
          <View key={comment.id}>
            <CommentItem comment={comment} onReply={setReplyingTo} />
            {comment.replies?.map((reply) => (
              <CommentItem key={reply.id} comment={reply} isReply onReply={setReplyingTo} />
            ))}
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 28 },
  heading: { fontSize: 20, fontWeight: '900', color: '#15370d', marginBottom: 12 },
  replyBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f6ecc0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  replyBannerText: { color: '#2f4a28', fontSize: 13, fontWeight: '700' },
  cancel: { color: '#b42332', fontSize: 13, fontWeight: '700' },
  inputRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-end' },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dccf9a',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#15370d',
  },
  sendButton: {
    height: 48,
    paddingHorizontal: 16,
    justifyContent: 'center',
    backgroundColor: '#e5cd82',
    borderRadius: 12,
  },
  disabled: { opacity: 0.6 },
  sendText: { color: '#15370d', fontWeight: '800' },
  error: { color: '#b42332', fontSize: 14, marginTop: 10 },
  loading: { marginTop: 24 },
  empty: { textAlign: 'center', color: '#6b7f66', marginTop: 24 },
  comment: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
    gap: 4,
  },
  reply: { marginLeft: 24, backgroundColor: '#fffbe8', borderLeftWidth: 3, borderLeftColor: '#e5cd82' },
  author: { color: '#4f6f4a', fontSize: 13, fontWeight: '800' },
  time: { color: '#7f9079', fontWeight: '400' },
  text: { color: '#15370d', fontSize: 15, lineHeight: 21 },
  replyAction: { color: '#6b7f66', fontSize: 13, fontWeight: '700', marginTop: 2 },
});
