# Guildly

Comunidades de videojuegos (estilo Reddit): cada juego tiene su sección con comentarios y respuestas.

```
GuildlyApp/
├── frontend/   App móvil (Expo / React Native, Expo Go)
└── backend/    API REST (Node + Express + Firebase Admin / Firestore)
```

## Cómo correrlo

1. **Back** (en una terminal):
   ```bash
   cd backend
   npm install
   # Pon aquí serviceAccountKey.json (Firebase > Configuración > Cuentas de servicio)
   npm start
   ```
2. **Front** (en otra terminal):
   ```bash
   cd frontend
   npm install
   npx expo start
   ```
   Escanea el QR con Expo Go. El celular y el PC deben estar en la misma red Wi‑Fi.
   La app detecta sola la IP del PC; si falla, define `EXPO_PUBLIC_API_URL=http://IP_DEL_PC:3000/api`.

Documentación de la API: [backend/README.md](backend/README.md)
