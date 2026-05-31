const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); }

const I18N = {
  tr:{home:'Ana Sayfa',chat:'Sohbet',image:'Görsel Oluştur',photo:'Fotoğraf Düzenle',voice:'Sesli Asistan',files:'Dosya Analizi',history:'Geçmiş',admin:'Admin Panel',welcome:'Merhaba',tagline:'Geleceği birlikte şekillendirelim.',start:'Sohbete Başla',input:'Bir mesaj yazın...',imageShort:'Görsel<br>Oluştur',photoShort:'Fotoğraf<br>Düzenle',voiceShort:'Sesli<br>Asistan',fileShort:'Dosya<br>Analizi',create:'Oluştur',apply:'Uygula ve Kaydet',photoUpload:'Fotoğraf yükle',fileUpload:'Dosya yükle',filePick:'Dosya Seç',analysis:'Analiz Sonucu',analysisText:'Dosya yüklediğinde özet ve analiz burada görünür.',wait:'Düşünüyorum...',photoReady:'Fotoğraf yüklendi. Şimdi ne yapmak istediğini yaz.',listen:'🔊 Dinle',copy:'📋 Kopyala',record:'Dinliyorum...',voiceHint:'Konuşmak için mikrofona dokunun',trans:'Ses yazıya çevriliyor...',err:'Bir hata oluştu.'},
  ru:{home:'Главная',chat:'Чат',image:'Создать изображение',photo:'Редактировать фото',voice:'Голосовой ассистент',files:'Анализ файлов',history:'История',admin:'Админ панель',welcome:'Здравствуйте',tagline:'Давайте создадим будущее вместе.',start:'Начать чат',input:'Напишите сообщение...',imageShort:'Создать<br>изображение',photoShort:'Редактировать<br>фото',voiceShort:'Голосовой<br>ассистент',fileShort:'Анализ<br>файлов',create:'Создать',apply:'Применить и сохранить',photoUpload:'Загрузить фото',fileUpload:'Загрузить файл',filePick:'Выбрать файл',analysis:'Результат анализа',analysisText:'После загрузки файла анализ появится здесь.',wait:'Думаю...',photoReady:'Фото загружено. Теперь напишите, что нужно сделать.',listen:'🔊 Слушать',copy:'📋 Копировать',record:'Слушаю...',voiceHint:'Нажмите микрофон и говорите',trans:'Распознаю голос...',err:'Произошла ошибка.'},
  uk:{home:'Головна',chat:'Чат',image:'Створити зображення',photo:'Редагувати фото',voice:'Голосовий асистент',files:'Аналіз файлів',history:'Історія',admin:'Адмін панель',welcome:'Вітаю',tagline:'Створімо майбутнє разом.',start:'Почати чат',input:'Напишіть повідомлення...',imageShort:'Створити<br>зображення',photoShort:'Редагувати<br>фото',voiceShort:'Голосовий<br>асистент',fileShort:'Аналіз<br>файлів',create:'Створити',apply:'Застосувати і зберегти',photoUpload:'Завантажити фото',fileUpload:'Завантажити файл',filePick:'Вибрати файл',analysis:'Результат аналізу',analysisText:'Після завантаження файла аналіз буде тут.',wait:'Думаю...',photoReady:'Фото завантажено. Тепер напишіть, що потрібно зробити.',listen:'🔊 Слухати',copy:'📋 Копіювати',record:'Слухаю...',voiceHint:'Натисніть мікрофон і говоріть',trans:'Розпізнаю голос...',err:'Сталася помилка.'},
  en:{home:'Home',chat:'Chat',image:'Create Image',photo:'Edit Photo',voice:'Voice Assistant',files:'File Analysis',history:'History',admin:'Admin Panel',welcome:'Hello',tagline:'Let’s shape the future together.',start:'Start Chat',input:'Write a message...',imageShort:'Create<br>Image',photoShort:'Edit<br>Photo',voiceShort:'Voice<br>Assistant',fileShort:'File<br>Analysis',create:'Create',apply:'Apply & Save',photoUpload:'Upload photo',fileUpload:'Upload file',filePick:'Choose file',analysis:'Analysis Result',analysisText:'Upload a file and the summary will appear here.',wait:'Thinking...',photoReady:'Photo uploaded. Now type what you want to change.',listen:'🔊 Listen',copy:'📋 Copy',record:'Listening...',voiceHint:'Tap microphone and speak',trans:'Transcribing voice...',err:'Something went wrong.'}
};

const user = tg?.initDataUnsafe?.user || {};
let serverConfig = {};
let currentPhotoData = '';
let currentPhotoFileName = '';
let currentLang = detectLang();

