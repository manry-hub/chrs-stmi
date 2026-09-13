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