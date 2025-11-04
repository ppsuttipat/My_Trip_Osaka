// login.js — ไม่ใช้ Supabase, เช็ค user/pass แบบคงที่

(function () {
  const ADMIN_USER = "admin";
  const ADMIN_PASS = "admin2025";

  const ls = localStorage;

  // ถ้าเคย login แล้วอยู่แล้ว → เด้งไปหน้า index.html เลย
  if (ls.getItem("trip_is_admin") === "1") {
    window.location.href = "./index.html";
    return;
  }

  const form = document.getElementById("login-form");
  if (!form) return;

  const userEl = document.getElementById("email");      // ช่อง username
  const passEl = document.getElementById("password");
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

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    errBox.classList.add("hidden");
    submitBtn.disabled = true;
    submitBtn.textContent = "กำลังเข้าสู่ระบบ...";

    const username = userEl.value.trim();
    const password = passEl.value;

    if (username === ADMIN_USER && password === ADMIN_PASS) {
      // ตั้ง session แบบง่าย ๆ ใน localStorage
      const now = Date.now();
      ls.setItem("trip_is_admin", "1");
      ls.setItem("trip_login_at", String(now));
      ls.setItem("trip_last_active", String(now));

      showOk("เข้าสู่ระบบสำเร็จ กำลังนำไปยังหน้าแผนเที่ยว...");

      setTimeout(() => {
        window.location.href = "./index.html";
      }, 400);
    } else {
      showError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      submitBtn.disabled = false;
      submitBtn.textContent = "เข้าสู่ระบบ";
    }
  });
})();
