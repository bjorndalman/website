/**
 * js/charts.js
 * Centraliserad hantering och rendering av grafer (CSV & JSON-stöd)
 */

var pathPrefix = typeof isSwedishPage !== 'undefined' && isSwedishPage ? "../" : "./";
var botChartInstance = null;
var stockChartInstance = null;

// Säker förstöring av befintliga grafer för att förhindra "Canvas is already in use"-fel
function destroyExistingChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    // 1. Kolla om Chart.js har en registrerad instans direkt på canvasen
    if (typeof Chart !== 'undefined' && Chart.getChart) {
        const existingChart = Chart.getChart(canvas);
        if (existingChart) {
            existingChart.destroy();
        }
    }

    // 2. Rensa från globala spårningsobjekt
    if (window.chartInstances && window.chartInstances[canvasId]) {
        try { window.chartInstances[canvasId].destroy(); } catch (e) {}
        delete window.chartInstances[canvasId];
    }
}

// Polymorf funktion: Hanterar BÅDE CSV-strängar och JSON-arrayer
function renderStockChart(dataInput) {
    const ctx = document.getElementById('stock-profit-chart');
    if (!ctx) return null;

    destroyExistingChart('stock-profit-chart');

    let labels = [];
    let data = [];

    if (typeof dataInput === 'string') {
        // Parse CSV-data
        const lines = dataInput.trim().split('\n');
        for (let i = 1; i < lines.length; i++) {
            const parts = lines[i].split(',');
            if (parts.length >= 2) {
                labels.push(parts[0].trim());
                data.push(parseFloat(parts[1].trim()));
            }
        }
    } else if (Array.isArray(dataInput)) {
        // Parse JSON-array
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
                            return ' Värde: ' + (context.parsed.y || 0).toLocaleString('sv-SE', { minimumFractionDigits: 2 }) + ' SEK';
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { 
                        color: textColor,
                        font: { size: window.innerWidth < 640 ? 10 : 12 }
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

function renderBotChart(csvText) {
    const ctx = document.getElementById('bot-profit-chart');
    if (!ctx) return null;

    destroyExistingChart('bot-profit-chart');

    const lines = csvText.trim().split('\n');
    const labels = [];
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',');
        if (parts.length >= 2) {
            labels.push(parts[0].trim());
            data.push(parseFloat(parts[1].trim()));
        }
    }

    const isDark = document.documentElement.classList.contains("dark");
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
    const textColor = isDark ? '#94a3b8' : '#64748b';

    const newChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Bankroll',
                data: data,
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
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
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { 
                        color: textColor,
                        font: { size: window.innerWidth < 640 ? 10 : 12 }
                    }
                },
                y: {
                    grid: { color: gridColor },
                    ticks: { 
                        color: textColor,
                        maxTicksLimit: window.innerWidth < 640 ? 5 : 8,
                        font: { size: window.innerWidth < 640 ? 10 : 12 }
                    }
                }
            }
        }
    });

    if (!window.chartInstances) window.chartInstances = {};
    window.chartInstances['bot-profit-chart'] = newChart;
    botChartInstance = newChart;
    return newChart;
}

async function loadAndRenderChart(canvasId, csvUrl, label, borderColor, backgroundColor, currentInstance) {
    try {
        const response = await fetch(csvUrl + '?t=' + Date.now());
        if (!response.ok) return null;
        const csvText = await response.text();

        if (canvasId === 'stock-profit-chart') {
            return renderStockChart(csvText);
        } else if (canvasId === 'bot-profit-chart') {
            return renderBotChart(csvText);
        }
    } catch (e) {
        console.error("Fel vid inläsning av chart CSV:", e);
    }
    return null;
}

function renderFootballChart(historyData) {
    const ctx = document.getElementById('bot-profit-chart') || document.getElementById('football-profit-chart') || document.getElementById('mls-profit-chart');
    if (!ctx) return;

    destroyExistingChart(ctx.id);

    const labels = historyData.map(item => item.date || item.Date || item.datum || '');
    const profitValues = historyData.map(item => item.profit ?? item.Profit ?? 0);

    const isDark = document.documentElement.classList.contains("dark");
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
    const textColor = isDark ? '#94a3b8' : '#64748b';

    const newChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Football Net Profit (SEK)',
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
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { 
                        color: textColor,
                        font: { size: window.innerWidth < 640 ? 10 : 12 }
                    }
                },
                y: {
                    grid: { color: gridColor },
                    ticks: { 
                        color: textColor,
                        maxTicksLimit: window.innerWidth < 640 ? 5 : 8,
                        font: { size: window.innerWidth < 640 ? 10 : 12 }
                    }
                }
            }
        }
    });

    if (!window.chartInstances) window.chartInstances = {};
    window.chartInstances[ctx.id] = newChart;
    if (ctx.id === 'bot-profit-chart') botChartInstance = newChart;
}
