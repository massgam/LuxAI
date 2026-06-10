const tg = window.Telegram?.WebApp;

if (tg) {
  tg.ready();
  tg.expand();
}

const I18N = {
  tr: {
    home: "Ana Sayfa",
    chat: "Sohbet",
    studio: "AI Studio",
    voice: "Voice AI",
    docs: "Documents",
    profile: "Profil",
    hello: "Merhaba",
    subtitle: "Bugün ne üretmek istersin?",
    startChat: "AI Sohbete Başla",
    recent: "Son Kullanılanlar",
    tools: "Tools",
    input: "Mesaj yaz...",
    thinking: "Düşünüyorum...",
    err: "Bir hata oluştu.",
    listen: "🔊 Dinle",
    copy: "📋 Kopyala",
    photoReady: "Fotoğraf yüklendi. Şimdi ne yapmak istediğini yaz.",
    uploadPdf: "PDF veya dosya yükleyin",
    chooseFile: "Dosya Seç",
    trans: "Ses yazıya çevriliyor...",
    record: "Dinliyorum...",
    voiceHint: "Konuşmak için mikrofona dokunun",
    premium: "Premium Plan",
    language: "Dil Seçin",
    quick: "Hızlı Komutlar"
  },
  en: {
    home: "Home",
    chat: "Chat",
    studio: "AI Studio",
    voice: "Voice AI",
    docs: "Documents",
    profile: "Profile",
    hello: "Hello",
    subtitle: "What would you like to create today?",
    startChat: "Start AI Chat",
    recent: "Recent",
    tools: "Tools",
    input: "Write a message...",
    thinking: "Thinking...",
    err: "Something went wrong.",
    listen: "🔊 Listen",
    copy: "📋 Copy",
    photoReady: "Photo uploaded. Now type what you want to change.",
    uploadPdf: "Upload PDF or file",
    chooseFile: "Choose File",
    trans: "Transcribing voice...",
    record: "Listening...",
    voiceHint: "Tap microphone and speak",
    premium: "Premium Plan",
    language: "Choose Language",
    quick: "Quick Commands"
  },
  ru: {
    home: "Главная",
    chat: "Чат",
    studio: "AI Studio",
    voice: "Voice AI",
    docs: "Документы",
    profile: "Профиль",
    hello: "Привет",
    subtitle: "Что хотите создать сегодня?",
    startChat: "Начать чат",
    recent: "Недавние",
    tools: "Инструменты",
    input: "Напишите сообщение...",
    thinking: "Думаю...",
    err: "Произошла ошибка.",
    listen: "🔊 Слушать",
    copy: "📋 Копировать",
    photoReady: "Фото загружено. Теперь напишите, что нужно изменить.",
    uploadPdf: "Загрузите PDF или файл",
    chooseFile: "Выбрать файл",
    trans: "Распознаю голос...",
    record: "Слушаю...",
    voiceHint: "Нажмите микрофон и говорите",
    premium: "Премиум план",
    language: "Выберите язык",
    quick: "Быстрые команды"
  },
  uk: {
    home: "Головна",
    chat: "Чат",
    studio: "AI Studio",
    voice: "Voice AI",
    docs: "Документи",
    profile: "Профіль",
    hello: "Привіт",
    subtitle: "Що хочете створити сьогодні?",
    startChat: "Почати чат",
    recent: "Останні",
    tools: "Інструменти",
    input: "Напишіть повідомлення...",
    thinking: "Думаю...",
    err: "Сталася помилка.",
    listen: "🔊 Слухати",
    copy: "📋 Копіювати",
    photoReady: "Фото завантажено. Тепер напишіть, що потрібно змінити.",
    uploadPdf: "Завантажте PDF або файл",
    chooseFile: "Обрати файл",
    trans: "Розпізнаю голос...",
    record: "Слухаю...",
    voiceHint: "Натисніть мікрофон і говоріть",
    premium: "Преміум план",
    language: "Оберіть мову",
    quick: "Швидкі команди"
  }
};

