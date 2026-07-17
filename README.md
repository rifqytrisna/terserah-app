# 🍜 Terserah App (The Ultimate Relationship Saver)

[![Demo with Vercel](https://vercel.com/button)](https://terserah-app.vercel.app)

> "Mau makan apa?"
> — **"Terserah."**
> "Mcd?"
> — **"Gak mau, bosen."**
> "Soto?"
> — **"Lagi gak pengen yang kuah."**
> "Terus apa?"
> — **"Terserah."**

Apakah percakapan di atas terdengar familiar? Apakah Anda lelah menghabiskan waktu 45 menit hanya untuk menentukan tempat makan siang sampai akhirnya maag Anda kambuh?

**Selamat, Anda tidak sendirian.** Aplikasi ini dibuat menggunakan sains, algoritma pengacak, dan sedikit rasa putus asa untuk memecahkan misteri terbesar dalam peradaban modern: kata **"TERSERAH"** dari mulut pasangan Anda.

---

## ✨ Fitur Utama (Features)

- **🎰 Spinner Anti-Dilema:** Masukkan opsi, putar rodanya, dan biarkan takdir yang menentukan menu makan Anda. Pasangan Anda tidak bisa mendebat hasil roda keberuntungan ini (secara hukum tak tertulis).
- **🩸 Cycle-Synced Recommendations:** Fitur rahasia penunjang kedamaian rumah tangga. Rekomendasi makanan akan disaring secara otomatis berdasarkan 4 fase siklus menstruasi wanita (_Menstruasi, Folikular, Ovulasi, atau Luteal_). Karena hormon yang berbeda butuh asupan nutrisi yang berbeda!
- **📍 GMaps Deep Link Integration:** Begitu roda berhenti di suatu makanan, aplikasi ini langsung menyediakan tombol jalan pintas (_deep link_) untuk mencari warung/restoran terdekat di Google Maps secara dinamis.
- **📱 PWA Ready (Installable):** Bisa langsung disimpan di _home screen_ HP pasangan Anda tanpa menonjolkan address bar browser. Buka instan, putar, makan.

---

## 🛠️ Tech Stack

Aplikasi ini dibangun dengan _over-engineering_ yang sangat matang demi memastikan roda berputar dengan FPS yang mulus:

- **React 19 & TypeScript:** Biar kodenya aman dari _runtime error_, seaman hubungan Anda jika makanan cepat ketemu.
- **Vite:** Karena kami butuh aplikasi yang _load_ secepat kilat sebelum pasangan Anda berubah pikiran.
- **TanStack Query (React Query):** Menjaga state data makanan dan sinkronisasi yang mulus.
- **Tailwind CSS:** Desain _mobile-first_ yang ramah jempol, pas digunakan sambil memegang setir motor atau setir mobil dengan tangan satunya.

---

## 🚀 Memulai (Local Development)

Mau coba jalankan di lokal atau menambahkan 50 daftar makanan favorit daerahmu sendiri?

1. **Clone repo ini:**

   ```bash
   git clone https://github.com/rifqytrisna/terserah-app.git
   cd terserah-app
   ```

2. **Install dependensi:**

   ```bash
   pnpm install
   ```

3. **Jalankan local dev server:**

   ```bash
   pnpm dev
   ```

   Buka `http://localhost:5173` di browser Anda (atau di HP lewat jaringan lokal) dan mulailah menyelamatkan hubungan Anda dari kelaparan.

Perintah lain yang berguna:

```bash
pnpm test     # run tests
pnpm lint     # lint
pnpm format   # format with Prettier
pnpm build    # type-check + production build
pnpm preview  # preview the production build
```

## Data

The catalog lives at `public/data/foods.json`. Every phase must have at least
8 items; `src/data/validateDataset.test.ts` enforces this on every test run.

## Manual verification (run locally)

To verify the app works end-to-end:

1. Build and preview the production app:

   ```bash
   pnpm build
   pnpm preview
   ```

2. Open the localhost URL shown in your terminal and verify:
   - Header and 4 phase tabs render; active tab is bold.
   - Clicking "PUTAR" spins and reveals a result card with a wellness note and the "bukan saran medis" disclaimer.
   - Switching phase clears the result; spinning again never immediately repeats the last result.
   - Tapping the Maps CTA opens Google Maps in a new tab AND the history count increments; a repeat result shows the "Sudah pernah" badge.
   - DevTools → Application shows a registered service worker and manifest; toggling "Offline" and reloading still loads the app and catalog.

## Deploy

Static build (`dist/`). Deploy to Vercel or Netlify. `vercel.json` provides the
SPA fallback rewrite. Production deploys run manually via the
**Production Deployment** GitHub Actions workflow (`workflow_dispatch`), not
automatically on push. This is not medical advice.
