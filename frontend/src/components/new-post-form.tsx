import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Game, POST_TAGS, PostTag, createPost } from '@/services/api';

type Props = { game: Game; onCreated: () => void; onCancel: () => void };

export function NewPostForm({ game, onCreated, onCancel }: Props) {
  const [tag, setTag] = useState<PostTag | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [image, setImage] = useState<{ uri: string; base64: string } | null>(null);

  // Elige una foto de la galería y la reduce (máx. 1000 px de ancho, JPEG) para que pese poco.
  async function pickImage() {
    const picked = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
    if (picked.canceled) return;
    try {
      const small = await ImageManipulator.manipulateAsync(
        picked.assets[0].uri,
        [{ resize: { width: 1000 } }],
        { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG, base64: true },
      );
      setImage({ uri: small.uri, base64: small.base64 ?? '' });
      setError('');
    } catch {
      setError('No se pudo procesar la imagen.');
    }
  }

  async function submit() {
    if (!tag) return setError('Elige una etiqueta.');
    if (!title.trim()) return setError('Escribe un título.');
    if (!body.trim()) return setError('Escribe el contenido de la publicación.');

    setSending(true);
    setError('');
    try {
      await createPost(game.id, { title: title.trim(), body: body.trim(), tag, image: image?.base64 });
      onCreated();
    } catch (e) {
      setError((e as Error).message);
      setSending(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Nueva publicación en {game.name}</Text>

      <Text style={styles.label}>Etiqueta</Text>
      <View style={styles.tags}>
        {POST_TAGS.map((t) => (
          <Pressable
            key={t.id}
            onPress={() => setTag(t.id)}
            style={[styles.tag, { borderColor: t.color }, tag === t.id && { backgroundColor: t.color }]}>
            <Text style={[styles.tagText, { color: tag === t.id ? '#fff' : t.color }]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Título</Text>
      <TextInput
        style={styles.input}
        placeholder="Título de la publicación"
        placeholderTextColor="#7f9079"
        value={title}
        onChangeText={setTitle}
        maxLength={100}
      />

      <Text style={styles.label}>Contenido</Text>
      <TextInput
        style={[styles.input, styles.bodyInput]}
        placeholder="Cuéntales a los demás..."
        placeholderTextColor="#7f9079"
        value={body}
        onChangeText={setBody}
        maxLength={2000}
        multiline
        textAlignVertical="top"
      />

      <Text style={styles.label}>Imagen (opcional)</Text>
      {image ? (
        <View>
          <Image source={{ uri: image.uri }} style={styles.preview} />
          <Pressable onPress={() => setImage(null)} hitSlop={8}>
            <Text style={styles.removeImage}>Quitar imagen</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable style={styles.attach} onPress={pickImage}>
          <Text style={styles.attachText}>📷  Adjuntar imagen</Text>
        </Pressable>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable style={[styles.submit, sending && styles.disabled]} onPress={submit} disabled={sending}>
        {sending ? <ActivityIndicator color="#15370d" /> : <Text style={styles.submitText}>Publicar</Text>}
      </Pressable>
      <Pressable onPress={onCancel} style={styles.cancel}>
        <Text style={styles.cancelText}>Cancelar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  heading: { fontSize: 22, fontWeight: '900', color: '#15370d', marginBottom: 8 },
  label: { color: '#1d4513', fontSize: 14, fontWeight: '700', marginTop: 6 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { borderWidth: 2, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7 },
  tagText: { fontWeight: '800', fontSize: 13 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dccf9a',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#15370d',
  },
  bodyInput: { minHeight: 140 },
  attach: { borderWidth: 2, borderStyle: 'dashed', borderColor: '#728e6d', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  attachText: { color: '#4f6f4a', fontWeight: '800', fontSize: 14 },
  preview: { width: '100%', height: 200, borderRadius: 12, backgroundColor: '#ddd' },
  removeImage: { color: '#b42332', fontWeight: '700', fontSize: 13, marginTop: 8 },
  error: { color: '#b42332', fontSize: 14 },
  submit: { backgroundColor: '#e5cd82', minHeight: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  disabled: { opacity: 0.6 },
  submitText: { color: '#15370d', fontWeight: '800', fontSize: 16 },
  cancel: { alignItems: 'center', paddingVertical: 10 },
  cancelText: { color: '#6b7f66', fontWeight: '700' },
});