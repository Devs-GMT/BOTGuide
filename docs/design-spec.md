# BOTGuide: Catatan Desain (acuan x.ai)

Hasil eksplorasi x.ai pada 24 Okt 2026: beranda, `/grok`, `/build`, `/bot`, `/voice`, `/api/imagine`, `/news`, dropdown nav, dan mobile (375px). Nilai CSS diukur langsung dari halaman. Durasi animasi hanya perkiraan dari nama kelas.

## 1. Token desain

| Hal | Nilai di x.ai | Catatan untuk BOTGuide |
|---|---|---|
| Background halaman | `#0A0A0A` | Sama dengan PRD |
| Teks | `#FFFFFF`; redup `~#7D8187` | PRD: muted `#8A8A8A`, boleh dipakai |
| Font | Variabel kustom (200-800); mono: Geist Mono | Pakai Geist + Geist Mono |
| H1 hero | 48px, weight 450, tracking -0.01em, line-height 1 | Skala naik di desktop lebar (clamp) |
| H2 besar | 48px, weight 500 | |
| H2 biasa | 30px / 36px, weight 500, tracking -0.01em | |
| H3 kartu | 24px / 32px; judul berita 16px / 22px | |
| Container | `max-w 1280px`, padding samping 24px (16px di mobile) | |
| Padding section | 96px atas-bawah (64px di mobile) | |
| Kartu | `#1A1A1A`, radius 16px, tinggi 280px, tanpa border | PRD menyebut radius 20px; keduanya boleh |
| Tombol | Pill penuh (9999px), 14px. Primer putih / teks `#0A0A0A`; sekunder `#202020` / putih | Padding 10x18 (nav), 12x20 (hero) |
| Transisi | 150 ms `cubic-bezier(0.4,0,0.2,1)` (warna), 200 ms (opacity) | |
| Hairline | 1px `#1F2228` antar section | |

## 2. Struktur beranda (urutan section)

1. **Navbar** fixed: logo, menu dengan chevron, tombol kanan (pill abu + pill putih). Tanpa background di atas, hairline saat scroll.
2. **Hero**: badge ("New" oranye + teks + ↗), H1 dua baris dengan kata terakhir berganti huruf per huruf, subline, dua pill.
3. **Tiga kartu produk hidup** dengan preview animasi yang memudar di tepi atas dan bawah. Label kiri bawah, "Explore →" kanan bawah. Baris kedua: kartu lebar dan kartu bola/visual.
4. **For developers**: kiri teks + tiga mini-stat + dua pill; kanan jendela kode dalam bingkai bergrain dengan kotak sudut kecil; tab pill bahasa di bawahnya.
5. **Stats**: tiga kolom besar dengan garis vertikal pemisah.
6. **Latest news**: empat kartu gambar bergradien, meta "Kategori · tanggal", judul dengan `›`.
7. **Choose how to get started**: dua kartu daftar ber-centang, tombol penuh lebar di dasar kartu.
8. **Footer**: logo kiri, garis pemisah, lima kolom link, pill "Built with ..." dan toggle tema di kiri bawah.

## 3. Pola `/grok` (showcase sticky)

- Grid `lg:grid-cols-[1fr_1.3fr]`, gap 64px.
- Panel kanan `sticky`, `top: calc(50vh - 220px)`, ukuran 660x440, berisi composer yang mengetik sendiri sesuai fitur aktif (mode berganti: Fast, Multi-agent, Search, Imagine).
- Kiri: blok fitur dengan `py-10 lg:py-12 transition-opacity duration-500`. Fitur aktif terang, sisanya redup.
- Tiap blok: ikon + judul 30px, satu kalimat, tiga poin ber-centang.
- Sesudahnya: grid "And much more" (3 kolom, gap 36x48, 18 item: ikon kecil + judul + satu baris), lalu "Get started" tiga langkah bernomor, lalu kartu CTA developer lebar.

## 4. Interaksi

- **Mega-menu nav**: kiri daftar item (judul + deskripsi satu baris), kanan panel preview animasi yang cross-fade saat pindah menu. Chevron berputar saat terbuka.
- **Kata berganti di H1**: kata terakhir ditulis ulang huruf per huruf, bergilir antar kata.
- **Reveal hero** pada halaman produk: teks mulai kabur lalu tajam (blur-in). Perlu fallback agar hero tidak kosong sebelum JS jalan.
- **Halaman produk** (`/build`, `/bot`, `/voice`): hero + badge + satu CTA + jendela produk besar sebagai visual utama (bukan gambar statis). `/build` punya command install dengan tab dan tombol copy.
- **`/api/imagine`**: hero punya kotak prompt fungsional dengan toggle mode.
- **`/news`**: satu artikel unggulan besar, grid kartu, lalu daftar "All posts" dengan ringkasan; FAQ memakai accordion.

## 5. Mobile (375px)

