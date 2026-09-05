/**
 * js/charts.js
 * Centraliserad hantering och rendering av grafer (CSV & JSON-stöd)
 */

var pathPrefix = typeof isSwedishPage !== 'undefined' && isSwedishPage ? "../" : "./";
var botChartInstance = null;
var stockChartInstance = null;

function isEnglishPage() {
    return window.location.pathname.toLowerCase().includes('/en/') || document.documentElement.lang === 'en';
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

// Hjälpfunktion för att beräkna ackumulerad bankrulle från historik (JSON eller CSV)
function processBankrollData(dataInput) {
    let labels = [];
    let rawItems = [];

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
        labels = dataInput.map(item => item.date || item.Date || item.datum || '');
        rawItems = dataInput;
    }

    const hasDynamicBankroll = rawItems.some(item => item.bankroll && item.bankroll !== 10000);

    let runningBankroll = 10000;
    const profitValues = rawItems.map(item => {
        if (hasDynamicBankroll && item.bankroll !== undefined) return item.bankroll;
        if (item.total_bankroll !== undefined && item.total_bankroll !== 10000) return item.total_bankroll;
        if (item.balance !== undefined && item.balance !== 10000) return item.balance;
        if (item.cum_profit !== undefined) return 10000 + parseFloat(item.cum_profit);
        if (item.cumulative_profit !== undefined) return 10000 + parseFloat(item.cumulative_profit);

        const p = parseFloat(item.profit ?? item.Profit ?? item.profit_sek ?? 0);
        runningBankroll += p;
        return runningBankroll;
    });

    return { labels, profitValues };
}

// Universell rendering för fotbolls-/MLS-botten
function renderFootballChart(dataInput) {
    const ctx = document.getElementById('bot-profit-chart') || document.getElementById('football-profit-chart') || document.getElementById('mls-profit-chart');
    if (!ctx) return null;

    destroyExistingChart(ctx.id);

    const { labels, profitValues } = processBankrollData(dataInput);
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
                borderColor: '#10b981', // Emerald Grön
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

// Graf för aktier/börs
function renderStockChart(dataInput) {
    const ctx = document.getElementById('stock-profit-chart');
    if (!ctx) return null;

    destroyExistingChart('stock-profit-chart');

    let labels = [];
    let data = [];
    const isEnglish = isEnglishPage();

    if (typeof dataInput === 'string') {
        const lines = dataInput.trim().split('\n');
        for (let i = 1; i < lines.length; i++) {
            const parts = lines[i].split(',');
            if (parts.length >= 2) {
                labels.push(parts[0].trim());
                data.push(parseFloat(parts[1].trim()));
            }
        }
    } else if (Array.isArray(dataInput)) {
        labels = dataInput.map(item => item.date || item.Date || item.datum || '');
        data = dataInput.map(item => item.bankroll ?? item.total_bankroll ?? item.profit ?? item.Profit ?? item.profit_sek ?? 0);
    }

    const isDark = document.documentElement.classList.contains("dark");
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
    const textColor = isDark ? '#94a3b8' : '#64748b';

    const newChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Stock Bankroll (SEK)',
                data: data,
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
                    grid: { color: gridColor },
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
    window.chartInstances['stock-profit-chart'] = newChart;
    stockChartInstance = newChart;
    return newChart;
}

// Hjälpfunktion för att ladda CSV-filer direkt om någon sida fortfarande kräver det
async function loadAndRenderChart(canvasId, csvUrl, label, borderColor, backgroundColor, currentInstance) {
    try {
        const response = await fetch(csvUrl + '?t=' + Date.now());
        if (!response.ok) return null;
        const csvText = await response.text();

        if (canvasId === 'stock-profit-chart') {
            return renderStockChart(csvText);
        } else if (canvasId === 'bot-profit-chart' || canvasId === 'football-profit-chart') {
            return renderFootballChart(csvText);
        }
    } catch (e) {
        console.error("Fel vid inläsning av chart CSV:", e);
    }
    return null;
}
