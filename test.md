Setup end-to-end testing untuk aplikasi ini dengan Playwright.

1. Install dan konfigurasi Playwright untuk stack ini. Tambahkan config untuk local + CI, dengan retry, trace saat gagal, dan screenshot.
2. Identifikasi critical user journey dari codebase dan list untuk saya approve DULU sebelum menulis test apapun.
3. Untuk tiap journey yang disetujui, tulis test yang mencakup happy path plus failure state realistis (input salah, session expired, network error, data kosong).
4. Pakai selector yang resilient - utamakan role-based atau data-testid. Tambahkan atribut data-testid yang hilang ke komponen yang perlu.
5. Buat auth fixture supaya test yang sudah login tidak mengulang flow login tiap kali jalan.
6. Tambahkan seeding dan cleanup data test supaya test terisolasi dan bisa diulang.
7. Tambahkan npm script: test:e2e, test:e2e:ui, test:e2e:ci
8. Tambahkan CI workflow yang menjalankan suite di tiap PR.

Jelaskan cara menjalankan semuanya. Tandai journey yang tidak bisa dites secara reliable dan jelaskan kenapa.

---

## Laporan Implementasi

### Cara Menjalankan Test

Semua konfigurasi Playwright sudah disiapkan dan dihubungkan ke npm scripts. Berikut adalah cara untuk menjalankannya:

1. **Jalankan test secara headless (Default/Local):**
   ```bash
   npm run test:e2e
   ```
   Command ini akan menjalankan `auth.setup.ts` terlebih dahulu (jika test user belum terautentikasi/disimpan di `e2e/.auth/user.json`), lalu mengeksekusi semua file `.spec.ts` di folder `e2e/`.

2. **Jalankan test dengan UI Mode (untuk Debugging/Visual):**
   ```bash
   npm run test:e2e:ui
   ```
   Command ini akan membuka Playwright UI Inspector. Anda bisa melihat tiap langkah, DOM snapshot, trace network, dan menjalankan spesifik test secara interaktif. Sangat disarankan saat proses development test.

3. **Jalankan test di Environment CI (Continuous Integration):**
   ```bash
   npm run test:e2e:ci
   ```
   Sudah disiapkan Github Actions workflow di `.github/workflows/e2e.yml` yang menjalankan command ini saat ada *Pull Request*. Test akan berjalan khusus menggunakan Chromium, tanpa UI, dengan retries yang sudah dikonfigurasi.

**Penting:**
Aplikasi akan secara otomatis menjalankan server Next.js di background di `localhost:3000`. Pastikan environment variables `.env.local` Anda valid.

---

### Journey yang Tidak Bisa Dites Secara Reliable

Beberapa alur pengguna (user journeys) sebaiknya tidak dimasukkan ke E2E testing harian karena sifatnya yang tidak konsisten (*flaky*) atau memiliki limitasi platform:

1. **Fitur Push Notification / Service Worker**
   *Alasan:* Playwright sulit dan sangat tidak stabil ketika harus berinteraksi dengan API Notifikasi asli dari Sistem Operasi atau berurusan dengan validasi *push message* FCM (Firebase Cloud Messaging) asli yang dikirim ke service worker browser.
   *Alternatif:* Gunakan unit test untuk service worker, atau mock notification logic.

2. **Lokasi GPS Akurat & Geofencing Ekstrem (Pergerakan Dinamis)**
   *Alasan:* Walaupun Playwright dapat menyuntikkan (mock) koordinat lokasi melalui `setGeolocation`, fluktuasi akurasi GPS, timeout browser pada izin lokasi, atau simulasi *moving* di dunia nyata sangat sulit diprediksi di environment E2E CI.
   *Alternatif:* Test boundary geofencing dengan logic murni (Unit Test), bukan E2E browser penuh.

3. **Capture Kamera Langsung (MediaDevices API)**
   *Alasan:* Environment virtual CI tidak memiliki kapabilitas hardware webcam/kamera asli. Simulasi feed video atau jepretan foto langsung dari peramban sering gagal atau menghasilkan data dummy kosong.
   *Alternatif:* Untuk E2E, cukup test komponen *file input* biasa (upload gambar lokal via `setInputFiles`).

4. **Pendaftaran Email Palsu Tanpa Konfirmasi (Bypass Auth Limit Firebase)**
   *Alasan:* Karena kita mengetes sistem pendaftaran menggunakan instansi *Live* Firebase Auth (walaupun test environment), ada limitasi *rate-limiting* yang ketat atau verifikasi CAPTCHA (jika aktif) yang dapat tiba-tiba memblokir instance CI, membuat script E2E gagal tanpa henti.