// =========================
//         GLOBAL CONFIG
// =========================
const defaultData = { 
  profile: {
    name: "Björn Dahlman",
    initials: "BD",
    title: "Electrical Engineer",
    email: "bjorn.k.dahlman@gmail.com",
    presentation: "Engineer with a background in electronic communication systems at Chalmers, experienced in telecom, automotive and technical testing. Skilled in troubleshooting, system analysis and documentation, with additional strengths in communication and adaptability from healthcare work. Continuously developing my expertise, currently pursuing studies in high-voltage engineering and nuclear safety. Structured, analytical and open to new opportunities."
  },
  skills: ["AutoCAD", "Python", "Matlab", "C/C++", "Visual Studio", "National Instruments", "RF Systems", "Embedded Systems", "Automotive Technology", "Telecommunication"],
  education: [
    {
      school: "Chalmers University of Technology",
      program: "BSc in Electrical Engineering - 180 ECTS",
      years: "",
      description: "Courses in electronics, telecommunications, signal theory, programming, control systems, microwave engineering, and embedded systems."
    },
    {
      school: "Chalmers- University of Gothenburg",
      program: "Further Education 97.5 ECTS",
      years: " - 2026",
      description: [
        "Electronic Design 7.5 ECTS Points",
        "High Voltage Engineering 7.5 ECTS Points",
        "Nuclear Power Safety 7.5 ECTS Points",
        "Business Planning for high Growth Startups 7.5 ECTS Points",
        "Radiation Physics 7.5 ECTS Points",
        "Electrical Measurements Techniques 7.5 ECTS Points",
        "C++/C Programming 22.5 ECTS Points",
        "Embedded Systems 30 ECTS Points"
      ]
    },
    {
      school: "STF Engineer Education AB",
      program: "Data Transmission & SDH Specialist",
      years: "",
      description: "Certified professional with 25 days of specialized technical training in Data Transmission Technology, focusing on the Synchronous Digital Hierarchy (SDH) standard and Marconi transmission systems. Proven expertise in the complete lifecycle of SDH networks, including network principles, operation, maintenance, and complex design. Proficient with specific Marconi platforms (41/51 C, STM-1 MSH 11, MSH63/64) and network management tools (Marconi MV36/38). Strong foundation in Optical Techniques and hands-on experience in measurements and troubleshooting high-capacity data networks. Ready to contribute deep technical knowledge to managing and optimizing critical telecommunications infrastructure.",
    },
    {
      school: "K3 - Karlsborg",
      program: "Military Service - Rangers Training",
      years: "",
      description: "<img src=\"images/jagar_badge.jpg\" alt=\"Ranger badge\" style=\"height: 18px; vertical-align: middle; margin-right: 5px;\"> Completed advanced basic military training as a Ranger (Jägare). Experience from the Life Regiment Hussars (K3) in Karlsborg, where operations are characterized by high levels of responsibility, teamwork under pressure, and the use of advanced technology. The unit focuses on intelligence gathering, reconnaissance, and rapid response capabilities in complex environments, as well as training in survival and personnel recovery for international missions."
    }
  ],
  experience: [
    {
      title: "Employment & Studies",
      company: "PLACE · Sweden-Vastra Gotalands lan",
      years: "2020 - 2026",
      description: "I focused on professional growth and technical skills in healthcare and engineering. I completed higher education courses in areas like High Voltage Engineering, Electronic Design, and Nuclear Power Safety, enhancing my background in Electrical Engineering. This experience prepares me for advanced roles in embedded systems, energy technology, or startups."
    },
    {
      title: "Electrical Engineer & Mechanic",
      company: "PLACE · Europe - Scandinavia",
      years: " - 2020",
      description: "I have a strong background in engineering, gaining hands-on problem solving skills across various sectors. My early experience includes roles as a mechanic and production worker, focusing on mechanical and automotive work. After completing military ranger training and civil service, I pursued higher education in engineering at Chalmers University of Technology, earning a Bachelor of Science in Electrical Engineering with a specialization in Electronic Communication Systems.",
    },
    {
      title: "Instructor",
      company: "The Swedish Home Guard",
      years: "10-years",
      description: "Instructor with a background in the Swedish Home Guard. Experienced in training units for rapid response and maintaining standards of coordination and precision in the field."
    }    
  ],
  freetime: ["Sports", "Outdoor activities", "YouTube: 'Dalmanium'", "Coding"]
};

