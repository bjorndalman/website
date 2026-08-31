// RETA DETTA HÖGST UPP I js/charts.js
botChartInstance = typeof botChartInstance !== 'undefined' ? botChartInstance : null;
stockChartInstance = typeof stockChartInstance !== 'undefined' ? stockChartInstance : null;

// ... behåll resten av funktionerna i charts.js oförändrade ...

function parseCsvData(csvText, isBotChart = false) {
    const lines = csvText.trim().split('\n');
    const labels = [];
    const dataPoints = [];
    
    const monthsSv = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
    let lastRawDate = null;

    for (let i = 1; i < lines.length; i++) {
        const columns = lines[i].split(',');
        if (columns.length >= 4) {
            const rawDate = columns[0].trim();
            const valueStr = columns[3].trim();
            
            if (valueStr.toLowerCase() === 'nan') continue;
            const value = parseFloat(valueStr);
            
            if (!isNaN(value)) {
                lastRawDate = rawDate; 
                const parts = rawDate.split(' ');
                const dateStr = parts[0];
                const dateParts = dateStr.split('-');
                
                if (dateParts.length === 3) {
                    const monthIndex = parseInt(dateParts[1], 10) - 1;
                    const day = parseInt(dateParts[2], 10);
                    const monthName = monthsSv[monthIndex] || dateParts[1];
                    
                    if (parts.length >= 2) {
                        const timeShort = parts[1].slice(0, 5);
                        labels.push(`${day} ${monthName} ${timeShort}`);
                    } else {
                        labels.push(`${day} ${monthName}`);
                    }
                } else {
                    labels.push(rawDate);
                }
                dataPoints.push(value);
            }
        }
    }

    if (isBotChart && lastRawDate) {
        const syncEl = document.getElementById('mls-last-sync');
        if (syncEl) {
            //syncEl.textContent = lastRawDate.split(' ')[0];
        }
    }

    return { labels, dataPoints };
}

function buildChartConfig(labels, dataPoints, label, lineColor, fillColor, isDark) {
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
  const textColor = isDark ? '#94a3b8' : '#64748b';

  return {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: label,
        data: dataPoints,
        borderColor: lineColor,
        borderWidth: 2,
        tension: 0.35,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: lineColor,
        fill: true,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 200);
          gradient.addColorStop(0, fillColor);
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
          return gradient;
        }
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
          padding: 10,
          displayColors: false
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: textColor,
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 3,
            padding: 10
          }
        },
        y: {
          grid: { color: gridColor },
          border: { dash: [4, 4] },
          ticks: {
            color: textColor,
            callback: (value) => `${value.toLocaleString('sv-SE')} kr`
          }
        }
      }
    }
  };
}

async function loadAndRenderChart(canvasId, csvUrl, label, lineColor, fillColor, existingChartInstance) {
    const chartCanvas = document.getElementById(canvasId);
    if (!chartCanvas || typeof Chart === 'undefined') return null;

    try {
        const fullUrl = `${pathPrefix}${csvUrl}?t=${Date.now()}`;
        const response = await fetch(fullUrl);
        if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
        const csvText = await response.text();
        
        const isBot = (canvasId === 'bot-profit-chart');
        const { labels, dataPoints } = parseCsvData(csvText, isBot);
        const isDark = document.documentElement.classList.contains("dark");

        if (dataPoints.length > 0) {
            const latestValue = dataPoints[dataPoints.length - 1];
            
            if (canvasId === 'bot-profit-chart') {
                const bankrollEl = document.getElementById('bot-bankroll');
                if (bankrollEl) {
                    bankrollEl.textContent = latestValue.toLocaleString('sv-SE', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                    }) + ' kr';
                }

                const initialValue = 10000;
                const netProfit = latestValue - initialValue;
                const profitEl = document.getElementById('bot-profit');
                if (profitEl) {
                    profitEl.textContent = netProfit.toLocaleString('sv-SE', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                    }) + ' kr';
                    profitEl.className = netProfit >= 0 
                        ? "text-3xl font-extrabold text-emerald-600 dark:text-emerald-400" 
                        : "text-3xl font-extrabold text-rose-600 dark:text-rose-400";
                }
           } else if (canvasId === 'stock-profit-chart') {
                const bankrollEl = document.getElementById('stock-bankroll');
                if (bankrollEl) {
                    bankrollEl.textContent = latestValue.toLocaleString('sv-SE', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                    }) + ' kr';
                }
                const initialValue = 100000;
                const netProfit = latestValue - initialValue;
                const profitEl = document.getElementById('stock-profit');
                if (profitEl) {
                    profitEl.textContent = (netProfit >= 0 ? '+' : '') + netProfit.toLocaleString('sv-SE', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                    }) + ' SEK';
                    profitEl.className = "text-2xl md:text-3xl font-extrabold " + (netProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400");
                }
           }
        }

        if (existingChartInstance) existingChartInstance.destroy();
        
        const config = buildChartConfig(labels, dataPoints, label, lineColor, fillColor, isDark);
        return new Chart(chartCanvas, config);
    } catch (err) {
        console.warn(`Kunde inte ladda graf för ${canvasId}:`, err);
        return existingChartInstance;
    }
}
