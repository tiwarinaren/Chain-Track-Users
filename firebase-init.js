if (!window._firebaseInitialized) {
  window._firebaseInitialized = true;

  if (typeof firebaseConfig === 'undefined') {
    console.error("CRITICAL: firebaseConfig is not defined. Make sure firebase-config.js is loaded correctly before this script and contains your Firebase configuration.");
    alert("Error: Firebase configuration is missing. App cannot start.");
    document.getElementById('app-container')?.classList.add('hidden');
    document.getElementById('login-screen')?.classList.add('hidden');
    document.body.innerHTML = '<div style="padding: 20px; text-align: center; color: red;">App initialization failed: Missing Firebase config.</div>';
  }

  try {
    if (typeof firebaseConfig !== 'undefined') {
      window.firebaseApp = firebase.initializeApp(firebaseConfig);
      window.db = firebase.database();
      const pairCode = localStorage.getItem('pairCode');
      const userEmail = localStorage.getItem('userEmail');
      if (pairCode && userEmail) {
        const safeEmail = userEmail.replace(/[.#$[\]]/g, '_');
        console.log("Firebase initialized for pair:", pairCode, "user:", safeEmail);
      } else {
        console.error("Missing pairCode or userEmail in localStorage.");
        window.dbRef = null;
      }
    } else {
      throw new Error("firebaseConfig is undefined.");
    }
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    alert("Critical Error: Could not connect to Firebase. Check firebase-config.js.");
    document.getElementById('app-container')?.classList.add('hidden');
    document.getElementById('login-screen')?.classList.add('hidden');
    document.body.innerHTML = '<div style="padding: 20px; text-align: center; color: red;">Firebase initialization failed. Check console and firebase-config.js.</div>';
  }
}
