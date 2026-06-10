const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); }

const I18N = {
  tr: {
    home:"Ana Sayfa", chat:"Sohbet", studio:"AI Studio", voice:"Sesli AI", docs:"Belgeler", profile:"Profil",
    hello:"Merhaba", subtitle:"Bugün ne yapmak istersin?", startChat:"AI Sohbete Başla", recent:"Son Kullanılanlar",
    all:"Tümü ›", input:"Mesaj yaz...", thinking:"Düşünüyorum...", err:"Bir hata oluştu.", listen:"🔊 Dinle", copy:"📋 Kopyala",
    photoReady:"Fotoğraf yüklendi. Şimdi ne yapmak istediğini yaz.", uploadPdf:"PDF veya dosya yükleyin", chooseFile:"Dosya Seç",
    trans:"Ses yazıya çevriliyor...", record:"Dinliyorum...", voiceHint:"Konuşmak için mikrofona dokunun",
    language:"Dil Seçin", quick:"Hızlı Komutlar", today:"BUGÜN", ready:"LuxAI hazır. Ne yapmak istersin?",
    imageCreate:"Görsel Oluştur", imageDesc:"Metinden görsel üret", photoEdit:"Fotoğraf Düzenle", photoDesc:"Fotoğraf yükle ve düzenle",
    logo:"Logo Tasarla", logoDesc:"Profesyonel logo oluştur", avatar:"AI Avatar", avatarDesc:"Kendine özel avatar üret",
    bgRemove:"Arka Plan Kaldır", bgRemoveDesc:"Fotoğraftan arka planı kaldır", upscale:"HD Yükselt", upscaleDesc:"Görselleri daha kaliteli yap",
    banner:"Banner Oluştur", bannerDesc:"Sosyal medya bannerı oluştur", video:"Video Oluştur", videoDesc:"Video fikri veya prompt hazırla",
    promptTitle:"Prompt Yaz", promptPlaceholder:"Ne oluşturmak istiyorsun?", docsSubtitle:"PDF analiz ve özet", docsHint:"PDF, TXT, DOCX yükleyebilirsin",
    lastDocs:"Son Belgelerim", messages:"Mesaj", images:"Görsel", lang:"Dil", history:"Sohbet Geçmişi",
    settings:"Dil & Bölge", clearHistory:"Geçmişi Temizle", noHistory:"Henüz geçmiş yok", admin:"Admin Panel",
    adminSub:"Kullanıcı ve işlem takibi", users:"Kullanıcılar", detail:"Detay", totalUsers:"Toplam Kullanıcı", online:"Online",
    adminMessages:"Mesajlar", photos:"Fotoğraflar", loading:"Yükleniyor", qLogo:"Bana logo tasarla", qInvest:"Yatırım fikri ver",
    qTranslate:"İngilizce çevir", qEdit:"Bu resmi düzenle", qSummary:"Özet çıkar", micRequired:"Mikrofon izni gerekli.",
    memory:"Memory AI", phone:"Telefon Numarası", savePhone:"Telefonu Kaydet", phonePlaceholder:"+971 50 000 0000",
    phoneSaved:"Telefon kaydedildi", country:"Ülke", device:"Cihaz", lastSeen:"Son Giriş", pdfCount:"PDF", voiceCount:"Ses",
    username:"Kullanıcı adı", telegramId:"Telegram ID", search:"Ara"
  },
  en: {
    home:"Home", chat:"Chat", studio:"AI Studio", voice:"Voice AI", docs:"Documents", profile:"Profile",
    hello:"Hello", subtitle:"What would you like to do today?", startChat:"Start AI Chat", recent:"Recent",
    all:"All ›", input:"Write a message...", thinking:"Thinking...", err:"Something went wrong.", listen:"🔊 Listen", copy:"📋 Copy",
    photoReady:"Photo uploaded. Now type what you want to change.", uploadPdf:"Upload PDF or file", chooseFile:"Choose File",
    trans:"Transcribing voice...", record:"Listening...", voiceHint:"Tap microphone and speak",
    language:"Choose Language", quick:"Quick Commands", today:"TODAY", ready:"LuxAI is ready. What would you like to do?",
    imageCreate:"Create Image", imageDesc:"Generate images from text", photoEdit:"Edit Photo", photoDesc:"Upload and edit a photo",
    logo:"Logo Maker", logoDesc:"Create a professional logo", avatar:"AI Avatar", avatarDesc:"Create your custom avatar",
    bgRemove:"Remove Background", bgRemoveDesc:"Remove background from photo", upscale:"HD Upscale", upscaleDesc:"Improve image quality",
    banner:"Create Banner", bannerDesc:"Create a social media banner", video:"Create Video", videoDesc:"Prepare a video idea or prompt",
    promptTitle:"Write Prompt", promptPlaceholder:"What do you want to create?", docsSubtitle:"PDF analysis and summary", docsHint:"You can upload PDF, TXT, DOCX",
    lastDocs:"Recent Documents", messages:"Messages", images:"Images", lang:"Language", history:"Chat History",
    settings:"Language & Region", clearHistory:"Clear History", noHistory:"No history yet", admin:"Admin Panel",
    adminSub:"User and action tracking", users:"Users", detail:"Detail", totalUsers:"Total Users", online:"Online",
    adminMessages:"Messages", photos:"Photos", loading:"Loading", qLogo:"Design a logo for me", qInvest:"Give me an investment idea",
    qTranslate:"Translate to English", qEdit:"Edit this image", qSummary:"Summarize", micRequired:"Microphone permission is required.",
    memory:"Memory AI", phone:"Phone Number", savePhone:"Save Phone", phonePlaceholder:"+1 555 000 0000",
    phoneSaved:"Phone saved", country:"Country", device:"Device", lastSeen:"Last Seen", pdfCount:"PDF", voiceCount:"Voice",
    username:"Username", telegramId:"Telegram ID", search:"Search"
  },
  ru: {
    home:"Главная", chat:"Чат", studio:"AI Studio", voice:"Голосовой AI", docs:"Документы", profile:"Профиль",
    hello:"Привет", subtitle:"Что хотите сделать сегодня?", startChat:"Начать AI чат", recent:"Недавние",
    all:"Все ›", input:"Напишите сообщение...", thinking:"Думаю...", err:"Произошла ошибка.", listen:"🔊 Слушать", copy:"📋 Копировать",
    photoReady:"Фото загружено. Теперь напишите, что нужно изменить.", uploadPdf:"Загрузите PDF или файл", chooseFile:"Выбрать файл",
    trans:"Распознаю голос...", record:"Слушаю...", voiceHint:"Нажмите микрофон и говорите",
    language:"Выберите язык", quick:"Быстрые команды", today:"СЕГОДНЯ", ready:"LuxAI готов. Что хотите сделать?",
    imageCreate:"Создать изображение", imageDesc:"Создание изображений из текста", photoEdit:"Редактировать фото", photoDesc:"Загрузить и изменить фото",
    logo:"Создать логотип", logoDesc:"Профессиональный логотип", avatar:"AI Аватар", avatarDesc:"Создать личный аватар",
    bgRemove:"Удалить фон", bgRemoveDesc:"Удалить фон с фото", upscale:"HD улучшение", upscaleDesc:"Улучшить качество изображения",
    banner:"Создать баннер", bannerDesc:"Баннер для соцсетей", video:"Создать видео", videoDesc:"Подготовить идею или prompt для видео",
    promptTitle:"Напишите prompt", promptPlaceholder:"Что хотите создать?", docsSubtitle:"Анализ и краткое содержание PDF", docsHint:"Можно загрузить PDF, TXT, DOCX",
    lastDocs:"Последние документы", messages:"Сообщения", images:"Изображения", lang:"Язык", history:"История чата",
    settings:"Язык и регион", clearHistory:"Очистить историю", noHistory:"Истории пока нет", admin:"Админ панель",
    adminSub:"Отслеживание пользователей и действий", users:"Пользователи", detail:"Детали", totalUsers:"Всего пользователей", online:"Онлайн",
    adminMessages:"Сообщения", photos:"Фотографии", loading:"Загрузка", qLogo:"Создай мне логотип", qInvest:"Дай инвестиционную идею",
    qTranslate:"Переведи на английский", qEdit:"Отредактируй это изображение", qSummary:"Сделай краткое содержание", micRequired:"Нужно разрешение на микрофон.",
    memory:"Memory AI", phone:"Номер телефона", savePhone:"Сохранить телефон", phonePlaceholder:"+7 900 000 0000",
    phoneSaved:"Телефон сохранён", country:"Страна", device:"Устройство", lastSeen:"Последний вход", pdfCount:"PDF", voiceCount:"Голос",
    username:"Имя пользователя", telegramId:"Telegram ID", search:"Поиск"
  },
  uk: {
    home:"Головна", chat:"Чат", studio:"AI Studio", voice:"Голосовий AI", docs:"Документи", profile:"Профіль",
    hello:"Привіт", subtitle:"Що хочете зробити сьогодні?", startChat:"Почати AI чат", recent:"Останні",
    all:"Усі ›", input:"Напишіть повідомлення...", thinking:"Думаю...", err:"Сталася помилка.", listen:"🔊 Слухати", copy:"📋 Копіювати",
    photoReady:"Фото завантажено. Тепер напишіть, що потрібно змінити.", uploadPdf:"Завантажте PDF або файл", chooseFile:"Обрати файл",
    trans:"Розпізнаю голос...", record:"Слухаю...", voiceHint:"Натисніть мікрофон і говоріть",
    language:"Оберіть мову", quick:"Швидкі команди", today:"СЬОГОДНІ", ready:"LuxAI готовий. Що хочете зробити?",
    imageCreate:"Створити зображення", imageDesc:"Створення зображень з тексту", photoEdit:"Редагувати фото", photoDesc:"Завантажити та змінити фото",
    logo:"Створити логотип", logoDesc:"Професійний логотип", avatar:"AI Аватар", avatarDesc:"Створити власний аватар",
    bgRemove:"Видалити фон", bgRemoveDesc:"Видалити фон з фото", upscale:"HD покращення", upscaleDesc:"Покращити якість зображення",
    banner:"Створити банер", bannerDesc:"Банер для соцмереж", video:"Створити відео", videoDesc:"Підготувати ідею або prompt для відео",
    promptTitle:"Напишіть prompt", promptPlaceholder:"Що хочете створити?", docsSubtitle:"Аналіз і короткий зміст PDF", docsHint:"Можна завантажити PDF, TXT, DOCX",
    lastDocs:"Останні документи", messages:"Повідомлення", images:"Зображення", lang:"Мова", history:"Історія чату",
    settings:"Мова та регіон", clearHistory:"Очистити історію", noHistory:"Історії поки немає", admin:"Адмін панель",
    adminSub:"Відстеження користувачів і дій", users:"Користувачі", detail:"Деталі", totalUsers:"Усього користувачів", online:"Онлайн",
    adminMessages:"Повідомлення", photos:"Фото", loading:"Завантаження", qLogo:"Створи мені логотип", qInvest:"Дай інвестиційну ідею",
    qTranslate:"Переклади англійською", qEdit:"Відредагуй це зображення", qSummary:"Зроби короткий зміст", micRequired:"Потрібен дозвіл на мікрофон.",
    memory:"Memory AI", phone:"Номер телефону", savePhone:"Зберегти телефон", phonePlaceholder:"+380 00 000 0000",
    phoneSaved:"Телефон збережено", country:"Країна", device:"Пристрій", lastSeen:"Останній вхід", pdfCount:"PDF", voiceCount:"Голос",
    username:"Ім’я користувача", telegramId:"Telegram ID", search:"Пошук"
  }
};

