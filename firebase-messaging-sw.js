// Firebase Messaging Service Worker

importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

firebase.initializeApp({
  messagingSenderId: '105550325208'
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification?.title || 'ChainTrack Notification';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: 'apple-touch-icon.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
