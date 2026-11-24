# Guildly API

Capas: `routes` → `controllers` → `services` → Firestore (`config/firebase.js`).

```
src/
├── config/        Inicialización de Firebase Admin
├── middleware/    auth (valida token de Firebase) y manejo de errores
├── routes/        Definición de endpoints
├── controllers/   Reciben la petición y responden
├── services/      Lógica de negocio y acceso a Firestore
└── data/          Catálogo de juegos
```

## Ejecutar

```bash
npm install
npm start          # http://localhost:3000/api
```
Requiere `serviceAccountKey.json` en esta carpeta (no se sube a git). También se puede
definir `FIREBASE_SERVICE_ACCOUNT` con el JSON de credenciales, o
`GOOGLE_APPLICATION_CREDENTIALS_PATH` con la ruta al archivo.

## Autenticación

El usuario inicia sesión en la app con Firebase Auth. La app envía en cada petición:

```
Authorization: Bearer <ID token de Firebase>
```

Todos los endpoints la requieren, salvo `/health`. Errores: `{ "error": "mensaje" }`.

## Endpoints (prefijo `/api`)

| Método | Ruta | Body | Respuesta |
|---|---|---|---|
| GET | `/health` | – | `{ status: "ok" }` |
| POST | `/users` | – | `201`/`200` perfil del usuario (lo crea en `users/{uid}` si no existe) |
| GET | `/users/me` | – | Perfil del usuario autenticado (`404` si no existe) |
| GET | `/games` | – | Lista de juegos |
| GET | `/games/:gameId` | – | Un juego (`404` si no existe) |
| GET | `/games/:gameId/top` | – | Top del gremio: 5 miembros con más puntos en ese juego |
| GET | `/games/:gameId/posts` | – (`?tag=guia` opcional) | Publicaciones del juego, la más nueva primero |
| POST | `/games/:gameId/posts` | `{ title, body, tag }` | `201` publicación creada |
| GET | `/posts/:postId` | – | Una publicación |
| GET | `/posts/:postId/comments` | – | Comentarios en árbol (`replies` dentro de cada comentario) |
| POST | `/posts/:postId/comments` | `{ text, parentId? }` | `201` comentario creado. Con `parentId` es una respuesta |
| GET | `/notifications` | – (`?unread=true` opcional) | Notificaciones del usuario |
| PATCH | `/notifications/:id/read` | – | Notificación marcada como leída |

**Etiquetas de publicación (`tag`):** `guia`, `pregunta`, `discusion`, `noticia`.

**Reglas:** título de 1 a 100 caracteres; contenido de 1 a 2000; comentarios de 1 a 500.
Las respuestas son de un solo nivel (responder a una respuesta la cuelga del comentario principal).

**Puntos y niveles (por juego):** publicar da 10 puntos y comentar o responder da 3.
Nivel = 1 + floor(puntos / 20). El nivel aparece junto al autor y el Top ordena por puntos.

**Notificaciones:** se crea una de tipo `comment` para el autor de la publicación cuando alguien
comenta, y una de tipo `reply` para el autor del comentario que fue respondido. Nunca se notifica a uno mismo.

## Colecciones de Firestore

- `users/{uid}`: `uid, email, displayName, createdAt`
- `posts/{id}`: `gameId, title, body, tag, authorId, authorName, commentCount, createdAt`
- `comments/{id}`: `postId, gameId, text, authorId, authorName, parentId, createdAt`
- `scores/{gameId}_{uid}`: `gameId, userId, userName, points, posts, comments`
- `notifications/{id}`: `userId, type, gameId, gameName, postId, postTitle, commentId, fromName, text, read, createdAt`
