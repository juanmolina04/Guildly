import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GameCommunity } from '@/components/game-community';
import { GamePanel } from '@/components/game-panel';
import { NewPostForm } from '@/components/new-post-form';
import { PostDetail } from '@/components/post-detail';
import { Game, Post, getFavorites, getGames, setFavorite } from '@/services/api';
import { AuthContext } from '@/screens/AuthContext';

type Screen = 'home' | 'favorites' | 'detail' | 'post' | 'newPost';

export default function HomeScreen() {
  const { logout } = useContext(AuthContext);
  const [screen, setScreen] = useState<Screen>('home');
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [communityRefresh, setCommunityRefresh] = useState(0);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const loadGames = useCallback(async () => {
    setLoading(true);
    try {
      setGames(await getGames());
      setLoadError('');
    } catch (e) {
      setLoadError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGames();
  }, [loadGames]);

  useEffect(() => {
    getFavorites().then(setFavorites).catch(() => {});
  }, []);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screen === 'post' || screen === 'newPost') {
        setScreen('detail');
        return true;
      }
      if (screen === 'detail') {
        setScreen('home');
        return true;
      }
      return false;
    });
    return () => subscription.remove();
  }, [screen]);

  const filteredGames = useMemo(
    () => games.filter((game) => game.name.toLowerCase().includes(search.toLowerCase())),
    [games, search],
  );
  const favoriteGames = games.filter((game) => favorites.includes(game.id));

  async function toggleFavorite(id: number) {
    const willFavorite = !favorites.includes(id);
    setFavorites((current) =>
      willFavorite ? [...current, id] : current.filter((favoriteId) => favoriteId !== id),
    );
    try {
      await setFavorite(id, willFavorite);
    } catch {
      setFavorites((current) =>
        willFavorite ? current.filter((favoriteId) => favoriteId !== id) : [...current, id],
      );
    }
  }

  function openDetail(game: Game) {
    setSelectedGame(game);
    setScreen('detail');
  }

  async function handleLogout() {
    await logout();
  }

  function Header() {
    return (
      <View style={styles.header}>
        <View style={styles.brand}>
          <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
          <View>
            <Text style={styles.eyebrow}>TU BIBLIOTECA</Text>
            <Text style={styles.title}>Guildly</Text>
          </View>
        </View>
        <View style={styles.navButtons}>
          <Pressable onPress={() => setScreen('home')} style={styles.navButton}>
            <Text style={[styles.navText, screen === 'home' && styles.activeNav]}>Inicio</Text>
          </Pressable>
          <Pressable onPress={() => setScreen('favorites')} style={styles.navButton}>
            <Text style={[styles.navText, screen === 'favorites' && styles.activeNav]}>
              Favoritos ({favorites.length})
            </Text>
          </Pressable>
          <Pressable onPress={handleLogout} style={styles.navButton}>
            <Text style={styles.navText}>Salir</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  function GameCard({ game }: { game: Game }) {
    const isFavorite = favorites.includes(game.id);
    return (
      <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]} onPress={() => openDetail(game)}>
        <Image source={game.image} style={styles.cardImage} />
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{game.name}</Text>
          <Text style={styles.cardGenre}>{game.genre}</Text>
          <Text style={styles.cardRating}>★ {game.rating}</Text>
        </View>
        <Pressable accessibilityLabel={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'} onPress={() => toggleFavorite(game.id)} hitSlop={10}>
          <Text style={styles.favoriteIcon}>{isFavorite ? '♥' : '♡'}</Text>
        </Pressable>
      </Pressable>
    );
  }

  if (screen === 'detail' && selectedGame) {
    const isFavorite = favorites.includes(selectedGame.id);
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <ScrollView contentContainerStyle={styles.detailContainer} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => setScreen('home')} style={styles.backButton}>
            <Text style={styles.backText}>← Volver al catálogo</Text>
          </Pressable>
          <GamePanel
            game={selectedGame}
            isFavorite={isFavorite}
            refreshKey={communityRefresh}
            onToggleFavorite={() => toggleFavorite(selectedGame.id)}
            onNewPost={() => setScreen('newPost')}
          />
          <GameCommunity
            game={selectedGame}
            refreshKey={communityRefresh}
            onOpenPost={(post) => {
              setSelectedPost(post);
              setScreen('post');
            }}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === 'post' && selectedGame && selectedPost) {
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <ScrollView contentContainerStyle={styles.detailContainer} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => setScreen('detail')} style={styles.backButton}>
            <Text style={styles.backText}>← Volver a {selectedGame.name}</Text>
          </Pressable>
          <PostDetail post={selectedPost} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === 'newPost' && selectedGame) {
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <ScrollView contentContainerStyle={styles.detailContainer} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => setScreen('detail')} style={styles.backButton}>
            <Text style={styles.backText}>← Volver a {selectedGame.name}</Text>
          </Pressable>
          <NewPostForm
            game={selectedGame}
            onCancel={() => setScreen('detail')}
            onCreated={() => {
              setCommunityRefresh((n) => n + 1);
              setScreen('detail');
            }}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const list = screen === 'favorites' ? favoriteGames : filteredGames;
  return (
    <SafeAreaView style={styles.container}>
      <Header />
      {screen === 'home' && (
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar videojuego..."
          placeholderTextColor="#7f9079"
          value={search}
          onChangeText={setSearch}
        />
      )}
      {loading ? (
        <ActivityIndicator color="#4f6f4a" style={{ marginTop: 34 }} />
      ) : loadError ? (
        <Pressable onPress={loadGames}>
          <Text style={styles.emptyText}>{loadError} Toca para reintentar.</Text>
        </Pressable>
      ) : list.length === 0 ? (
        <Text style={styles.emptyText}>{screen === 'favorites' ? 'Aun no tienes favoritos.' : 'No encontramos ese juego.'}</Text>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <GameCard game={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff8dc',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    backgroundColor: '#15370d',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 }, logo: { width: 46, height: 46 },
  eyebrow: { color: '#e5cd82', fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  title: { color: '#fff', fontSize: 30, fontWeight: '900', marginTop: 3 },
  navButtons: { flexDirection: 'row', gap: 12 },
  navButton: { paddingVertical: 7 },
  navText: { color: '#b9c9b2', fontSize: 13, fontWeight: '700' },
  activeNav: { color: '#e5cd82' },
  searchInput: {
    backgroundColor: '#fff', margin: 16, marginBottom: 8, paddingHorizontal: 16, height: 48,
    borderRadius: 12, borderWidth: 1, borderColor: '#dccf9a', fontSize: 15,
  },
  list: { padding: 16, paddingTop: 8, paddingBottom: 28 },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginBottom: 10,
    padding: 10, borderRadius: 14, shadowColor: '#111', shadowOpacity: 0.06, shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 }, elevation: 2,
  },
  pressed: { opacity: 0.75 },
  cardImage: { width: 68, height: 68, borderRadius: 10, marginRight: 12, backgroundColor: '#ddd' },
  cardInfo: { flex: 1, gap: 3 },
  cardName: { fontSize: 17, fontWeight: '800', color: '#15370d' },
  cardGenre: { fontSize: 13, color: '#6b7f66' },
  cardRating: { fontSize: 13, color: '#9a7b1c', fontWeight: '700' },
  favoriteIcon: { fontSize: 28, color: '#e05263', paddingHorizontal: 7 },
  emptyText: { textAlign: 'center', marginTop: 34, fontSize: 15, color: '#6b7f66' },
  detailContainer: { padding: 16 },
  backButton: { paddingVertical: 4, marginBottom: 12 },
  backText: { color: '#4f6f4a', fontSize: 14, fontWeight: '700' },
  detailImage: { width: '100%', height: 220, borderRadius: 16, backgroundColor: '#ddd', marginBottom: 16 },
  detailName: { fontSize: 28, fontWeight: '900', color: '#15370d' },
  detailGenre: { color: '#6b7f66', marginTop: 5, fontSize: 15 },
  detailDescription: { color: '#2f4a28', fontSize: 16, lineHeight: 24, marginTop: 18 },
  favoriteButton: { backgroundColor: '#15370d', padding: 14, borderRadius: 12, marginTop: 24, alignItems: 'center' },
  favoriteButtonText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
