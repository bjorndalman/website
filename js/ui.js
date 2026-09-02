// RETA DETTA HÖGST UPP I js/ui.js
var isSwedishPage = window.location.pathname.toLowerCase().includes('/sv/');
var appData = {};
var pathPrefix = isSwedishPage ? "../" : "";

function loadLanguageData() {
  isSwedishPage = window.location.pathname.toLowerCase().includes('/sv/');
  
  if (isSwedishPage && typeof swedishData !== 'undefined') {
    appData = swedishData;
  } else if (typeof portfolioData !== 'undefined') {
    appData = portfolioData;
  } else if (typeof defaultData !== 'undefined') {
    appData = defaultData;
  }
  
  pathPrefix = isSwedishPage ? "../" : "";
}

// ... resten av din funktioner (initTheme, toggleTheme, render, etc.) sparar du exakt som de är!

function initTheme() {
  const stored = localStorage.getItem("theme");
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (stored === "dark" || (!stored && systemDark)) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

function toggleTheme() {
  document.documentElement.classList.toggle("dark");
  const isDark = document.documentElement.classList.contains("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");

  // Uppdatera alla aktiva Chart.js-instanser från window.chartInstances
  if (window.chartInstances) {
    Object.values(window.chartInstances).forEach(chart => {
      if (chart && chart.options && chart.options.scales) {
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
        const textColor = isDark ? '#94a3b8' : '#64748b';
        if (chart.options.scales.x && chart.options.scales.x.ticks) chart.options.scales.x.ticks.color = textColor;
        if (chart.options.scales.y && chart.options.scales.y.ticks) chart.options.scales.y.ticks.color = textColor;
        if (chart.options.scales.y && chart.options.scales.y.grid) chart.options.scales.y.grid.color = gridColor;
        chart.update();
      }
    });
  }
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function renderDescription(descriptionData) {
  if (Array.isArray(descriptionData)) {
    return `<ul class="list-outside">${descriptionData.map(item => `<li class="mb-1 ml-4 list-disc">${item}</li>`).join('')}</ul>`;
  }
  return descriptionData.replace(/\n/g, '<br>');
}

function render() {
  // Säkerställ att appData och appData.profile finns innan rendrering
  if (!appData || !appData.profile) return;

  setText("name", appData.profile.name);
  setText("footer-name", appData.profile.name);
  setText("title", appData.profile.title);
  setText("presentation", appData.profile.presentation);
  setText("email", appData.profile.email);

  const emailLink = document.getElementById("email-link");
  if (emailLink) emailLink.href = `mailto:${appData.profile.email}`;

  const copyrightYear = document.getElementById("copyright-year");
  if (copyrightYear && !copyrightYear.textContent) {
    copyrightYear.textContent = new Date().getFullYear();
  }

  if (appData.skills && document.getElementById("skills-list")) {
    document.getElementById("skills-list").innerHTML = appData.skills.map(skill => `
      <span class="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900 dark:hover:text-blue-300 transition cursor-default">
        ${skill}
      </span>
    `).join('');
  }

  if (appData.experience && document.getElementById("experience-list")) {
    document.getElementById("experience-list").innerHTML = appData.experience.map(exp => `
      <div class="relative pl-8 md:pl-0">
        <div class="hidden md:block absolute -left-[41px] top-1 w-5 h-5 bg-blue-600 rounded-full border-4 border-white dark:border-slate-950"></div>
        <h4 class="text-xl font-bold text-slate-900 dark:text-white">${exp.title}</h4>
        <div class="text-blue-600 dark:text-blue-400 font-medium mb-2 text-sm">
          ${exp.company} • ${exp.years}
        </div>
        <p class="text-slate-600 dark:text-slate-400 leading-relaxed">
          ${renderDescription(exp.description)}
        </p>
      </div>
    `).join('');
  }

  if (appData.education && document.getElementById("education-list")) {
    document.getElementById("education-list").innerHTML = appData.education.map(edu => `
      <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div class="flex flex-col md:flex-row md:justify-between md:items-start mb-2">
            <h4 class="text-lg font-bold text-slate-900 dark:text-white">${edu.school}</h4>
            <span class="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-500">${edu.years}</span>
        </div>
        <p class="text-blue-600 dark:text-blue-400 font-medium text-sm mb-3">${edu.program}</p>
        <div class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
          ${renderDescription(edu.description)}
        </div>
      </div>
    `).join('');
  }

  if (appData.freetime && document.getElementById("freetime-list")) {
    document.getElementById("freetime-list").innerHTML = appData.freetime.map((item, index) => `
      <li class="flex items-center">
        ${item} ${index < appData.freetime.length - 1 ? '<span class="mx-2 opacity-50">•</span>' : ''}
      </li>
    `).join('');
  }

  if (window.lucide) window.lucide.createIcons();
}

function toggleMobileMenu() {
  const mobileMenu = document.getElementById('mobile-menu');
  const menuIcon = document.getElementById('menu-icon');
  const closeIcon = document.getElementById('close-icon');

  if (!mobileMenu) return;
  if (mobileMenu.classList.contains('h-0')) {
    mobileMenu.classList.remove('h-0'); 
    mobileMenu.classList.add('h-auto', 'border-b', 'border-slate-200', 'dark:border-slate-800');
    if (menuIcon) menuIcon.classList.add('hidden');
    if (closeIcon) closeIcon.classList.remove('hidden');
  } else {
    closeMobileMenu();
  }
  if (window.lucide) window.lucide.createIcons();
}

function closeMobileMenu() {
  const mobileMenu = document.getElementById('mobile-menu');
  const menuIcon = document.getElementById('menu-icon');
  const closeIcon = document.getElementById('close-icon');

  if (!mobileMenu) return;
  mobileMenu.classList.remove('h-auto', 'border-b', 'border-slate-200', 'dark:border-slate-800');
  mobileMenu.classList.add('h-0');
  if (menuIcon) menuIcon.classList.remove('hidden');
  if (closeIcon) closeIcon.classList.add('hidden');
}

function initScrollAnimations() {
  const fadeElements = document.querySelectorAll('.fade-in');
  if (!fadeElements.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

  fadeElements.forEach(el => observer.observe(el));
}
