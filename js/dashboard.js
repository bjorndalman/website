async function loadPortfolioData() {
  try {
    const response = await fetch(`${pathPrefix}data/portfolio_summary.json?t=${Date.now()}`);
    if (!response.ok) return;
    const data = await response.json();

    const totalValEl = document.getElementById('portfolio-total-value');
    if (totalValEl && data.total_value) {
      totalValEl.textContent = `${data.total_value.toLocaleString('sv-SE')} SEK`;
    }

    const returnEl = document.getElementById('portfolio-total-return');
    if (returnEl && data.total_return) {
      returnEl.textContent = data.total_return;
    }
  } catch (err) {
    console.warn("Kunde inte hämta portföljdata:", err);
  }
}

async function loadStockAIDashboard() {
  const tradesBody = document.getElementById('stock-trades-body');
  
  try {
    const res = await fetch(`${pathPrefix}data/ai_dashboard_data.json?t=${Date.now()}`);
    if (!res.ok) throw new Error("Could not fetch ai_dashboard_data.json");
    
    const data = await res.json();
    
    if (data.updated_at) {
      const syncElem = document.getElementById('stock-last-sync');
      if (syncElem) syncElem.innerText = data.updated_at;
    }

    if (data.summary) {
      const bankroll = data.summary.current_bankroll || 100000;
      const profitPct = data.summary.profit_pct || 0;

      const bankrollElem = document.getElementById('stock-bankroll');
      if (bankrollElem) {
        bankrollElem.innerText = bankroll.toLocaleString('sv-SE') + ' SEK';
      }
      
      const returnElem = document.getElementById('stock-return-pct');
      if (returnElem) {
        returnElem.innerText = (profitPct >= 0 ? '+' : '') + profitPct.toFixed(2) + '%';
        returnElem.className = "text-2xl md:text-3xl font-extrabold " + (profitPct >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400");
      }
    }

    if (!tradesBody) return;

    const trades = data.latest_trades_and_forecasts || [];

    if (trades.length === 0) {
      tradesBody.innerHTML = `<tr><td colspan="7" class="py-6 text-center text-slate-500">No active trades registered yet.</td></tr>`;
      const investedElem = document.getElementById('stock-invested');
      if (investedElem) investedElem.innerText = '0 SEK';
      return;
    }

    tradesBody.innerHTML = '';
    let totalInvested = 0;

    const actionMap = {
      'KÖP': 'BUY', 'BUY': 'BUY',
      'SÄLJ': 'SELL', 'SELL': 'SELL',
      'STÄNG': 'CLOSED', 'STÄNGD': 'CLOSED', 'CLOSE': 'CLOSED', 'CLOSED': 'CLOSED',
      'HÅLL': 'HOLD', 'HOLD': 'HOLD', 'NEUTRAL': 'HOLD',
      'PAUS': 'PAUSED'
    };

    trades.slice().reverse().forEach(row => {
      const date = row['Date'] || row['date'] || row['Datum'] || '-';
      const stock = row['Stock'] || row['stock'] || row['ticker'] || row['symbol'] || row['Aktie'] || row['namn'] || row['Name'] || '-';

      const rawAction = row['Åtgärd'] || row['åtgärd'] || row['Action'] || row['action'] || row['Status'] || row['status'] || 'BUY';
      const actionUpper = String(rawAction).trim().toUpperCase();
      const displayAction = actionMap[actionUpper] || actionUpper;
      
      const rawAmount = row['ai_investment'] ?? row['position_size'] ?? row['Rek. Investering (kr)'] ?? row['AI Investering (kr)'] ?? row['Trade Amount'] ?? 0;
      const amount = parseFloat(rawAmount) || 0;
      if (displayAction === 'BUY') totalInvested += amount;

      const formattedAmount = amount > 0 
        ? `${amount.toLocaleString('sv-SE')} SEK` 
        : (row['ai_investment'] || row['Rek. Investering (kr)'] || '-');

      let badgeStyle = "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800";
      
      if (displayAction === 'SELL' || displayAction === 'CLOSED') {
        badgeStyle = "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400 border-rose-300 dark:border-rose-800";
      } else if (displayAction === 'HOLD' || displayAction === 'PAUSED') {
        badgeStyle = "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700";
      }

      const rawPrice = row['price'] ?? row['Price'] ?? row['Aktuell Kurs'] ?? row['close_price'] ?? row['current_price'] ?? '';
      const parsedPrice = parseFloat(rawPrice);
      const formattedPrice = !isNaN(parsedPrice) ? `${parsedPrice.toFixed(2)} SEK` : (rawPrice || '-');

      const rawKalman = row['kalman_value'] ?? row['Kalman Value'] ?? row['Kalman-värde'] ?? row['fair_value'] ?? '';
      const parsedKalman = parseFloat(rawKalman);
      const formattedKalman = !isNaN(parsedKalman) ? `${parsedKalman.toFixed(2)} SEK` : (rawKalman || '-');

      const argument = row['argument'] || row['AI Argument & Forecast'] || row['Motivering'] || row['reasoning'] || row['forecast'] || row['ai_forecast'] || row['comment'] || row['analysis'] || '-';

      const tr = document.createElement('tr');
      tr.className = "hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors";
      tr.innerHTML = `
        <td class="py-3.5 px-4 text-xs font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">${date}</td>
        <td class="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">${stock}</td>
        <td class="py-3.5 px-4">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeStyle}">
            ${displayAction}
          </span>
        </td>
        <td class="py-3.5 px-4 text-slate-700 dark:text-slate-300 whitespace-nowrap">${formattedPrice}</td>
        <td class="py-3.5 px-4 text-slate-700 dark:text-slate-300 whitespace-nowrap">${formattedKalman}</td>
        <td class="py-3.5 px-4 font-semibold text-slate-900 dark:text-white whitespace-nowrap">${formattedAmount}</td>
        <td class="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">${argument}</td>
      `;
      tradesBody.appendChild(tr);
    });

    const investedElem = document.getElementById('stock-invested');
    if (investedElem) {
      investedElem.innerText = totalInvested.toLocaleString('sv-SE') + ' SEK';
    }

  } catch (err) {
    console.warn("Could not load AI stock dashboard table data:", err);
  }
}

async function fetchStockStats() {
    const returnEl = document.getElementById('stock-return-pct');
    const profitEl = document.getElementById('stock-profit');
    const bankrollEl = document.getElementById('stock-bankroll');
    const investedEl = document.getElementById('stock-invested');

    if (!returnEl && !profitEl && !bankrollEl && !investedEl) return;

    try {
        const response = await fetch(`${pathPrefix}data/stock_stats.json?t=${Date.now()}`);
        if (!response.ok) return;
        const data = await response.json();

        if (returnEl && data.profit_pct && !data.profit_pct.includes('nan')) {
            returnEl.textContent = data.profit_pct;
            returnEl.className = data.is_positive 
                ? "text-2xl md:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400" 
                : "text-2xl md:text-3xl font-extrabold text-rose-600 dark:text-rose-400";
        }

        if (profitEl && data.net_profit_sek) {
            profitEl.textContent = data.net_profit_sek;
        }

        if (bankrollEl && data.total_bankroll && !data.total_bankroll.includes('nan')) {
            bankrollEl.textContent = data.total_bankroll;
        }

        if (investedEl && data.total_invested) {
            investedEl.textContent = data.total_invested;
        }
    } catch (err) {
        console.warn("Aktie-stats ej tillgängliga.", err);
    }
}

async function loadPipelineStatus() {
    const syncEl = document.getElementById('mls-last-sync');
    if (!syncEl) return;

    try {
        // Ändrat till stats.json
        const response = await fetch(`${pathPrefix}data/stats.json?t=${Date.now()}`);
        if (!response.ok) return;
        const data = await response.json();

        if (syncEl && data.last_sync) {
            syncEl.textContent = data.last_sync;
        }
    } catch (error) {
        console.warn("Kunde inte hämta pipeline-status:", error);
    }
}
async function loadKalmanRankings() {
    const topContainer = document.getElementById('top-teams');
    const bottomContainer = document.getElementById('bottom-teams');
    const nextMatchdayEl = document.getElementById('mls-next-matchday');

    if (!topContainer && !bottomContainer && !nextMatchdayEl) return;

    try {
        const response = await fetch(`${pathPrefix}data/top_bottom_teams.json?t=${Date.now()}`);
        if (!response.ok) return;
        
        const data = await response.json();

        if (nextMatchdayEl && data.next_matchday) {
            nextMatchdayEl.textContent = data.next_matchday;
        }

        const top5 = data.top5 || [];
        const bottom5 = data.bottom5 || [];

        if (topContainer && top5.length > 0) {
            topContainer.innerHTML = top5.map(team => `
                <tr class="hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30 transition">
                    <td class="py-2.5 font-medium text-slate-800 dark:text-slate-200">
                        <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400 mr-2">#${team.rank}</span>
                        ${team.name}
                    </td>
                    <td class="py-2.5 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        ${team.strength > 0 ? '+' : ''}${team.strength.toFixed(4)}
                    </td>
                </tr>
            `).join('');
        }

        if (bottomContainer && bottom5.length > 0) {
            bottomContainer.innerHTML = bottom5.map(team => `
                <tr class="hover:bg-rose-100/50 dark:hover:bg-rose-900/30 transition">
                    <td class="py-2.5 font-medium text-slate-800 dark:text-slate-200">
                        <span class="text-xs font-bold text-rose-600 dark:text-rose-400 mr-2">#${team.rank}</span>
                        ${team.name}
                    </td>
                    <td class="py-2.5 text-right font-mono font-bold text-rose-700 dark:text-rose-400">
                        ${team.strength > 0 ? '+' : ''}${team.strength.toFixed(4)}
                    </td>
                </tr>
            `).join('');
        }
    } catch (err) {
        console.warn("Kunde inte hämta Kalman-rankings:", err);
    }
}