const user = tg?.initDataUnsafe?.user || { first_name:"Alex", username:"alex", id:"guest", language_code:navigator.language || "tr" };
let serverConfig = {};
let currentPhotoData = "";
let recorder = null, chunks = [], timer = null, seconds = 0;
const app = document.getElementById("app");
const modalRoot = document.getElementById("modal-root");
const storageKey = "luxai_history_" + (user.id || "guest");
let history = JSON.parse(localStorage.getItem(storageKey) || "[]");
const state = { page:"home", lang:detectInitialLang(), adminData:null, adminSearch:"" };

function detectInitialLang(){ const saved=localStorage.getItem("luxai_lang"); if(saved&&I18N[saved]) return saved; const raw=String(user.language_code||navigator.language||"").toLowerCase(); if(raw.startsWith("ru"))return"ru"; if(raw.startsWith("uk"))return"uk"; if(raw.startsWith("en"))return"en"; if(raw.startsWith("tr"))return"tr"; return"en"; }
function langByCountry(country){ const c=String(country||"").toUpperCase(); if(["RU","BY","KZ","KG"].includes(c))return"ru"; if(c==="UA")return"uk"; if(c==="TR")return"tr"; if(["US","GB","AE","CA","AU","NZ"].includes(c))return"en"; return""; }
function L(k){ return (I18N[state.lang]||I18N.en)[k] || I18N.en[k] || k; }
function displayName(){ return user.first_name || user.username || "User"; }
function escapeHtml(s){ return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m])); }
function escapeAttr(s){ return String(s??"").replace(/'/g,"\\'"); }
function saveHistory(){ localStorage.setItem(storageKey, JSON.stringify(history.slice(-300))); }
function addHistory(item){ history.push({...item,time:Date.now()}); saveHistory(); }

async function init(){
  try{
    const res=await fetch("/api/config",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({user})});
    serverConfig=await res.json();
    const cLang=langByCountry(serverConfig.country);
    if(!localStorage.getItem("luxai_lang") && cLang && I18N[cLang]) state.lang=cLang;
  }catch(e){}
  bindNav(); render();
}
function bindNav(){ document.querySelectorAll("[data-page]").forEach(btn=>btn.onclick=()=>setPage(btn.dataset.page)); }
function updateBottomNav(){ const labels={home:L("home"),chat:L("chat"),studio:L("studio"),profile:L("profile")}; document.querySelectorAll(".nav-btn").forEach(btn=>{btn.classList.toggle("active",btn.dataset.page===state.page); const small=btn.querySelector("small"); if(small&&labels[btn.dataset.page]) small.textContent=labels[btn.dataset.page];});}
function setPage(page){ state.page=page; render(); }
function h(html){ app.innerHTML=html; }
function render(){ document.documentElement.lang=state.lang; updateBottomNav(); if(state.page==="home")return renderHome(); if(state.page==="chat")return renderChat(); if(state.page==="studio")return renderStudio(); if(state.page==="voice")return renderVoice(); if(state.page==="docs")return renderDocs(); if(state.page==="profile")return renderProfile(); if(state.page==="admin")return renderAdmin(); }
function toolCard(icon,title,desc,page,color=""){ return `<div class="card" onclick="setPage('${page}')"><div class="tile-icon ${color}">${icon}</div><h3>${title}</h3><p>${desc}</p></div>`; }
function recentItem(icon,title,time){ return `<div class="list-item"><div class="mini">${icon}</div><div><strong>${title}</strong><small>${time}</small></div></div>`; }

function renderHome(){
  h(`<div class="status-row"><div class="brand">LuxAI <span class="badge">PRO</span></div><button class="icon-btn" onclick="openLang()">🌍</button></div>
  <section class="hero"><h1>${L("hello")}, ${escapeHtml(displayName())}! 👋</h1><p>${L("subtitle")}</p><div class="orb-wrap"><div class="orb"></div></div><button class="primary-btn" onclick="setPage('chat')">${L("startChat")} <span class="arrow">→</span></button></section>
  <section class="grid">${toolCard("💬",L("chat"),L("ready"),"chat")}${toolCard("🎨",L("studio"),`${L("imageCreate")} · ${L("avatar")} · ${L("logo")}`,"studio","cyan")}${toolCard("🎙",L("voice"),L("voiceHint"),"voice","orange")}${toolCard("📄",L("docs"),L("docsSubtitle"),"docs","cyan")}</section>
  <div class="section-title"><h2>${L("recent")}</h2><small onclick="renderHistoryModal()">${L("all")}</small></div><div class="list">${recentItem("🔥",L("logo"),L("recent"))}${recentItem("💎",L("qInvest"),L("recent"))}${recentItem("📄",L("qSummary"),L("recent"))}</div>`);
}

function renderChat(){
  h(`<div class="header"><button class="back" onclick="setPage('home')">‹</button><div style="text-align:center"><h1>LuxAI</h1></div><button class="back" onclick="openQuick()">⋮</button></div>
  <div class="chat-wrap" id="chatMessages"><div class="day-pill">${L("today")}</div></div>
  <div class="chat-input"><button class="round" onclick="document.getElementById('fileInputHidden').click()">⌘</button><input id="chatInput" placeholder="${L("input")}" onkeydown="if(event.key==='Enter') sendMessage(false)" /><button class="round" onclick="document.getElementById('photoInputHidden').click()">🖼</button><button class="round purple" onclick="sendMessage(false)">⌁</button></div>
  <input id="photoInputHidden" type="file" accept="image/*" style="display:none" /><input id="fileInputHidden" type="file" style="display:none" />`);
  if(history.length){ history.slice(-30).forEach(item=> item.image ? addImageToBox(item.role,item.image,item.text||"",false) : addMsgToBox(item.role,item.text||"",item.role==="ai",false)); } else addMsgToBox("ai",`${L("hello")} ${displayName()}, ${L("ready")}`,true,false);
  document.getElementById("photoInputHidden").onchange=handlePhotoUpload;
  document.getElementById("fileInputHidden").onchange=handleFileUpload;
}
function addMsgToBox(role,text,actions=role==="ai",save=true){ const box=document.getElementById("chatMessages"); if(!box)return; const m=document.createElement("div"); m.className="msg "+role; m.innerHTML=`<div>${escapeHtml(text)}</div>`; if(actions&&role==="ai"){ const a=document.createElement("div"); a.className="actions"; a.innerHTML=`<button class="small">${L("listen")}</button><button class="small">${L("copy")}</button>`; const b=a.querySelectorAll("button"); b[0].onclick=()=>speak(text,b[0]); b[1].onclick=()=>navigator.clipboard?.writeText(text); m.appendChild(a);} box.appendChild(m); box.scrollTop=box.scrollHeight; if(save)addHistory({role,text}); return m; }
function addImageToBox(role,src,caption="",save=true){ const box=document.getElementById("chatMessages"); if(!box)return; const m=document.createElement("div"); m.className="msg "+role; const img=document.createElement("img"); img.src=src; img.style.maxWidth="100%"; img.style.borderRadius="14px"; img.style.display="block"; m.appendChild(img); if(caption){const p=document.createElement("div");p.style.marginTop="10px";p.textContent=caption;m.appendChild(p);} box.appendChild(m); box.scrollTop=box.scrollHeight; if(save)addHistory({role,text:caption||"[image]",image:src});}
function addChatMessage(role,text,actions=role==="ai",save=true){ setPage("chat"); setTimeout(()=>addMsgToBox(role,text,actions,save),30); }

async function sendMessage(autoSpeak=false){
  const input=document.getElementById("chatInput"); if(!input||!input.value.trim())return; const text=input.value.trim(); addMsgToBox("user",text,false); input.value=""; const loading=addMsgToBox("ai",L("thinking"),false,false);
  try{ const res=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:text,lang:state.lang,user})}); const data=await res.json(); loading.remove(); if(!data.ok)return addMsgToBox("ai",data.error||L("err")); if(data.type==="image"&&data.image)addImageToBox("ai",data.image,data.reply||""); else{addMsgToBox("ai",data.reply||""); if(autoSpeak&&data.reply)speak(data.reply,{textContent:""});}}catch(e){loading.textContent=L("err");}
}
async function speak(text,btn){ const old=btn?.textContent; if(btn&&btn.textContent!==undefined)btn.textContent="⏳"; try{ const res=await fetch("/api/tts",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text,lang:state.lang})}); const data=await res.json(); if(data.ok&&data.audio) await new Audio(data.audio).play(); }catch(e){} if(btn&&btn.textContent!==undefined)btn.textContent=old; }

