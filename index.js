import 'dotenv/config';
import express from 'express';
import TelegramBot from 'node-telegram-bot-api';
import OpenAI from 'openai';
import { toFile } from 'openai/uploads';
import fs from 'fs';
import os from 'os';
import path from 'path';
import pdf from 'pdf-parse';
import pg from 'pg';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';

const TELEGRAM_BOT_TOKEN = (process.env.TELEGRAM_BOT_TOKEN || '').trim();
const OPENAI_API_KEY = (process.env.OPENAI_API_KEY || '').trim();
const ADMIN_TELEGRAM_ID = String(process.env.ADMIN_TELEGRAM_ID || '').trim();

const BOT_NAME = process.env.BOT_NAME || 'LuxAI';
const TEXT_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
const VISION_MODEL = process.env.OPENAI_VISION_MODEL || TEXT_MODEL;
const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1';
const TRANSCRIBE_MODEL = process.env.OPENAI_TRANSCRIBE_MODEL || 'gpt-4o-mini-transcribe';
const TTS_MODEL = process.env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts';
const TTS_VOICE = process.env.OPENAI_TTS_VOICE || 'alloy';
const PORT = Number(process.env.PORT || 8080);
const WEBAPP_URL =
  process.env.WEBAPP_URL ||
  process.env.PUBLIC_URL ||
  (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : 'https://luxai-production-8f48.up.railway.app');

if (!TELEGRAM_BOT_TOKEN) throw new Error('TELEGRAM_BOT_TOKEN missing');
if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY missing');

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
const app = express();

app.use(express.json({ limit: '30mb' }));
app.use(express.static('public'));

const { Pool } = pg;
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('railway') ? { rejectUnauthorized: false } : undefined
    })
  : null;

