// =========================
// GLOBAL CONFIG & DATA
// =========================
const defaultData = { 
  profile: {
    name: "Björn Dahlman",
    initials: "BD",
    title: "Electrical Engineer",
    email: "bjorn.k.dahlman@gmail.com",
    presentation: "Engineer with a background in electronic communication systems at Chalmers."
  },
  skills: ["AutoCAD", "Python", "Matlab", "C/C++", "Visual Studio", "National Instruments", "RF Systems", "Embedded Systems"],
  education: [],
  experience: [],
  freetime: ["Sports", "Outdoor activities", "YouTube: 'Dalmanium'", "Coding"]
};

let botChartInstance = null;
let stockChartInstance = null;
let pathPrefix = "";

// =========================
// INITIALISERING
// =========================
document.addEventListener("DOMContentLoaded", async () => {
  initTheme();
  initMobileMenu();
  setText('copyright-year', new Date().getFullYear());

  // Isolerade anrop för att förhindra att ett fel kraschar hela sidan
  try { await loadPipelineStatus(); } catch (e) { console.error("MLS Status Error:", e); }
  try { await loadKalmanRankings(); } catch (e) { console.error("Kalman Error:", e); }
  try { await loadStockAIDashboard(); } catch (e) { console.error("Stock Dashboard Error:", e); }

  try { await renderBotChart(); } catch (e) { console.error("Bot Chart Error:", e); }
  try { await renderStockChart(); } catch (e) { console.error("Stock Chart Error:", e); }

  if (window.lucide) {
    window.lucide.createIcons();
  }
});

// =========================
// UI & MENYHANTERING
// =========================
function initMobileMenu() {
  const menuBtn = document.getElementById('menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuIcon = document.getElementById('menu-icon');
  const closeIcon = document.getElementById('close-icon');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.contains('h-auto') || mobileMenu.clientHeight > 0;
      if (isOpen) {
        mobileMenu.style.height = '0px';
        mobileMenu.classList.remove('h-auto');
        if (menuIcon) menuIcon.classList.remove('hidden');
        if (closeIcon) closeIcon.classList.add('hidden');
      } else {
        mobileMenu.style.height = 'auto';
        mobileMenu.classList.add('h-auto');
        if (menuIcon) menuIcon.classList.add('hidden');
        if (closeIcon) closeIcon.classList.remove('hidden');
      }
    });
  }
}

