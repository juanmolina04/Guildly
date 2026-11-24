import Constants from 'expo-constants';

import { auth } from '@/firebaseConfig';

// Expo Go sabe la IP del PC que corre `expo start`; el back corre en ese mismo PC (puerto 3000).
// Para usar otra dirección define EXPO_PUBLIC_API_URL (ej: http://192.168.1.10:3000/api).
const host = Constants.expoConfig?.hostUri?.split(':')[0] ?? 'localhost';
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? `http://${host}:3000/api`;

export type Game = {
  id: number;
  name: string;
  genre: string;
  rating: number;
  description: string;
  image: { uri: string };
};

export type GameStats = {
  createdAt: string;
  members: number;
  followers: number;
  activeUsers: number;
  posts: number;
  comments: number;
  activity: { score: number; label: string; windowDays: number };
};

export type PostTag = 'guia' | 'pregunta' | 'discusion' | 'noticia';

export const POST_TAGS: { id: PostTag; label: string; color: string }[] = [
  { id: 'guia', label: 'Guía', color: '#2f9e6b' },
  { id: 'pregunta', label: 'Pregunta', color: '#3b82c4' },
  { id: 'discusion', label: 'Discusión', color: '#b36bd6' },
  { id: 'noticia', label: 'Noticia', color: '#d9822b' },
];

export type Post = {
  id: string;
  gameId: number;
  title: string;
  body: string;
  tag: PostTag;
  authorId: string;
  authorName: string;
  authorLevel: number;
  commentCount: number;
  hasImage?: boolean;
  createdAt: string;
};

export type TopMember = {
  position: number;
  userId: string;
  userName: string;
  points: number;
  level: number;
  posts: number;
  comments: number;
};

export type Comment = {
  id: string;
  postId: string;
  gameId: number;
  text: string;
  authorId: string;
  authorName: string;
  authorLevel: number;
  parentId: string | null;
  createdAt: string;
  replies?: Comment[];
};

export type AppNotification = {
  id: string;
  type: 'reply' | 'comment';
  gameId: number;
  gameName: string;
  postId: string;
  postTitle: string;
  commentId: string;
  fromName: string;
  text: string;
  read: boolean;
  createdAt: string;
};

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = await auth.currentUser?.getIdToken();

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor.');
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error ?? 'Error del servidor.');
  return data as T;
}

// Usuarios
export const syncUser = () => request('POST', '/users');

// Juegos
type ApiGame = Omit<Game, 'image'> & { imageUrl: string };

export async function getGames(): Promise<Game[]> {
  const games = await request<ApiGame[]>('GET', '/games');
  return games.map(({ imageUrl, ...game }) => ({ ...game, image: { uri: imageUrl } }));
}

export const getGameStats = (gameId: number) => request<GameStats>('GET', `/games/${gameId}/stats`);

// Favoritos (el corazón)
export const getFavorites = () => request<number[]>('GET', '/users/me/favorites');

export const setFavorite = (gameId: number, favorite: boolean) =>
  request<{ gameId: number; favorite: boolean }>(favorite ? 'PUT' : 'DELETE', `/games/${gameId}/favorite`);

export const getTop = (gameId: number) => request<TopMember[]>('GET', `/games/${gameId}/top`);

export const getPosts = (gameId: number, tag?: PostTag) =>
  request<Post[]>('GET', `/games/${gameId}/posts${tag ? `?tag=${tag}` : ''}`);

export const postImageUrl = (postId: string) => `${API_URL}/posts/${postId}/image`;

export const createPost = (
       gameId: number,
       post: { title: string; body: string; tag: PostTag; image?: string },
  ) => request<Post>('POST', `/games/${gameId}/posts`, post);

export const getComments = (postId: string) => request<Comment[]>('GET', `/posts/${postId}/comments`);

export const postComment = (postId: string, text: string, parentId?: string) =>
  request<Comment>('POST', `/posts/${postId}/comments`, { text, parentId });

// Notificaciones
export const getUnreadNotifications = () =>
  request<AppNotification[]>('GET', '/notifications?unread=true');

export const markNotificationRead = (id: string) =>
  request<AppNotification>('PATCH', `/notifications/${id}/read`);