function renderStudio(){
  h(`<div class="header"><button class="back" onclick="setPage('home')">‹</button><div><h1>${L("studio")}</h1><p>${L("subtitle")}</p></div><button class="icon-btn" onclick="openQuick()">✦</button></div>
  <section class="grid">${studioButton("🎨",L("imageCreate"),L("imageDesc"),`${L("imageCreate")}: `)}${studioUpload("🖼",L("photoEdit"),L("photoDesc"))}${studioButton("🏆",L("logo"),L("logoDesc"),`${L("logo")}: `)}${studioButton("👤",L("avatar"),L("avatarDesc"),`${L("avatar")}: `)}${studioButton("✂",L("bgRemove"),L("bgRemoveDesc"),`${L("bgRemove")}: `)}${studioButton("✨",L("upscale"),L("upscaleDesc"),`${L("upscale")}: `)}${studioButton("🧾",L("banner"),L("bannerDesc"),`${L("banner")}: `)}${studioButton("🎬",L("video"),L("videoDesc"),`${L("video")}: `)}</section>
  <input id="studioPhotoInput" type="file" accept="image/*" style="display:none" /><div class="section-title"><h2>${L("promptTitle")}</h2></div><div class="chat-input" style="position:static;transform:none;width:100%;margin-top:12px"><input id="studioPrompt" placeholder="${L("promptPlaceholder")}" /><button class="round purple" onclick="sendStudioPrompt()">⌁</button></div>`);
  document.getElementById("studioPhotoInput").onchange=handlePhotoUpload;
}
function studioButton(icon,title,desc,prefix){ return `<div class="card" onclick="fillStudioPrompt('${escapeAttr(prefix)}')"><div class="tile-icon">${icon}</div><h3>${title}</h3><p>${desc}</p></div>`;}
function studioUpload(icon,title,desc){ return `<div class="card" onclick="document.getElementById('studioPhotoInput').click()"><div class="tile-icon cyan">${icon}</div><h3>${title}</h3><p>${desc}</p></div>`;}
function fillStudioPrompt(prefix){ const i=document.getElementById("studioPrompt"); if(i){i.value=prefix;i.focus();}}
function sendStudioPrompt(){ const i=document.getElementById("studioPrompt"); if(!i||!i.value.trim())return; const text=i.value.trim(); setPage("chat"); setTimeout(()=>{const ci=document.getElementById("chatInput"); ci.value=text; sendMessage(false);},50);}

