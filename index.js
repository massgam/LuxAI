import 'dotenv/config';
import express from 'express';
import TelegramBot from 'node-telegram-bot-api';
import OpenAI from 'openai';
import { toFile } from 'openai/uploads';
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
const TRANSCRIBE_MODEL = process.env.OPENAI_TRANSCRIBE_MODEL || 'gpt-4o-mini-transcribe';
const PORT = Number(process.env.PORT || 8080);

if (!TELEGRAM_BOT_TOKEN) throw new Error('TELEGRAM_BOT_TOKEN missing');
if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY missing');

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
const app = express();

app.use(express.json({ limit: '30mb' }));
app.use(express.static('public'));

const memory = new Map();
const lastPhotoByChat = new Map();
const savedPhotos = [];

const stats = {
  users: new Map(),
  messages: 0,
  text: 0,
  voice: 0,
  videoNotes: 0,
  photos: 0,
  files: 0,
  imageGenerated: 0,
  imageEdited: 0,
  imageAnalyzed: 0,
  errors: 0,
  actions: []
};

function userName(from = {}) {
  if (from.username) return '@' + from.username;
  return [from.first_name, from.last_name].filter(Boolean).join(' ') || 'Kullanıcı';
}

function detectLanguageFromText(text = '') {
  const t = String(text || '').trim();

  // Ukrainian-specific Cyrillic letters and common words
  if (/[іїєґІЇЄҐ]/.test(t) || /\b(привіт|дякую|будь ласка|що|як справи|українськ)/i.test(t)) {
    return 'uk';
  }

  // Russian Cyrillic
  if (/[А-Яа-яЁё]/.test(t)) {
    return 'ru';
  }

  // Turkish characters or common Turkish words
  if (/[ÇĞİÖŞÜçğıöşü]/.test(t) || /\b(merhaba|selam|nasılsın|teşekkür|görsel|fotoğraf|düzenle|oluştur)\b/i.test(t)) {
    return 'tr';
  }

  // English-like Latin text
  if (/[A-Za-z]/.test(t)) {
    return 'en';
  }

  return '';
}

function getLanguageCode(msg, text = '') {
  const byText = detectLanguageFromText(text);
  if (byText) return byText;

  const code = String(msg?.from?.language_code || '').toLowerCase();
  if (code.startsWith('ru')) return 'ru';
  if (code.startsWith('uk')) return 'uk';
  if (code.startsWith('en')) return 'en';
  if (code.startsWith('tr')) return 'tr';
  if (code.startsWith('az')) return 'az';
  return code || 'auto';
}

function languageInstruction(msg, text = '') {
  const code = getLanguageCode(msg, text);
  if (code === 'ru') return 'Пользователь говорит/пишет по-русски. Отвечай строго на русском языке.';
  if (code === 'uk') return 'Користувач говорить/пише українською. Відповідай строго українською мовою.';
  if (code === 'en') return 'The user writes/speaks English. Reply strictly in English.';
  if (code === 'tr') return 'Kullanıcı Türkçe yazıyor/konuşuyor. Kesinlikle Türkçe cevap ver.';
  if (code === 'az') return 'İstifadəçi Azərbaycan dilində yazır/danışır. Azərbaycan dilində cavab ver.';
  return 'Kullanıcının yazdığı veya konuştuğu dili otomatik algıla ve aynı dilde cevap ver.';
}

function startMessage(msg) {
  const name = userName(msg.from);
  const code = getLanguageCode(msg, '');

  if (code === 'ru') {
    return `👋 Добро пожаловать ${name}

Я ${BOT_NAME} Pro.`;
  }

  if (code === 'uk') {
    return `👋 Ласкаво просимо ${name}

Я ${BOT_NAME} Pro.`;
  }

  if (code === 'en') {
    return `👋 Welcome ${name}

I am ${BOT_NAME} Pro.`;
  }

  return `👋 Hoş geldin ${name}

Ben ${BOT_NAME} Pro.`;
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
      language_code: from.language_code || '',
      firstSeen: new Date().toISOString(),
      messages: 0
    });
  }

  const u = stats.users.get(id);
  u.messages += 1;
  u.lastSeen = new Date().toISOString();
  u.language_code = from.language_code || u.language_code || '';
}

