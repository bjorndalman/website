// ==========================================
// 1. DATA - ENGELSKA (DEFAULT) & SVENSKA
// ==========================================
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
            school: "Chalmers - University of Gothenburg",
            program: "Further Education 90 ECTS",
            years: " - 2025",
            description: [
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
            description: "Certified professional with 25 days of specialized technical training in Data Transmission Technology, focusing on the Synchronous Digital Hierarchy (SDH) standard and Marconi transmission systems."
        },
        {
            school: "K3 - Karlsborg",
            program: "Military Service - Rangers Training",
            years: "",
            description: `<img src="jagar_badge.jpg" alt="Ranger badge" class="inline-block h-[18px] mr-1 align-middle"> Completed advanced basic military training as a Ranger (Jägare) at K3.`
        }
    ],
    experience: [
        {
            title: "Employment & Studies",
            company: "Sweden - Västra Götaland",
            years: "2020 - 2025",
            description: "Focus on professional growth in healthcare and engineering, including High Voltage and Nuclear Safety studies."
        },
        {
            title: "Instructor",
            company: "The Swedish Home Guard",
            years: "10 years",
            description: "Experienced in training units for rapid response and maintaining standards of precision in the field."
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
        presentation: "Ingenjör med bakgrund inom elektroniska kommunikationssystem från Chalmers, erfarenhet inom telekom, fordon och teknisk provning. Utvecklar kontinuerligt min expertis genom studier inom högspänningsteknik och nukleär säkerhet."
    },
    skills: ["AutoCAD", "Python", "Matlab", "C/C++", "Visual Studio", "National Instruments", "RF-system", "Inbyggda system", "Fordonsteknik", "Telekommunikation"],
    education: [
        {
            school: "Chalmers Tekniska Högskola",
            program: "Ingenjör Elektroteknik 180 hp",
            years: "",
            description: "Kurser inom elektronik, telekommunikation, signalbehandling och inbyggda system."
        },
        {
            school: "Chalmers - Göteborgs Universitet",
            program: "Vidareutbildning 90 hp",
            years: " - 2025",
            description: ["Högspänningsteknik 7.5 hp", "Kärnkraftssäkerhet 7.5 hp", "Inbyggda system 30 hp"]
        }
    ],
    experience: [
        {
            title: "Anställning & Studier",
            company: "Sverige - Västra Götaland",
            years: "2020 - 2025",
            description: "Fokus på professionell utveckling och tekniska färdigheter inom både vård och teknik."
        }
    ],
    freetime: ["Sport", "Fritidsaktiviteter", "YouTube: 'Dalmanium'", "Programmering"]
};

let appData = defaultData;

// ==========================================
// 2. HJÄLPFUNKTIONER (HELPERS)
// ==========================================

function loadLanguageData() {
    const isSwedishPage = window.location.pathname.toLowerCase().includes('/sv/');
    appData = isSwedishPage ? swedishData : defaultData;
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function renderDescription(descriptionData) {
    if (Array.isArray(descriptionData)) {
        const listItems = descriptionData.map(item => `<li class="mb-1 ml-4 list-disc">${item}</li>`).join('');
        return `<ul class="list-outside">${listItems}</ul>`;
    }
    return descriptionData;
}

// ==========================================
// 3. TEMA-HANTERING (LIGHT/DARK)
// ==========================================

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
}

// ==========================================
// 4. MOBILMENY-LOGIK
// ==========================================

const mobileMenu = document.getElementById('mobile-menu');
const menuIcon = document.getElementById('menu-icon');
const closeIcon = document.getElementById('close-icon');

function toggleMobileMenu() {
    if (!mobileMenu) return;
    
    if (mobileMenu.classList.contains('h-0')) {
        mobileMenu.classList.remove('h-0');
        mobileMenu.classList.add('max-h-screen', 'border-b', 'border-slate-200', 'dark:border-slate-800');
        if (menuIcon) menuIcon.classList.add('hidden');
        if (closeIcon) closeIcon.classList.remove('hidden');
    } else {
        closeMobileMenu();
    }
}

function closeMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('max-h-screen', 'border-b', 'border-slate-200', 'dark:border-slate-800');
    mobileMenu.classList.add('h-0');
    if (menuIcon) menuIcon.classList.remove('hidden');
    if (closeIcon) closeIcon.classList.add('hidden');
}

// ==========================================
// 5. RENDERING (POPULATE CONTENT)
// ==========================================

function render() {
    // 5a. Bas-profil (Fungerar på alla sidor som har dessa ID:n)
    setText("name", appData.profile.name);
    setText("footer-name", appData.profile.name);
    setText("title", appData.profile.title);
    setText("presentation", appData.profile.presentation);
    setText("email", appData.profile.email);
    
    const emailLink = document.getElementById("email-link");
    if (emailLink) emailLink.href = `mailto:${appData.profile.email}`;

    // 5b. Skills (Startsidan)
    const skillsList = document.getElementById("skills-list");
    if (skillsList) {
        skillsList.innerHTML = appData.skills.map(skill => `
            <span class="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900 dark:hover:text-blue-300 transition cursor-default">
                ${skill}
            </span>
        `).join('');
    }

    // 5c. Experience (Startsidan)
    const expList = document.getElementById("experience-list");
    if (expList) {
        expList.innerHTML = appData.experience.map(exp => `
            <div class="relative pl-8 md:pl-0">
                <div class="hidden md:block absolute -left-[41px] top-1 w-5 h-5 bg-blue-600 rounded-full border-4 border-white dark:border-slate-950"></div>
                <h4 class="text-xl font-bold text-slate-900 dark:text-white">${exp.title}</h4>
                <div class="text-blue-600 dark:text-blue-400 font-medium mb-2 text-sm">${exp.company} • ${exp.years}</div>
                <p class="text-slate-600 dark:text-slate-400 leading-relaxed">${exp.description}</p>
            </div>
        `).join('');
    }

    // 5d. Education (Startsidan)
    const eduList = document.getElementById("education-list");
    if (eduList) {
        eduList.innerHTML = appData.education.map(edu => `
            <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <div class="flex flex-col md:flex-row md:justify-between md:items-start mb-2">
                    <h4 class="text-lg font-bold text-slate-900 dark:text-white">${edu.school}</h4>
                    <span class="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-500">${edu.years}</span>
                </div>
                <p class="text-blue-600 dark:text-blue-400 font-medium text-sm mb-3">${edu.program}</p>
                <div class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">${renderDescription(edu.description)}</div>
            </div>
        `).join('');
    }

    // 5e. Free time (Startsidan)
    const freeList = document.getElementById("freetime-list");
    if (freeList) {
        freeList.innerHTML = appData.freetime.map((item, index) => `
            <li class="flex items-center">
                ${item} ${index < appData.freetime.length - 1 ? '<span class="mx-2 opacity-50">•</span>' : ''}
            </li>
        `).join('');
    }

    // Rita ut Lucide-ikoner för nytt innehåll
    if (window.lucide) window.lucide.createIcons();
}

// ==========================================
// 6. INITIALISERING (NÄR SIDAN LADDATS)
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    loadLanguageData();
    initTheme();
    render();

    // Hantera klick på mobilmenyns öppna-knapp
    const menuBtn = document.getElementById('menu-button');
    if (menuBtn) {
        menuBtn.addEventListener('click', toggleMobileMenu);
    }

    // Hantera klick på tema-knappar (Desktop & Mobil)
    const themeBtn = document.getElementById('theme-toggle');
    const themeBtnMobile = document.getElementById('theme-toggle-mobile');
    
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
    if (themeBtnMobile) {
        themeBtnMobile.addEventListener('click', () => {
            toggleTheme();
            closeMobileMenu();
        });
    }

    // Stäng mobilmenyn automatiskt när man klickar på en länk
    const mobileLinks = document.querySelectorAll('#mobile-menu a:not(.lang-icon)');
    mobileLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
});
