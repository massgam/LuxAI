const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); }

const dict = {
  tr: { welcome:"Hoş geldin", sub:"Oluştur, düzenle, analiz et ve LuxAI ile konuş.", ph:"LuxAI'ye istediğini yaz...", ready:"Merhaba, ben LuxAI Pro. Nasıl yardımcı olabilirim?", wait:"Düşünüyorum...", err:"Bir hata oluştu. Railway logs kısmını kontrol et.", new:"Yeni sohbet başladı.", lang:"Türkçe", photoReady:"Fotoğraf yüklendi. Şimdi ne yapmak istediğini yaz.", adminTitle:"Admin Panel", listen:"🔊 Dinle", copy:"📋 Kopyala" },
  ru: { welcome:"Добро пожаловать", sub:"Создавай, редактируй, анализируй и общайся с LuxAI.", ph:"Напишите LuxAI что угодно...", ready:"Здравствуйте, я LuxAI Pro. Чем могу помочь?", wait:"Думаю...", err:"Произошла ошибка. Проверь Railway logs.", new:"Новый чат начат.", lang:"Русский", photoReady:"Фото загружено. Теперь напишите, что нужно сделать.", adminTitle:"Админ панель", listen:"🔊 Слушать", copy:"📋 Копировать" },
  uk: { welcome:"Ласкаво просимо", sub:"Створюй, редагуй, аналізуй і спілкуйся з LuxAI.", ph:"Напишіть LuxAI що завгодно...", ready:"Вітаю, я LuxAI Pro. Чим можу допомогти?", wait:"Думаю...", err:"Сталася помилка. Перевір Railway logs.", new:"Новий чат розпочато.", lang:"Українська", photoReady:"Фото завантажено. Тепер напишіть, що потрібно зробити.", adminTitle:"Адмін панель", listen:"🔊 Слухати", copy:"📋 Копіювати" },
  en: { welcome:"Welcome", sub:"Create, edit, analyze and chat with LuxAI.", ph:"Ask LuxAI anything...", ready:"Hi, I am LuxAI Pro. How can I help?", wait:"Thinking...", err:"Something went wrong. Check Railway logs.", new:"New chat started.", lang:"English", photoReady:"Photo uploaded. Now type what you want to change.", adminTitle:"Admin Panel", listen:"🔊 Listen", copy:"📋 Copy" }
};

const user = tg?.initDataUnsafe?.user || {};
let lang = (user.language_code || "tr").toLowerCase();
if (lang.startsWith("ru")) lang = "ru";
else if (lang.startsWith("uk")) lang = "uk";
else if (lang.startsWith("en")) lang = "en";
else lang = "tr";
const t = dict[lang];

const sidebar = document.getElementById("sidebar");
const messages = document.getElementById("messages");
const input = document.getElementById("input");
const photoInput = document.getElementById("photoInput");
const fileInput = document.getElementById("fileInput");

document.getElementById("welcome").textContent = `${t.welcome} ${user.first_name || ""}`.trim();
document.getElementById("welcomeSub").textContent = t.sub;
document.getElementById("input").placeholder = t.ph;
document.getElementById("langBtn").textContent = "🌐 " + t.lang;

const displayName = user.username ? "@" + user.username : [user.first_name, user.last_name].filter(Boolean).join(" ");
document.getElementById("userName").textContent = displayName || "LuxAI User";
document.getElementById("userLang").textContent = t.lang;
document.getElementById("avatar").textContent = (user.first_name || user.username || "L")[0].toUpperCase();

document.getElementById("menuBtn").onclick = () => sidebar.classList.toggle("open");

function add(role, text, withActions = role === "ai") {
  const m = document.createElement("div");
  m.className = "msg " + role;
  const b = document.createElement("div");
  b.className = "bubble";
  const content = document.createElement("div");
  content.textContent = text;
  b.appendChild(content);

  if (withActions && text) {
    const actions = document.createElement("div");
    actions.className = "actions";
    const listen = document.createElement("button");
    listen.className = "small";
    listen.textContent = t.listen;
    listen.onclick = () => speak(text, listen);
    const copy = document.createElement("button");
    copy.className = "small";
    copy.textContent = t.copy;
    copy.onclick = () => navigator.clipboard?.writeText(text);
    actions.appendChild(listen);
    actions.appendChild(copy);
    b.appendChild(actions);
  }

  m.appendChild(b);
  messages.appendChild(m);
  messages.scrollTop = messages.scrollHeight;
  return m;
}

