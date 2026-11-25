# InfluNex — Dağıtım ve Ortam Yönetimi (DEPLOYMENT.md)

## 1. Hedef Altyapı

- **Firebase Projesi:** `karacateknik-b202f`
- **Firebase Hosting Sitesi:** `influnex` (`https://console.firebase.google.com/project/karacateknik-b202f/hosting/sites/influnex`)
- **İzole Firestore Veritabanı:** `influnex-db`
- **İzole Cloud Storage Kovası:** `gs://influnex-b202f`
- **Cloud Run Servisi:** `influnex-web` (`us-central1`)
- **GitHub Deposu:** `https://github.com/Highlife01/influnex`

### Next.js sunucu dağıtımı

`Dockerfile`, Node.js 22 üzerinde üretim derlemesi yapar ve Next.js `standalone` çıktısını ayrıcalıksız kullanıcıyla, `PORT=8080` üzerinde çalıştırır. `.gcloudignore` ve `.dockerignore` yerel ortam dosyalarını, bağımlılıkları ve derleme önbelleklerini kaynak yüklemesinden çıkarır.

```powershell
gcloud run deploy influnex-web --source . --project karacateknik-b202f --region us-central1 --allow-unauthenticated --port 8080 --memory 512Mi --cpu 1 --min-instances 0 --max-instances 3
firebase deploy --only hosting --project karacateknik-b202f
```

Hosting yapılandırması yalnızca `influnex` sitesini ve `influnex-web` servisini hedefler. Bu dağıtım Firestore/Storage kurallarını dağıtmaz ve ödeme özelliklerini etkinleştirmez. Gerçek ödeme ve yetkilendirme için aşağıdaki üretim koşulları ayrıca tamamlanmalıdır.

## 2. Son 5 Deploy Kuralı (Deploy Retention Rule)

Her Firebase Hosting dağıtımı sonrasında `firebase.json` içerisindeki `postdeploy` kancası (`node scripts/cleanup-hosting-versions.mjs`) otomatik olarak çalışır ve `influnex` sitesinde yalnızca **son 5 FINALIZED sürümü** koruyarak eski sürümleri temizler.

## 3. Production Öncesi Kontrol Listesi (Production Blockers)

1. `BANK_TRANSFER_LIVE_ENABLED`: Şirket ticari unvanı, vergi levhası ve gerçek IBAN bilgileri Secret Manager'a girildikten sonra `true` yapılmalıdır.
2. `LEGAL_TERMS_APPROVED`: Hukuk müşaviri tarafından KVKK, Mesafeli Hizmet/Reklamveren ve Influencer sözleşmeleri onaylandıktan sonra `true` yapılmalıdır.
3. `influnex-db`: Firebase Console üzerinde `influnex-db` Firestore veritabanı oluşturulmalı ve `firebase deploy --only firestore` ile kurallar yüklenmelidir.
4. Firebase Authentication'da Google sağlayıcısını etkinleştirin ve yerel/üretim alan adlarını yetkili alan adlarına ekleyin.
5. `FIREBASE_CLIENT_EMAIL` ve `FIREBASE_PRIVATE_KEY` değerlerini sunucu ortamında Secret Manager üzerinden tanımlayın. Bunlar olmadan `/api/auth/profile` özel yetki ataması yapmaz.
6. `SUPERADMIN_EMAIL` varsayılan olarak `cebrailkara@gmail.com` olarak tanımlıdır. E-posta adresi Google tarafından doğrulanmış olmalı; `ADMIN` rolü yalnızca sunucu tarafından özel claim olarak atanır. Bu hesabın erişimini korumak için Google hesabında MFA kullanın.

## 4. Hesap Rolleri ve Giriş

- `/tr/kayit?role=ADVERTISER`: ücretsiz reklamveren hesabı açar ve `/tr/reklamveren/panel` adresine yönlendirir.
- `/tr/kayit?role=CREATOR`: ücretsiz yayıncı/içerik üreticisi hesabı açar ve `/tr/yayinci/panel` adresine yönlendirir.
- `/tr/yonetim`: yalnızca süperadmin özel claim'iyle açılır.
- Google kimliği Firebase Admin SDK ile doğrulanır; ilk hesap rolü sunucuda kaydedilir ve sonraki girişlerde değiştirilemez. Süperadmin rolü istemci isteğinden seçilemez.