- Nav jadi logo + tombol hamburger bulat abu gelap. Pill CTA muncul di nav setelah hero terlewati.
- Kartu menumpuk vertikal; preview tetap memudar di tepi.
- Mini-stat tetap tiga kolom kecil; jendela kode penuh lebar dalam bingkai bergrain.

## 6. Penerapan ke BOTGuide

1. Hero ask box yang berfungsi (jawaban ter-stream dengan sitasi), bukan gambar.
2. Showcase sticky (Ask, Sources, Deploy, Network, Vote and Tips) menggantikan sebagian besar section kartu dan How it works. Demo memakai jawaban ter-cache untuk 4-5 pertanyaan starter agar tidak memakai kuota LLM.
3. Panel bukti: hover [1] pada jawaban menyorot potongan dokumen asli dari `kb.json`.
4. Mega-menu dengan preview untuk Product dan Developers.
5. Kata berganti di headline (build / deploy / verify / debug) pada "...on BOT Chain."
6. Jendela kode dalam bingkai bergrain; snippet dari docs resmi.
7. Grid padat gaya "And much more" untuk cakupan knowledge base.
8. Hanya angka asli di bagian stats. Kalau counter masih 0, sembunyikan atau tampilkan apa adanya.
9. `prefers-reduced-motion`: tampilkan hasil akhir tanpa animasi mengetik / reveal.
10. Konten tampil dulu; animasi hanya tambahan (tidak ada hero kosong sebelum JS).

## 7. Animasi dan interaksi (terukur)

Diukur lewat Web Animations API (`getAnimations()`) dan polling DOM di viewport 1440x900. Easing yang sering muncul:
`ease-soft = cubic-bezier(0.22, 1, 0.36, 1)`, `ease-out-expo = cubic-bezier(0.16, 1, 0.3, 1)`, `ease-panel = cubic-bezier(0.23, 1, 0.32, 1)`, `ease-ui = cubic-bezier(0.4, 0, 0.2, 1)`.

### 7.1 Hero beranda (urutan masuk, ms sejak load)

| Elemen | Delay | Durasi | Easing | Efek |
|---|---|---|---|---|
| Badge ("New / Meet Grok") | 320 | 320 | ease-soft | opacity |
| Kata H1 ke-1 s/d ke-7 | 100, 155, 210, 265, 320, 375, 430 | 650 | ease-soft | per kata, stagger 55 ms (blur + naik + opacity) |
| Garis bawah kata berganti | 800 | 800 | ease-out-expo | opacity; `scaleX` dari kiri |
| Subline | 580 | 380 | ease-soft | opacity |
| Dua tombol | 700 | 380 | ease-soft | opacity |
| Grid kartu produk | 760 | 1250 | ease-soft | opacity |
| Banner cookie | 0 | 280 | ease-panel | opacity |

Pola: semuanya mulai dalam 0,8 detik dan selesai dalam kurang dari 2 detik. Kata di H1 tidak muncul sekaligus, tapi bergelombang.

### 7.2 Kata berganti di H1

- Urutan: **build, imagine, search, see, create, hear, reason, code, write, analyze**. Berhenti di kata terakhir (tidak berputar ulang).
- Interval sekitar **3,0 detik** per kata.
- Tiap huruf adalah `<span>` sendiri dengan `opacity`, `filter: blur()`, dan `transform` yang dianimasikan (huruf muncul dari kabur menjadi tajam, bergelombang per huruf).
- Garis bawah: tinggi 3px, `rounded-full`, `transform-origin: left`. Gradiennya dianimasikan oleh keyframe `hero-shimmer` selama **3000 ms linear, delay 400 ms**, `background-size: 400%`, dengan stop: warna primer 25% lalu `#6366f1`, `#a855f7`, `#ec4899`, `#f97316`, `#eab308`, lalu kembali. Untuk BOTGuide ganti dengan gradien hangat monokrom sesuai PRD (`#B48A4A` ke `#6E5A3A`).

### 7.3 Showcase sticky di `/grok` (desktop, lg ke atas)

- Blok fitur: tidak aktif `opacity: 0.2` (`lg:opacity-20`), aktif `opacity: 1`, transisi **500 ms**.
- Panel kanan: `sticky`, `top: calc(50vh - 220px)`, 660x440.
- Saat fitur aktif berganti: label mode di composer berganti dalam **sekitar 260 ms** (animasi **240 ms**, ease-panel), lalu panel mengosongkan isi lama.
- Urutan per fitur, dihitung sejak fitur menjadi aktif:

| Fitur | Awal mengetik | Prompt yang diketik | Lanjutan |
|---|---|---|---|
| Chat | ~1000 ms | "Plan a 3-day weekend in Tokyo" (dua saran muncul lebih dulu: "...for first-time visitors" dan "...focused on art and design") | Kecepatan sekitar 13-15 huruf/detik (~70 ms/huruf). Terkirim di ~2800 ms. "Thought for 1s" di ~3900 ms. Jawaban muncul per kata (span per kata, fade 300 ms, stagger 80 ms). |
| Multi-agent | ~1300 ms | "I have $40k in savings, should I pay off student loans at 6.8% or invest in index funds?" | Teks status "Agents thinking · 2s" bertambah tiap detik, berubah jadi "Agents thought" saat selesai. |
| Search | ~2300 ms | "What is the market reaction to today's Fed decision?" | Lencana sumber "+12", status "Searched web", timer sampai ~18 s lalu "thought". |
| Imagine | ~3300 ms | "A high-fashion portrait reimagined with surreal natural elements" | Gambar muncul dengan reveal 500 ms ease-out-expo. |

