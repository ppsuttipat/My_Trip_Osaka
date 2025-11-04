// === notes.js (stub – no Supabase, no input, keep layout only) ===

export async function initNotes() {
  const panel = document.getElementById("notes-panel");
  if (!panel) return;

  // ตอนนี้ไม่ดึงจากที่ไหน ไม่เซฟที่ไหน แค่โชว์ข้อความ placeholder เฉย ๆ
  panel.innerHTML = `
    <div class="activity-card mb-4">
      <h3 class="text-lg font-semibold mb-2">โน้ต / ข้อความเพิ่มเติม</h3>
      <p class="text-sm text-gray-500 leading-relaxed">
        ส่วนโน้ตถูกปิดการใช้งานชั่วคราวในเวอร์ชันนี้<br>
        โครงหน้านี้ถูกเก็บไว้เผื่ออนาคต ถ้าอยากเชื่อมฐานข้อมูลหรือ Supabase
        สามารถนำกลับมาใส่ logic การโหลด/บันทึกโน้ตได้อีกครั้ง
      </p>
    </div>
  `;
}
