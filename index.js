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

app.use(express.json({ limit: '25mb' }));
app.use(express.static('public'));

const stats = {
  users: new Map(),
  messages: 0,
  text: 0,
  voice: 0,
  videoNotes: 0,
  photos: 0,
  imageGenerated: 0,
  imageEdited: 0,
  files: 0,
  errors: 0,
  actions: []
};

const memory = new Map();
const lastPhotoByChat = new Map();
const savedPhotos = [];

function userName(from = {}) {
  if (from.username) return '@' + from.username;
  return [from.first_name, from.last_name].filter(Boolean).join(' ') || 'Kullanıcı';
}

function registerUser(msg) {
  const from = msg.from || {};
  const id = String(from.id || msg.chat?.id || '');
  if (!id) return;
  if (!stats.users.has(id)) {
    stats.users.set(id, {
      id,
      username: from.username || '',
      first_name: from.first_name || '',
      last_name: from.last_name || '',
      firstSeen: new Date().toISOString(),
      messages: 0
    });
  }
  const u = stats.users.get(id);
  u.messages += 1;
  u.lastSeen = new Date().toISOString();
}

function logAction(msg, type, text = '', extra = {}) {
  registerUser(msg);
  stats.messages += 1;
  const item = {
    time: new Date().toLocaleString('tr-TR'),
    chatId: msg.chat?.id,
    userId: msg.from?.id,
    user: userName(msg.from),
    type,
    text: String(text || '').slice(0, 1200),
    ...extra
  };
  stats.actions.unshift(item);
  stats.actions = stats.actions.slice(0, 200);
}

function addMemory(chatId, role, content) {
  const key = String(chatId);
  const arr = memory.get(key) || [];
  arr.push({ role, content });
  memory.set(key, arr.slice(-12));
}

function getMemory(chatId) {
  return memory.get(String(chatId)) || [];
}

async function sendLong(chatId, text, options = {}) {
  const clean = text || 'Cevap alınamadı.';
  for (let i = 0; i < clean.length; i += 3900) {
    await bot.sendMessage(chatId, clean.slice(i, i + 3900), options);
  }
}

async function askText(chatId, userText) {
  const history = getMemory(chatId).map(m => ({
    role: m.role,
    content: [{ type: 'input_text', text: m.content }]
  }));

  const response = await openai.responses.create({
    model: TEXT_MODEL,
    input: [
      {
        role: 'system',
        content: [{ type: 'input_text', text:
          `Sen ${BOT_NAME} adında çok güçlü, profesyonel bir Telegram AI asistanısın.
Kullanıcının dilinde cevap ver. Türkçe yazarsa Türkçe, İngilizce yazarsa İngilizce cevap ver.
Kısa, net, kullanışlı ve profesyonel cevaplar ver.
Kullanıcı görsel oluşturmak, fotoğraf düzenlemek, ses göndermek veya dosya göndermek isterse sistem bunu otomatik yönetecek.`
        }]
      },
      ...history,
      { role: 'user', content: [{ type: 'input_text', text: userText }] }
    ]
  });

  return response.output_text || 'Cevap alınamadı.';
}

async function analyzeImage(chatId, base64Image, prompt = 'Bu fotoğrafı detaylı ama kısa şekilde analiz et.') {
  const response = await openai.responses.create({
    model: VISION_MODEL,
    input: [
      { role: 'system', content: [{ type: 'input_text', text: 'Kullanıcının dilinde cevap ver. Fotoğrafı dikkatli analiz et.' }] },
      {
        role: 'user',
        content: [
          { type: 'input_text', text: prompt },
          { type: 'input_image', image_url: `data:image/jpeg;base64,${base64Image}` }
        ]
      }
    ]
  });
  return response.output_text || 'Fotoğraf analiz edilemedi.';
}

async function generateImage(prompt) {
  const result = await openai.images.generate({
    model: IMAGE_MODEL,
    prompt,
    size: '1024x1024'
  });
  const image = result.data?.[0];
  if (!image) throw new Error('Image generation returned no image');
  return image.b64_json ? Buffer.from(image.b64_json, 'base64') : image.url;
}

