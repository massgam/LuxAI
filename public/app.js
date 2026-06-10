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
    voice: "Sesli AI",
    docs: "Belgeler",
    profile: "Profil",
    hello: "Merhaba",
    subtitle: "Bugün ne üretmek istersin?",
    startChat: "AI Sohbete Başla",
    recent: "Son Kullanılanlar",
    all: "Tümü ›",
    tools: "Araçlar",
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
    quick: "Hızlı Komutlar",
    today: "BUGÜN",
    ready: "LuxAI hazır. Ne yapmak istersin?",
    imageCreate: "Görsel Oluştur",
    imageDesc: "Metinden görsel üret",
    photoEdit: "Fotoğraf Düzenle",
    photoDesc: "Fotoğraf yükle ve düzenle",
    logo: "Logo Tasarla",
    logoDesc: "Profesyonel logo oluştur",
    avatar: "AI Avatar",
    avatarDesc: "Kendine özel avatar üret",
    bgRemove: "Arka Plan Kaldır",
    bgRemoveDesc: "Fotoğraftan arka planı kaldır",
    upscale: "HD Yükselt",
    upscaleDesc: "Görselleri daha kaliteli yap",
    banner: "Banner Oluştur",
    bannerDesc: "Sosyal medya bannerı oluştur",
    video: "Video Oluştur",
    videoDesc: "Video fikri veya prompt hazırla",
    promptTitle: "Prompt Yaz",
    promptPlaceholder: "Ne oluşturmak istiyorsun?",
    docsSubtitle: "PDF analiz ve özet",
    docsHint: "PDF, TXT, DOCX yükleyebilirsin",
    lastDocs: "Son Belgelerim",
    messages: "Mesaj",
    images: "Görsel",
    lang: "Dil",
    history: "Sohbet Geçmişi",
    plan: "Abonelik Planım",
    referral: "Referans Programı",
    earn: "KAZAN",
    settings: "Dil & Ayarlar",
    clearHistory: "Geçmişi Temizle",
    noHistory: "Henüz geçmiş yok",
    admin: "Admin Panel",
    adminSub: "Kullanıcı ve işlem takibi",
    users: "Kullanıcılar",
    detail: "Detay",
    totalUsers: "Toplam Kullanıcı",
    online: "Online",
    adminMessages: "Mesajlar",
    photos: "Fotoğraflar",
    loading: "Yükleniyor",
    upgrade: "Planı Yükselt",
    unlimited: "Sınırsız mesaj",
    imageGeneration: "Görsel oluşturma",
    bigPdf: "PDF büyük dosya desteği",
    priority: "Öncelikli yanıt",
    noAds: "Reklamsız kullanım",
    qLogo: "Bana logo tasarla",
    qInvest: "Yatırım fikri ver",
    qTranslate: "İngilizce çevir",
    qEdit: "Bu resmi düzenle",
    qSummary: "Özet çıkar",
    micRequired: "Mikrofon izni gerekli.",
    countryAuto: "Dil otomatik seçildi"
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
    all: "All ›",
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
    quick: "Quick Commands",
    today: "TODAY",
    ready: "LuxAI is ready. What would you like to do?",
    imageCreate: "Create Image",
    imageDesc: "Generate images from text",
    photoEdit: "Edit Photo",
    photoDesc: "Upload and edit a photo",
    logo: "Logo Maker",
    logoDesc: "Create a professional logo",
    avatar: "AI Avatar",
    avatarDesc: "Create your custom avatar",
    bgRemove: "Remove Background",
    bgRemoveDesc: "Remove background from photo",
    upscale: "HD Upscale",
    upscaleDesc: "Improve image quality",
    banner: "Create Banner",
    bannerDesc: "Create a social media banner",
    video: "Create Video",
    videoDesc: "Prepare a video idea or prompt",
    promptTitle: "Write Prompt",
    promptPlaceholder: "What do you want to create?",
    docsSubtitle: "PDF analysis and summary",
    docsHint: "You can upload PDF, TXT, DOCX",
    lastDocs: "Recent Documents",
    messages: "Messages",
    images: "Images",
    lang: "Language",
    history: "Chat History",
    plan: "My Subscription",
    referral: "Referral Program",
    earn: "EARN",
    settings: "Language & Settings",
    clearHistory: "Clear History",
    noHistory: "No history yet",
    admin: "Admin Panel",
    adminSub: "User and action tracking",
    users: "Users",
    detail: "Detail",
    totalUsers: "Total Users",
    online: "Online",
    adminMessages: "Messages",
    photos: "Photos",
    loading: "Loading",
    upgrade: "Upgrade Plan",
    unlimited: "Unlimited messages",
    imageGeneration: "Image generation",
    bigPdf: "Large PDF support",
    priority: "Priority response",
    noAds: "Ad-free usage",
    qLogo: "Design a logo for me",
    qInvest: "Give me an investment idea",
    qTranslate: "Translate to English",
    qEdit: "Edit this image",
    qSummary: "Summarize",
    micRequired: "Microphone permission is required.",
    countryAuto: "Language selected automatically"
  },
  ru: {
    home: "Главная",
    chat: "Чат",
    studio: "AI Studio",
    voice: "Голосовой AI",
    docs: "Документы",
    profile: "Профиль",
    hello: "Привет",
    subtitle: "Что хотите создать сегодня?",
    startChat: "Начать AI чат",
    recent: "Недавние",
    all: "Все ›",
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
    quick: "Быстрые команды",
    today: "СЕГОДНЯ",
    ready: "LuxAI готов. Что хотите сделать?",
    imageCreate: "Создать изображение",
    imageDesc: "Создание изображений из текста",
    photoEdit: "Редактировать фото",
    photoDesc: "Загрузить и изменить фото",
    logo: "Создать логотип",
    logoDesc: "Профессиональный логотип",
    avatar: "AI Аватар",
    avatarDesc: "Создать личный аватар",
    bgRemove: "Удалить фон",
    bgRemoveDesc: "Удалить фон с фото",
    upscale: "HD улучшение",
    upscaleDesc: "Улучшить качество изображения",
    banner: "Создать баннер",
    bannerDesc: "Баннер для соцсетей",
    video: "Создать видео",
    videoDesc: "Подготовить идею или prompt для видео",
    promptTitle: "Напишите prompt",
    promptPlaceholder: "Что хотите создать?",
    docsSubtitle: "Анализ и краткое содержание PDF",
    docsHint: "Можно загрузить PDF, TXT, DOCX",
    lastDocs: "Последние документы",
    messages: "Сообщения",
    images: "Изображения",
    lang: "Язык",
    history: "История чата",
    plan: "Моя подписка",
    referral: "Реферальная программа",
    earn: "ЗАРАБОТАТЬ",
    settings: "Язык и настройки",
    clearHistory: "Очистить историю",
    noHistory: "Истории пока нет",
    admin: "Админ панель",
    adminSub: "Отслеживание пользователей и действий",
    users: "Пользователи",
    detail: "Детали",
    totalUsers: "Всего пользователей",
    online: "Онлайн",
    adminMessages: "Сообщения",
    photos: "Фотографии",
    loading: "Загрузка",
    upgrade: "Улучшить план",
    unlimited: "Безлимитные сообщения",
    imageGeneration: "Создание изображений",
    bigPdf: "Поддержка больших PDF",
    priority: "Приоритетный ответ",
    noAds: "Без рекламы",
    qLogo: "Создай мне логотип",
    qInvest: "Дай инвестиционную идею",
    qTranslate: "Переведи на английский",
    qEdit: "Отредактируй это изображение",
    qSummary: "Сделай краткое содержание",
    micRequired: "Нужно разрешение на микрофон.",
    countryAuto: "Язык выбран автоматически"
  },
  uk: {
    home: "Головна",
    chat: "Чат",
    studio: "AI Studio",
    voice: "Голосовий AI",
    docs: "Документи",
    profile: "Профіль",
    hello: "Привіт",
    subtitle: "Що хочете створити сьогодні?",
    startChat: "Почати AI чат",
    recent: "Останні",
    all: "Усі ›",
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
    quick: "Швидкі команди",
    today: "СЬОГОДНІ",
    ready: "LuxAI готовий. Що хочете зробити?",
    imageCreate: "Створити зображення",
    imageDesc: "Створення зображень з тексту",
    photoEdit: "Редагувати фото",
    photoDesc: "Завантажити та змінити фото",
    logo: "Створити логотип",
    logoDesc: "Професійний логотип",
    avatar: "AI Аватар",
    avatarDesc: "Створити власний аватар",
    bgRemove: "Видалити фон",
    bgRemoveDesc: "Видалити фон з фото",
    upscale: "HD покращення",
    upscaleDesc: "Покращити якість зображення",
    banner: "Створити банер",
    bannerDesc: "Банер для соцмереж",
    video: "Створити відео",
    videoDesc: "Підготувати ідею або prompt для відео",
    promptTitle: "Напишіть prompt",
    promptPlaceholder: "Що хочете створити?",
    docsSubtitle: "Аналіз і короткий зміст PDF",
    docsHint: "Можна завантажити PDF, TXT, DOCX",
    lastDocs: "Останні документи",
    messages: "Повідомлення",
    images: "Зображення",
    lang: "Мова",
    history: "Історія чату",
    plan: "Моя підписка",
    referral: "Реферальна програма",
    earn: "ЗАРОБИТИ",
    settings: "Мова та налаштування",
    clearHistory: "Очистити історію",
    noHistory: "Історії поки немає",
    admin: "Адмін панель",
    adminSub: "Відстеження користувачів і дій",
    users: "Користувачі",
    detail: "Деталі",
    totalUsers: "Усього користувачів",
    online: "Онлайн",
    adminMessages: "Повідомлення",
    photos: "Фото",
    loading: "Завантаження",
    upgrade: "Оновити план",
    unlimited: "Безлімітні повідомлення",
    imageGeneration: "Створення зображень",
    bigPdf: "Підтримка великих PDF",
    priority: "Пріоритетна відповідь",
    noAds: "Без реклами",
    qLogo: "Створи мені логотип",
    qInvest: "Дай інвестиційну ідею",
    qTranslate: "Переклади англійською",
    qEdit: "Відредагуй це зображення",
    qSummary: "Зроби короткий зміст",
    micRequired: "Потрібен дозвіл на мікрофон.",
    countryAuto: "Мову обрано автоматично"
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
let recorder = null;
let chunks = [];
let timer = null;
let seconds = 0;

const state = {
  page: "home",
  lang: detectInitialLang()
};

const app = document.getElementById("app");
const modalRoot = document.getElementById("modal-root");

const storageKey = "luxai_history_" + (user.id || "guest");
let history = JSON.parse(localStorage.getItem(storageKey) || "[]");

function detectInitialLang() {
  const saved = localStorage.getItem("luxai_lang");
  if (saved && I18N[saved]) return saved;

  const raw = String(user.language_code || navigator.language || "").toLowerCase();
  if (raw.startsWith("ru")) return "ru";
  if (raw.startsWith("uk")) return "uk";
  if (raw.startsWith("en")) return "en";
  if (raw.startsWith("tr")) return "tr";
  return "en";
}

function langByCountry(country) {
  if (!country) return "";
  const c = String(country).toUpperCase();
  if (["RU", "BY", "KZ", "KG"].includes(c)) return "ru";
  if (c === "UA") return "uk";
  if (c === "TR") return "tr";
  if (["US", "GB", "AE", "CA", "AU", "NZ"].includes(c)) return "en";
  return "";
}

function L(key) {
  return (I18N[state.lang] || I18N.en)[key] || I18N.en[key] || key;
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

function escapeAttr(str) {
  return String(str).replace(/'/g, "\\'");
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
    const saved = localStorage.getItem("luxai_lang");

    if (!saved && countryLang && I18N[countryLang]) {
      state.lang = countryLang;
    }
  } catch (e) {}

  bindNav();
  applyDocumentLang();
  render();
}

function applyDocumentLang() {
  document.documentElement.lang = state.lang;
}

function bindNav() {
  document.querySelectorAll("[data-page]").forEach(btn => {
    btn.onclick = () => setPage(btn.dataset.page);
  });
}

function updateBottomNav() {
  const labels = {
    home: L("home"),
    chat: L("chat"),
    studio: L("studio"),
    profile: L("profile")
  };

  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.page === state.page);
    const small = btn.querySelector("small");
    if (small && labels[btn.dataset.page]) small.textContent = labels[btn.dataset.page];
  });
}

