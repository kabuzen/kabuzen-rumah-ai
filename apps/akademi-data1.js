// Isi LMS bagian 1: Modul 1–5.
// Struktur tiap modul: materi (paragraf), perintah (perintah + penjelasan baris demi baris),
// folder (berkas yang dihasilkan), galeri (tangkapan layar), flash (8 kartu),
// bs (10 benar/salah), pg (10 pilihan ganda, a = indeks jawaban benar).
window.LMS = window.LMS || { modul: [] };

window.LMS.modul.push(
{
  no: 1, judul: 'Dari naskah kajian ke spesifikasi', fase: 'A',
  tujuan: 'Mengubah Naskah Kajian Revisi TUKS PT Galangan Contoh (16 halaman) menjadi daftar fitur, peran, data dan aturan yang bisa dibangun.',
  materi: [
    'Aplikasi yang baik lahir dari pertanyaan "apa yang harus dikendalikan?", bukan "teknologi apa yang dipakai?". Naskah kajian sudah memuat struktur kendalinya: Roadmap 90 Hari, Stage-gate G0–G5, register tindak lanjut A-01 sampai A-10, register risiko Bab 8 dan checklist kendali A–E Bab 10.',
    'Setiap isi naskah dipetakan ke satu bagian aplikasi. Roadmap menjadi daftar kegiatan dengan durasi dan predecessor. Stage-gate menjadi papan keputusan Direktur. Tiga prinsip pengendali (no land transfer, no public operation, no major capex) menjadi kartu di Dashboard yang baru terbuka saat gate terkait lulus.',
    'Setiap fitur wajib punya jawaban "siapa boleh". Karena itu peran ditetapkan sejak awal: Direktur memutuskan, Orkestrator mengelola, PIC per bidang (LEG, IZN, TRL, PSR, KLB) melapor, Pengamat membaca.',
    'Prompt spesifikasi adalah kriteria penerimaan. Di akhir proyek, setiap baris fitur wajib harus bisa ditunjukkan di layar. Bila naskah tidak menyebut sesuatu (misalnya durasi), tandai sebagai asumsi, jangan dikarang.'
  ],
  perintah: [
    { cmd: 'Peran      : senior engineer\nTujuan     : web app project management transformasi TUKS ke pelabuhan umum\nSumber     : Naskah Kajian Revisi (PDF) - ikuti tahapnya\nFitur wajib: seri/paralel, Gantt, input kegiatan/member/durasi/deadline,\n             unggah dokumen, laporan real-time, notifikasi + dampak\nPeran      : Direktur, Orkestrator, PIC per bidang\nTeknologi  : HTML/CSS/JS, Supabase, VS Code, Vercel\nBentuk awal: demo HTML untuk pemilik perusahaan\nAturan     : kode berkomentar, tangani kasus tepi, sebutkan info yang kurang',
      lang: 'prompt',
      ket: [
        ['Peran', 'Menentukan tingkat kedalaman jawaban yang diharapkan.'],
        ['Sumber', 'Mengikat aplikasi ke dokumen nyata, sehingga kode A-01 atau G0 sama persis dengan naskah.'],
        ['Fitur wajib', 'Daftar periksa akhir proyek. Setiap baris harus terlihat di layar.'],
        ['Peran (kedua)', 'Dasar aturan hak akses di Modul 6 dan RLS di Modul 8.'],
        ['Bentuk awal', 'Melahirkan Mode Demo: data di browser, tanpa server, untuk presentasi pertama.'],
        ['Aturan', 'Memaksa penulis menyebut kekurangan informasi, bukan menebak.']
      ],
      hasil: 'Spesifikasi satu halaman yang menjadi pegangan semua modul berikutnya.' }
  ],
  folder: [
    ['Naskah Kajian Revisi.pdf', 'Sumber kebutuhan (tidak masuk folder aplikasi).'],
    ['prompt-spesifikasi.txt', 'Hasil modul ini: delapan baris spesifikasi.']
  ],
  galeri: [ { src: 'assets/a-sampul.png', cap: 'Hasil akhir: sampul aplikasi dengan judul dari spesifikasi' } ],
  flash: [
    ['Apa tujuan Modul 1?', 'Mengubah dokumen bisnis menjadi spesifikasi aplikasi: fitur, peran, data, aturan.'],
    ['Stage-gate G0–G5 menjadi apa di aplikasi?', 'Menu Stage-gate: syarat lulus, kegiatan prasyarat, keputusan tertulis Direktur.'],
    ['Apa tiga prinsip pengendali di naskah?', 'No land transfer, no public operation, no major capex.'],
    ['Siapa yang memutuskan gate?', 'Direktur.'],
    ['Lima bidang PIC?', 'LEG (legal), IZN (perizinan), TRL (teknis), PSR (pasar), KLB (kelembagaan).'],
    ['Mengapa ada "Bentuk awal: demo"?', 'Agar pemilik perusahaan bisa mencoba aplikasi sebelum ada server (Mode Demo).'],
    ['Apa yang dilakukan bila naskah tidak menyebut durasi?', 'Tandai sebagai asumsi; jangan dikarang.'],
    ['Fungsi baris "Fitur wajib"?', 'Kriteria penerimaan: semua harus bisa ditunjukkan di akhir proyek.']
  ],
  bs: [
    ['Teknologi sebaiknya dipilih sebelum kebutuhan jelas.', false, 'Kebutuhan dulu; teknologi mengikuti apa yang harus dikendalikan.'],
    ['Register A-01 sampai A-10 menjadi kegiatan berkode di aplikasi.', true, 'Kode yang sama dengan naskah memudahkan penelusuran.'],
    ['Setiap fitur perlu jawaban "siapa boleh melakukannya".', true, 'Itu dasar peran dan RLS.'],
    ['Pengamat boleh mengubah progres kegiatan.', false, 'Pengamat hanya membaca.'],
    ['Data yang tidak ada di naskah boleh dikarang agar aplikasi terlihat lengkap.', false, 'Tandai sebagai asumsi.'],
    ['Kartu prinsip di Dashboard terbuka saat gate terkait lulus.', true, 'Misalnya no major capex baru terbuka setelah G1–G4 lulus.'],
    ['Prompt spesifikasi juga berfungsi sebagai daftar periksa akhir.', true, 'Fitur wajib = kriteria penerimaan.'],
    ['Mode Demo memerlukan akun Supabase.', false, 'Mode Demo berjalan di browser saja.'],
    ['Checklist kendali A–E berasal dari Bab 10 naskah.', true, 'Menjadi menu Checklist berbukti.'],
    ['Orkestrator adalah peran yang memutuskan baseline.', false, 'Orkestrator mengusulkan, Direktur menyetujui.']
  ],
  pg: [
    ['Isi naskah mana yang menjadi daftar kegiatan dengan durasi dan predecessor?', ['Register risiko', 'Roadmap 90 Hari', 'Checklist A–E', 'Daftar pustaka'], 1, 'Roadmap memuat urutan dan waktu.'],
    ['Peran yang mengelola kegiatan dan dependensi adalah…', ['Direktur', 'Pengamat', 'Orkestrator', 'PIC IZN'], 2, 'Orkestrator mengatur jadwal.'],
    ['Mengapa kode kegiatan di aplikasi dibuat sama dengan naskah?', ['Supaya singkat', 'Agar bisa ditelusuri ke dokumen sumber', 'Syarat Supabase', 'Agar urut abjad'], 1, 'Keterlacakan ke naskah.'],
    ['Baris prompt yang melahirkan Mode Demo adalah…', ['Peran', 'Teknologi', 'Bentuk awal', 'Aturan'], 2, 'Demo HTML untuk pemilik perusahaan.'],
    ['"No public operation" berarti…', ['Tidak membangun dermaga', 'Tidak melayani publik sebelum izin dan konsesi terbit', 'Tidak menjual tanah', 'Tidak merekrut'], 1, 'Prinsip kedua naskah.'],
    ['Register risiko di naskah ada di…', ['Bab 2', 'Bab 8', 'Bab 10', 'Lampiran'], 1, 'Bab 8.'],
    ['Bila naskah tidak menyebut sesuatu, penulis spesifikasi sebaiknya…', ['Menebak', 'Mengosongkan aplikasi', 'Menandainya sebagai asumsi atau pertanyaan', 'Menghapus fitur'], 2, 'Sebutkan, jangan karang.'],
    ['Bidang KLB berkaitan dengan…', ['Kelembagaan', 'Kelautan', 'Keuangan', 'Kebersihan'], 0, 'KLB = kelembagaan.'],
    ['Siapa yang menyetujui baseline jadwal?', ['PIC', 'Orkestrator', 'Direktur', 'Pengamat'], 2, 'Orkestrator usul, Direktur setuju.'],
    ['Fungsi baris "Aturan" dalam prompt?', ['Menentukan warna', 'Menuntut kode berkomentar, kasus tepi, dan menyebut info yang kurang', 'Memilih hosting', 'Mengatur email'], 1, 'Standar kualitas.']
  ]
},
{
  no: 2, judul: 'Alat kerja dan terminal', fase: 'A',
  tujuan: 'Memasang Node.js, VS Code dan Git, lalu memakai terminal untuk berpindah folder, membuat folder dan melihat isinya.',
  materi: [
    'Terminal adalah cara memberi perintah ke komputer dengan mengetik. Baris yang diawali $ adalah perintah; baris di bawahnya adalah jawaban komputer.',
    'Node.js dipakai untuk server lokal (npx serve), alat uji jadwal dan pembuat seed.sql. VS Code untuk membaca dan mengubah berkas. Git untuk mencatat versi sebelum dikirim ke GitHub.',
    'Di Mac, terminal dibuka lewat Spotlight (Cmd + Spasi, ketik Terminal). Di VS Code, menu Terminal → New Terminal membuka terminal yang sudah berada di folder proyek.',
    'Biasakan mengetik pwd sebelum menjalankan perintah penting: kesalahan paling umum pemula adalah berada di folder yang salah.'
  ],
  perintah: [
    { cmd: 'node -v\nnpm -v\ngit --version\npwd\nmkdir -p latihan-pm && cd latihan-pm && pwd && ls -la', lang: 'bash',
      ket: [
        ['node -v', 'Menampilkan versi Node.js. Harus v20 atau lebih baru. Di contoh: v22.23.4.'],
        ['npm -v', 'Versi npm, pengelola paket yang ikut terpasang bersama Node.'],
        ['git --version', 'Versi Git. Bila belum ada, Mac menawarkan pemasangan Command Line Tools.'],
        ['pwd', 'Print working directory: menunjukkan folder tempat Anda berada.'],
        ['mkdir -p latihan-pm', 'Membuat folder; -p berarti tidak error bila sudah ada.'],
        ['&&', 'Jalankan perintah berikutnya hanya jika yang sebelumnya berhasil.'],
        ['cd latihan-pm', 'Masuk ke folder itu.'],
        ['ls -la', 'Daftar semua isi termasuk berkas tersembunyi. Folder baru hanya berisi . dan ..']
      ],
      hasil: 'Tiga versi alat tercetak, lalu folder latihan-pm kosong.', img: 'assets/t-m2-versi.png' },
    { cmd: "ls\nls js\nfind . -type f -not -path './.git/*' | sort | head -40\nfind . -type f -not -path './.git/*' | wc -l", lang: 'bash',
      ket: [
        ['ls', 'Isi folder utama proyek.'],
        ['ls js', 'Isi folder js: 20 modul JavaScript.'],
        ['find . -type f', 'Cari semua berkas (bukan folder) mulai dari folder ini.'],
        ["-not -path './.git/*'", 'Kecualikan catatan internal Git.'],
        ['| sort | head -40', 'Pipa: urutkan, lalu ambil 40 baris pertama.'],
        ['| wc -l', 'Hitung jumlah baris = jumlah berkas.']
      ],
      hasil: 'Daftar berkas proyek dan jumlahnya.', img: 'assets/t-m2-isi-folder.png' }
  ],
  folder: [
    ['index.html', 'Halaman sampul berilustrasi pelabuhan.'],
    ['app.html', 'Kerangka aplikasi; isinya diisi JavaScript.'],
    ['css/style.css', 'Warna, huruf, tata letak; tema terang dan gelap.'],
    ['js/ (20 berkas)', 'config, store, schedule, satu modul per menu.'],
    ['sql/schema.sql, rls.sql, seed.sql', 'Tabel, aturan akses, data awal.'],
    ['supabase/functions/', 'undang-member dan ringkasan-harian (berjalan di server).'],
    ['tools/', 'gen-seed.mjs, tes-jadwal.mjs, uji-sesi.mjs.'],
    ['vercel.json, README.md', 'Pengaturan hosting dan petunjuk.']
  ],
  galeri: [
    { src: 'assets/t-m2-versi.png', cap: 'Versi alat dan folder latihan' },
    { src: 'assets/t-m2-isi-folder.png', cap: 'Isi folder proyek' },
    { src: null, cap: 'Installer Node.js di Mac/Windows (belum tersedia, rekam sendiri)' },
    { src: null, cap: 'VS Code dengan folder proyek terbuka (belum tersedia, rekam sendiri)' }
  ],
  flash: [
    ['Perintah untuk melihat folder aktif?', 'pwd'],
    ['Arti && di antara dua perintah?', 'Jalankan perintah kedua hanya bila perintah pertama berhasil.'],
    ['Arti -p pada mkdir -p?', 'Buat juga folder induk dan jangan error bila sudah ada.'],
    ['Apa itu pipa | ?', 'Mengalirkan keluaran satu perintah menjadi masukan perintah berikutnya.'],
    ['Perintah menghitung baris?', 'wc -l'],
    ['Cara membuka terminal di VS Code?', 'Menu Terminal → New Terminal.'],
    ['Versi Node minimal yang disarankan?', 'v20 (LTS) atau lebih baru.'],
    ['Apa isi folder sql/?', 'schema.sql, rls.sql, seed.sql.']
  ],
  bs: [
    ['npm terpasang otomatis bersama Node.js.', true, 'npm ikut dalam installer Node.'],
    ['ls -la menyembunyikan berkas yang diawali titik.', false, '-a justru menampilkan semuanya.'],
    ['cd .. pindah ke folder induk.', true, '.. berarti folder induk.'],
    ['VS Code bisa membuka isi zip tanpa diekstrak.', false, 'Ekstrak dulu.'],
    ['command not found: node berarti Node belum terpasang atau terminal perlu dibuka ulang.', true, 'Terminal lama belum membaca PATH baru.'],
    ['head -40 mengambil 40 baris terakhir.', false, 'head = awal; tail = akhir.'],
    ['Folder js berisi 20 modul.', true, 'Satu tugas per modul.'],
    ['Git dipakai untuk menyajikan halaman web.', false, 'Git mencatat versi; Vercel menyajikan.'],
    ['find . -type f mencari berkas, bukan folder.', true, '-type f = file.'],
    ['Perintah terminal di Mac dan Linux pada modul ini sama.', true, 'Keduanya memakai shell Unix.']
  ],
  pg: [
    ['Perintah membuat folder baru?', ['cd', 'mkdir', 'ls', 'pwd'], 1, 'make directory.'],
    ['Untuk melihat versi Git, ketik…', ['git -v', 'git --version', 'git version()', 'version git'], 1, 'git --version.'],
    ['Folder . pada ls -la berarti…', ['Folder induk', 'Folder ini', 'Folder rumah', 'Berkas tersembunyi'], 1, '. = folder saat ini.'],
    ['Apa fungsi Node.js di proyek ini?', ['Mengedit gambar', 'Server lokal dan alat bantu', 'Database', 'Email'], 1, 'npx serve, gen-seed, tes-jadwal.'],
    ['Hasil "find … | wc -l" adalah…', ['Daftar nama', 'Jumlah berkas', 'Ukuran folder', 'Versi'], 1, 'Menghitung baris keluaran.'],
    ['Folder yang berisi program di server Supabase?', ['tools/', 'supabase/functions/', 'css/', 'sql/'], 1, 'Edge Functions.'],
    ['Pintasan Spotlight di Mac?', ['Ctrl + T', 'Cmd + Spasi', 'Alt + F4', 'Cmd + Q'], 1, 'Cmd + Spasi.'],
    ['Perintah untuk masuk folder latihan-pm?', ['go latihan-pm', 'cd latihan-pm', 'open latihan-pm', 'ls latihan-pm'], 1, 'change directory.'],
    ['Simbol $ di depan baris terminal menandakan…', ['Harga', 'Variabel', 'Baris perintah yang diketik', 'Error'], 2, 'Prompt.'],
    ['Berkas yang mengatur hosting di Vercel?', ['README.md', 'vercel.json', 'config.js', 'app.html'], 1, 'vercel.json.']
  ]
},
{
  no: 3, judul: 'Sampul: HTML, CSS dan SVG', fase: 'A',
  tujuan: 'Menjalankan server lokal, membuka sampul, lalu mengubah judul, warna dan ilustrasinya dengan aman.',
  materi: [
    'Halaman web punya tiga lapis: HTML (isi), CSS (rupa) dan, untuk sampul ini, SVG (gambar yang digambar dengan kode sehingga tajam di layar mana pun). Ilustrasi pelabuhan berisi langit bergradasi, crane kontainer, kapal, tug boat dan mercusuar, semuanya tanpa berkas gambar.',
    'Warna disimpan sebagai token di :root, misalnya --navy dan --signal. Mode gelap cukup mengganti nilai token di @media (prefers-color-scheme: dark).',
    'Aplikasi memakai ES modules (import … from). Browser menolak modul yang dibuka dari file://, sehingga halaman harus disajikan server lokal: npx serve atau Live Server.',
    'Tombol Lihat Demo membuka app.html?demo=1. Parameter ?demo=1 memaksa Mode Demo walaupun Supabase sudah terpasang.'
  ],
  perintah: [
    { cmd: 'cd pm-pelabuhan\nnpx serve -l 5500 .', lang: 'bash',
      ket: [
        ['cd pm-pelabuhan', 'Masuk ke folder proyek.'],
        ['npx', 'Menjalankan paket Node tanpa memasangnya permanen; pertama kali mengunduh serve.'],
        ['-l 5500', 'Pilih port 5500. Bila sudah dipakai, ganti 5501.'],
        ['.', 'Sajikan folder ini.'],
        ['Ctrl + C', 'Menghentikan server.']
      ],
      hasil: 'Server berjalan; buka http://localhost:5500.', img: 'assets/t-m3-server.png' },
    { cmd: '<h1><span class="l1">Project Management</span><span class="l2">Pelabuhan Umum</span></h1>\n<a class="btn btn-go" href="app.html" id="go-login">Masuk</a>\n<a class="btn btn-demo" href="app.html?demo=1" id="go-demo">Lihat Demo</a>', lang: 'html',
      ket: [
        ['<h1>', 'Judul utama; dua <span> agar baris bisa diberi gaya berbeda.'],
        ['href="app.html"', 'Tombol Masuk menuju aplikasi (login).'],
        ['?demo=1', 'Paksa Mode Demo.'],
        ['id=', 'Penanda unik untuk JavaScript dan pengujian.']
      ],
      hasil: 'Ubah teks di dalam span, simpan, muat ulang browser.' },
    { cmd: ':root {\n  --navy: #0E2A47;\n  --signal: #E3651D;\n}\n[hidden] { display: none !important; }', lang: 'css',
      ket: [
        [':root', 'Tempat semua token warna.'],
        ['--signal', 'Oranye sinyal untuk tombol utama dan peringatan.'],
        ['[hidden] … !important', 'Perbaikan bug: CSS tombol sempat mengalahkan atribut hidden.']
      ],
      hasil: 'Satu perubahan token mengubah seluruh halaman.' }
  ],
  folder: [
    ['index.html', 'Sampul: SVG pelabuhan (viewBox 1600×900), judul, tombol Masuk dan Lihat Demo.'],
    ['css/style.css', 'Token warna terang/gelap, gaya tombol, perbaikan [hidden].']
  ],
  galeri: [
    { src: 'assets/t-m3-server.png', cap: 'npx serve berjalan di port 5500' },
    { src: 'assets/a-sampul.png', cap: 'Sampul di browser desktop' },
    { src: 'assets/a-ponsel.png', cap: 'Tampilan ponsel 390 px' }
  ],
  flash: [
    ['Tiga lapis halaman sampul?', 'HTML (isi), CSS (rupa), SVG (ilustrasi).'],
    ['Mengapa tidak boleh membuka via file://?', 'ES modules ditolak browser tanpa server.'],
    ['Perintah server lokal port 5500?', 'npx serve -l 5500 .'],
    ['Arti ?demo=1?', 'Memaksa Mode Demo.'],
    ['Di mana token warna disimpan?', 'Di blok :root pada css/style.css.'],
    ['Bug [hidden] disebabkan oleh…', 'Aturan display tombol mengalahkan atribut hidden.'],
    ['Kelebihan SVG dibanding gambar PNG?', 'Tetap tajam di semua ukuran dan bisa diubah lewat kode.'],
    ['Cara menghentikan server?', 'Ctrl + C di terminal.']
  ],
  bs: [
    ['Klik ganda index.html cukup untuk menjalankan seluruh aplikasi.', false, 'app.html butuh server.'],
    ['Live Server di VS Code adalah alternatif npx serve.', true, 'Klik kanan → Open with Live Server.'],
    ['Mengubah --signal mengubah warna tombol utama di seluruh halaman.', true, 'Itulah guna token.'],
    ['SVG pelabuhan memakai berkas gambar JPG.', false, 'Semua bentuk digambar dengan kode.'],
    ['Mode gelap dibuat dengan menulis ulang semua komponen.', false, 'Cukup ganti nilai token.'],
    ['Ilustrasi pernah menutupi judul di layar sempit.', true, 'Diperbaiki dengan memperkecil adegan dan lapisan veil.'],
    ['Port 5500 tidak bisa diganti.', false, 'Gunakan -l 5501.'],
    ['npx memasang paket secara permanen.', false, 'npx menjalankan tanpa memasang permanen.'],
    ['Tombol Masuk membuka app.html.', true, 'Tanpa ?demo=1.'],
    ['!important membuat aturan [hidden] menang atas aturan lain.', true, 'Itulah perbaikannya.']
  ],
  pg: [
    ['Bagian halaman yang mengatur warna?', ['HTML', 'CSS', 'SQL', 'JSON'], 1, 'CSS = rupa.'],
    ['Pesan apa yang muncul jika app.html dibuka via file://?', ['Halaman kosong karena modul ditolak', 'Error 404', 'Login otomatis', 'Mode gelap'], 0, 'Modul diblokir.'],
    ['Opsi -l pada serve berarti…', ['list', 'listen (port)', 'log', 'local only'], 1, 'Port.'],
    ['Untuk tampilan ponsel di browser desktop, gunakan…', ['DevTools → ikon ponsel', 'Zoom 50%', 'Mode gelap', 'Cetak'], 0, 'Device toolbar.'],
    ['Elemen SVG yang memberi langit bergradasi?', ['<rect> polos', '<linearGradient>', '<img>', '<canvas>'], 1, 'linearGradient.'],
    ['Perbaikan ilustrasi menutupi judul?', ['Hapus ilustrasi', 'Perkecil dan geser adegan, tambah veil', 'Perbesar judul 300%', 'Ganti font'], 1, 'Itu yang dilakukan.'],
    ['Token warna oranye sinyal bernama…', ['--navy', '--signal', '--orange', '--accent2'], 1, '--signal.'],
    ['Media query untuk mode gelap?', ['@media print', '@media (prefers-color-scheme: dark)', '@media (max-width: 400px)', '@dark'], 1, 'prefers-color-scheme.'],
    ['Tombol Lihat Demo menuju…', ['index.html', 'app.html?demo=1', 'demo.html', 'supabase.com'], 1, 'Mode Demo.'],
    ['Lebar layar ponsel yang diuji?', ['390 px', '1440 px', '768 px', '1080 px'], 0, '390 px.']
  ]
},
{
  no: 4, judul: 'JavaScript modular dan Mode Demo', fase: 'A',
  tujuan: 'Memahami cara 20 modul saling memanggil, memeriksa sintaks dari terminal, dan menjelaskan mengapa demo berjalan tanpa server.',
  materi: [
    'Setiap berkas di js/ adalah satu modul dengan satu tugas. Modul mengambil fungsi dari modul lain dengan import. main.js adalah titik masuk: ia memuat store, auth, dan satu fungsi render per menu.',
    'Kunci desainnya satu pintu data. Semua menu hanya memanggil store; store memilih LocalAdapter (Mode Demo: localStorage pmpu.demo.v1, BroadcastChannel antar-tab, IndexedDB untuk berkas) atau SupabaseAdapter (Postgres, Realtime, Storage, Auth).',
    'Memindah dari demo ke server cukup dengan mengisi SUPABASE_URL dan SUPABASE_ANON_KEY di js/config.js. Kunci service_role tidak pernah boleh ada di berkas ini karena berkasnya dikirim ke browser.',
    'Akses localStorage dibungkus try/catch (safeStorage di util.js) karena jendela penyamaran kadang menolaknya.'
  ],
  perintah: [
    { cmd: 'for f in js/*.js; do node --check "$f" && echo "OK  $f"; done', lang: 'bash',
      ket: [
        ['for f in js/*.js', 'Ulangi untuk setiap berkas .js di folder js.'],
        ['node --check "$f"', 'Periksa tata bahasa tanpa menjalankan program.'],
        ['&& echo "OK  $f"', 'Cetak OK bila lolos.'],
        ['done', 'Akhir pengulangan.']
      ],
      hasil: '20 baris OK. Bila ada salah ketik, Node menunjukkan nomor baris.', img: 'assets/t-m4-cek-sintaks.png' },
    { cmd: "export const CONFIG = {\n  SUPABASE_URL: '',        // kosong = Mode Demo\n  SUPABASE_ANON_KEY: '',   // kunci publik; JANGAN service_role\n  PROJECT_START: '2026-11-03',\n  STORAGE_BUCKET: 'documents',\n  MAX_UPLOAD_MB: 20,\n};", lang: 'js',
      ket: [
        ['SUPABASE_URL', 'Alamat proyek Supabase; kosong berarti Mode Demo.'],
        ['SUPABASE_ANON_KEY', 'Kunci publik; aman karena dilindungi RLS.'],
        ['PROJECT_START', 'Hari 1 proyek; dasar hitungan Hari ke-N.'],
        ['STORAGE_BUCKET, MAX_UPLOAD_MB', 'Tempat dan batas ukuran unggahan.']
      ],
      hasil: 'Satu berkas menentukan mode aplikasi.' }
  ],
  folder: [
    ['js/main.js', 'Titik masuk: login, navigasi, router hash (#dashboard, #kegiatan, …).'],
    ['js/store.js', 'Pusat data; memilih adapter.'],
    ['js/supabase.js', 'SupabaseAdapter: baca, tulis, Realtime, Storage, undangan.'],
    ['js/seed.js', 'Data contoh dari naskah untuk Mode Demo dan seed.sql.'],
    ['js/util.js', 'Fungsi kecil: tanggal, escape HTML, safeStorage.'],
    ['js/ui.js', 'Toast, ikon, penanganan error bersama.']
  ],
  galeri: [
    { src: 'assets/t-m4-cek-sintaks.png', cap: 'node --check: semua modul lolos' },
    { src: 'assets/a-pilih-member.png', cap: 'Memilih member di Mode Demo' },
    { src: 'assets/a-dashboard.png', cap: 'Dashboard Mode Demo' }
  ],
  flash: [
    ['Apa arti "satu pintu data"?', 'Semua menu hanya memanggil store; store memilih tempat penyimpanan.'],
    ['Kunci localStorage Mode Demo?', 'pmpu.demo.v1'],
    ['Untuk apa BroadcastChannel?', 'Menyinkronkan perubahan antar-tab di Mode Demo.'],
    ['Untuk apa IndexedDB?', 'Menyimpan berkas unggahan di Mode Demo.'],
    ['Apa yang dilakukan node --check?', 'Memeriksa sintaks tanpa menjalankan.'],
    ['Kunci yang tidak boleh di config.js?', 'service_role.'],
    ['Titik masuk aplikasi?', 'js/main.js.'],
    ['Cara mengembalikan data demo?', 'Proyek & baseline → Atur ulang data demo.']
  ],
  bs: [
    ['Menu Kegiatan langsung memanggil Supabase.', false, 'Lewat store.'],
    ['Mode Demo menyimpan data per browser.', true, 'Data tidak pindah ke perangkat lain.'],
    ['Mengisi SUPABASE_URL dan ANON_KEY mengaktifkan mode server.', true, 'Itu saja yang perlu diubah.'],
    ['anon key berbahaya bila terlihat publik.', false, 'Aman karena RLS.'],
    ['node --check menjalankan program.', false, 'Hanya memeriksa.'],
    ['Dua tab demo saling sinkron.', true, 'BroadcastChannel.'],
    ['safeStorage membungkus localStorage dengan try/catch.', true, 'Agar tidak macet di mode penyamaran.'],
    ['Setiap modul sebaiknya mengerjakan banyak tugas sekaligus.', false, 'Satu modul satu tugas.'],
    ['seed.js dipakai juga untuk membuat seed.sql.', true, 'Lewat tools/gen-seed.mjs.'],
    ['Router aplikasi memakai hash seperti #gantt.', true, 'Router hash di main.js.']
  ],
  pg: [
    ['Kata kunci untuk mengambil fungsi dari modul lain?', ['require', 'import', 'include', 'using'], 1, 'ES modules.'],
    ['Adapter yang dipakai saat config.js kosong?', ['SupabaseAdapter', 'LocalAdapter', 'FileAdapter', 'Tidak ada'], 1, 'Mode Demo.'],
    ['Berkas mana yang berisi alamat Supabase?', ['store.js', 'config.js', 'seed.js', 'ui.js'], 1, 'config.js.'],
    ['Teknologi browser untuk berkas Mode Demo?', ['Cookie', 'IndexedDB', 'SessionStorage', 'Cache API'], 1, 'IndexedDB.'],
    ['Hasil yang benar dari pemeriksaan sintaks?', ['20 baris OK', '20 error', 'Server berjalan', 'Daftar tabel'], 0, 'Semua lolos.'],
    ['Mengapa store memakai pola adapter?', ['Lebih cepat', 'UI tidak perlu tahu data disimpan di mana', 'Wajib di JavaScript', 'Agar bisa cetak'], 1, 'Pemisahan tanggung jawab.'],
    ['Fungsi render menu Gantt berada di…', ['gantt.js', 'main.js', 'schedule.js', 'network.js'], 0, 'gantt.js.'],
    ['Logika hitung jadwal berada di…', ['tasks.js', 'schedule.js', 'dashboard.js', 'util.js'], 1, 'schedule.js.'],
    ['Data demo hilang setelah ganti browser karena…', ['Bug', 'Tersimpan di browser lama', 'Server mati', 'RLS'], 1, 'localStorage per browser.'],
    ['PROJECT_START dipakai untuk…', ['Warna', 'Menghitung Hari ke-N', 'Login', 'Ukuran unggahan'], 1, 'Hari 1 proyek.']
  ]
},
{
  no: 5, judul: 'Logika jadwal: jalur kritis, seri/paralel, dampak', fase: 'A',
  tujuan: 'Membaca tabel CPM, membedakan kegiatan seri dan paralel, dan menjelaskan mengapa satu kegiatan terlambat memundurkan keputusan proyek.',
  materi: [
    'schedule.js menghitung jadwal dalam empat langkah: urutkan kegiatan (topological sort, algoritme Kahn; bila gagal berarti ada siklus), hitung maju (ES, EF), hitung mundur (batas paling lambat), lalu slack = selisihnya. Slack 0 berarti kritis.',
    'Gelombang mengelompokkan kegiatan yang boleh berjalan bersamaan (paralel). Kegiatan yang saling bergantung di gelombang berbeda adalah seri.',
    'Prakiraan menghitung ulang jadwal dari progres nyata dan tanggal acuan. Geser = prakiraan dikurangi rencana. Dampak = daftar turunan yang ikut terdorong, gate yang terancam, dan pergeseran Keputusan Hari 90.',
    'Contoh tanggal acuan 20 Nov 2026 (Hari 18): A-02 dan T-01 terlambat; turunannya bergeser 14 hari; G1, G2, G4, G5 terancam; Keputusan Hari 90 mundur 14 hari.'
  ],
  perintah: [
    { cmd: 'node tools/tes-jadwal.mjs 2026-11-20\nnode tools/tes-jadwal.mjs besok', lang: 'bash',
      ket: [
        ['tes-jadwal.mjs', 'Alat uji yang memakai schedule.js yang sama dengan aplikasi.'],
        ['2026-11-20', 'Tanggal acuan: anggap hari ini 20 November 2026.'],
        ['besok', 'Masukan sengaja salah; alat menolak "Format tanggal harus YYYY-MM-DD" dan keluar dengan kode 1.']
      ],
      hasil: 'Tabel 14 kegiatan (Gel, ES, EF, Slack, Kritis, Prakiraan, Geser, Status) dan baris Dampak A-02.', img: 'assets/t-m5-uji-jadwal.png' }
  ],
  folder: [
    ['js/schedule.js', 'Kahn, forward/backward pass, slack, gelombang, prakiraan, dampak.'],
    ['js/gantt.js', 'Gantt: lajur, panah dependensi, jalur kritis, garis hari ini dan H90.'],
    ['js/network.js', 'Diagram jaringan kerja per gelombang.'],
    ['tools/tes-jadwal.mjs', 'Uji jadwal dari terminal; validasi format tanggal.']
  ],
  galeri: [
    { src: 'assets/t-m5-uji-jadwal.png', cap: 'Keluaran tes-jadwal' },
    { src: 'assets/a-gantt-terlambat.png', cap: 'Gantt pada tanggal acuan 20 Nov 2026' },
    { src: 'assets/a-dampak.png', cap: 'Panel dampak keterlambatan' },
    { src: 'assets/a-jaringan.png', cap: 'Jaringan kerja: gelombang paralel' },
    { src: 'assets/a-dashboard-terlambat.png', cap: 'Dashboard saat simulasi terlambat' }
  ],
  flash: [
    ['Apa arti slack 0?', 'Kegiatan kritis: terlambat sehari memundurkan proyek sehari.'],
    ['ES dan EF?', 'Hari mulai dan selesai paling awal.'],
    ['Algoritme pengurutan yang dipakai?', 'Topological sort Kahn.'],
    ['Apa itu gelombang?', 'Kelompok kegiatan yang boleh paralel.'],
    ['Arti kolom Geser +14?', 'Prakiraan mundur 14 hari dari rencana.'],
    ['Gate yang terancam pada contoh 20 Nov?', 'G1, G2, G4, G5.'],
    ['Bug analisis dampak versi pertama?', 'Membandingkan dengan skenario tepat waktu; diperbaiki dengan membandingkan ke baseline sendiri.'],
    ['Format tanggal yang diterima?', 'YYYY-MM-DD.']
  ],
  bs: [
    ['Kegiatan paling lama selalu kritis.', false, 'Yang menentukan adalah slack.'],
    ['Dependensi melingkar membuat pengurutan gagal.', true, 'Dan ditolak.'],
    ['Kegiatan di gelombang yang sama boleh berjalan bersamaan.', true, 'Paralel.'],
    ['A-02 geser 11 hari, tetapi turunannya geser 14 hari.', true, 'Mengikuti T-01 yang kritis.'],
    ['Kode keluar 1 menandakan berhasil.', false, '0 = berhasil, 1 = gagal.'],
    ['Tanggal acuan bisa disimulasikan di Dashboard.', true, 'Fitur simulasi.'],
    ['T-00 pada contoh selesai lebih cepat.', true, 'Geser -4.'],
    ['Slack dihitung dari hitung maju saja.', false, 'Butuh hitung mundur juga.'],
    ['Keputusan Hari 90 diwakili kegiatan A-10.', true, 'DECISION_TASK_KODE.'],
    ['20/11/2026 diterima tes-jadwal.', false, 'Harus 2026-11-20.']
  ],
  pg: [
    ['Slack adalah…', ['Durasi kegiatan', 'Hari cadangan sebelum memundurkan proyek', 'Jumlah PIC', 'Progres'], 1, 'Selisih paling lambat dan paling awal.'],
    ['Langkah pertama schedule.js?', ['Hitung mundur', 'Urutkan kegiatan', 'Gambar Gantt', 'Kirim email'], 1, 'Topological sort.'],
    ['Kolom yang menunjukkan boleh paralel?', ['Slack', 'Gel', 'Geser', 'EF'], 1, 'Gelombang.'],
    ['Keputusan Hari 90 pada contoh mundur…', ['0 hari', '4 hari', '11 hari', '14 hari'], 3, '14 hari.'],
    ['Mengapa turunan A-02 geser 14, bukan 11?', ['Bug', 'Mereka juga menunggu T-01 yang geser 14', 'Pembulatan', 'Hari libur'], 1, 'Pendahulu terlambat terakhir menentukan.'],
    ['Kegiatan dengan slack 30 pada contoh?', ['A-06', 'A-02', 'A-10', 'T-03'], 0, 'A-06.'],
    ['Pelajaran dari bug analisis dampak?', ['Jangan menguji', 'Uji dengan kasus yang jawabannya sudah diketahui', 'Hapus fitur', 'Pakai Excel'], 1, 'Kasus uji yang diketahui.'],
    ['Garis vertikal di Gantt yang menandai keputusan?', ['Hari ini', 'Keputusan H90', 'Baseline', 'Deadline PIC'], 1, 'H90.'],
    ['Masukan yang ditolak tes-jadwal?', ['2026-12-01', 'besok', '2026-11-20', '2027-01-31'], 1, 'Bukan format tanggal.'],
    ['Jalur kritis adalah rangkaian kegiatan dengan…', ['Biaya tertinggi', 'Slack 0', 'PIC terbanyak', 'Dokumen terbanyak'], 1, 'Slack 0.']
  ]
}
);