async function handlePhotoUpload(event){ const file=event.target.files?.[0]; if(!file)return; const reader=new FileReader(); reader.onload=async()=>{ currentPhotoData=reader.result; setPage("chat"); setTimeout(async()=>{ addImageToBox("user",currentPhotoData,file.name); const loading=addMsgToBox("ai",L("thinking"),false,false); try{ const res=await fetch("/api/upload-photo",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({imageBase64:currentPhotoData,mime:file.type||"image/jpeg",user,lang:state.lang})}); const data=await res.json(); loading.textContent=data.ok?L("photoReady"):(data.error||L("err")); }catch(e){loading.textContent=L("err");}},80);}; reader.readAsDataURL(file);}
async function handleFileUpload(event){ const file=event.target.files?.[0]; if(!file)return; setPage("chat"); const reader=new FileReader(); reader.onload=async()=>{ setTimeout(async()=>{ addMsgToBox("user",`📄 ${file.name}`,false); const loading=addMsgToBox("ai",L("thinking"),false,false); try{ const res=await fetch("/api/upload-file",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({fileBase64:reader.result,fileName:file.name,mime:file.type||"",user,lang:state.lang})}); const data=await res.json(); loading.remove(); addMsgToBox("ai",data.ok?data.reply:(data.error||L("err"))); }catch(e){loading.textContent=L("err");}},80);}; reader.readAsDataURL(file);}