function setPage(page) {
  state.page = page;
  render();
}

function h(html) {
  app.innerHTML = html;
}

function render() {
  applyDocumentLang();
  updateBottomNav();

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
      ${toolCard("💬", L("chat"), L("ready"), "chat")}
      ${toolCard("🎨", L("studio"), `${L("imageCreate")} · ${L("avatar")} · ${L("logo")}`, "studio", "cyan")}
      ${toolCard("🎙", L("voice"), L("voiceHint"), "voice", "orange")}
      ${toolCard("📄", L("docs"), L("docsSubtitle"), "docs", "cyan")}
    </section>

    <div class="section-title">
      <h2>${L("recent")}</h2><small onclick="renderHistoryModal()">${L("all")}</small>
    </div>
    <div class="list">
      ${recentItem("🔥", L("logo"), L("recent"))}
      ${recentItem("💎", L("qInvest"), L("recent"))}
      ${recentItem("📄", L("qSummary"), L("recent"))}
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
      <div class="day-pill">${L("today")}</div>
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

  if (history.length) {
    history.slice(-30).forEach(item => {
      if (item.image) addImageToBox(item.role, item.image, item.text || "", false);
      else addMsgToBox(item.role, item.text || "", item.role === "ai", false);
    });
  } else {
    addMsgToBox("ai", `${L("hello")} ${displayName()}, ${L("ready")}`, true, false);
  }

  document.getElementById("photoInputHidden").onchange = handlePhotoUpload;
  document.getElementById("fileInputHidden").onchange = handleFileUpload;
}

