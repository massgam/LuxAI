# LuxAI Professional Admin Update

## Dosyalar
- `index.js` → GitHub ana dizindeki `index.js` ile değiştir.
- `app.js` → `public/app.js` ile değiştir.
- `styles-patch.css` → içeriğini `public/styles.css` dosyasının en altına ekle.

## Eklenenler
- Admin panelde ülke, dil, cihaz, son giriş, mesaj, görsel, fotoğraf, PDF/dosya, ses sayısı
- Username ve Telegram ID
- Opsiyonel telefon kaydetme alanı
- `/api/save-phone`
- `/api/config` üzerinden ülke/cihaz takibi
- Mini App kullanım takibi
- Bot tarafında Telegram chat yerine Mini App yönlendirme

## Önemli
Telefon numarası otomatik alınamaz. Kullanıcı profil sayfasından kendisi yazıp kaydederse admin panelde görünür.
