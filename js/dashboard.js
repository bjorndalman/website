// js/dashboard.js

// Hjälpfunktion för att hämta rätt relativ eller absolut prefix
function getPathPrefix() {
    const isSwedish = (typeof window.isSwedishPage !== 'undefined') 
        ? window.isSwedishPage 
        : window.location.pathname.toLowerCase().includes('/sv/');
    return isSwedish ? "../" : "./";
}

async function loadPortfolioData() {
    const pathPrefix = getPathPrefix();
    try {
        const response = await fetch(`${pathPrefix}data/portfolio_summary.json?t=${Date.now()}`);
        if (!response.ok) return;
        const data = await response.json();

        const totalValEl = document.getElementById('portfolio-total-value');
        if (totalValEl && data.total_value) {
            totalValEl.textContent = `${data.total_value.toLocaleString('sv-SE')} SEK`;
        }

        const returnEl = document.getElementById('portfolio-total-return');
        if (returnEl && data.total_return) {
            returnEl.textContent = data.total_return;
        }
    } catch (error) {
        console.error("Fel vid inläsning av portfolio_summary.json:", error);
    }
}

async function loadStockAIDashboard() {
    const tradesBody = document.getElementById('stock-trades-body');
    const pathPrefix = getPathPrefix();
    
    try {
        const res = await fetch(`${pathPrefix}data/stock_ai_dashboard_data.json?t=${Date.now()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}: Could not fetch stock_ai_dashboard_data.json`);
        
        const data = await res.json();
        
        if (data.updated_at) {
            const syncElem = document.getElementById('stock-last-sync');
            if (syncElem) syncElem.innerText = data.updated_at;
        }

        if (data.summary) {
            const bankroll = data.summary.current_bankroll ?? data.summary.total_bankroll ?? 100000;
            const profitPct = data.summary.profit_pct ?? data.summary.return_pct ?? 0;
            const profitSek = data.summary.profit_sek ?? data.summary.net_profit ?? 0;
            const investedVal = data.summary.invested ?? 0;

            const bankrollElem = document.getElementById('stock-bankroll');
            if (bankrollElem) {
                bankrollElem.innerText = bankroll.toLocaleString('sv-SE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' SEK';
            }
            
            const returnElem = document.getElementById('stock-return-pct');
            if (returnElem) {
                returnElem.innerText = (profitPct >= 0 ? '+' : '') + profitPct.toFixed(2) + '%';
                returnElem.className = "text-2xl md:text-3xl font-extrabold " + (profitPct >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400");
            }

            const profitElem = document.getElementById('stock-profit');
            if (profitElem) {
                profitElem.innerText = (profitSek >= 0 ? '+' : '') + profitSek.toLocaleString('sv-SE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' SEK';
                profitElem.className = "text-2xl md:text-3xl font-extrabold " + (profitSek >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400");
            }

            const investedElem = document.getElementById('stock-invested');
            if (investedElem) {
                investedElem.innerText = investedVal.toLocaleString('sv-SE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' SEK';
            }
        }

        const trades = data.latest_trades_and_forecasts || [];

        if (tradesBody) {
            if (trades.length === 0) {
                tradesBody.innerHTML = `<tr><td colspan="7" class="py-6 text-center text-slate-500">Inga aktiva affärer registrerade ännu.</td></tr>`;
            } else {
                tradesBody.innerHTML = '';
                const actionMap = {
                    'KÖP': 'BUY', 'BUY': 'BUY',
                    'SÄLJ': 'SELL', 'SELL': 'SELL',
                    'STÄNG': 'CLOSED', 'STÄNGD': 'CLOSED', 'CLOSE': 'CLOSED', 'CLOSED': 'CLOSED',
                    'HÅLL': 'HOLD', 'HOLD': 'HOLD', 'NEUTRAL': 'HOLD',
                    'PAUS': 'PAUSED'
                };

                trades.slice().reverse().forEach(row => {
                    const date = row['Date'] || row['date'] || row['Datum'] || '-';
                    const stock = row['Stock'] || row['stock'] || row['ticker'] || row['symbol'] || row['Aktie'] || row['namn'] || row['Name'] || '-';

                    const rawAction = row['Åtgärd'] || row['åtgärd'] || row['Action'] || row['action'] || row['Status'] || row['status'] || 'BUY';
                    const actionUpper = String(rawAction).trim().toUpperCase();
                    const displayAction = actionMap[actionUpper] || actionUpper;
                    
                    const rawAmount = row['ai_investment'] ?? row['position_size'] ?? row['Rek. Investering (kr)'] ?? row['AI Investering (kr)'] ?? row['Trade Amount'] ?? 0;
                    const amount = parseFloat(rawAmount) || 0;

                    const formattedAmount = amount > 0 
                        ? `${amount.toLocaleString('sv-SE')} SEK` 
                        : '-';

                    let badgeStyle = "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800";
                    
                    if (displayAction === 'SELL' || displayAction === 'CLOSED') {
                        badgeStyle = "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400 border-rose-300 dark:border-rose-800";
                    } else if (displayAction === 'HOLD' || displayAction === 'PAUSED') {
                        badgeStyle = "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700";
                    }

                    const rawPrice = row['price'] ?? row['Price'] ?? row['Aktuell Kurs'] ?? row['close_price'] ?? row['current_price'] ?? '';
                    const parsedPrice = parseFloat(rawPrice);
                    const formattedPrice = !isNaN(parsedPrice) ? `${parsedPrice.toFixed(2)} SEK` : (rawPrice || '-');

                    const rawKalman = row['kalman_value'] ?? row['Kalman Value'] ?? row['Kalman-värde'] ?? row['fair_value'] ?? '';
                    const parsedKalman = parseFloat(rawKalman);
                    const formattedKalman = !isNaN(parsedKalman) ? `${parsedKalman.toFixed(2)} SEK` : (rawKalman || '-');

                    const argument = row['argument'] || row['AI Argument & Forecast'] || row['Motivering'] || row['reasoning'] || row['forecast'] || row['ai_forecast'] || row['comment'] || row['analysis'] || '-';

                    const tr = document.createElement('tr');
                    tr.className = "hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors";
                    tr.innerHTML = `
                        <td class="py-3.5 px-4 text-xs font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">${date}</td>
                        <td class="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">${stock}</td>
                        <td class="py-3.5 px-4">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeStyle}">
                                ${displayAction}
                            </span>
                        </td>
                        <td class="py-3.5 px-4 text-slate-700 dark:text-slate-300 whitespace-nowrap">${formattedPrice}</td>
                        <td class="py-3.5 px-4 text-slate-700 dark:text-slate-300 whitespace-nowrap">${formattedKalman}</td>
                        <td class="py-3.5 px-4 font-semibold text-slate-900 dark:text-white whitespace-nowrap">${formattedAmount}</td>
                        <td class="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">${argument}</td>
                    `;
                    tradesBody.appendChild(tr);
                });
            }
        }

        // Rendera aktiegrafen inuti try-blocket
        if (data.history && Array.isArray(data.history) && typeof renderStockChart === 'function') {
            renderStockChart(data.history);
        }

    } catch (err) {
        console.warn("Could not load AI stock dashboard data:", err);
    }
}

async function fetchStockStats() {
    return;
}

async function loadFootballAIDashboard() {
    const profitElem = document.getElementById('bot-profit') || document.getElementById('mls-profit') || document.getElementById('football-profit');
    const bankrollElem = document.getElementById('bot-bankroll') || document.getElementById('mls-bankroll') || document.getElementById('football-bankroll');
    const returnElem = document.getElementById('bot-return-pct') || document.getElementById('mls-return-pct') || document.getElementById('football-return-pct');
    const betsBody = document.getElementById('bot-bets-body') || document.getElementById('mls-bets-body') || document.getElementById('football-bets-body');
    const syncElem = document.getElementById('mls-last-sync') || document.getElementById('bot-last-sync') || document.getElementById('football-last-sync');
    const nextMatchdayElem = document.getElementById('mls-next-matchday') || document.getElementById('bot-next-matchday');
    const chartCanvas = document.getElementById('bot-profit-chart') || document.getElementById('football-profit-chart') || document.getElementById('mls-profit-chart');

    if (!profitElem && !bankrollElem && !betsBody && !syncElem && !chartCanvas) return;

    const pathPrefix = getPathPrefix();

    try {
        const res = await fetch(`${pathPrefix}data/football_ai_dashboard_data.json?t=${Date.now()}`);
        if (!res.ok) throw new Error(`HTTP Error ${res.status}: Kunde inte hämta football_ai_dashboard_data.json`);
        
        const data = await res.json();

        if (syncElem && (data.updated_at || data.summary?.last_sync)) {
            syncElem.innerText = data.updated_at || data.summary.last_sync;
        }

        if (nextMatchdayElem && data.summary?.next_matchday) {
            nextMatchdayElem.innerText = data.summary.next_matchday;
        }

        if (data.summary) {
            const bankroll = data.summary.current_bankroll ?? data.summary.total_bankroll ?? 10000;
            const profitSek = data.summary.profit_sek ?? data.summary.net_profit ?? 0;
            const profitPct = data.summary.profit_pct ?? data.summary.return_pct ?? 0;

            if (bankrollElem) {
                bankrollElem.innerText = bankroll.toLocaleString('sv-SE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' SEK';
            }

            if (profitElem) {
                profitElem.innerText = (profitSek >= 0 ? '+' : '') + profitSek.toLocaleString('sv-SE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' SEK';
                profitElem.className = "text-2xl md:text-3xl font-extrabold " + (profitSek >= 0 ? "text-emerald-500 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400");
            }

            if (returnElem) {
                returnElem.innerText = (profitPct >= 0 ? '+' : '') + profitPct.toFixed(2) + '%';
                returnElem.className = "text-2xl md:text-3xl font-extrabold " + (profitPct >= 0 ? "text-emerald-500 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400");
            }
        }

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

        if (data.history && Array.isArray(data.history) && typeof renderFootballChart === 'function') {
            renderFootballChart(data.history);
        }

    } catch (err) {
        console.warn("Fotbolls-dashboard kunde inte läsa JSON:", err);
    }
}

async function loadPipelineStatus() {
    const syncEl = document.getElementById('mls-last-sync') || document.getElementById('bot-last-sync');
    if (!syncEl) return;

    const pathPrefix = getPathPrefix();

    try {
        const response = await fetch(`${pathPrefix}data/stats.json?t=${Date.now()}`);
        if (!response.ok) return;
        const data = await response.json();

        if (syncEl && data.last_sync) {
            syncEl.textContent = data.last_sync;
        }
    } catch (error) {
        console.error("Fel vid inläsning av stats.json:", error);
    }
}

async function loadKalmanRankings() {
    const topContainer = document.getElementById('top-teams');
    const bottomContainer = document.getElementById('bottom-teams');
    const nextMatchdayEl = document.getElementById('mls-next-matchday') || document.getElementById('bot-next-matchday');

    if (!topContainer && !bottomContainer && !nextMatchdayEl) return;

    const pathPrefix = getPathPrefix();

    try {
        const response = await fetch(`${pathPrefix}data/top_bottom_teams.json?t=${Date.now()}`);
        if (!response.ok) return;
        
        const data = await response.json();

        if (nextMatchdayEl && data.next_matchday) {
            nextMatchdayEl.textContent = data.next_matchday;
        }

        const top5 = data.top5 || [];
        const bottom5 = data.bottom5 || [];

        if (topContainer && top5.length > 0) {
            topContainer.innerHTML = top5.map(team => `
                <tr class="hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30 transition">
                    <td class="py-2.5 font-medium text-slate-800 dark:text-slate-200">
                        <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400 mr-2">#${team.rank}</span>
                        ${team.name}
                    </td>
                    <td class="py-2.5 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        ${team.strength > 0 ? '+' : ''}${team.strength.toFixed(4)}
                    </td>
                </tr>
            `).join('');
        }

        if (bottomContainer && bottom5.length > 0) {
            bottomContainer.innerHTML = bottom5.map(team => `
                <tr class="hover:bg-rose-100/50 dark:hover:bg-rose-900/30 transition">
                    <td class="py-2.5 font-medium text-slate-800 dark:text-slate-200">
                        <span class="text-xs font-bold text-rose-600 dark:text-rose-400 mr-2">#${team.rank}</span>
                        ${team.name}
                    </td>
                    <td class="py-2.5 text-right font-mono font-bold text-rose-700 dark:text-rose-400">
                        ${team.strength > 0 ? '+' : ''}${team.strength.toFixed(4)}
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error("Fel vid inläsning av top_bottom_teams.json:", error);
    }
}

function renderFootballChart(historyData) {
    const canvas = document.getElementById('bot-profit-chart') || document.getElementById('football-profit-chart') || document.getElementById('mls-profit-chart');
    if (!canvas) return;

    const labels = historyData.map(item => item.date || item.datum || '');
    const dataValues = historyData.map(item => item.bankroll ?? item.total_bankroll ?? item.balance ?? item.vinst ?? item.profit ?? item.amount ?? 0);

    if (window.myFootballChart instanceof Chart) {
        window.myFootballChart.destroy();
    }

    const ctx = canvas.getContext('2d');
    window.myFootballChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Bankroll / Vinstkurva',
                data: dataValues,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { grid: { display: false } },
                y: { grid: { color: 'rgba(200, 200, 200, 0.15)' } }
            }
        }
    });
}

function renderStockChart(historyData) {
    // Isolerat ID för aktiegrafen för att undvika krockar med fotbollsgrafen
    const canvas = document.getElementById('stock-profit-chart');
    if (!canvas) return;

    const labels = historyData.map(item => item.date || item.datum || '');
    const dataValues = historyData.map(item => item.bankroll ?? item.total_bankroll ?? item.balance ?? item.profit_sek ?? item.vinst ?? 0);

    if (window.myStockChart instanceof Chart) {
        window.myStockChart.destroy();
    }

    const ctx = canvas.getContext('2d');
    window.myStockChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Bankroll',
                data: dataValues,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.2,
                pointRadius: 3,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.raw.toLocaleString('sv-SE') + ' SEK';
                        }
                    }
                }
            },
            scales: {
                x: { grid: { display: false } },
                y: { 
                    grid: { color: 'rgba(200, 200, 200, 0.15)' },
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString('sv-SE') + ' SEK';
                        }
                    }
                }
            }
        }
    });
}