const user = tg?.initDataUnsafe?.user || {
  first_name: "Alex",
  username: "alex",
  id: "guest",
  language_code: navigator.language || "tr"
};

let serverConfig = {};
let currentPhotoData = "";
let currentPhotoFileName = "";
let recorder = null;
let chunks = [];
let timer = null;
let seconds = 0;

const state = {
  page: "home",
  lang: localStorage.getItem("luxai_lang") || detectLang()
};

const app = document.getElementById("app");
const modalRoot = document.getElementById("modal-root");

const storageKey = "luxai_history_" + (user.id || "guest");
let history = JSON.parse(localStorage.getItem(storageKey) || "[]");

function detectLang() {
  const saved = localStorage.getItem("luxai_lang");
  if (saved) return saved;

  const raw = String(user.language_code || navigator.language || "").toLowerCase();
  if (raw.startsWith("ru")) return "ru";
  if (raw.startsWith("uk")) return "uk";
  if (raw.startsWith("en")) return "en";
  if (raw.startsWith("tr")) return "tr";
  return "tr";
}

function langByCountry(country) {
  if (!country) return "";
  if (["RU", "BY", "KZ", "KG"].includes(country)) return "ru";
  if (country === "UA") return "uk";
  if (country === "TR") return "tr";
  if (["US", "GB", "AE", "CA", "AU"].includes(country)) return "en";
  return "";
}

function L(key) {
  return (I18N[state.lang] || I18N.tr)[key] || I18N.tr[key] || key;
}

function displayName() {
  return user.first_name || user.username || "User";
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, m => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[m]));
}

function saveHistory() {
  localStorage.setItem(storageKey, JSON.stringify(history.slice(-300)));
}

function addHistory(item) {
  history.push({ ...item, time: Date.now() });
  saveHistory();
}

async function init() {
  try {
    const res = await fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user })
    });

    serverConfig = await res.json();

    const countryLang = langByCountry(serverConfig.country);
    if (!localStorage.getItem("luxai_lang") && !user.language_code && countryLang) {
      state.lang = countryLang;
    }
  } catch (e) {}

  bindNav();
  render();
}

function bindNav() {
  document.querySelectorAll("[data-page]").forEach(btn => {
    btn.onclick = () => setPage(btn.dataset.page);
  });
}

function setPage(page) {
  state.page = page;

  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.page === page);
  });

  render();
}

function h(html) {
  app.innerHTML = html;
}

function render() {
  if (state.page === "home") return renderHome();
  if (state.page === "chat") return renderChat();
  if (state.page === "studio") return renderStudio();
  if (state.page === "profile") return renderProfile();
  if (state.page === "voice") return renderVoice();
  if (state.page === "docs") return renderDocs();
  if (state.page === "admin") return renderAdmin();
}

function toolCard(icon, title, desc, page, color = "") {
  return `
    <div class="card" onclick="setPage('${page}')">
      <div class="tile-icon ${color}">${icon}</div>
      <h3>${title}</h3>
      <p>${desc}</p>
    </div>
  `;
}

function recentItem(icon, title, time) {
  return `
    <div class="list-item">
      <div class="mini">${icon}</div>
      <div><strong>${title}</strong><small>${time}</small></div>
    </div>
  `;
}

