import { useContext, useMemo, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import games, { Game } from '@/data/games';
import { AuthContext } from '@/screens/AuthContext';

type Screen = 'home' | 'favorites' | 'detail';

export default function HomeScreen() {
  const { logout } = useContext(AuthContext);
  const [screen, setScreen] = useState<Screen>('home');
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const filteredGames = useMemo(
    () => games.filter((game) => game.name.toLowerCase().includes(search.toLowerCase())),
    [search],
  );
  const favoriteGames = games.filter((game) => favorites.includes(game.id));

  function toggleFavorite(id: number) {
    setFavorites((current) =>
      current.includes(id) ? current.filter((favoriteId) => favoriteId !== id) : [...current, id],
    );
  }

  function openDetail(game: Game) {
    setSelectedGame(game);
    setScreen('detail');
  }

  function Header() {
    return (
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>TU BIBLIOTECA</Text>
          <Text style={styles.title}>Guildly</Text>
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
          <Pressable onPress={logout} style={styles.navButton} onPressIn={() => setScreen('home')}>
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
        <View style={styles.detailContainer}>
          <Pressable onPress={() => setScreen('home')} style={styles.backButton}>
            <Text style={styles.backText}>← Volver al catálogo</Text>
          </Pressable>
          <Image source={selectedGame.image} style={styles.detailImage} />
          <Text style={styles.detailName}>{selectedGame.name}</Text>
          <Text style={styles.detailGenre}>{selectedGame.genre}  ·  ★ {selectedGame.rating}</Text>
          <Text style={styles.detailDescription}>{selectedGame.description}</Text>
          <Pressable style={styles.favoriteButton} onPress={() => toggleFavorite(selectedGame.id)}>
            <Text style={styles.favoriteButtonText}>{isFavorite ? '♥  Quitar de favoritos' : '♡  Agregar a favoritos'}</Text>
          </Pressable>
        </View>
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
          placeholderTextColor="#8b8b96"
          value={search}
          onChangeText={setSearch}
        />
      )}
      {list.length === 0 ? (
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
    backgroundColor: '#f4f4f6',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    backgroundColor: '#15151b',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  eyebrow: { color: '#f2bf4b', fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  title: { color: '#fff', fontSize: 30, fontWeight: '900', marginTop: 3 },
  navButtons: { flexDirection: 'row', gap: 12 },
  navButton: { paddingVertical: 7 },
  navText: { color: '#a9a9b2', fontSize: 13, fontWeight: '700' },
  activeNav: { color: '#f2bf4b' },
  searchInput: {
    backgroundColor: '#fff', margin: 16, marginBottom: 8, paddingHorizontal: 16, height: 48,
    borderRadius: 12, borderWidth: 1, borderColor: '#e3e3e8', fontSize: 15,
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
  cardName: { fontSize: 17, fontWeight: '800', color: '#18181d' },
  cardGenre: { fontSize: 13, color: '#777781' },
  cardRating: { fontSize: 13, color: '#d59615', fontWeight: '700' },
  favoriteIcon: { fontSize: 28, color: '#e05263', paddingHorizontal: 7 },
  emptyText: { textAlign: 'center', marginTop: 34, fontSize: 15, color: '#777781' },
  detailContainer: { padding: 16 },
  backButton: { paddingVertical: 4, marginBottom: 12 },
  backText: { color: '#bd8615', fontSize: 14, fontWeight: '700' },
  detailImage: { width: '100%', height: 220, borderRadius: 16, backgroundColor: '#ddd', marginBottom: 16 },
  detailName: { fontSize: 28, fontWeight: '900', color: '#18181d' },
  detailGenre: { color: '#777781', marginTop: 5, fontSize: 15 },
  detailDescription: { color: '#41414a', fontSize: 16, lineHeight: 24, marginTop: 18 },
  favoriteButton: { backgroundColor: '#15151b', padding: 14, borderRadius: 12, marginTop: 24, alignItems: 'center' },
  favoriteButtonText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