const swedishData = { 
  profile: {
    name: "Björn Dahlman",
    initials: "BD",
    title: "Ingenjör Elektroteknik",
    email: "bjorn.k.dahlman@gmail.com",
    presentation: "Ingenjör med bakgrund inom elektroniska kommunikationssystem från Chalmers, erfarenhet inom telekom, fordon och teknisk provning. Skicklig i felsökning, systemanalys och dokumentation, med ytterligare styrkor inom kommunikation och anpassningsförmåga från arbete inom sjukvården. Utvecklar kontinuerligt min expertis genom studier inom högspänningsteknik och nukleär säkerhet. Strukturerad, analytisk och öppen för nya möjligheter."
  },
  skills: ["AutoCAD", "Python", "Matlab", "C/C++", "Visual Studio", "National Instruments", "RF-system", "Inbyggda system", "Fordonsteknik", "Telekommunikation"],
  education: [
    {
      school: "Chalmers Tekniska Högskola",
      program: "Ingenjör Elektroteknik 180 hp",
      years: "",
      description: "Kurser inom elektronik, telekommunikation, signalbehandling, programmering, styrsystem, mikrovågsteknik och inbyggda system."
    },
    {
      school: "Chalmers - Göteborgs Universitet",
      program: "Vidareutbildning 97.5 hp",
      years: " - 2026",
      description: [
        "Elektronikkonstruktion 7.5 hp",
        "Högspänningsteknik 7.5 hp",
        "Kärnkraftssäkerhet 7.5 hp",
        "Affärsplanering för snabbväxande Startups 7.5 hp",
        "Strålningsfysik 7.5 hp",
        "Elektrisk Mätteknik 7.5 hp",
        "C++/C Programmering 22.5 hp",
        "Inbyggda system 30 hp"
      ]
    },
    {
      school: "STF Ingenjörsutbildning AB",
      program: "Datatransmission & SDH Teknik",
      years: "",
      description: "Certifierad med 25 dagars teknisk utbildning i Datatransmission, med fokus på standarden Synchronous Digital Hierarchy (SDH) och Marconi transmissionssystem. Dokumenterad expertis inom hela livscykeln för SDH-nätverk, inklusive nätverksprinciper, drift, underhåll och komplex design. Kunskaper i specifika Marconi-plattformar (41/51 C, STM-1 MSH 11, MSH63/64) och nätverkshanteringsverktyg (Marconi MV36/38). Stark grund inom Optiska Tekniker och praktisk erfarenhet av mätningar och felsökning av datanätverk med hög kapacitet. Redo att bidra med djup teknisk kunskap för att hantera och optimera kritisk telekommunikationsinfrastruktur."
    },
    {
      school: "K3 - Karlsborg",
      program: "Militärtjänst - Jägarutbildning",
      years: "",
      description: "<img src=\"images/jagar_badge.jpg\" alt=\"JÄGARE-märke\" style=\"height: 18px; vertical-align: middle; margin-right: 5px;\"> Genomförd avancerad militär grundutbildning som Jägare. Erfarenhet från Livregementets husarer (K3) i Karlsborg, där verksamheten präglas av högt ansvar, samarbete under press och arbete med avancerad teknik. Förbandet arbetar med underrättelseinhämtning, spaning och snabb insatsförmåga i komplexer miljöer, samt utbildning inom överlevnad och undsättning för internationalella uppdrag."
    }
  ],
  experience: [
    {
      title: "Anställning & Studier",
      company: "PLATS · Sverige-Västra Götalands län",
      years: "2020 - 2026",
      description: "Jag har fokuserat på professionell utveckling och tekniska färdigheter inom både vård och teknik. Jag har genomfört högskolekurser inom bland annat högspänningsteknik, elektronik konstruktion och säkerhet inom kärnkraft, vilket har stärkt min bakgrund inom elektroteknik. Denna erfarenhet förbereder mig för avancerade roller inom inbyggda system, energiteknik eller startup-miljöer."
    },
    {
      title: "Ingenjör & Mekaniker",
      company: "PLATS · Europa - Skandinavien",
      years: " - 2020",
      description: "Jag har en stark bakgrund inom teknik och har utvecklat praktiska problemlösningsförmågor inom flera olika sektorer. Min tidiga erfarenhet inkluderar roller som mekaniker och produktionsarbetare, med fokus på mekaniskt och fordonsrelaterat arbete. Efter att ha genomfört militär jägarutbildning och civilplikt fortsatte jag med högre studier i teknik vid Chalmers tekniska högskola, där jag tog en kandidatexamen i elektroteknik med inriktning mot elektroniska kommunikationssystem."
    },
    {
      title: "Instruktör",
      company: "Hemvärnet",
      years: "10 år",
      description: "Instruktör med bakgrund i Hemvärnet. Erfarenhet av att utbilda förband för snabbinsatser samt att upprätthålla samordning och precision i fält."
    }
  ],
  freetime: ["Sport", "Fritidsaktiviteter", "YouTube: 'Dalmanium'", "Programmering"]
};