function renderHome() {
  h(`
    <div class="status-row">
      <div class="brand">LuxAI <span class="badge">PRO</span></div>
      <button class="icon-btn" onclick="openLang()">🌍</button>
    </div>

    <section class="hero">
      <h1>${L("hello")}, ${escapeHtml(displayName())}! 👋</h1>
      <p>${L("subtitle")}</p>
      <div class="orb-wrap"><div class="orb"></div></div>
      <button class="primary-btn" onclick="setPage('chat')">${L("startChat")} <span class="arrow">→</span></button>
    </section>

    <section class="grid">
      ${toolCard("💬", L("chat"), "AI sohbet", "chat")}
      ${toolCard("🎨", L("studio"), "Görsel, avatar, logo", "studio", "cyan")}
      ${toolCard("🎙", L("voice"), "Sesli asistan", "voice", "orange")}
      ${toolCard("📄", L("docs"), "PDF ve dosya analizi", "docs", "cyan")}
    </section>

    <div class="section-title">
      <h2>${L("recent")}</h2><small onclick="renderHistoryModal()">Tümü ›</small>
    </div>
    <div class="list">
      ${recentItem("🔥", "Logo tasarımı", "2 dakika önce")}
      ${recentItem("💎", "Dubai’de yatırım fikirleri", "1 saat önce")}
      ${recentItem("📄", "CV düzenleme", "3 saat önce")}
    </div>
  `);
}

function renderChat() {
  h(`
    <div class="header">
      <button class="back" onclick="setPage('home')">‹</button>
      <div style="text-align:center"><h1>LuxAI</h1></div>
      <button class="back" onclick="openQuick()">⋮</button>
    </div>

    <div class="chat-wrap" id="chatMessages">
      <div class="day-pill">BUGÜN</div>
    </div>

    <div class="chat-input">
      <button class="round" onclick="document.getElementById('fileInputHidden').click()">⌘</button>
      <input id="chatInput" placeholder="${L("input")}" onkeydown="if(event.key==='Enter') sendMessage(false)" />
      <button class="round" onclick="document.getElementById('photoInputHidden').click()">🖼</button>
      <button class="round purple" onclick="sendMessage(false)">⌁</button>
    </div>

    <input id="photoInputHidden" type="file" accept="image/*" style="display:none" />
    <input id="fileInputHidden" type="file" style="display:none" />
  `);

  const box = document.getElementById("chatMessages");
  if (history.length) {
    history.slice(-30).forEach(item => {
      if (item.image) addImageToBox(item.role, item.image, item.text || "", false);
      else addMsgToBox(item.role, item.text || "", item.role === "ai", false);
    });
  } else {
    addMsgToBox("ai", `${L("hello")} ${displayName()}, LuxAI hazır. Ne yapmak istersin?`, true, false);
  }

  document.getElementById("photoInputHidden").onchange = handlePhotoUpload;
  document.getElementById("fileInputHidden").onchange = handleFileUpload;
}

function addMsgToBox(role, text, actions = role === "ai", save = true) {
  const box = document.getElementById("chatMessages");
  if (!box) return;

  const m = document.createElement("div");
  m.className = "msg " + role;

  const safe = escapeHtml(text);
  m.innerHTML = `<div>${safe}</div>`;

  if (actions && role === "ai") {
    const actionsBox = document.createElement("div");
    actionsBox.className = "actions";
    actionsBox.innerHTML = `
      <button class="small">${L("listen")}</button>
      <button class="small">${L("copy")}</button>
    `;
    const btns = actionsBox.querySelectorAll("button");
    btns[0].onclick = () => speak(text, btns[0]);
    btns[1].onclick = () => navigator.clipboard?.writeText(text);
    m.appendChild(actionsBox);
  }

  box.appendChild(m);
  box.scrollTop = box.scrollHeight;

  if (save) addHistory({ role, text });
  return m;
}

function addImageToBox(role, src, caption = "", save = true) {
  const box = document.getElementById("chatMessages");
  if (!box) return;

  const m = document.createElement("div");
  m.className = "msg " + role;

  const img = document.createElement("img");
  img.src = src;
  img.style.maxWidth = "100%";
  img.style.borderRadius = "14px";
  img.style.display = "block";

  m.appendChild(img);

  if (caption) {
    const p = document.createElement("div");
    p.style.marginTop = "10px";
    p.textContent = caption;
    m.appendChild(p);
  }

  box.appendChild(m);
  box.scrollTop = box.scrollHeight;

  if (save) addHistory({ role, text: caption || "[image]", image: src });
}

