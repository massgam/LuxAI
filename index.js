import 'dotenv/config';
import express from 'express';
import TelegramBot from 'node-telegram-bot-api';
import OpenAI from 'openai';
import fs from 'fs';
import os from 'os';
import path from 'path';
import pdf from 'pdf-parse';

const TELEGRAM_BOT_TOKEN = (process.env.TELEGRAM_BOT_TOKEN || '').trim();
const OPENAI_API_KEY = (process.env.OPENAI_API_KEY || '').trim();
const ADMIN_TELEGRAM_ID = String(process.env.ADMIN_TELEGRAM_ID || '').trim();
const BOT_NAME = process.env.BOT_NAME || 'LuxAI';
const TEXT_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
const VISION_MODEL = process.env.OPENAI_VISION_MODEL || TEXT_MODEL;
const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1';
const PORT = process.env.PORT || 8080;

if (!TELEGRAM_BOT_TOKEN) throw new Error('TELEGRAM_BOT_TOKEN missing');
if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY missing');

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
const app = express();

app.use(express.json({ limit: '15mb' }));
app.use(express.static('public'));

const stats = {
  users: new Map(),
  messages: 0,
  text: 0,
  voice: 0,
  photos: 0,
  files: 0,
  imagesGenerated: 0,
  errors: 0,
  actions: []
};

const memory = new Map();

function username(from = {}) {
  return from.username ? '@' + from.username : (from.first_name || 'Kullanıcı');
}

function remember(chatId, role, content) {
  const key = String(chatId);
  const arr = memory.get(key) || [];
  arr.push({ role, content });
  memory.set(key, arr.slice(-16));
}

function getMemory(chatId) {
  return memory.get(String(chatId)) || [];
}

function logAction(type, msg, detail = '') {
  const from = msg.from || {};
  const id = String(from.id || '');
  if (id) {
    const current = stats.users.get(id) || {
      id,
      username: from.username || '',
      first_name: from.first_name || '',
      last_seen: new Date().toISOString(),
      messages: 0
    };
    current.username = from.username || current.username;
    current.first_name = from.first_name || current.first_name;
    current.last_seen = new Date().toISOString();
    current.messages += 1;
    stats.users.set(id, current);
  }

  stats.messages += 1;
  if (stats[type] !== undefined) stats[type] += 1;

  const line = `${new Date().toLocaleString('tr-TR')} | ${username(from)} | ${type} | ${String(detail).slice(0, 160)}`;
  stats.actions.unshift(line);
  stats.actions = stats.actions.slice(0, 80);
}

async function safeSend(chatId, text, extra = {}) {
  const chunks = [];
  let remaining = String(text || '');
  while (remaining.length > 3900) {
    chunks.push(remaining.slice(0, 3900));
    remaining = remaining.slice(3900);
  }
  chunks.push(remaining);
  for (const chunk of chunks) {
    await bot.sendMessage(chatId, chunk, extra);
  }
}

async function askAI(chatId, userText, extraInput = []) {
  const history = getMemory(chatId).map(m => ({
    role: m.role,
    content: [{ type: 'input_text', text: m.content }]
  }));

  const input = [
    {
      role: 'system',
      content: [{
        type: 'input_text',
        text: `Sen ${BOT_NAME} adında profesyonel Telegram AI asistanısın. Kullanıcının dilinde cevap ver. Kısa, net ve faydalı ol. Gerekirse adım adım anlat.`
      }]
    },
    ...history,
    {
      role: 'user',
      content: [
        { type: 'input_text', text: userText || 'Devam et.' },
        ...extraInput
      ]
    }
  ];

  const response = await openai.responses.create({
    model: TEXT_MODEL,
    input
  });

  const answer = response.output_text || 'Cevap oluşturamadım.';
  remember(chatId, 'user', userText);
  remember(chatId, 'assistant', answer);
  return answer;
}

