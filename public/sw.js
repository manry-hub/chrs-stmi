self.addEventListener('push', function (event) {
  let data = {
    title: 'Notifikasi HazardReport',
    body: 'Ada informasi baru untuk Anda.',
    icon: '/icon-192x192.png',
  };

  if (event.data) {
    try {
      data = event.data.json();
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

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const targetUrl = event.notification.data.url || '/admin';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If there's already an open tab, navigate it to the target URL
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if ('navigate' in client) {
          return client.navigate(targetUrl).then(() => client.focus());
        }
      }
      // Otherwise open a new window
      return clients.openWindow(targetUrl);
    })
  );
});
