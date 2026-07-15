// ==========================================
// AUTOMATION: FETCH CSV & RENDER CHART
// ==========================================
function renderBotChart() {
  const chartCanvas = document.getElementById('bot-profit-chart');
  if (!chartCanvas) return;

  fetch('data/portfolio_summary.csv')
    .then(response => response.text())
    .then(csvText => {
      const lines = csvText.trim().split('\n');
      if (lines.length <= 1) return;

      // Hämta råa headers, trimma dem och gör dem till gemener för säker matchning
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      // Sök efter kolumnerna med bredare matchning
      let dateIndex = headers.findIndex(h => h.includes('dat'));
      let bankrollIndex = headers.findIndex(h => h.includes('kassa') || h.includes('nuvarande'));

      // FALLBACK: Om webbläsaren har problem med teckenkodningen, använd kända indexpositioner
      // Index 0: Datum, Index 3: Nuvarande Kassa (kr)
      if (dateIndex === -1) dateIndex = 0;
      if (bankrollIndex === -1) bankrollIndex = 3;

      const dailyData = {};
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const columns = lines[i].split(',');
        
        // Säkerställ att raden faktiskt har tillräckligt med kolumner
        if (columns.length > Math.max(dateIndex, bankrollIndex)) {
          const fullDateStr = columns[dateIndex].trim();
          const cleanDate = fullDateStr.split(' ')[0]; // Tar bort eventuellt tidsstämpel (t.ex. 12:00)
          const bankroll = parseFloat(columns[bankrollIndex].trim());

          if (!isNaN(bankroll)) {
            dailyData[cleanDate] = bankroll;
          }
        }
      }

      const sortedDates = Object.keys(dailyData).sort();
      const labels = sortedDates;
      const dataPoints = sortedDates.map(date => dailyData[date]);

      const isDarkMode = document.documentElement.classList.contains('dark');
      const gridColor = isDarkMode ? '#334155' : '#e2e8f0'; 
      const textColor = isDarkMode ? '#94a3b8' : '#64748b'; 

      if (botChartInstance) {
        botChartInstance.destroy();
      }

      // @ts-ignore
      botChartInstance = new Chart(chartCanvas, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Total Bankroll (kr)',
            data: dataPoints,
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            borderWidth: 2.5,
            tension: 0.3,
            pointRadius: 4,
            pointBackgroundColor: '#2563eb'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: {
              grid: { display: false }, 
              ticks: { 
                color: textColor, 
                font: { size: 10 },
                maxRotation: 0,
                autoSkip: true,
                maxTicksLimit: 7
              }
            },
            y: {
              grid: { color: gridColor },
              ticks: { 
                color: textColor, 
                font: { size: 10 },
                callback: function(value) {
                  return value.toLocaleString('sv-SE') + ' kr';
                }
              }
            }
          }
        }
      });
    })
    .catch(err => {
      console.log("Kunde inte ladda portfolio_summary.csv för diagrammet.", err);
    });
}
