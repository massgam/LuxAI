import 'dotenv/config';
import express from 'express';
import TelegramBot from 'node-telegram-bot-api';
import OpenAI from 'openai';
import fs from 'fs';
import os from 'os';
import path from 'path';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ADMIN_TELEGRAM_ID = String(process.env.ADMIN_TELEGRAM_ID || '');
const BOT_NAME = process.env.BOT_NAME || 'LuxAI';
const MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
const PORT = process.env.PORT || 8080;

if (!TELEGRAM_BOT_TOKEN) throw new Error('TELEGRAM_BOT_TOKEN missing');
if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY missing');

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
const app = express();

const stats = { users: new Map(), messages: 0, voice: 0, photos: 0, files: 0, errors: 0, actions: [] };
const memory = new Map();

function logAction(msg, type, text = '') {
  const u = msg.from || {};
  const user = u.username ? '@' + u.username : (u.first_name || 'Kullanıcı');
  stats.users.set(String(u.id), { id: String(u.id), username: u.username || '', first_name: u.first_name || '', last_seen: new Date().toISOString() });
  stats.actions.unshift(`${new Date().toLocaleString('tr-TR')} | ${type} | ${user} | ${text.slice(0, 80)}`);
  stats.actions = stats.actions.slice(0, 50);
}

function addMemory(chatId, role, content) {
  const key = String(chatId);
  const arr = memory.get(key) || [];
  arr.push({ role, content });
  memory.set(key, arr.slice(-12));
}

async function askAI(chatId, userText, imageBase64 = null) {
  const history = memory.get(String(chatId)) || [];
  const input = [
    { role: 'system', content: `Sen ${BOT_NAME} adında güçlü, profesyonel bir Telegram AI asistanısın. Kullanıcının dilinde cevap ver. Kısa, net ve yardımcı ol.` },
    ...history,
    { role: 'user', content: imageBase64 ? [
      { type: 'input_text', text: userText || 'Bu görseli analiz et.' },
      { type: 'input_image', image_url: `data:image/jpeg;base64,${imageBase64}` }
    ] : userText }
  ];
  const response = await openai.responses.create({ model: MODEL, input });
  return response.output_text || 'Cevap alınamadı.';
}

async function downloadTelegramFile(fileId, ext = '') {
  const file = await bot.getFile(fileId);
  const url = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${file.file_path}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Telegram file download failed');
  const buffer = Buffer.from(await res.arrayBuffer());
  const tmp = path.join(os.tmpdir(), `${fileId}${ext}`);
  fs.writeFileSync(tmp, buffer);
  return { tmp, buffer };
}

bot.onText(/\/start/, async (msg) => {
  logAction(msg, 'start');
  await bot.sendMessage(msg.chat.id, `👋 Hoş geldin ${msg.from?.first_name || ''}\n\nBen ${BOT_NAME}.\n\nYapabileceklerim:\n• Yazılı sohbet\n• Sesli mesajı yazıya çevirip cevaplama\n• Fotoğraf analizi\n• Basit dosya desteği\n\nKomutlar:\n/admin - admin panel\n/clear - sohbet hafızasını sıfırla`);
});

bot.onText(/\/clear/, async (msg) => {
  memory.delete(String(msg.chat.id));
  logAction(msg, 'clear');
  await bot.sendMessage(msg.chat.id, '✅ Sohbet hafızası temizlendi.');
});

bot.onText(/\/admin/, async (msg) => {
  if (String(msg.from?.id || '') !== ADMIN_TELEGRAM_ID) return bot.sendMessage(msg.chat.id, '⛔ Admin yetkin yok.');
  const text = `📊 ${BOT_NAME} Admin Panel\n\n👥 Kullanıcı: ${stats.users.size}\n💬 Mesaj: ${stats.messages}\n🎤 Ses: ${stats.voice}\n🖼️ Fotoğraf: ${stats.photos}\n📄 Dosya: ${stats.files}\n⚠️ Hata: ${stats.errors}\n\n🧾 Son hareketler:\n${stats.actions.slice(0, 20).join('\n') || 'Henüz hareket yok.'}`;
  await bot.sendMessage(msg.chat.id, text);
});

bot.on('photo', async (msg) => {
  stats.photos++; stats.messages++;
  logAction(msg, 'photo', msg.caption || 'fotoğraf');
  try {
    await bot.sendChatAction(msg.chat.id, 'typing');
    const photo = msg.photo[msg.photo.length - 1];
    const { buffer } = await downloadTelegramFile(photo.file_id, '.jpg');
    const b64 = buffer.toString('base64');
    const prompt = msg.caption || 'Bu fotoğrafı detaylı analiz et.';
    const answer = await askAI(msg.chat.id, prompt, b64);
    addMemory(msg.chat.id, 'user', prompt);
    addMemory(msg.chat.id, 'assistant', answer);
    await bot.sendMessage(msg.chat.id, answer);
  } catch (e) {
    stats.errors++; console.error(e);
    await bot.sendMessage(msg.chat.id, '❌ Fotoğraf analizinde hata oluştu.');
  }
});

bot.on('voice', async (msg) => {
  stats.voice++; stats.messages++;
  logAction(msg, 'voice');
  try {
    await bot.sendChatAction(msg.chat.id, 'typing');
    const { tmp } = await downloadTelegramFile(msg.voice.file_id, '.ogg');
    const transcription = await openai.audio.transcriptions.create({ file: fs.createReadStream(tmp), model: 'whisper-1' });
    const text = transcription.text || '';
    const answer = await askAI(msg.chat.id, text);
    addMemory(msg.chat.id, 'user', text);
    addMemory(msg.chat.id, 'assistant', answer);
    await bot.sendMessage(msg.chat.id, `🎤 Sesli mesajın:\n${text}\n\n🤖 Cevap:\n${answer}`);
    fs.unlink(tmp, () => {});
  } catch (e) {
    stats.errors++; console.error(e);
    await bot.sendMessage(msg.chat.id, '❌ Sesli mesaj işlenemedi.');
  }
});

bot.on('document', async (msg) => {
  stats.files++; stats.messages++;
  logAction(msg, 'document', msg.document?.file_name || 'dosya');
  await bot.sendMessage(msg.chat.id, '📄 Dosya aldım. V1’de dosya kaydı yapıyorum; PDF/Word/Excel detaylı okuma V2’de eklenecek.');
});

bot.on('message', async (msg) => {
  if (!msg.text || msg.text.startsWith('/')) return;
  stats.messages++;
  logAction(msg, 'text', msg.text);
  try {
    await bot.sendChatAction(msg.chat.id, 'typing');
    const answer = await askAI(msg.chat.id, msg.text);
    addMemory(msg.chat.id, 'user', msg.text);
    addMemory(msg.chat.id, 'assistant', answer);
    await bot.sendMessage(msg.chat.id, answer);
  } catch (e) {
    stats.errors++; console.error(e);
    await bot.sendMessage(msg.chat.id, '❌ AI cevabı alınamadı. API key, kredi veya modeli kontrol et.');
  }
});

bot.on('polling_error', (e) => { stats.errors++; console.error('polling_error', e.message); });

app.get('/', (_, res) => res.send(`${BOT_NAME} is running ✅`));
app.get('/health', (_, res) => res.json({ ok: true, users: stats.users.size, messages: stats.messages }));
app.use('/miniapp', express.static('public'));
app.listen(PORT, () => console.log(`${BOT_NAME} server running on ${PORT}`));
console.log(`${BOT_NAME} Telegram bot started`);
