# App de tareas con Firebase — Guía de instalación

## 1. Instalar dependencias

Desde la raíz de tu proyecto Expo, corre estos comandos en orden:

```bash
npx expo install firebase
npx expo install @react-native-async-storage/async-storage
npx expo install @react-navigation/native
npx expo install react-native-screens react-native-safe-area-context
npx expo install @react-navigation/native-stack
```

## 2. Ubicar los archivos

Copia cada archivo en esta ruta exacta dentro de tu proyecto:

```
tu-proyecto/
├── App.js                      (reemplaza el que ya tienes)
├── firebaseConfig.js
├── context/
│   └── AuthContext.js
└── screens/
    ├── LoginScreen.js
    ├── RegisterScreen.js
    └── TasksScreen.js
```

## 3. Activar Firestore en la consola de Firebase

1. Ve a https://console.firebase.google.com → tu proyecto
2. Build → Firestore Database → "Crear base de datos"
3. Elige "Modo de prueba" por ahora (lo aseguramos con reglas después)
4. Build → Authentication → "Comenzar" → habilita el método
   "Correo electrónico/contraseña"

## 4. Correr la app

```bash
npx expo start
```

Escanea el QR con Expo Go, o presiona `a` para abrirlo en un emulador Android.

## 5. Qué probar

- [ ] Regístrate con un correo y contraseña nuevos
- [ ] Deberías caer directo en la pantalla de tareas (sin volver a loguearte)
- [ ] Agrega un par de tareas, márcalas como completadas, bórralas
- [ ] Cierra sesión con el botón "Cerrar sesión"
- [ ] Cierra la app POR COMPLETO (no solo minimizarla) y vuelve a abrirla
      → si vuelve a pedirte login, revisa que `initializeAuth` en
        `firebaseConfig.js` tenga `getReactNativePersistence(AsyncStorage)`

## Nota sobre reglas de seguridad

Antes de compartir esta app con alguien más, protege Firestore para que
solo usuarios autenticados puedan leer y escribir. En la consola:
Firestore Database → Reglas, y pega:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tareas/{taskId} {
      allow read, write: if request.auth != null;
    }
  }
}
```