async function editImage(imagePath, prompt) {
  const result = await openai.images.edit({
    model: IMAGE_MODEL,
    image: fs.createReadStream(imagePath),
    prompt,
    size: '1024x1024'
  });
  const image = result.data?.[0];
  if (!image) throw new Error('Image edit returned no image');
  return image.b64_json ? Buffer.from(image.b64_json, 'base64') : image.url;
}

async function transcribeFile(filePath) {
  try {
    const t = await openai.audio.transcriptions.create({
      model: 'gpt-4o-mini-transcribe',
      file: fs.createReadStream(filePath)
    });
    return t.text || '';
  } catch (e) {
    const t = await openai.audio.transcriptions.create({
      model: 'whisper-1',
      file: fs.createReadStream(filePath)
    });
    return t.text || '';
  }
}

async function downloadTelegramFile(fileId, ext = '') {
  const file = await bot.getFile(fileId);
  const url = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${file.file_path}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Telegram file download failed: ${res.status}`);
  const arr = await res.arrayBuffer();
  const buffer = Buffer.from(arr);
  const safeExt = ext || path.extname(file.file_path || '') || '.bin';
  const tmp = path.join(os.tmpdir(), `${Date.now()}_${Math.random().toString(36).slice(2)}${safeExt}`);
  fs.writeFileSync(tmp, buffer);
  return { tmp, buffer, filePath: file.file_path };
}

function isImageGenerationRequest(text) {
  const t = text.toLowerCase();
  return [
    'görsel oluştur', 'resim oluştur', 'fotoğraf oluştur', 'logo oluştur',
    'görsel yap', 'resim yap', 'foto yap', 'tasarla', 'çiz',
    'generate image', 'create image', 'draw', 'design a logo', 'make an image'
  ].some(k => t.includes(k));
}

function isImageEditRequest(text) {
  const t = text.toLowerCase();
  return [
    'değiştir', 'düzenle', 'edit', 'yap', 'ekle', 'kaldır', 'sil',
    'arka plan', 'ön taraf', 'renk', 'saç', 'yüz', 'kıyafet', 'gökyüzü',
    'miami', 'dubai', 'new york', 'orijinal', 'restore', 'turn this',
    'make it', 'replace', 'remove', 'add'
  ].some(k => t.includes(k));
}

function isImageAnalyzeRequest(text) {
  const t = text.toLowerCase();
  return ['analiz', 'yorumla', 'ne görüyorsun', 'bu nedir', 'açıkla', 'analyze', 'what is'].some(k => t.includes(k));
}

async function handleUserText(msg, text) {
  const chatId = msg.chat.id;
  const lastPhoto = lastPhotoByChat.get(String(chatId));

  logAction(msg, 'text', text);
  stats.text += 1;

  try {
    await bot.sendChatAction(chatId, 'typing');

    if (lastPhoto && isImageEditRequest(text) && !isImageGenerationRequest(text)) {
      await bot.sendMessage(chatId, '🎨 Fotoğrafını düzenliyorum...');
      const edited = await editImage(lastPhoto.path, text);
      stats.imageEdited += 1;
      logAction(msg, 'image_edit', text, { photoFileId: lastPhoto.fileId });
      await bot.sendPhoto(chatId, edited, { caption: '✅ Fotoğraf düzenlendi.' });
      return;
    }

    if (isImageGenerationRequest(text)) {
      await bot.sendMessage(chatId, '🖼️ Görsel oluşturuyorum...');
      const image = await generateImage(text);
      stats.imageGenerated += 1;
      logAction(msg, 'image_generate', text);
      await bot.sendPhoto(chatId, image, { caption: '✅ Görsel oluşturuldu.' });
      return;
    }

    if (lastPhoto && isImageAnalyzeRequest(text)) {
      await bot.sendMessage(chatId, '🔍 Fotoğrafı analiz ediyorum...');
      const answer = await analyzeImage(chatId, lastPhoto.base64, text);
      logAction(msg, 'image_analyze', text, { photoFileId: lastPhoto.fileId });
      await sendLong(chatId, answer);
      return;
    }

    const reply = await askText(chatId, text);
    addMemory(chatId, 'user', text);
    addMemory(chatId, 'assistant', reply);
    await sendLong(chatId, reply);
  } catch (err) {
    stats.errors += 1;
    console.error('handleUserText error', err);
    logAction(msg, 'error', err.message || String(err));
    await bot.sendMessage(chatId, '❌ İşlem sırasında hata oluştu. Railway logs kısmını kontrol et.');
  }
}

bot.onText(/\/start/, async (msg) => {
  logAction(msg, 'start', '/start');
  await bot.sendMessage(
    msg.chat.id,
    `👋 Hoş geldin ${userName(msg.from)}

Ben ${BOT_NAME} Pro.

Bana normal şekilde yazabilirsin:
• "Lüks altın logo oluştur"
• Fotoğraf gönderip "ön tarafı Miami yap"
• Sesli mesaj gönder
• Küçük yuvarlak video mesaj gönder
• Fotoğraf gönderip "analiz et" yaz

Komut yazmana gerek yok.`
  );
});

bot.onText(/\/clear/, async (msg) => {
  memory.delete(String(msg.chat.id));
  lastPhotoByChat.delete(String(msg.chat.id));
  logAction(msg, 'clear', '/clear');
  await bot.sendMessage(msg.chat.id, '✅ Sohbet hafızası temizlendi.');
});

bot.onText(/\/admin/, async (msg) => {
  if (String(msg.from?.id || '') !== ADMIN_TELEGRAM_ID) {
    await bot.sendMessage(msg.chat.id, '⛔ Admin yetkin yok.');
    return;
  }

  const text = `📊 ${BOT_NAME} Admin Panel

👤 Kullanıcı: ${stats.users.size}
💬 Toplam mesaj: ${stats.messages}
📝 Yazı: ${stats.text}
🎤 Ses: ${stats.voice}
🎥 Video note: ${stats.videoNotes}
🖼️ Fotoğraf: ${stats.photos}
🎨 Görsel üretim: ${stats.imageGenerated}
✏️ Görsel edit: ${stats.imageEdited}
📄 Dosya: ${stats.files}
⚠️ Hata: ${stats.errors}

Komutlar:
/logs - son hareketler
/photos - son fotoğraflar`;

  await bot.sendMessage(msg.chat.id, text);
});

bot.onText(/\/logs/, async (msg) => {
  if (String(msg.from?.id || '') !== ADMIN_TELEGRAM_ID) return;
  const lines = stats.actions.slice(0, 30).map((a, i) =>
    `${i + 1}. ${a.time} | ${a.user} | ${a.type}\n${a.text || ''}${a.photoFileId ? `\nPhotoID: ${a.photoFileId}` : ''}`
  );
  await sendLong(msg.chat.id, `🧾 Son Hareketler\n\n${lines.join('\n\n') || 'Henüz hareket yok.'}`);
});

bot.onText(/\/photos/, async (msg) => {
  if (String(msg.from?.id || '') !== ADMIN_TELEGRAM_ID) return;
  const items = savedPhotos.slice(0, 10);
  if (!items.length) return bot.sendMessage(msg.chat.id, 'Henüz fotoğraf yok.');
  for (const p of items) {
    await bot.sendPhoto(msg.chat.id, p.fileId, {
      caption: `${p.time} | ${p.user}\n${p.caption || ''}`
    });
  }
});

bot.on('message', async (msg) => {
  if (msg.text && !msg.text.startsWith('/')) {
    await handleUserText(msg, msg.text);
  }
});

bot.on('photo', async (msg) => {
  const chatId = msg.chat.id;
  stats.photos += 1;

  try {
    const best = msg.photo[msg.photo.length - 1];
    const { tmp, buffer } = await downloadTelegramFile(best.file_id, '.jpg');
    const base64 = buffer.toString('base64');

    const photoRecord = {
      fileId: best.file_id,
      path: tmp,
      base64,
      time: new Date().toLocaleString('tr-TR'),
      user: userName(msg.from),
      caption: msg.caption || ''
    };

    lastPhotoByChat.set(String(chatId), photoRecord);
    savedPhotos.unshift(photoRecord);
    savedPhotos.splice(30);

    logAction(msg, 'photo', msg.caption || 'Fotoğraf gönderildi', { photoFileId: best.file_id });

    if (msg.caption) {
      await handleUserText(msg, msg.caption);
    } else {
      await bot.sendMessage(chatId, '📸 Fotoğraf alındı. Ne yapmak istediğini normal yaz: "ön tarafı Miami yap", "analiz et", "arka planı değiştir" gibi.');
    }
  } catch (err) {
    stats.errors += 1;
    console.error('photo error', err);
    logAction(msg, 'error', err.message || String(err));
    await bot.sendMessage(chatId, '❌ Fotoğraf işlenemedi. Lütfen tekrar dene.');
  }
});

bot.on('voice', async (msg) => {
  const chatId = msg.chat.id;
  stats.voice += 1;

  try {
    await bot.sendMessage(chatId, '🎤 Sesli mesajı okuyorum...');
    const { tmp } = await downloadTelegramFile(msg.voice.file_id, '.ogg');
    const transcript = await transcribeFile(tmp);
    logAction(msg, 'voice_transcript', transcript);

    if (!transcript) {
      await bot.sendMessage(chatId, '❌ Ses anlaşılamadı.');
      return;
    }

    await bot.sendMessage(chatId, `📝 Ses metni:\n${transcript}`);
    await handleUserText(msg, transcript);
  } catch (err) {
    stats.errors += 1;
    console.error('voice error', err);
    logAction(msg, 'error', err.message || String(err));
    await bot.sendMessage(chatId, '❌ Sesli mesaj okunamadı.');
  }
});

bot.on('video_note', async (msg) => {
  const chatId = msg.chat.id;
  stats.videoNotes += 1;

  try {
    await bot.sendMessage(chatId, '🎥 Video mesajın sesini okuyorum...');
    const { tmp } = await downloadTelegramFile(msg.video_note.file_id, '.mp4');
    const transcript = await transcribeFile(tmp);
    logAction(msg, 'video_note_transcript', transcript);

    if (!transcript) {
      await bot.sendMessage(chatId, '❌ Video mesajdaki ses anlaşılamadı.');
      return;
    }

    await bot.sendMessage(chatId, `📝 Video mesaj metni:\n${transcript}`);
    await handleUserText(msg, transcript);
  } catch (err) {
    stats.errors += 1;
    console.error('video_note error', err);
    logAction(msg, 'error', err.message || String(err));
    await bot.sendMessage(chatId, '❌ Video mesaj okunamadı.');
  }
});

bot.on('document', async (msg) => {
  const chatId = msg.chat.id;
  stats.files += 1;

  try {
    const fileName = msg.document.file_name || 'file';
    const ext = path.extname(fileName).toLowerCase();
    await bot.sendMessage(chatId, `📄 Dosya alındı: ${fileName}`);

    const { tmp, buffer } = await downloadTelegramFile(msg.document.file_id, ext);

    let text = '';
    if (ext === '.pdf') {
      const data = await pdf(buffer);
      text = data.text || '';
    } else if (['.txt', '.md', '.csv', '.json'].includes(ext)) {
      text = buffer.toString('utf8');
    } else {
      await bot.sendMessage(chatId, 'Bu dosya türünü şu an okuyamıyorum. PDF, TXT, MD, CSV, JSON gönder.');
      return;
    }

    const limited = text.slice(0, 12000);
    logAction(msg, 'file', `${fileName}\n${limited.slice(0, 500)}`);
    const reply = await askText(chatId, `Bu dosyayı analiz et:\n\n${limited}`);
    await sendLong(chatId, reply);
  } catch (err) {
    stats.errors += 1;
    console.error('document error', err);
    logAction(msg, 'error', err.message || String(err));
    await bot.sendMessage(chatId, '❌ Dosya okunamadı.');
  }
});

bot.on('polling_error', (err) => {
  stats.errors += 1;
  console.error('polling_error', err.message);
});

app.get('/health', (_, res) => res.json({ ok: true, bot: BOT_NAME }));
app.get('/admin-data', (_, res) => {
  res.json({
    stats: {
      ...stats,
      users: Array.from(stats.users.values())
    },
    lastActions: stats.actions.slice(0, 50),
    photos: savedPhotos.slice(0, 20).map(p => ({
      time: p.time,
      user: p.user,
      caption: p.caption,
      fileId: p.fileId
    }))
  });
});

app.listen(PORT, () => {
  console.log(`${BOT_NAME} Pro Telegram bot started`);
  console.log(`${BOT_NAME} Pro server running on ${PORT}`);
});
