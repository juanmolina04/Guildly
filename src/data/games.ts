export type Game = {
  id: number;
  name: string;
  genre: string;
  rating: number;
  description: string;
  image: { uri: string };
};

const games: Game[] = [
  {
    id: 1,
    name: 'Minecraft',
    genre: 'Sandbox',
    rating: 4.8,
    description: 'Juego de construccion y exploracion en un mundo generado por bloques.',
    image: { uri: 'https://images.unsplash.com/photo-1627856013091-fed6e4e30025?w=900&q=85' },
  },
  {
    id: 2,
    name: 'Hollow Knight',
    genre: 'Metroidvania',
    rating: 4.9,
    description: 'Aventura de exploracion y combate en un misterioso reino subterraneo.',
    image: { uri: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=900&q=85' },
  },
  {
    id: 3,
    name: 'Terraria',
    genre: 'Sandbox / Aventura',
    rating: 4.7,
    description: 'Juego 2D de construccion, exploracion y combate contra jefes.',
    image: { uri: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=900&q=85' },
  },
  {
    id: 4,
    name: 'Stardew Valley',
    genre: 'Simulacion',
    rating: 4.9,
    description: 'Simulador de granja donde cultivas, pescas y convives con la comunidad.',
    image: { uri: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=900&q=85' },
  },
  {
    id: 5,
    name: 'Celeste',
    genre: 'Plataformas',
    rating: 4.8,
    description: 'Juego de plataformas exigente sobre superar obstaculos y a uno mismo.',
    image: { uri: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=900&q=85' },
  },
  {
    id: 6,
    name: 'Among Us',
    genre: 'Multijugador / Social',
    rating: 4.3,
    description: 'Juego social donde los jugadores deben encontrar al impostor de la nave.',
    image: { uri: 'https://images.unsplash.com/photo-1614294148960-9aa740632a87?w=900&q=85' },
  },
];

export default games;
