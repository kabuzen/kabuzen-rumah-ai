# Kabuzen Rumah AI

Website katalog produk Kabuzen (aplikasi, LMS, buku, video) di Vercel.

## Susunan

| Bagian | Isi |
|---|---|
| `index.html` | Beranda. Data semua produk ada di blok `<script type="application/json" id="site-data">`. |
| `aplikasi/<slug>.html` | Halaman per aplikasi, alamatnya `/aplikasi/<slug>`. **Dibuat otomatis**, jangan diedit manual. |
| `buku/<slug>.html` | Halaman per buku, alamatnya `/buku/<slug>`. **Dibuat otomatis.** |
| `apps/<slug>.html` | Berkas aplikasinya sendiri (versi demo). |
| `buku/contoh/*.pdf` | Halaman contoh buku. |
| `video/*.mp4` | Video promosi (720×1280). |
| `img/` | Gambar: sampul buku, tangkapan layar aplikasi, sampul video, logo. |
| `tools/build.py` | Pembangun halaman produk, sitemap, dan pemindah gambar. |

## Menambah atau mengubah produk

1. Tambahkan atau ubah entri di blok `site-data` pada `index.html` (`apps`, `books`, `videos`).
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