function detectLang() {
  const tgLang = String(user.language_code || '').toLowerCase();
  const navLang = String(navigator.language || '').toLowerCase();
  const raw = tgLang || navLang;
  if (raw.startsWith('ru')) return 'ru';
  if (raw.startsWith('uk')) return 'uk';
  if (raw.startsWith('en')) return 'en';
  if (raw.startsWith('tr')) return 'tr';
  return 'en';
}

function langByCountry(country) {
  if (!country) return '';
  if (['RU','BY','KZ','KG'].includes(country)) return 'ru';
  if (country === 'UA') return 'uk';
  if (country === 'TR') return 'tr';
  if (['US','GB','AE','CA','AU'].includes(country)) return 'en';
  return '';
}

const $ = id => document.getElementById(id);
const T = () => I18N[currentLang] || I18N.en;

const drawer = $('drawer'), backdrop = $('backdrop'), messages = $('messages'), input = $('input');
const photoInput = $('photoInput'), fileInput = $('fileInput'), voiceModal = $('voiceModal'), voiceRing = $('voiceRing'), voiceBtn = $('voiceBtn');

function displayName() {
  return user.first_name || user.username || 'User';
}

function applyLang() {
  const t = T();
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (t[key]) el.innerHTML = t[key];
  });
  $('welcomeText').textContent = `${t.welcome}, ${displayName()}! 👋`;
  $('tagline').textContent = t.tagline;
  $('startChatBtn').textContent = t.start;
  input.placeholder = t.input;
  $('photoBoxText').textContent = t.photoUpload;
  $('fileDropTitle').textContent = t.fileUpload;
  $('filePickText').textContent = t.filePick;
  $('analysisTitle').textContent = t.analysis;
  $('analysisText').textContent = t.analysisText;
  $('voiceStatus').textContent = t.record;
  $('voiceHint').textContent = t.voiceHint;
  $('avatar').textContent = (displayName()[0] || 'L').toUpperCase();
}

async function init() {
  try {
    const res = await fetch('/api/config', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user})});
    serverConfig = await res.json();
    const countryLang = langByCountry(serverConfig.country);
    if (!user.language_code && countryLang) currentLang = countryLang;
    if (serverConfig.isAdmin) document.querySelectorAll('.admin-only').forEach(x => x.style.display = 'block');
  } catch(e) {}
  applyLang();
  restoreHistory();
  routeFromStartParam();
}
init();

function openDrawer(){ drawer.classList.add('open'); backdrop.classList.add('open'); }
function closeDrawer(){ drawer.classList.remove('open'); backdrop.classList.remove('open'); }
$('menuBtn').onclick = openDrawer; backdrop.onclick = closeDrawer;

function setScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const screen = $(`screen-${name}`);
  if (screen) screen.classList.add('active');
  document.querySelectorAll('[data-screen]').forEach(b => b.classList.toggle('active', b.dataset.screen === name));
  closeDrawer();
  if (name === 'voice') openVoice();
  if (name === 'admin') loadAdmin();
  if (name === 'history') renderHistory();
}
document.addEventListener('click', e => {
  const btn = e.target.closest('[data-screen]');
  if (btn) setScreen(btn.dataset.screen);
});

const storageKey = 'luxai_history_' + (user.id || 'guest');
let history = JSON.parse(localStorage.getItem(storageKey) || '[]');
function saveHistory(){ localStorage.setItem(storageKey, JSON.stringify(history.slice(-300))); }
function addHistory(item){ history.push({...item, time: Date.now()}); saveHistory(); }

function addMsg(role, text, actions = role === 'ai', save = true) {
  setScreen('chat');
  const m = document.createElement('div'); m.className = 'msg ' + role;
  const b = document.createElement('div'); b.className = 'bubble';
  const c = document.createElement('div'); c.textContent = text; b.appendChild(c);
  if (actions) {
    const a = document.createElement('div'); a.className = 'actions';
    const listen = document.createElement('button'); listen.className='small'; listen.textContent=T().listen; listen.onclick=()=>speak(text, listen);
    const copy = document.createElement('button'); copy.className='small'; copy.textContent=T().copy; copy.onclick=()=>navigator.clipboard?.writeText(text);
    a.append(listen, copy); b.appendChild(a);
  }
  m.appendChild(b); messages.appendChild(m); messages.scrollTop = messages.scrollHeight;
  if (save) addHistory({role, text});
  return m;
}

function addImage(role, src, caption='', save=true) {
  setScreen('chat');
  const m = document.createElement('div'); m.className = 'msg ' + role;
  const b = document.createElement('div'); b.className='bubble';
  const img = document.createElement('img'); img.src=src; img.style.maxWidth='100%'; img.style.borderRadius='14px'; img.style.display='block';
  b.appendChild(img);
  if (caption) { const p=document.createElement('div'); p.style.marginTop='10px'; p.textContent=caption; b.appendChild(p); }
  m.appendChild(b); messages.appendChild(m); messages.scrollTop = messages.scrollHeight;
  if (save) addHistory({role, text:caption || '[image]', image:src});
}

