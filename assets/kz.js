/* Kabuzen Rumah AI — log kunjungan anonim + asisten katalog.
   Dimuat oleh index.html, halaman produk (tools/build.py), dan appcentre.html.
   Tidak mencatat nama, email, alamat IP, atau teks yang diketik pengunjung. */
(function () {
  "use strict";
  if (window.__kz) return;
  var SB = "https://hluropjongrhtzcrnfsm.supabase.co";
  var KEY = "sb_publishable_v1RE604iohY92mZ5AjXJOQ_I78-hDIi";
  var WA = "628118102019";
  var HEAD = { apikey: KEY, "Content-Type": "application/json" };
  var ls = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };

  /* ---------- log kunjungan ---------- */
  var silent = /bot|crawl|spider|slurp|headless|lighthouse|preview/i.test(navigator.userAgent) || navigator.doNotTrack === "1" || ls.get("kz-nolog") === "1" || !/^https?:$/.test(location.protocol);
  function visitor() {
    var day = new Date().toISOString().slice(0, 10), raw = ls.get("kz-v"), v = null;
    try { v = JSON.parse(raw); } catch (e) {}
    if (!v || v.d !== day) {
      var a = new Uint8Array(9); (window.crypto || {}).getRandomValues ? crypto.getRandomValues(a) : a.forEach(function (_, i) { a[i] = Math.random() * 256; });
      v = { d: day, id: Array.prototype.map.call(a, function (b) { return ("0" + b.toString(16)).slice(-2); }).join("") };
      ls.set("kz-v", JSON.stringify(v));
    }
    return v.id;
  }
  function device() { var w = Math.min(window.innerWidth || 9999, screen.width || 9999); return w < 700 ? "mobile" : w < 1100 ? "tablet" : "desktop"; }
  function refHost() { try { var h = new URL(document.referrer).hostname; return h && h !== location.hostname ? h.slice(0, 120) : null; } catch (e) { return null; } }
  function log(kind, target, label) {
    if (silent) return;
    var row = { kind: kind, path: (location.pathname + (kind === "view" ? location.hash : "")).slice(0, 200), target: target ? String(target).slice(0, 200) : null,
      label: label ? String(label).slice(0, 120) : null, referrer: refHost(), device: device(), visitor: visitor() };
    try { fetch(SB + "/rest/v1/site_visits", { method: "POST", headers: Object.assign({ Prefer: "return=minimal" }, HEAD), body: JSON.stringify(row), keepalive: true }).catch(function () {}); } catch (e) {}
  }
  function classify(a) {
    var aff = a.getAttribute("data-kz-aff"); if (aff) return ["aff:" + aff, a.getAttribute("data-kz-name")];
    var href = a.getAttribute("href") || ""; if (!href || href.charAt(0) === "#") { var m = href.match(/^#artikel-(.+)/); return m ? ["artikel:" + m[1]] : null; }
    var u; try { u = new URL(href, location.href); } catch (e) { return null; }
    var txt = (a.textContent || "").replace(/\s+/g, " ").trim().slice(0, 60);
    if (u.hostname === "wa.me" || /whatsapp\.com$/.test(u.hostname)) return ["whatsapp", txt];
    if (u.hostname !== location.hostname) return ["luar:" + u.hostname, txt];
    var p = u.pathname, m2;
    if ((m2 = p.match(/^\/aplikasi\/([^/]+)/))) return ["app:" + m2[1], txt];
    if ((m2 = p.match(/^\/apps\/([^/.]+)/))) return ["demo:" + m2[1], txt];
    if ((m2 = p.match(/^\/buku\/contoh\/([^/]+)\.pdf/))) return ["contoh:" + m2[1], txt];
    if ((m2 = p.match(/^\/buku\/([^/.]+)/))) return ["buku:" + m2[1], txt];
    if ((m2 = p.match(/^\/video\/([^/.]+)/))) return ["video:" + m2[1], txt];
    if (/^\/majalah/.test(p)) return ["majalah", txt];
    if (/^\/appcentre/.test(p)) return ["appcentre", txt];
    if (/\.pdf$/i.test(p)) return ["pdf:" + p.split("/").pop(), txt];
    return null;
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]"); if (!a) return;
    var c = classify(a); if (!c) return;
    log("click", c[0], a.closest(".kzc") ? "chatbot" : c[1]);
    if (c[0].indexOf("aff:") === 0) { try { fetch(SB + "/rest/v1/rpc/record_affiliate_click", { method: "POST", headers: HEAD, body: JSON.stringify({ p_app_id: c[0].slice(4) }), keepalive: true }).catch(function () {}); } catch (e2) {} }
  }, true);
  log("view");

  /* ---------- data katalog ---------- */
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var okUrl = function (u) { return /^https?:\/\//i.test(u || "") ? u : ""; };
  var CAT = null, AFF = null;
  function loadAff() {
    if (AFF) return AFF;
    AFF = fetch(SB + "/rest/v1/apps?select=id,name,category,destination_url,image_url,summary,features&is_active=eq.true&order=sort_order.asc,name.asc", { headers: { apikey: KEY } })
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (rows) { return (rows || []).filter(function (x) { return okUrl(x.destination_url); }); })
      .catch(function () { return []; });
    return AFF;
  }
  function loadCat() {
    if (CAT) return CAT;
    CAT = Promise.all([fetch("/data/katalog.json").then(function (r) { return r.json(); }).catch(function () { return []; }), loadAff()]).then(function (res) {
      var items = res[0].slice();
      res[1].forEach(function (x) { items.push({ t: "aff", id: x.id, n: x.name, c: x.category, d: x.summary || "", k: (x.features || []).join(" "), u: x.destination_url, i: okUrl(x.image_url), p: "Tools rekomendasi" }); });
      items.forEach(function (x) { x._n = norm(x.n); x._c = norm(x.c); x._k = norm(x.k); x._d = norm(x.d); });
      return items;
    });
    return CAT;
  }

  /* tautan AppCentre di menu hanya muncul bila sudah ada isinya */
  loadAff().then(function (rows) {
    if (!rows.length || /^\/appcentre/.test(location.pathname)) return;
    var nav = document.querySelector("#nav") || document.querySelector(".bar nav"); if (!nav || nav.querySelector("[data-kz-nav]")) return;
    var a = document.createElement("a"); a.href = "/appcentre"; a.textContent = "AppCentre"; a.setAttribute("data-kz-nav", "");
    var before = nav.querySelector('a[href$="#kontak"]'); nav.insertBefore(a, before || null);
  });

  /* ---------- pencocokan ---------- */
  var STOP = "yang dan di ke dari untuk dengan atau itu ini saya aku kami kita anda kamu ada apa apakah adakah bagaimana gimana bisa dapat mau ingin butuh perlu cari mencari carikan tolong mohon dong ya sih nih deh yg utk dgn tentang soal seputar buat bikin punya tidak nggak gak sebuah suatu para lagi juga saja aja lebih paling sangat banyak semua seperti agar supaya jadi adalah ialah pada oleh the a an of for to is in on and i me my".split(" ");
  var SYN = {
    usaha: "bisnis umkm kasir", bisnis: "umkm kasir usaha", umkm: "bisnis kasir usaha", toko: "kasir bisnis umkm", warung: "kasir warteg umkm", jualan: "kasir bisnis umkm", dagang: "kasir bisnis umkm", penjualan: "kasir bisnis", keuangan: "kasir bisnis saham",
    belajar: "pendidikan lms kursus", kursus: "lms pendidikan", pelatihan: "lms pendidikan", sekolah: "pendidikan lms gais", guru: "pendidikan lms sekolah", siswa: "pendidikan lms", mahasiswa: "pendidikan lms", kuliah: "pendidikan lms", dosen: "pendidikan lms",
    inggris: "english sigma", english: "inggris sigma", kapal: "maritim pelayaran ship", laut: "maritim sar", pelayaran: "maritim kapal", pelabuhan: "maritim ksop", sar: "maritim", navigasi: "maritim ship",
    makan: "menu makanan gizi dapur", masak: "menu dapur resep", resep: "menu dapur", diet: "menu gizi", menu: "makanan gizi dapur", rumah: "tangga", ibadah: "tilawah quran", quran: "tilawah ibadah", ngaji: "tilawah ibadah",
    golf: "olahraga skor", olahraga: "golf", catatan: "jurnal produktivitas", jurnal: "produktivitas", rapat: "meeting notulen", notulen: "meeting rapat", suara: "audio sinkron", prompt: "ai produktivitas",
    saham: "investasi", investasi: "saham", tutorial: "panduan klik tutor", panduan: "tutorial", kesehatan: "vitalitas", sehat: "kesehatan vitalitas", anak: "animasi pendidikan", kartun: "animasi", film: "animasi video",
    tools: "rekomendasi", tool: "rekomendasi tools", alat: "tools rekomendasi", software: "aplikasi tools"
  };
  function norm(s) { return " " + String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim() + " "; }
  function words(q) { return norm(q).trim().split(" ").filter(function (w) { return w && STOP.indexOf(w) < 0; }); }
  function hit(hay, w) { if (hay.indexOf(" " + w + " ") >= 0) return 1; if (w.length >= 4 && hay.indexOf(" " + w) >= 0) return 0.7; return 0; }
  function scoreItem(x, ws) {
    var s = 0;
    ws.forEach(function (w) {
      var one = 6 * hit(x._n, w) + 4 * hit(x._c, w) + 3 * hit(x._k, w) + 1 * hit(x._d, w);
      if (!one && SYN[w]) one = 0.6 * Math.max.apply(null, SYN[w].split(" ").map(function (v) { return 6 * hit(x._n, v) + 4 * hit(x._c, v) + 3 * hit(x._k, v) + hit(x._d, v); }));
      s += one;
    });
    if (ws.length > 1 && (ws.every(function (w) { return hit(x._n, w) === 1; }) || x._n.replace(/ /g, "").indexOf(ws.join("")) >= 0)) s += 10;
    if (x.t === "video") s *= 0.55; else if (x.t === "artikel") s *= 0.9;
    return s;
  }
  var TYPE = { app: "Aplikasi", buku: "Buku", video: "Video", artikel: "Artikel", aff: "Tools rekomendasi" };
  function answer(q, items) {
    var n = norm(q), ws = words(q), wa = "https://wa.me/" + WA + "?text=" + encodeURIComponent("Halo Kabuzen, saya ingin bertanya tentang produk di Kabuzen Rumah AI.");
    if (/ (halo|hai|hi|hello|assalamualaikum|assalamu|pagi|siang|sore|malam|permisi|tes|test) /.test(n) && ws.length <= 2)
      return { text: "Halo! Sebutkan kebutuhan Anda, misalnya “kasir untuk warung”, “belajar bahasa Inggris”, atau “buku maritim”. Saya carikan produknya di katalog.", chips: true, tag: "sapaan" };
    if (/ (terima kasih|makasih|thanks|thank you|trims) /.test(n)) return { text: "Sama-sama. Bila ada lagi yang ingin dicari, ketik saja kebutuhannya.", tag: "terima-kasih" };
    if (/ (kontak|hubungi|whatsapp|wa|telepon|telp|email|alamat|admin|cs|manusia|orang) /.test(n) && ws.length <= 3)
      return { text: "Anda bisa menghubungi Kabuzen langsung lewat WhatsApp.", links: [["Chat WhatsApp", wa]], tag: "kontak" };
    if (/ (jasa|custom|kustom|pesan aplikasi|buatkan|dibuatkan|bikin aplikasi|buat aplikasi|pembuatan) /.test(n))
      return { text: "Kabuzen menerima jasa pembuatan aplikasi sesuai kebutuhan. Paket dan harganya ada di bagian Layanan, atau konsultasikan langsung lewat WhatsApp.", links: [["Lihat Layanan", "/#layanan"], ["Konsultasi WhatsApp", wa]], tag: "layanan" };
    var type = / (buku|ebook|bacaan|naskah|modul) /.test(n) ? "buku" : / (video|tonton|promo) /.test(n) ? "video" : / (artikel|tulisan|blog) /.test(n) ? "artikel" : / (tools|tool|rekomendasi|afiliasi|affiliate|appcentre) /.test(n) ? "aff" : / (aplikasi|app|apps|lms|software) /.test(n) ? "app" : "";
    var free = / (gratis|free|cuma cuma) /.test(n);
    var generic = "buku ebook bacaan naskah modul video tonton promo artikel tulisan blog tools tool rekomendasi afiliasi affiliate appcentre aplikasi app apps software gratis free harga berapa biaya beli membeli pesan bayar produk katalog daftar lihat tampilkan".split(" ");
    var core = ws.filter(function (w) { return generic.indexOf(w) < 0; });
    var pool = items.filter(function (x) { return (!type || x.t === type) && (!free || /gratis/i.test(x.p || "")); });
    var ranked;
    if (core.length) ranked = pool.map(function (x) { return [scoreItem(x, core), x]; }).filter(function (r) { return r[0] >= 2.5; }).sort(function (a, b) { return b[0] - a[0]; }).map(function (r) { return r[1]; });
    else if (type || free) ranked = pool;
    else ranked = [];
    if (!ranked.length && core.length && type) ranked = items.map(function (x) { return [scoreItem(x, core), x]; }).filter(function (r) { return r[0] >= 2.5; }).sort(function (a, b) { return b[0] - a[0]; }).map(function (r) { return r[1]; });
    var price = / (harga|berapa|biaya|beli|membeli|bayar) /.test(n);
    if (!ranked.length) {
      if (price) return { text: "Harga tertera di halaman tiap produk. Produk tanpa harga tertulis bisa ditanyakan lewat WhatsApp. Sebutkan nama atau jenis produknya, saya carikan halamannya.", links: [["Tanya harga via WhatsApp", wa]], chips: true, tag: "harga" };
      return { text: "Saya belum menemukan produk yang cocok di katalog. Coba kata lain atau pilih salah satu kategori di bawah. Untuk kebutuhan khusus, Kabuzen juga bisa membuatkan aplikasinya.", links: [["Tanya via WhatsApp", wa]], chips: true, tag: "tanpa-hasil", miss: true };
    }
    var lead = ranked.length === 1 ? "Ini yang paling cocok:" : "Saya menemukan " + ranked.length + " produk yang cocok" + (ranked.length > 3 ? ". Ini tiga teratas:" : ":");
    if (price) lead += " Harga dan cara membeli ada di halaman tiap produk.";
    return { text: lead, cards: ranked.slice(0, 3), more: ranked.slice(3, 9), tag: ranked[0].t + ":" + ranked[0].id };
  }

  /* ---------- tampilan asisten ---------- */
  var CSS = ".kzc,.kzc *{box-sizing:border-box}.kzc [hidden]{display:none!important}.kzc{--kb:#FFD233;--kn:#130C3E;--ki:#0A0624;--kt:#EEEFFF;--km:#A7A3D4;--kl:rgba(150,140,255,.22);--kc:#55EEFF;font:15px/1.5 'Plus Jakarta Sans',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:var(--kt)}" +
    ".kzc-btn{position:fixed;left:calc(18px + env(safe-area-inset-left,0px));bottom:calc(18px + env(safe-area-inset-bottom,0px));z-index:68;display:flex;align-items:center;gap:9px;background:var(--kn);color:var(--kt);border:1.5px solid var(--kb);border-radius:999px;padding:11px 17px 11px 13px;font:700 14.5px/1 inherit;font-family:inherit;cursor:pointer;box-shadow:0 10px 30px rgba(0,0,0,.45)}.kzc-btn:hover{background:#1B1257}.kzc-btn svg{color:var(--kb);flex:none}.kzc-btn:focus-visible,.kzc button:focus-visible,.kzc a:focus-visible,.kzc input:focus-visible{outline:2px solid var(--kc);outline-offset:2px}" +
    ".kzc-tip{position:fixed;left:calc(18px + env(safe-area-inset-left,0px));bottom:calc(72px + env(safe-area-inset-bottom,0px));z-index:68;max-width:250px;background:var(--kb);color:#1A1040;font-weight:600;font-size:14px;padding:10px 34px 10px 14px;border-radius:14px 14px 14px 4px;box-shadow:0 10px 30px rgba(0,0,0,.4);cursor:pointer}.kzc-tip button{position:absolute;top:4px;right:4px;width:26px;height:26px;border:0;background:none;color:#1A1040;font-size:17px;cursor:pointer;border-radius:50%}" +
    ".kzc-pan{position:fixed;left:calc(18px + env(safe-area-inset-left,0px));bottom:calc(18px + env(safe-area-inset-bottom,0px));z-index:80;width:min(380px,calc(100vw - 36px));height:min(600px,calc(100vh - 36px));height:min(600px,calc(100dvh - 36px));display:flex;flex-direction:column;background:var(--ki);border:1px solid var(--kl);border-radius:20px;overflow:hidden;box-shadow:0 30px 90px rgba(0,0,0,.6)}" +
    ".kzc-hd{display:flex;align-items:center;gap:11px;padding:13px 12px 13px 16px;background:var(--kn);border-bottom:1px solid var(--kl)}.kzc-hd b{display:block;font-size:15px;line-height:1.2}.kzc-hd small{display:block;color:var(--km);font-size:12px;margin-top:2px}.kzc-hd .x{margin-left:auto;width:36px;height:36px;border:0;border-radius:50%;background:transparent;color:var(--kt);font-size:22px;line-height:1;cursor:pointer}.kzc-hd .x:hover{background:rgba(255,255,255,.1)}.kzc-dot{width:34px;height:34px;border-radius:50%;background:var(--kb);color:#1A1040;display:grid;place-items:center;flex:none}" +
    ".kzc-log{flex:1;overflow-y:auto;padding:14px 14px 6px;display:flex;flex-direction:column;gap:10px;overscroll-behavior:contain}.kzc-m{max-width:88%;padding:9px 13px;border-radius:16px;white-space:pre-wrap;overflow-wrap:anywhere}.kzc-m.b{background:var(--kn);border:1px solid var(--kl);border-bottom-left-radius:5px;align-self:flex-start}.kzc-m.u{background:var(--kb);color:#1A1040;font-weight:600;border-bottom-right-radius:5px;align-self:flex-end}" +
    ".kzc-cards{display:flex;flex-direction:column;gap:8px;align-self:stretch}.kzc-card{display:flex;gap:11px;align-items:center;text-decoration:none;color:var(--kt);background:var(--kn);border:1px solid var(--kl);border-radius:14px;padding:9px 11px 9px 9px}.kzc-card:hover{border-color:var(--kc)}.kzc-card img,.kzc-card .ph{width:58px;height:58px;border-radius:9px;object-fit:cover;flex:none;background:#1B1257}.kzc-card .ph{display:grid;place-items:center;color:var(--kb);font-weight:800;font-size:20px}.kzc-card span{min-width:0;flex:1}.kzc-card em{display:block;font-style:normal;color:var(--kb);font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase}.kzc-card b{display:block;font-size:14.5px;line-height:1.25;margin:1px 0 2px}.kzc-card i{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-style:normal;color:var(--km);font-size:12.5px;line-height:1.35}.kzc-card u{text-decoration:none;color:var(--kc);font-size:18px;flex:none}" +
    ".kzc-chips{display:flex;flex-wrap:wrap;gap:7px;align-self:stretch}.kzc-chips button,.kzc-chips a{font:600 13px/1 inherit;font-family:inherit;color:var(--kt);background:transparent;border:1px solid var(--kl);border-radius:999px;padding:9px 13px;cursor:pointer;text-decoration:none}.kzc-chips button:hover,.kzc-chips a:hover{border-color:var(--kc);color:var(--kc)}.kzc-chips a.go{background:var(--kb);border-color:var(--kb);color:#1A1040}" +
    ".kzc-f{display:flex;gap:8px;padding:10px 12px;border-top:1px solid var(--kl);background:var(--kn)}.kzc-f input{flex:1;min-width:0;background:var(--ki);color:var(--kt);border:1px solid var(--kl);border-radius:999px;padding:11px 15px;font:inherit;font-size:16px}.kzc-f input::placeholder{color:var(--km)}.kzc-f button{flex:none;width:44px;height:44px;border:0;border-radius:50%;background:var(--kb);color:#1A1040;cursor:pointer;display:grid;place-items:center}" +
    ".kzc-note{color:var(--km);font-size:11.5px;text-align:center;padding:0 12px 9px;background:var(--kn)}.kzc-foot{color:var(--km);font-size:12px;text-align:center;margin:10px auto 0;max-width:640px;padding:0 16px}" +
    "@media(max-width:520px){.kzc-pan{left:0;right:0;bottom:0;width:100%;height:min(86vh,640px);height:min(86dvh,640px);border-radius:20px 20px 0 0;border-width:1px 0 0}.kzc-btn span{display:none}.kzc-btn{padding:13px}}@media(prefers-reduced-motion:no-preference){.kzc-pan{animation:kzcIn .18s ease-out}@keyframes kzcIn{from{opacity:0;transform:translateY(12px)}}}";
  var ICON = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z"/><path d="M9 11h6M9 14.5h3.5"/></svg>';
  var root, pan, logEl, input, opened = false;
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function scroll() { logEl.scrollTop = logEl.scrollHeight; }
  function say(text, who) { var m = el("div", "kzc-m " + (who || "b")); m.textContent = text; logEl.appendChild(m); scroll(); return m; }
  function cardHtml(x) {
    var ext = x.t === "aff";
    return '<a class="kzc-card" href="' + esc(x.u) + '"' + (ext ? ' target="_blank" rel="sponsored noopener" data-kz-aff="' + esc(x.id) + '" data-kz-name="' + esc(x.n) + '"' : "") + ">" +
      (x.i ? '<img src="' + esc(x.i) + '" alt="" loading="lazy">' : '<div class="ph">' + esc((x.n || "?").charAt(0)) + "</div>") +
      "<span><em>" + esc(TYPE[x.t] || "") + (x.c ? " · " + esc(x.c) : "") + "</em><b>" + esc(x.n) + "</b><i>" + esc(x.d) + "</i></span><u aria-hidden=\"true\">" + (ext ? "↗" : "→") + "</u></a>";
  }
  function chips(list) {
    var c = el("div", "kzc-chips");
    list.forEach(function (it) {
      var b;
      if (it[1] && typeof it[1] === "string") { b = el("a", /wa\.me/.test(it[1]) ? "go" : ""); b.href = it[1]; if (/^https?:/.test(it[1])) { b.target = "_blank"; b.rel = "noopener"; } }
      else { b = el("button"); b.type = "button"; b.addEventListener("click", function () { ask(it[2] || it[0]); }); }
      b.textContent = it[0]; c.appendChild(b);
    });
    logEl.appendChild(c); scroll();
  }
  function starters(items) {
    var list = [["Kasir & bisnis", 0, "aplikasi kasir bisnis"], ["Belajar & LMS", 0, "aplikasi pendidikan lms"], ["Maritim & SAR", 0, "maritim sar"], ["Produktivitas", 0, "aplikasi produktivitas"], ["Buku", 0, "buku"], ["Yang gratis", 0, "gratis"]];
    if (items.some(function (x) { return x.t === "aff"; })) list.push(["Tools rekomendasi", 0, "tools rekomendasi"]);
    return list;
  }
  function ask(q) {
    q = String(q || "").trim().slice(0, 200); if (!q) return;
    say(q, "u"); input.value = "";
    loadCat().then(function (items) {
      var r = answer(q, items);
      log("chat_query", r.miss ? "tanpa-hasil" : r.tag, r.cards ? String(r.cards.length + (r.more || []).length) + " hasil" : null);
      say(r.text);
      if (r.cards) {
        var box = el("div", "kzc-cards", r.cards.map(cardHtml).join("")); logEl.appendChild(box);
        if (r.more && r.more.length) {
          var c = el("div", "kzc-chips"), b = el("button"); b.type = "button"; b.textContent = "Lihat " + r.more.length + " lainnya";
          b.addEventListener("click", function () { box.insertAdjacentHTML("beforeend", r.more.map(cardHtml).join("")); c.remove(); scroll(); });
          c.appendChild(b); logEl.appendChild(c);
        }
      }
      if (r.links) chips(r.links);
      if (r.chips) chips(starters(items));
      scroll();
    });
  }
  function open() {
    if (!pan) {
      pan = el("div", "kzc-pan"); pan.setAttribute("role", "dialog"); pan.setAttribute("aria-label", "Asisten Katalog Kabuzen");
      pan.innerHTML = '<div class="kzc-hd"><div class="kzc-dot">' + ICON + '</div><div><b>Asisten Katalog KABUZEN</b><small>Pencarian otomatis, bukan manusia</small></div><button class="x" type="button" aria-label="Tutup asisten">×</button></div>' +
        '<div class="kzc-log" aria-live="polite"></div><form class="kzc-f"><input type="text" maxlength="200" autocomplete="off" aria-label="Tulis kebutuhan Anda" placeholder="Contoh: kasir untuk warung"><button type="submit" aria-label="Kirim"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button></form>' +
        '<div class="kzc-note">Ketikan Anda tidak disimpan.</div>';
      root.appendChild(pan); logEl = pan.querySelector(".kzc-log"); input = pan.querySelector("input");
      pan.querySelector(".x").addEventListener("click", close);
      pan.querySelector("form").addEventListener("submit", function (e) { e.preventDefault(); ask(input.value); });
      pan.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
      say("Halo! Saya membantu Anda menemukan aplikasi, buku, dan video di Kabuzen Rumah AI. Tulis kebutuhan Anda, atau pilih salah satu:");
      loadCat().then(function (items) { chips(starters(items)); });
    }
    pan.hidden = false; root.querySelector(".kzc-btn").hidden = true; var tip = root.querySelector(".kzc-tip"); if (tip) tip.remove();
    if (!opened) { opened = true; log("chat_open"); }
    if (window.innerWidth > 520) input.focus();
  }
  function close() { pan.hidden = true; var b = root.querySelector(".kzc-btn"); b.hidden = false; b.focus(); }
  function mount() {
    if (document.querySelector(".kzc")) return;
    var st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);
    root = el("div", "kzc"); document.body.appendChild(root);
    var btn = el("button", "kzc-btn", ICON + "<span>Cari produk</span>"); btn.type = "button"; btn.setAttribute("aria-label", "Buka asisten katalog"); btn.addEventListener("click", open); root.appendChild(btn);
    var foot = document.querySelector("footer .legal") || document.querySelector("footer");
    if (foot && !document.querySelector(".kzc-foot")) { var f = el("div", "kzc kzc-foot"); f.textContent = "Situs ini mencatat statistik kunjungan secara anonim, tanpa nama, email, atau alamat IP."; foot.parentNode.insertBefore(f, foot.nextSibling); }
    var seen = false; try { seen = sessionStorage.getItem("kz-tip") === "1"; } catch (e) {}
    if (!seen) setTimeout(function () {
      if (opened || document.querySelector(".kzc-tip")) return;
      try { sessionStorage.setItem("kz-tip", "1"); } catch (e) {}
      var tip = el("div", "kzc-tip"); tip.textContent = "Cari aplikasi atau buku tertentu? Saya bantu carikan.";
      var x = el("button", "", "×"); x.type = "button"; x.setAttribute("aria-label", "Tutup"); x.addEventListener("click", function (e) { e.stopPropagation(); tip.remove(); });
      tip.appendChild(x); tip.addEventListener("click", open); root.appendChild(tip);
      setTimeout(function () { if (tip.parentNode) tip.remove(); }, 12000);
    }, 15000);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount); else mount();
  window.__kz = { log: log, open: open, answer: answer, loadCat: loadCat, loadAff: loadAff, esc: esc, okUrl: okUrl, SB: SB, KEY: KEY };
})();
