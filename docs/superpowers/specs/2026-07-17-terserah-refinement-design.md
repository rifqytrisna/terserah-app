# Refined Design Spec: "Terserah!" — The Cycle-Synced Food Decider (PWA)

**Date:** 2026-07-17
**Status:** Approved design (refinement of `product-spec.md`)
**Scope:** Single-screen PWA MVP. This document supersedes `product-spec.md` where they differ; unchanged sections are noted as such.

Aplikasi mobile-web (PWA) yang membantu mengatasi dilema "terserah" saat memilih makanan, dengan saran yang disesuaikan pada fase siklus menstruasi. Refinement ini menajamkan kejujuran value-prop, framing kesehatan, mekanik spinner, dan pemakaian stack agar tidak over-engineering.

---

## 1. Product Positioning & Honesty Fixes

**The app does NOT know the user's cycle — and never claims to.**

- Fase dipilih **manual** lewat horizontal tab. Asumsi inti: pengguna yang melacak siklusnya sudah tahu fasenya; app hanya menyesuaikan saran, bukan mendeteksi. "Sync" ada di kepala pengguna, bukan di app.
- Copy harus mencerminkan ini: **"Pilih fasemu hari ini"**, bukan janji auto-detect. Tidak ada input tanggal haid, tidak ada perhitungan siklus di MVP.
- Framing **"pasangan / couples"** tetap dipakai sebagai narasi marketing, **bukan fitur** — tidak ada partner-sync, sharing, atau multi-user di MVP.

## 2. Medical Framing → Soft Wellness + Disclaimer

Klaim kesehatan adalah risiko akurasi & liabilitas. Keputusan: **soft wellness framing.**

- Setiap blurb manfaat ditulis sebagai kearifan umum/tradisional, contoh: _"Dipercaya membantu merilekskan otot & meredakan kram."_ — bukan sebagai fakta klinis.
- **Disclaimer persisten** di UI (mis. footer kecil di bawah kartu hasil): _"Info bersifat umum, bukan saran medis."_
- Blurb harus bervariasi antar item (hindari 50 kalimat yang terasa sama).

## 3. Spinner Mechanics

Roda menampilkan **nama item sungguhan** dan benar-benar berhenti pada satu item (pointer = hasil). Ini menjaga "kausalitas" spinner yang jadi sumber dopamine.

- **Hard cap 8 segmen.** 8 = kepadatan wheel-of-fortune klasik (45°/segmen), terbaca di layar HP.
- **Re-sample tiap putaran:** tiap spin mengambil sampel acak (maks 8) dari daftar item pada fase aktif. Efek samping positif: app tidak terasa basi walau dataset kecil.
- **Under-8 fallback:** jika fase punya < 8 item, tampilkan apa adanya (jumlah item yang ada).
- **Avoid immediate repeat:** kecualikan hasil terakhir dari sampel putaran berikutnya (hampir gratis, mencegah "spin lagi dapat yang sama").
- Animasi deselerasi + micro-interaction (confetti / efek suara) saat berhenti — tetap dari spec asli.

## 4. State + Persistence (TanStack Query dipakai secara jujur)

TanStack Query dipertahankan, tapi diarahkan ke dua hal yang memang jadi keunggulannya, dan keduanya selaras dengan tujuan **PWA offline-first**. Ini keputusan sadar, bukan dekorasi.

**A. Katalog makanan sebagai async resource yang dipersist.**

- Dimuat via `useQuery` (fetch `/data/foods.json` atau dynamic `import()`), bukan `import` statis.
- Tambahkan `persistQueryClient` + persister (localStorage / IndexedDB).
- Manfaat nyata: loading/error state saat pertama buka, katalog **ter-cache & tersedia offline** (inti PWA), dan seam bersih untuk nanti ganti JSON dengan API tanpa mengubah UI.

**B. Riwayat putaran sebagai mutation + query.**

