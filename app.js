// ============================================================
// SafeHer SOS App — app.js
// ============================================================

// ---------- CONTACTS DATA (customize here) ----------
const CONTACTS = [
  { name: "Mom",          relation: "Family",       phone: "+91 98765 43210", avatar: "👩", priority: 1 },
  { name: "Priya",        relation: "Best Friend",  phone: "+91 87654 32109", avatar: "👧", priority: 2 },
  { name: "Brother Raj",  relation: "Family",       phone: "+91 76543 21098", avatar: "👨", priority: 3 },
  { name: "Police",       relation: "Emergency",    phone: "112",             avatar: "👮", priority: 0, auto: true },
  { name: "Women Helpline", relation: "National",   phone: "181",             avatar: "🏥", priority: 0, auto: true },
];

// ---------- HELPLINES DATA ----------
const HELPLINES = [
  { name: "Police Emergency",       desc: "Immediate police response",         number: "112",        icon: "🚔", bg: "#FEE" },
  { name: "Women Helpline",         desc: "24/7 support for women",            number: "181",        icon: "🛡", bg: "#EFF" },
  { name: "Domestic Violence",      desc: "Protection & counseling",           number: "1091",       icon: "🏠", bg: "#FFF3E0" },
  { name: "Child Helpline",         desc: "If children are also at risk",      number: "1098",       icon: "👶", bg: "#E8F5E9" },
  { name: "Mental Health — iCall",  desc: "Free counseling support",           number: "9152987821", icon: "🧠", bg: "#E3F2FD" },
  { name: "Find Safe Shelter",      desc: "Locate nearest women's shelter",    number: "Locate →",   icon: "🏘", bg: "#FCE4EC" },
];

// ---------- STATE ----------
let countdownTimer = null;
let elapsedTimer   = null;
let elapsedSeconds = 0;
let sosHoldTimer   = null;
let isRecording    = false;

// ---------- DOM READY ----------
document.addEventListener("DOMContentLoaded", () => {
  updateClock();
  setInterval(updateClock, 1000);
  renderContacts();
  renderHelplines();
  bindNavigation();
  bindSosButton();
  bindQuickActions();
  bindAlertButtons();
  bindFakeCall();
  initShakeDetection();
  initKeyboardShortcuts();
  fetchAndDisplayLocation();
});

// ---------- CLOCK ----------
function updateClock() {
  const now = new Date();
  const h = now.getHours().toString().padStart(2, "0");
  const m = now.getMinutes().toString().padStart(2, "0");
  const el = document.getElementById("clock");
  if (el) el.textContent = `${h}:${m}`;
}

// ---------- RENDER CONTACTS ----------
function renderContacts() {
  const list = document.getElementById("contactsList");
  const alertList = document.getElementById("alertContactsList");
  const notifList = document.getElementById("notifiedContactsList");
  if (!list) return;

  const priorityColors = ["#2C3E50", "#C0392B", "#E67E22", "#27AE60"];
  const priorityLabels = ["AUTO", "#1", "#2", "#3"];

  list.innerHTML = CONTACTS.map(c => `
    <div class="contact-card">
      <div class="c-avatar">${c.avatar}</div>
      <div class="c-info">
        <div class="c-name">${c.name}</div>
        <div class="c-role">${c.relation}</div>
        <div class="c-phone">${c.phone}</div>
      </div>
      <div class="c-priority" style="background:${priorityColors[c.priority] || '#2C3E50'}">
        ${priorityLabels[c.priority] || "AUTO"}
      </div>
    </div>
  `).join("") + `
    <button class="add-contact-btn" onclick="showToast('➕ Add contact — coming soon')">
      ➕ Add Trusted Contact
    </button>
  `;

  if (alertList) {
    alertList.innerHTML = CONTACTS.filter(c => !c.auto).slice(0, 3).map(c => `
      <div class="contact-chip">
        <div class="contact-avatar">${c.avatar}</div>
        <div class="contact-info">
          <div class="contact-name">${c.name}</div>
          <div class="contact-role">${c.phone}</div>
        </div>
        <div class="contact-status">📤</div>
      </div>
    `).join("");
  }

  if (notifList) {
    notifList.innerHTML = CONTACTS.slice(0, 3).map(c => `
      <div class="notified-item">
        <div class="notif-avatar">${c.avatar}</div>
        <div class="notif-info">
          <div class="notif-name">${c.name}</div>
          <div class="notif-status">✓ Alert received · Responding</div>
        </div>
      </div>
    `).join("");
  }
}

// ---------- RENDER HELPLINES ----------
function renderHelplines() {
  const list = document.getElementById("helplinesList");
  if (!list) return;
  list.innerHTML = HELPLINES.map(h => `
    <div class="helpline-card" onclick="showToast('📞 Calling ${h.name} — ${h.number}')">
      <div class="helpline-icon" style="background:${h.bg}">${h.icon}</div>
      <div class="helpline-info">
        <div class="helpline-name">${h.name}</div>
        <div class="helpline-desc">${h.desc}</div>
        <div class="helpline-number">${h.number}</div>
      </div>
      <span class="call-icon">📞</span>
    </div>
  `).join("");
}

// ---------- NAVIGATION ----------
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  const target = document.getElementById(id);
  if (target) target.classList.add("active");
}

function bindNavigation() {
  document.querySelectorAll(".nav-item[data-screen]").forEach(btn => {
    btn.addEventListener("click", () => showScreen(btn.dataset.screen));
  });
}

