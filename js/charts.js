/**
 * js/charts.js
 * Centraliserad hantering och rendering av grafer (CSV & JSON-stöd)
 */

// Använd gemensam pathPrefix från fönstret om den finns, annars känn av via URL
window.pathPrefix = window.pathPrefix || (window.location.pathname.toLowerCase().includes('/sv/') ? "../" : "");
var botChartInstance = null;
var stockChartInstance = null;

function isEnglishPage() {
    return window.location.pathname.toLowerCase().includes('/en/') || (!window.location.pathname.toLowerCase().includes('/sv/') && document.documentElement.lang === 'en');
}

// Säker förstöring av befintliga grafer för att förhindra "Canvas is already in use"-fel
function destroyExistingChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    if (typeof Chart !== 'undefined' && Chart.getChart) {
        const existingChart = Chart.getChart(canvas);
        if (existingChart) {
            existingChart.destroy();
        }
    }

    if (window.chartInstances && window.chartInstances[canvasId]) {
        try { window.chartInstances[canvasId].destroy(); } catch (e) {}
        delete window.chartInstances[canvasId];
    }
}

// Hjälpfunktion för att beräkna ackumulerad bankrulle från historik (JSON eller CSV) med stöd för unikt startkapital
function processBankrollData(dataInput, baseBankroll = 10000) {
    let labels = [];
    let rawItems = [];

    // Om dataInput är en JSON-sträng, parsa den till ett objekt
    if (typeof dataInput === 'string' && (dataInput.trim().startsWith('{') || dataInput.trim().startsWith('['))) {
        try { dataInput = JSON.parse(dataInput); } catch (e) {}
    }

    // Om dataInput är ett JSON-objekt med under-array (t.ex. { history: [...] })
    if (dataInput && typeof dataInput === 'object' && !Array.isArray(dataInput)) {
        dataInput = dataInput.history || dataInput.data || dataInput.trades || dataInput.bets || [];
    }

    if (typeof dataInput === 'string') {
        const lines = dataInput.trim().split('\n');
        for (let i = 1; i < lines.length; i++) {
            const parts = lines[i].split(',');
            if (parts.length >= 2) {
                labels.push(parts[0].trim());
                rawItems.push({ profit: parseFloat(parts[1].trim()) });
            }
        }
    } else if (Array.isArray(dataInput)) {
        labels = dataInput.map(item => item.date || item.Date || item.datum || item.time || '');
        rawItems = dataInput;
    }

    const hasDynamicBankroll = rawItems.some(item => (item.bankroll && item.bankroll !== baseBankroll) || (item.total_bankroll && item.total_bankroll !== baseBankroll));

    let runningBankroll = baseBankroll;
    const profitValues = rawItems.map(item => {
        if (hasDynamicBankroll && item.bankroll !== undefined) return item.bankroll;
        if (item.total_bankroll !== undefined && item.total_bankroll !== baseBankroll) return item.total_bankroll;
        if (item.balance !== undefined && item.balance !== baseBankroll) return item.balance;
        if (item.cum_profit !== undefined) return baseBankroll + parseFloat(item.cum_profit);
        if (item.cumulative_profit !== undefined) return baseBankroll + parseFloat(item.cumulative_profit);

        const p = parseFloat(item.profit ?? item.Profit ?? item.profit_sek ?? item.value ?? 0);
        
        // Om värdet i filen redan är total bankrulle (t.ex. runt startkapitalet)
        if (p > baseBankroll * 0.3) {
            return p;
        }

        runningBankroll += p;
        return runningBankroll;
    });

    return { labels, profitValues };
}