function addImage(role, src, caption = "") {
  const m = document.createElement("div");
  m.className = "msg " + role;
  const b = document.createElement("div");
  b.className = "bubble";
  const img = document.createElement("img");
  img.src = src;
  img.style.maxWidth = "100%";
  img.style.borderRadius = "16px";
  img.style.display = "block";
  img.style.marginBottom = caption ? "10px" : "0";
  b.appendChild(img);
  if (caption) {
    const c = document.createElement("div");
    c.textContent = caption;
    b.appendChild(c);
  }
  m.appendChild(b);
  messages.appendChild(m);
  messages.scrollTop = messages.scrollHeight;
}

async function speak(text, btn) {
  const old = btn.textContent;
  btn.textContent = "⏳";
  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || "TTS failed");
    const audio = new Audio(data.audio);
    await audio.play();
  } catch (e) {
    alert(t.err);
  } finally {
    btn.textContent = old;
  }
}

function renderAdmin(data) {
  messages.innerHTML = "";
  add("ai", `${t.adminTitle}\n\nUsers: ${data?.stats?.users?.length || 0}\nMessages: ${data?.stats?.messages || 0}\nErrors: ${data?.stats?.errors || 0}\nDB: ${data?.db?.enabled ? "ON" : "OFF"}`, false);
  const actions = data?.lastActions || data?.db?.actions || [];
  actions.slice(0, 40).forEach(a => add("ai", `${a.time || a.created_at || ""} | ${a.user || a.username || ""} | ${a.type || ""}\n${a.text || ""}`, false));
  const photos = data?.photos || [];
  photos.slice(0, 20).forEach(p => { if (p.image) addImage("ai", p.image, `${p.time || ""} | ${p.user || ""}\n${p.caption || ""}`); });
}

async function loadAdmin() {
  const loading = add("ai", t.wait, false);
  try {
    const res = await fetch(`/admin-data?userId=${encodeURIComponent(user.id || "")}`);
    const data = await res.json();
    loading.remove();
    if (!data.ok && data.error) return add("ai", data.error, false);
    renderAdmin(data);
  } catch (e) {
    loading.querySelector(".bubble div").textContent = t.err;
  }
}

add("ai", t.ready);

document.getElementById("newChat").onclick = () => {
  messages.innerHTML = "";
  add("ai", t.new);
};

async function send() {
  const value = input.value.trim();
  if (!value) return;
  add("user", value, false);
  input.value = "";
  const loading = add("ai", t.wait, false);

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: value, lang, user })
    });
    const data = await res.json();
    loading.remove();
    if (!data.ok) return add("ai", data.error || t.err);
    if (data.type === "image" && data.image) addImage("ai", data.image, data.reply || "");
    else add("ai", data.reply || "");
  } catch (e) {
    loading.querySelector(".bubble div").textContent = t.err;
  }
}

document.getElementById("sendBtn").onclick = send;
input.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    send();
  }
});

document.querySelectorAll(".quick button").forEach(b => {
  b.onclick = () => { input.value = b.dataset.prompt; send(); };
});

document.querySelectorAll(".nav").forEach(b => {
  b.onclick = () => {
    document.querySelectorAll(".nav").forEach(x => x.classList.remove("active"));
    b.classList.add("active");
    sidebar.classList.remove("open");
    const mode = b.dataset.mode;
    document.getElementById("title").textContent = b.innerText.trim();
    if (mode === "admin") loadAdmin();
  };
});

document.getElementById("attachBtn").onclick = () => fileInput.click();
document.getElementById("imageBtn").onclick = () => photoInput.click();

photoInput.addEventListener("change", async () => {
  const file = photoInput.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async () => {
    const dataUrl = reader.result;
    addImage("user", dataUrl, file.name);
    const loading = add("ai", t.wait, false);
    try {
      const res = await fetch("/api/upload-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: dataUrl, mime: file.type || "image/jpeg", user, lang })
      });
      const data = await res.json();
      loading.querySelector(".bubble div").textContent = data.ok ? t.photoReady : (data.error || t.err);
    } catch (e) {
      loading.querySelector(".bubble div").textContent = t.err;
    }
  };
  reader.readAsDataURL(file);
});

fileInput.addEventListener("change", async () => {
  const file = fileInput.files?.[0];
  if (!file) return;
  const loading = add("ai", t.wait, false);
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const res = await fetch("/api/upload-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileBase64: reader.result, fileName: file.name, mime: file.type || "", user, lang })
      });
      const data = await res.json();
      loading.remove();
      add("ai", data.ok ? data.reply : (data.error || t.err));
    } catch (e) {
      loading.querySelector(".bubble div").textContent = t.err;
    }
  };
  reader.readAsDataURL(file);
});

document.getElementById("micBtn").onclick = () => add("ai", t.ready);
