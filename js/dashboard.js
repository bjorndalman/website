// Uppdaterad Stryktipset-funktion med dynamisk jämförelse (Champion vs Challenger)
async function loadStryktipsetDashboard() {
    const historyBody = document.getElementById('history-log-body') || document.getElementById('stryktipset-history-body');
    const pathPrefix = getPathPrefix();

    try {
        // 1. Hämta BÅDE Champion och Challenger CSV-filerna parallellt
        const [resChamp, resChall] = await Promise.all([
            fetch(`${pathPrefix}data/stryktipset_history_champion.csv?t=${Date.now()}`, { cache: 'no-store' }),
            fetch(`${pathPrefix}data/stryktipset_history_challenger.csv?t=${Date.now()}`, { cache: 'no-store' })
        ]);

        const champText = resChamp.ok ? await resChamp.text() : '';
        const challText = resChall.ok ? await resChall.text() : '';

        // Filtrera bort ej spelade omgångar (där Antal Rader är 0 eller saknas)
        const champRows = parseCSV(champText).filter(r => parseInt(r['Antal Rader'] || 0, 10) > 0);
        const challRows = parseCSV(challText).filter(r => parseInt(r['Antal Rader'] || 0, 10) > 0);

        // Hjälpfunktion för att beräkna statistik och historiklista för en uppsättning rader
        const PAYOUT_MAP = { 13: 200000, 12: 5800, 11: 520, 10: 85 };

        function calculateStats(rows) {
            let totalCost = 0;
            let totalPayout = 0;
            let hits13Count = 0;
            let winningRoundsCount = 0;
            const historyList = [];

            rows.forEach(r => {
                const omgang = parseInt(r['Omgång'] || r['omgang'] || 0, 10);
                if (!omgang) return;

                const rader = parseInt(r['Antal Rader'] || 288, 10);
                const insatsRaw = parseFloat(r['Insats (kr)']);
                const cost = isNaN(insatsRaw) || insatsRaw === 0 ? rader * 1.0 : insatsRaw;

                const best = parseInt(r['Bästa Rad'] || 0, 10);
                const a13 = parseInt(r['Antal 13'] || 0, 10);
                const a12 = parseInt(r['Antal 12'] || 0, 10);
                const a11 = parseInt(r['Antal 11'] || 0, 10);
                const a10 = parseInt(r['Antal 10'] || 0, 10);
                const facit = r['Facit'] || '';

                const payout = (a13 * PAYOUT_MAP[13]) + (a12 * PAYOUT_MAP[12]) + (a11 * PAYOUT_MAP[11]) + (a10 * PAYOUT_MAP[10]);
                const net = payout - cost;

                totalCost += cost;
                totalPayout += payout;
                
                if (best === 13 || a13 > 0) hits13Count++;
                if (payout > 0) winningRoundsCount++;

                let datum = r['Datum'] || '';
                if (!datum || datum.includes('Okänt')) {
                    datum = `Omgång ${omgang}`;
                }

                historyList.push({
                    omgang,
                    datum,
                    cost,
                    payout,
                    net,
                    best,
                    facit
                });
            });

            const netProfit = totalPayout - totalCost;
            const roi = totalCost > 0 ? ((totalPayout / totalCost) * 100) - 100 : 0;
            const winRate = historyList.length > 0 ? (winningRoundsCount / historyList.length) * 100 : 0;

            return { totalCost, totalPayout, netProfit, roi, winRate, hits13Count, historyList };
        }

        const champStats = champRows.length > 0 ? calculateStats(champRows) : null;
        const challStats = challRows.length > 0 ? calculateStats(challRows) : null;

        // Champion gälller som DEFAULT. Om Challenger har HÖGRE nettovinst, tar Challenger över!
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

        if (!activeStats || activeStats.historyList.length === 0) return;

        const { netProfit, roi, winRate, hits13Count, historyList } = activeStats;
        const latestRound = historyList.length > 0 ? historyList[0].omgang : '-';

        // Uppdatera KPI-kort
        const omgangEl = document.getElementById('stryktipset-omgang');
        if (omgangEl) {
            omgangEl.innerText = `Omgång ${latestRound}${isChallengerWinner ? ' (🚀 Challenger leder)' : ' (🏆 Champion)'}`;
        }

        const profitEl = document.getElementById('stryktipset-profit');
        if (profitEl) {
            profitEl.innerText = `${netProfit >= 0 ? '+' : ''}${netProfit.toLocaleString('sv-SE')} SEK`;
            profitEl.className = "text-2xl md:text-3xl font-extrabold " + (netProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400");
        }

        const roiEl = document.getElementById('stryktipset-roi');
        if (roiEl) {
            roiEl.innerText = `${roi >= 0 ? '+' : ''}${roi.toFixed(1)}%`;
        }

        const hitsEl = document.getElementById('stryktipset-13-hits');
        if (hitsEl) {
            hitsEl.innerText = `${hits13Count} st`;
        }

        const winRateEl = document.getElementById('stryktipset-win-rate');
        if (winRateEl) {
            winRateEl.innerText = `${winRate.toFixed(1)}%`;
        }

        // Bygg historiktabellen för den vinnande modellen
        if (historyBody) {
            historyBody.innerHTML = '';
            historyList.forEach(h => {
                const tr = document.createElement('tr');
                tr.className = "hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors";
                const netClass = h.net >= 0 ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-rose-500 font-bold";
                tr.innerHTML = `
                    <td class="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">Omgång ${h.omgang}</td>
                    <td class="py-3 px-4 text-xs text-slate-500">${h.datum}</td>
                    <td class="py-3 px-4 text-center">
                        <span class="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold text-xs">
                            ${h.best} Rätt
                        </span>
                    </td>
                    <td class="py-3 px-4 text-center text-slate-500">${h.cost} SEK</td>
                    <td class="py-3 px-4 text-center text-slate-800 dark:text-slate-200 font-mono">${h.payout.toLocaleString('sv-SE')} SEK</td>
                    <td class="py-3 px-4 text-right ${netClass}">${h.net >= 0 ? '+' : ''}${h.net.toLocaleString('sv-SE')} SEK</td>
                `;
                historyBody.appendChild(tr);
            });
        }

        // Rita diagrammet med DUBBLA LINJER (Champion + Challenger)
        const canvas = document.getElementById('stryktipset-profit-chart');
        if (canvas && window.Chart) {
            const champMap = new Map(champRows.map(r => [parseInt(r['Omgång'] || 0, 10), parseInt(r['Bästa Rad'] || 0, 10)]));
            const challMap = new Map(challRows.map(r => [parseInt(r['Omgång'] || 0, 10), parseInt(r['Bästa Rad'] || 0, 10)]));

            const allOmgangar = Array.from(new Set([
                ...Array.from(champMap.keys()),
                ...Array.from(challMap.keys())
            ])).filter(o => o > 0).sort((a, b) => a - b);

            const labels = allOmgangar.map(o => `Omgång ${o}`);
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
                            label: '🏆 Champion (Rekord)',
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
                            label: '🚀 Challenger (Aktiv modell)',
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
                                callback: function(val) { return val + ' rätt'; }
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
