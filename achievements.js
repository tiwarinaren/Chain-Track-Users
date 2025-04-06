// Achievements Module

const milestones = [
  { days: 7, label: '7-Day Streak', icon: '🔥' },
  { days: 30, label: '30-Day Streak', icon: '🏅' },
  { days: 100, label: '100-Day Streak', icon: '🏆' }
];

function updateAchievements() {
  const user = state.currentUser;
  const habits = state.habits?.[user] || [];
  const container = document.getElementById('achievements-list');
  if (!container) return;

  container.innerHTML = '';

  milestones.forEach(milestone => {
    const achieved = habits.some(h => (h.bestStreak || 0) >= milestone.days);
    const badge = document.createElement('div');
    badge.className = 'flex flex-col items-center justify-center p-3 rounded-lg border text-center ' +
      (achieved ? 'bg-green-100 dark:bg-green-900 border-green-400 dark:border-green-600' : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 opacity-50');
    badge.innerHTML = `
      <div class="text-2xl mb-1">${milestone.icon}</div>
      <div class="text-xs font-semibold">${milestone.label}</div>
    `;
    container.appendChild(badge);
  });
}

function checkForNewAchievements() {
  const user = state.currentUser;
  const habits = state.habits?.[user] || [];
  milestones.forEach(milestone => {
    const hasAchieved = habits.some(h => (h.bestStreak || 0) === milestone.days);
    if (hasAchieved) {
      showNotification(`Achievement unlocked: ${milestone.label}!`, 'success');
      try {
        if (typeof confetti === 'function') {
          confetti({ particleCount: 100, spread: 70, origin: { x: 0.5, y: 0.5 }, zIndex: 100 });
        }
      } catch {}
    }
  });
}

// Call updateAchievements whenever habits change
const originalRenderHabits = window.renderHabits;
window.renderHabits = function() {
  if (originalRenderHabits) originalRenderHabits();
  updateAchievements();
};
