/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope & WorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

self.addEventListener('push', function (event: PushEvent) {
  let data = {
    title: 'Notifikasi HazardReport',
    body: 'Ada informasi baru untuk Anda.',
    icon: '/icon-192x192.png',
    url: '/admin',
  };

  if (event.data) {
    try {
      const jsonData = event.data.json();
      data = { ...data, ...jsonData };
    } catch {
      console.warn('Push event data is not JSON, using text content if available.');
      data.body = event.data.text() || data.body;
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/admin',
    },
  };

  event.waitUntil(self.registration.showNotification(data.title || 'HazardReport', options));
});

self.addEventListener('notificationclick', function (event: NotificationEvent) {
  event.notification.close();

  const targetUrl = event.notification.data.url || '/admin';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If there's already an open tab, navigate it to the target URL
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if ('navigate' in client) {
          return client.navigate(targetUrl).then((c) => c?.focus());
        }
      }
      // Otherwise open a new window
      return self.clients.openWindow(targetUrl);
    })
  );
});

serwist.addEventListeners();
