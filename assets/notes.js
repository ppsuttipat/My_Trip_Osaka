const SUPABASE_URL  = "https://lhfazmfaxruckfedwzlz.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoZmF6bWZheHJ1Y2tmZWR3emx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzOTgyODAsImV4cCI6MjA3MTk3NDI4MH0.T8lotVqI_nkB-glx3aSaeVAyJMF7Vout2SSeQGLzR78";
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

async function getOwnerId() {
  const { data: { user } } = await sb.auth.getUser();
  return user?.id ?? null;  
}

function escapeHtml(str) {
  return (str || "").replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[m]));
}

async function getCurrentUser() {
  const { data: { user } } = await sb.auth.getUser();
  return user || null;
}

async function fetchFreeText() {
  const ownerId = await getOwnerId();
  if (!ownerId) return ""; // ยังไม่ล็อกอิน → แสดง read-only
  const { data } = await sb.from("note_pad")
    .select("content")
    .eq("owner", ownerId)
    .maybeSingle();
  return data?.content ?? "";
}

async function saveFreeText(text) {
  const ownerId = await getOwnerId();
  if (!ownerId) return; // บล็อกการเขียนถ้าไม่ล็อกอิน
  await sb.from("note_pad").upsert({ owner: ownerId, content: text });
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

  const user = await getCurrentUser();
  const ownerId = user?.id || null;

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