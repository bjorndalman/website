/**
 * stock-analytics-page.js
 * Fullständigt responsiv visualisering för alla skärmstorlekar.
 */

let stockChartInstance = null;

async function loadStockAIDashboard() {
    try {
        const prefix = window.pathPrefix || (window.location.pathname.includes('/sv/') ? '../' : '');
        
        // Anti-cache fetch för färsk data
        const res = await fetch(`${prefix}data/stock_ai_dashboard_data.json?t=` + Date.now(), { cache: 'no-store' });
        if (!res.ok) throw new Error("Could not fetch stock_ai_dashboard_data.json");
        
        const data = await res.json();

        // 1. Synk-datum
        const syncElem = document.getElementById('stock-last-sync');
        if (syncElem) {
            if (data.updated_at) {
                syncElem.innerText = data.updated_at;
            } else {
                fetch(`${prefix}data/stats.json?t=` + Date.now())
                    .then(r => r.json())
                    .then(stats => { if (stats.last_sync) syncElem.innerText = stats.last_sync; })
                    .catch(err => console.warn("Kunde inte läsa stats.json", err));
            }
        }

         // 2. Uppdatera KPI-rutor
        if (data.summary) {
            const bankroll = data.summary.current_bankroll || 100000;
            const profit = data.summary.profit_sek || 0;
            const profitPct = data.summary.profit_pct || 0;
            const sharpe = data.summary.sharpe_ratio ?? 0;
            const drawdown = data.summary.max_drawdown ?? 0;
        
            const bankrollElem = document.getElementById('stock-bankroll');
            if (bankrollElem) bankrollElem.innerText = bankroll.toLocaleString('sv-SE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' SEK';
            
            const profitElem = document.getElementById('stock-profit');
            if (profitElem) {
                profitElem.innerText = (profit >= 0 ? '+' : '') + profit.toLocaleString('sv-SE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' SEK';
                profitElem.className = "text-2xl font-extrabold " + (profit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400");
            }
        
            const pctElem = document.getElementById('stock-return-pct');
            if (pctElem) {
                pctElem.innerText = (profitPct >= 0 ? '+' : '') + profitPct.toFixed(2) + '%';
                pctElem.className = "text-2xl font-extrabold " + (profitPct >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400");
            }
        
            const sharpeElem = document.getElementById('stock-sharpe');
            if (sharpeElem) {
                sharpeElem.innerText = typeof sharpe === 'number' ? sharpe.toFixed(2) : sharpe;
            }
        
            const drawdownElem = document.getElementById('stock-drawdown');
            if (drawdownElem) {
                drawdownElem.innerText = (typeof drawdown === 'number' ? drawdown.toFixed(2) : drawdown) + '%';
                drawdownElem.className = "text-2xl font-extrabold " + (drawdown === 0 ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white");
            }
        }

        // 3. Fyll i AI Trades-tabellen (Senaste överst)
        const tradesBody = document.getElementById('stock-trades-body');
        if (tradesBody) {
            const trades = data.latest_trades_and_forecasts || [];

            if (trades.length === 0) {
                tradesBody.innerHTML = `<tr><td colspan="7" class="py-6 text-center text-slate-500 dark:text-slate-400">Inga aktiva affärer registrerade ännu.</td></tr>`;
                const investedElem = document.getElementById('stock-invested');
                if (investedElem && !data.summary?.invested) investedElem.innerText = '0,00 SEK';
            } else {
                tradesBody.innerHTML = '';
                let calculatedInvested = 0;

                // Vänd arrayen så nyaste affärer visas överst
                trades.slice().reverse().forEach(row => {
                    const date = row['date'] || row['Date'] || row['Datum'] || '-';
                    const stock = row['stock'] || row['Stock'] || row['Aktie'] || row['symbol'] || row['ticker'] || '-';
                    const action = String(row['action'] || row['Action'] || row['status'] || row['Åtgärd'] || 'BUY').toUpperCase();
                    
                    const price = row['price'] ?? row['Price'] ?? row['Pris'] ?? row['close_price'] ?? '-';
                    const kalman = row['kalman_value'] ?? row['Kalman Value'] ?? row['Fair Value'] ?? '-';
                    const argument = row['argument'] || row['AI Argument & Forecast'] || row['Reasoning'] || row['Motivering'] || '-';

                    const rawAmount = row['ai_investment'] 
                        ?? row['position_size'] 
                        ?? row['Rek. Investering (kr)'] 
                        ?? 0;
                    
                    const amount = parseFloat(rawAmount) || 0;
                    if (action === 'BUY' || action === 'KÖP') {
                        calculatedInvested += amount;
                    }

                    const formattedAmount = amount > 0 
                        ? `${amount.toLocaleString('sv-SE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SEK` 
                        : '0,00 SEK';

                    let badgeClass = "px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800";

                    if (action === 'SÄLJ' || action === 'SELL' || action === 'CLOSED') {
                        badgeClass = "px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800";
                    } else if (action === 'STÅ ÖVER' || action === 'HOLD' || action === 'PAUSED') {
                        badgeClass = "px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700";
                    }

                    const parsedPrice = parseFloat(price);
                    const formattedPrice = !isNaN(parsedPrice) ? `${parsedPrice.toFixed(2)} SEK` : price;

                    const parsedKalman = parseFloat(kalman);
                    const formattedKalman = !isNaN(parsedKalman) ? `${parsedKalman.toFixed(2)} SEK` : kalman;

                    const tr = document.createElement('tr');
                    tr.className = "hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition";
                    tr.innerHTML = `
                        <td class="py-3.5 px-4 text-xs whitespace-nowrap text-slate-500 dark:text-slate-400">${date}</td>
                        <td class="py-3.5 px-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">${stock}</td>
                        <td class="py-3.5 px-4 whitespace-nowrap"><span class="${badgeClass}">${action}</span></td>
                        <td class="py-3.5 px-4 text-slate-700 dark:text-slate-300 whitespace-nowrap">${formattedPrice}</td>
                        <td class="py-3.5 px-4 text-slate-700 dark:text-slate-300 whitespace-nowrap">${formattedKalman}</td>
                        <td class="py-3.5 px-4 font-semibold text-slate-900 dark:text-white whitespace-nowrap">${formattedAmount}</td>
                        <td class="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">${argument}</td>
                    `;
                    tradesBody.appendChild(tr);
                });

                // Fallback till manuell beräkning om invested saknas i summary
                const investedElem = document.getElementById('stock-invested');
                if (investedElem && data.summary?.invested === undefined) {
                    investedElem.innerText = calculatedInvested.toLocaleString('sv-SE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' SEK';
                }
            }
        }

        if (window.lucide) {
            lucide.createIcons();
        }

        // 4. Rendera vinstgraf om historik finns
        if (data.history && Array.isArray(data.history) && data.history.length > 0) {
            renderStockChart(data.history);
        }

    } catch (err) {
        console.error("Error loading AI Stock Dashboard:", err);
        const tradesBody = document.getElementById('stock-trades-body');
        if (tradesBody) {
            tradesBody.innerHTML = `<tr><td colspan="7" class="py-6 text-center text-rose-500 font-medium">Kunde inte ladda data. Kontrollera att data/stock_ai_dashboard_data.json finns.</td></tr>`;
        }
    }
}

function renderStockChart(historyData) {
    const canvas = document.getElementById('stock-profit-chart');
    if (!canvas) return;

    if (stockChartInstance) {
        stockChartInstance.destroy();
        stockChartInstance = null;
    }

    const labels = historyData.map(item => item.date || item.Date || item.datum || '');
    const dataValues = historyData.map(item => item.bankroll ?? item.total_bankroll ?? item.profit ?? item.Profit ?? item.profit_sek ?? 0);

    const minVal = Math.min(...dataValues);
    const maxVal = Math.max(...dataValues);
    const isSinglePoint = dataValues.length === 1;
    const padding = isSinglePoint ? 500 : Math.max((maxVal - minVal) * 0.2, 200);

    const ctx = canvas.getContext('2d');

    stockChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Bankroll (SEK)',
                data: dataValues,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.2,
                pointRadius: 5,
                pointHoverRadius: 8,
                pointBackgroundColor: '#10b981'
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
                            return ' Värde: ' + (context.parsed.y || 0).toLocaleString('sv-SE', { minimumFractionDigits: 2 }) + ' SEK';
                        }
                    }
                }
            },
            scales: {
                x: { 
                    grid: { display: false },
                    ticks: {
                        font: { size: window.innerWidth < 640 ? 10 : 12 }
                    }
                },
                y: { 
                    min: Math.floor(minVal - padding),
                    max: Math.ceil(maxVal + padding),
                    ticks: {
                        maxTicksLimit: window.innerWidth < 640 ? 5 : 8,
                        callback: function(value) {
                            return value.toLocaleString('sv-SE') + ' SEK';
                        },
                        font: { size: window.innerWidth < 640 ? 10 : 12 }
                    },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                }
            }
        }
    });
}

// Kör vid laddning
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    loadStockAIDashboard();
} else {
    document.addEventListener('DOMContentLoaded', loadStockAIDashboard);
}
