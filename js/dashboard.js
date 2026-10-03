// js/dashboard.js
// Hjälpfunktion för snabb inline-översättning: t("Svenska", "English")

function t(sv, en) {
    return isEnglishPage() ? en : sv;
}

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

// stats.json intakt för fotbolls- och pipelinesidan
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

function parseCSV(text) {
    if (!text) return [];
    const cleanText = text.replace(/^\uFEFF/, '');
    const lines = cleanText.trim().split(/\r?\n/);
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const values = lines[i].split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
        const row = {};
        headers.forEach((header, idx) => {
            row[header] = values[idx] !== undefined ? values[idx] : '';
        });
        data.push(row);
    }
    return data;
}

function getRowValue(r, keys, defaultVal = 0) {
    for (const k of keys) {
        if (r[k] !== undefined && r[k] !== '') {
            return r[k];
        }
    }
    return defaultVal;
}

// Stryktipset-dashboard med Champion vs Challenger, ursprunglig beräkning och localStorage-datum
async function loadStryktipsetDashboard() {
    const historyBody = document.getElementById('history-log-body') || document.getElementById('stryktipset-history-body');
    const pathPrefix = getPathPrefix();

    try {
        const [resChamp, resChall] = await Promise.all([
            fetch(`${pathPrefix}data/stryktipset_history_champion.csv?t=${Date.now()}`, { cache: 'no-store' }),
            fetch(`${pathPrefix}data/stryktipset_history_challenger.csv?t=${Date.now()}`, { cache: 'no-store' })
        ]);

        const champText = resChamp.ok ? await resChamp.text() : '';
        const challText = resChall.ok ? await resChall.text() : '';

        const champRows = parseCSV(champText).filter(r => parseInt(getRowValue(r, ['Antal Rader', 'antal_rader'], 0), 10) > 0);
        const challRows = parseCSV(challText).filter(r => parseInt(getRowValue(r, ['Antal Rader', 'antal_rader'], 0), 10) > 0);

        const PAYOUT_MAP = { 13: 200000, 12: 5800, 11: 520, 10: 85 };

        function calculateStats(rows) {
            let totalCost = 0;
            let totalPayout = 0;
            let hits13Count = 0;
            let winningRoundsCount = 0;
            const historyList = [];

            rows.forEach(r => {
                const omgang = parseInt(getRowValue(r, ['Omgång', 'omgang']), 10);
                if (!omgang) return;

                const rader = parseInt(getRowValue(r, ['Antal Rader', 'antal_rader'], 288), 10);
                const insatsRaw = parseFloat(getRowValue(r, ['Insats (kr)', 'insats'], 0));
                const cost = isNaN(insatsRaw) || insatsRaw === 0 ? rader * 1.0 : insatsRaw;

                const best = parseInt(getRowValue(r, ['Bästa Rad', 'basta_rad'], 0), 10);
                const a13 = parseInt(getRowValue(r, ['Antal 13', 'antal_13'], 0), 10);
                const a12 = parseInt(getRowValue(r, ['Antal 12', 'antal_12'], 0), 10);
                const a11 = parseInt(getRowValue(r, ['Antal 11', 'antal_11'], 0), 10);
                const a10 = parseInt(getRowValue(r, ['Antal 10', 'antal_10'], 0), 10);
                const facit = getRowValue(r, ['Facit', 'facit'], '');

                const payout = (a13 * PAYOUT_MAP[13]) + (a12 * PAYOUT_MAP[12]) + (a11 * PAYOUT_MAP[11]) + (a10 * PAYOUT_MAP[10]);
                const net = payout - cost;

                totalCost += cost;
                totalPayout += payout;
                
                if (best === 13 || a13 > 0) hits13Count++;
                if (payout > 0) winningRoundsCount++;

                let datum = getRowValue(r, ['Datum', 'datum'], '');
                if (!datum || datum.toLowerCase().includes('okänt')) {
                    datum = `${t('Omgång', 'Round')} ${omgang}`;
                }

                historyList.push({ omgang, datum, cost, payout, net, best, facit });
            });

            const netProfit = totalPayout - totalCost;
            const roi = totalCost > 0 ? ((totalPayout / totalCost) * 100) - 100 : 0;
            const winRate = historyList.length > 0 ? (winningRoundsCount / historyList.length) * 100 : 0;

            return { totalCost, totalPayout, netProfit, roi, winRate, hits13Count, historyList };
        }

        const champStats = champRows.length > 0 ? calculateStats(champRows) : null;
        const challStats = challRows.length > 0 ? calculateStats(challRows) : null;

        // Ursprunglig och exakt beräkning baserad på total nettovinst
        let activeStats = champStats;
        let isChallengerWinner = false;

        if (challStats && champStats) {
            if (challStats.netProfit > champStats.netProfit) {
                activeStats = challStats;
                isChallengerWinner = true;
            }
        } else if (challStats) {
            activeStats = challStats;
            isChallengerWinner = true;
        }

        // --- STATUS-BANDEROLL FÖR STRYKTIPSET (NY MÄSTARE KRÖNT) ---
        const bannerEl = document.getElementById('stryktipset-status-banner');
        if (bannerEl) {
            if (isChallengerWinner && champStats && challStats) {
                const diff = (challStats.netProfit - champStats.netProfit).toLocaleString('sv-SE');
                
                let calcDate = localStorage.getItem('stryktipset_calc_date');
                if (!calcDate) {
                    const now = new Date();
                    calcDate = now.toISOString().split('T')[0];
                    localStorage.setItem('stryktipset_calc_date', calcDate);
                }

                const timeRef = calcDate ? ` (${calcDate})` : '';
                
                const titleText = t(`Ny Mästare Krönt${timeRef}!`, `New Champion Crowned${timeRef}!`);
                const bodyText = t(
                    `Challenger har överträffat den tidigare Mästaren med <span class="font-bold text-emerald-600 dark:text-emerald-400">+${diff} SEK</span> i kumulativ nettovinst och har uppgraderats till aktiv standardmodell.`,
                    `Challenger has outperformed the previous Champion by <span class="font-bold text-emerald-600 dark:text-emerald-400">+${diff} SEK</span> in cumulative net profit and has been promoted to the active standard model.`
                );

                bannerEl.innerHTML = `
                    <div class="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-900 dark:text-blue-200 flex items-center gap-3 shadow-sm">
                        <span class="text-2xl">🏆</span>
                        <div class="text-sm">
                            <strong class="font-extrabold text-blue-600 dark:text-blue-400">${titleText}</strong> 
                            ${bodyText}
                        </div>
                    </div>
                `;
                bannerEl.classList.remove('hidden');
            } else {
                bannerEl.innerHTML = '';
                bannerEl.classList.add('hidden');
            }
        }

        if (!activeStats || activeStats.historyList.length === 0) return;

        const { netProfit, roi, winRate, hits13Count, historyList } = activeStats;
        const latestRound = historyList.length > 0 ? historyList[0].omgang : '-';

        const omgangEl = document.getElementById('stryktipset-omgang');
        if (omgangEl) {
            omgangEl.innerText = `${t('Omgång', 'Round')} ${latestRound}${isChallengerWinner ? ' (🚀 Challenger)' : ' (🏆 Champion)'}`;
        }

        const profitEl = document.getElementById('stryktipset-profit');
        if (profitEl) {
            profitEl.innerText = `${netProfit >= 0 ? '+' : ''}${netProfit.toLocaleString('sv-SE')} SEK`;
            profitEl.className = "text-2xl md:text-3xl font-extrabold " + (netProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400");
        }

        const roiEl = document.getElementById('stryktipset-roi');
        if (roiEl) roiEl.innerText = `${roi >= 0 ? '+' : ''}${roi.toFixed(1)}%`;

        const hitsEl = document.getElementById('stryktipset-13-hits');
        if (hitsEl) hitsEl.innerText = `${hits13Count} st`;

        const winRateEl = document.getElementById('stryktipset-win-rate');
        if (winRateEl) winRateEl.innerText = `${winRate.toFixed(1)}%`;

        if (historyBody) {
            historyBody.innerHTML = '';
            const bestText = t('Rätt', 'Correct');
            const roundText = t('Omgång', 'Round');

            historyList.forEach(h => {
                const tr = document.createElement('tr');
                tr.className = "hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors";
                const netClass = h.net >= 0 ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-rose-500 font-bold";
                tr.innerHTML = `
                    <td class="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">${roundText} ${h.omgang}</td>
                    <td class="py-3 px-4 text-xs text-slate-500">${h.datum}</td>
                    <td class="py-3 px-4 text-center">
                        <span class="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold text-xs">
                            ${h.best} ${bestText}
                        </span>
                    </td>
                    <td class="py-3 px-4 text-center text-slate-500">${h.cost} SEK</td>
                    <td class="py-3 px-4 text-center text-slate-800 dark:text-slate-200 font-mono">${h.payout.toLocaleString('sv-SE')} SEK</td>
                    <td class="py-3 px-4 text-right ${netClass}">${h.net >= 0 ? '+' : ''}${h.net.toLocaleString('sv-SE')} SEK</td>
                `;
                historyBody.appendChild(tr);
            });
        }

        const canvas = document.getElementById('stryktipset-profit-chart');
        if (canvas && window.Chart) {
            const champMap = new Map(champRows.map(r => [
                parseInt(getRowValue(r, ['Omgång', 'omgang']), 10),
                parseInt(getRowValue(r, ['Bästa Rad', 'basta_rad']), 10)
            ]));

            const challMap = new Map(challRows.map(r => [
                parseInt(getRowValue(r, ['Omgång', 'omgang']), 10),
                parseInt(getRowValue(r, ['Bästa Rad', 'basta_rad']), 10)
            ]));

            const allOmgangar = Array.from(new Set([
                ...Array.from(champMap.keys()),
                ...Array.from(challMap.keys())
            ])).filter(o => !isNaN(o) && o > 0).sort((a, b) => a - b);

            const labels = allOmgangar.map(o => `${t('Omgång', 'Round')} ${o}`);
            const champData = allOmgangar.map(o => champMap.get(o) ?? null);
            const challData = allOmgangar.map(o => challMap.get(o) ?? null);

            if (window.stryktipsetChartInstance) {
                window.stryktipsetChartInstance.destroy();
            }

            window.stryktipsetChartInstance = new Chart(canvas, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: t('🏆 Champion (Rekord)', '🏆 Champion (Record)'),
                            data: champData,
                            borderColor: '#f59e0b',
                            backgroundColor: 'rgba(245, 158, 11, 0.05)',
                            borderWidth: 3,
                            pointBackgroundColor: '#f59e0b',
                            fill: false,
                            tension: 0.2,
                            pointRadius: 4
                        },
                        {
                            label: t('🚀 Challenger (Aktiv modell)', '🚀 Challenger (Active Model)'),
                            data: challData,
                            borderColor: '#2563eb',
                            backgroundColor: 'rgba(37, 99, 235, 0.1)',
                            borderWidth: 2,
                            borderDash: [5, 5],
                            pointBackgroundColor: '#2563eb',
                            fill: false,
                            tension: 0.2,
                            pointRadius: 4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            labels: {
                                color: document.documentElement.classList.contains('dark') ? '#cbd5e1' : '#334155',
                                font: { weight: 'bold' }
                            }
                        }
                    },
                    scales: {
                        x: { grid: { display: false } },
                        y: {
                            min: 0,
                            max: 13,
                            grid: { color: 'rgba(148, 163, 184, 0.1)' },
                            ticks: {
                                stepSize: 1,
                                callback: function(val) { return val + ' ' + t('rätt', 'correct'); }
                            }
                        }
                    }
                }
            });
        }

    } catch (err) {
        console.warn("Kunde inte läsa Stryktipset-historik i frontend:", err);
    }
}
