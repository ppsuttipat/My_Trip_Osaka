// login.js — minimal Supabase email/password sign-in for a static site
const SUPABASE_URL = "https://lhfazmfaxruckfedwzlz.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoZmF6bWZheHJ1Y2tmZWR3emx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzOTgyODAsImV4cCI6MjA3MTk3NDI4MH0.T8lotVqI_nkB-glx3aSaeVAyJMF7Vout2SSeQGLzR78";

// Create a client (persist sessions in localStorage by default)
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

// If already signed in, go straight to the app
sb.auth.getSession().then(({ data }) => {
  if (data?.session) window.location.href = "./index.html";
});

const form = document.getElementById("login-form");
const emailEl = document.getElementById("email");
const passwordEl = document.getElementById("password");
const submitBtn = document.getElementById("submit-btn");
const errBox = document.getElementById("error-box");
const okBox = document.getElementById("ok-box");

function showError(msg) {
  errBox.textContent = msg;
  errBox.classList.remove("hidden");
  okBox.classList.add("hidden");
}

function showOk(msg) {
  okBox.textContent = msg;
  okBox.classList.remove("hidden");
  errBox.classList.add("hidden");
}

function translateError(code, message) {
  switch (code) {
    case "invalid_credentials":
      return "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
    case "email_not_confirmed":
      return "อีเมลยังไม่ได้ยืนยัน (เช็คกล่องจดหมาย)";
    case "over_email_send_rate_limit":
      return "ส่งอีเมลถี่เกินไป โปรดลองใหม่ภายหลัง";
    default:
      return message || "เกิดข้อผิดพลาด กรุณาลองใหม่";
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errBox.classList.add("hidden");
  submitBtn.disabled = true;
  submitBtn.textContent = "กำลังเข้าสู่ระบบ...";

  try {
    const email = emailEl.value.trim();
    const password = passwordEl.value;

    const { data, error } = await sb.auth.signInWithPassword({
      email, password
    });

    if (error) {
      showError(translateError(error?.code, error?.message));
      submitBtn.disabled = false;
      submitBtn.textContent = "เข้าสู่ระบบ";
      return;
    }

    showOk("สำเร็จ กำลังนำทาง...");
    // Small delay for UX
    setTimeout(() => window.location.href = "./index.html", 400);
  } catch (err) {
    showError("เกิดข้อผิดพลาดที่ไม่คาดคิด");
    submitBtn.disabled = false;
    submitBtn.textContent = "เข้าสู่ระบบ";
  }
});
