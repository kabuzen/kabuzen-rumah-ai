// Isi LMS bagian 2: Modul 6–10, studi kasus dan glosarium.
window.LMS = window.LMS || { modul: [] };

window.LMS.modul.push(
{
  no: 6, judul: 'Antarmuka, validasi dan peran', fase: 'A',
  tujuan: 'Membuat formulir yang menolak data salah dengan pesan jelas, dan membatasi tombol sesuai peran.',
  materi: [
    'Aturan ditegakkan dua lapis. Lapis browser (auth.can() dan fungsi validasi) membuat pengguna langsung tahu kesalahannya. Lapis database (RLS dan trigger) menjaga aturan walaupun seseorang memanggil server tanpa lewat aplikasi.',
    'Validasi mengumpulkan semua kesalahan sekaligus, bukan berhenti di yang pertama: kode kosong atau ganda, nama kurang dari 4 karakter, durasi bukan bilangan bulat 1–730, deadline sebelum mulai, PIC beda bidang, progres di luar 0–100, dependensi ke diri sendiri atau melingkar, Selesai tanpa bukti, dan kegiatan seri ditutup sebelum pendahulunya selesai.',
    'Matriks peran: Orkestrator membuat kegiatan, mengubah dependensi, menggeser Gantt, mengelola member dan risiko, meninjau laporan. PIC hanya mengubah status/progres dan melapor di bidangnya. Direktur memutuskan gate, menyetujui baseline, dan hanya mengubah kegiatan bidang DIR. Pengamat membaca.',
    'Pengecualian okDir: Orkestrator boleh menjadi PIC sementara di bidang mana pun, ditandai "(Orkestrator, sementara)".'
  ],
  perintah: [
    { cmd: "const errors = [];\nif (!v.kode) errors.push('Kode kegiatan wajib diisi.');\nif (!v.nama || v.nama.length < 4) errors.push('Nama kegiatan minimal 4 karakter.');\nif (!Number.isInteger(v.durasi) || v.durasi <= 0)\n  errors.push('Durasi harus bilangan bulat lebih dari 0 hari.');\nif (v.deadline < v.start_date) errors.push('Deadline tidak boleh sebelum tanggal mulai.');\nconst okDir = p.role === 'orkestrator' || (v.bidang === 'DIR' && p.role === 'direktur');\nif (p.bidang !== v.bidang && !okDir) errors.push(`PIC ${p.nama} berada di bidang lain.`);", lang: 'js',
      ket: [
        ['const errors = []', 'Wadah semua pesan kesalahan.'],
        ['errors.push(…)', 'Tambahkan pesan; pemeriksaan berikutnya tetap berjalan.'],
        ['Number.isInteger', 'Menolak 2,5 hari atau teks.'],
        ['v.deadline < v.start_date', 'Tanggal ISO bisa dibandingkan sebagai teks.'],
        ['okDir', 'Pengecualian PIC lintas bidang untuk Orkestrator dan Direktur di DIR.']
      ],
      hasil: 'Formulir menampilkan daftar kesalahan; tidak ada yang tersimpan.', img: 'assets/a-validasi.png' },
    { cmd: "case 'task.update':\n  return r === 'orkestrator' || (r === 'pic' && ownBidang) || (r === 'direktur' && obj?.bidang === 'DIR');\ncase 'gate.decide': case 'baseline.approve':\n  return r === 'direktur';", lang: 'js',
      ket: [
        ["case 'task.update'", 'Siapa boleh mengubah status/progres.'],
        ['ownBidang', 'Bidang kegiatan sama dengan bidang pengguna.'],
        ["'gate.decide'", 'Hanya Direktur.']
      ],
      hasil: 'Tombol yang tidak berhak tidak tampil.' }
  ],
  folder: [
    ['js/auth.js', 'Peran pengguna dan fungsi can().'],
    ['js/tasks.js', 'Daftar, formulir dan validasi kegiatan.'],
    ['js/reports.js', 'Formulir laporan; kegiatan berjalan dan deadline terdekat di atas.'],
    ['js/notify.js', 'Lonceng notifikasi dan rantai dampak.'],
    ['js/gates.js', 'Papan stage-gate dan keputusan Direktur.']
  ],
  galeri: [
    { src: 'assets/a-kegiatan.png', cap: 'Daftar kegiatan dengan penanda seri/paralel' },
    { src: 'assets/a-validasi.png', cap: 'Lima kesalahan validasi sekaligus' },
    { src: 'assets/a-form-laporan.png', cap: 'Formulir laporan PIC' },
    { src: 'assets/a-notifikasi.png', cap: 'Notifikasi dan rantai dampak' },
    { src: 'assets/a-gate.png', cap: 'Stage-gate' },
    { src: 'assets/a-laporan.png', cap: 'Laporan online' },
    { src: 'assets/a-risiko.png', cap: 'Register risiko' },
    { src: 'assets/a-checklist.png', cap: 'Checklist berbukti' },
    { src: 'assets/a-dokumen.png', cap: 'Dokumen' },
    { src: 'assets/a-isu.png', cap: 'Register isu' }
  ],
  flash: [
    ['Dua lapis penegakan aturan?', 'Browser (auth.can, validasi) dan database (RLS, trigger).'],
    ['Mengapa validasi mengumpulkan semua kesalahan?', 'Pengguna memperbaiki sekaligus, tidak bolak-balik.'],
    ['Batas durasi kegiatan?', '1 sampai 730 hari.'],
    ['Siapa boleh memutuskan gate?', 'Direktur.'],
    ['Apa itu okDir?', 'Pengecualian PIC lintas bidang untuk Orkestrator (dan Direktur di DIR).'],
    ['Syarat menandai Selesai?', 'Bukti wajib sudah diunggah.'],
    ['Bug formulir laporan?', 'Kegiatan default dipilih abjad; diperbaiki dengan urutan berjalan + deadline terdekat.'],
    ['Direktur boleh mengubah kegiatan bidang…', 'DIR saja.']
  ],
  bs: [
    ['Menyembunyikan tombol sudah cukup untuk keamanan.', false, 'Perlu aturan di server.'],
    ['PIC LEG boleh mengubah progres kegiatan TRL.', false, 'Hanya bidangnya.'],
    ['Nama kegiatan "AB" ditolak.', true, 'Minimal 4 karakter.'],
    ['Kegiatan boleh bergantung pada dirinya sendiri.', false, 'Ditolak.'],
    ['Orkestrator bisa menjadi PIC sementara di bidang lain.', true, 'Pengecualian okDir.'],
    ['Pengamat boleh mengunggah dokumen.', false, 'doc.upload: semua kecuali viewer.'],
    ['Pesan kesalahan sebaiknya menyebut cara memperbaiki.', true, 'Bukan pesan teknis.'],
    ['Durasi 800 hari diterima.', false, 'Maksimal 730; pecah kegiatan.'],
    ['Direktur menyetujui baseline.', true, 'baseline.approve.'],
    ['Kegiatan seri boleh ditutup sebelum pendahulunya selesai.', false, 'Ditolak.']
  ],
  pg: [
    ['Fungsi pengecek hak akses di browser?', ['store.get()', 'auth.can()', 'ui.toast()', 'schedule.run()'], 1, 'auth.can.'],
    ['Peran yang meninjau laporan?', ['Direktur', 'Orkestrator', 'PIC', 'Pengamat'], 1, 'report.review.'],
    ['Durasi 2,5 hari ditolak karena…', ['Terlalu pendek', 'Bukan bilangan bulat', 'Lebih dari 730', 'Bidang salah'], 1, 'Number.isInteger.'],
    ['Lapis yang tetap berlaku jika server dipanggil langsung?', ['CSS', 'auth.can', 'RLS dan trigger', 'Tooltip'], 2, 'Database.'],
    ['Label PIC sementara di daftar?', ['(PIC cadangan)', '(Orkestrator, sementara)', '(Direktur)', '(Nonaktif)'], 1, 'Label itu.'],
    ['Tindakan khusus Orkestrator?', ['Memutuskan gate', 'Menggeser batang Gantt', 'Menyetujui baseline', 'Membaca saja'], 1, 'task.move.'],
    ['Kesalahan yang muncul bila PIC nonaktif?', ['Kode ganda', 'Pilih PIC lain', 'Siklus', 'Bukti'], 1, 'PIC sudah nonaktif.'],
    ['Urutan default formulir laporan setelah perbaikan?', ['Abjad', 'Acak', 'Kegiatan berjalan dan deadline terdekat', 'Terbaru dibuat'], 2, 'Perbaikan studi kasus.'],
    ['Siapa boleh membuat isu?', ['Hanya Orkestrator', 'Semua kecuali Pengamat', 'Hanya Direktur', 'Semua'], 1, 'issue.create.'],
    ['Jumlah kesalahan di Gambar validasi?', ['1', '3', '5', '10'], 2, 'Lima.']
  ]
},
{
  no: 7, judul: 'Supabase I: membangun database', fase: 'B',
  tujuan: 'Membuat proyek Supabase, menjalankan tiga berkas SQL berurutan, dan memeriksa data awal.',
  materi: [
    'Supabase menyediakan Postgres, login, penyimpanan berkas dan Realtime dalam satu paket. Database berisi tabel, relasi (kolom yang menunjuk baris tabel lain) dan trigger (aturan otomatis saat data berubah).',
    'Ada 12 tabel: profiles, projects, gates, tasks, dependencies, documents, reports, risks, checklist_items, issues, notifications, audit_log. Hampir semua menunjuk ke tasks atau profiles.',
    'Aturan bisa ditulis di tabel: check (length(nama) >= 4), unique (project_id, kode), deadline_setelah_mulai, selesai_lengkap. Trigger menambah aturan yang lebih rumit: updated_at, audit, link_profile, tolak siklus, guard kegiatan, Selesai berbukti, gate lulus bersyarat, guard checklist.',
    'Urutan wajib di SQL Editor: schema.sql, lalu rls.sql, lalu seed.sql. Pilih region Southeast Asia (Singapore), paling dekat ke Kepulauan Riau.'
  ],
  perintah: [
    { cmd: 'node tools/gen-seed.mjs\nhead -n 9 sql/seed.sql | cut -c1-118', lang: 'bash',
      ket: [
        ['gen-seed.mjs', 'Menerjemahkan js/seed.js menjadi perintah insert SQL.'],
        ['head -n 9', 'Ambil 9 baris pertama.'],
        ['cut -c1-118', 'Potong setiap baris di karakter 118 agar muat di layar.'],
        ['begin; … commit;', 'Isi seed dibungkus transaksi: semua masuk atau tidak sama sekali.'],
        ['disable trigger trg_task_done', 'Sementara mematikan cek bukti karena data contoh memuat kegiatan Selesai.']
      ],
      hasil: 'sql/seed.sql ditulis (100 baris).', img: 'assets/t-m7-gen-seed.png' },
    { cmd: 'psql -d latihan -c "select kode, nama, status from gates order by urutan"\npsql -d latihan -tc "select count(*) || \' kegiatan\' from tasks"', lang: 'bash',
      ket: [
        ['psql', 'Klien Postgres di terminal (latihan lokal).'],
        ['-d latihan', 'Pilih database bernama latihan.'],
        ['-c "…"', 'Jalankan satu perintah SQL.'],
        ['-t', 'Tanpa judul kolom.'],
        ['order by urutan', 'Urutkan gate G0–G5.'],
        ["|| ' kegiatan'", 'Gabungkan angka dengan teks.']
      ],
      hasil: 'Enam gate dan jumlah kegiatan.', img: 'assets/t-m7-psql-hitung.png' },
    { cmd: "nama     text not null check (length(nama) >= 4),\nbidang   text not null check (bidang in ('DIR','LEG','IZN','TRL','PSR','KLB')),\ndurasi   int  not null check (durasi between 1 and 730),\nunique (project_id, kode),\nconstraint deadline_setelah_mulai check (deadline >= start_date)", lang: 'sql',
      ket: [
        ['not null', 'Wajib diisi.'],
        ['check (…)', 'Aturan nilai yang diizinkan; sama dengan validasi browser.'],
        ['unique (project_id, kode)', 'Kode tidak boleh ganda dalam satu proyek.'],
        ['constraint … check', 'Aturan bernama, mudah dikenali di pesan error.']
      ],
      hasil: 'Database menolak data salah walaupun aplikasi dilewati.' }
  ],
  folder: [
    ['sql/schema.sql', '12 tabel, relasi, fungsi app_me/app_role/app_bidang, 8 trigger.'],
    ['sql/rls.sql', 'Kebijakan akses per tabel dan bucket documents (20 MB).'],
    ['sql/seed.sql', 'Data awal 100 baris dari js/seed.js.'],
    ['tools/gen-seed.mjs', 'Pembuat seed.sql.']
  ],
  galeri: [
    { src: 'assets/t-m7-gen-seed.png', cap: 'gen-seed menulis seed.sql' },
    { src: 'assets/t-m7-psql-hitung.png', cap: 'psql: gate dan jumlah kegiatan' },
    { src: 'assets/a-proyek.png', cap: 'Menu Proyek & baseline' },
    { src: null, cap: 'SQL Editor saat menjalankan schema.sql (belum tersedia)' },
    { src: null, cap: 'Table Editor tabel tasks (belum tersedia)' }
  ],
  flash: [
    ['Urutan tiga berkas SQL?', 'schema.sql → rls.sql → seed.sql.'],
    ['Berapa tabel publik?', '12.'],
    ['Fungsi trigger link_profile?', 'Menautkan akun login ke profil dengan email sama.'],
    ['Fungsi trg_dep_cycle?', 'Menolak dependensi melingkar.'],
    ['Mengapa seed dibungkus begin/commit?', 'Semua masuk atau tidak sama sekali.'],
    ['Region yang dipilih?', 'Southeast Asia (Singapore).'],
    ['Opsi -t pada psql?', 'Tampilkan isi tanpa judul kolom.'],
    ['Mengapa proyek Supabase lama dipakai ulang?', 'Paket Pro menagih biaya untuk proyek tambahan.']
  ],
  bs: [
    ['seed.sql boleh dijalankan sebelum schema.sql.', false, 'Tabel belum ada.'],
    ['check constraint menolak data salah di database.', true, 'Lapis kedua.'],
    ['Email @galangancontoh.example bisa menerima undangan.', false, 'Domain fiktif.'],
    ['trg_audit mencatat perubahan ke audit_log.', true, 'Siapa mengubah apa.'],
    ['updated_at dipakai untuk mendeteksi konflik.', true, 'Optimistic concurrency.'],
    ['Skrip SQL sebaiknya bisa dijalankan ulang.', true, 'create … if not exists.'],
    ['Semua tabel berdiri sendiri tanpa relasi.', false, 'Hampir semua menunjuk tasks/profiles.'],
    ['cut -c1-118 memotong lebar baris.', true, 'Karakter 1–118.'],
    ['Bucket documents dibuat di rls.sql.', true, 'Batas 20 MB.'],
    ['Durasi 0 diterima database.', false, 'between 1 and 730.']
  ],
  pg: [
    ['Menu Supabase untuk menjalankan SQL?', ['Table Editor', 'SQL Editor', 'Storage', 'Logs'], 1, 'SQL Editor.'],
    ['Error bila seed dijalankan pertama?', ['relation does not exist', 'permission denied', 'timeout', 'duplicate key'], 0, 'Tabel belum dibuat.'],
    ['Trigger yang memastikan Selesai berbukti?', ['trg_audit', 'trg_task_done', 'trg_updated_at', 'on_auth_user_created'], 1, 'trg_task_done.'],
    ['Tabel yang menyimpan jejak perubahan?', ['notifications', 'audit_log', 'issues', 'reports'], 1, 'audit_log.'],
    ['Jumlah baris seed.sql yang ditulis?', ['9', '42', '100', '118'], 2, '100 baris.'],
    ['Gate G1 dicegah lulus oleh…', ['trg_gate_pass', 'trg_dep_cycle', 'RLS baca', 'CSS'], 0, 'Prasyarat.'],
    ['Tabel penghubung pendahulu–penerus?', ['tasks', 'dependencies', 'gates', 'projects'], 1, 'dependencies.'],
    ['Pelajaran dari kegagalan "role already exists"?', ['Hapus database', 'Tulis skrip yang aman dijalankan ulang', 'Ganti Postgres', 'Abaikan'], 1, 'Idempoten.'],
    ['Kolom yang tidak boleh ganda dalam satu proyek?', ['nama', 'kode', 'durasi', 'status'], 1, 'unique.'],
    ['Fungsi app_role() mengembalikan…', ['Email', 'Peran pengguna login', 'Tanggal', 'Jumlah tugas'], 1, 'Peran.']
  ]
},
{
  no: 8, judul: 'Supabase II: keamanan, login dan email', fase: 'B',
  tujuan: 'Menulis dan menguji RLS, memasang SMTP Gmail, dan masuk dengan magic link.',
  materi: [
    'RLS (Row Level Security) adalah satpam di setiap tabel: sebelum baris dibaca atau diubah, database memeriksa siapa penggunanya. Karena itu anon key aman ada di browser.',
    'Kebijakan punya bagian for (insert/select/update/delete), to (authenticated), using (baris yang boleh disentuh) dan with check (data baru yang boleh disimpan).',
    'Magic link: member mengetik email, menerima tautan sekali pakai, lalu masuk. Pengirim bawaan Supabase hanya mengirim ke anggota organisasi Supabase, sehingga perlu SMTP sendiri (Gmail + sandi aplikasi).',
    'Edge Function undang-member berjalan di server, satu-satunya tempat service_role dipakai. Ia menolak pemanggil yang bukan Orkestrator dan menerjemahkan error email menjadi saran.'
  ],
  perintah: [
    { cmd: "create policy \"task_tambah\" on public.tasks for insert to authenticated\n  with check (public.app_role() = 'orkestrator');\ncreate policy \"member_baca\" on public.tasks for select to authenticated\n  using (public.app_me() is not null);", lang: 'sql',
      ket: [
        ['create policy "task_tambah"', 'Nama kebijakan.'],
        ['for insert', 'Mengatur penambahan baris.'],
        ['to authenticated', 'Untuk pengguna yang sudah login.'],
        ['with check (…)', 'Data baru hanya boleh dari Orkestrator.'],
        ['using (app_me() is not null)', 'Hanya member terdaftar yang bisa membaca.']
      ],
      hasil: 'Tanpa kebijakan yang cocok, permintaan ditolak atau 0 baris.' },
    { cmd: "set role authenticated;\nset request.jwt.claim.sub = '...0001';   -- PIC Legal\nselect app_role(), app_bidang();\nupdate tasks set progres = 60 where kode = 'A-02' returning kode, progres;\nupdate tasks set nama = 'Ganti nama' where kode = 'A-02';\nupdate tasks set progres = 10 where kode = 'A-05' returning kode;\nset request.jwt.claim.sub = '...0002';   -- Direktur\nupdate gates set status = 'Lulus' where kode = 'G1';", lang: 'sql',
      ket: [
        ['set role authenticated', 'Bertindak sebagai pengguna login biasa.'],
        ['set request.jwt.claim.sub', 'Berpura-pura menjadi akun tertentu.'],
        ['progres A-02 = 60', 'Berhasil: bidang LEG miliknya.'],
        ['ganti nama', 'Ditolak trigger: PIC hanya status, progres, uraian.'],
        ['A-05', 'UPDATE 0: RLS diam-diam menyaring bidang lain.'],
        ['G1 Lulus', 'Ditolak: prasyarat belum lengkap.']
      ],
      hasil: 'Empat hasil berbeda membuktikan RLS dan trigger bekerja.', img: 'assets/t-m8-uji-rls.png' },
    { cmd: 'revoke execute on function public.link_profile() from public, anon, authenticated;\nalter function public.guard_task_update() set search_path = public;', lang: 'sql',
      ket: [
        ['revoke execute', 'Jawaban atas Security Advisor: fungsi SECURITY DEFINER tidak boleh dipanggil sembarang orang.'],
        ['set search_path = public', 'Mencegah fungsi memakai tabel palsu dari skema lain.']
      ],
      hasil: 'Peringatan Security Advisor hilang.' },
    { cmd: 'Host       : smtp.gmail.com\nPort       : 465\nUsername   : alamat Gmail lengkap\nPassword   : sandi aplikasi 16 huruf, tanpa spasi\nSite URL   : https://<proyek>.vercel.app\nRedirect   : https://<proyek>.vercel.app/**\n             http://localhost:5500/**', lang: 'pengaturan',
      ket: [
        ['Username', 'Harus alamat Gmail, bukan nama tampilan.'],
        ['Password', 'Sandi aplikasi dari Akun Google → Keamanan; bukan sandi Gmail biasa.'],
        ['/**', 'Mengizinkan semua halaman di domain itu, termasuk app.html.']
      ],
      hasil: 'Email tautan masuk sampai ke kotak masuk (cek juga Spam).' }
  ],
  folder: [
    ['sql/rls.sql', 'Kebijakan per tabel.'],
    ['supabase/functions/undang-member/index.ts', 'Undangan/tautan masuk; cek peran; pesan error ramah.'],
    ['js/supabase.js → inviteMember()', 'Memanggil fungsi dengan redirect_to = app.html.']
  ],
  galeri: [
    { src: 'assets/t-m8-uji-rls.png', cap: 'Uji RLS dan trigger' },
    { src: 'assets/u-app-password.jpg', cap: 'Sandi aplikasi Google (sandi ditutup)' },
    { src: 'assets/u-smtp-kosong.jpg', cap: 'Formulir SMTP' },
    { src: 'assets/u-smtp-username-salah.jpg', cap: 'Username salah: nama tampilan' },
    { src: 'assets/u-url-config.jpg', cap: 'URL Configuration' },
    { src: 'assets/u-halaman-masuk.jpg', cap: 'Halaman Masuk' },
    { src: 'assets/u-email-login.jpg', cap: 'Email tautan masuk' },
    { src: 'assets/u-dashboard-tersambung.jpg', cap: 'Dasbor tersambung Supabase' },
    { src: null, cap: 'Authentication → Users dan Advisors → Security (belum tersedia)' }
  ],
  flash: [
    ['Apa itu RLS?', 'Aturan akses per baris yang diperiksa database.'],
    ['Beda using dan with check?', 'using menyaring baris yang disentuh; with check memeriksa data baru.'],
    ['Port SMTP Gmail yang dipakai?', '465.'],
    ['Panjang sandi aplikasi Google?', '16 huruf, ditulis tanpa spasi.'],
    ['Mengapa perlu SMTP sendiri?', 'Pengirim bawaan hanya ke anggota organisasi Supabase.'],
    ['Di mana service_role boleh dipakai?', 'Hanya di server (Edge Function).'],
    ['Arti otp_expired?', 'Tautan masuk sudah dipakai atau kedaluwarsa.'],
    ['Akhiran Redirect URL yang benar?', '/**']
  ],
  bs: [
    ['anon key aman di browser karena RLS.', true, 'Tanpa izin kebijakan, kunci tidak bisa apa-apa.'],
    ['Username SMTP boleh diisi nama tampilan.', false, 'Harus alamat Gmail.'],
    ['Tautan masuk bisa dipakai berkali-kali.', false, 'Sekali pakai.'],
    ['UPDATE 0 bisa berarti RLS menyaring baris.', true, 'Bukan error, tetapi 0 baris.'],
    ['Sandi aplikasi yang pernah terlihat orang lain harus dicabut.', true, 'Buat ulang.'],
    ['Edge Function undang-member menerima pemanggil siapa saja.', false, 'Hanya Orkestrator aktif.'],
    ['Security Advisor memperingatkan fungsi SECURITY DEFINER terbuka.', true, 'Diperbaiki dengan revoke.'],
    ['Sandi Gmail biasa dipakai di SMTP.', false, 'Sandi aplikasi.'],
    ['link_profile menautkan akun ke profil berdasarkan email.', true, 'Trigger saat akun dibuat.'],
    ['Log Auth bisa menunjukkan email terkirim tetapi belum diklik.', true, 'Kasus undangan yang tidak terbaca.']
  ],
  pg: [
    ['Bagian kebijakan untuk memeriksa data baru?', ['using', 'with check', 'for', 'to'], 1, 'with check.'],
    ['Hasil ganti nama A-02 oleh PIC?', ['Berhasil', 'Ditolak trigger', 'UPDATE 0', 'Timeout'], 1, 'Hanya status/progres/uraian.'],
    ['Hasil mengubah A-05 oleh PIC Legal?', ['Berhasil', 'UPDATE 0', 'Siklus', 'Email'], 1, 'Bukan bidangnya.'],
    ['Host SMTP Gmail?', ['mail.google.com', 'smtp.gmail.com', 'gmail.smtp.com', 'smtp.google.id'], 1, 'smtp.gmail.com.'],
    ['Sandi aplikasi dengan spasi berjumlah 19 karakter karena…', ['Salah ketik', 'Tiga spasi pemisah ikut tertulis', 'Bug Google', 'Port'], 1, '16 huruf + 3 spasi.'],
    ['Perintah agar fungsi tidak dipanggil anon?', ['grant', 'revoke execute', 'drop table', 'vacuum'], 1, 'revoke.'],
    ['Pesan otp_expired muncul saat…', ['Tautan dibuka kedua kali', 'SMTP benar', 'RLS aktif', 'Deploy'], 0, 'Sekali pakai.'],
    ['Peran yang boleh memanggil undang-member?', ['Direktur', 'Orkestrator', 'PIC', 'Semua'], 1, 'Orkestrator.'],
    ['Mengapa undangan ke @galangancontoh.example gagal?', ['Spam', 'Domain fiktif', 'Port salah', 'RLS'], 1, 'Alamat tidak ada.'],
    ['set request.jwt.claim.sub dipakai untuk…', ['Mengganti sandi', 'Berpura-pura menjadi pengguna tertentu saat uji', 'Mengirim email', 'Deploy'], 1, 'Simulasi akun.']
  ]
},
{
  no: 9, judul: 'GitHub dan Vercel', fase: 'B',
  tujuan: 'Mencatat versi dengan Git, menyimpan di GitHub privat, dan menyambungkan Vercel agar setiap commit otomatis terbit.',
  materi: [
    'Git adalah buku catatan perubahan di laptop: setiap commit adalah foto seluruh folder dengan pesan. GitHub adalah lemari arsip di internet. Vercel adalah etalase yang menyajikan berkas ke browser siapa pun.',
    'Aplikasi ini statis (tanpa build), jadi Vercel cukup menyalin berkas: Framework Other, tanpa build command, output directory titik (.).',
    'Setiap commit baru di GitHub memicu deploy baru. Alamat per-deploy (berisi kode acak) dilindungi login Vercel; yang dibagikan ke tim adalah domain produksi.',
    'Domain produksi harus didaftarkan di Supabase (Site URL dan Redirect URLs) agar tautan masuk kembali ke alamat yang benar.'
  ],
  perintah: [
    { cmd: 'git init -b main\ngit add .\ngit commit -q -m "Versi pertama PM Pelabuhan Umum" && git log --oneline\necho "// ubah" >> js/config.js && git status --short\ngit diff --stat', lang: 'bash',
      ket: [
        ['git init -b main', 'Mulai mencatat; cabang utama bernama main.'],
        ['git add .', 'Masukkan semua berkas ke daftar foto (staging); belum tersimpan.'],
        ['git commit -q -m "…"', 'Ambil foto dengan pesan; -q ringkas.'],
        ['git log --oneline', 'Satu baris per commit.'],
        ['>>', 'Tambahkan teks ke akhir berkas.'],
        ['git status --short', 'M = berkas berubah.'],
        ['git diff --stat', 'Ringkasan baris bertambah/berkurang.']
      ],
      hasil: 'Satu commit tercatat, lalu config.js terdeteksi berubah.', img: 'assets/t-m9-git.png' },
    { cmd: '1. github.com → New repository → Private, tanpa README\n2. uploading an existing file → seret isi folder (bukan zip)\n3. Commit changes (sekali)\n4. vercel.com → Add New → Project → Import repo\n   Framework: Other · Build: kosong · Output: .\n5. Commit kecil di README → Vercel deploy ulang\n6. Bagikan domain produksi; daftarkan di Supabase', lang: 'langkah',
      ket: [
        ['Private', 'Hanya Anda dan yang diundang bisa melihat kode.'],
        ['bukan zip', 'Vercel tidak bisa menyajikan isi zip.'],
        ['Framework Other', 'Tidak ada proses build.'],
        ['commit README', 'Cara cepat memicu deploy setelah tersambung.']
      ],
      hasil: 'Aplikasi daring di https://<proyek>.vercel.app.' }
  ],
  folder: [
    ['.git/', 'Catatan internal Git (tersembunyi).'],
    ['vercel.json', 'Pengaturan hosting.'],
    ['README.md', 'Petunjuk; juga dipakai untuk memicu deploy.']
  ],
  galeri: [
    { src: 'assets/t-m9-git.png', cap: 'Siklus git' },
    { src: 'assets/u-repo-baru.jpg', cap: 'Repositori baru' },
    { src: 'assets/u-quick-setup.jpg', cap: 'Quick setup' },
    { src: 'assets/u-unggah-berkas.jpg', cap: 'Unggah berkas' },
    { src: 'assets/u-readme.jpg', cap: 'README tampil' },
    { src: 'assets/u-edit-readme.jpg', cap: 'Edit README di GitHub' },
    { src: 'assets/u-vercel-git.jpg', cap: 'Vercel memilih Git' },
    { src: 'assets/u-vercel-tersambung.jpg', cap: 'Vercel tersambung' },
    { src: 'assets/u-deployments.jpg', cap: 'Daftar deployment' },
    { src: 'assets/u-sampul-incognito.jpg', cap: 'Uji di jendela penyamaran' }
  ],
  flash: [
    ['Apa itu commit?', 'Foto seluruh folder pada satu saat, dengan pesan.'],
    ['Fungsi git add?', 'Memasukkan berkas ke staging; belum menyimpan.'],
    ['Pengaturan framework Vercel?', 'Other, tanpa build, output titik.'],
    ['Mengapa URL per-deploy minta login?', 'Dilindungi Vercel; bagikan domain produksi.'],
    ['Cara memicu deploy ulang?', 'Commit baru ke GitHub (misalnya edit README).'],
    ['Tanda M pada git status --short?', 'Berkas berubah (modified).'],
    ['Repositori sebaiknya…', 'Privat.'],
    ['Apa yang tidak boleh ada di repositori?', 'service_role key dan sandi SMTP.']
  ],
  bs: [
    ['git add langsung menyimpan versi.', false, 'Perlu commit.'],
    ['Vercel menjalankan build untuk aplikasi ini.', false, 'Statis, tanpa build.'],
    ['Domain produksi harus didaftarkan di Supabase.', true, 'Redirect URLs.'],
    ['Mengunggah zip ke GitHub sama dengan mengunggah isinya.', false, 'Harus isi folder.'],
    ['Setiap commit menjadi satu deployment.', true, 'Daftar deployment.'],
    ['anon key boleh terlihat di repositori.', true, 'Kunci publik, dilindungi RLS.'],
    ['Unggahan Vercel Drop awal membuat aplikasi tetap Mode Demo.', true, 'config.js lama.'],
    ['git log --oneline menampilkan isi berkas.', false, 'Daftar commit.'],
    ['Commit changes perlu diklik dua kali.', false, 'Sekali cukup.'],
    ['Uji di jendela penyamaran memastikan tidak memakai sesi lama.', true, 'Pengujian bersih.']
  ],
  pg: [
    ['Analogi GitHub?', ['Etalase', 'Lemari arsip di internet', 'Buku catatan', 'Satpam'], 1, 'Arsip.'],
    ['Output directory di Vercel?', ['dist', 'build', '.', 'public'], 2, 'Folder akar.'],
    ['Perintah ringkasan perubahan baris?', ['git log', 'git diff --stat', 'git add', 'git init'], 1, 'diff --stat.'],
    ['Penyebab aplikasi daring masih Mode Demo?', ['RLS', 'Unggahan awal tanpa config.js terbaru', 'SMTP', 'Port'], 1, 'Vercel Drop lama.'],
    ['Alamat yang dibagikan ke tim?', ['URL per-deploy', 'Domain produksi', 'localhost', 'URL GitHub'], 1, 'Produksi.'],
    ['Nama cabang utama di contoh?', ['master', 'main', 'dev', 'prod'], 1, '-b main.'],
    ['Visibilitas repositori yang dipilih?', ['Public', 'Private', 'Internal', 'Archive'], 1, 'Private.'],
    ['Simbol untuk menambah ke akhir berkas?', ['>', '>>', '|', '&&'], 1, '>> menambah.'],
    ['Langkah setelah Vercel tersambung untuk memicu deploy?', ['Hapus repo', 'Commit kecil', 'Ganti domain', 'Restart Mac'], 1, 'Commit.'],
    ['Halaman yang menunjukkan riwayat rilis di Vercel?', ['Settings', 'Deployments', 'Domains', 'Usage'], 1, 'Deployments.']
  ]
},
{
  no: 10, judul: 'Operasi, debugging dan evaluasi', fase: 'C',
  tujuan: 'Melacak error dari gejala sampai log, mengganti data tim dengan aman, dan mempresentasikan proyek akhir.',
  materi: [
    'Empat langkah debugging: amati gejala, bentuk dugaan, uji dugaan dengan kasus kecil, perbaiki dan uji ulang.',
    'Kasus konflik palsu: setelah masuk dari email, mengubah progres memunculkan "Data ini baru saja diubah orang lain". Penyebabnya tautan dibuka dua kali, sesi hilang, permintaan terkirim anonim, RLS menyaring, 0 baris berubah, dan versi lama salah menyebutnya konflik.',
    'Perbaikannya di supabase.js: ensureSession() sebelum menulis; bila 0 baris berubah, baca ulang updated_at untuk membedakan sesi habis, konflik sungguhan, dan tidak berizin.',
    'Mengganti member contoh: pindahkan kegiatan, risiko dan laporan ke member baru dengan tabel bantu peta, hapus member contoh, semuanya dalam satu transaksi. Lalu periksa: 0 profil contoh, 0 kegiatan tanpa PIC.'
  ],
  perintah: [
    { cmd: 'node tools/uji-sesi.mjs', lang: 'bash',
      ket: [
        ['uji-sesi.mjs', 'Menguji empat cabang update() dengan klien Supabase palsu, tanpa internet.'],
        ['Tanpa sesi', '[sesi habis] minta masuk ulang.'],
        ['Normal', 'tersimpan.'],
        ['Diubah orang lain', '[konflik].'],
        ['Tidak berizin', '[ditolak].']
      ],
      hasil: 'Empat baris hasil sesuai harapan.', img: 'assets/t-m10-uji-sesi.png' },
    { cmd: "begin;\ncreate temporary table peta (lama uuid, baru uuid) on commit drop;\ninsert into peta values ('<id contoh>', '<id baru>');\nupdate tasks   set pic_id     = p.baru from peta p where pic_id     = p.lama;\nupdate risks   set pemilik_id = p.baru from peta p where pemilik_id = p.lama;\nupdate reports set author_id  = p.baru from peta p where author_id  = p.lama;\ndelete from profiles where email like '%@galangancontoh.example';\ncommit;", lang: 'sql',
      ket: [
        ['begin … commit', 'Transaksi: semua atau tidak sama sekali.'],
        ['temporary table peta', 'Tabel bantu yang hilang sendiri setelah commit.'],
        ['update … from peta', 'Ganti pemilik lama dengan baru sekaligus.'],
        ["like '%@galangancontoh.example'", 'Hapus semua profil contoh.'],
        ['Run without RLS', 'Peringatan SQL Editor; pilih hanya bila yakin isinya.']
      ],
      hasil: 'Tim sebenarnya menggantikan contoh tanpa kegiatan yatim.', img: 'assets/u-sql-berhasil.jpg' }
  ],
  folder: [
    ['js/supabase.js', 'ensureSession(), sessionExpiredError(), update() tiga cabang.'],
    ['js/main.js', 'Membaca #error_code=otp_expired dan menampilkan pesan di halaman Masuk.'],
    ['js/ui.js', 'reportError meneruskan sesi habis ke halaman Masuk.'],
    ['tools/uji-sesi.mjs', 'Uji cabang tanpa internet.']
  ],
  galeri: [
    { src: 'assets/t-m10-uji-sesi.png', cap: 'uji-sesi: empat cabang' },
    { src: 'assets/u-konflik-palsu.jpg', cap: 'Gejala: notifikasi konflik palsu' },
    { src: 'assets/u-peringatan-rls.jpg', cap: 'Peringatan RLS di SQL Editor' },
    { src: 'assets/u-sql-berhasil.jpg', cap: 'Transaksi berhasil' },
    { src: 'assets/a-member.png', cap: 'Menu Member' },
    { src: 'assets/a-dashboard-terlambat.png', cap: 'Bahan presentasi: simulasi terlambat' },
    { src: null, cap: 'Logs → Auth (belum tersedia)' }
  ],
  flash: [
    ['Empat langkah debugging?', 'Amati, duga, uji, perbaiki dan uji ulang.'],
    ['Penyebab konflik palsu?', 'Tautan masuk dibuka dua kali sehingga sesi hilang.'],
    ['Fungsi ensureSession()?', 'Menolak penulisan bila tidak ada sesi.'],
    ['Tiga keadaan saat 0 baris berubah?', 'Sesi habis, konflik sungguhan, tidak berizin.'],
    ['Untuk apa tabel peta?', 'Memetakan member lama ke baru saat pemindahan.'],
    ['Pemeriksaan setelah pemindahan?', '0 profil contoh, 0 kegiatan tanpa PIC.'],
    ['Apa yang ditunjukkan Logs → Auth?', 'Email terkirim dan tautan yang diklik.'],
    ['Isi presentasi proyek akhir?', 'Dashboard, simulasi terlambat, laporan PIC, keputusan gate, satu error dan perbaikannya.']
  ],
  bs: [
    ['Konflik palsu disebabkan dua orang mengedit bersamaan.', false, 'Sesi hilang.'],
    ['uji-sesi.mjs memerlukan koneksi ke Supabase.', false, 'Klien palsu.'],
    ['Transaksi mencegah perubahan setengah jalan.', true, 'Semua atau tidak sama sekali.'],
    ['Tabel temporary tetap ada setelah commit.', false, 'on commit drop.'],
    ['Status 200 di log berarti email terkirim.', true, 'Tetapi belum tentu dibuka.'],
    ['Run without RLS boleh dipilih tanpa membaca SQL.', false, 'Baca dulu.'],
    ['Pesan otp_expired kini ditampilkan di halaman Masuk.', true, 'readAuthErrorFromUrl.'],
    ['Debugging dimulai dengan mengubah kode secepatnya.', false, 'Amati gejala dulu.'],
    ['Member contoh dihapus sebelum tugasnya dipindahkan.', false, 'Pindahkan dulu.'],
    ['Laporan debugging berformat gejala, dugaan, uji, penyebab, perbaikan.', true, 'Tugas modul.']
  ],
  pg: [
    ['Langkah pertama debugging?', ['Tulis ulang kode', 'Amati gejala', 'Hapus data', 'Deploy'], 1, 'Amati.'],
    ['Pesan konflik palsu berbunyi…', ['Sesi berakhir', 'Data ini baru saja diubah orang lain', 'Tidak berizin', 'Server mati'], 1, 'Pesan konflik.'],
    ['Perbaikan konflik palsu ada di berkas…', ['tasks.js', 'supabase.js', 'style.css', 'schema.sql'], 1, 'supabase.js.'],
    ['Klausa SQL agar semua perubahan dibatalkan bila gagal?', ['select', 'begin … commit (transaksi)', 'grant', 'index'], 1, 'Transaksi.'],
    ['Hasil uji-sesi untuk peran tanpa izin?', ['tersimpan', '[konflik]', '[ditolak]', '[sesi habis]'], 2, '[ditolak].'],
    ['Kolom pemilik di tabel risks?', ['pic_id', 'pemilik_id', 'author_id', 'user_id'], 1, 'pemilik_id.'],
    ['Undangan terkirim tapi tidak dibuka; langkah yang tepat?', ['Ubah kode', 'Cek Spam atau minta member masuk sendiri', 'Hapus proyek', 'Ganti RLS'], 1, 'Masalah di penerima.'],
    ['Bobot proyek akhir dalam penilaian?', ['20%', '40%', '60%', '10%'], 1, '40%.'],
    ['Dengan apa updated_at dibandingkan?', ['Nilai yang dibaca sebelum mengedit', 'Jam server', 'Tanggal acuan', 'Deadline'], 0, 'Optimistic concurrency.'],
    ['Durasi presentasi proyek akhir?', ['5 menit', '10 menit', '30 menit', '60 menit'], 1, '10 menit.']
  ]
}
);

