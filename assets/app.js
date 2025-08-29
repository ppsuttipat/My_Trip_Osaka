import { initNotes } from "./notes.js";

import { translations } from "./translations.js";

import { dailyCosts } from "./dailyCosts.js";

import { tripDataTh } from "./tripDataTh.js";

import { tripDataEn } from "./tripDataEn.js";

import { tripDataJp } from "./tripDataJp.js";

const tripDataStore = { th: tripDataTh, en: tripDataEn, jp: tripDataJp };

// =================================================================
// JAVASCRIPT LOGIC (Updated for Segmented Control)
// =================================================================
document.addEventListener("DOMContentLoaded", function () {
    let currentLang = "th";

    const langSwitcher = document.querySelector(
        "#language-switcher .relative"
    );
    const langHighlight = document.getElementById("lang-highlight");
    const langButtons = document.querySelectorAll(".lang-btn");

    function moveHighlight(targetButton) {
        if (!targetButton) return;
        const newLeft = targetButton.offsetLeft;
        const newWidth = targetButton.offsetWidth;
        langHighlight.style.left = `${newLeft}px`;
        langHighlight.style.width = `${newWidth}px`;
        langButtons.forEach((btn) => {
            btn.style.color = btn === targetButton ? "#a0522d" : "#4a4a4a";
        });
    }

    langButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const newLang = button.getAttribute("data-lang");
            if (newLang !== currentLang) {
                currentLang = newLang;
                renderContent(currentLang);
                moveHighlight(button);
            }
        });
    });

    function createActivityCard(activity) {
        if (activity.type === "info") {
            return `<div class="info-card mt-6"><h3 class="text-xl font-semibold mb-3">${activity.title
                }</h3><div class="text-sm space-y-2">${activity.details
                    .map((p) => `<p>${p}</p>`)
                    .join("")}</div></div>`;
        }
        const imageHtml = activity.image
            ? `<img src="${activity.image
            }" onerror="this.onerror=null; this.src='https://placehold.co/400x250/FDFBF6/8B4513?text=${encodeURIComponent(
                activity.alt
            )}';" alt="${activity.alt || "Activity image"
            }" class="w-full sm:w-72 md:w-96 rounded-lg shadow-sm flex-shrink-0 object-cover aspect-video"/>`
            : "";
        return `<div class="info-card activity-card"><div class="flex flex-col sm:flex-row justify-between items-start gap-4 md:gap-6">
                      <div class="flex-grow">
                          <p class="m-0 font-semibold">${activity.time
                ? `<strong>${activity.time}:</strong>`
                : ""
            } ${activity.title}</p>
                          <div class="mt-2 text-sm space-y-1 text-gray-600">${activity.details
                ? activity.details
                    .map((p) => `<p>${p}</p>`)
                    .join("")
                : ""
            }</div>
                          ${activity.mapLink
                ? `<div class="mt-4"><a href="${activity.mapLink}" target="_blank" class="text-[#A0522D] hover:underline text-sm font-semibold">${translations[currentLang].map_link}</a></div>`
                : ""
            }
                      </div> ${imageHtml} </div></div>`;
    }

    function generateOverviewPanel(lang) {
        const t = translations[lang];
        const tripData = tripDataStore[lang];

        // --- ส่วนที่เพิ่มเข้ามา: คำนวณยอดรวมทั้งหมด ---
        let totalTripCost = 0;
        for (const dayKey in dailyCosts) {
            totalTripCost += dailyCosts[dayKey].jpy_total;
        }
        const totalJpyFormatted = totalTripCost.toLocaleString();
        const totalThbFormatted = (totalTripCost * 0.22).toLocaleString(
            undefined,
            { maximumFractionDigits: 0 }
        );
        // --- สิ้นสุดส่วนที่เพิ่ม ---

        const flightData = {
            departureFlight: "TG622 (BKK → KIX)",
            departureTime:
                lang === "th"
                    ? "8 ต.ค. 23:59 น. → 9 ต.ค. 07:30 น."
                    : "Oct 8, 23:59 → Oct 9, 07:30",
            returnFlight: "TG673 (KIX → BKK)",
            returnTime:
                lang === "th"
                    ? "16 ต.ค. 17:35 น. → 21:25 น."
                    : "Oct 16, 17:35 → 21:25",
        };
        const accommodationName = "Landmark Namba Ebisucho";
        const accommodationAddress =
            "2-chōme-11-17 Ebisunishi, Naniwa Ward, Osaka, 556-0003";

        const summaryRows = tripData.summary
            .map(
                (row) =>
                    `<tr><td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" data-label="${t.table_date}">${row.date}</td><td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500" data-label="${t.table_city}">${row.city}</td><td class="px-6 py-4 text-sm text-gray-500" data-label="${t.table_highlights}">${row.highlights}</td><td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500" data-label="${t.table_weather}">${row.weather}</td></tr>`
            )
            .join("");

        // --- ส่วนที่แก้ไข: เพิ่มการ์ดสรุปค่าใช้จ่ายเข้าไป ---
        return `
        <div class="mb-8 text-center py-4">
            <img src="https://img5.pic.in.th/file/secure-sv1/Gemini_Generated_Image_ui1ek1ui1ek1ui1e.png" onerror="this.onerror=null; this.src='https://placehold.co/600x400/FDFBF6/8B4513?text=Osaka+Kyoto+Nara+Kobe';" alt="ภาพรวมเมืองโอซาก้า เกียวโต นารา โกเบ" class="mx-auto w-full max-w-3xl rounded-lg shadow-lg">
        </div>
        <div class="mb-8">
            <h2 class="text-2xl font-bold mb-4 text-center text-[#A0522D]">${t.overview_title
            }</h2>
            <div class="grid md:grid-cols-2 gap-6">
                <div class="info-card">
                    <h3 class="text-xl font-semibold mb-2">${t.flight_info}</h3>
                    <p><strong>${lang === "th" ? "ขาไป:" : "Departure:"
            }</strong> ${flightData.departureFlight}</p>
                    <p class="ml-4">${flightData.departureTime}</p>
                    <p><strong>${lang === "th" ? "ขากลับ:" : "Return:"
            }</strong> ${flightData.returnFlight}</p>
                    <p class="ml-4">${flightData.returnTime}</p>
                </div>
                <div class="info-card">
                    <h3 class="text-xl font-semibold mb-2">${t.accommodation
            }</h3>
                    <p><a href="https://maps.app.goo.gl/3NP1QEPvkyPkjfkNA" target="_blank" class="text-[#8B4513] hover:underline"><strong>${accommodationName}</strong></a></p>
                    <p class="text-sm text-gray-600">${accommodationAddress}</p>
                </div>
                <div class="info-card md:col-span-2" style="border-left-color: #4CAF50;">
                    <h3 class="text-xl font-semibold mb-2">${lang === "th"
                ? "💰 สรุปค่าใช้จ่ายตลอดทริป"
                : "💰 Total Trip Expenses"
            }</h3>
                    <div class="flex items-baseline space-x-4">
                        <p class="text-3xl font-bold text-gray-800">¥${totalJpyFormatted}</p>
                        <p class="text-lg text-gray-600">(~ ฿${totalThbFormatted})</p>
                    </div>
                    <p class="text-sm text-gray-500 mt-2">${lang === "th"
                ? "สำหรับ 1 ท่าน (ไม่รวมตั๋วเครื่องบินและที่พัก)"
                : "Per person (excluding flights & accommodation)"
            }</p>
                </div>
            </div>
        </div>
        <div class="mb-8">
            <h2 class="text-2xl font-bold mb-4 text-center text-[#A0522D]">${t.summary_title
            }</h2>
            <div class="info-card overflow-x-auto responsive-table">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${t.table_date
            }</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${t.table_city
            }</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${t.table_highlights
            }</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${t.table_weather
            }</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">${summaryRows}</tbody>
                </table>
            </div>
        </div>
    `;
    }
    function generateDayPanel(dayId, lang) {
        const tripData = tripDataStore[lang][dayId];
        if (!tripData || !tripData.activities)
            return `<h2 class="text-2xl font-bold text-center text-gray-500 mt-12">${translations[lang].coming_soon}</h2>`;

        const activitiesHtml = tripData.activities
            .map((activity) => createActivityCard(activity))
            .join("");

        const costData = dailyCosts[dayId];
        let costSectionHtml = "";
        if (costData) {
            const t = translations[lang];
            const totalJpy = costData.jpy_total.toLocaleString();
            const categoryIcons = { travel: "🚌", admission: "🎟️", food: "🍜" };

            const breakdownList = costData.breakdown
                .map((item) => {
                    if (item.cost === 0 && costData.breakdown.length > 1) return "";
                    const icon = categoryIcons[item.category] || "💰";
                    return `
            <li class="flex justify-between border-b border-dashed border-gray-200 py-1">
                <span>${icon} ${item[lang]}</span>
                <strong class="font-mono">¥${item.cost.toLocaleString()}</strong>
            </li>`;
                })
                .join("");

            costSectionHtml = `
            <div class="info-card mt-8">
                <h3 class="text-xl font-semibold mb-4 text-[#A0522D]">${t.expense_title}</h3>
                <ul class="text-sm space-y-2 text-gray-700">${breakdownList}</ul>
                <div class="flex justify-between items-center mt-4 pt-3 border-t border-gray-300">
                    <span class="text-lg font-bold text-gray-800">${t.total_label}</span>
                    <strong class="text-2xl font-bold text-[#8B4513]">¥${totalJpy}</strong>
                </div>
                <p class="text-xs text-gray-500 mt-2 text-right">${t.exclude_note}</p>
            </div>`;
        }

        return `
        <h2 class="text-2xl font-bold mb-6 text-center text-[#A0522D]">${tripData.title}</h2>
        <div class="space-y-4">${activitiesHtml}</div>
        ${costSectionHtml}`;
    }

    function renderContent(lang) {
        const t = translations[lang];
        document.documentElement.lang = lang;
        document.getElementById("main-title").textContent = t.main_title;
        document.getElementById("trip-subtitle").textContent =
            t.main_subtitle;
        document.querySelector('[data-day="overview"]').textContent =
            t.nav_overview;
        for (let i = 8; i <= 16; i++) {
            const dayKey = `day-${i}`;
            const button = document.querySelector(`[data-day="${dayKey}"]`);
            if (button)
                button.textContent = `${t.nav_day} ${lang === "jp" ? i : i}`;
            const panelElement = document.getElementById(`${dayKey}-panel`);
            if (panelElement)
                panelElement.innerHTML = generateDayPanel(dayKey, lang);
        }
        document.getElementById("overview-panel").innerHTML =
            generateOverviewPanel(lang);
        document.querySelector('[data-day="notes"]').textContent = t.nav_notes;
    }

    function switchDay(day) {
        document
            .querySelectorAll(".day-panel")
            .forEach((p) => p.classList.remove("active"));
        document.getElementById(`${day}-panel`)?.classList.add("active");
        document
            .querySelectorAll(".nav-button")
            .forEach((b) => b.classList.remove("active"));
        document
            .querySelector(`.nav-button[data-day="${day}"]`)
            ?.classList.add("active");
        if (day === "notes") {
            window.renderNotesPanel && window.renderNotesPanel();
        }
    }

    const nav = document.getElementById("day-nav");
    nav.addEventListener("click", (e) => {
        if (e.target.tagName === "BUTTON") {
            switchDay(e.target.dataset.day);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    });

    const scrollTopBtn = document.getElementById("scrollTopBtn");
    window.addEventListener("scroll", () => {
        scrollTopBtn.classList.toggle("hidden", window.scrollY <= 300);
    });
    scrollTopBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    function initializeUI() {
        renderContent(currentLang);
        switchDay("overview");
        setTimeout(() => {
            const initialButton = document.querySelector(
                `.lang-btn[data-lang="${currentLang}"]`
            );
            moveHighlight(initialButton);
        }, 100);
    }
    initializeUI();
});


document.addEventListener("DOMContentLoaded", () => {
  let notesBooted = false;
  document.querySelectorAll("#day-nav .nav-button").forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-day");
      if (key === "notes" && !notesBooted) {
        notesBooted = true;
        initNotes(); // โหลด Notes UI
      }
    });
  });
});
