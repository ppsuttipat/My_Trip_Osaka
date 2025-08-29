// === notes.js (patched) ===
const SUPABASE_URL  = "https://lhfazmfaxruckfedwzlz.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoZmF6bWZheHJ1Y2tmZWR3emx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzOTgyODAsImV4cCI6MjA3MTk3NDI4MH0.T8lotVqI_nkB-glx3aSaeVAyJMF7Vout2SSeQGLzR78";

// ใช้ client กลางถ้ามี ไม่งั้นค่อยสร้าง (เลี่ยง multiple instances)
const sb = window.sb || window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
window.sb = sb;

// ----- utils -----
function escapeHtml(str) {
  return (str || "").replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[m]));
}
const isUUID = (s) =>
  typeof s === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

async function getOwnerId() {
  const { data: { user } } = await sb.auth.getUser();
  return user?.id || null; // ถ้าไม่ล็อกอินจะได้ null
}

async function fetchFreeText(ownerId) {
  if (!ownerId) return ""; // ยังไม่ล็อกอิน → ถือว่าไม่มีโน้ต
  const { data, error } = await sb
    .from("note_pad")
    .select("content")
    .eq("owner", ownerId)
    .maybeSingle();
  if (error) {
    console.error("fetchFreeText error:", error);
    return "";
  }
  let text = data?.content || "";
  // กันกรณี content เคยถูกบันทึกเป็น UUID (owner id) ผิดพลาด
  if (isUUID(text) && text === ownerId) text = "";
  return text;
}

async function saveFreeText(ownerId, text) {
  if (!ownerId) return; // ห้ามเขียนถ้ายังไม่ล็อกอิน
  const payload = { owner: ownerId, content: String(text || "") };
  const { error } = await sb.from("note_pad").upsert(payload);
  if (error) console.error("saveFreeText error:", error);
}

function renderFreeTextSection(text, canEdit) {
  const container = document.createElement("div");
  container.className = "activity-card mb-4";

  const disabledAttr = canEdit ? "" : "disabled";
  const extraClass = canEdit ? "" : "opacity-60 cursor-not-allowed bg-gray-50";

  container.innerHTML = `
    <div class="flex items-center justify-between mb-2">
      <h3 class="text-lg font-semibold">โน้ตแบบอิสระ</h3>
      ${canEdit ? "" : `<span class="text-xs text-gray-500">เข้าสู่ระบบเพื่อแก้ไข</span>`}
    </div>
    <textarea id="free-text" rows="32"
      class="w-full border rounded-md px-3 py-2 ${extraClass}"
      placeholder="${canEdit ? "เขียนโน้ตเพิ่มเติม..." : "ต้องล็อกอินเพื่อแก้ไข"}"
      ${disabledAttr}>${escapeHtml(text)}</textarea>
  `;
  return container;
}

export async function initNotes() {
  const panel = document.getElementById("notes-panel");
  if (!panel) return;

  panel.innerHTML = `<p class="text-gray-500">กำลังโหลด...</p>`;

  const ownerId = await getOwnerId();
  const freeText = await fetchFreeText(ownerId);

  panel.innerHTML = "";
  const canEdit = !!ownerId;
  panel.appendChild(renderFreeTextSection(freeText, canEdit));

  const ft = panel.querySelector("#free-text");
  if (ft && canEdit) {
    let timer = null;
    ft.addEventListener("input", () => {
      clearTimeout(timer);
      timer = setTimeout(() => saveFreeText(ownerId, ft.value), 500);
    });
  }
}
