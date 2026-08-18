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
// THEME & UTILITIES
// =========================
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
// PIPELINE STATUS & MLS DATA
// =========================
async function loadPipelineStatus() {
  try {
    const res = await fetch(`${pathPrefix}data/pipeline_status.json?t=${Date.now()}`);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();

    if (data.last_sync) setText('mls-last-sync', data.last_sync);
    if (data.next_matchday) setText('mls-next-matchday', data.next_matchday);
    if (data.net_profit !== undefined) setText('bot-profit', `${data.net_profit.toLocaleString('sv-SE')} SEK`);
    if (data.total_bankroll !== undefined) setText('bot-bankroll', `${data.total_bankroll.toLocaleString('sv-SE')} SEK`);
  } catch (err) {
    console.warn("Pipeline status kunde inte hämtas, sätter standardvärden:", err);
    const now = new Date().toISOString().split('T')[0];
    if (document.getElementById('mls-last-sync')?.textContent.includes('Loading')) setText('mls-last-sync', now);
    if (document.getElementById('mls-next-matchday')?.textContent.includes('Loading')) setText('mls-next-matchday', 'Scheduled');
  }
}

// =========================
// KALMAN RANKINGS
// =========================
async function loadKalmanRankings() {
  const topContainer = document.getElementById('kalman-top5-body') || document.getElementById('top-rankings-container') || document.getElementById('kalman-top5');
  const bottomContainer = document.getElementById('kalman-bottom5-body') || document.getElementById('bottom-rankings-container') || document.getElementById('kalman-bottom5');

  try {
    const res = await fetch(`${pathPrefix}data/kalman_rankings.json?t=${Date.now()}`);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    
    const top5 = data.top5 || [];
    const bottom5 = data.bottom5 || [];

    if (topContainer && top5.length > 0) {
      topContainer.innerHTML = top5.map(team => `
        <tr class="hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30 transition border-b border-slate-100 dark:border-slate-800/50">
          <td class="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">
            <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400 mr-2">#${team.rank || team.position || '-'}</span>
            ${team.name || team.team}
          </td>
          <td class="text-right py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
            ${typeof team.rating === 'number' ? team.rating.toFixed(2) : (team.score || '-')}
          </td>
        </tr>
      `).join('');
    }

    if (bottomContainer && bottom5.length > 0) {
      bottomContainer.innerHTML = bottom5.map(team => `
        <tr class="hover:bg-rose-100/50 dark:hover:bg-rose-900/30 transition border-b border-slate-100 dark:border-slate-800/50">
          <td class="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">
            <span class="text-xs font-bold text-rose-600 dark:text-rose-400 mr-2">#${team.rank || team.position || '-'}</span>
            ${team.name || team.team}
          </td>
          <td class="text-right py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
            ${typeof team.rating === 'number' ? team.rating.toFixed(2) : (team.score || '-')}
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.warn("Kalman rankings kunde inte hämtas:", err);
    if (topContainer) topContainer.innerHTML = '<tr><td class="py-3 px-3 text-xs text-slate-500">Data uppdateras...</td></tr>';
    if (bottomContainer) bottomContainer.innerHTML = '<tr><td class="py-3 px-3 text-xs text-slate-500">Data uppdateras...</td></tr>';
  }
}

// =========================
// AI STOCK DASHBOARD & TRADES
// =========================
async function loadStockAIDashboard() {
  const tradesBody = document.getElementById('stock-trades-body');

  try {
    const res = await fetch(`${pathPrefix}data/ai_dashboard_data.json?t=${Date.now()}`);
    if (!res.ok) throw new Error("HTTP " + res.status);
    
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

      trades.slice().reverse().forEach(row => {
        const date = row['Date'] || row['date'] || row['Datum'] || '-';
        const stock = row['Stock'] || row['stock'] || row['ticker'] || row['symbol'] || '-';
        const action = row['Åtgärd'] || row['Action'] || row['action'] || 'BUY';
        
        const rawAmount = row['ai_investment'] ?? row['position_size'] ?? 0;
        const amount = parseFloat(rawAmount) || 0;
        if (action === 'KÖP' || action === 'BUY') totalInvested += amount;

        const formattedAmount = amount > 0 ? `${amount.toLocaleString('sv-SE')} SEK` : '-';

        let badgeStyle = "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800";
        if (action === 'SÄLJ' || action === 'SELL' || action === 'CLOSE' || action === 'STÄNG') {
          badgeStyle = "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400 border-rose-300 dark:border-rose-800";
        } else if (action === 'HÅLL' || action === 'HOLD') {
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

      if (totalInvested > 0) setText('stock-invested', totalInvested.toLocaleString('sv-SE') + ' SEK');
    }
  } catch (err) {
    console.warn("Kunde inte ladda AI stock dashboard JSON:", err);
  }
}

// =========================
// CSV PARSING & GRAFER
// =========================
function parseCsvData(csvText, isBotChart = false) {
  const labels = [];
  const dataPoints = [];

  // Om svaret är HTML (t.ex. vid 404-sida), avbryt säkert
  if (!csvText || csvText.trim().startsWith('<')) return { labels, dataPoints };

  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return { labels, dataPoints };

  const delimiter = lines[0].includes(';') ? ';' : ',';
  const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase());
  
  let valIdx = headers.findIndex(h => h.includes('bankroll') || h.includes('value') || h.includes('portfolio') || h.includes('värde') || h.includes('close') || h.includes('balance'));
  if (valIdx === -1) valIdx = headers.length - 1;

  let dateIdx = headers.findIndex(h => h.includes('date') || h.includes('datum') || h.includes('time'));
  if (dateIdx === -1) dateIdx = 0;

  let lastRawDate = null;

  for (let i = 1; i < lines.length; i++) {
    const columns = lines[i].split(delimiter);
    if (columns.length > valIdx) {
      const rawDate = columns[dateIdx] ? columns[dateIdx].trim() : '';
      const valueStr = columns[valIdx] ? columns[valIdx].trim() : '';
      
      if (!valueStr || valueStr.toLowerCase() === 'nan') continue;
      const value = parseFloat(valueStr.replace(',', '.'));
      
      if (!isNaN(value)) {
        lastRawDate = rawDate;
        labels.push(rawDate.split(' ')[0]);
        dataPoints.push(value);
      }
    }
  }

  if (isBotChart && lastRawDate) {
    setText('mls-last-sync', lastRawDate.split(' ')[0]);
  }

  return { labels, dataPoints };
}

function buildChartConfig(labels, dataPoints, label, lineColor, fillColor, isDark) {
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
  const textColor = isDark ? '#94a3b8' : '#64748b';

  return {
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
  };
}

async function loadAndRenderChart(canvasId, csvUrl, label, lineColor, fillColor, existingChartInstance) {
  const chartCanvas = document.getElementById(canvasId);
  if (!chartCanvas || typeof Chart === 'undefined') return null;

  try {
    const res = await fetch(`${pathPrefix}${csvUrl}?t=${Date.now()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const csvText = await res.text();
    
    const isBot = (canvasId === 'bot-profit-chart');
    let { labels, dataPoints } = parseCsvData(csvText, isBot);
    
    // Generera reservpunkter om CSV är tom eller saknas så grafen inte blir blank
    if (dataPoints.length === 0) {
      labels = ['Start', 'Nu'];
      dataPoints = canvasId === 'bot-profit-chart' ? [10000, 10000] : [100000, 99507.56];
    }

    const latestValue = dataPoints[dataPoints.length - 1];
    
    if (canvasId === 'bot-profit-chart') {
      const bankrollEl = document.getElementById('bot-bankroll');
      if (bankrollEl && bankrollEl.textContent.includes('Loading')) {
        bankrollEl.textContent = `${latestValue.toLocaleString('sv-SE', { minimumFractionDigits: 2 })} SEK`;
      }

      const netProfit = latestValue - 10000;
      const profitEl = document.getElementById('bot-profit');
      if (profitEl && profitEl.textContent.includes('Loading')) {
        profitEl.textContent = `${netProfit.toLocaleString('sv-SE', { minimumFractionDigits: 2 })} SEK`;
        profitEl.className = netProfit >= 0 
          ? "text-2xl md:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1" 
          : "text-2xl md:text-3xl font-extrabold text-rose-600 dark:text-rose-400 mt-1";
      }
    }

    if (existingChartInstance) existingChartInstance.destroy();
    
    const isDark = document.documentElement.classList.contains("dark");
    const config = buildChartConfig(labels, dataPoints, label, lineColor, fillColor, isDark);
    return new Chart(chartCanvas, config);
  } catch (err) {
    console.warn(`Kunde inte rita graf för ${canvasId}:`, err);
    return existingChartInstance;
  }
}

// =========================
// INITIALISERING
// =========================
document.addEventListener("DOMContentLoaded", async () => {
  initTheme();

  // Kör alla hämtningar i helt isolerade try-blocks så att ett fel i en fil inte kraschar resten
  try { await loadPipelineStatus(); } catch (e) { console.error(e); }
  try { await loadKalmanRankings(); } catch (e) { console.error(e); }
  try { await loadStockAIDashboard(); } catch (e) { console.error(e); }

  try {
    botChartInstance = await loadAndRenderChart(
      'bot-profit-chart',
      'data/bot_bankroll.csv',
      'Bankroll',
      '#2563eb',
      'rgba(37, 99, 235, 0.2)',
      botChartInstance
    );
  } catch (e) { console.error(e); }

  try {
    stockChartInstance = await loadAndRenderChart(
      'stock-profit-chart',
      'data/stock_bankroll.csv',
      'Stock Portfolio',
      '#10b981',
      'rgba(16, 185, 129, 0.2)',
      stockChartInstance
    );
  } catch (e) { console.error(e); }
  
  if (window.lucide) window.lucide.createIcons();
});