window.LMS.kasus = [
  ['3', 'Analisis dampak tidak menunjukkan geser', 'Bandingkan turunan dengan baseline sendiri'],
  ['4', 'Header Gantt bertumpuk', 'Tinggi kepala 74 px dan strip penanda'],
  ['4', 'Ilustrasi menutupi judul', 'Perkecil adegan, tambah veil'],
  ['4', 'Atribut hidden tidak bekerja', '[hidden]{display:none!important}'],
  ['4', 'Formulir laporan memilih kegiatan salah', 'Urutkan berjalan + deadline terdekat'],
  ['5', 'Direktur bisa ubah kegiatan bidang lain', 'Perketat trigger guard_task_update'],
  ['6', 'Proyek Supabase baru berbayar', 'Pakai ulang proyek kosong'],
  ['6', 'Peringatan Security Advisor', 'revoke execute, set search_path'],
  ['6', 'Peran uji sudah ada', 'Skrip yang aman diulang'],
  ['7', 'Username SMTP berisi nama', 'Isi alamat Gmail lengkap'],
  ['7', 'Sandi aplikasi berspasi', 'Tulis 16 huruf tanpa spasi'],
  ['7', 'Sandi terlihat di tangkapan layar', 'Cabut dan buat ulang'],
  ['7', 'Undangan ke alamat .example', 'Pakai email asli'],
  ['7', 'Redirect tanpa /**', 'Tambahkan /**'],
  ['7', 'Undangan tidak terbaca', 'Cek Spam, masuk mandiri'],
  ['8', 'Daring tetapi Mode Demo', 'GitHub + Vercel + commit'],
  ['8', 'URL per-deploy minta login', 'Bagikan domain produksi'],
  ['9', 'Konflik palsu', 'ensureSession dan baca ulang updated_at'],
  ['9', 'Tautan dibuka dua kali', 'Pesan otp_expired di halaman Masuk'],
  ['9', 'Hapus lewat API timeout', 'Jalankan di SQL Editor'],
  ['9', 'Orkestrator tidak bisa jadi PIC lintas bidang', 'Pengecualian okDir'],
  ['9', 'Member contoh masih memegang tugas', 'Transaksi dengan tabel peta']
];