function renderVoice(){ h(`<div class="header"><button class="back" onclick="setPage('home')">‹</button><div style="text-align:center"><h1>${L("voice")}</h1><p>${L("voiceHint")}</p></div><span></span></div><section class="voice-page"><div class="voice-orb" id="voiceRing"><div class="wave">▂▆█▆▂</div></div><h2 id="voiceStatus">${L("record")}</h2><p id="voiceTime" style="color:var(--muted)">00:00</p><div class="voice-actions"><button class="round" onclick="setPage('chat')">⌗</button><button class="big-record" id="voiceBtn">●</button><button class="round" onclick="openLang()">🌍</button></div></section>`); document.getElementById("voiceBtn").onclick=toggleRecord; }
async function toggleRecord(){ try{ if(recorder&&recorder.state==="recording"){recorder.stop();return;} const stream=await navigator.mediaDevices.getUserMedia({audio:true}); chunks=[]; seconds=0; const timeEl=document.getElementById("voiceTime"), ring=document.getElementById("voiceRing"); if(timeEl)timeEl.textContent="00:00"; recorder=new MediaRecorder(stream); recorder.ondataavailable=e=>{if(e.data.size>0)chunks.push(e.data)}; recorder.onstop=async()=>{stream.getTracks().forEach(x=>x.stop()); if(ring)ring.classList.remove("recording"); clearInterval(timer); const blob=new Blob(chunks,{type:recorder.mimeType||"audio/webm"}); const reader=new FileReader(); reader.onload=async()=>{ setPage("chat"); setTimeout(async()=>{ const loading=addMsgToBox("ai",L("trans"),false,false); try{ const res=await fetch("/api/transcribe",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({audioBase64:reader.result,mime:blob.type,user,lang:state.lang})}); const data=await res.json(); loading.remove(); if(!data.ok)return addMsgToBox("ai",data.error||L("err")); const ci=document.getElementById("chatInput"); ci.value=data.transcript||""; await sendMessage(true); }catch(e){loading.textContent=L("err");}},80);}; reader.readAsDataURL(blob);}; recorder.start(); if(ring)ring.classList.add("recording"); timer=setInterval(()=>{seconds++; const t=document.getElementById("voiceTime"); if(t)t.textContent="00:"+String(seconds).padStart(2,"0");},1000);}catch(e){addChatMessage("ai",L("micRequired"),false);}}
function renderDocs(){ h(`<div class="header"><button class="back" onclick="setPage('home')">‹</button><div><h1>${L("docs")}</h1><p>${L("docsSubtitle")}</p></div><span></span></div><div class="upload-box" onclick="document.getElementById('docsFileInput').click()"><div><div style="font-size:36px">▧</div><strong>${L("uploadPdf")}</strong><p>${L("docsHint")}</p><button class="primary-btn" style="height:44px;width:160px">${L("chooseFile")}</button></div></div><input id="docsFileInput" type="file" style="display:none" /><div class="section-title"><h2>${L("lastDocs")}</h2></div><div class="list">${recentItem("📄","AI Report.pdf","2.4 MB")}${recentItem("📄","Financial Analysis.pdf","1.8 MB")}${recentItem("📄","Marketing Strategy.pdf","3.2 MB")}</div>`); document.getElementById("docsFileInput").onchange=handleFileUpload;}