async function initDb() {
  if (!pool) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS luxai_users (
      id TEXT PRIMARY KEY,
      username TEXT,
      first_name TEXT,
      last_name TEXT,
      language_code TEXT,
      first_seen TIMESTAMPTZ DEFAULT NOW(),
      last_seen TIMESTAMPTZ DEFAULT NOW(),
      messages INTEGER DEFAULT 0
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS luxai_actions (
      id BIGSERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      user_id TEXT,
      username TEXT,
      lang TEXT,
      type TEXT,
      text TEXT,
      photo_file_id TEXT
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS luxai_photos (
      id BIGSERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      user_id TEXT,
      username TEXT,
      caption TEXT,
      mime TEXT,
      image_base64 TEXT
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS luxai_messages (
      id BIGSERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      chat_id TEXT,
      user_id TEXT,
      username TEXT,
      role TEXT,
      content TEXT,
      lang TEXT
    );
  `);

  await pool.query(`
    ALTER TABLE luxai_users
    ADD COLUMN IF NOT EXISTS phone_number TEXT,
    ADD COLUMN IF NOT EXISTS country TEXT,
    ADD COLUMN IF NOT EXISTS device TEXT,
    ADD COLUMN IF NOT EXISTS webapp_last_seen TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS text_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS image_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS photo_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS file_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS voice_count INTEGER DEFAULT 0;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS luxai_usage_events (
      id BIGSERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      user_id TEXT,
      username TEXT,
      country TEXT,
      language_code TEXT,
      device TEXT,
      event_type TEXT
    );
  `);
}

initDb().catch(err => console.error('DB init error', err.message));

async function dbSaveUser(msg) {
  if (!pool) return;
  const from = msg.from || {};
  const id = String(from.id || msg.chat?.id || '');
  if (!id) return;
  await pool.query(
    `INSERT INTO luxai_users (id, username, first_name, last_name, language_code, messages)
     VALUES ($1,$2,$3,$4,$5,1)
     ON CONFLICT (id) DO UPDATE SET
       username=EXCLUDED.username,
       first_name=EXCLUDED.first_name,
       last_name=EXCLUDED.last_name,
       language_code=EXCLUDED.language_code,
       last_seen=NOW(),
       messages=luxai_users.messages+1`,
    [id, from.username || '', from.first_name || '', from.last_name || '', from.language_code || '']
  );
}


async function dbSaveUserProfile({ user = {}, country = '', device = '', phoneNumber = '' }) {
  if (!pool) return;

  const id = String(user.id || '');
  if (!id) return;

  await pool.query(
    `INSERT INTO luxai_users (id, username, first_name, last_name, language_code, phone_number, country, device, webapp_last_seen)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())
     ON CONFLICT (id) DO UPDATE SET
       username=EXCLUDED.username,
       first_name=EXCLUDED.first_name,
       last_name=EXCLUDED.last_name,
       language_code=COALESCE(NULLIF(EXCLUDED.language_code,''), luxai_users.language_code),
       phone_number=COALESCE(NULLIF(EXCLUDED.phone_number,''), luxai_users.phone_number),
       country=COALESCE(NULLIF(EXCLUDED.country,''), luxai_users.country),
       device=COALESCE(NULLIF(EXCLUDED.device,''), luxai_users.device),
       webapp_last_seen=NOW(),
       last_seen=NOW()`,
    [
      id,
      user.username || '',
      user.first_name || '',
      user.last_name || '',
      user.language_code || '',
      phoneNumber || '',
      country || '',
      device || ''
    ]
  );
}

async function dbTrackUsage({ user = {}, eventType = '', country = '', device = '', lang = '' }) {
  if (!pool) return;

  const userId = String(user.id || '');
  const username = user.username ? '@' + user.username : [user.first_name, user.last_name].filter(Boolean).join(' ');

  await pool.query(
    `INSERT INTO luxai_usage_events (user_id, username, country, language_code, device, event_type)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [userId, username || '', country || '', lang || user.language_code || '', device || '', eventType || 'unknown']
  );

  const columnMap = {
    text: 'text_count',
    chat: 'text_count',
    image: 'image_count',
    image_generate: 'image_count',
    photo: 'photo_count',
    photo_upload: 'photo_count',
    file: 'file_count',
    pdf: 'file_count',
    voice: 'voice_count'
  };

  const column = columnMap[eventType] || '';

  if (userId && column) {
    await pool.query(
      `UPDATE luxai_users SET ${column} = COALESCE(${column},0) + 1, last_seen = NOW() WHERE id = $1`,
      [userId]
    );
  }
}

function getCountryFromRequest(req) {
  return String(
    req.headers['cf-ipcountry'] ||
    req.headers['x-vercel-ip-country'] ||
    req.headers['x-country-code'] ||
    req.headers['cloudfront-viewer-country'] ||
    ''
  ).toUpperCase();
}

function getDeviceFromRequest(req) {
  const ua = String(req.headers['user-agent'] || '').toLowerCase();

  if (ua.includes('iphone')) return 'iPhone';
  if (ua.includes('ipad')) return 'iPad';
  if (ua.includes('android')) return 'Android';
  if (ua.includes('macintosh') || ua.includes('mac os')) return 'Mac';
  if (ua.includes('windows')) return 'Windows';
  if (ua.includes('linux')) return 'Linux';

  return 'Unknown';
}

function compactUserForDb(user = {}) {
  return {
    id: user.id || '',
    username: user.username || '',
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    language_code: user.language_code || ''
  };
}


async function dbSaveAction(item) {
  if (!pool) return;
  await pool.query(
    `INSERT INTO luxai_actions (user_id, username, lang, type, text, photo_file_id)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [String(item.userId || ''), item.user || '', item.lang || '', item.type || '', item.text || '', item.photoFileId || '']
  );
}

async function dbSavePhoto(record, msg) {
  if (!pool) return;
  await pool.query(
    `INSERT INTO luxai_photos (user_id, username, caption, mime, image_base64)
     VALUES ($1,$2,$3,$4,$5)`,
    [String(msg.from?.id || ''), userName(msg.from), record.caption || '', record.mime || '', record.base64 || '']
  );
}


async function dbSaveMessage(msg, role, content, lang = '') {
  if (!pool) return;
  const from = msg.from || {};
  await pool.query(
    `INSERT INTO luxai_messages (chat_id, user_id, username, role, content, lang)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [
      String(msg.chat?.id || ''),
      String(from.id || ''),
      userName(from),
      role,
      String(content || '').slice(0, 8000),
      lang || getLanguageCode(msg, content)
    ]
  );
}

async function dbGetUserMemory(userId, limit = 24) {
  if (!pool || !userId) return '';
  const result = await pool.query(
    `SELECT role, content FROM luxai_messages
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [String(userId), limit]
  );
  return result.rows.reverse()
    .map(r => `${r.role === 'user' ? 'User' : 'Assistant'}: ${r.content}`)
    .join('\n');
}

function isWebSearchRequest(text = '') {
  const t = String(text || '').toLowerCase();
  return [
    'bugün', 'şu an', 'son durum', 'güncel', 'haber', 'fiyat', 'piyasa',
    'kripto ne durumda', 'hava durumu', 'latest', 'today', 'current', 'news',
    'price', 'market', 'сегодня', 'сейчас', 'новости', 'курс', 'цена',
    'сьогодні', 'зараз', 'новини', 'ціна'
  ].some(k => t.includes(k));
}

function startKeyboard(lang = 'tr') {
  const labels = {
    tr: {
      open: '🚀 LuxAI Aç',
      image: '🎨 Görsel Oluştur',
      voice: '🎙️ Sesli Asistan',
      files: '📄 Dosya / Foto Analizi'
    },
    en: {
      open: '🚀 Open LuxAI',
      image: '🎨 Create Image',
      voice: '🎙️ Voice Assistant',
      files: '📄 File / Photo Analysis'
    },
    ru: {
      open: '🚀 Открыть LuxAI',
      image: '🎨 Создать изображение',
      voice: '🎙️ Голосовой ассистент',
      files: '📄 Анализ файла / фото'
    },
    uk: {
      open: '🚀 Відкрити LuxAI',
      image: '🎨 Створити зображення',
      voice: '🎙️ Голосовий асистент',
      files: '📄 Аналіз файлу / фото'
    }
  };

  const l = labels[lang] || labels.tr;

  return {
    inline_keyboard: [
      [{ text: l.open, web_app: { url: WEBAPP_URL } }],
      [
        { text: l.image, web_app: { url: `${WEBAPP_URL}?mode=studio` } },
        { text: l.voice, web_app: { url: `${WEBAPP_URL}?mode=voice` } }
      ],
      [{ text: l.files, web_app: { url: `${WEBAPP_URL}?mode=files` } }]
    ]
  };
}

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

function startMessage(msg, text = '') {
  const name = userName(msg.from);
  const code = getLanguageCode(msg, text);

  if (code === 'ru') {
    return `👋 Добро пожаловать ${name}

✨ ${BOT_NAME} Pro готов.

🎨 Создание изображений
🖼️ Редактирование фото
🎙️ Голосовой ассистент
📄 Анализ файлов
🌍 Русский • Türkçe • Українська • English

👇 Нажмите кнопку ниже, чтобы открыть Mini App.`;
  }

  if (code === 'uk') {
    return `👋 Ласкаво просимо ${name}

✨ ${BOT_NAME} Pro готовий.

🎨 Створення зображень
🖼️ Редагування фото
🎙️ Голосовий асистент
📄 Аналіз файлів
🌍 Українська • Türkçe • Русский • English

👇 Натисніть кнопку нижче, щоб відкрити Mini App.`;
  }

  if (code === 'en') {
    return `👋 Welcome ${name}

✨ ${BOT_NAME} Pro is ready.

🎨 Image generation
🖼️ Photo editing
🎙️ Voice assistant
📄 File analysis
🌍 English • Türkçe • Русский • Українська

👇 Tap the button below to open the Mini App.`;
  }

  return `👋 Hoş geldin ${name}

✨ ${BOT_NAME} Pro hazır.

🎨 Görsel oluşturma
🖼️ Fotoğraf düzenleme
🎙️ Sesli asistan
📄 Dosya analizi
🌍 Türkçe • Русский • Українська • English

👇 Mini App'i açmak için aşağıdaki butona dokun.`;
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
  dbSaveUser(msg).catch(err => console.error('DB user save error', err.message));
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
  dbSaveAction(item).catch(err => console.error('DB action save error', err.message));
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

async function askText(chatId, userText, langRule = '', userId = '') {
  const shortHistory = getMemory(chatId)
    .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n');

  const longHistory = await dbGetUserMemory(userId, 24).catch(() => '');

  const input = `You are ${BOT_NAME}, a powerful professional Telegram AI assistant.

Language rule:
${langRule || 'Detect the user language and reply in the same language.'}

Important rules:
- Never send image links when user asks for an image.
- If the user requests an image, logo, poster, banner, design, drawing or photo generation, the bot system will generate it automatically.
- If the user sends a photo and asks to change/add/remove/replace something, the bot system will edit the photo automatically.
- If fresh/current information is needed, use web search.
- Be short, helpful and professional.

Long-term user memory from PostgreSQL:
${longHistory || 'No long-term memory yet.'}

Recent conversation memory:
${shortHistory || 'No recent conversation.'}

User message:
${userText}`;

  const payload = { model: TEXT_MODEL, input };

  if (isWebSearchRequest(userText)) {
    payload.tools = [{ type: 'web_search_preview' }];
  }

  const response = await openai.responses.create(payload);
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

  if (!image) {
    throw new Error('Image generation returned no image');
  }

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
  const rawMime = String(photoRecord.mime || 'image/jpeg').toLowerCase();

  const mime =
    rawMime.includes('png') ? 'image/png' :
    rawMime.includes('webp') ? 'image/webp' :
    'image/jpeg';

  const ext =
    mime === 'image/png' ? 'png' :
    mime === 'image/webp' ? 'webp' :
    'jpg';

  const imageFile = await toFile(
    photoRecord.buffer,
    `telegram-photo.${ext}`,
    { type: mime }
  );

  const result = await openai.images.edit({
    model: IMAGE_MODEL,
    image: imageFile,
    prompt: `${prompt}. Keep the original photo realistic and only apply the requested change.`,
    size: '1024x1024'
  });

  const image = result.data?.[0];

  if (!image) {
    throw new Error('Image edit returned no image');
  }

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


async function textToSpeechBuffer(text) {
  const speech = await openai.audio.speech.create({
    model: TTS_MODEL,
    voice: TTS_VOICE,
    input: String(text || '').slice(0, 4000),
    format: 'mp3'
  });

  return Buffer.from(await speech.arrayBuffer());
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
  const t = String(text || '').toLowerCase().trim();

  // Mini App image screen sends this prefix, always generate new image
  if (
    t.startsWith('görsel oluştur:') ||
    t.startsWith('create image:') ||
    t.startsWith('создай изображение:') ||
    t.startsWith('створи зображення:')
  ) {
    return true;
  }

  const imageWords = [
    'görsel', 'resim', 'fotoğraf', 'foto', 'image', 'picture', 'photo',
    'logo', 'afiş', 'poster', 'banner', 'tasarım', 'design', 'çizim',
    'wallpaper', 'kapak', 'reklam görseli', 'sahne', 'manzara',
    'insan', 'kişi', 'adam', 'erkek', 'kadın', 'çocuk', 'kız', 'portre',
    'at', 'fare', 'kedi', 'köpek', 'hayvan', 'araba', 'ev', 'şehir',
    'person', 'people', 'man', 'woman', 'boy', 'girl', 'portrait',
    'horse', 'mouse', 'cat', 'dog', 'animal', 'car', 'city',
    'изображение', 'картинка', 'фото', 'логотип', 'постер', 'баннер', 'дизайн', 'нарисуй',
    'человек', 'люди', 'мужчина', 'женщина', 'портрет', 'лошадь', 'мышь',
    'зображення', 'картинка', 'фото', 'логотип', 'постер', 'банер', 'дизайн', 'намалюй',
    'людина', 'люди', 'чоловік', 'жінка', 'портрет', 'кінь', 'миша'
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
    'фон', 'колір', 'обличчя', 'небо', 'одяг', 'спереду',
    'bu foto', 'bu resim', 'bu görsel', 'buna benzer', 'fotoya benzer', 'aynı kişi',
    'this photo', 'this image', 'similar to this', 'same person',
    'это фото', 'это изображение', 'тот же человек',
    'це фото', 'це зображення', 'та сама людина'
  ];

  return editWords.some(k => t.includes(k));
}


function isPhotoBasedTransformRequest(text = '') {
  const t = String(text || '').toLowerCase().trim();

  const photoRefs = [
    'bu foto', 'bu resim', 'bu görsel', 'buna benzer', 'foto ya benzer', 'fotoya benzer',
    'aynı kişi', 'kişiyi koru', 'yüzü koru', 'arkadaşım', 'beni', 'onu',
    'this photo', 'this image', 'similar to this', 'same person', 'keep the person', 'keep face',
    'это фото', 'это изображение', 'похоже на это', 'тот же человек', 'сохрани человека', 'сохрани лицо',
    'це фото', 'це зображення', 'схоже на це', 'та сама людина', 'збережи людину', 'збережи обличчя'
  ];

  const transformWords = [
    'oluştur', 'yap', 'düzenle', 'değiştir', 'benzer', 'aynı', 'arka plan', 'background',
    'create', 'make', 'edit', 'change', 'similar', 'same',
    'создай', 'сделай', 'измени', 'отредактируй', 'похож',
    'створи', 'зроби', 'зміни', 'відредагуй', 'схож'
  ];

  return photoRefs.some(w => t.includes(w)) || (
    transformWords.some(w => t.includes(w)) &&
    ['foto', 'photo', 'image', 'resim', 'görsel', 'фото', 'зображення'].some(w => t.includes(w))
  );
}

function buildPhotoEditPrompt(userPrompt = '') {
  const p = String(userPrompt || '').trim();

  return `${p}

Use the uploaded image as the base image. Preserve the real person from the uploaded photo as much as possible: face identity, facial features, pose and body should stay consistent. Apply only the requested visual changes such as background, lighting, style, clothes, environment or composition. Create a polished professional edit, not a new unrelated person.`;
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

    if (lastPhoto && (isPhotoBasedTransformRequest(text) || isImageEditRequest(text))) {
      await bot.sendMessage(chatId, getLanguageCode(msg, text) === 'ru' ? '🎨 Редактирую фото...' : getLanguageCode(msg, text) === 'uk' ? '🎨 Редагую фото...' : '🎨 Fotoğrafını düzenliyorum...');
      await bot.sendChatAction(chatId, 'upload_photo');

      const edited = await editImageFromPhoto(lastPhoto, buildPhotoEditPrompt(text));
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

    if (lastPhoto && isImageEditRequest(text)) {
      await bot.sendMessage(chatId, getLanguageCode(msg, text) === 'ru' ? '🎨 Редактирую фото...' : getLanguageCode(msg, text) === 'uk' ? '🎨 Редагую фото...' : '🎨 Fotoğrafını düzenliyorum...');
      await bot.sendChatAction(chatId, 'upload_photo');

      const edited = await editImageFromPhoto(lastPhoto, text);
      stats.imageEdited += 1;
      logAction(msg, 'image_edit', text, { photoFileId: lastPhoto.fileId });

      await bot.sendPhoto(chatId, edited, { caption: getLanguageCode(msg, text) === 'ru' ? '✅ Фото отредактировано.' : getLanguageCode(msg, text) === 'uk' ? '✅ Фото відредаговано.' : '✅ Fotoğraf düzenlendi.' });
      return;
    }

    await dbSaveMessage(msg, 'user', text, getLanguageCode(msg, text)).catch(err => console.error('DB user message save error', err.message));
    const reply = await askText(chatId, text, langRule, msg.from?.id);
    addMemory(chatId, 'user', text);
    addMemory(chatId, 'assistant', reply);
    await dbSaveMessage(msg, 'assistant', reply, getLanguageCode(msg, text)).catch(err => console.error('DB assistant message save error', err.message));
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
  await bot.sendMessage(msg.chat.id, startMessage(msg, msg.text || ''), { reply_markup: startKeyboard(getLanguageCode(msg, msg.text || '')) });
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
  if (!msg.text) return;

  const command = String(msg.text || '').trim().split(/\s+/)[0].toLowerCase();

  if (['/start', '/admin', '/logs', '/photos', '/clear'].includes(command)) return;

  logAction(msg, 'mini_app_redirect_text', msg.text);

  await bot.sendMessage(msg.chat.id, startMessage(msg, msg.text || msg.caption || ''), {
    reply_markup: startKeyboard(getLanguageCode(msg, msg.text || msg.caption || ''))
  });
});

bot.on('photo', async (msg) => {
  stats.photos += 1;
  logAction(msg, 'mini_app_redirect_photo', msg.caption || 'photo');
  await bot.sendMessage(msg.chat.id, startMessage(msg, msg.text || msg.caption || ''), {
    reply_markup: startKeyboard(getLanguageCode(msg, msg.text || msg.caption || ''))
  });
});

bot.on('voice', async (msg) => {
  stats.voice += 1;
  logAction(msg, 'mini_app_redirect_voice', 'voice');
  await bot.sendMessage(msg.chat.id, startMessage(msg, msg.text || msg.caption || ''), {
    reply_markup: startKeyboard(getLanguageCode(msg, msg.text || msg.caption || ''))
  });
});

bot.on('video_note', async (msg) => {
  stats.videoNotes += 1;
  logAction(msg, 'mini_app_redirect_video_note', 'video_note');
  await bot.sendMessage(msg.chat.id, startMessage(msg, msg.text || msg.caption || ''), {
    reply_markup: startKeyboard(getLanguageCode(msg, msg.text || msg.caption || ''))
  });
});

bot.on('document', async (msg) => {
  stats.files += 1;
  logAction(msg, 'mini_app_redirect_document', msg.document?.file_name || 'document');
  await bot.sendMessage(msg.chat.id, startMessage(msg, msg.text || msg.caption || ''), {
    reply_markup: startKeyboard(getLanguageCode(msg, msg.text || msg.caption || ''))
  });
});

bot.on('polling_error', (err) => {
  stats.errors += 1;
  console.error('polling_error', err.message);
});


function bufferToPublicImage(image) {
  if (Buffer.isBuffer(image)) {
    return `data:image/png;base64,${image.toString('base64')}`;
  }
  return String(image || '');
}

app.post('/api/upload-photo', async (req, res) => {
  try {
    const user = req.body?.user || {};
    const imageBase64 = String(req.body?.imageBase64 || '');
    const mime = String(req.body?.mime || 'image/jpeg');
    const caption = String(req.body?.caption || '');

    if (!imageBase64) {
      return res.status(400).json({ ok: false, error: 'imageBase64 is required' });
    }

    const cleanBase64 = imageBase64.includes(',')
      ? imageBase64.split(',').pop()
      : imageBase64;

    const buffer = Buffer.from(cleanBase64, 'base64');
    const chatId = `webapp-${user.id || 'guest'}`;

    const fakeMsg = {
      chat: { id: chatId },
      from: {
        id: user.id || 'webapp',
        username: user.username || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        language_code: user.language_code || ''
      }
    };

    const ext = mime.includes('png') ? '.png' : mime.includes('webp') ? '.webp' : '.jpg';
    const tmp = path.join(os.tmpdir(), `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`);
    fs.writeFileSync(tmp, buffer);

    const photoRecord = {
      fileId: `miniapp-${Date.now()}`,
      path: tmp,
      buffer,
      base64: buffer.toString('base64'),
      mime,
      filePath: tmp,
      time: new Date().toLocaleString('tr-TR'),
      user: userName(fakeMsg.from),
      caption
    };

    lastPhotoByChat.set(String(chatId), photoRecord);
    savedPhotos.unshift(photoRecord);
    savedPhotos.splice(30);
    dbSavePhoto(photoRecord, fakeMsg).catch(err => console.error('DB mini photo save error', err.message));

    const country = getCountryFromRequest(req);
    const device = getDeviceFromRequest(req);

    await dbSaveUserProfile({ user: compactUserForDb(fakeMsg.from), country, device }).catch(err => console.error('DB mini photo profile save error', err.message));
    await dbTrackUsage({ user: compactUserForDb(fakeMsg.from), eventType: 'photo_upload', country, device, lang: user.language_code || '' }).catch(err => console.error('DB photo usage save error', err.message));

    stats.photos += 1;
    logAction(fakeMsg, 'mini_app_photo', caption || 'Mini App photo uploaded', {
      photoFileId: photoRecord.fileId
    });

    res.json({ ok: true, message: 'Photo uploaded' });
  } catch (err) {
    stats.errors += 1;
    console.error('mini app /api/upload-photo error', err);
    res.status(500).json({ ok: false, error: err.message || 'Photo upload failed' });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const message = String(req.body?.message || '').trim();
    const user = req.body?.user || {};
    const lang = String(req.body?.lang || user.language_code || '').toLowerCase();

    if (!message) {
      return res.status(400).json({ ok: false, error: 'Message is required' });
    }

    const fakeMsg = {
      chat: { id: `webapp-${user.id || 'guest'}` },
      from: {
        id: user.id || 'webapp',
        username: user.username || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        language_code: lang || ''
      }
    };

    const chatId = fakeMsg.chat.id;
    const langRule = languageInstruction(fakeMsg, message);
    const lastPhoto = lastPhotoByChat.get(String(chatId));
    const country = getCountryFromRequest(req);
    const device = getDeviceFromRequest(req);

    await dbSaveUserProfile({ user: compactUserForDb(fakeMsg.from), country, device }).catch(err => console.error('DB mini profile save error', err.message));
    await dbTrackUsage({ user: compactUserForDb(fakeMsg.from), eventType: 'chat', country, device, lang }).catch(err => console.error('DB usage save error', err.message));

    logAction(fakeMsg, 'mini_app_chat', message);

    if (lastPhoto && (isPhotoBasedTransformRequest(message) || isImageEditRequest(message))) {
      const edited = await editImageFromPhoto(lastPhoto, buildPhotoEditPrompt(message));
      stats.imageEdited += 1;
      await dbTrackUsage({ user: compactUserForDb(fakeMsg.from), eventType: 'image_generate', country, device, lang }).catch(err => console.error('DB image edit usage save error', err.message));
      logAction(fakeMsg, 'mini_app_image_edit', message, { photoFileId: lastPhoto.fileId });

      return res.json({
        ok: true,
        type: 'image',
        reply: getLanguageCode(fakeMsg, message) === 'ru'
          ? '✅ Фото отредактировано.'
          : getLanguageCode(fakeMsg, message) === 'uk'
          ? '✅ Фото відредаговано.'
          : '✅ Fotoğraf düzenlendi.',
        image: bufferToPublicImage(edited)
      });
    }

    if (isImageGenerationRequest(message)) {
      const image = await generateImage(message);
      stats.imageGenerated += 1;
      await dbTrackUsage({ user: compactUserForDb(fakeMsg.from), eventType: 'image_generate', country, device, lang }).catch(err => console.error('DB image usage save error', err.message));
      logAction(fakeMsg, 'mini_app_image_generate', message);

      return res.json({
        ok: true,
        type: 'image',
        reply: getLanguageCode(fakeMsg, message) === 'ru'
          ? '✅ Изображение создано.'
          : getLanguageCode(fakeMsg, message) === 'uk'
          ? '✅ Зображення створено.'
          : '✅ Görsel oluşturuldu.',
        image: bufferToPublicImage(image)
      });
    }

    if (lastPhoto && isImageAnalyzeRequest(message)) {
      const answer = await analyzeImage(lastPhoto.base64, message, langRule);
      stats.imageAnalyzed += 1;
      logAction(fakeMsg, 'mini_app_image_analyze', message, { photoFileId: lastPhoto.fileId });

      return res.json({ ok: true, type: 'text', reply: answer });
    }

    if (lastPhoto && isImageEditRequest(message)) {
      const edited = await editImageFromPhoto(lastPhoto, message);
      stats.imageEdited += 1;
      logAction(fakeMsg, 'mini_app_image_edit', message, { photoFileId: lastPhoto.fileId });

      return res.json({
        ok: true,
        type: 'image',
        reply: getLanguageCode(fakeMsg, message) === 'ru'
          ? '✅ Фото отредактировано.'
          : getLanguageCode(fakeMsg, message) === 'uk'
          ? '✅ Фото відредаговано.'
          : '✅ Fotoğraf düzenlendi.',
        image: bufferToPublicImage(edited)
      });
    }

    await dbSaveMessage(fakeMsg, 'user', message, getLanguageCode(fakeMsg, message)).catch(err => console.error('DB mini user message save error', err.message));
    const reply = await askText(chatId, message, langRule, fakeMsg.from.id);

    addMemory(chatId, 'user', message);
    addMemory(chatId, 'assistant', reply);
    await dbSaveMessage(fakeMsg, 'assistant', reply, getLanguageCode(fakeMsg, message)).catch(err => console.error('DB mini assistant message save error', err.message));

    res.json({ ok: true, type: 'text', reply });
  } catch (err) {
    stats.errors += 1;
    console.error('mini app /api/chat error', err);
    const raw = String(err.message || '');
    const safeMsg = raw.includes('safety') || raw.includes('rejected')
      ? 'Bu görsel isteği sistem tarafından reddedildi. Fotoğraf düzenleme için daha net yaz: “Bu fotoğrafın arka planını değiştir, kişiyi koru” gibi.'
      : raw || 'Mini App chat failed';

    res.status(500).json({
      ok: false,
      error: safeMsg
    });
  }
});


app.post('/api/upload-file', async (req, res) => {
  try {
    const user = req.body?.user || {};
    const fileBase64 = String(req.body?.fileBase64 || '');
    const fileName = String(req.body?.fileName || 'file');
    const mime = String(req.body?.mime || '');
    const lang = String(req.body?.lang || user.language_code || '').toLowerCase();

    if (!fileBase64) {
      return res.status(400).json({ ok: false, error: 'fileBase64 is required' });
    }

    const cleanBase64 = fileBase64.includes(',') ? fileBase64.split(',').pop() : fileBase64;
    const buffer = Buffer.from(cleanBase64, 'base64');
    const ext = path.extname(fileName).toLowerCase();

    const fakeMsg = {
      chat: { id: `webapp-${user.id || 'guest'}` },
      from: {
        id: user.id || 'webapp',
        username: user.username || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        language_code: lang || ''
      }
    };

    const country = getCountryFromRequest(req);
    const device = getDeviceFromRequest(req);

    await dbSaveUserProfile({ user: compactUserForDb(fakeMsg.from), country, device }).catch(err => console.error('DB mini file profile save error', err.message));
    await dbTrackUsage({ user: compactUserForDb(fakeMsg.from), eventType: 'file', country, device, lang }).catch(err => console.error('DB file usage save error', err.message));

    let text = '';
    if (ext === '.pdf' || mime.includes('pdf')) {
      const data = await pdf(buffer);
      text = data.text || '';
    } else if (ext === '.docx') {
      const data = await mammoth.extractRawText({ buffer });
      text = data.value || '';
    } else if (['.xlsx', '.xls'].includes(ext)) {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      text = workbook.SheetNames.map(name => {
        const sheet = workbook.Sheets[name];
        return `Sheet: ${name}\n${XLSX.utils.sheet_to_csv(sheet)}`;
      }).join('\n\n');
    } else if (['.txt', '.md', '.csv', '.json'].includes(ext) || mime.startsWith('text/')) {
      text = buffer.toString('utf8');
    } else {
      return res.status(400).json({ ok: false, error: 'Supported files: PDF, DOCX, XLSX, TXT, MD, CSV, JSON' });
    }

    if (!text.trim()) {
      return res.status(400).json({ ok: false, error: 'Dosyadan okunabilir metin çıkaramadım. Tarama PDF ise OCR desteği gerekir.' });
    }

    const limited = text.slice(0, 12000);
    logAction(fakeMsg, 'mini_app_file', `${fileName}\n${limited.slice(0, 500)}`);

    const reply = await askText(
      fakeMsg.chat.id,
      `Analyze this file:\n\n${limited}`,
      languageInstruction(fakeMsg, limited)
    );

    res.json({ ok: true, type: 'text', reply });
  } catch (err) {
    stats.errors += 1;
    console.error('mini app /api/upload-file error', err);
    res.status(500).json({ ok: false, error: err.message || 'File upload failed' });
  }
});



app.post('/api/transcribe', async (req, res) => {
  try {
    const audioBase64 = String(req.body?.audioBase64 || '');
    const mime = String(req.body?.mime || 'audio/webm');
    const user = req.body?.user || {};

    if (!audioBase64) {
      return res.status(400).json({ ok: false, error: 'audioBase64 is required' });
    }

    const cleanBase64 = audioBase64.includes(',') ? audioBase64.split(',').pop() : audioBase64;
    const buffer = Buffer.from(cleanBase64, 'base64');
    const ext = mime.includes('mp4') ? '.mp4' : mime.includes('ogg') ? '.ogg' : mime.includes('mpeg') ? '.mp3' : '.webm';
    const tmp = path.join(os.tmpdir(), `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`);
    fs.writeFileSync(tmp, buffer);

    const transcript = await transcribeFile(tmp);

    const fakeMsg = {
      chat: { id: `webapp-${user.id || 'guest'}` },
      from: {
        id: user.id || 'webapp',
        username: user.username || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        language_code: user.language_code || ''
      }
    };

    const country = getCountryFromRequest(req);
    const device = getDeviceFromRequest(req);
    await dbSaveUserProfile({ user: compactUserForDb(fakeMsg.from), country, device }).catch(err => console.error('DB mini voice profile save error', err.message));
    await dbTrackUsage({ user: compactUserForDb(fakeMsg.from), eventType: 'voice', country, device, lang: user.language_code || '' }).catch(err => console.error('DB voice usage save error', err.message));

    logAction(fakeMsg, 'mini_app_voice_transcript', transcript);
    res.json({ ok: true, transcript });
  } catch (err) {
    stats.errors += 1;
    console.error('mini app /api/transcribe error', err);
    res.status(500).json({ ok: false, error: err.message || 'Voice transcription failed' });
  }
});

app.post('/api/tts', async (req, res) => {
  try {
    const text = String(req.body?.text || '').trim();
    if (!text) {
      return res.status(400).json({ ok: false, error: 'Text is required' });
    }

    const audio = await textToSpeechBuffer(text);
    res.json({
      ok: true,
      audio: `data:audio/mpeg;base64,${audio.toString('base64')}`
    });
  } catch (err) {
    stats.errors += 1;
    console.error('mini app /api/tts error', err);
    res.status(500).json({
      ok: false,
      error: err.message || 'TTS failed'
    });
  }
});



app.post('/api/save-phone', async (req, res) => {
  try {
    const user = req.body?.user || {};
    const phoneNumber = String(req.body?.phoneNumber || '').trim();

    if (!phoneNumber) {
      return res.status(400).json({ ok: false, error: 'phoneNumber is required' });
    }

    const country = getCountryFromRequest(req);
    const device = getDeviceFromRequest(req);

    await dbSaveUserProfile({
      user: compactUserForDb(user),
      country,
      device,
      phoneNumber
    });

    res.json({ ok: true });
  } catch (err) {
    console.error('save-phone error', err);
    res.status(500).json({ ok: false, error: err.message || 'Phone save failed' });
  }
});

app.post('/api/config', async (req, res) => {
  try {
    const user = req.body?.user || {};
    const userId = String(user.id || '');
    const username = String(user.username || '').replace('@', '').toLowerCase();
    const adminUsername = String(process.env.ADMIN_TELEGRAM_USERNAME || '').replace('@', '').toLowerCase();

    const country = getCountryFromRequest(req);
    const device = getDeviceFromRequest(req);

    await dbSaveUserProfile({
      user: compactUserForDb(user),
      country,
      device
    }).catch(err => console.error('DB profile save error', err.message));

    const isAdmin =
      Boolean(ADMIN_TELEGRAM_ID && userId === String(ADMIN_TELEGRAM_ID)) ||
      Boolean(adminUsername && username === adminUsername);

    res.json({
      ok: true,
      isAdmin,
      bot: BOT_NAME,
      country,
      device
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message || 'Config failed' });
  }
});

app.get('/health', (_, res) => res.json({ ok: true, bot: BOT_NAME }));

app.get('/admin-data', async (req, res) => {
  try {
    const userId = String(req.query.userId || req.query.adminId || '');
    const username = String(req.query.username || '').replace('@', '').toLowerCase();
    const adminUsername = String(process.env.ADMIN_TELEGRAM_USERNAME || '').replace('@', '').toLowerCase();

    const isAdmin =
      Boolean(ADMIN_TELEGRAM_ID && userId === String(ADMIN_TELEGRAM_ID)) ||
      Boolean(adminUsername && username === adminUsername);

    if (!isAdmin) {
      return res.status(403).json({ ok: false, error: 'Forbidden' });
    }

    let dbUsers = [];
    let dbActions = [];
    let dbPhotos = [];
    let dbMessages = [];

    if (pool) {
      try {
        const usersResult = await pool.query('SELECT * FROM luxai_users ORDER BY last_seen DESC LIMIT 500');
        const actionsResult = await pool.query('SELECT * FROM luxai_actions ORDER BY created_at DESC LIMIT 1000');
        const photosResult = await pool.query('SELECT id, created_at, user_id, username, caption, mime, image_base64 FROM luxai_photos ORDER BY created_at DESC LIMIT 300');
        const messagesResult = await pool.query('SELECT id, created_at, chat_id, user_id, username, role, content, lang FROM luxai_messages ORDER BY created_at DESC LIMIT 1500');

        dbUsers = usersResult.rows;
        dbActions = actionsResult.rows.map(a => ({
          time: a.created_at,
          userId: a.user_id,
          user: a.username || a.user_id || 'Unknown',
          username: a.username || '',
          lang: a.lang,
          type: a.type,
          text: a.text,
          photoFileId: a.photo_file_id
        }));
        dbPhotos = photosResult.rows.map(p => ({
          time: p.created_at,
          userId: p.user_id,
          user: p.username || p.user_id || 'Unknown',
          username: p.username || p.user_id || 'Unknown',
          caption: p.caption || '',
          mime: p.mime || 'image/jpeg',
          image: p.image_base64 ? `data:${p.mime || 'image/jpeg'};base64,${p.image_base64}` : ''
        }));
        dbMessages = messagesResult.rows.map(m => ({
          time: m.created_at,
          userId: m.user_id,
          user: m.username || m.user_id || 'Unknown',
          username: m.username || '',
          lang: m.lang,
          type: `chat_${m.role}`,
          role: m.role,
          text: m.content
        }));
      } catch (dbErr) {
        console.error('admin db read error', dbErr.message);
      }
    }

    const memoryUsers = Array.from(stats.users.values());
    const memoryActions = stats.actions.slice(0, 1000);
    const memoryPhotos = savedPhotos.slice(0, 200).map(p => ({
      time: p.time,
      user: p.user,
      username: p.user,
      caption: p.caption,
      fileId: p.fileId,
      mime: p.mime,
      image: p.base64 ? `data:${p.mime || 'image/jpeg'};base64,${p.base64}` : ''
    }));

    const mergedUsersMap = new Map();

    for (const u of dbUsers) {
      const id = String(u.id || '');
      if (!id) continue;
      mergedUsersMap.set(id, {
        id,
        username: u.username || '',
        first_name: u.first_name || '',
        last_name: u.last_name || '',
        language_code: u.language_code || '',
        phone_number: u.phone_number || '',
        country: u.country || '',
        device: u.device || '',
        first_seen: u.first_seen || '',
        last_seen: u.last_seen || '',
        webapp_last_seen: u.webapp_last_seen || '',
        messages: Number(u.messages || 0),
        text_count: Number(u.text_count || 0),
        image_count: Number(u.image_count || 0),
        photo_count: Number(u.photo_count || 0),
        file_count: Number(u.file_count || 0),
        voice_count: Number(u.voice_count || 0)
      });
    }

    for (const u of memoryUsers) {
      const id = String(u.id || '');
      if (!id) continue;
      if (!mergedUsersMap.has(id)) {
        mergedUsersMap.set(id, {
          ...u,
          phone_number: '',
          country: '',
          device: '',
          text_count: 0,
          image_count: 0,
          photo_count: 0,
          file_count: 0,
          voice_count: 0
        });
      }
    }

    const mergedUsers = Array.from(mergedUsersMap.values());

    const countryStats = {};
    const languageStats = {};
    const deviceStats = {};

    mergedUsers.forEach(u => {
      const country = u.country || 'Unknown';
      const lang = u.language_code || 'Unknown';
      const device = u.device || 'Unknown';
      countryStats[country] = (countryStats[country] || 0) + 1;
      languageStats[lang] = (languageStats[lang] || 0) + 1;
      deviceStats[device] = (deviceStats[device] || 0) + 1;
    });

    res.json({
      ok: true,
      stats: {
        ...stats,
        users: mergedUsers,
        countryStats,
        languageStats,
        deviceStats
      },
      db: {
        enabled: Boolean(pool),
        users: dbUsers,
        actions: dbActions,
        photos: dbPhotos,
        messages: dbMessages
      },
      users: mergedUsers,
      lastActions: [...dbMessages, ...dbActions, ...memoryActions],
      photos: [...memoryPhotos, ...dbPhotos]
    });
  } catch (err) {
    console.error('admin-data error', err);
    res.status(500).json({ ok: false, error: err.message || 'Admin data failed' });
  }
});

app.listen(PORT, () => {
  console.log(`${BOT_NAME} Pro Telegram bot started`);
  console.log(`${BOT_NAME} Pro server running on ${PORT}`);
});