function addChatMessage(role, text, actions = role === "ai", save = true) {
  setPage("chat");
  setTimeout(() => addMsgToBox(role, text, actions, save), 30);
}

async function sendMessage(autoSpeak = false) {
  const input = document.getElementById("chatInput");
  if (!input || !input.value.trim()) return;

  const text = input.value.trim();
  addMsgToBox("user", text, false);
  input.value = "";

  const loading = addMsgToBox("ai", L("thinking"), false, false);

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, lang: state.lang, user })
    });

    const data = await res.json();

    loading.remove();

    if (!data.ok) return addMsgToBox("ai", data.error || L("err"));

    if (data.type === "image" && data.image) {
      addImageToBox("ai", data.image, data.reply || "");
    } else {
      addMsgToBox("ai", data.reply || "");
      if (autoSpeak && data.reply) speak(data.reply, { textContent: "" });
    }
  } catch (e) {
    loading.textContent = L("err");
  }
}

async function speak(text, btn) {
  const old = btn?.textContent;

  if (btn && btn.textContent !== undefined) btn.textContent = "⏳";

  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, lang: state.lang })
    });

    const data = await res.json();

    if (data.ok && data.audio) {
      await new Audio(data.audio).play();
    }
  } catch (e) {}

  if (btn && btn.textContent !== undefined) btn.textContent = old;
}

function renderStudio() {
  h(`
    <div class="header">
      <button class="back" onclick="setPage('home')">‹</button>
      <div><h1>AI Studio</h1><p>Yaratıcılığını konuştur</p></div>
      <button class="icon-btn" onclick="openQuick()">✦</button>
    </div>

    <section class="grid">
      ${studioButton("🎨", "Görsel Oluştur", "Metinden görsel üret", "Görsel oluştur: ")}
      ${studioUpload("🖼", "Fotoğraf Düzenle", "Fotoğraf yükle", "photo")}
      ${studioButton("🏆", "Logo Tasarla", "Profesyonel logo oluştur", "LuxAI için profesyonel logo oluştur: ")}
      ${studioButton("👤", "AI Avatar", "Avatar oluştur", "AI avatar oluştur: ")}
      ${studioButton("✂", "Arka Plan Kaldır", "Arka plan kaldır", "Bu fotoğrafın arka planını kaldır: ")}
      ${studioButton("✨", "HD Yükselt", "Kalite artır", "Bu görseli HD yap: ")}
      ${studioButton("🧾", "Banner Oluştur", "Sosyal medya banner", "Banner oluştur: ")}
      ${studioButton("🎬", "Video Oluştur", "Video fikri hazırla", "Video prompt oluştur: ")}
    </section>

    <input id="studioPhotoInput" type="file" accept="image/*" style="display:none" />

    <div class="section-title">
      <h2>Prompt Yaz</h2>
    </div>

    <div class="chat-input" style="position:static;transform:none;width:100%;margin-top:12px">
      <input id="studioPrompt" placeholder="Ne oluşturmak istiyorsun?" />
      <button class="round purple" onclick="sendStudioPrompt()">⌁</button>
    </div>
  `);

  const photo = document.getElementById("studioPhotoInput");
  if (photo) photo.onchange = handlePhotoUpload;
}

function studioButton(icon, title, desc, prefix) {
  return `
    <div class="card" onclick="fillStudioPrompt('${escapeAttr(prefix)}')">
      <div class="tile-icon">${icon}</div>
      <h3>${title}</h3>
      <p>${desc}</p>
    </div>
  `;
}

function studioUpload(icon, title, desc) {
  return `
    <div class="card" onclick="document.getElementById('studioPhotoInput').click()">
      <div class="tile-icon cyan">${icon}</div>
      <h3>${title}</h3>
      <p>${desc}</p>
    </div>
  `;
}

