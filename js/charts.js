// RETA DETTA HÖGST UPP I js/charts.js
var pathPrefix = typeof isSwedishPage !== 'undefined' && isSwedishPage ? "../" : "./";
var botChartInstance = null;
var stockChartInstance = null;

function destroyExistingChart(canvasId) {
    if (window.chartInstances && window.chartInstances[canvasId]) {
        window.chartInstances[canvasId].destroy();
        delete window.chartInstances[canvasId];
    }
}

function renderStockChart(csvText) {
    const ctx = document.getElementById('stock-profit-chart');
    if (!ctx) return null;
    
    destroyExistingChart('stock-profit-chart');

    const lines = csvText.trim().split('\n');
    const labels = [];
    const data = [];
    
    // Hoppar över rubrikraden (i = 1)
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
                label: 'Stock Bankroll',
                data: data,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.3,
                pointRadius: 2,
                pointHoverRadius: 5
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
                    ticks: { color: textColor }
                },
                y: {
                    grid: { color: gridColor },
                    ticks: { color: textColor }
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
                pointRadius: 2,
                pointHoverRadius: 5
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
                    ticks: { color: textColor }
                },
                y: {
                    grid: { color: gridColor },
                    ticks: { color: textColor }
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

    const labels = historyData.map(item => item.date || item.Date || '');
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
                pointRadius: 3,
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
                    ticks: { color: textColor }
                },
                y: {
                    grid: { color: gridColor },
                    ticks: { color: textColor }
                }
            }
        }
    });

    if (!window.chartInstances) window.chartInstances = {};
    window.chartInstances[ctx.id] = newChart;
    if (ctx.id === 'bot-profit-chart') botChartInstance = newChart;
}