async function send(autoSpeak=false) {
  const text = input.value.trim();
  if (!text) return;
  addMsg('user', text, false);
  input.value = '';
  const loading = addMsg('ai', T().wait, false, false);
  try {
    const res = await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text,lang:currentLang,user})});
    const data = await res.json();
    loading.remove();
    if (!data.ok) return addMsg('ai', data.error || T().err);
    if (data.type === 'image' && data.image) addImage('ai', data.image, data.reply || '');
    else { addMsg('ai', data.reply || ''); if(autoSpeak && data.reply) speak(data.reply, {textContent:''}); }
  } catch(e) { loading.querySelector('.bubble div').textContent = T().err; }
}
$('sendBtn').onclick = () => send(false);
input.addEventListener('keydown', e => { if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); send(false); }});
$('startChatBtn').onclick = () => { setScreen('chat'); input.focus(); };

async function speak(text, btn) {
  const old = btn.textContent; if(btn.textContent !== undefined) btn.textContent='⏳';
  try {
    const res = await fetch('/api/tts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text})});
    const data = await res.json();
    if (data.ok) await new Audio(data.audio).play();
  } catch(e) {}
  if(btn.textContent !== undefined) btn.textContent = old;
}

$('createImageBtn').onclick = () => {
  const p = $('imagePrompt').value.trim();
  if (!p) return $('imagePrompt').focus();
  input.value = `Görsel oluştur: ${p}`;
  send(false);
};

$('imageBtn').onclick = () => photoInput.click();
$('quickPhoto')?.addEventListener('click', () => photoInput.click());
$('attachBtn').onclick = () => fileInput.click();
$('filePickBtn').onclick = () => fileInput.click();
$('fileDrop').onclick = () => fileInput.click();

$('photoBox').onclick = () => photoInput.click();
photoInput.onchange = () => {
  const file = photoInput.files?.[0]; if(!file) return;
  currentPhotoFileName = file.name;
  const reader = new FileReader();
  reader.onload = async () => {
    currentPhotoData = reader.result;
    $('photoBox').innerHTML = `<img src="${currentPhotoData}" alt="">`;
    setScreen('photo');
    const loading = addMsg('ai', T().wait, false, false);
    try {
      const res = await fetch('/api/upload-photo',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({imageBase64:currentPhotoData,mime:file.type||'image/jpeg',user,lang:currentLang})});
      const data = await res.json();
      loading.querySelector('.bubble div').textContent = data.ok ? T().photoReady : (data.error || T().err);
    } catch(e) { loading.querySelector('.bubble div').textContent = T().err; }
  };
  reader.readAsDataURL(file);
};

$('applyPhotoBtn').onclick = () => {
  const p = $('photoPrompt').value.trim();
  if (!p) return $('photoPrompt').focus();
  input.value = p;
  send(false);
};

fileInput.onchange = () => {
  const file = fileInput.files?.[0]; if(!file) return;
  setScreen('files');
  $('fileDrop').innerHTML = `📄<b>${file.name}</b><span>${Math.round(file.size/1024)} KB</span>`;
  const loading = addMsg('ai', T().wait, false, false);
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const res = await fetch('/api/upload-file',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({fileBase64:reader.result,fileName:file.name,mime:file.type||'',user,lang:currentLang})});
      const data = await res.json();
      loading.remove();
      const reply = data.ok ? data.reply : (data.error || T().err);
      $('fileResult').innerHTML = `<b>${T().analysis}</b><p>${reply}</p>`;
      addMsg('ai', reply);
    } catch(e) { loading.querySelector('.bubble div').textContent = T().err; }
  };
  reader.readAsDataURL(file);
};

let recorder=null, chunks=[], timer=null, seconds=0;
function openVoice(){ voiceModal.classList.add('open'); $('voiceStatus').textContent=T().record; $('voiceHint').textContent=T().voiceHint; }
function closeVoice(){ voiceModal.classList.remove('open'); }
$('voiceClose').onclick = closeVoice;
$('micBtn').onclick = openVoice;
$('voiceBtn').onclick = toggleRecord;