function logAction(msg, type, text = '', extra = {}) {
  registerUser(msg);
  stats.messages += 1;

  const item = {
    time: new Date().toLocaleString('tr-TR'),
    chatId: msg.chat?.id,
    userId: msg.from?.id,
    user: userName(msg.from),
    lang: getLanguageCode(msg, text),
    type,
    text: String(text || '').slice(0, 1500),
    ...extra
  };

  stats.actions.unshift(item);
  stats.actions = stats.actions.slice(0, 250);
}

function addMemory(chatId, role, content) {
  const key = String(chatId);
  const arr = memory.get(key) || [];
  arr.push({ role, content: String(content || '').slice(0, 4000) });
  memory.set(key, arr.slice(-14));
}

function getMemory(chatId) {
  return memory.get(String(chatId)) || [];
}

async function sendLong(chatId, text, options = {}) {
  const clean = String(text || 'Cevap alınamadı.');
  for (let i = 0; i < clean.length; i += 3900) {
    await bot.sendMessage(chatId, clean.slice(i, i + 3900), options);
  }
}

async function askText(chatId, userText, langRule = '') {
  const history = getMemory(chatId)
    .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n');

  const response = await openai.responses.create({
    model: TEXT_MODEL,
    input: `You are ${BOT_NAME}, a powerful professional Telegram AI assistant.

Language rule:
${langRule || 'Detect the user language and reply in the same language.'}

Important rules:
- Never send image links when user asks for an image.
- If the user requests an image, logo, poster, banner, design, drawing or photo generation, the bot system will generate it automatically.
- If the user sends a photo and asks to change/add/remove/replace something, the bot system will edit the photo automatically.
- Be short, helpful and professional.

Conversation memory:
${history || 'No previous conversation.'}

User message:
${userText}`
  });

  return response.output_text || 'Cevap alınamadı.';
}

