/**
 * js/charts.js
 * Hanterar diagram för Fotboll & Kalman-modeller.
 */

window.chartInstances = window.chartInstances || {};

function destroyExistingChart(canvasId) {
    if (window.chartInstances[canvasId]) {
        window.chartInstances[canvasId].destroy();
        delete window.chartInstances[canvasId];
    }
}

// ==========================================
// FOTBOLL & KALMAN-MODELL (Ligger kvar helt opåverkad)
// ==========================================

function renderFootballChart(historyData) {
    const ctx = document.getElementById('football-profit-chart'); // eller ditt canvas-ID för fotboll
    if (!ctx) return;

    destroyExistingChart('football-profit-chart');

    const labels = historyData.map(item => item.date || item.Date || '');
    const profitValues = historyData.map(item => item.profit || item.Profit || 0);

    window.chartInstances['football-profit-chart'] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Football Net Profit (SEK)',
                data: profitValues,
                borderColor: '#3b82f6', // Blå färg för fotboll
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
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
                legend: { display: false },
                tooltip: { mode: 'index', intersect: false }
            },
            scales: {
                x: { grid: { display: false } },
                y: { grid: { color: 'rgba(148, 163, 184, 0.1)' } }
            }
        }
    });
}

// Om du har fler fotbolls-/Kalman-funktioner i charts.js ligger de kvar här nedanför...
