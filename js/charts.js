/**
 * js/charts.js
 * Hanterar diagram och datainläsning för Fotboll & Kalman-modeller.
 */

window.chartInstances = window.chartInstances || {};

function destroyExistingChart(canvasId) {
    if (window.chartInstances[canvasId]) {
        window.chartInstances[canvasId].destroy();
        delete window.chartInstances[canvasId];
    }
}

// Byt ut pathPrefix vid behov
if (typeof pathPrefix === 'undefined') {
    var pathPrefix = window.pathPrefix || (window.location.pathname.includes('/sv/') ? '../' : './');
}

// ==========================================
// HÄMTA OCH RENDERA FOTBOLLSDATA (MLS / AI)
// ==========================================

async function loadFootballAIDashboard() {
    // Stödjer bot-*, mls-* och football-* ID:n
    const profitElem = document.getElementById('bot-profit') || document.getElementById('mls-profit') || document.getElementById('football-profit');
    const bankrollElem = document.getElementById('bot-bankroll') || document.getElementById('mls-bankroll') || document.getElementById('football-bankroll');
    const returnElem = document.getElementById('bot-return-pct') || document.getElementById('mls-return-pct') || document.getElementById('football-return-pct');
    const syncElem = document.getElementById('mls-last-sync') || document.getElementById('bot-last-sync') || document.getElementById('football-last-sync');
    const nextMatchdayElem = document.getElementById('mls-next-matchday') || document.getElementById('bot-next-matchday');
    const betsBody = document.getElementById('bot-bets-body') || document.getElementById('mls-bets-body') || document.getElementById('football-bets-body');
    const chartCanvas = document.getElementById('bot-profit-chart') || document.getElementById('football-profit-chart') || document.getElementById('mls-profit-chart');

    // Om vi inte står på fotbollssidan, avbryt tyst
    if (!profitElem && !bankrollElem && !betsBody && !chartCanvas) return;

    try {
        const res = await fetch(`${pathPrefix}data/football_ai_dashboard_data.json?t=${Date.now()}`);
        if (!res.ok) throw new Error("Kunde inte hämta football_ai_dashboard_data.json");

        const data = await res.json();

        // 1. Senaste synkdatum & Nästa omgång
        if (syncElem) {
            const syncDate = data.updated_at || (data.summary && data.summary.last_sync);
            if (syncDate) syncElem.innerText = syncDate;
        }

        if (nextMatchdayElem && data.summary && data.summary.next_matchday) {
            nextMatchdayElem.innerText = data.summary.next_matchday;
        }

        // 2. KPI-nyckeltal (Nettovinst, Kassa, Avkastning)
        if (data.summary) {
            const bankroll = data.summary.current_bankroll ?? data.summary.total_bankroll ?? 10000;
            const profitSek = data.summary.profit_sek ?? data.summary.net_profit ?? 0;
            const profitPct = data.summary.profit_pct ?? data.summary.return_pct ?? 0;

            if (bankrollElem) {
                bankrollElem.innerText = bankroll.toLocaleString('sv-SE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' SEK';
            }

            if (profitElem) {
                profitElem.innerText = (profitSek >= 0 ? '+' : '') + profitSek.toLocaleString('sv-SE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' SEK';
                profitElem.className = "text-2xl md:text-3xl font-extrabold " + (profitSek >= 0 ? "text-emerald-500" : "text-rose-500");
            }

            if (returnElem) {
                returnElem.innerText = (profitPct >= 0 ? '+' : '') + profitPct.toFixed(2) + '%';
                returnElem.className = "text-2xl md:text-3xl font-extrabold " + (profitPct >= 0 ? "text-emerald-500" : "text-rose-500");
            }
        }

        // 3. Tabell för Bets/Matcher
        if (betsBody && data.latest_bets) {
            if (data.latest_bets.length === 0) {
                betsBody.innerHTML = `<tr><td colspan="6" class="py-6 text-center text-slate-500">Inga aktiva spel registrerade ännu.</td></tr>`;
            } else {
                betsBody.innerHTML = '';
                data.latest_bets.slice().reverse().forEach(row => {
                    const tr = document.createElement('tr');
                    tr.className = "hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors";
                    tr.innerHTML = `
                        <td class="py-3.5 px-4 text-xs font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">${row.date || '-'}</td>
                        <td class="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">${row.match || '-'}</td>
                        <td class="py-3.5 px-4 text-slate-700 dark:text-slate-300 whitespace-nowrap">${row.prediction || '-'}</td>
                        <td class="py-3.5 px-4 text-slate-700 dark:text-slate-300 whitespace-nowrap">${row.odds || '-'}</td>
                        <td class="py-3.5 px-4 font-semibold text-slate-900 dark:text-white whitespace-nowrap">${row.stake ? row.stake + ' SEK' : '-'}</td>
                        <td class="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">${row.reasoning || '-'}</td>
                    `;
                    betsBody.appendChild(tr);
                });
            }
        }

        // 4. Rendera Diagrammet
        if (data.history && Array.isArray(data.history)) {
            renderFootballChart(data.history);
        }

    } catch (err) {
        console.warn("Kunde inte ladda fotbollsdata:", err);
        if (profitElem) profitElem.innerText = "0,00 SEK";
        if (bankrollElem) bankrollElem.innerText = "0,00 SEK";
        if (returnElem) returnElem.innerText = "0.00%";
    }
}

// ==========================================
// FOTBOLL & KALMAN-MODELL CHART RENDER
// ==========================================

function renderFootballChart(historyData) {
    const ctx = document.getElementById('bot-profit-chart') || document.getElementById('football-profit-chart') || document.getElementById('mls-profit-chart');
    if (!ctx) return;

    const canvasId = ctx.id;
    destroyExistingChart(canvasId);

    const labels = historyData.map(item => item.date || item.Date || '');
    const profitValues = historyData.map(item => item.profit ?? item.Profit ?? 0);

    window.chartInstances[canvasId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Football Net Profit (SEK)',
                data: profitValues,
                borderColor: '#10b981', // Grön färg för vinstkurvan
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.3,
                pointRadius: 3,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { mode: 'index', intersect: false }
            },
            scales: {
                x: { grid: { display: false } },
                y: { grid: { color: 'rgba(148, 163, 184, 0.1)' } }
            }
        }
    });
}

// Kör vid laddning
document.addEventListener('DOMContentLoaded', () => {
    loadFootballAIDashboard();
});
