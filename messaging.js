// Firebase Cloud Messaging setup
const messaging = firebase.messaging();

async function requestNotificationPermission() {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }
    const token = await messaging.getToken({
      vapidKey: 'BFClSx-f87mQH15RbaFjzesV_wjWIb_ZAP9TyO-0KkK3O850MeqW7zYqKZ3MIIQdYkC4PuNCHs_NTUY-dRFVw4I',
      serviceWorkerRegistration: await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js')
    });
    console.log('FCM Token:', token);
    // TODO: Save token to your database if needed
  } catch (err) {
    console.error('Error getting FCM token:', err);
  }
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('firebase-messaging-sw.js')
    .then(reg => {
      console.log('Firebase Messaging SW registered:', reg.scope);
      requestNotificationPermission();
    })
    .catch(err => console.error('Firebase Messaging SW registration failed:', err));
} else {
  console.warn('Service workers are not supported.');
}