function escapeAttr(str) {
  return String(str).replace(/'/g, "\\'");
}

function fillStudioPrompt(prefix) {
  const input = document.getElementById("studioPrompt");
  if (input) {
    input.value = prefix;
    input.focus();
  }
}

function sendStudioPrompt() {
  const input = document.getElementById("studioPrompt");
  if (!input || !input.value.trim()) return;

  setPage("chat");

  setTimeout(() => {
    const chatInput = document.getElementById("chatInput");
    chatInput.value = input.value.trim();
    sendMessage(false);
  }, 50);
}

async function handlePhotoUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  currentPhotoFileName = file.name;

  const reader = new FileReader();

  reader.onload = async () => {
    currentPhotoData = reader.result;

    setPage("chat");

    setTimeout(async () => {
      addImageToBox("user", currentPhotoData, file.name);
      const loading = addMsgToBox("ai", L("thinking"), false, false);

      try {
        const res = await fetch("/api/upload-photo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: currentPhotoData,
            mime: file.type || "image/jpeg",
            user,
            lang: state.lang
          })
        });

        const data = await res.json();
        loading.textContent = data.ok ? L("photoReady") : (data.error || L("err"));
      } catch (e) {
        loading.textContent = L("err");
      }
    }, 80);
  };

  reader.readAsDataURL(file);
}

async function handleFileUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  setPage("chat");

  const reader = new FileReader();

  reader.onload = async () => {
    setTimeout(async () => {
      addMsgToBox("user", `📄 ${file.name}`, false);
      const loading = addMsgToBox("ai", L("thinking"), false, false);

      try {
        const res = await fetch("/api/upload-file", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileBase64: reader.result,
            fileName: file.name,
            mime: file.type || "",
            user,
            lang: state.lang
          })
        });

        const data = await res.json();
        loading.remove();

        const reply = data.ok ? data.reply : (data.error || L("err"));
        addMsgToBox("ai", reply);
      } catch (e) {
        loading.textContent = L("err");
      }
    }, 80);
  };

  reader.readAsDataURL(file);
}

function renderVoice() {
  h(`
    <div class="header">
      <button class="back" onclick="setPage('home')">‹</button>
      <div style="text-align:center"><h1>Voice AI</h1><p>${L("voiceHint")}</p></div>
      <span></span>
    </div>

    <section class="voice-page">
      <div class="voice-orb" id="voiceRing"><div class="wave">▂▆█▆▂</div></div>
      <h2 id="voiceStatus">${L("record")}</h2>
      <p id="voiceTime" style="color:var(--muted)">00:00</p>

      <div class="voice-actions">
        <button class="round" onclick="setPage('chat')">⌗</button>
        <button class="big-record" id="voiceBtn">●</button>
        <button class="round" onclick="openLang()">🌍</button>
      </div>
    </section>
  `);

  document.getElementById("voiceBtn").onclick = toggleRecord;
}

async function toggleRecord() {
  try {
    if (recorder && recorder.state === "recording") {
      recorder.stop();
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    chunks = [];
    seconds = 0;

    const timeEl = document.getElementById("voiceTime");
    const ring = document.getElementById("voiceRing");

    if (timeEl) timeEl.textContent = "00:00";

    recorder = new MediaRecorder(stream);

    recorder.ondataavailable = e => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = async () => {
      stream.getTracks().forEach(x => x.stop());
      if (ring) ring.classList.remove("recording");
      clearInterval(timer);

      const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
      const reader = new FileReader();

      reader.onload = async () => {
        setPage("chat");

        setTimeout(async () => {
          const loading = addMsgToBox("ai", L("trans"), false, false);

          try {
            const res = await fetch("/api/transcribe", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                audioBase64: reader.result,
                mime: blob.type,
                user,
                lang: state.lang
              })
            });

            const data = await res.json();
            loading.remove();

            if (!data.ok) return addMsgToBox("ai", data.error || L("err"));

            const chatInput = document.getElementById("chatInput");
            chatInput.value = data.transcript || "";
            await sendMessage(true);
          } catch (e) {
            loading.textContent = L("err");
          }
        }, 80);
      };

      reader.readAsDataURL(blob);
    };

    recorder.start();

    if (ring) ring.classList.add("recording");

    timer = setInterval(() => {
      seconds++;
      const timeEl = document.getElementById("voiceTime");
      if (timeEl) timeEl.textContent = "00:" + String(seconds).padStart(2, "0");
    }, 1000);
  } catch (e) {
    addChatMessage("ai", "Microphone permission is required.", false);
  }
}

