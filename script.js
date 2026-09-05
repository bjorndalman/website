document.addEventListener("DOMContentLoaded", async () => {
  // 1. Läs in språk och initiera tema
  if (typeof loadLanguageData === 'function') loadLanguageData();
  if (typeof initTheme === 'function') initTheme();
  
  // 2. Rendera text om huvudelement finns (t.ex. på index.html)
  if (document.getElementById('name') && typeof render === 'function') {
    render();
  }

  // 3. Koppla tema-knappar
  const themeToggleBtn = document.getElementById('theme-toggle');
  if (themeToggleBtn && typeof toggleTheme === 'function') {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }
  
  const themeToggleMobileBtn = document.getElementById('theme-toggle-mobile');
  if (themeToggleMobileBtn && typeof toggleTheme === 'function') {
    themeToggleMobileBtn.addEventListener('click', toggleTheme);
  }

  // 4. Koppla mobilmeny
  const menuButton = document.getElementById('menu-button');
  if (menuButton && typeof toggleMobileMenu === 'function') {
    menuButton.addEventListener('click', toggleMobileMenu);
  }

  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach(link => {
      if (!link.classList.contains('lang-icon') && typeof closeMobileMenu === 'function') {
        link.addEventListener('click', closeMobileMenu);
      }
    });
  }

  // 5. Starta animationer och hämta dashboard-data säkert
  if (typeof initScrollAnimations === 'function') initScrollAnimations();
  if (typeof loadPipelineStatus === 'function') await loadPipelineStatus();
  if (typeof loadPortfolioData === 'function') await loadPortfolioData();
  
  // FIXERING: Lagt till await så att JSON-datan garanterat hinner ladda och rita innan steg 6 körs!
  if (typeof loadStockAIDashboard === 'function') await loadStockAIDashboard();
  if (typeof loadKalmanRankings === 'function') await loadKalmanRankings();
  if (typeof loadFootballAIDashboard === 'function') await loadFootballAIDashboard();

  // 6. Rendera diagram från CSV (endast om elementen finns OCH inte redan renderats via JSON)
  const prefix = typeof pathPrefix !== 'undefined' ? pathPrefix : '';

  if (document.getElementById('bot-profit-chart') && typeof loadAndRenderChart === 'function') {
    if (!window.chartInstances || !window.chartInstances['bot-profit-chart']) {
      window.botChartInstance = await loadAndRenderChart(
          'bot-profit-chart',
          prefix + 'data/portfolio_summary.csv',
          'Bankroll',
          '#2563eb',
          'rgba(37, 99, 235, 0.25)',
          window.botChartInstance || null
      );
    }
  }

  if (document.getElementById('stock-profit-chart') && typeof loadAndRenderChart === 'function') {
    if (!window.chartInstances || !window.chartInstances['stock-profit-chart']) {
      window.stockChartInstance = await loadAndRenderChart(
          'stock-profit-chart',
          prefix + 'data/stock_portfolio_summary.csv',
          'Stock Bankroll',
          '#10b981',
          'rgba(16, 185, 129, 0.25)',
          window.stockChartInstance || null
      );
    }
  }
});