- Durasi pendukung yang muncul di panel: 120 ms (ease-panel, span kecil), 150 ms dan 200 ms (ease-out, pop-in baris), 180 ms (`cubic-bezier(0.2,0,0,1)`), 300 ms (ease-out-expo), loop 1000 ms ease-in-out (indikator "thinking").
- Di bawah breakpoint lg (di bawah 1024px) tidak ada dimming dan tidak ada panel sticky: semua blok tampil penuh dan panel menumpuk.

### 7.4 Mega-menu navbar

- Saat dibuka: panel utama beranimasi **350 ms** dengan easing pegas (`linear(...)` berbasis spring), item di dalamnya muncul **250 ms** ease-out-expo dengan **stagger 15 ms** per item.
- Pindah antar menu: panel sama (tidak menutup lalu membuka), item baru stagger 25 ms, durasi 250 ms; isi panel preview cross-fade 120 ms ease-out.
- Chevron berputar saat menu terbuka.
- Tautan nav: transisi warna 150 ms ease-ui.

### 7.5 Kartu produk (hover)

- Lapisan preview di dalam kartu: `scale(1.02)` selama **500 ms ease-out**.
- Kilau diagonal: elemen `-inset-[50%]` dengan `linear-gradient(120deg, transparent 40%, rgba(255,255,255,0.06) 48%, ... )` meluncur dari `translateX(-100%)` ke `translateX(100%)` selama **700 ms ease-out**.
- Label produk: transisi warna 300 ms. "Explore →" berubah dari putih redup ke `rgba(255,255,255,0.9)` dalam 300 ms (`transition-all`).
- Kartu: `h-[220px]` di mobile, `h-[280px]` di sm ke atas, `rounded-2xl`, padding dalam 4px.

### 7.6 Kontrol lain

- **Tab bahasa di jendela kode**: aktif putih, tidak aktif `#7D8187`, transisi warna **150 ms ease-ui**. Isi kode berganti **seketika** (tanpa animasi). Tab berlapis dengan `z-[1]`, jadi kemungkinan ada indikator di belakangnya (tidak terukur).
- **Tombol pill**: transisi warna dan background 150 ms ease-ui; tombol putih utama juga memakai transisi opacity 200 ms.
- **Split dropdown "Try for free"**: sisi kanan (`rounded-r-full`) membuka menu kecil; di beranda x.ai isinya hanya "Copy black SVG / Copy white SVG" (menu logo), jadi bukan dropdown produk. Radius menu 12px, background `#0A0A0A`.
- **Header**: lapisan latar `bg-background/85` + `backdrop-filter: blur(12px)`, `z-50`, `duration-200`. Hairline muncul saat scroll.
- **Tombol Copy**: dari uji klik via skrip, teksnya tidak berubah (kemungkinan karena clipboard diblokir di sandbox); perilaku "Copied" tidak teramati.
- **Reveal blur-in di halaman produk** (`/bot`, `/build`): terlihat di screenshot sebagai teks kabur yang menajam, durasi tidak diukur.

### 7.7 Ringkasan token animasi untuk BOTGuide

```
--ease-soft:  cubic-bezier(0.22, 1, 0.36, 1);   /* masuk hero */
--ease-expo:  cubic-bezier(0.16, 1, 0.3, 1);    /* reveal, garis bawah */
--ease-panel: cubic-bezier(0.23, 1, 0.32, 1);   /* panel, ganti mode */
--ease-ui:    cubic-bezier(0.4, 0, 0.2, 1);     /* warna, tombol */

--dur-fast: 150ms; --dur-ui: 240ms; --dur-reveal: 650ms; --dur-dim: 500ms;
word-stagger: 55ms; letter/word-in-answer-stagger: 80ms; menu-item-stagger: 15ms;
H1 word cycle: 3000ms; typing speed: ~70ms/char; card hover: scale 1.02 / 500ms, shine 700ms
```

## 8. Belum tercakup

- Animasi Voice (bola 3D) dan kolase Imagine di kartu baris kedua tidak diukur; hanya dilihat sebagai screenshot.
- Hover pada tombol pill (perubahan warna persisnya) tidak diukur selain durasinya.
- Halaman yang tidak dibuka: `/pricing`, Company (About, Colossus, Careers), docs, console.
- Perilaku nav di `/build` saat scroll (tautan memudar) hanya terlihat di screenshot, tidak diukur.
- Toggle dark/light di footer diabaikan (light mode out of scope di PRD).