window.LMS.glosarium = [
  ['Adapter', 'Lapisan yang menerjemahkan perintah store ke penyimpanan tertentu (browser atau Supabase).'],
  ['anon key', 'Kunci publik Supabase; aman di browser karena RLS.'],
  ['Baseline', 'Jadwal rencana yang disetujui Direktur, pembanding prakiraan.'],
  ['Commit', 'Foto versi folder di Git, dengan pesan.'],
  ['CPM', 'Critical Path Method: cara menghitung jalur kritis.'],
  ['Deploy', 'Menerbitkan versi baru aplikasi ke internet.'],
  ['Edge Function', 'Program kecil yang berjalan di server Supabase.'],
  ['ES modules', 'Cara JavaScript memecah kode ke berkas dengan import/export.'],
  ['Gelombang', 'Kelompok kegiatan yang boleh berjalan paralel.'],
  ['Magic link', 'Tautan masuk sekali pakai lewat email, tanpa sandi.'],
  ['Mode Demo', 'Aplikasi berjalan dengan data di browser, tanpa server.'],
  ['PIC', 'Person in charge: penanggung jawab kegiatan di bidangnya.'],
  ['Realtime', 'Siaran perubahan data ke semua layar yang terbuka.'],
  ['RLS', 'Row Level Security: aturan akses per baris di database.'],
  ['service_role', 'Kunci rahasia Supabase dengan akses penuh; hanya di server.'],
  ['Slack', 'Hari cadangan sebelum memundurkan proyek.'],
  ['SMTP', 'Protokol pengiriman email; di sini lewat Gmail.'],
  ['Stage-gate', 'Titik keputusan bertahap G0–G5.'],
  ['Transaksi', 'Sekumpulan perintah SQL yang berhasil semua atau batal semua.'],
  ['Trigger', 'Aturan database yang berjalan otomatis saat data berubah.'],
  ['TUKS', 'Terminal Untuk Kepentingan Sendiri.']
];