function initTheme() {
  const stored = localStorage.getItem("theme");
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (stored === "dark" || (!stored && systemDark)) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

function toggleTheme() {
  document.documentElement.classList.toggle("dark");
  const isDark = document.documentElement.classList.contains("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");

  [botChartInstance, stockChartInstance].forEach(chart => {
    if (chart) {
      const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
      const textColor = isDark ? '#94a3b8' : '#64748b';
      chart.options.scales.x.ticks.color = textColor;
      chart.options.scales.y.ticks.color = textColor;
      chart.options.scales.y.grid.color = gridColor;
      chart.update();
    }
  });
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

// =========================
// MLS PIPELINE DATA
// =========================
async function loadPipelineStatus() {
  try {
    const res = await fetch(`data/pipeline_status.json?t=${Date.now()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (data.last_sync) setText('mls-last-sync', data.last_sync);
    if (data.net_profit !== undefined) {
      const val = typeof data.net_profit === 'number' ? `${data.net_profit.toLocaleString('sv-SE')} SEK` : data.net_profit;
      setText('bot-profit', val);
    }
    if (data.total_bankroll !== undefined) {
      const val = typeof data.total_bankroll === 'number' ? `${data.total_bankroll.toLocaleString('sv-SE')} SEK` : data.total_bankroll;
      setText('bot-bankroll', val);
    }
  } catch (err) {
    console.warn("Kunde inte hämta MLS pipeline_status.json, sätter reservvärden.");
    const now = new Date().toISOString().split('T')[0];
    if (document.getElementById('mls-last-sync')?.textContent.includes('Loading')) setText('mls-last-sync', now);
    if (document.getElementById('bot-profit')?.textContent.includes('Loading')) setText('bot-profit', '0.00 SEK');
    if (document.getElementById('bot-bankroll')?.textContent.includes('Loading')) setText('bot-bankroll', '10 000.00 SEK');
  }
}

// =========================
// KALMAN RANKINGS
// =========================
async function loadKalmanRankings() {
  const topContainer = document.getElementById('kalman-top5-body');
  const bottomContainer = document.getElementById('kalman-bottom5-body');

  try {
    const res = await fetch(`data/kalman_rankings.json?t=${Date.now()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const top5 = data.top5 || [];
    const bottom5 = data.bottom5 || [];

    if (topContainer && top5.length > 0) {
      topContainer.innerHTML = top5.map((team, idx) => `
        <tr class="hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 transition border-b border-slate-100 dark:border-slate-800/50">
          <td class="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">
            <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400 mr-2">#${team.rank || team.position || (idx + 1)}</span>
            ${team.name || team.team}
          </td>
          <td class="text-right py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
            ${typeof team.rating === 'number' ? team.rating.toFixed(2) : (team.score || '-')}
          </td>
        </tr>
      `).join('');
    }

    if (bottomContainer && bottom5.length > 0) {
      bottomContainer.innerHTML = bottom5.map((team, idx) => `
        <tr class="hover:bg-rose-50/50 dark:hover:bg-rose-950/30 transition border-b border-slate-100 dark:border-slate-800/50">
          <td class="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">
            <span class="text-xs font-bold text-rose-600 dark:text-rose-400 mr-2">#${team.rank || team.position || (idx + 1)}</span>
            ${team.name || team.team}
          </td>
          <td class="text-right py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
            ${typeof team.rating === 'number' ? team.rating.toFixed(2) : (team.score || '-')}
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.warn("Kunde inte hämta kalman_rankings.json:", err);
    if (topContainer) topContainer.innerHTML = '<tr><td class="py-3 px-3 text-xs text-slate-500">Ingen rankningsdata tillgänglig.</td></tr>';
    if (bottomContainer) bottomContainer.innerHTML = '<tr><td class="py-3 px-3 text-xs text-slate-500">Ingen rankningsdata tillgänglig.</td></tr>';
  }
}

// =========================
// AI STOCK TRADING SYSTEM
// =========================
async function loadStockAIDashboard() {
  const tradesBody = document.getElementById('stock-trades-body');

  try {
    const res = await fetch(`data/ai_dashboard_data.json?t=${Date.now()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (data.updated_at) setText('stock-last-sync', data.updated_at);

    if (data.summary) {
      const bankroll = data.summary.current_bankroll || 100000;
      const profitPct = data.summary.profit_pct || 0;

      setText('stock-bankroll', bankroll.toLocaleString('sv-SE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' SEK');

      const profitElem = document.getElementById('stock-profit');
      if (profitElem) {
        profitElem.innerText = (profitPct >= 0 ? '+' : '') + profitPct.toFixed(2) + '%';
        profitElem.className = "text-2xl md:text-3xl font-extrabold " + (profitPct >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400");
      }
    }

    const trades = data.latest_trades_and_forecasts || [];
    if (tradesBody && trades.length > 0) {
      tradesBody.innerHTML = '';
      let totalInvested = 0;

      trades.forEach(row => {
        const date = row['Date'] || row['date'] || row['Datum'] || '-';
        const stock = row['Stock'] || row['stock'] || row['ticker'] || '-';
        const action = (row['Åtgärd'] || row['Action'] || row['action'] || 'BUY').toUpperCase();

        const rawAmount = row['ai_investment'] ?? row['position_size'] ?? 0;
        const amount = parseFloat(rawAmount) || 0;
        if (action === 'BUY' || action === 'KÖP') totalInvested += amount;

        const formattedAmount = amount > 0 ? `${amount.toLocaleString('sv-SE')} SEK` : '-';

        let badgeStyle = "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800";
        if (['SELL', 'SÄLJ', 'CLOSE', 'STÄNG'].includes(action)) {
          badgeStyle = "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400 border-rose-300 dark:border-rose-800";
        } else if (['HOLD', 'HÅLL'].includes(action)) {
          badgeStyle = "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700";
        }

        const rawPrice = row['price'] ?? row['Price'] ?? row['close_price'] ?? '';
        const parsedPrice = parseFloat(rawPrice);
        const formattedPrice = !isNaN(parsedPrice) ? `${parsedPrice.toFixed(2)} SEK` : '-';

        const rawKalman = row['kalman_value'] ?? row['Kalman Value'] ?? '';
        const parsedKalman = parseFloat(rawKalman);
        const formattedKalman = !isNaN(parsedKalman) ? `${parsedKalman.toFixed(2)} SEK` : '-';

        const argument = row['argument'] || row['AI Argument & Forecast'] || row['reasoning'] || '-';

        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors border-b border-slate-100 dark:border-slate-800/50";
        tr.innerHTML = `
          <td class="py-3.5 px-4 text-xs font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">${date}</td>
          <td class="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">${stock}</td>
          <td class="py-3.5 px-4">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeStyle}">
              ${action}
            </span>
          </td>
          <td class="py-3.5 px-4 text-slate-700 dark:text-slate-300 whitespace-nowrap">${formattedPrice}</td>
          <td class="py-3.5 px-4 text-slate-700 dark:text-slate-300 whitespace-nowrap">${formattedKalman}</td>
          <td class="py-3.5 px-4 font-semibold text-slate-900 dark:text-white whitespace-nowrap">${formattedAmount}</td>
          <td class="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">${argument}</td>
        `;
        tradesBody.appendChild(tr);
      });

      if (totalInvested > 0) setText('stock-invested', `${totalInvested.toLocaleString('sv-SE')} SEK`);
    }
  } catch (err) {
    console.warn("Kunde inte hämta ai_dashboard_data.json:", err);
  }
}

// =========================
// CSV PARSING & GRAFER
// =========================
function parseCsvData(csvText) {
  const labels = [];
  const dataPoints = [];

  if (!csvText || csvText.trim().startsWith('<')) return { labels, dataPoints };

  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return { labels, dataPoints };

  const delimiter = lines[0].includes(';') ? ';' : ',';
  const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase());

  let valIdx = headers.findIndex(h => h.includes('bankroll') || h.includes('value') || h.includes('portfolio') || h.includes('close') || h.includes('balance'));
  if (valIdx === -1) valIdx = headers.length - 1;

  let dateIdx = headers.findIndex(h => h.includes('date') || h.includes('datum') || h.includes('time'));
  if (dateIdx === -1) dateIdx = 0;

  for (let i = 1; i < lines.length; i++) {
    const columns = lines[i].split(delimiter);
    if (columns.length > valIdx) {
      const rawDate = columns[dateIdx] ? columns[dateIdx].trim() : '';
      const valueStr = columns[valIdx] ? columns[valIdx].trim() : '';

      if (!valueStr || valueStr.toLowerCase() === 'nan') continue;
      const value = parseFloat(valueStr.replace(',', '.'));

      if (!isNaN(value)) {
        labels.push(rawDate.split(' ')[0]);
        dataPoints.push(value);
      }
    }
  }

  return { labels, dataPoints };
}

function buildChart(canvasId, labels, dataPoints, label, lineColor, fillColor) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || typeof Chart === 'undefined') return null;

  const isDark = document.documentElement.classList.contains("dark");
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
  const textColor = isDark ? '#94a3b8' : '#64748b';

  return new Chart(canvas, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: label,
        data: dataPoints,
        borderColor: lineColor,
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: lineColor,
        fill: true,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 200);
          gradient.addColorStop(0, fillColor);
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
          return gradient;
        }
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: textColor, maxTicksLimit: 6 }
        },
        y: {
          grid: { color: gridColor },
          ticks: {
            color: textColor,
            callback: (val) => `${val.toLocaleString('sv-SE')} kr`
          }
        }
      }
    }
  });
}

async function renderBotChart() {
  try {
    const res = await fetch(`data/bot_bankroll.csv?t=${Date.now()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const csvText = await res.text();
    let { labels, dataPoints } = parseCsvData(csvText);

    if (dataPoints.length === 0) {
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun'];
      dataPoints = [10000, 10250, 10100, 10600, 10850, 11200];
    }

    botChartInstance = buildChart('bot-profit-chart', labels, dataPoints, 'Bankroll', '#2563eb', 'rgba(37, 99, 235, 0.2)');
  } catch (err) {
    console.warn("Kunde inte skapa MLS-grafen:", err);
  }
}

async function renderStockChart() {
  try {
    const res = await fetch(`data/stock_bankroll.csv?t=${Date.now()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const csvText = await res.text();
    let { labels, dataPoints } = parseCsvData(csvText);

    if (dataPoints.length === 0) {
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun'];
      dataPoints = [100000, 99800, 100200, 99500, 99100, 99507.56];
    }

    stockChartInstance = buildChart('stock-profit-chart', labels, dataPoints, 'Stock Portfolio', '#10b981', 'rgba(16, 185, 129, 0.2)');
  } catch (err) {
    console.warn("Kunde inte skapa aktiegrafen:", err);
  }
}