// Global diagraminstans
let botChartInstance = null;
let stockChartInstance = null; 
let appData; 

// =========================
//      SPRÅKHANTERING
// =========================
function loadLanguageData() {
  const isSwedishPage = window.location.pathname.toLowerCase().includes('/sv/');
  appData = isSwedishPage ? swedishData : defaultData;
}

// =========================
//     THEME HANDLING
// =========================
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

  if (botChartInstance) {
    const gridColor = isDark ? '#334155' : '#e2e8f0';
    const textColor = isDark ? '#94a3b8' : '#64748b';
    botChartInstance.options.scales.x.ticks.color = textColor;
    botChartInstance.options.scales.y.ticks.color = textColor;
    botChartInstance.options.scales.y.grid.color = gridColor;
    botChartInstance.update();
  }
}

function renderDescription(descriptionData) {
  if (Array.isArray(descriptionData)) {
    return `<ul class="list-outside">${descriptionData.map(item => `<li class="mb-1 ml-4 list-disc">${item}</li>`).join('')}</ul>`;
  }
  return descriptionData.replace(/\n/g, '<br>');
}

// =========================
//          RENDERING
// =========================
function render() {
  setText("name", appData.profile.name);
  setText("footer-name", appData.profile.name);
  setText("title", appData.profile.title);
  setText("presentation", appData.profile.presentation);
  setText("email", appData.profile.email);
  
  const emailLink = document.getElementById("email-link");
  if(emailLink) emailLink.href = `mailto:${appData.profile.email}`;

  const skillsContainer = document.getElementById("skills-list");
  if(skillsContainer) {
    skillsContainer.innerHTML = appData.skills.map(skill => `
      <span class="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900 dark:hover:text-blue-300 transition cursor-default">
        ${skill}
      </span>
    `).join('');
  }

  const expContainer = document.getElementById("experience-list");
  if(expContainer) {
    expContainer.innerHTML = appData.experience.map(exp => `
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

  const eduContainer = document.getElementById("education-list");
  if(eduContainer) {
    eduContainer.innerHTML = appData.education.map(edu => `
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

  const freeContainer = document.getElementById("freetime-list");
  if(freeContainer) {
    freeContainer.innerHTML = appData.freetime.map((item, index) => `
      <li class="flex items-center">
        ${item} ${index < appData.freetime.length - 1 ? '<span class="mx-2 opacity-50">•</span>' : ''}
      </li>
    `).join('');
  }

  if (window.lucide) window.lucide.createIcons();
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

// =========================
//      MOBILE MENU LOGIC
// =========================
const mobileMenu = document.getElementById('mobile-menu');
const menuButton = document.getElementById('menu-button');
const menuIcon = document.getElementById('menu-icon');
const closeIcon = document.getElementById('close-icon');

function toggleMobileMenu() {
    if (!mobileMenu) return;
    if (mobileMenu.classList.contains('h-0')) {
        mobileMenu.classList.remove('h-0'); 
        mobileMenu.classList.add('h-auto', 'border-b', 'border-slate-200', 'dark:border-slate-800');
        menuIcon.classList.add('hidden');
        closeIcon.classList.remove('hidden');
    } else {
        closeMobileMenu();
    }
    if (window.lucide) window.lucide.createIcons();
}

function closeMobileMenu() {
    if(!mobileMenu) return;
    mobileMenu.classList.remove('h-auto', 'border-b', 'border-slate-200', 'dark:border-slate-800');
    mobileMenu.classList.add('h-0');
    menuIcon.classList.remove('hidden');
    closeIcon.classList.add('hidden');
}

// ==========================================
// SCROLL ANIMATION
// ==========================================
function initScrollAnimations() {
  const fadeElements = document.querySelectorAll('.fade-in');
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
  fadeElements.forEach(el => observer.observe(el));
}

// =========================
//           INIT
// =========================
document.addEventListener("DOMContentLoaded", () => {
  loadLanguageData();
  initTheme();
  if (document.getElementById('name')) render();
  
  const themeToggleBtn = document.getElementById('theme-toggle');
  if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);
  const themeToggleMobileBtn = document.getElementById('theme-toggle-mobile');
  if (themeToggleMobileBtn) themeToggleMobileBtn.addEventListener('click', toggleTheme);
  
  if (menuButton) menuButton.addEventListener('click', toggleMobileMenu);
  if (mobileMenu) {
      mobileMenu.querySelectorAll('a').forEach(link => {
          if (!link.classList.contains('lang-icon')) link.addEventListener('click', closeMobileMenu);
      });
  }

  initScrollAnimations();
  
  // Startar laddning av båda botarna samtidigt
  fetchBotStats();
  renderBotChart();
  fetchStockStats();
  renderStockChart();
});

// ==========================================
// AUTOMATION: DATA FETCHING (KALMAN BOT)
// ==========================================
function fetchBotStats() {
  fetch('data/stats.json')
    .then(response => response.json())
    .then(data => {
      const videoIframe = document.getElementById('youtube-bot-video');
      const profitEl = document.getElementById('bot-profit');
      const bankrollEl = document.getElementById('bot-bankroll');
      if (videoIframe && data.latest_video_id) videoIframe.src = `https://www.youtube.com/embed/${data.latest_video_id}`;
      if (profitEl) {
        profitEl.textContent = data.profit;
        profitEl.className = data.is_positive ? "text-xl font-bold text-emerald-600 dark:text-emerald-400" : "text-xl font-bold text-rose-600 dark:text-rose-400";
      }
      if (bankrollEl) bankrollEl.textContent = data.bankroll;
    })
    .catch(err => console.log("Stats ej tillgängliga.", err));
}

function renderBotChart() {
  const chartCanvas = document.getElementById('bot-profit-chart');
  if (!chartCanvas) return;

  fetch('data/portfolio_summary.csv?t=' + new Date().getTime())
    .then(response => response.text())
    .then(csvText => {
      const lines = csvText.trim().split('\n');
      const labels = [];
      const dataPoints = [];

      for (let i = 1; i < lines.length; i++) {
        const columns = lines[i].split(',');
        if (columns.length >= 4) {
          const date = columns[0].trim();
          const kassa = parseFloat(columns[3].trim());

          if (!isNaN(kassa)) {
            labels.push(date);
            dataPoints.push(kassa);
          }
        }
      }

      if (botChartInstance) botChartInstance.destroy();

      botChartInstance = new Chart(chartCanvas, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Current Bankroll',
            data: dataPoints,
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            borderWidth: 2,
            tension: 0.3,
            pointRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { 
              beginAtZero: false 
            }
          }
        }
      });
    })
    .catch(err => console.error("Could not render the chart:", err));
}

