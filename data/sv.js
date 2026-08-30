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
      description: '<img src="jagar_badge.jpg" alt="JÄGARE-märke" style="height: 18px; vertical-align: middle; margin-right: 5px;"> Genomförd avancerad militär grundutbildning som Jägare. Erfarenhet från Livregementets husarer (K3) i Karlsborg, där verksamheten präglas av högt ansvar, samarbete under press och arbete med avancerad teknik. Förbandet arbetar med underrättelseinhämtning, spaning och snabb insatsförmåga i komplexa miljöer, samt utbildning inom överlevnad och undsättning för internationella uppdrag.'
    }
  ],
  experience: [
    {
      title: "Anställning & Studier",
      company: "Västra Götalands län, Sverige",
      years: "2020 - 2026",
      description: "Jag har fokuserat på professionell utveckling och tekniska färdigheter inom både vård och teknik. Jag har genomfört högskolekurser inom bland annat högspänningsteknik, elektronikkonstruktion och säkerhet inom kärnkraft, vilket har stärkt min bakgrund inom elektroteknik. Denna erfarenhet förbereder mig för avancerade roller inom inbyggda system, energiteknik eller startup-miljöer."
    },
    {
      title: "Ingenjör & Mekaniker",
      company: "Skandinavien, Europa",
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

let botChartInstance = null;
let stockChartInstance = null;
let appData;
let isSwedishPage = false;
let pathPrefix = "";