// Universell rendering för fotbolls-/MLS-botten (startkapital 10 000 SEK)
function renderFootballChart(dataInput) {
    const ctx = document.getElementById('bot-profit-chart') || document.getElementById('football-profit-chart') || document.getElementById('mls-profit-chart');
    if (!ctx) return null;

    destroyExistingChart(ctx.id);

    const { labels, profitValues } = processBankrollData(dataInput, 10000);
    const isEnglish = isEnglishPage();

    const isDark = document.documentElement.classList.contains("dark");
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
    const textColor = isDark ? '#94a3b8' : '#64748b';

    const newChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Bankroll (SEK)',
                data: profitValues,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.3,
                pointRadius: window.innerWidth < 640 ? 2 : 4,
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
                            const labelText = isEnglish ? ' Bankroll: ' : ' Bankrulle: ';
                            return labelText + (context.parsed.y || 0).toLocaleString('sv-SE', { minimumFractionDigits: 2 }) + ' SEK';
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { 
                        color: textColor,
                        font: { size: window.innerWidth < 640 ? 10 : 12 },
                        autoSkip: true,
                        maxTicksLimit: window.innerWidth < 640 ? 6 : 10,
                        maxRotation: 45
                    }
                },
                y: {
                    grid: { color: gridColor },
                    suggestedMin: 10000,
                    ticks: { 
                        color: textColor,
                        maxTicksLimit: window.innerWidth < 640 ? 5 : 8,
                        callback: function(value) {
                            return value.toLocaleString('sv-SE') + ' SEK';
                        },
                        font: { size: window.innerWidth < 640 ? 10 : 12 }
                    }
                }
            }
        }
    });

    if (!window.chartInstances) window.chartInstances = {};
    window.chartInstances[ctx.id] = newChart;
    botChartInstance = newChart;
    return newChart;
}

// Alias för bakåtkompatibilitet
function renderBotChart(dataInput) {
    return renderFootballChart(dataInput);
}

// Graf för aktier/börs (använder korrekt startkapital 100 000 SEK & anpassad Y-axel)
function renderStockChart(dataInput) {
    const ctx = document.getElementById('stock-profit-chart');
    if (!ctx) return null;

    destroyExistingChart('stock-profit-chart');

    const { labels, profitValues } = processBankrollData(dataInput, 100000);
    const isEnglish = isEnglishPage();

    const isDark = document.documentElement.classList.contains("dark");
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
    const textColor = isDark ? '#94a3b8' : '#64748b';

    const newChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Stock Bankroll (SEK)',
                data: profitValues,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.3,
                pointRadius: window.innerWidth < 640 ? 2 : 4,
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
                            const labelText = isEnglish ? ' Value: ' : ' Värde: ';
                            return labelText + (context.parsed.y || 0).toLocaleString('sv-SE', { minimumFractionDigits: 2 }) + ' SEK';
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { 
                        color: textColor,
                        font: { size: window.innerWidth < 640 ? 10 : 12 },
                        autoSkip: true,
                        maxTicksLimit: window.innerWidth < 640 ? 6 : 10,
                        maxRotation: 45
                    }
                },
                y: {
                    suggestedMin: 100000,
                    grid: { color: gridColor },
                    ticks: { 
                        color: textColor,
                        stepSize: 500,
                        maxTicksLimit: window.innerWidth < 640 ? 5 : 8,
                        callback: function(value) {
                            return value.toLocaleString('sv-SE') + ' SEK';
                        },
                        font: { size: window.innerWidth < 640 ? 10 : 12 }
                    }
                }
            }
        }
    });

    if (!window.chartInstances) window.chartInstances = {};
    window.chartInstances['stock-profit-chart'] = newChart;
    stockChartInstance = newChart;
    return newChart;
}

// Hjälpfunktion för att ladda CSV/JSON-filer direkt med korrekt sökväg
async function loadAndRenderChart(canvasId, csvUrl, label, borderColor, backgroundColor, currentInstance) {
    try {
        const finalUrl = (window.pathPrefix && !csvUrl.startsWith(window.pathPrefix) && !csvUrl.startsWith('http')) 
            ? window.pathPrefix + csvUrl 
            : csvUrl;

        const response = await fetch(finalUrl + '?t=' + Date.now());
        if (!response.ok) return null;
        const text = await response.text();

        if (canvasId === 'stock-profit-chart') {
            return renderStockChart(text);
        } else {
            return renderFootballChart(text);
        }
    } catch (e) {
        console.error("Fel vid inläsning av chart data:", e);
    }
    return null;
}
