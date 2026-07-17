Technical Specification: "Terserah!" – The Cycle-Synced Food Decider (PWA)
Aplikasi mobile web interaktif berbasis PWA yang membantu pasangan mengatasi masalah klasik "terserah" saat memilih makanan, sekaligus memberikan rekomendasi kuliner yang disesuaikan secara medis dengan siklus hormonal wanita (4 Fase Menstruasi).

🗺️ 1. Product Roadmap (2-Weekend MVP Strategy)
[ Weekend 1 ] ➔ ➔ ➔ ➔ ➔ [ Weekend 2 ]
Core Logic & Spinner PWA, Deep Links & Polish
Weekend 1: Core Engine & Data Architecture
Goal: Membangun core logic penentuan menu, manajemen state React, dan visualisasi roda berputar (spinner) yang responsif.

Deliverables:

Inisialisasi repository menggunakan Vite + React + TypeScript + Tailwind CSS.

Pembuatan struktur data statis (mock data) berisi minimal 40-50 daftar makanan/minuman beserta tag fase siklus menstruasi dan justifikasi medisnya.

Implementasi filter state berbasis horizontal-tab untuk mendeteksi 4 fase: Menstruasi, Folikular, Ovulasi, dan Luteal.

Pembuatan UI Roda Berputar (Spinner Wheel) interaktif menggunakan CSS Canvas/Transformations di Tailwind.

Weekend 2: PWA Capabilities & Deep Linking Integrations
Goal: Mengubah aplikasi menjadi PWA mandiri (standalone), mengintegrasikan pencarian lokasi via Google Maps deep linking, dan deployment.

Deliverables:

Konfigurasi @vitejs/plugin-pwa agar aplikasi bisa diakses secara offline-first dan diinstal di home screen ponsel pintar.

Implementasi Deep Link Navigation ke aplikasi Google Maps bawaan HP berdasarkan makanan yang berhasil didapatkan dari spinner.

Menambahkan efek kepuasan visual (micro-interactions seperti efek suara ketukan roda atau animasi confetti) saat roda berhenti berputar.

Deployment hasil production build ke Vercel atau Netlify.

🛠️ 2. Detailed Tech Stack Architecture
Build System & Bundler: Vite (untuk kompilasi kilat dan hot reload instan selama pengembangan).

Core UI Library: React 19 (TSX) (memanfaatkan functional component dengan arsitektur hooks modern).

Programming Language: TypeScript (Strict mode diaktifkan penuh untuk menjamin validitas tipe data menu dan fase).

Styling Engine: Tailwind CSS (menjamin antarmuka adaptif/responsive dengan utilitas mobile-first tokens).

State & Cache Layer: TanStack Query (React Query) (untuk manajemen penayangan riwayat putaran terakhir secara lokal dengan persistensi data otomatis).

PWA Wrapper: vite-plugin-pwa (mengotomatisasi injeksi service worker untuk pemuatan secepat kilat tanpa browser address bar).

🎨 3. UI Screen Design & Layout Specifications
Layout: Mobile Web (Satu Genggaman / Thumb-Optimized)
Aplikasi ini didesain sepenuhnya untuk kenyamanan navigasi satu tangan di layar smartphone.

+-------------------------------------------------------------+
| [🍔] TERSERAH! App [📶 ON] | <- Header minimalis
| --------------------------------------------------------- |
| 🩸 PILIH FASE SIKLUS HARI INI: |
| +------------+ ------------+ ------------+ ------------+ |
| | Menstruasi | Folikular | Ovulasi | Luteal | | <- Horizontal tabs
| +------------+ ------------+ ------------+ ------------+ | (Teks tebal jika aktif)
| |
| \ | / |
| \ | / |
| --- (🎯 SPINNER) --- | <- Komponen lingkaran roda
| / | \ | mengacak nama makanan
| / | \ |
| |
| [ 🔄 PUTAR RODA KEBERUNTUNGAN ] | <- Tombol utama besar
| | (Min. tinggi 54px)
| ------------------------------------------------------- |
| 🎉 HASIL PUTARAN: |
| ⭐ WEDANG JAHE KUNYIT HANGAT | <- Muncul pasca putaran
| 🩺 "Membantu merilekskan otot rahim & redakan kram haid" | <- Edukasi medis singkat
| |
| [📍 CARI TEMPAT/WARUNG TERDEKAT DI GOOGLE MAPS ] | <- CTA Deep Link dominan
+-------------------------------------------------------------+
Strategi Skalabilitas Desktop: Jika dibuka di desktop monitor, penampang layout utama akan tetap dibatasi pada lebar maksimal (max-w-md mx-auto) di tengah layar untuk mensimulasikan keindahan visual mockup smartphone.

⚙️ 4. Code Architecture Blueprint (TypeScript Core)
A. Tipe Data Kontrak (src/types/food.ts)
TypeScript
export type MenstrualPhase = 'menstruasi' | 'folikular' | 'ovulasi' | 'luteal';
export type ItemType = 'makanan' | 'minuman';

export interface FoodItem {
id: string;
name: string;
type: ItemType;
phases: MenstrualPhase[];
medicalBenefit: string;
gmapsQuery: string; // Query mentah untuk pencarian peta, misal: "soto+ayam+terdekat"
}
B. Implementasi PWA Konfigurasi (vite.config.ts)
TypeScript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
plugins: [
react(),
VitePWA({
registerType: 'autoUpdate',
includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
manifest: {
name: 'Terserah! - Cycle Synced Food Decider',
short_name: 'TerserahApp',
description: 'Solusi atasi dilema milih makanan yang disinkronkan dengan siklus hormonal wanita.',
theme_color: '#1e293b',
background_color: '#0f172a',
display: 'standalone',
orientation: 'portrait',
icons: [
{
src: 'pwa-192x192.png',
sizes: '192x192',
type: 'image/png'
},
{
src: 'pwa-512x512.png',
sizes: '512x512',
type: 'image/png'
}
]
}
})
]
});
C. Logika Integrasi Navigasi Deep Link (src/utils/navigation.ts)
Untuk menghindari keribetan integrasi API berbayar dari Google Places, gunakan utilitas deep link URL gratisan bawaan Google Maps API berikut:

TypeScript
export const openGoogleMapsSearch = (query: string): void => {
// Menggunakan URL Universal Google Maps Search API 1
const encodedQuery = encodeURIComponent(query.replace(/\s+/g, '+'));
const targetUrl = `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`;

// Membuka tab baru atau langsung melempar ke aplikasi Google Maps di iOS/Android
window.open(targetUrl, '\_blank', 'noopener,noreferrer');
};