function renderProfile(){
  const adminButton=serverConfig.isAdmin?`<div class="menu-row" onclick="setPage('admin')"><span>🛡 ${L("admin")}</span><span>›</span></div>`:"";
  h(`<div class="profile-head"><div class="avatar"><div></div></div><h2>${escapeHtml(displayName())}</h2><span class="badge">LuxAI Pro</span></div>
  <div class="stats"><div class="stat"><small>${L("messages")}</small><strong>${history.filter(x=>x.role==="user").length}</strong></div><div class="stat"><small>${L("images")}</small><strong>${history.filter(x=>x.image).length}</strong></div><div class="stat"><small>${L("lang")}</small><strong>${state.lang.toUpperCase()}</strong></div></div>
  <div class="menu-card"><div class="menu-row" onclick="renderHistoryModal()"><span>▣ ${L("history")}</span><span>›</span></div><div class="menu-row"><span>🧠 ${L("memory")}</span><span>›</span></div><div class="menu-row" onclick="openLang()"><span>⚙ ${L("settings")}</span><span>${state.lang.toUpperCase()}</span></div><div class="menu-row" onclick="openPhoneModal()"><span>📞 ${L("phone")}</span><span>›</span></div>${adminButton}<div class="menu-row" onclick="clearHistory()"><span>🗑 ${L("clearHistory")}</span><span>›</span></div></div>`);
}
function clearHistory(){ history=[]; saveHistory(); render(); }