function addMsgToBox(role, text, actions = role === "ai", save = true) {
  const box = document.getElementById("chatMessages");
  if (!box) return;

  const m = document.createElement("div");
  m.className = "msg " + role;
  m.innerHTML = `<div>${escapeHtml(text)}</div>`;

  if (actions && role === "ai") {
    const actionsBox = document.createElement("div");
    actionsBox.className = "actions";
    actionsBox.innerHTML = `<button class="small">${L("listen")}</button><button class="small">${L("copy")}</button>`;
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
    if (data.ok && data.audio) await new Audio(data.audio).play();
  } catch (e) {}

  if (btn && btn.textContent !== undefined) btn.textContent = old;
}

function renderStudio() {
  h(`
    <div class="header">
      <button class="back" onclick="setPage('home')">‹</button>
      <div><h1>${L("studio")}</h1><p>${L("subtitle")}</p></div>
      <button class="icon-btn" onclick="openQuick()">✦</button>
    </div>

    <section class="grid">
      ${studioButton("🎨", L("imageCreate"), L("imageDesc"), `${L("imageCreate")}: `)}
      ${studioUpload("🖼", L("photoEdit"), L("photoDesc"))}
      ${studioButton("🏆", L("logo"), L("logoDesc"), `${L("logo")}: `)}
      ${studioButton("👤", L("avatar"), L("avatarDesc"), `${L("avatar")}: `)}
      ${studioButton("✂", L("bgRemove"), L("bgRemoveDesc"), `${L("bgRemove")}: `)}
      ${studioButton("✨", L("upscale"), L("upscaleDesc"), `${L("upscale")}: `)}
      ${studioButton("🧾", L("banner"), L("bannerDesc"), `${L("banner")}: `)}
      ${studioButton("🎬", L("video"), L("videoDesc"), `${L("video")}: `)}
    </section>

    <input id="studioPhotoInput" type="file" accept="image/*" style="display:none" />

    <div class="section-title">
      <h2>${L("promptTitle")}</h2>
    </div>

    <div class="chat-input" style="position:static;transform:none;width:100%;margin-top:12px">
      <input id="studioPrompt" placeholder="${L("promptPlaceholder")}" />
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

  const text = input.value.trim();
  setPage("chat");

  setTimeout(() => {
    const chatInput = document.getElementById("chatInput");
    chatInput.value = text;
    sendMessage(false);
  }, 50);
}

async function handlePhotoUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;

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
      <div style="text-align:center"><h1>${L("voice")}</h1><p>${L("voiceHint")}</p></div>
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
    addChatMessage("ai", L("micRequired"), false);
  }
}

function renderDocs() {
  h(`
    <div class="header">
      <button class="back" onclick="setPage('home')">‹</button>
      <div><h1>${L("docs")}</h1><p>${L("docsSubtitle")}</p></div>
      <span></span>
    </div>

    <div class="upload-box" onclick="document.getElementById('docsFileInput').click()">
      <div>
        <div style="font-size:36px">▧</div>
        <strong>${L("uploadPdf")}</strong>
        <p>${L("docsHint")}</p>
        <button class="primary-btn" style="height:44px;width:160px">${L("chooseFile")}</button>
      </div>
    </div>

    <input id="docsFileInput" type="file" style="display:none" />

    <div class="section-title">
      <h2>${L("lastDocs")}</h2>
    </div>
    <div class="list">
      ${recentItem("📄", "AI Report.pdf", "2.4 MB")}
      ${recentItem("📄", "Financial Analysis.pdf", "1.8 MB")}
      ${recentItem("📄", "Marketing Strategy.pdf", "3.2 MB")}
    </div>
  `);

  document.getElementById("docsFileInput").onchange = handleFileUpload;
}

function renderProfile() {
  const adminButton = serverConfig.isAdmin
    ? `<div class="menu-row" onclick="setPage('admin')"><span>🛡 ${L("admin")}</span><span>›</span></div>`
    : "";

  h(`
    <div class="profile-head">
      <div class="avatar"><div></div></div>
      <h2>${escapeHtml(displayName())}</h2>
      <span class="badge">👑 Premium</span>
    </div>

    <div class="stats">
      <div class="stat"><small>${L("messages")}</small><strong>${history.filter(x => x.role === "user").length}</strong></div>
      <div class="stat"><small>${L("images")}</small><strong>${history.filter(x => x.image).length}</strong></div>
      <div class="stat"><small>${L("lang")}</small><strong>${state.lang.toUpperCase()}</strong></div>
    </div>

    <div class="menu-card">
      <div class="menu-row" onclick="renderHistoryModal()"><span>▣ ${L("history")}</span><span>›</span></div>
      <div class="menu-row" onclick="openPlan()"><span>♕ ${L("plan")}</span><span>›</span></div>
      <div class="menu-row"><span>⌘ ${L("referral")}</span><span class="badge">${L("earn")}</span></div>
      <div class="menu-row" onclick="openLang()"><span>⚙ ${L("settings")}</span><span>${state.lang.toUpperCase()}</span></div>
      ${adminButton}
      <div class="menu-row" onclick="clearHistory()"><span>🗑 ${L("clearHistory")}</span><span>›</span></div>
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
      <div><h1>${L("admin")}</h1><p>${L("adminSub")}</p></div>
      <button class="icon-btn" onclick="loadAdmin()">↻</button>
    </div>
    <div id="adminStats" class="grid"></div>
    <div class="section-title"><h2>${L("users")}</h2></div>
    <div id="adminUsers" class="list"></div>
    <div class="section-title"><h2>${L("detail")}</h2></div>
    <div id="adminDetail" class="list"></div>
  `);

  loadAdmin();
}

async function loadAdmin() {
  const stats = document.getElementById("adminStats");
  const users = document.getElementById("adminUsers");
  const detail = document.getElementById("adminDetail");

  if (!stats || !users || !detail) return;

  stats.innerHTML = `<div class="card"><h3>${L("loading")}</h3><p>...</p></div>`;
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
      <div class="card"><h3>${Object.keys(map).length}</h3><p>${L("totalUsers")}</p></div>
      <div class="card"><h3>${onlineCount}</h3><p>${L("online")}</p></div>
      <div class="card"><h3>${actions.length}</h3><p>${L("adminMessages")}</p></div>
      <div class="card"><h3>${photos.length}</h3><p>${L("photos")}</p></div>
    `;

    Object.values(map).forEach((u, i) => {
      const btn = document.createElement("div");
      btn.className = "list-item";
      btn.innerHTML = `<div class="mini">👤</div><div><strong>${i + 1}. ${escapeHtml(u.name)}</strong><small>${u.actions.length} ${L("adminMessages")} · ${u.photos.length} ${L("photos")}</small></div>`;
      btn.onclick = () => {
        detail.innerHTML = `<div class="card"><h3>${escapeHtml(u.name)}</h3><p>${u.actions.length} ${L("adminMessages")} · ${u.photos.length} ${L("photos")}</p></div>`;

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
  if (!I18N[code]) return;

  state.lang = code;
  localStorage.setItem("luxai_lang", code);

  modalRoot.innerHTML = "";

  if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred("light");

  updateBottomNav();
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
            <div>✓ ${L("unlimited")}</div>
            <div>✓ ${L("imageGeneration")}</div>
            <div>✓ ${L("bigPdf")}</div>
            <div>✓ ${L("priority")}</div>
            <div>✓ ${L("noAds")}</div>
          </div>
          <button class="primary-btn">${L("upgrade")}</button>
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
          <button onclick="quick('${escapeAttr(L("qLogo"))}')">▣ ${L("qLogo")}</button>
          <button onclick="quick('${escapeAttr(L("qInvest"))}')">▣ ${L("qInvest")}</button>
          <button onclick="quick('${escapeAttr(L("qTranslate"))}')">▣ ${L("qTranslate")}</button>
          <button onclick="quick('${escapeAttr(L("qEdit"))}')">▣ ${L("qEdit")}</button>
          <button onclick="quick('${escapeAttr(L("qSummary"))}')">▣ ${L("qSummary")}</button>
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
          <h2>${L("history")}</h2>
          <button class="close" onclick="modalRoot.innerHTML=''">×</button>
        </div>
        <div class="list">${items || `<div class="list-item"><div class="mini">ℹ️</div><div><strong>${L("noHistory")}</strong></div></div>`}</div>
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