function renderDocs() {
  h(`
    <div class="header">
      <button class="back" onclick="setPage('home')">‹</button>
      <div><h1>Documents</h1><p>PDF analiz ve özet</p></div>
      <span></span>
    </div>

    <div class="upload-box" onclick="document.getElementById('docsFileInput').click()">
      <div>
        <div style="font-size:36px">▧</div>
        <strong>${L("uploadPdf")}</strong>
        <p>PDF, TXT, DOCX yükleyebilirsin</p>
        <button class="primary-btn" style="height:44px;width:160px">${L("chooseFile")}</button>
      </div>
    </div>

    <input id="docsFileInput" type="file" style="display:none" />

    <div class="section-title">
      <h2>Son Belgelerim</h2>
    </div>
    <div class="list">
      ${recentItem("📄", "Yapay Zeka Raporu.pdf", "2.4 MB")}
      ${recentItem("📄", "Finansal Analiz.pdf", "1.8 MB")}
      ${recentItem("📄", "Pazarlama Stratejisi.pdf", "3.2 MB")}
    </div>
  `);

  document.getElementById("docsFileInput").onchange = handleFileUpload;
}

function renderProfile() {
  const adminButton = serverConfig.isAdmin
    ? `<div class="menu-row" onclick="setPage('admin')"><span>🛡 Admin Panel</span><span>›</span></div>`
    : "";

  h(`
    <div class="profile-head">
      <div class="avatar"><div></div></div>
      <h2>${escapeHtml(displayName())}</h2>
      <span class="badge">👑 Premium</span>
    </div>

    <div class="stats">
      <div class="stat"><small>Mesaj</small><strong>${history.filter(x => x.role === "user").length}</strong></div>
      <div class="stat"><small>Görsel</small><strong>${history.filter(x => x.image).length}</strong></div>
      <div class="stat"><small>Dil</small><strong>${state.lang.toUpperCase()}</strong></div>
    </div>

    <div class="menu-card">
      <div class="menu-row" onclick="renderHistoryModal()"><span>▣ Sohbet Geçmişi</span><span>›</span></div>
      <div class="menu-row" onclick="openPlan()"><span>♕ Abonelik Planım</span><span>›</span></div>
      <div class="menu-row"><span>⌘ Referans Programı</span><span class="badge">KAZAN</span></div>
      <div class="menu-row" onclick="openLang()"><span>⚙ Dil & Ayarlar</span><span>${state.lang.toUpperCase()}</span></div>
      ${adminButton}
      <div class="menu-row" onclick="clearHistory()"><span>🗑 Geçmişi Temizle</span><span>›</span></div>
    </div>
  `);
}

function clearHistory() {
  history = [];
  saveHistory();
  render();
}

function renderAdmin() {
  h(`
    <div class="header">
      <button class="back" onclick="setPage('profile')">‹</button>
      <div><h1>Admin Panel</h1><p>Kullanıcı ve işlem takibi</p></div>
      <button class="icon-btn" onclick="loadAdmin()">↻</button>
    </div>
    <div id="adminStats" class="grid"></div>
    <div class="section-title"><h2>Kullanıcılar</h2></div>
    <div id="adminUsers" class="list"></div>
    <div class="section-title"><h2>Detay</h2></div>
    <div id="adminDetail" class="list"></div>
  `);

  loadAdmin();
}

