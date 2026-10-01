import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
} from 'firebase/auth';
import * as FirebaseAuth from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

const getReactNativePersistence = (
  FirebaseAuth as typeof FirebaseAuth & {
    getReactNativePersistence: (storage: typeof AsyncStorage) => FirebaseAuth.Persistence;
  }
).getReactNativePersistence;

const firebaseConfig = {
  apiKey: 'AIzaSyC89iqFbPeSX1ICg-w8DNlsd14zjsmPY7E',
  authDomain: 'guildly-87dc4.firebaseapp.com',
  projectId: 'guildly-87dc4',
  storageBucket: 'guildly-87dc4.firebasestorage.app',
  messagingSenderId: '744453124956',
  appId: '1:744453124956:web:31dfc2586bb610a708c799',
  measurementId: 'G-78R7H5S6GP',
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth =
  Platform.OS === 'web'
    ? getAuth(app)
    : (() => {
        try {
          return initializeAuth(app, {
            persistence: getReactNativePersistence(AsyncStorage),
          });
        } catch {
          return getAuth(app);
        }
      })();

export const db = getFirestore(app);