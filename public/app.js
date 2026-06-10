const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  document.documentElement.style.setProperty("--tg-theme-bg-color", tg.themeParams.bg_color || "#050914");
}

const user = tg?.initDataUnsafe?.user || {
  first_name: "Alex",
  username: "alex"
};

const state = {
  page: "home",
  lang: localStorage.getItem("luxai_lang") || "tr",
  theme: localStorage.getItem("luxai_theme") || "dark"
};

const app = document.getElementById("app");
const modalRoot = document.getElementById("modal-root");

const t = {
  tr: {
    hello: "Merhaba",
    subtitle: "Bugün ne üretmek istersin?",
    startChat: "AI Sohbete Başla",
    studio: "AI Studio",
    voice: "Voice AI",
    docs: "Documents",
    tools: "Tools",
    recent: "Son Kullanılanlar",
    all: "Tümü ›",
    profile: "Profil",
    chatPlaceholder: "Mesaj yaz...",
    listening: "Dinliyorum...",
    uploadPdf: "PDF dosyanızı yükleyin",
    chooseFile: "Dosya Seç"
  },
  en: {
    hello: "Hello",
    subtitle: "What would you like to create today?",
    startChat: "Start AI Chat",
    studio: "AI Studio",
    voice: "Voice AI",
    docs: "Documents",
    tools: "Tools",
    recent: "Recent",
    all: "All ›",
    profile: "Profile",
    chatPlaceholder: "Write a message...",
    listening: "Listening...",
    uploadPdf: "Upload your PDF file",
    chooseFile: "Choose File"
  },
  ru: {
    hello: "Привет",
    subtitle: "Что хотите создать сегодня?",
    startChat: "Начать чат",
    studio: "AI Studio",
    voice: "Voice AI",
    docs: "Документы",
    tools: "Инструменты",
    recent: "Недавние",
    all: "Все ›",
    profile: "Профиль",
    chatPlaceholder: "Напишите сообщение...",
    listening: "Слушаю...",
    uploadPdf: "Загрузите PDF",
    chooseFile: "Выбрать файл"
  },
  uk: {
    hello: "Привіт",
    subtitle: "Що хочете створити сьогодні?",
    startChat: "Почати чат",
    studio: "AI Studio",
    voice: "Voice AI",
    docs: "Документи",
    tools: "Інструменти",
    recent: "Останні",
    all: "Усі ›",
    profile: "Профіль",
    chatPlaceholder: "Напишіть повідомлення...",
    listening: "Слухаю...",
    uploadPdf: "Завантажте PDF",
    chooseFile: "Обрати файл"
  }
};

function L(key) {
  return (t[state.lang] || t.tr)[key] || t.tr[key] || key;
}

function setPage(page) {
  state.page = page;
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.page === page);
  });
  render();
}

document.querySelectorAll("[data-page]").forEach(btn => {
  btn.addEventListener("click", () => setPage(btn.dataset.page));
});

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
}

