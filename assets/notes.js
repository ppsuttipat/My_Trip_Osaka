const SUPABASE_URL  = "https://lhfazmfaxruckfedwzlz.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoZmF6bWZheHJ1Y2tmZWR3emx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzOTgyODAsImV4cCI6MjA3MTk3NDI4MH0.T8lotVqI_nkB-glx3aSaeVAyJMF7Vout2SSeQGLzR78";
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

const OWNER = "pond-local"; // โหมดเริ่มต้น (ภายหลังเปลี่ยนเป็น user.id ได้)

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

function renderFreeTextSection(text) {
  const container = document.createElement("div");
  container.className = "activity-card mb-4";

  container.innerHTML = `
    <h3 class="text-lg font-semibold mb-2">โน้ตแบบอิสระ</h3>
    <textarea id="free-text" rows="32" class="w-full border rounded-md px-3 py-2" placeholder="เขียนโน้ตเพิ่มเติม...">${escapeHtml(text)}</textarea>
  `;
  return container;
}

export async function initNotes() {
  const panel = document.getElementById("notes-panel");
  if (!panel) return;

  panel.innerHTML = `<p class="text-gray-500">กำลังโหลด...</p>`;

  const freeText = await fetchFreeText();

  panel.innerHTML = "";
  panel.appendChild(renderFreeTextSection(freeText));

  const ft = panel.querySelector("#free-text");
  if (ft) {
    let timer = null;
    ft.addEventListener("input", () => {
      clearTimeout(timer);
      timer = setTimeout(() => saveFreeText(ft.value), 500);
    });
  }
}
