# Kabuzen Rumah AI

Website katalog produk Kabuzen (aplikasi, LMS, buku, video) di Vercel.

## Susunan

| Bagian | Isi |
|---|---|
| `index.html` | Beranda. Data semua produk ada di blok `<script type="application/json" id="site-data">`. |
| `aplikasi/<slug>.html` | Halaman per aplikasi, alamatnya `/aplikasi/<slug>`. **Dibuat otomatis**, jangan diedit manual. |
| `buku/<slug>.html` | Halaman per buku, alamatnya `/buku/<slug>`. **Dibuat otomatis.** |
| `animasi/<slug>.html` | Halaman per animasi, alamatnya `/animasi/<slug>`, dengan pemutar video dan pilihan versi 9:16/16:9. **Dibuat otomatis.** |
| `apps/<slug>.html` | Berkas aplikasinya sendiri (versi demo). |
| `buku/contoh/*.pdf` | Halaman contoh buku. |
| `video/*.mp4` | Video promosi (720×1280). |
| `img/` | Gambar: sampul buku, tangkapan layar aplikasi, sampul video, logo. |
| `tools/build.py` | Pembangun halaman produk, sitemap, dan pemindah gambar. |
| `assets/kz.js` | Log kunjungan anonim dan asisten katalog (tombol "Cari produk"). Dimuat di beranda, halaman produk, dan AppCentre. |
| `data/katalog.json` | Data ringkas untuk asisten katalog. **Dibuat otomatis** oleh `tools/build.py`. |
| `appcentre.html` | Halaman `/appcentre`: tools pihak lain (tautan afiliasi). Isinya dibaca dari tabel `apps` di Supabase proyek `Digital-app-centre`; tautan menu muncul sendiri bila sudah ada isinya. |
| `log.html` | Halaman `/log`: dasbor log kunjungan untuk admin (masuk dengan akun admin AppCentre). Data di tabel `site_visits` pada proyek Supabase yang sama. |

## Menambah atau mengubah produk

1. Tambahkan atau ubah entri di blok `site-data` pada `index.html` (`apps`, `books`, `animations`, `videos`).
   Video animasi masuk ke `animations`, bukan `videos` (`videos` khusus video promosi).
   Gambar boleh ditulis sebagai data URI; langkah 2 akan memindahkannya ke `img/`.
2. Jalankan dari akar repositori:

   ```
   python3 tools/build.py
   ```

   Skrip ini memindahkan gambar ke `img/`, membuat ulang `aplikasi/*.html`, `buku/*.html`,
   `sitemap.xml`, dan `robots.txt`.
3. Commit semua perubahan (termasuk berkas baru di `img/`, `aplikasi/`, `buku/`) lalu push ke `main`.

Slug diambil dari `id`: `app-kasir-umkm` → `/aplikasi/kasir-umkm`, `b-buku-sigma` → `/buku/buku-sigma`.

## Domain

Alamat situs di halaman produk dan sitemap diambil dari variabel `SITE` di `tools/build.py`
(bisa juga lewat variabel lingkungan `KABUZEN_SITE`). Setelah domain sendiri tersambung,
ubah nilai itu lalu jalankan ulang `tools/build.py`.

## Entri animasi (`animations`)

```json
{"id": "an-<slug>", "title": "...", "kind": "Video animasi 2D | Video animasi 3D | Animasi interaktif",
 "year": 2026, "date": "2026-11-15", "duration": 214, "desc": "...", "audience": "...",
 "highlights": ["isi adegan 1", "..."], "cover": "/img/... atau data URI",
 "versions": [{"label": "16:9", "note": "Paparan · 3:34", "url": "/video/x-16x9.mp4"},
              {"label": "9:16", "note": "Shorts & Reels · 2:15", "url": "/video/x-9x16.mp4"}],
 "app": "app-<slug> (bila ada versi interaktif di apps/)", "related": ["b-<buku>", "app-<aplikasi>"]}
```

Animasi interaktif cukup diisi `app` tanpa `versions`; halamannya menampilkan tombol untuk membuka versi demo.