async function toggleRecord() {
  try {
    if (recorder && recorder.state === 'recording') { recorder.stop(); return; }
    const stream = await navigator.mediaDevices.getUserMedia({audio:true});
    chunks=[]; seconds=0; $('voiceTime').textContent='00:00';
    recorder = new MediaRecorder(stream);
    recorder.ondataavailable = e => { if(e.data.size>0) chunks.push(e.data); };
    recorder.onstop = async () => {
      stream.getTracks().forEach(x=>x.stop());
      voiceRing.classList.remove('recording'); clearInterval(timer);
      const blob = new Blob(chunks,{type:recorder.mimeType||'audio/webm'});
      const reader = new FileReader();
      reader.onload = async () => {
        const loading = addMsg('ai', T().trans, false, false);
        try {
          const res = await fetch('/api/transcribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({audioBase64:reader.result,mime:blob.type,user,lang:currentLang})});
          const data = await res.json();
          loading.remove();
          if (!data.ok) return addMsg('ai', data.error || T().err);
          input.value = data.transcript || '';
          closeVoice();
          await send(true);
        } catch(e) { loading.querySelector('.bubble div').textContent=T().err; }
      };
      reader.readAsDataURL(blob);
    };
    recorder.start(); voiceRing.classList.add('recording');
    timer=setInterval(()=>{ seconds++; $('voiceTime').textContent = '00:' + String(seconds).padStart(2,'0'); },1000);
  } catch(e) { addMsg('ai','Microphone permission is required.',false); }
}

function renderHistory() {
  const box = $('historyList'); box.innerHTML = '';
  if (!history.length) { box.innerHTML = '<div class="history-item">No history yet.</div>'; return; }
  history.slice().reverse().forEach(h => {
    const item = document.createElement('div'); item.className='history-item';
    item.textContent = `${new Date(h.time).toLocaleString()} — ${h.role}: ${h.text || '[image]'}`;
    box.appendChild(item);
  });
}
$('clearHistory').onclick = () => { history=[]; saveHistory(); renderHistory(); messages.innerHTML=''; };
$('chatClear').onclick = () => { messages.innerHTML=''; };

async function loadAdmin() {
  const stats = $('adminStats'), users = $('adminUsers'), detail = $('adminDetail');
  stats.innerHTML = '<div class="stat-card"><span>Loading</span><strong>...</strong></div>';
  users.innerHTML=''; detail.innerHTML='';
  try {
    const res = await fetch(`/admin-data?userId=${encodeURIComponent(user.id||'')}&username=${encodeURIComponent(user.username||'')}`);
    const data = await res.json();
    if (!data.ok) { stats.innerHTML = `<div class="stat-card"><span>Error</span><strong>${data.error}</strong></div>`; return; }
    const actions = data.lastActions || [];
    const photos = data.photos || [];
    const map = {};
    actions.forEach(a => { const k=a.user||a.username||a.userId||'Unknown'; if(!map[k]) map[k]={name:k,actions:[],photos:[]}; map[k].actions.push(a); });
    photos.forEach(p => { const k=p.user||p.username||'Unknown'; if(!map[k]) map[k]={name:k,actions:[],photos:[]}; map[k].photos.push(p); });
    const onlineCount = Object.values(map).filter(u => u.actions.some(a => Date.now() - new Date(a.time).getTime() < 10*60*1000)).length;
    stats.innerHTML = `
      <div class="stat-card"><span>Total Users</span><strong>${Object.keys(map).length}</strong></div>
      <div class="stat-card"><span>Online</span><strong>${onlineCount}</strong></div>
      <div class="stat-card"><span>Messages</span><strong>${actions.length}</strong></div>
      <div class="stat-card"><span>Photos</span><strong>${photos.length}</strong></div>`;
    Object.values(map).forEach((u,i)=>{
      const btn=document.createElement('button'); btn.className='admin-user-card';
      btn.innerHTML=`<b>${i+1}. ${u.name}</b><span>${u.actions.length} sohbet · ${u.photos.length} fotoğraf</span>`;
      btn.onclick=()=> {
        detail.innerHTML = `<div class="admin-card"><b>${u.name}</b><p>${u.actions.length} sohbet · ${u.photos.length} fotoğraf</p></div>`;
        u.photos.forEach(p => { if(p.image){ const div=document.createElement('div'); div.className='admin-card'; div.innerHTML=`<img src="${p.image}" style="width:100%;border-radius:12px"><p>${p.caption||''}</p>`; detail.appendChild(div); }});
        u.actions.forEach((a,idx)=>{ const div=document.createElement('div'); div.className='admin-card'; div.textContent=`${idx+1}. ${a.time||''} | ${a.type||''}\n${a.text||''}`; detail.appendChild(div); });
      };
      users.appendChild(btn);
    });
  } catch(e) { stats.innerHTML = `<div class="stat-card"><span>Error</span><strong>${T().err}</strong></div>`; }
}
$('refreshAdmin').onclick = loadAdmin;

document.querySelectorAll('.drawer-link,.bottom button').forEach(btn => btn.onclick = () => setScreen(btn.dataset.screen));
$('newChat').onclick = () => { messages.innerHTML=''; history=[]; saveHistory(); setScreen('chat'); };
function routeFromStartParam(){ const sp = tg?.initDataUnsafe?.start_param || new URLSearchParams(location.search).get('mode') || ''; if(sp) setScreen(sp === 'studio' ? 'image' : sp); }
setTimeout(routeFromStartParam, 500);