function renderHome() {
  h(`
    <div class="status-row">
      <div class="brand">LuxAI <span class="badge">PRO</span></div>
      <button class="icon-btn" onclick="openPlan()">👑</button>
    </div>

    <section class="hero">
      <h1>${L("hello")}, ${escapeHtml(user.first_name || user.username || "User")}! 👋</h1>
      <p>${L("subtitle")}</p>
      <div class="orb-wrap"><div class="orb"></div></div>
      <button class="primary-btn" onclick="setPage('chat')">${L("startChat")} <span class="arrow">→</span></button>
    </section>

    <section class="grid">
      ${toolCard("🧪", L("studio"), "Görsel oluştur", "studio")}
      ${toolCard("🎙", L("voice"), "Sesli sohbet", "voice", "cyan")}
      ${toolCard("📄", L("docs"), "PDF & Analiz", "docs", "orange")}
      ${toolCard("🛠", L("tools"), "Diğer araçlar", "studio", "cyan")}
    </section>

    <div class="section-title">
      <h2>${L("recent")}</h2><small>${L("all")}</small>
    </div>
    <div class="list">
      ${recentItem("🔥", "Logo tasarımı", "2 dakika önce")}
      ${recentItem("💎", "Dubai’de yatırım fikirleri", "1 saat önce")}
      ${recentItem("📄", "CV düzenleme", "3 saat önce")}
    </div>
  `);
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

function renderChat() {
  h(`
    <div class="header">
      <button class="back" onclick="setPage('home')">‹</button>
      <div style="text-align:center"><h1>LuxAI</h1></div>
      <button class="back" onclick="openQuick()">⋮</button>
    </div>

    <div class="chat-wrap" id="chatMessages">
      <div class="day-pill">BUGÜN</div>
      <div class="msg user">Dubai Marina’da Ferrari süren bir adam göster</div>
      <div class="msg ai">İşte istediğin görsel oluşturuldu.</div>
      <div class="chat-img">AI Image Preview</div>
      <div class="msg user">Bunu gece versiyonu yapabilir misin?</div>
      <div class="msg ai">Tabii! İşte gece versiyonu.</div>
      <div class="chat-img">Night Version Preview</div>
    </div>

    <div class="chat-input">
      <button class="round" onclick="alertMini('Dosya yükleme aktif edilebilir')">⌘</button>
      <input id="chatInput" placeholder="${L("chatPlaceholder")}" onkeydown="if(event.key==='Enter') sendMessage()" />
      <button class="round" onclick="alertMini('Emoji / araç menüsü')">☺</button>
      <button class="round purple" onclick="sendMessage()">⌁</button>
    </div>
  `);
}

function sendMessage() {
  const input = document.getElementById("chatInput");
  if (!input || !input.value.trim()) return;
  const box = document.getElementById("chatMessages");
  const text = escapeHtml(input.value.trim());
  box.insertAdjacentHTML("beforeend", `<div class="msg user">${text}</div><div class="msg ai">LuxAI düşünüyor... Bu alan backend API’ye bağlanacak.</div>`);
  input.value = "";
  setTimeout(() => box.scrollTop = box.scrollHeight, 10);
}

function renderStudio() {
  h(`
    <div class="header">
      <div><h1>AI Studio</h1><p>Yaratıcılığını konuştur</p></div>
      <button class="icon-btn" onclick="openQuick()">✦</button>
    </div>

    <section class="grid">
      ${toolCard("🎨", "Görsel Oluştur", "Metinlerden harika görseller üret", "studio")}
      ${toolCard("🖼", "Fotoğraf Düzenle", "Fotoğraflarını düzenle ve geliştir", "studio", "cyan")}
      ${toolCard("🏆", "Logo Tasarla", "Profesyonel logo oluştur", "studio", "orange")}
      ${toolCard("👤", "AI Avatar", "Kendine özel avatar üret", "studio")}
      ${toolCard("✂", "Arka Plan Kaldır", "Görsellerden arka planı kaldır", "studio", "cyan")}
      ${toolCard("✨", "HD Yükselt", "Görselleri HD kaliteye yükselt", "studio", "orange")}
      ${toolCard("🧾", "Banner Oluştur", "İçeriklerin için banner tasarla", "studio", "cyan")}
      ${toolCard("🎬", "Video Oluştur", "Metinden video oluştur", "studio", "pink")}
    </section>

    <div class="section-title">
      <h2>Son Çalışmalarım</h2><small>Tümü ›</small>
    </div>
    <div class="list">
      ${recentItem("🏅", "LuxAI logo", "Bugün")}
      ${recentItem("👩", "AI avatar", "Dün")}
      ${recentItem("🏎", "Dubai Ferrari görseli", "2 gün önce")}
    </div>
  `);
}

function renderProfile() {
  h(`
    <div class="profile-head">
      <div class="avatar"><div></div></div>
      <h2>${escapeHtml(user.first_name || "Alex Johnson")}</h2>
      <span class="badge">👑 Premium</span>
    </div>

    <div class="stats">
      <div class="stat"><small>Mesaj</small><strong>12.458</strong></div>
      <div class="stat"><small>Görsel</small><strong>1.245</strong></div>
      <div class="stat"><small>Dosya</small><strong>326</strong></div>
    </div>

    <div class="menu-card">
      <div class="menu-row"><span>▣ Sohbet Geçmişi</span><span>›</span></div>
      <div class="menu-row"><span>☆ Favorilerim</span><span>›</span></div>
      <div class="menu-row" onclick="openPlan()"><span>♕ Abonelik Planım</span><span>›</span></div>
      <div class="menu-row"><span>⌘ Referans Programı</span><span class="badge">KAZAN</span></div>
      <div class="menu-row" onclick="openLang()"><span>⚙ Dil & Ayarlar</span><span>›</span></div>
      <div class="menu-row"><span>? Yardım & Destek</span><span>›</span></div>
    </div>
  `);
}

function renderVoice() {
  h(`
    <div class="header">
      <button class="back" onclick="setPage('home')">‹</button>
      <div style="text-align:center"><h1>Voice AI</h1><p>Sesli asistan</p></div>
      <span></span>
    </div>

    <section class="voice-page">
      <div class="voice-orb"><div class="wave">▂▆█▆▂</div></div>
      <h2>${L("listening")}</h2>
      <p style="color:var(--muted)">Konuşmaya başlayabilirsiniz</p>

      <div class="voice-actions">
        <button class="round">⌗</button>
        <button class="big-record">■</button>
        <button class="round">🔊</button>
      </div>

      <div style="margin-top:28px">
        <button class="primary-btn" onclick="openLang()">🇹🇷 Türkçe⌄</button>
      </div>
    </section>
  `);
}

function renderDocs() {
  h(`
    <div class="header">
      <button class="back" onclick="setPage('home')">‹</button>
      <div><h1>Documents</h1><p>PDF analiz ve özet</p></div>
      <span></span>
    </div>

    <div class="upload-box">
      <div>
        <div style="font-size:36px">▧</div>
        <strong>${L("uploadPdf")}</strong>
        <p>veya buraya sürükleyin</p>
        <button class="primary-btn" style="height:44px;width:160px" onclick="alertMini('Backend ile PDF yükleme bağlanacak')">${L("chooseFile")}</button>
      </div>
    </div>

    <div class="section-title">
      <h2>Son Belgelerim</h2><small>Tümü ›</small>
    </div>
    <div class="list">
      ${docItem("Yapay Zeka Raporu.pdf", "2.4 MB · 14:30")}
      ${docItem("Finansal Analiz 2024.pdf", "1.8 MB · 10:15")}
      ${docItem("Pazarlama Stratejisi.pdf", "3.2 MB · Dün")}
      ${docItem("Sözleşme Taslağı.pdf", "1.1 MB · 2 gün önce")}
    </div>
  `);
}

function docItem(name, meta) {
  return `
    <div class="list-item">
      <div class="mini">📄</div>
      <div style="flex:1"><strong>${name}</strong><small>${meta}</small></div>
      <span style="color:var(--muted)">⋮</span>
    </div>
  `;
}

function openLang() {
  modalRoot.innerHTML = `
    <div class="modal-backdrop" onclick="closeModal(event)">
      <div class="modal">
        <div class="modal-head">
          <h2>Dil Seçin</h2>
          <button class="close" onclick="modalRoot.innerHTML=''">×</button>
        </div>
        ${langRow("tr", "🇹🇷 Türkçe")}
        ${langRow("en", "🇬🇧 English")}
        ${langRow("ru", "🇷🇺 Русский")}
        ${langRow("uk", "🇺🇦 Українська")}
        ${langRow("ar", "🇦🇪 العربية")}
      </div>
    </div>
  `;
}

function langRow(code, label) {
  const active = state.lang === code ? "✓" : "";
  return `<div class="lang-row" onclick="setLang('${code}')"><span>${label}</span><span>${active}</span></div>`;
}

function setLang(code) {
  state.lang = code === "ar" ? "tr" : code;
  localStorage.setItem("luxai_lang", state.lang);
  modalRoot.innerHTML = "";
  render();
}

function openPlan() {
  modalRoot.innerHTML = `
    <div class="modal-backdrop" onclick="closeModal(event)">
      <div class="modal">
        <div class="modal-head">
          <h2>Premium Plan</h2>
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
          <h2>Hızlı Komutlar</h2>
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
  }, 30);
}

function closeModal(e) {
  if (e.target.classList.contains("modal-backdrop")) modalRoot.innerHTML = "";
}

function alertMini(msg) {
  if (tg?.showAlert) tg.showAlert(msg);
  else alert(msg);
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

render();
