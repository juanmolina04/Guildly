import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { getUnreadNotifications, markNotificationRead } from '@/services/api';

const POLL_INTERVAL_MS = 10000;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function requestPermission() {
  if (Platform.OS === 'web') {
    if (typeof Notification === 'undefined') return false;
    return (await Notification.requestPermission()) === 'granted';
  }
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Guildly',
      importance: Notifications.AndroidImportance.MAX,
    });
  }
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

async function showNotification(title: string, body: string) {
  if (Platform.OS === 'web') {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
    return;
  }
  await Notifications.scheduleNotificationAsync({ content: { title, body }, trigger: null });
}

// Consulta cada pocos segundos al back y muestra cada notificación nueva.
export function useReplyNotifications(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    let stopped = false;
    let busy = false;
    const shown = new Set<string>();

    async function check() {
      if (busy) return;
      busy = true;
      try {
        const unread = await getUnreadNotifications();
        for (const item of unread) {
          if (stopped) return;
          if (shown.has(item.id)) continue;
          const title =
            item.type === 'reply'
              ? `Nueva respuesta en ${item.gameName}`
              : `Nuevo comentario en “${item.postTitle}”`;
          await showNotification(title, `${item.fromName}: ${item.text}`);
          shown.add(item.id);
          await markNotificationRead(item.id);
        }
      } catch {
        // Sin conexión con el servidor: se reintenta en el siguiente ciclo.
      } finally {
        busy = false;
      }
    }

    let interval: ReturnType<typeof setInterval> | undefined;
    requestPermission().then((granted) => {
      if (!granted || stopped) return;
      check();
      interval = setInterval(check, POLL_INTERVAL_MS);
    });

    return () => {
      stopped = true;
      if (interval) clearInterval(interval);
    };
  }, [enabled]);
}