async function downloadTelegramFile(fileId, ext = '') {
  const file = await bot.getFile(fileId);
  const url = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${file.file_path}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Telegram file download failed: ${res.status}`);
  const array = await res.arrayBuffer();
  const buffer = Buffer.from(array);
  const filePath = path.join(os.tmpdir(), `${fileId.replace(/[^a-zA-Z0-9_-]/g, '')}${ext}`);
  fs.writeFileSync(filePath, buffer);
  return { filePath, buffer, telegramPath: file.file_path };
}

function isImagePrompt(text = '') {
  const t = text.toLowerCase();
  return t.startsWith('/image') || t.startsWith('/resim') || t.startsWith('/gorsel') || t.startsWith('/görsel') ||
    t.includes('görsel oluştur') || t.includes('resim oluştur') || t.includes('fotoğraf oluştur') || t.includes('logo oluştur');
}

function cleanImagePrompt(text = '') {
  return text
    .replace(/^\/image/i, '')
    .replace(/^\/resim/i, '')
    .replace(/^\/gorsel/i, '')
    .replace(/^\/görsel/i, '')
    .trim();
}

async function generateImage(chatId, prompt) {
  const imagePrompt = cleanImagePrompt(prompt) || prompt;
  const result = await openai.images.generate({
    model: IMAGE_MODEL,
    prompt: imagePrompt,
    size: '1024x1024'
  });
  const b64 = result.data?.[0]?.b64_json;
  if (!b64) throw new Error('Image API did not return b64_json');
  const buffer = Buffer.from(b64, 'base64');
  await bot.sendPhoto(chatId, buffer, { caption: `🎨 ${BOT_NAME} görsel oluşturdu.` });
  return true;
}

async function transcribeVoice(filePath) {
  const tx = await openai.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: 'whisper-1'
  });
  return tx.text || '';
}

async function analyzePhoto(chatId, photoMsg, caption = '') {
  const photo = photoMsg.photo[photoMsg.photo.length - 1];
  const { buffer, telegramPath } = await downloadTelegramFile(photo.file_id, '.jpg');
  const base64 = buffer.toString('base64');

  const prompt = caption || 'Bu fotoğrafı detaylı analiz et. İçindeki önemli şeyleri anlat.';
  const answer = await askAI(chatId, prompt, [
    { type: 'input_image', image_url: `data:image/jpeg;base64,${base64}` }
  ]);

  stats.actions.unshift(`${new Date().toLocaleString('tr-TR')} | ${username(photoMsg.from)} | photo_file | ${telegramPath}`);
  stats.actions = stats.actions.slice(0, 80);
  return answer;
}

async function readDocument(filePath, originalName = '') {
  const lower = originalName.toLowerCase();
  if (lower.endsWith('.pdf')) {
    const data = await pdf(fs.readFileSync(filePath));
    return (data.text || '').slice(0, 12000);
  }
  if (lower.endsWith('.txt') || lower.endsWith('.md') || lower.endsWith('.csv') || lower.endsWith('.json')) {
    return fs.readFileSync(filePath, 'utf8').slice(0, 12000);
  }
  return '';
}

bot.onText(/\/start/, async (msg) => {
  logAction('text', msg, '/start');
  await safeSend(
    msg.chat.id,
    `👋 Hoş geldin ${username(msg.from)}

Ben ${BOT_NAME} Pro.

Yapabileceklerim:
💬 Yazılı sohbet
🎤 Sesli mesajı yazıya çevirip cevaplama
🖼️ Fotoğraf analizi
🎨 Görsel oluşturma: /image istediğin görsel
📄 PDF/TXT okuma
📊 Admin panel: /admin`
  );
});

bot.onText(/\/clear/, async (msg) => {
  memory.delete(String(msg.chat.id));
  logAction('text', msg, '/clear');
  await safeSend(msg.chat.id, '✅ Sohbet hafızası temizlendi.');
});

bot.onText(/\/admin/, async (msg) => {
  if (String(msg.from.id) !== ADMIN_TELEGRAM_ID) {
    return safeSend(msg.chat.id, '⛔ Admin yetkin yok.');
  }

  const users = [...stats.users.values()]
    .sort((a, b) => new Date(b.last_seen) - new Date(a.last_seen))
    .slice(0, 20)
    .map((u, i) => `${i + 1}. ${u.username ? '@' + u.username : u.first_name || u.id} | ID: ${u.id} | Mesaj: ${u.messages}`)
    .join('\n') || 'Kullanıcı yok.';

  await safeSend(
    msg.chat.id,
    `📊 ${BOT_NAME} Admin Panel

👥 Kullanıcı: ${stats.users.size}
💬 Toplam mesaj: ${stats.messages}
📝 Yazı: ${stats.text}
🎤 Ses: ${stats.voice}
🖼️ Fotoğraf: ${stats.photos}
📄 Dosya: ${stats.files}
🎨 Görsel üretim: ${stats.imagesGenerated}
⚠️ Hata: ${stats.errors}

👤 Son kullanıcılar:
${users}

🧾 Son hareketler:
/logs`
  );
});

bot.onText(/\/logs/, async (msg) => {
  if (String(msg.from.id) !== ADMIN_TELEGRAM_ID) {
    return safeSend(msg.chat.id, '⛔ Admin yetkin yok.');
  }
  await safeSend(msg.chat.id, `🧾 Son Hareketler\n\n${stats.actions.slice(0, 40).join('\n') || 'Henüz hareket yok.'}`);
});

bot.onText(/\/image(?:\s+([\s\S]+))?/, async (msg, match) => {
  const prompt = match?.[1]?.trim();
  if (!prompt) return safeSend(msg.chat.id, '🎨 Görsel oluşturmak için şöyle yaz:\n\n/image altın renkli lüks AI robot logosu');
  try {
    logAction('imagesGenerated', msg, prompt);
    await bot.sendChatAction(msg.chat.id, 'upload_photo');
    await generateImage(msg.chat.id, prompt);
  } catch (err) {
    stats.errors += 1;
    console.error('image_error', err);
    await safeSend(msg.chat.id, '❌ Görsel oluşturulamadı. OpenAI image yetkisini ve bakiyeni kontrol et.');
  }
});

bot.on('voice', async (msg) => {
  try {
    logAction('voice', msg, 'voice message');
    await bot.sendChatAction(msg.chat.id, 'typing');

    const { filePath } = await downloadTelegramFile(msg.voice.file_id, '.ogg');
    const transcript = await transcribeVoice(filePath);

    stats.actions.unshift(`${new Date().toLocaleString('tr-TR')} | ${username(msg.from)} | voice_text | ${transcript.slice(0, 220)}`);
    stats.actions = stats.actions.slice(0, 80);

    const answer = await askAI(msg.chat.id, transcript);
    await safeSend(msg.chat.id, `🎤 Ses kaydını anladım:\n"${transcript}"\n\n${answer}`);
  } catch (err) {
    stats.errors += 1;
    console.error('voice_error', err);
    await safeSend(msg.chat.id, '❌ Sesli mesajı okuyamadım. Lütfen tekrar dene.');
  }
});

bot.on('photo', async (msg) => {
  try {
    logAction('photos', msg, msg.caption || 'photo');
    await bot.sendChatAction(msg.chat.id, 'typing');
    const answer = await analyzePhoto(msg.chat.id, msg, msg.caption);
    await safeSend(msg.chat.id, answer);
  } catch (err) {
    stats.errors += 1;
    console.error('photo_error', err);
    await safeSend(msg.chat.id, '❌ Fotoğraf analiz edilemedi. Lütfen tekrar dene.');
  }
});

bot.on('document', async (msg) => {
  try {
    logAction('files', msg, msg.document.file_name || 'document');
    await bot.sendChatAction(msg.chat.id, 'typing');

    const ext = path.extname(msg.document.file_name || '');
    const { filePath } = await downloadTelegramFile(msg.document.file_id, ext);
    const content = await readDocument(filePath, msg.document.file_name || '');

    if (!content) {
      return safeSend(msg.chat.id, '📄 Bu dosya türünü şu an okuyamıyorum. PDF veya TXT gönder.');
    }

    const answer = await askAI(msg.chat.id, `Bu dosyayı özetle ve önemli noktaları çıkar:\n\n${content}`);
    await safeSend(msg.chat.id, answer);
  } catch (err) {
    stats.errors += 1;
    console.error('file_error', err);
    await safeSend(msg.chat.id, '❌ Dosya okunamadı. PDF veya TXT olarak tekrar gönder.');
  }
});

bot.on('message', async (msg) => {
  if (!msg.text) return;
  if (msg.text.startsWith('/start') || msg.text.startsWith('/clear') || msg.text.startsWith('/admin') || msg.text.startsWith('/logs') || msg.text.startsWith('/image')) return;

  try {
    logAction('text', msg, msg.text);
    await bot.sendChatAction(msg.chat.id, 'typing');

    if (isImagePrompt(msg.text)) {
      stats.imagesGenerated += 1;
      await generateImage(msg.chat.id, msg.text);
      return;
    }

    const answer = await askAI(msg.chat.id, msg.text);
    await safeSend(msg.chat.id, answer);
  } catch (err) {
    stats.errors += 1;
    console.error('message_error', err);
    await safeSend(msg.chat.id, '❌ Bir hata oluştu. Lütfen tekrar dene.');
  }
});

bot.on('polling_error', (err) => {
  stats.errors += 1;
  console.error('polling_error', err.message);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

app.get('/health', (req, res) => {
  res.json({ ok: true, bot: BOT_NAME, users: stats.users.size, messages: stats.messages });
});

app.listen(PORT, () => {
  console.log(`${BOT_NAME} Pro server running on ${PORT}`);
});

console.log(`${BOT_NAME} Pro Telegram bot started`);
