// Firebase Authentication logic
const auth = firebase.auth();
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const emailLoginBtn = document.getElementById('email-login-btn');
const emailSignupBtn = document.getElementById('email-signup-btn');
const googleLoginBtn = document.getElementById('google-login-btn');
const authError = document.getElementById('auth-error');
const loginScreen = document.getElementById('login-screen');
const appContainer = document.getElementById('app-container');

function showAuthError(message) {
  authError.textContent = message;
  authError.classList.remove('hidden');
}

function clearAuthError() {
  authError.classList.add('hidden');
  authError.textContent = '';
}

emailLoginBtn.onclick = () => {
  clearAuthError();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  if (!email || !password) {
    showAuthError('Please enter email and password.');
    return;
  }
  auth.signInWithEmailAndPassword(email, password)
    .catch(err => showAuthError(err.message));
};

emailSignupBtn.onclick = () => {
  clearAuthError();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  if (!email || !password) {
    showAuthError('Please enter email and password.');
    return;
  }
  auth.createUserWithEmailAndPassword(email, password)
    .catch(err => showAuthError(err.message));
};

googleLoginBtn.onclick = () => {
  clearAuthError();
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).catch(err => showAuthError(err.message));
};

auth.onAuthStateChanged(user => {
  if (user) {
    clearAuthError();
    const userEmail = user.email;
    const safeEmail = userEmail.replace(/[.#$[\]]/g, '_');
    const inviteSection = document.getElementById('invite-code-section');
    const inviteInput = document.getElementById('invite-code-display');
    const pairingScreen = document.getElementById('pairing-screen');

    // Query Firebase to find the user's pair
    const pairsRef = firebase.database().ref('/pairs');
    pairsRef.orderByChild('user1/email').equalTo(safeEmail).get().then(snapshot1 => {
      if (snapshot1.exists()) {
        // Found user as user1
        const pairCode = Object.keys(snapshot1.val())[0];
        localStorage.setItem('pairCode', pairCode);
        localStorage.setItem('userRole', 'user1');
        showApp(pairCode);
      } else {
        // Check if user is user2
        pairsRef.orderByChild('user2/email').equalTo(safeEmail).get().then(snapshot2 => {
          if (snapshot2.exists()) {
            // Found user as user2
            const pairCode = Object.keys(snapshot2.val())[0];
            localStorage.setItem('pairCode', pairCode);
            localStorage.setItem('userRole', 'user2');
            showApp(pairCode);
          } else {
            // User not found in any pair, show pairing screen
            showPairingScreen();
          }
        }).catch(handlePairCheckError);
      }
    }).catch(handlePairCheckError);

    function showApp(pairCode) {
      loginScreen.classList.add('hidden');
      if (pairingScreen) pairingScreen.classList.add('hidden');
      appContainer.classList.remove('hidden');

      // Load quotes
      if (typeof displayQuote === 'function') {
        displayQuote();
        const quoteContainer = document.getElementById('quote-container');
        if (quoteContainer) quoteContainer.style.opacity = 1;
      }

      // Load data
      if (typeof loadSharedStateFromFirebase === 'function') loadSharedStateFromFirebase();

      // Show invite code
      if (pairCode && inviteSection && inviteInput) {
        inviteInput.value = pairCode;
        inviteSection.classList.remove('hidden');
      }

      // Listen for pair creation event (only relevant if user creates a pair *after* initial check)
      // This might be redundant now but kept for safety
      window.addEventListener('pairCreated', e => {
        const code = e.detail?.code || localStorage.getItem('pairCode');
        if (code && inviteSection && inviteInput) {
          inviteInput.value = code;
          inviteSection.classList.remove('hidden');
        }
      });
    }

    function showPairingScreen() {
      loginScreen.classList.add('hidden');
      appContainer.classList.add('hidden');
      if (pairingScreen) pairingScreen.classList.remove('hidden');
      // Clear any potentially stale pair code if user is shown pairing screen
      localStorage.removeItem('pairCode');
      localStorage.removeItem('userRole');
    }

    function handlePairCheckError(err) {
      console.error("Error checking user's pair:", err);
      showAuthError("Error checking pairing status. Please try again.");
      // Fallback: show login screen to be safe
      appContainer.classList.add('hidden');
      if (pairingScreen) pairingScreen.classList.add('hidden');
      loginScreen.classList.remove('hidden');
    }

  } else {
    // User is logged out
    appContainer.classList.add('hidden');
    loginScreen.classList.remove('hidden');
    const pairingScreen = document.getElementById('pairing-screen');
    if (pairingScreen) pairingScreen.classList.add('hidden');
    // Clear local storage on logout
    localStorage.removeItem('pairCode');
    localStorage.removeItem('userRole');
  }
});

// Reuse existing logout button
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.onclick = () => auth.signOut();
}
