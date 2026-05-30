const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  document.body.style.backgroundColor = tg.themeParams?.bg_color || '';
}

const sidebar = document.getElementById('sidebar');
const menuBtn = document.getElementById('menuBtn');
const chat = document.getElementById('chat');
const promptEl = document.getElementById('prompt');
const sendBtn = document.getElementById('sendBtn');
const screenTitle = document.getElementById('screenTitle');
const screenSub = document.getElementById('screenSub');
const userName = document.getElementById('userName');
const userLang = document.getElementById('userLang');
const avatar = document.getElementById('avatar');

const user = tg?.initDataUnsafe?.user;
if (user) {
  const name = user.username ? '@' + user.username : [user.first_name, user.last_name].filter(Boolean).join(' ');
  userName.textContent = name || 'Telegram User';
  userLang.textContent = user.language_code ? `Language: ${user.language_code}` : 'Auto language';
  avatar.textContent = (user.first_name || user.username || 'L')[0].toUpperCase();
}

menuBtn.addEventListener('click', () => sidebar.classList.toggle('open'));

document.querySelectorAll('.nav').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    sidebar.classList.remove('open');

    const mode = btn.dataset.mode;
    const titles = {
      chat: ['AI Chat', 'Talk naturally with LuxAI'],
      image: ['Image Studio', 'Create premium visuals'],
      edit: ['Photo Edit', 'Upload a photo in Telegram bot and describe changes'],
      files: ['File Analysis', 'Analyze PDF, TXT, CSV and JSON'],
      voice: ['Voice', 'Voice and Telegram video note supported']
    };
    screenTitle.textContent = titles[mode][0];
    screenSub.textContent = titles[mode][1];

    addMessage('ai', `Mode: ${titles[mode][0]}. Use the Telegram bot for live AI processing. This Mini App is the professional interface shell.`);
  });
});

document.getElementById('newChat').addEventListener('click', () => {
  chat.innerHTML = '';
  addMessage('ai', 'New chat started. Send your request here or use the Telegram bot for full processing.');
});

function addMessage(role, text) {
  const row = document.createElement('div');
  row.className = `message ${role}`;
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = text;
  row.appendChild(bubble);
  chat.appendChild(row);
  chat.scrollTop = chat.scrollHeight;
}

function sendLocalMessage() {
  const text = promptEl.value.trim();
  if (!text) return;
  addMessage('user', text);
  promptEl.value = '';
  addMessage('ai', 'Mini App interface is ready. For now, send this request to the Telegram bot chat for full AI processing. Next step: connect this UI directly to backend API.');
}

sendBtn.addEventListener('click', sendLocalMessage);
promptEl.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendLocalMessage();
  }
});

document.getElementById('voiceBtn').addEventListener('click', () => {
  addMessage('ai', 'Voice is supported in the Telegram bot chat. Direct Mini App microphone recording can be connected in the next backend step.');
});

document.getElementById('imageInput').addEventListener('change', e => {
  if (e.target.files?.[0]) addMessage('ai', `Image selected: ${e.target.files[0].name}. Send photos in Telegram bot for live AI edit.`);
});

document.getElementById('fileInput').addEventListener('change', e => {
  if (e.target.files?.[0]) addMessage('ai', `File selected: ${e.target.files[0].name}. Send files in Telegram bot for live analysis.`);
});
