// Analytics Module

let analyticsChart = null;

function getDateRange(days) {
  const dates = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

function aggregateHabitData(days) {
  const user = state.currentUser;
  const habits = state.habits?.[user] || [];
  const dateRange = getDateRange(days);
  const data = dateRange.map(date => {
    let count = 0;
    habits.forEach(habit => {
      const chain = habit.chain || [];
      const trackedDate = state.lastTrackedDate?.[`${user}-${habit.id}`];
      if (trackedDate === date && chain[chain.length - 1]) count++;
    });
    return count;
  });
  return { labels: dateRange, data };
}

function renderAnalyticsChart(days) {
  const ctx = document.getElementById('analyticsChart').getContext('2d');
  const { labels, data } = aggregateHabitData(days);

  if (analyticsChart) analyticsChart.destroy();

  analyticsChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Habits Completed',
        data,
        fill: true,
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: 'rgba(99, 102, 241, 1)',
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true },
        tooltip: { mode: 'index', intersect: false }
      },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Completed Habits' } },
        x: { title: { display: true, text: 'Date' } }
      }
    }
  });
}

function exportData(format) {
  const user = state.currentUser;
  const habits = state.habits?.[user] || [];
  const exportObj = habits.map(h => ({
    id: h.id,
    name: h.name,
    category: h.category,
    bestStreak: h.bestStreak,
    chain: h.chain
  }));

  if (format === 'json') {
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    downloadFile(url, 'habits.json');
  } else if (format === 'csv') {
    const headers = ['id', 'name', 'category', 'bestStreak', 'chain'];
    const rows = exportObj.map(h => [
      h.id,
      `"${h.name}"`,
      `"${h.category}"`,
      h.bestStreak,
      `"${h.chain.join(',')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    downloadFile(url, 'habits.csv');
  }
}

function downloadFile(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

document.getElementById('analytics-week-btn').onclick = () => renderAnalyticsChart(7);
document.getElementById('analytics-month-btn').onclick = () => renderAnalyticsChart(30);
document.getElementById('export-json-btn').onclick = () => exportData('json');
document.getElementById('export-csv-btn').onclick = () => exportData('csv');
