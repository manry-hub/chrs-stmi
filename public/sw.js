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
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus();
      }
      return clients.openWindow(event.notification.data.url);
    })
  );
});
