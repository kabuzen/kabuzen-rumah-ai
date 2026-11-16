/* ---------- Versi berlisensi: masuk, aktivasi, anggota, lisensi ---------- */
const WA_KABUZEN = "628118102019";
const appUrl = () => location.origin + location.pathname;
const rp = n => "Rp" + Number(n || 0).toLocaleString("id-ID");
const waNum = s => { let d = String(s || "").replace(/\D/g, ""); if (d.startsWith("0")) d = "62" + d.slice(1); return d; };
const lock = (b, txt) => { if (b) { b.disabled = true; b.dataset.txt = b.textContent; b.textContent = txt; } };
const unlock = b => { if (b && b.isConnected) { b.disabled = false; if (b.dataset.txt) b.textContent = b.dataset.txt; } };
function viewAuth(){
  const a = S.auth || (S.auth = {mode:"login", email:""});
  const wa = "https://wa.me/" + WA_KABUZEN + "?text=" + encodeURIComponent("Halo Kabuzen, saya ingin membeli lisensi SIGMA Tim Enam Tahap.");
  return `<section class="stack" style="max-width:480px;margin:24px auto">
    <div class="stagehead" style="--sc:var(--accent)"><span class="eyebrow">SIGMA · Self-Improved Group Mobile Activities</span>
      <h2>${a.mode === "login" ? "Masuk ke tim Anda" : "Aktivasi akun atau ganti password"}</h2>
      <p class="muted">${a.mode === "login" ? "Belajar Bahasa Inggris berkelompok selama 180 hari kerja dalam enam tahap." : "Isi email yang didaftarkan dan kode Anda, lalu buat password sendiri."}</p></div>
    <div class="card stack">
      <label class="f">Email<input type="email" id="au-email" autocomplete="username" placeholder="nama@email.com" value="${esc(a.email || "")}"></label>
      ${a.mode === "login" ? `
      <label class="f">Password<input type="password" id="au-pass" autocomplete="current-password"></label>
      <div class="row"><button class="btn pri" data-act="auth-login">Masuk</button></div>
      <div class="row"><button class="link small" data-act="auth-mode" data-m="activate">Pengguna baru? Aktivasi akun</button><button class="link small" data-act="auth-mode" data-m="activate">Lupa password</button></div>` : `
      <label class="f">Kode lisensi atau kode aktivasi<input type="text" id="au-code" autocomplete="off" placeholder="SIGMA-XXXX-XXXX-XXXX atau XXXX-XXXX" value="${esc(S.drafts["au-code"] || "")}"></label>
      <p class="small muted">Koordinator memakai kode lisensi dari Kabuzen. Anggota memakai kode aktivasi dari koordinatornya.</p>
      <label class="f">Password baru (minimal 8 karakter)<input type="password" id="au-pass" autocomplete="new-password"></label>
      <label class="f">Ulangi password<input type="password" id="au-pass2" autocomplete="new-password"></label>
      <div class="row"><button class="btn pri" data-act="auth-activate">Simpan dan masuk</button><button class="link small" data-act="auth-mode" data-m="login">Kembali ke halaman masuk</button></div>`}
    </div>
    <p class="small muted">Belum punya lisensi? Satu lisensi Rp1.000.000 untuk satu tim (1 koordinator dan 5 anggota), sekali beli berlaku selamanya. <a href="${wa}" target="_blank" rel="noopener">Beli lewat WhatsApp</a></p>
  </section>`;
}
async function authLogin(btn){
  const email = lower($("#au-email").value), pass = $("#au-pass").value;
  if (!email || !pass) { toast("Isi email dan password."); return; }
  lock(btn, "Memproses…");
  let res; try { res = await sb.auth.signInWithPassword({email, password:pass}); } catch (e) { res = {error:e}; }
  if (res.error) { unlock(btn); toast(/invalid login/i.test(res.error.message || "") ? "Email atau password salah. Pengguna baru: pilih Aktivasi akun." : sbErr(res.error)); return; }
  await setSession(res.data.session);
}
async function authActivate(btn){
  const email = lower($("#au-email").value), kode = $("#au-code").value.trim(), p1 = $("#au-pass").value, p2 = $("#au-pass2").value;
  if (!email || !kode) { toast("Isi email dan kode Anda."); return; }
  if (p1.length < 8) { toast("Password minimal 8 karakter."); return; }
  if (p1 !== p2) { toast("Kedua password belum sama."); return; }
  lock(btn, "Memproses…");
  let res, body = {};
  try {
    res = await fetch(CFG.url + "/functions/v1/aktivasi", { method:"POST",
      headers:{"Content-Type":"application/json", apikey:CFG.key}, body:JSON.stringify({email, kode, password:p1}) });
    body = await res.json().catch(() => ({}));
  } catch (e) { unlock(btn); toast("Koneksi terputus. Periksa internet lalu coba lagi."); return; }
  if (!res.ok) { unlock(btn); toast(body.error || "Aktivasi gagal. Coba lagi."); return; }
  let s; try { s = await sb.auth.signInWithPassword({email, password:p1}); } catch (e) { s = {error:e}; }
  if (s.error) { unlock(btn); S.auth = {mode:"login", email}; render(); toast("Password tersimpan. Silakan masuk."); return; }
  delete S.drafts["au-code"];
  toast(body.status === "akun_dibuat" ? "Akun aktif. Selamat datang!" : "Password diganti.");
  await setSession(s.data.session);
}
async function setSession(sess){
  S.session = sess || null; unsubs.forEach(f => f()); unsubs = []; clearInterval(pollT);
  Object.assign(S, {teams:{}, tid:null, logs:{}, debates:{}, teamsLoaded:false, owner:false, lics:[], codes:{}, invites:[], copyText:null, guest:false, confirm:null, rev:null});
  store = supaStore();
  if (!sess) { S.uid = null; S.email = ""; S.auth = {mode:"login", email:""}; render(); return; }
  S.uid = sess.user.id; S.email = lower(sess.user.email); render();
  try { const r = await sb.rpc("is_admin"); S.owner = !!r.data; } catch (e) {}
  sb.rpc("catat_aktif").then(() => {}, () => {});
  store.onTeams(o => {
    S.teams = o; S.teamsLoaded = true;
    if (S.tid && !o[S.tid]) { S.tid = null; unsubs.forEach(f => f()); unsubs = []; }
    if (!S.tid) {
      const ids = Object.keys(o), saved = LS.get("et_tim_tid");
      const pick = S.owner ? null : (saved && o[saved] ? saved : (ids[0] || null));
      if (pick) { S.tid = pick; subscribeTeam(); }
    }
    render();
  });
  pollT = setInterval(() => { if (document.visibilityState === "visible" && S.session) store.poll(S.tid); }, 20000);
}
function licNotice(){
  if (!team()) return "";
  const l = (S.lics || []).find(l => l.team_id === S.tid);
  return l && !l.revoked_at ? "" : `<div class="notice" style="border-left-color:var(--bad);margin-bottom:12px">Lisensi tim ini tidak berlaku. Data masih bisa dibaca, tetapi tidak bisa diisi. Hubungi Kabuzen Rumah AI.</div>`;
}
function copyBox(){
  const c = S.copyText;
  return `<div class="notice stack"><b>${esc(c.title)}</b>
    <textarea id="cp-text" readonly rows="10" style="width:100%;font:inherit">${esc(c.text)}</textarea>
    <div class="row"><button class="btn sm" data-act="cp-copy">Salin teks</button><a class="btn sm" target="_blank" rel="noopener" href="https://wa.me/${esc(waNum(c.wa))}?text=${encodeURIComponent(c.text)}">Kirim lewat WhatsApp</a><button class="link small" data-act="cp-close">Tutup</button></div></div>`;
}
const buyerMsg = l => `Terima kasih telah membeli SIGMA Tim Enam Tahap.\n\nCara mulai:\n1. Buka ${appUrl()}\n2. Pilih "Pengguna baru? Aktivasi akun"\n3. Email: ${l.buyer_email}\n4. Kode lisensi: ${l.code}\n5. Buat password Anda, lalu buat tim dan tambahkan 5 anggota.\n\nLisensi berlaku selamanya untuk 1 tim (1 koordinator dan 5 anggota). Simpan kode lisensi ini; kode yang sama dipakai bila Anda lupa password.`;
const memberMsg = (m, t) => `Halo ${m.name}, Anda diundang ke tim "${t.name}" di SIGMA Tim Enam Tahap.\n\nCara masuk:\n1. Buka ${appUrl()}\n2. Pilih "Pengguna baru? Aktivasi akun"\n3. Email: ${m.email}\n4. Kode aktivasi: ${(S.codes || {})[m.email] || ""}\n5. Buat password Anda sendiri.\n\nSimpan kode aktivasi ini; kode yang sama dipakai bila Anda lupa password.`;
function viewTeamsPro(){
  const list = Object.entries(S.teams).sort((a,b) => (a[1].created || 0) - (b[1].created || 0));
  const myLic = (S.lics || []).find(l => l.buyer_email === S.email && !l.revoked_at);
  const free = myLic && !myLic.team_id;
  const me = (S.invites || []).find(i => i.email === S.email);
  return `${S.owner ? adminPanel() : ""}
  <section class="stack">
    ${list.length ? `<div class="stagehead" style="--sc:var(--accent)"><span class="eyebrow">${S.owner ? "Semua tim" : "Tim Anda"}</span><h2>Pilih tim</h2></div>
    <div class="grid2">${list.map(([id,t]) => { const p = E.position(t.start, t.holidays || {}); return `
      <button class="card teamcard" data-act="pick-team" data-id="${id}">
        <span class="eyebrow">${p.before ? "Mulai " + E.fmt(t.start) : p.done ? "Selesai" : "Tahap " + p.stage + " · " + E.STAGES[p.stage-1].k + " · Hari " + p.day}</span>
        <h3>${esc(t.name)}</h3>
        <span class="small muted">Koordinator: ${esc(t.coord.name)} · Anggota: ${t.members.filter(m => m.email).map(m => esc(m.name)).join(", ") || "belum ada"}</span>
      </button>`; }).join("")}</div>` : ""}
    ${!list.length && !free && !S.owner ? `<div class="notice">Akun ${esc(S.email)} belum terhubung ke tim mana pun${myLic ? "" : ", dan belum ada lisensi yang berlaku untuk email ini"}. Hubungi koordinator Anda, atau Kabuzen Rumah AI lewat <a href="https://wa.me/${WA_KABUZEN}" target="_blank" rel="noopener">WhatsApp</a>.</div>` : ""}
    ${!list.length && S.owner ? `<div class="card empty">Belum ada tim. Tim muncul di sini setelah pembeli membuatnya.</div>` : ""}
  </section>
  ${free ? `<section class="card stack">
    <h3>Buat tim Anda</h3>
    <p class="small muted">Lisensi <span class="mono">${esc(myLic.code)}</span> berlaku untuk satu tim. Anda menjadi koordinatornya; lima anggota ditambahkan setelah tim dibuat.</p>
    <div class="grid2">
      <label class="f">Nama tim<input type="text" id="nt-name" placeholder="mis. Tim Melati" value="${esc(S.drafts["nt-name"] || "")}"></label>
      <label class="f">Nama koordinator (Anda)<input type="text" id="nt-coord" value="${esc(S.drafts["nt-coord"] ?? ((me && me.name) || ""))}"></label>
      <label class="f">Tanggal mulai (hari kerja)<input type="date" id="nt-start" value="${esc(S.drafts["nt-start"] || nextMonday())}"></label>
    </div>
    <div class="row"><button class="btn pri" data-act="create-team">Buat tim</button></div>
  </section>` : ""}`;
}
async function createTeamPro(btn){
  const v = id => (document.getElementById(id).value || "").trim();
  const name = v("nt-name"), coord = v("nt-coord"), start = v("nt-start");
  if (!name || !coord || !start) { toast("Lengkapi nama tim, nama koordinator, dan tanggal mulai."); return; }
  const tid = crypto.randomUUID();
  lock(btn, "Membuat tim…");
  try { await store.setTeam(tid, {name, start, coord:{name:coord}, holidays:clone(E.HOLIDAYS), members:[]}); }
  catch (e) { unlock(btn); toast(sbErr(e)); return; }
  S.drafts = {}; S.tid = tid; LS.set("et_tim_tid", tid); S.openSet = true; subscribeTeam();
  S.view = "tim"; location.hash = "#tim"; render();
  toast("Tim dibuat. Sekarang tambahkan lima anggota di Pengaturan tim.");
}
function membersPro(t){
  return `<h4>Anggota tim</h4>
  <p class="small muted">Tambahkan anggota dengan emailnya. Setiap anggota mendapat kode aktivasi. Kirimkan undangannya, lalu anggota membuat password sendiri.</p>
  <div class="grid2">${t.members.map((m,i) => m.email ? `<div class="stack" style="gap:6px">
      <label class="f">Anggota ${i+1}<input type="text" id="ts-m${i}" value="${esc(S.drafts["ts-m"+i] ?? m.name)}"></label>
      <span class="small">${esc(m.email)} · ${m.uid ? "akun sudah aktif" : `belum aktivasi · kode <b class="mono">${esc((S.codes || {})[m.email] || "…")}</b>`}</span>
      <div class="row"><button class="link small" data-act="mem-copy" data-k="${m.k}">Tampilkan undangan</button>${S.confirm && S.confirm.type === "mem-del" && S.confirm.k === m.k
        ? `<span class="small">Hapus ${esc(m.name)}?</span><button class="link small" data-act="mem-del-yes">Ya, hapus</button><button class="link small" data-act="mem-del-no">Batal</button>`
        : `<button class="link small" data-act="mem-del" data-k="${m.k}">Hapus anggota</button>`}</div></div>`
    : `<div class="stack" style="gap:6px">
      <label class="f">Anggota ${i+1} · nama<input type="text" id="nm-name-${i}" value="${esc(S.drafts["nm-name-"+i] || "")}"></label>
      <label class="f">Email<input type="text" inputmode="email" autocapitalize="off" id="nm-email-${i}" placeholder="nama@email.com" value="${esc(S.drafts["nm-email-"+i] || "")}"></label>
      <div class="row"><button class="btn sm" data-act="mem-add" data-k="${m.k}" data-i="${i}">Tambah anggota</button></div></div>`).join("")}</div>
  ${S.copyText ? copyBox() : ""}`;
}
async function memAdd(btn){
  const i = btn.dataset.i, name = ($("#nm-name-" + i).value || "").trim(), email = lower($("#nm-email-" + i).value);
  if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { toast("Isi nama dan email anggota dengan benar."); return; }
  lock(btn, "Menyimpan…"); S.openSet = true;
  try { await store.addMember(S.tid, btn.dataset.k, name, email); }
  catch (e) { unlock(btn); toast(sbErr(e)); return; }
  delete S.drafts["nm-name-" + i]; delete S.drafts["nm-email-" + i];
  const t = team(), m = t.members.find(x => x.k === btn.dataset.k);
  if (m) S.copyText = {title:"Undangan untuk " + m.name, text:memberMsg(m, t), wa:""};
  render(); toast("Anggota ditambahkan. Kirimkan undangannya.");
}
async function memDel(){
  const t = team(), m = t.members.find(x => x.k === S.confirm.k); S.confirm = null; S.openSet = true;
  if (!m || !m.email) { render(); return; }
  try { await store.delMember(m.email); toast("Anggota dihapus."); } catch (e) { toast(sbErr(e)); }
  render();
}
function adminPanel(){
  const L = S.lics || [], act = L.filter(l => !l.revoked_at);
  const tname = l => (l.team_id && S.teams[l.team_id]) ? S.teams[l.team_id].name : "tim";
  return `<section class="card stack" style="margin-bottom:16px">
    <div class="stagehead" style="--sc:var(--accent)"><span class="eyebrow">Admin Kabuzen</span><h2>Lisensi</h2>
      <p class="muted small">${act.length} lisensi berlaku · ${act.filter(l => l.team_id).length} sudah dipakai · total ${rp(act.reduce((a,l) => a + (l.price_idr || 0), 0))}</p></div>
    <h3>Terbitkan lisensi baru</h3>
    <p class="small muted">Terbitkan setelah pembayaran diterima. Pembeli menjadi koordinator dan langsung bisa aktivasi akun.</p>
    <div class="grid2">
      <label class="f">Email pembeli<input type="text" inputmode="email" autocapitalize="off" id="lic-email" placeholder="nama@email.com" value="${esc(S.drafts["lic-email"] || "")}"></label>
      <label class="f">Nama pembeli<input type="text" id="lic-name" value="${esc(S.drafts["lic-name"] || "")}"></label>
      <label class="f">Nomor WhatsApp<input type="text" inputmode="tel" id="lic-wa" placeholder="08…" value="${esc(S.drafts["lic-wa"] || "")}"></label>
      <label class="f">Harga (Rp)<input type="text" inputmode="numeric" id="lic-price" value="${esc(S.drafts["lic-price"] ?? "1000000")}"></label>
    </div>
    <div class="row"><button class="btn pri" data-act="lic-issue">Terbitkan lisensi</button></div>
    ${S.copyText ? copyBox() : ""}
    <div class="scroll"><table class="t"><thead><tr><th align="left">Kode</th><th align="left">Pembeli</th><th align="left">Harga</th><th align="left">Status</th><th></th></tr></thead><tbody>
    ${L.map(l => `<tr><td class="mono small">${esc(l.code)}</td><td>${esc(l.buyer_name || "")}<br><span class="small muted">${esc(l.buyer_email)}</span></td><td class="tnum">${rp(l.price_idr)}</td>
      <td>${l.revoked_at ? "Dicabut" : l.team_id ? "Dipakai: " + esc(tname(l)) : "Belum dipakai"}</td>
      <td>${S.confirm && S.confirm.type === "lic-rev" && S.confirm.id === l.id
        ? `<span class="small">${l.revoked_at ? "Pulihkan" : "Cabut"} lisensi ini?</span> <button class="link small" data-act="lic-rev-yes">Ya</button> <button class="link small" data-act="lic-rev-no">Batal</button>`
        : `<button class="link small" data-act="lic-copy" data-id="${l.id}">Pesan pembeli</button> · <button class="link small" data-act="lic-rev" data-id="${l.id}">${l.revoked_at ? "Pulihkan" : "Cabut"}</button>`}</td></tr>`).join("") || `<tr><td colspan="5" class="muted">Belum ada lisensi.</td></tr>`}
    </tbody></table></div>
  </section>`;
}
async function licIssue(btn){
  const email = lower($("#lic-email").value), nama = ($("#lic-name").value || "").trim(), wa = ($("#lic-wa").value || "").trim();
  const harga = parseInt(String($("#lic-price").value).replace(/\D/g, ""), 10);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !nama) { toast("Isi email dan nama pembeli dengan benar."); return; }
  if (!(harga >= 0)) { toast("Isi harga dengan angka."); return; }
  lock(btn, "Menerbitkan…");
  let code; try { code = await store.issue(email, nama, wa, harga); } catch (e) { unlock(btn); toast(sbErr(e)); return; }
  ["lic-email","lic-name","lic-wa","lic-price"].forEach(k => delete S.drafts[k]);
  const l = (S.lics || []).find(x => x.code === code) || {code, buyer_email:email, buyer_wa:wa};
  S.copyText = {title:"Lisensi terbit: " + code, text:buyerMsg(l), wa:l.buyer_wa};
  render(); toast("Lisensi terbit. Kirim pesan aktivasi ke pembeli.");
}
async function licRevoke(){
  const l = (S.lics || []).find(x => x.id === S.confirm.id); S.confirm = null;
  if (!l) { render(); return; }
  try { await store.setRevoked(l.id, !l.revoked_at); toast(l.revoked_at ? "Lisensi dipulihkan." : "Lisensi dicabut."); } catch (e) { toast(sbErr(e)); }
  render();
}
function copyNow(){
  const el = $("#cp-text"); if (!el) return;
  const done = () => toast("Teks disalin.");
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(el.value).then(done, () => { el.select(); toast("Tekan lama lalu pilih Salin."); });
  else { el.select(); try { document.execCommand("copy"); done(); } catch (e) { toast("Tekan lama lalu pilih Salin."); } }
}
function proAct(a, b){
  switch (a) {
    case "logout": sb.auth.signOut().then(() => setSession(null), () => setSession(null)); return true;
    case "auth-mode": S.auth = {mode:b.dataset.m, email:lower(($("#au-email") || {}).value)}; render(); return true;
    case "auth-login": authLogin(b); return true;
    case "auth-activate": authActivate(b); return true;
    case "mem-add": memAdd(b); return true;
    case "mem-copy": { const t = team(), m = t.members.find(x => x.k === b.dataset.k); if (m) S.copyText = {title:"Undangan untuk " + m.name, text:memberMsg(m, t), wa:""}; S.openSet = true; render(); return true; }
    case "mem-del": S.confirm = {type:"mem-del", k:b.dataset.k}; S.openSet = true; render(); return true;
    case "mem-del-no": S.confirm = null; render(); return true;
    case "mem-del-yes": memDel(); return true;
    case "cp-copy": copyNow(); return true;
    case "cp-close": S.copyText = null; render(); return true;
    case "lic-issue": licIssue(b); return true;
    case "lic-copy": { const l = (S.lics || []).find(x => x.id === b.dataset.id); if (l) S.copyText = {title:"Pesan untuk " + (l.buyer_name || l.buyer_email), text:buyerMsg(l), wa:l.buyer_wa}; render(); return true; }
    case "lic-rev": S.confirm = {type:"lic-rev", id:b.dataset.id}; render(); return true;
    case "lic-rev-no": S.confirm = null; render(); return true;
    case "lic-rev-yes": licRevoke(); return true;
  }
  return false;
}
document.addEventListener("keydown", e => {
  if (e.key !== "Enter" || !e.target.id) return;
  if (e.target.id === "au-pass" && S.auth && S.auth.mode === "login") { e.preventDefault(); authLogin($('[data-act="auth-login"]')); }
  else if (e.target.id === "au-pass2") { e.preventDefault(); authActivate($('[data-act="auth-activate"]')); }
});
async function initSupa(){
  S.mode = "supa"; S.auth = {mode:"login", email:""}; S.sample = null; CFG = window.SIGMA_CFG;
  sb = window.supabase.createClient(CFG.url, CFG.key);
  let sess = null; try { sess = (await sb.auth.getSession()).data.session; } catch (e) {}
  await setSession(sess);
  sb.auth.onAuthStateChange(ev => { if (ev === "SIGNED_OUT" && S.session) setTimeout(() => setSession(null), 0); });
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && S.session) store.poll(S.tid); });
  document.addEventListener("toggle", e => { if (e.target && e.target.id === "set-det") S.openSet = e.target.open; }, true);
}