async function loadAdmin() {
  const stats = document.getElementById("adminStats");
  const users = document.getElementById("adminUsers");
  const detail = document.getElementById("adminDetail");

  if (!stats || !users || !detail) return;

  stats.innerHTML = `<div class="card"><h3>Loading</h3><p>...</p></div>`;
  users.innerHTML = "";
  detail.innerHTML = "";

  try {
    const res = await fetch(`/admin-data?userId=${encodeURIComponent(user.id || "")}&username=${encodeURIComponent(user.username || "")}`);
    const data = await res.json();

    if (!data.ok) {
      stats.innerHTML = `<div class="card"><h3>Error</h3><p>${escapeHtml(data.error || L("err"))}</p></div>`;
      return;
    }

    const actions = data.lastActions || [];
    const photos = data.photos || [];
    const map = {};

    actions.forEach(a => {
      const k = a.user || a.username || a.userId || "Unknown";
      if (!map[k]) map[k] = { name: k, actions: [], photos: [] };
      map[k].actions.push(a);
    });

    photos.forEach(p => {
      const k = p.user || p.username || "Unknown";
      if (!map[k]) map[k] = { name: k, actions: [], photos: [] };
      map[k].photos.push(p);
    });

    const onlineCount = Object.values(map).filter(u =>
      u.actions.some(a => Date.now() - new Date(a.time).getTime() < 10 * 60 * 1000)
    ).length;

    stats.innerHTML = `
      <div class="card"><h3>${Object.keys(map).length}</h3><p>Total Users</p></div>
      <div class="card"><h3>${onlineCount}</h3><p>Online</p></div>
      <div class="card"><h3>${actions.length}</h3><p>Messages</p></div>
      <div class="card"><h3>${photos.length}</h3><p>Photos</p></div>
    `;

    Object.values(map).forEach((u, i) => {
      const btn = document.createElement("div");
      btn.className = "list-item";
      btn.innerHTML = `<div class="mini">👤</div><div><strong>${i + 1}. ${escapeHtml(u.name)}</strong><small>${u.actions.length} sohbet · ${u.photos.length} fotoğraf</small></div>`;
      btn.onclick = () => {
        detail.innerHTML = `<div class="card"><h3>${escapeHtml(u.name)}</h3><p>${u.actions.length} sohbet · ${u.photos.length} fotoğraf</p></div>`;

        u.photos.forEach(p => {
          if (p.image) {
            const div = document.createElement("div");
            div.className = "card";
            div.innerHTML = `<img src="${p.image}" style="width:100%;border-radius:12px"><p>${escapeHtml(p.caption || "")}</p>`;
            detail.appendChild(div);
          }
        });

        u.actions.forEach((a, idx) => {
          const div = document.createElement("div");
          div.className = "card";
          div.innerHTML = `<p>${idx + 1}. ${escapeHtml(a.time || "")} | ${escapeHtml(a.type || "")}</p><p>${escapeHtml(a.text || "")}</p>`;
          detail.appendChild(div);
        });
      };

      users.appendChild(btn);
    });
  } catch (e) {
    stats.innerHTML = `<div class="card"><h3>Error</h3><p>${L("err")}</p></div>`;
  }
}

function openLang() {
  modalRoot.innerHTML = `
    <div class="modal-backdrop" onclick="closeModal(event)">
      <div class="modal">
        <div class="modal-head">
          <h2>${L("language")}</h2>
          <button class="close" onclick="modalRoot.innerHTML=''">×</button>
        </div>
        ${langRow("tr", "🇹🇷 Türkçe")}
        ${langRow("en", "🇬🇧 English")}
        ${langRow("ru", "🇷🇺 Русский")}
        ${langRow("uk", "🇺🇦 Українська")}
      </div>
    </div>
  `;
}