// ---------- SOS BUTTON (hold) ----------
function bindSosButton() {
  const btn = document.getElementById("sosBtn");
  if (!btn) return;

  const start = () => { sosHoldTimer = setTimeout(startAlert, 1000); };
  const cancel = () => clearTimeout(sosHoldTimer);

  btn.addEventListener("mousedown", start);
  btn.addEventListener("mouseup", cancel);
  btn.addEventListener("mouseleave", cancel);
  btn.addEventListener("touchstart", e => { e.preventDefault(); start(); }, { passive: false });
  btn.addEventListener("touchend", cancel);
}

// ---------- QUICK ACTIONS ----------
function bindQuickActions() {
  document.getElementById("fakeCallBtn")?.addEventListener("click", showFakeCall);
  document.getElementById("recordBtn")?.addEventListener("click", toggleRecord);
  document.getElementById("shareGpsBtn")?.addEventListener("click", shareGps);
}

function toggleRecord() {
  isRecording = !isRecording;
  const btn = document.getElementById("recordBtn");
  if (btn) {
    btn.querySelector(".icon").textContent = isRecording ? "⏹" : "🎙";
    btn.querySelector(".label").textContent = isRecording ? "Stop" : "Record";
  }
  showToast(isRecording ? "🎙 Recording started silently" : "⏹ Recording stopped & saved");
}

function shareGps() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => showToast(`📍 Location shared: ${pos.coords.latitude.toFixed(4)}°N`),
      ()  => showToast("📍 Location shared with contacts")
    );
  } else {
    showToast("📍 Location shared with contacts");
  }
}

// ---------- ALERT FLOW ----------
function startAlert() {
  showScreen("alert");
  let count = 5;
  const circle = document.getElementById("progressCircle");
  const numEl  = document.getElementById("countdownNum");
  const circum  = 427;

  if (circle) circle.style.strokeDashoffset = "0";
  if (numEl)  numEl.textContent = count;

  countdownTimer = setInterval(() => {
    count--;
    if (numEl)  numEl.textContent = count;
    if (circle) circle.style.strokeDashoffset = `${((5 - count) / 5) * circum}`;
    if (count <= 0) {
      clearInterval(countdownTimer);
      triggerActiveAlert();
    }
  }, 1000);
}

function cancelAlert() {
  clearInterval(countdownTimer);
  showScreen("home");
  showToast("✅ Alert cancelled — Stay safe!");
}

function triggerActiveAlert() {
  showScreen("active-alert");
  elapsedSeconds = 0;
  fetchAndDisplayLocation();
  elapsedTimer = setInterval(() => {
    elapsedSeconds++;
    const m = Math.floor(elapsedSeconds / 60);
    const s = elapsedSeconds % 60;
    const el = document.getElementById("elapsed");
    if (el) el.textContent = `${m}:${s.toString().padStart(2, "0")}`;
  }, 1000);
}

function markSafe() {
  clearInterval(elapsedTimer);
  showScreen("home");
  showToast("✅ Marked safe. Alert closed.");
}

function bindAlertButtons() {
  document.getElementById("cancelBtn")?.addEventListener("click", cancelAlert);
  document.getElementById("safeNowBtn")?.addEventListener("click", markSafe);
}

// ---------- FAKE CALL ----------
function showFakeCall() {
  const overlay = document.getElementById("fake-call");
  if (overlay) overlay.classList.add("active");
  const callerName = CONTACTS[0]?.name || "Mom";
  const nameEl = document.getElementById("fakeCallerName");
  if (nameEl) nameEl.textContent = callerName;
  if (navigator.vibrate) navigator.vibrate([500, 300, 500]);
}

function endFakeCall() {
  document.getElementById("fake-call")?.classList.remove("active");
}

function bindFakeCall() {
  document.getElementById("declineBtn")?.addEventListener("click", endFakeCall);
  document.getElementById("acceptBtn")?.addEventListener("click", endFakeCall);
}

// ---------- LOCATION ----------
function fetchAndDisplayLocation() {
  const coordEl = document.getElementById("liveCoords");
  if (!coordEl) return;
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => {
        coordEl.textContent = `${pos.coords.latitude.toFixed(4)}°N, ${pos.coords.longitude.toFixed(4)}°E`;
      },
      () => { coordEl.textContent = "28.6139°N, 77.2090°E (demo)"; }
    );
  } else {
    coordEl.textContent = "28.6139°N, 77.2090°E (demo)";
  }
}

// ---------- SHAKE DETECTION ----------
function initShakeDetection() {
  let shakeCount = 0;
  let lastShake  = 0;
  if (!window.DeviceMotionEvent) return;
  window.addEventListener("devicemotion", e => {
    const acc = e.accelerationIncludingGravity;
    if (!acc) return;
    const total = Math.abs(acc.x) + Math.abs(acc.y) + Math.abs(acc.z);
    const now   = Date.now();
    if (total > 30 && now - lastShake > 500) {
      lastShake = now;
      shakeCount++;
      if (shakeCount >= 3) { shakeCount = 0; startAlert(); }
    }
  });
}

// ---------- KEYBOARD SHORTCUTS ----------
function initKeyboardShortcuts() {
  document.addEventListener("keydown", e => {
    if (e.key === "s" || e.key === "S") startAlert();
    if (e.key === "f" || e.key === "F") showFakeCall();
    if (e.key === "Escape") { cancelAlert(); endFakeCall(); }
  });
}

// ---------- TOAST ----------
function showToast(msg) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2800);
                                                   }
