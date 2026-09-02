/**
 * stock-analytics-page.js
 * Hanterar datahämtning och visualisering för aktiedashboarden.
 * Återanvändbar för både engelska (stock-analytics.html) och svenska (sv/stock-analytics.html).
 */

let stockChartInstance = null;

async function loadStockAIDashboard() {
    try {
        // Identifiera om vi befinner oss i /sv/ eller rotmappen för korrekt relaterad sökväg
        const prefix = window.pathPrefix || (window.location.pathname.includes('/sv/') ? '../' : '');
        
        // 1. Hämtar huvuddata för aktier (med anti-cache timestamp)
        const res = await fetch(`${prefix}data/stock_ai_dashboard_data.json?t=` + Date.now());
        if (!res.ok) throw new Error("Could not fetch stock_ai_dashboard_data.json");
        
        const data = await res.json();

        // 2. Uppdatera synk-datum (med fallback till stats.json)
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

        // 3. Uppdatera KPI-rutor
        if (data.summary) {
            const bankroll = data.summary.current_bankroll || 100000;
            const profit = data.summary.profit_sek || 0;
            const profitPct = data.summary.profit_pct || 0;

            const bankrollElem = document.getElementById('stock-bankroll');
            if (bankrollElem) {
                bankrollElem.innerText = bankroll.toLocaleString('sv-SE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' SEK';
            }
            
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
        }

        // 4. Fyll i AI Trades-tabellen
        const tradesBody = document.getElementById('stock-trades-body');
        if (tradesBody) {
            const trades = data.latest_trades_and_forecasts || [];

            if (trades.length === 0) {
                tradesBody.innerHTML = `<tr><td colspan="7" class="py-6 text-center text-slate-500 dark:text-slate-400">Inga aktiva affärer registrerade ännu.</td></tr>`;
                const investedElem = document.getElementById('stock-invested');
                if (investedElem) investedElem.innerText = '0,00 SEK';
            } else {
                tradesBody.innerHTML = '';
                let totalInvested = 0;

                trades.forEach(row => {
                    const date = row['date'] || row['Date'] || row['Datum'] || '-';
                    const stock = row['stock'] || row['Stock'] || row['Aktie'] || '-';
                    const action = String(row['action'] || row['Action'] || row['status'] || 'BUY').toUpperCase();
                    
                    const price = row['price'] ?? row['Price'] ?? row['Pris'] ?? '-';
                    const kalman = row['kalman_value'] ?? row['Kalman Value'] ?? row['Fair Value'] ?? '-';
                    const argument = row['argument'] || row['AI Argument & Forecast'] || row['Reasoning'] || '-';

                    const rawAmount = row['ai_investment'] 
                        ?? row['position_size'] 
                        ?? row['Rek. Investering (kr)'] 
                        ?? 0;
                    
                    const amount = parseFloat(rawAmount) || 0;
                    if (action === 'BUY' || action === 'KÖP') {
                        totalInvested += amount;
                    }

                    const formattedAmount = amount > 0 
                        ? `${amount.toLocaleString('sv-SE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SEK` 
                        : '0,00 SEK';

                    let badgeClass = "px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800";

                    if (action === 'SÄLJ' || action === 'SELL') {
                        badgeClass = "px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800";
                    } else if (action === 'STÅ ÖVER' || action === 'HOLD') {
                        badgeClass = "px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700";
                    }

                    const formattedPrice = typeof price === 'number' ? price.toFixed(2) + ' SEK' : price;
                    const formattedKalman = typeof kalman === 'number' ? kalman.toFixed(2) + ' SEK' : kalman;

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

                const investedElem = document.getElementById('stock-invested');
                if (investedElem) {
                    investedElem.innerText = totalInvested.toLocaleString('sv-SE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' SEK';
                }
            }
        }

        if (window.lucide) {
            lucide.createIcons();
        }

        // 5. Rendera vinstgraf om historik finns
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
    const ctx = document.getElementById('stock-profit-chart');
    if (!ctx) return;

    if (stockChartInstance) {
        stockChartInstance.destroy();
        stockChartInstance = null;
    }

    const labels = historyData.map(item => item.date || item.Date || '');
    const profitValues = historyData.map(item => item.profit !== undefined ? item.profit : (item.Profit || 0));

    // Beräkna rimliga Y-axelsgränser för att förhindra konstig skalning vid få datapunkter
    const minVal = Math.min(...profitValues);
    const maxVal = Math.max(...profitValues);
    const padding = Math.max(Math.abs(maxVal) * 0.1, 100);

    stockChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Net Profit (SEK)',
                data: profitValues,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.3,
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
                    mode: 'index', 
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            let value = context.parsed.y || 0;
                            return ' Profit: ' + value.toLocaleString('sv-SE', { minimumFractionDigits: 2 }) + ' SEK';
                        }
                    }
                }
            },
            scales: {
                x: { 
                    grid: { display: false },
                    ticks: { font: { size: 11 } }
                },
                y: { 
                    suggestedMin: minVal - padding,
                    suggestedMax: maxVal + padding,
                    grid: { color: 'rgba(148, 163, 184, 0.1)' },
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString('sv-SE') + ' SEK';
                        }
                    }
                }
            }
        }
    });

    // Tvinga Chart.js att beräkna korrekt höjd/bredd direkt efter rendering
    setTimeout(() => {
        if (stockChartInstance) {
            stockChartInstance.resize();
        }
    }, 100);
}

document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) {
        lucide.createIcons();
    }
    loadStockAIDashboard();
});