- **Trigger simpan = saat tap CTA Google Maps** → merepresentasikan _niat benar-benar makan item itu_ ("things I decided to eat"). Bukan auto-save tiap spin.
- `useMutation` menulis `{ item, phase, timestamp }` ke storage yang dipersist.
- `useQuery(['history'])` membaca kembali; mutation meng-invalidate query → UI update otomatis.

**Fitur "Riwayat" (leverage stack):**

- Daftar recent-picks yang collapsible ("Terakhir kamu pilih…") dengan item + fase + tanggal.
- Marker **"sudah pernah"** pada hasil yang sebelumnya sudah pernah didapat.

## 5. Dataset — the actual product

Dataset adalah produk sesungguhnya; sisanya cangkang. Risiko & kerja nyata ada di sini.

- **Draft penuh 40-50 item** (dikerjakan sebagai bagian implementasi, di-review pengguna): phase tags, blurb soft-wellness, dan `gmapsQuery` yang **findable** (utamakan istilah yang mengembalikan hasil peta nyata, mis. `"warung jamu"` daripada `"wedang jahe kunyit"`).
- **Invariant wajib:** setiap fase punya **≥ 8 item**. Tambahkan validasi (build-time atau test) sehingga data buruk tidak bisa ter-ship.
- Blurb harus lolos cek "tidak repetitif" secara manual saat review.

### Schema (`src/types/food.ts`)

```typescript
export type MenstrualPhase = 'menstruasi' | 'folikular' | 'ovulasi' | 'luteal';
export type ItemType = 'makanan' | 'minuman';

export interface FoodItem {
  id: string;
  name: string;
  type: ItemType;
  phases: MenstrualPhase[]; // 1-4 tags, dipilih deliberate
  wellnessNote: string; // soft framing, bukan klaim medis
  gmapsQuery: string; // istilah Maps yang findable
  // Reserved untuk filtering masa depan (TIDAK dibangun di MVP):
  // region?: string;
  // spiciness?: 0 | 1 | 2 | 3;
  // veg?: boolean;
}
```

> Catatan: field `region` / `spiciness` / `veg` sengaja dicatat sebagai reserved untuk filtering lanjutan, tapi **tidak diimplementasikan** di MVP (YAGNI).

## 6. Unchanged from original spec

- **Stack:** Vite + React 19 (TSX) + TypeScript (strict) + Tailwind CSS.
- **PWA:** `vite-plugin-pwa` (`registerType: 'autoUpdate'`, standalone, portrait, manifest & icons sesuai spec asli).
- **Deep link Maps:** URL gratis `https://www.google.com/maps/search/?api=1&query=...` via util `openGoogleMapsSearch`.
- **Layout:** mobile-first, `max-w-md mx-auto` terpusat di desktop; header minimalis; horizontal phase tabs; tombol PUTAR besar (min-height 54px); kartu hasil dengan blurb + CTA Maps dominan.
- **Roadmap:** 2-weekend MVP (Weekend 1: core engine, data, spinner; Weekend 2: PWA, deep link, polish, deploy ke Vercel/Netlify).

## 7. Acceptance criteria (MVP done =)

1. 4 fase bisa dipilih via tab manual; copy tidak menjanjikan auto-detect.
2. Spinner menampilkan ≤8 item nyata dari fase aktif, berhenti pada satu, re-sample tiap putaran, tidak mengulang hasil terakhir, dan menangani fase <8 item.
3. Kartu hasil menampilkan blurb soft-wellness + disclaimer "bukan saran medis".
4. Tap CTA Maps membuka Google Maps dengan query yang benar **dan** menyimpan entri riwayat.
5. Riwayat tampil, persist antar reload, dan bekerja offline; hasil yang berulang diberi marker "sudah pernah".
6. Katalog dimuat via React Query, ter-cache, tersedia offline (PWA installable & jalan tanpa jaringan setelah kunjungan pertama).
7. Dataset ≥40 item, tiap fase ≥8 item, tervalidasi otomatis.

## Out of scope (MVP)

- Deteksi/perhitungan siklus otomatis, input tanggal haid.
- Partner sharing / multi-user / akun.
- Filtering region / spiciness / veg.
- Google Places API berbayar (pakai deep link gratis).
