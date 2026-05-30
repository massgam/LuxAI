const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
}

const dict = {
  tr: {
    welcome: "Hoş geldin",
    sub: "Oluştur, düzenle, analiz et ve LuxAI ile konuş.",
    ph: "LuxAI'ye istediğini yaz...",
    ready: "Merhaba, ben LuxAI Pro. Nasıl yardımcı olabilirim?",
    wait: "Düşünüyorum...",
    err: "Bir hata oluştu. Railway logs kısmını kontrol et.",
    new: "Yeni sohbet başladı.",
    lang: "Türkçe"
  },
  ru: {
    welcome: "Добро пожаловать",
    sub: "Создавай, редактируй, анализируй и общайся с LuxAI.",
    ph: "Напишите LuxAI что угодно...",
    ready: "Здравствуйте, я LuxAI Pro. Чем могу помочь?",
    wait: "Думаю...",
    err: "Произошла ошибка. Проверь Railway logs.",
    new: "Новый чат начат.",
    lang: "Русский"
  },
  uk: {
    welcome: "Ласкаво просимо",
    sub: "Створюй, редагуй, аналізуй і спілкуйся з LuxAI.",
    ph: "Напишіть LuxAI що завгодно...",
    ready: "Вітаю, я LuxAI Pro. Чим можу допомогти?",
    wait: "Думаю...",
    err: "Сталася помилка. Перевір Railway logs.",
    new: "Новий чат розпочато.",
    lang: "Українська"
  },
  en: {
    welcome: "Welcome",
    sub: "Create, edit, analyze and chat with LuxAI.",
    ph: "Ask LuxAI anything...",
    ready: "Hi, I am LuxAI Pro. How can I help?",
    wait: "Thinking...",
    err: "Something went wrong. Check Railway logs.",
    new: "New chat started.",
    lang: "English"
  }
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

document.getElementById("welcome").textContent = `${t.welcome} ${user.first_name || ""}`.trim();
document.getElementById("welcomeSub").textContent = t.sub;
document.getElementById("input").placeholder = t.ph;
document.getElementById("langBtn").textContent = "🌐 " + t.lang;

const displayName = user.username
  ? "@" + user.username
  : [user.first_name, user.last_name].filter(Boolean).join(" ");

document.getElementById("userName").textContent = displayName || "LuxAI User";
document.getElementById("userLang").textContent = t.lang;
document.getElementById("avatar").textContent = (user.first_name || user.username || "L")[0].toUpperCase();

document.getElementById("menuBtn").onclick = () => sidebar.classList.toggle("open");

function add(role, text) {
  const m = document.createElement("div");
  m.className = "msg " + role;
  const b = document.createElement("div");
  b.className = "bubble";
  b.textContent = text;
  m.appendChild(b);
  messages.appendChild(m);
  messages.scrollTop = messages.scrollHeight;
  return m;
}

add("ai", t.ready);

document.getElementById("newChat").onclick = () => {
  messages.innerHTML = "";
  add("ai", t.new);
};

async function send() {
  const value = input.value.trim();
  if (!value) return;

  add("user", value);
  input.value = "";

  const loading = add("ai", t.wait);

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: value,
        lang,
        user
      })
    });

    const data = await res.json();
    loading.querySelector(".bubble").textContent = data.ok ? data.reply : (data.error || t.err);
  } catch (e) {
    loading.querySelector(".bubble").textContent = t.err;
  }
}

document.getElementById("sendBtn").onclick = send;
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    send();
  }
});

document.querySelectorAll(".quick button").forEach((b) => {
  b.onclick = () => {
    input.value = b.dataset.prompt;
    send();
  };
});

document.querySelectorAll(".nav").forEach((b) => {
  b.onclick = () => {
    document.querySelectorAll(".nav").forEach((x) => x.classList.remove("active"));
    b.classList.add("active");
    sidebar.classList.remove("open");
    document.getElementById("title").textContent = b.innerText.trim();
  };
});

document.getElementById("attachBtn").onclick = () => document.getElementById("fileInput").click();
document.getElementById("imageBtn").onclick = () => document.getElementById("photoInput").click();
document.getElementById("micBtn").onclick = () => add("ai", t.ready);
