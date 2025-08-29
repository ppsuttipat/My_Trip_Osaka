// === notes.js — EXPERIMENT: Google Doc embed + fallback textarea ===
// โทนและการจัดวางให้เข้ากับเว็บของปอนด์ (tailwind พร้อมใช้งานจาก index.html)

const USE_GOOGLE_DOC = true; // <-- ถ้าอยากกลับไป textarea ให้เปลี่ยนเป็น false

// ใส่ Doc ID ของปอนด์ (อันนี้คือที่ให้มาทดลอง)
const GDOC_ID = "1slJAO-a7vNyoM_jgcUa3B_NPIWiC6fly92qqKJKQTqc";
const GDOC_EDIT_URL    = `https://docs.google.com/document/d/${GDOC_ID}/edit?usp=sharing`;
const GDOC_PREVIEW_URL = `https://docs.google.com/document/d/${GDOC_ID}/preview`;
// deep link (มือถือที่ติดตั้งแอป Google Docs)
const GDOC_APP_URL     = `googledocs://docs.google.com/document/d/${GDOC_ID}/edit`;

/* ====== (ของเดิม) Supabase + textarea fallback ======
   เก็บไว้เพื่อสลับใช้งานทันทีเมื่อ USE_GOOGLE_DOC = false
   --------------------------------------------------- */
// จากไฟล์เดิมของปอนด์ (owner แบบคงที่ pond-local)
const SUPABASE_URL  = "https://lhfazmfaxruckfedwzlz.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoZmF6bWZheHJ1Y2tmZWR3emx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzOTgyODAsImV4cCI6MjA3MTk3NDI4MH0.T8lotVqI_nkB-glx3aSaeVAyJMF7Vout2SSeQGLzR78";
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
const OWNER = "pond-local";

function escapeHtml(str) {
  return (str || "").replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[m]));
}

async function fetchFreeText() {
  const { data, error } = await sb
    .from("note_pad")
    .select("content")
    .eq("owner", OWNER)
    .maybeSingle();
  if (error) {
    console.error("fetchFreeText error:", error);
    return "";
  }
  return data?.content || "";
}

async function saveFreeText(text) {
  const { error } = await sb.from("note_pad").upsert({
    owner: OWNER,
    content: text
  });
  if (error) console.error("saveFreeText error:", error);
}

function renderTextareaSection(text) {
  const container = document.createElement("div");
  container.className = "activity-card mb-4";
  container.innerHTML = `
    <div class="flex items-center justify-between mb-2">
      <h3 class="text-lg font-semibold">โน้ตแบบอิสระ (Textarea)</h3>
      <span class="text-xs text-gray-500">โหมดเดิม</span>
    </div>
    <textarea id="free-text" rows="32" class="w-full border rounded-md px-3 py-2"
      placeholder="เขียนโน้ตเพิ่มเติม...">${escapeHtml(text)}</textarea>
  `;
  return container;
}

/* ====== (ใหม่) Google Doc embed section ====== */
function renderGoogleDocSection() {
  const container = document.createElement("div");
  container.className = "activity-card mb-4";

  container.innerHTML = `
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-lg font-semibold">โน้ต (ทดลองใช้ Google Docs)</h3>
      <span class="text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">ทดลอง</span>
    </div>

    <div class="rounded-2xl overflow-hidden border border-amber-200 bg-white shadow-sm">
      <div class="bg-gradient-to-r from-amber-50 to-white px-3 py-2 text-[12px] text-gray-600">
        ฝังแบบอ่านอย่างเดียว (พรีวิว); กด “เปิดแก้ไขในแท็บใหม่” เพื่อแก้ไขเอกสาร — สิทธิ์แก้ไขอิงการแชร์ของ Google Docs
      </div>

      <div class="relative">
        <iframe
          src="${GDOC_PREVIEW_URL}"
          class="w-full h-[70vh] md:h-[80vh] block"
          allow="clipboard-read; clipboard-write"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        ></iframe>
        <div id="gdoc-fallback" class="hidden absolute inset-0 flex items-center justify-center bg-white/85">
          <div class="text-center text-sm text-gray-600 leading-relaxed px-4">
            ไม่สามารถฝังเอกสารได้ในเบราว์เซอร์นี้<br/>
            โปรดกดปุ่มด้านล่างเพื่อเปิดแก้ไขในแท็บใหม่
          </div>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-2 p-3 border-t bg-white">
        <a href="${GDOC_EDIT_URL}" target="_blank" rel="noopener"
           class="inline-flex justify-center items-center px-4 py-2 rounded-lg border border-amber-300 text-[#8B4513] hover:bg-amber-50">
          เปิดแก้ไขในแท็บใหม่
        </a>
        <a href="${GDOC_APP_URL}"
           class="inline-flex justify-center items-center px-4 py-2 rounded-lg border border-amber-300 text-[#8B4513] hover:bg-amber-50">
          เปิดในแอป Google Docs
        </a>
      </div>
    </div>
  `;

  // fallback เบื้องต้น ถ้า iframe แสดงผลไม่ได้
  setTimeout(() => {
    const iframe = container.querySelector("iframe");
    if (!iframe) return;
    // heuristic ง่าย ๆ: ถ้า iframe สูง 0 หรือถูกซ่อนไว้ ให้โชว์ fallback
    if (iframe.clientHeight === 0) {
      const fb = container.querySelector("#gdoc-fallback");
      fb && fb.classList.remove("hidden");
    }
  }, 1200);

  return container;
}

/* ====== Entry point ที่ app.js เรียกใช้ ====== */
export async function initNotes() {
  const panel = document.getElementById("notes-panel");
  if (!panel) return;

  panel.innerHTML = `<p class="text-gray-500">กำลังโหลด...</p>`;

  panel.innerHTML = "";
  if (USE_GOOGLE_DOC) {
    panel.appendChild(renderGoogleDocSection());
    return;
  }

  // fallback: textarea แบบเดิม
  const text = await fetchFreeText();
  panel.appendChild(renderTextareaSection(text));

  const ft = panel.querySelector("#free-text");
  if (ft) {
    let timer = null;
    ft.addEventListener("input", () => {
      clearTimeout(timer);
      timer = setTimeout(() => saveFreeText(ft.value), 500);
    });
  }
}
