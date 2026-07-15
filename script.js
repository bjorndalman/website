// =========================
//         GLOBAL CONFIG
// =========================
const defaultData = {
  profile: {
    name: "Björn Dahlman",
    initials: "BD",
    title: "Electrical Engineer",
    email: "bjorn.k.dahlman@gmail.com",
    presentation: "Engineer with a background in electronic communication systems at Chalmers..."
  },
  skills: ["AutoCAD", "Python", "Matlab", "C/C++", "Visual Studio", "National Instruments", "RF Systems", "Embedded Systems", "Automotive Technology", "Telecommunication"],
  education: [ /* ... din utbildningsdata ... */ ],
  experience: [ /* ... din erfarenhetsdata ... */ ],
  freetime: ["Sports", "Outdoor activities", "YouTube: 'Dalmanium'", "Coding"]
};

// ... (Behåll din befintliga swedishData här) ...

let botChartInstance = null;
let appData;

// =========================
//     SPRÅKHANTERING
// =========================
function loadLanguageData() {
  const isSwedishPage = window.location.pathname.toLowerCase().includes('/sv/');
  appData = isSwedishPage ? swedishData : defaultData;
}

// =========================
//      THEME HANDLING
// =========================
function initTheme() {
  const stored = localStorage.getItem("theme");
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (stored === "dark" || (!stored && systemDark)) {
    document.documentElement.classList.add("dark");
  }
}

function toggleTheme() {
  document.documentElement.classList.toggle("dark");
  const isDark = document.documentElement.classList.contains("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  if (botChartInstance) {
    const isDarkMode = isDark;
    botChartInstance.options.scales.x.ticks.color = isDarkMode ? '#94a3b8' : '#64748b';
    botChartInstance.options.scales.y.ticks.color = isDarkMode ? '#94a3b8' : '#64748b';
    botChartInstance.options.scales.y.grid.color = isDarkMode ? '#334155' : '#e2e8f0';
    botChartInstance.update();
  }
}

// =========================
//         RENDERING
// =========================
function render() {
  // ... (Behåll dina befintliga render-funktioner här) ...
  if (window.lucide) window.lucide.createIcons();
}

// ==========================================
// AUTOMATION: FETCH LIVE BOT STATS & CHART
// ==========================================
// ... (Din övriga kod ovanför)

function renderBotChart() {
  const chartCanvas = document.getElementById('bot-profit-chart');
  if (!chartCanvas) return;

  fetch('data/portfolio_summary.csv')
    .then(response => response.text())
    .then(csvText => {
      const lines = csvText.trim().split('\n');
      if (lines.length <= 1) return;

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const dateIndex = headers.findIndex(h => h.includes('dat'));
      const bankrollIndex = headers.findIndex(h => h.includes('kassa') || h.includes('nuvarande'));

      const labels = [];
      const dataPoints = [];

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const columns = lines[i].split(',');
        
        // Rensar strängar och konverterar till float
        const date = columns[dateIndex].replace(/"/g, '').trim();
        const val = parseFloat(columns[bankrollIndex].replace(/"/g, '').trim());
        
        if (!isNaN(val)) {
          labels.push(date);
          dataPoints.push(val);
        }
      }

      const isDark = document.documentElement.classList.contains('dark');
      if (botChartInstance) botChartInstance.destroy();

      botChartInstance = new Chart(chartCanvas, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Total Bankroll',
            data: dataPoints,
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            borderWidth: 3,
            tension: 0.3,
            fill: true,
            pointRadius: 5
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: isDark ? '#94a3b8' : '#64748b' } },
            y: { 
              beginAtZero: false, 
              grid: { color: isDark ? '#334155' : '#e2e8f0' },
              ticks: { 
                color: isDark ? '#94a3b8' : '#64748b', 
                callback: v => v.toLocaleString('sv-SE') + ' kr' 
              } 
            }
          }
        }
      });
    })
    .catch(err => console.log("Kunde inte ladda diagram:", err));
}

// =========================
//          INIT
// =========================
document.addEventListener("DOMContentLoaded", () => {
  loadLanguageData();
  initTheme();
  render();
  fetchBotStats();
  renderBotChart();
  // ... (övrig init-logik som scroll-animationer etc) ...
});
