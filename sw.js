// sw.js - Service Worker for Push Notifications

// Listener for the 'push' event. In a real app with a backend, this would be the primary way to receive notifications.
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : { title: 'Swachhata Sathi', body: 'You have a new update!' };
  const options = {
    body: data.body,
    icon: '/vite.svg',
    badge: '/vite.svg',
  };
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Listener for messages from the client (main app). Used for testing/simulating a notification without a backend.
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
        const { title, body } = event.data.payload;
        event.waitUntil(
            self.registration.showNotification(title, {
                body: body,
                icon: '/vite.svg',
                badge: '/vite.svg'
            })
        );
    }
});


// Listener for when a user clicks on the notification
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // If a window for the app is already open, focus it.
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus();
      }
      // Otherwise, open a new window.
      return clients.openWindow('/');
    })
  );
});