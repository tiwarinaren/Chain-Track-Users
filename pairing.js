// Pairing logic for 2-user invite code system

const pairingScreen = document.getElementById('pairing-screen');
const createPairBtn = document.getElementById('create-pair-btn');
const joinPairBtn = document.getElementById('join-pair-btn');
const joinCodeInput = document.getElementById('join-code-input');
const pairError = document.getElementById('pair-error');

function generateCode(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function createPair() {
  clearPairError();
  const code = generateCode();
  const pairRef = firebase.database().ref(`/pairs/${code}`);
  const snapshot = await pairRef.get();
  if (snapshot.exists()) {
    // Collision, try again
    return createPair();
  }
  const user = firebase.auth().currentUser;
  if (!user) {
    showPairError("User not logged in.");
    return;
  }
  const safeEmail = user.email.replace(/[.#$[\]]/g, '_');
  await pairRef.set({ user1: { createdAt: Date.now(), email: safeEmail } });
  localStorage.setItem('pairCode', code);
  localStorage.setItem('userRole', 'user1');
  alert(`Your invite code: ${code}`);
  pairingScreen.classList.add('hidden');
  // Proceed to app
}

async function joinPair() {
  clearPairError();
  const code = joinCodeInput.value.trim().toUpperCase();
  if (!code) {
    showPairError('Enter a code');
    return;
  }
  const pairRef = firebase.database().ref(`/pairs/${code}`);
  const snapshot = await pairRef.get();
  if (!snapshot.exists()) {
    showPairError('Invalid code');
    return;
  }
  const data = snapshot.val();
  if (data.user2) {
    showPairError('Pair already full');
    return;
  }
  const user = firebase.auth().currentUser;
  if (!user) {
      showPairError("User not logged in.");
      return;
  }
  const safeEmail = user.email.replace(/[.#$[\]]/g, '_');
  await pairRef.update({ user2: { joinedAt: Date.now(), email: safeEmail } });
  localStorage.setItem('pairCode', code);
  localStorage.setItem('userRole', 'user2');
  pairingScreen.classList.add('hidden');
  alert('Joined pair successfully!');
  // Proceed to app
}

function showPairError(msg) {
  pairError.textContent = msg;
  pairError.classList.remove('hidden');
}

function clearPairError() {
  pairError.classList.add('hidden');
  pairError.textContent = '';
}

if (createPairBtn) createPairBtn.onclick = createPair;
if (joinPairBtn) joinPairBtn.onclick = joinPair;

// Removed redundant onAuthStateChanged listener - logic moved to auth.js
