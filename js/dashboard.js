// js/dashboard.js

function getPathPrefix() {
    if (typeof window.pathPrefix !== 'undefined' && window.pathPrefix !== '') {
        return window.pathPrefix;
    }
    const isSwedish = (typeof window.isSwedishPage !== 'undefined') 
        ? window.isSwedishPage 
        : window.location.pathname.toLowerCase().includes('/sv/');
    return isSwedish ? "../" : "./";
}

function isEnglishPage() {
    return window.location.pathname.toLowerCase().includes('/en/') || document.documentElement.lang === 'en';
}

async function loadPortfolioData() {
    const pathPrefix = getPathPrefix();
    try {
        const response = await fetch(`${pathPrefix}data/portfolio_summary.json?t=${Date.now()}`, { cache: 'no-store' });
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
    const isEnglish = isEnglishPage();
    
    try {
        const res = await fetch(`${pathPrefix}data/stock_ai_dashboard_data.json?t=${Date.now()}`, { cache: 'no-store' });
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
            const maxDrawdown = data.summary.max_drawdown_pct ?? data.summary.max_drawdown ?? 0;

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

            const maxDrawdownElem = document.getElementById('stock-max-drawdown');
            if (maxDrawdownElem) {
                const formattedDrawdown = typeof maxDrawdown === 'number' 
                    ? maxDrawdown.toFixed(2).replace('.', ',') 
                    : maxDrawdown;
                maxDrawdownElem.innerText = `${formattedDrawdown}%`;
            }
        }

        const trades = data.latest_trades_and_forecasts || [];

        if (tradesBody) {
            if (trades.length === 0) {
                const emptyMsg = isEnglish ? "No active trades registered yet." : "Inga aktiva affärer registrerade ännu.";
                tradesBody.innerHTML = `<tr><td colspan="7" class="py-6 text-center text-slate-500">${emptyMsg}</td></tr>`;
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

        const historyData = data.history || data.bankroll_history || data.chart_data || (Array.isArray(data) ? data : null);
        if (historyData && typeof renderStockChart === 'function') {
            renderStockChart(historyData);
        } else if (typeof loadAndRenderChart === 'function') {
            loadAndRenderChart('stock-profit-chart', `${pathPrefix}data/stock_ai_dashboard_data.json`);
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
    const isEnglish = isEnglishPage();

    try {
        const res = await fetch(`${pathPrefix}data/football_ai_dashboard_data.json?t=${Date.now()}`, { cache: 'no-store' });
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
                const emptyBetsMsg = isEnglish ? "No active bets registered yet." : "Inga aktiva spel registrerade ännu.";
                betsBody.innerHTML = `<tr><td colspan="6" class="py-6 text-center text-slate-500">${emptyBetsMsg}</td></tr>`;
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

        const historyData = data.history || data.bankroll_history || data.chart_data || (Array.isArray(data) ? data : null);
        if (historyData && typeof renderFootballChart === 'function') {
            renderFootballChart(historyData);
        } else if (typeof loadAndRenderChart === 'function') {
            const canvasId = chartCanvas ? chartCanvas.id : 'bot-profit-chart';
            loadAndRenderChart(canvasId, `${pathPrefix}data/football_ai_dashboard_data.json`);
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
        const response = await fetch(`${pathPrefix}data/stats.json?t=${Date.now()}`, { cache: 'no-store' });
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
        const response = await fetch(`${pathPrefix}data/top_bottom_teams.json?t=${Date.now()}`, { cache: 'no-store' });
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

// NY: Funktion för att ladda dynamisk Stryktipset-data till stryktipset.html
async function loadStryktipsetDashboard() {
    const couponBody = document.getElementById('coupon-matches-body');
    const historyBody = document.getElementById('history-log-body');
    const pathPrefix = getPathPrefix();

    if (!couponBody && !historyBody) return;

    try {
        const response = await fetch(`${pathPrefix}data/latest.json?t=${Date.now()}`, { cache: 'no-store' });
        if (!response.ok) throw new Error('Kunde inte ladda data/latest.json');
        
        const data = await response.json();

        // 1. Omgång & KPIer
        if (data.round_id) {
            const omgangEl = document.getElementById('stryktipset-omgang');
            if (omgangEl) omgangEl.innerText = `Omgång ${data.round_id}`;
        }
        
        if (data.metrics) {
            const profitEl = document.getElementById('stryktipset-profit');
            if (profitEl && data.metrics.net_profit !== undefined) {
                profitEl.innerText = `${data.metrics.net_profit >= 0 ? '+' : ''}${data.metrics.net_profit.toLocaleString('sv-SE')} SEK`;
                profitEl.className = "text-2xl md:text-3xl font-extrabold " + (data.metrics.net_profit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500");
            }
            const roiEl = document.getElementById('stryktipset-roi');
            if (roiEl && data.metrics.roi !== undefined) {
                roiEl.innerText = `${data.metrics.roi >= 0 ? '+' : ''}${data.metrics.roi}%`;
            }
            const hitsEl = document.getElementById('stryktipset-13-hits');
            if (hitsEl && data.metrics.hits_13 !== undefined) {
                hitsEl.innerText = `${data.metrics.hits_13} Omgångar`;
            }
            const winRateEl = document.getElementById('stryktipset-win-rate');
            if (winRateEl && data.metrics.win_rate !== undefined) {
                winRateEl.innerText = `${data.metrics.win_rate}%`;
            }
        }

        // 2. Aktuella matcher
        if (couponBody && data.matches && data.matches.length > 0) {
            couponBody.innerHTML = '';
            data.matches.forEach((m, index) => {
                const tr = document.createElement('tr');
                tr.className = 'hover:bg-slate-50 dark:hover:bg-slate-800/40 transition';
                tr.innerHTML = `
                    <td class="py-3 px-3 font-bold text-slate-400">${index + 1}</td>
                    <td class="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">${m.home} - ${m.away}</td>
                    <td class="py-3 px-3 text-center font-mono text-xs">
                        <span class="text-blue-600 dark:text-blue-400 font-bold">${(m.p1 * 100).toFixed(0)}%</span> - 
                        <span class="text-slate-500">${(m.pX * 100).toFixed(0)}%</span> - 
                        <span class="text-slate-500">${(m.p2 * 100).toFixed(0)}%</span>
                    </td>
                    <td class="py-3 px-3 text-center font-mono text-xs text-slate-500">
                        ${(m.svs_1 * 100).toFixed(0)}% - ${(m.svs_x * 100).toFixed(0)}% - ${(m.svs_2 * 100).toFixed(0)}%
                    </td>
                    <td class="py-3 px-3 text-center">
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold">
                            ${m.edge_text || 'Value'}
                        </span>
                    </td>
                    <td class="py-3 px-3 text-right font-bold text-blue-600 dark:text-blue-400">${m.rec_mark || '1 X'}</td>
                `;
                couponBody.appendChild(tr);
            });
        }

        // 3. Historik & Graf
        if (historyBody && data.history && data.history.length > 0) {
            historyBody.innerHTML = '';
            data.history.forEach(h => {
                const tr = document.createElement('tr');
                tr.className = 'hover:bg-slate-50 dark:hover:bg-slate-800/40 transition';
                const netClass = h.net >= 0 ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' : 'text-rose-500 font-bold';
                tr.innerHTML = `
                    <td class="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">Omgång ${h.round}</td>
                    <td class="py-3 px-4 text-xs text-slate-500">${h.date}</td>
                    <td class="py-3 px-4 text-center">
                        <span class="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs">
                            ${h.hits} Rätt
                        </span>
                    </td>
                    <td class="py-3 px-4 text-center text-slate-500">${h.cost} SEK</td>
                    <td class="py-3 px-4 text-center text-slate-800 dark:text-slate-200 font-mono">${h.payout.toLocaleString('sv-SE')} SEK</td>
                    <td class="py-3 px-4 text-right ${netClass}">${h.net >= 0 ? '+' : ''}${h.net.toLocaleString('sv-SE')} SEK</td>
                `;
                historyBody.appendChild(tr);
            });

            // Chart.js graf för Stryktipset
            const ctx = document.getElementById('stryktipset-profit-chart');
            if (ctx && window.Chart) {
                const labels = data.history.map(h => `Omgång ${h.round}`);
                let cumulative = 0;
                const netData = data.history.map(h => {
                    cumulative += h.net;
                    return cumulative;
                });

                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Net Profit (SEK)',
                            data: netData,
                            borderColor: '#2563eb',
                            backgroundColor: 'rgba(37, 99, 235, 0.1)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.3
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            x: { grid: { display: false } },
                            y: { 
                                ticks: { callback: function(value) { return value.toLocaleString('sv-SE') + ' SEK'; } }
                            }
                        }
                    }
                });
            }
        }

    } catch (err) {
        console.warn("Kunde inte ladda Stryktipset-data:", err);
    }
}