function renderAdmin(){
  h(`<div class="header"><button class="back" onclick="setPage('profile')">‹</button><div><h1>${L("admin")}</h1><p>${L("adminSub")}</p></div><button class="icon-btn" onclick="loadAdmin()">↻</button></div><input id="adminSearch" class="admin-search" placeholder="${L("search")}" value="${escapeHtml(state.adminSearch)}" oninput="state.adminSearch=this.value; renderAdminUsers()" /><div id="adminStats" class="grid"></div><div class="section-title"><h2>${L("users")}</h2></div><div id="adminUsers" class="list"></div><div class="section-title"><h2>${L("detail")}</h2></div><div id="adminDetail" class="list"></div>`);
  loadAdmin();
}
async function loadAdmin(){ const stats=document.getElementById("adminStats"); if(!stats)return; stats.innerHTML=`<div class="card"><h3>${L("loading")}</h3><p>...</p></div>`; try{ const res=await fetch(`/admin-data?userId=${encodeURIComponent(user.id||"")}&username=${encodeURIComponent(user.username||"")}`); const data=await res.json(); if(!data.ok){stats.innerHTML=`<div class="card"><h3>Error</h3><p>${escapeHtml(data.error||L("err"))}</p></div>`;return;} state.adminData=data; renderAdminStats(); renderAdminUsers(); }catch(e){stats.innerHTML=`<div class="card"><h3>Error</h3><p>${L("err")}</p></div>`;}}
function renderAdminStats(){ const stats=document.getElementById("adminStats"); const d=state.adminData||{}; const users=d.users||d.stats?.users||[]; const online=users.filter(u=>Date.now()-new Date(u.last_seen||u.webapp_last_seen||0).getTime()<10*60*1000).length; const totalMsg=users.reduce((s,u)=>s+Number(u.text_count||u.messages||0),0); const totalImg=users.reduce((s,u)=>s+Number(u.image_count||u.photo_count||0),0); const totalFile=users.reduce((s,u)=>s+Number(u.file_count||0),0); stats.innerHTML=`<div class="card"><h3>${users.length}</h3><p>${L("totalUsers")}</p></div><div class="card"><h3>${online}</h3><p>${L("online")}</p></div><div class="card"><h3>${totalMsg}</h3><p>${L("adminMessages")}</p></div><div class="card"><h3>${totalImg}</h3><p>${L("images")}</p></div><div class="card"><h3>${totalFile}</h3><p>${L("pdfCount")}</p></div>`; }
function renderAdminUsers(){ const usersBox=document.getElementById("adminUsers"), detail=document.getElementById("adminDetail"); if(!usersBox)return; const data=state.adminData||{}; let users=data.users||data.stats?.users||[]; const q=String(state.adminSearch||"").toLowerCase(); if(q){ users=users.filter(u=>JSON.stringify(u).toLowerCase().includes(q)); } usersBox.innerHTML=""; if(detail)detail.innerHTML=""; users.forEach((u,i)=>{ const name=[u.first_name,u.last_name].filter(Boolean).join(" ")||u.username||u.id||"Unknown"; const div=document.createElement("div"); div.className="list-item"; div.innerHTML=`<div class="mini">👤</div><div style="flex:1"><strong>${i+1}. ${escapeHtml(name)}</strong><small>@${escapeHtml(String(u.username||"").replace("@",""))} · ${escapeHtml(u.country||"Unknown")} · ${escapeHtml(u.language_code||"Unknown")} · ${escapeHtml(u.device||"Unknown")}</small></div>`; div.onclick=()=>showAdminUser(u); usersBox.appendChild(div);});}
function showAdminUser(u){ const detail=document.getElementById("adminDetail"); if(!detail)return; const name=[u.first_name,u.last_name].filter(Boolean).join(" ")||u.username||u.id||"Unknown"; detail.innerHTML=`<div class="card"><h3>${escapeHtml(name)}</h3><p>${L("username")}: @${escapeHtml(String(u.username||"").replace("@",""))}</p><p>${L("telegramId")}: ${escapeHtml(u.id||"")}</p><p>${L("phone")}: ${escapeHtml(u.phone_number||"-")}</p><p>${L("country")}: ${escapeHtml(u.country||"Unknown")}</p><p>${L("lang")}: ${escapeHtml(u.language_code||"Unknown")}</p><p>${L("device")}: ${escapeHtml(u.device||"Unknown")}</p><p>${L("lastSeen")}: ${escapeHtml(u.last_seen||u.webapp_last_seen||"-")}</p><p>${L("messages")}: ${Number(u.text_count||u.messages||0)}</p><p>${L("images")}: ${Number(u.image_count||0)} · ${L("photos")}: ${Number(u.photo_count||0)}</p><p>${L("pdfCount")}: ${Number(u.file_count||0)} · ${L("voiceCount")}: ${Number(u.voice_count||0)}</p></div>`; }