function langRow(code, label) {
  const active = state.lang === code ? "✓" : "";
  return `<div class="lang-row" onclick="setLang('${code}')"><span>${label}</span><span>${active}</span></div>`;
}

function setLang(code) {
  state.lang = code;
  localStorage.setItem("luxai_lang", code);
  modalRoot.innerHTML = "";

  if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred("light");

  render();
}

function openPlan() {
  modalRoot.innerHTML = `
    <div class="modal-backdrop" onclick="closeModal(event)">
      <div class="modal">
        <div class="modal-head">
          <h2>${L("premium")}</h2>
          <button class="close" onclick="modalRoot.innerHTML=''">×</button>
        </div>
        <div class="plan">
          <div class="crown">♛</div>
          <h2>LuxAI Premium</h2>
          <div class="checks">
            <div>✓ Sınırsız mesaj</div>
            <div>✓ Görsel oluşturma</div>
            <div>✓ PDF büyük dosya desteği</div>
            <div>✓ Öncelikli yanıt</div>
            <div>✓ Reklamsız kullanım</div>
          </div>
          <button class="primary-btn">Planı Yükselt</button>
        </div>
      </div>
    </div>
  `;
}

function openQuick() {
  modalRoot.innerHTML = `
    <div class="modal-backdrop" onclick="closeModal(event)">
      <div class="modal">
        <div class="modal-head">
          <h2>${L("quick")}</h2>
          <button class="close" onclick="modalRoot.innerHTML=''">×</button>
        </div>
        <div class="quick-list">
          <button onclick="quick('Bana logo tasarla')">▣ Bana logo tasarla</button>
          <button onclick="quick('Yatırım fikri ver')">▣ Yatırım fikri ver</button>
          <button onclick="quick('İngilizce çevir')">▣ İngilizce çevir</button>
          <button onclick="quick('Bu resmi düzenle')">▣ Bu resmi düzenle</button>
          <button onclick="quick('Özet çıkar')">▣ Özet çıkar</button>
        </div>
      </div>
    </div>
  `;
}

function quick(text) {
  modalRoot.innerHTML = "";
  setPage("chat");

  setTimeout(() => {
    const input = document.getElementById("chatInput");
    if (input) {
      input.value = text;
      input.focus();
    }
  }, 40);
}

function renderHistoryModal() {
  const items = history.slice().reverse().slice(0, 80).map(h => `
    <div class="list-item">
      <div class="mini">${h.role === "user" ? "👤" : "🤖"}</div>
      <div><strong>${new Date(h.time).toLocaleString()}</strong><small>${escapeHtml(h.text || "[image]")}</small></div>
    </div>
  `).join("");

  modalRoot.innerHTML = `
    <div class="modal-backdrop" onclick="closeModal(event)">
      <div class="modal">
        <div class="modal-head">
          <h2>Sohbet Geçmişi</h2>
          <button class="close" onclick="modalRoot.innerHTML=''">×</button>
        </div>
        <div class="list">${items || '<div class="list-item"><div class="mini">ℹ️</div><div><strong>Henüz geçmiş yok</strong></div></div>'}</div>
      </div>
    </div>
  `;
}

function closeModal(e) {
  if (e.target.classList.contains("modal-backdrop")) modalRoot.innerHTML = "";
}

window.setPage = setPage;
window.openLang = openLang;
window.setLang = setLang;
window.openPlan = openPlan;
window.openQuick = openQuick;
window.quick = quick;
window.sendMessage = sendMessage;
window.sendStudioPrompt = sendStudioPrompt;
window.fillStudioPrompt = fillStudioPrompt;
window.renderHistoryModal = renderHistoryModal;
window.clearHistory = clearHistory;
window.toggleRecord = toggleRecord;
window.loadAdmin = loadAdmin;

init();