// ==========================================
// AUTOMATION: NEW STOCK BOT DATA FETCHING
// ==========================================
function fetchStockStats() {
  fetch('data/stock_stats.json')
    .then(response => response.json())
    .then(data => {
      const videoIframe = document.getElementById('youtube-stock-video');
      const profitEl = document.getElementById('stock-profit');
      const bankrollEl = document.getElementById('stock-bankroll');
      const investedEl = document.getElementById('stock-invested'); // Nytt element!
      
      if (videoIframe && data.latest_video_id) {
        videoIframe.src = `https://www.youtube.com/embed/${data.latest_video_id}`;
      }
      
      if (profitEl) {
        profitEl.textContent = data.profit;
        profitEl.className = data.is_positive 
          ? "text-xl font-bold text-emerald-600 dark:text-emerald-400" 
          : "text-xl font-bold text-rose-600 dark:text-rose-400";
      }
      
      if (bankrollEl) bankrollEl.textContent = data.bankroll;
      
      // Visa startkapitalet för transparens
      if (investedEl) {
        investedEl.textContent = `Startkapital: ${data.total_invested}`;
      }
    })
    .catch(err => console.log("Aktie-stats ej tillgängliga än.", err));
}
function renderStockChart() {
  const chartCanvas = document.getElementById('stock-profit-chart');
  if (!chartCanvas) return;

  fetch('data/stock_portfolio_summary.csv?t=' + new Date().getTime())
    .then(response => response.text())
    .then(csvText => {
      const lines = csvText.trim().split('\n');
      const labels = [];
      const dataPoints = [];

      for (let i = 1; i < lines.length; i++) {
        const columns = lines[i].split(',');
        if (columns.length >= 4) {
          const date = columns[0].trim();
          const kassa = parseFloat(columns[3].trim());

          if (!isNaN(kassa)) {
            labels.push(date);
            dataPoints.push(kassa);
          }
        }
      }

      if (stockChartInstance) stockChartInstance.destroy();

      stockChartInstance = new Chart(chartCanvas, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Stock Bankroll',
            data: dataPoints,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2,
            tension: 0.3,
            pointRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { 
              beginAtZero: false 
            }
          }
        }
      });
    })
    .catch(err => console.error("Could not render the stock chart:", err));
}