async function analyzeImage(base64Image, prompt, langRule) {
  const response = await openai.responses.create({
    model: VISION_MODEL,
    input: [
      {
        role: 'system',
        content: [{
          type: 'input_text',
          text: `${langRule || 'Reply in the user language.'} Analyze the image carefully and answer clearly.`
        }]
      },
      {
        role: 'user',
        content: [
          { type: 'input_text', text: prompt || 'Analyze this image briefly.' },
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

  return image.b64_json
    ? Buffer.from(image.b64_json, 'base64')
    : image.url;
}

function mimeFromFilePath(filePath = '') {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  return 'image/jpeg';
}

async function editImageFromPhoto(photoRecord, prompt) {
  const mime = photoRecord.mime || 'image/jpeg';
  const ext = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg';

  const imageFile = await toFile(photoRecord.buffer, `telegram-photo.${ext}`, { type: mime });

  const result = await openai.images.edit({
    model: IMAGE_MODEL,
    image: imageFile,
    prompt,
    size: '1024x1024'
  });

  const image = result.data?.[0];
  if (!image) throw new Error('Image edit returned no image');

  return image.b64_json
    ? Buffer.from(image.b64_json, 'base64')
    : image.url;
}

async function transcribeFile(filePath) {
  try {
    const t = await openai.audio.transcriptions.create({
      model: TRANSCRIBE_MODEL,
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

async function downloadTelegramFile(fileId, fallbackExt = '') {
  const file = await bot.getFile(fileId);
  const url = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${file.file_path}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Telegram file download failed: ${res.status}`);

  const arr = await res.arrayBuffer();
  const buffer = Buffer.from(arr);

  const ext = path.extname(file.file_path || '') || fallbackExt || '.bin';
  const tmp = path.join(os.tmpdir(), `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`);
  fs.writeFileSync(tmp, buffer);

  return { tmp, buffer, filePath: file.file_path, mime: mimeFromFilePath(file.file_path || fallbackExt) };
}

function isImageGenerationRequest(text = '') {
  const t = text.toLowerCase();

  const imageWords = [
    'görsel', 'resim', 'fotoğraf', 'foto', 'image', 'picture', 'photo',
    'logo', 'afiş', 'poster', 'banner', 'tasarım', 'design', 'çizim',
    'wallpaper', 'kapak', 'reklam görseli',
    'изображение', 'картинка', 'фото', 'логотип', 'постер', 'баннер', 'дизайн', 'нарисуй',
    'зображення', 'картинка', 'фото', 'логотип', 'постер', 'банер', 'дизайн', 'намалюй'
  ];

  const actionWords = [
    'oluştur', 'yap', 'tasarla', 'çiz', 'hazırla', 'üret', 'gönder',
    'create', 'make', 'generate', 'draw', 'design',
    'создай', 'сделай', 'сгенерируй', 'нарисуй', 'разработай',
    'створи', 'зроби', 'згенеруй', 'намалюй'
  ];

  return imageWords.some(w => t.includes(w)) && actionWords.some(w => t.includes(w));
}

function isImageEditRequest(text = '') {
  const t = text.toLowerCase();

  const editWords = [
    'değiştir', 'düzenle', 'edit', 'yap', 'ekle', 'kaldır', 'sil',
    'arka plan', 'ön taraf', 'renk', 'saç', 'yüz', 'kıyafet', 'gökyüzü',
    'miami', 'dubai', 'new york', 'orijinal', 'restore', 'turn this',
    'make it', 'replace', 'remove', 'add', 'benzet', 'çevir',
    'daha güzel yap', 'profesyonel yap', 'lüks yap', 'realistic',
    'arkasını', 'önünü', 'yanını', 'üstünü', 'altını', 'rengini',
    'измени', 'отредактируй', 'сделай', 'добавь', 'убери', 'удали', 'замени',
    'фон', 'цвет', 'лицо', 'небо', 'одежду', 'спереди',
    'зміни', 'відредагуй', 'зроби', 'додай', 'прибери', 'видали', 'заміни',
    'фон', 'колір', 'обличчя', 'небо', 'одяг', 'спереду'
  ];

  return editWords.some(k => t.includes(k));
}

function isImageAnalyzeRequest(text = '') {
  const t = text.toLowerCase();
  return [
    'analiz', 'yorumla', 'ne görüyorsun', 'bu nedir', 'açıkla',
    'analyze', 'what is', 'describe',
    'проанализируй', 'что это', 'опиши',
    'проаналізуй', 'що це', 'опиши'
  ].some(k => t.includes(k));
}

async function handleUserText(msg, text) {
  const chatId = msg.chat.id;
  const langRule = languageInstruction(msg, text);
  const lastPhoto = lastPhotoByChat.get(String(chatId));

  logAction(msg, 'text', text);
  stats.text += 1;

  try {
    await bot.sendChatAction(chatId, 'typing');

    if (lastPhoto && isImageEditRequest(text)) {
      await bot.sendMessage(chatId, getLanguageCode(msg, text) === 'ru' ? '🎨 Редактирую фото...' : getLanguageCode(msg, text) === 'uk' ? '🎨 Редагую фото...' : '🎨 Fotoğrafını düzenliyorum...');
      await bot.sendChatAction(chatId, 'upload_photo');

      const edited = await editImageFromPhoto(lastPhoto, text);
      stats.imageEdited += 1;
      logAction(msg, 'image_edit', text, { photoFileId: lastPhoto.fileId });

      await bot.sendPhoto(chatId, edited, { caption: getLanguageCode(msg, text) === 'ru' ? '✅ Фото отредактировано.' : getLanguageCode(msg, text) === 'uk' ? '✅ Фото відредаговано.' : '✅ Fotoğraf düzenlendi.' });
      return;
    }

    if (isImageGenerationRequest(text)) {
      await bot.sendMessage(chatId, getLanguageCode(msg, text) === 'ru' ? '🖼️ Создаю изображение...' : getLanguageCode(msg, text) === 'uk' ? '🖼️ Створюю зображення...' : '🖼️ Görsel oluşturuyorum...');
      await bot.sendChatAction(chatId, 'upload_photo');

      const image = await generateImage(text);
      stats.imageGenerated += 1;
      logAction(msg, 'image_generate', text);

      await bot.sendPhoto(chatId, image, { caption: getLanguageCode(msg, text) === 'ru' ? '✅ Изображение создано.' : getLanguageCode(msg, text) === 'uk' ? '✅ Зображення створено.' : '✅ Görsel oluşturuldu.' });
      return;
    }

    if (lastPhoto && isImageAnalyzeRequest(text)) {
      await bot.sendMessage(chatId, getLanguageCode(msg, text) === 'ru' ? '🔍 Анализирую фото...' : getLanguageCode(msg, text) === 'uk' ? '🔍 Аналізую фото...' : '🔍 Fotoğrafı analiz ediyorum...');
      const answer = await analyzeImage(lastPhoto.base64, text, langRule);
      stats.imageAnalyzed += 1;
      logAction(msg, 'image_analyze', text, { photoFileId: lastPhoto.fileId });
      await sendLong(chatId, answer);
      return;
    }

    const reply = await askText(chatId, text, langRule);
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
  await bot.sendMessage(msg.chat.id, startMessage(msg));
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
🔍 Fotoğraf analiz: ${stats.imageAnalyzed}
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
    `${i + 1}. ${a.time} | ${a.user} | ${a.lang || '-'} | ${a.type}\n${a.text || ''}${a.photoFileId ? `\nPhotoID: ${a.photoFileId}` : ''}`
  );

  await sendLong(msg.chat.id, `🧾 Son Hareketler\n\n${lines.join('\n\n') || 'Henüz hareket yok.'}`);
});

bot.onText(/\/photos/, async (msg) => {
  if (String(msg.from?.id || '') !== ADMIN_TELEGRAM_ID) return;

  const items = savedPhotos.slice(0, 10);
  if (!items.length) {
    await bot.sendMessage(msg.chat.id, 'Henüz fotoğraf yok.');
    return;
  }

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
    const { tmp, buffer, filePath, mime } = await downloadTelegramFile(best.file_id, '.jpg');
    const base64 = buffer.toString('base64');

    const photoRecord = {
      fileId: best.file_id,
      path: tmp,
      buffer,
      base64,
      mime,
      filePath,
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
      const code = getLanguageCode(msg, '');
      const text =
        code === 'ru'
          ? '📸 Фото получено. Напишите, что сделать: например "сделай переднюю часть Miami", "проанализируй", "измени фон".'
          : code === 'uk'
          ? '📸 Фото отримано. Напишіть, що зробити: наприклад "зроби передню частину Miami", "проаналізуй", "зміни фон".'
          : '📸 Fotoğraf alındı. Ne yapmak istediğini normal yaz: "ön tarafı Miami yap", "analiz et", "arka planı değiştir" gibi.';
      await bot.sendMessage(chatId, text);
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

    const code = getLanguageCode(msg, transcript);
    const label = code === 'ru' ? '📝 Текст голосового сообщения:' : code === 'uk' ? '📝 Текст голосового повідомлення:' : '📝 Ses metni:';
    await bot.sendMessage(chatId, `${label}\n${transcript}`);

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

    const code = getLanguageCode(msg, transcript);
    const label = code === 'ru' ? '📝 Текст видеосообщения:' : code === 'uk' ? '📝 Текст відеоповідомлення:' : '📝 Video mesaj metni:';
    await bot.sendMessage(chatId, `${label}\n${transcript}`);

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

    const { buffer } = await downloadTelegramFile(msg.document.file_id, ext);

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

    const reply = await askText(
      chatId,
      `Bu dosyayı analiz et:\n\n${limited}`,
      languageInstruction(msg, limited)
    );

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
      fileId: p.fileId,
      mime: p.mime
    }))
  });
});

app.listen(PORT, () => {
  console.log(`${BOT_NAME} Pro Telegram bot started`);
  console.log(`${BOT_NAME} Pro server running on ${PORT}`);
});