function openLang(){ modalRoot.innerHTML=`<div class="modal-backdrop" onclick="closeModal(event)"><div class="modal"><div class="modal-head"><h2>${L("language")}</h2><button class="close" onclick="modalRoot.innerHTML=''">×</button></div>${langRow("tr","🇹🇷 Türkçe")}${langRow("en","🇬🇧 English")}${langRow("ru","🇷🇺 Русский")}${langRow("uk","🇺🇦 Українська")}</div></div>`;}
function langRow(code,label){ return `<div class="lang-row" onclick="setLang('${code}')"><span>${label}</span><span>${state.lang===code?"✓":""}</span></div>`;}
function setLang(code){ if(!I18N[code])return; state.lang=code; localStorage.setItem("luxai_lang",code); modalRoot.innerHTML=""; tg?.HapticFeedback?.impactOccurred("light"); render(); }
function openQuick(){ modalRoot.innerHTML=`<div class="modal-backdrop" onclick="closeModal(event)"><div class="modal"><div class="modal-head"><h2>${L("quick")}</h2><button class="close" onclick="modalRoot.innerHTML=''">×</button></div><div class="quick-list"><button onclick="quick('${escapeAttr(L("qLogo"))}')">▣ ${L("qLogo")}</button><button onclick="quick('${escapeAttr(L("qInvest"))}')">▣ ${L("qInvest")}</button><button onclick="quick('${escapeAttr(L("qTranslate"))}')">▣ ${L("qTranslate")}</button><button onclick="quick('${escapeAttr(L("qEdit"))}')">▣ ${L("qEdit")}</button><button onclick="quick('${escapeAttr(L("qSummary"))}')">▣ ${L("qSummary")}</button></div></div></div>`;}
function quick(text){ modalRoot.innerHTML=""; setPage("chat"); setTimeout(()=>{const input=document.getElementById("chatInput"); if(input){input.value=text; input.focus();}},40);}
function openPhoneModal(){ modalRoot.innerHTML=`<div class="modal-backdrop" onclick="closeModal(event)"><div class="modal"><div class="modal-head"><h2>${L("phone")}</h2><button class="close" onclick="modalRoot.innerHTML=''">×</button></div><div class="quick-list"><input id="phoneInput" class="admin-search" placeholder="${L("phonePlaceholder")}" /><button class="primary-btn" onclick="savePhone()">${L("savePhone")}</button></div></div></div>`;}
async function savePhone(){ const val=document.getElementById("phoneInput")?.value?.trim(); if(!val)return; try{ const res=await fetch("/api/save-phone",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({user,phoneNumber:val})}); const data=await res.json(); if(data.ok){tg?.showAlert?.(L("phoneSaved")); modalRoot.innerHTML="";} else alert(data.error||L("err")); }catch(e){alert(L("err"));}}
function renderHistoryModal(){ const items=history.slice().reverse().slice(0,80).map(h=>`<div class="list-item"><div class="mini">${h.role==="user"?"👤":"🤖"}</div><div><strong>${new Date(h.time).toLocaleString()}</strong><small>${escapeHtml(h.text||"[image]")}</small></div></div>`).join(""); modalRoot.innerHTML=`<div class="modal-backdrop" onclick="closeModal(event)"><div class="modal"><div class="modal-head"><h2>${L("history")}</h2><button class="close" onclick="modalRoot.innerHTML=''">×</button></div><div class="list">${items||`<div class="list-item"><div class="mini">ℹ️</div><div><strong>${L("noHistory")}</strong></div></div>`}</div></div></div>`;}
function closeModal(e){ if(e.target.classList.contains("modal-backdrop"))modalRoot.innerHTML="";}

window.setPage=setPage; window.openLang=openLang; window.setLang=setLang; window.openQuick=openQuick; window.quick=quick; window.sendMessage=sendMessage; window.sendStudioPrompt=sendStudioPrompt; window.fillStudioPrompt=fillStudioPrompt; window.renderHistoryModal=renderHistoryModal; window.clearHistory=clearHistory; window.toggleRecord=toggleRecord; window.loadAdmin=loadAdmin; window.renderAdminUsers=renderAdminUsers; window.openPhoneModal=openPhoneModal; window.savePhone=savePhone; window.state=state;
init();
