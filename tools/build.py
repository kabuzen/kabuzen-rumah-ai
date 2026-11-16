#!/usr/bin/env python3
"""Pembangun halaman statis Kabuzen Rumah AI.

Jalankan dari akar repositori setiap kali data produk di index.html (blok
<script id="site-data">) berubah:

    python3 tools/build.py

Yang dilakukan:
1. Gambar yang masih tertanam sebagai data URI (sampul buku, tangkapan layar
   aplikasi, sampul video, logo) dipindah ke folder img/ dan diganti alamatnya,
   supaya index.html tetap ringan.
2. Membuat satu halaman sungguhan per produk:
   aplikasi/<slug>.html  ->  /aplikasi/<slug>
   buku/<slug>.html      ->  /buku/<slug>
3. Membuat sitemap.xml dan robots.txt.
"""
import base64, hashlib, html, json, os, re, sys, urllib.parse
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.environ.get('KABUZEN_SITE', 'https://kabuzen-rumah-ai-37bk.vercel.app').rstrip('/')
EXT = {'image/webp': 'webp', 'image/png': 'png', 'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/gif': 'gif', 'image/svg+xml': 'svg'}
E = html.escape


def load():
    s = open(os.path.join(ROOT, 'index.html'), encoding='utf8').read()
    m = re.search(r'(<script type="application/json" id="site-data">)(.*?)(</script>)', s, re.S)
    return s, m, json.loads(m.group(2))


def save_index(s, m, data):
    out = s[:m.start(2)] + json.dumps(data, ensure_ascii=False).replace('<', '\\u003c') + s[m.end(2):]
    open(os.path.join(ROOT, 'index.html'), 'w', encoding='utf8').write(out)
    return len(out)


def extract_images(data):
    """Ganti setiap data:image/... dengan berkas di img/<jenis>/<nama>."""
    n = 0
    def put(uri, folder, name):
        nonlocal n
        mime, b64 = uri[5:].split(';base64,', 1)
        ext = EXT.get(mime, 'bin'); raw = base64.b64decode(b64)
        rel = f'img/{folder}/{name}.{ext}'
        path = os.path.join(ROOT, rel); os.makedirs(os.path.dirname(path), exist_ok=True)
        open(path, 'wb').write(raw); n += 1
        return '/' + rel
    slug = lambda x, pre: re.sub(r'[^a-z0-9-]+', '-', (x.get('id') or x.get('slug') or hashlib.md5(json.dumps(x, sort_keys=True).encode()).hexdigest()[:10]).lower().removeprefix(pre)).strip('-')
    for k, v in list(data.get('config', {}).items()):
        if isinstance(v, str) and v.startswith('data:image/'): data['config'][k] = put(v, 'site', k)
    for coll, folder, pre in [('apps', 'aplikasi', 'app-'), ('books', 'buku', 'b-'), ('videos', 'video', 'v-'), ('posts', 'artikel', ''), ('gallery', 'galeri', ''), ('animations', 'animasi', 'an-')]:
        for x in data.get(coll, []):
            for k, v in list(x.items()):
                if isinstance(v, str) and v.startswith('data:image/'):
                    x[k] = put(v, folder, slug(x, pre) + ('' if k in ('shot', 'cover') else '-' + k))
    return n


CSS = """:root{--ink:#0A0624;--night:#130C3E;--night2:#1B1257;--volt:#1E9BFF;--cyan:#55EEFF;--bolt:#FFD233;--text:#EEEFFF;--muted:#A7A3D4;--line:rgba(150,140,255,.16);--ok:#3EE59A;
--fd:"Unbounded","Arial Black",system-ui,sans-serif;--fb:"Plus Jakarta Sans",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;--fm:"JetBrains Mono",ui-monospace,Menlo,monospace;color-scheme:dark}
*{box-sizing:border-box}body{margin:0;background:radial-gradient(900px 500px at 80% -10%,rgba(30,155,255,.18),transparent 60%),var(--ink);color:var(--text);font:16px/1.65 var(--fb)}
a{color:var(--cyan)}img{max-width:100%;display:block}
.bar{position:sticky;top:0;z-index:5;background:rgba(10,6,36,.86);backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}
.bar .in{max-width:1120px;margin:0 auto;padding:12px 20px;display:flex;align-items:center;gap:16px}
.brand{display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--text);font:800 15px/1.1 var(--fd)}
.brand img{width:40px;height:40px;border-radius:50%;box-shadow:0 0 0 3px var(--bolt)}.brand small{display:block;color:var(--bolt);font:500 10px var(--fm);letter-spacing:.2em}
.bar nav{margin-left:auto;display:flex;gap:4px;flex-wrap:wrap}.bar nav a{color:var(--muted);text-decoration:none;font-weight:600;font-size:14px;padding:8px 12px;border-radius:999px}.bar nav a:hover{color:var(--text);background:var(--night2)}.bar nav a.cta,.bar nav a.cta:hover{color:#1A1040;background:var(--bolt)}
main{max-width:1120px;margin:0 auto;padding:28px 20px 40px}
.crumb{font-size:14px;color:var(--muted);margin-bottom:18px}.crumb a{color:var(--muted)}
.hero{display:grid;grid-template-columns:1.1fr 1fr;gap:36px;align-items:start}
.kick{font:600 12px var(--fm);letter-spacing:.14em;text-transform:uppercase;color:var(--bolt);display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.kick .st{color:var(--ok);border:1px solid rgba(62,229,154,.4);border-radius:6px;padding:1px 7px}
h1{font:800 clamp(30px,4.4vw,48px)/1.08 var(--fd);margin:12px 0 14px;letter-spacing:-.01em}
.sub{color:var(--text);font-weight:600;margin:-4px 0 12px}.lead{color:var(--muted);font-size:17px}
.price{font-weight:800;color:var(--bolt);margin:18px 0 10px}.price.free{color:var(--ok)}
.acts{display:flex;gap:12px;flex-wrap:wrap}
.btn{display:inline-flex;align-items:center;gap:8px;font:700 15px/1 var(--fb);text-decoration:none;padding:13px 20px;border-radius:999px}
.btn-bolt{background:var(--bolt);color:#1A1040;box-shadow:0 6px 24px rgba(255,210,51,.28)}.btn-ghost{color:var(--text);box-shadow:inset 0 0 0 1.5px var(--line)}.btn-ghost:hover{color:var(--cyan);box-shadow:inset 0 0 0 1.5px var(--cyan)}
.pic{border-radius:18px;overflow:hidden;box-shadow:0 0 0 1px var(--line),0 30px 80px rgba(0,0,0,.45);background:var(--night)}
.pic.book{max-width:360px;justify-self:center;border-radius:10px}
.grid2{display:grid;grid-template-columns:1.6fr 1fr;gap:20px;margin-top:40px}
.card{background:var(--night);border:1px solid var(--line);border-radius:18px;padding:22px 24px}
.card h2{font:800 18px var(--fd);margin:0 0 12px}
.card ul,.card ol{margin:0;padding-left:22px}.card li{margin:8px 0}
.info{width:100%;border-collapse:collapse;font-size:15px}.info td{padding:6px 0;border-bottom:1px solid var(--line);vertical-align:top}.info td:first-child{color:var(--muted);width:42%}
.rel{margin-top:44px}.rel h2{font:800 20px var(--fd)}
.rels{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:16px}
.rels a{display:block;text-decoration:none;color:var(--text);background:var(--night);border:1px solid var(--line);border-radius:16px;overflow:hidden}
.rels a:hover{border-color:var(--cyan)}.rels img{aspect-ratio:16/10;object-fit:cover;width:100%}.rels .bk img{aspect-ratio:3/4;object-fit:cover}
.rels b{display:block;padding:12px 14px 2px}.rels span{display:block;padding:0 14px 14px;color:var(--muted);font-size:13px}
h1+.player,.player{margin-top:6px}
.player{border-radius:18px;overflow:hidden;background:#000;box-shadow:0 0 0 1px var(--line),0 30px 80px rgba(0,0,0,.45);max-width:960px}
.player video{width:100%;display:block;aspect-ratio:16/9;background:#000}
.player.tall{max-width:380px}.player.tall video{aspect-ratio:9/16}
.player.poster{position:relative;display:block}.player.poster img{width:100%;aspect-ratio:16/9;object-fit:cover;opacity:.85}
.player .pbtn{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);background:var(--bolt);color:#1A1040;font-weight:800;padding:14px 22px;border-radius:999px;white-space:nowrap}
.vtabs{display:flex;gap:10px;margin-top:14px;flex-wrap:wrap}
.vtabs button{font:700 14px var(--fb);background:var(--night);color:var(--text);border:1px solid var(--line);border-radius:12px;padding:8px 14px;cursor:pointer;text-align:left}
.vtabs button small{display:block;font-weight:500;color:var(--muted);font-size:12px}
.vtabs button[aria-pressed=true]{border-color:var(--bolt);box-shadow:inset 0 0 0 1px var(--bolt)}
footer{border-top:1px solid var(--line);color:var(--muted);font-size:14px;text-align:center;padding:24px 20px}
@media(max-width:820px){.hero,.grid2{grid-template-columns:1fr}.bar nav a:not(.cta){display:none}}
"""

FONTS = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Unbounded:wght@700;800&family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@500&display=swap">'


def page(title, desc, canon, image, body, data, ld):
    logo = data['config'].get('logo', '')
    img_abs = (SITE + image) if image and image.startswith('/') else (image or '')
    return f"""<!doctype html>
<html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{E(title)} · Kabuzen Rumah AI</title>
<meta name="description" content="{E(desc[:300])}">
<link rel="canonical" href="{canon}">
<meta property="og:type" content="product"><meta property="og:site_name" content="Kabuzen Rumah AI">
<meta property="og:title" content="{E(title)}"><meta property="og:description" content="{E(desc[:300])}"><meta property="og:url" content="{canon}">
{f'<meta property="og:image" content="{E(img_abs)}"><meta name="twitter:card" content="summary_large_image">' if img_abs else ''}
<link rel="icon" href="{E(logo)}">{FONTS}
<style>{CSS}</style>
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False).replace('<', '\\u003c')}</script>
</head><body>
<header class="bar"><div class="in"><a class="brand" href="/"><img src="{E(logo)}" alt="KABUZEN"><span>KABUZEN<small>RUMAH AI</small></span></a>
<nav><a href="/#aplikasi">Aplikasi</a><a href="/#buku">Buku</a><a href="/majalah">Majalah</a><a href="/#animasi">Animasi</a><a href="/#galeri">Video</a><a href="/#layanan">Layanan</a><a class="cta btn btn-bolt" style="padding:9px 14px" href="/#kontak">Kontak</a></nav></div></header>
<main>{body}</main>
<footer>© {date.today().year} Kabuzen Rumah AI · Batam, Kepulauan Riau · WhatsApp {E(data['config'].get('whatsappLabel', ''))}</footer>
<script src="/assets/kz.js" defer></script>
</body></html>"""


def wa_link(data, text):
    wa = re.sub(r'\D', '', data['config'].get('whatsapp', ''))
    return f'https://wa.me/{wa}?text=' + urllib.parse.quote(text) if wa else '/#kontak'


def app_page(a, data):
    slug = a['id'].removeprefix('app-'); url = a.get('url') or ''
    buy = wa_link(data, f'Halo Kabuzen, saya ingin membeli aplikasi “{a["name"]}”' + (f' ({a["price"]})' if a.get('price') else '') + '. Mohon info harga, cara pembayaran, dan pemasangannya.')
    if a.get('free'):
        price = f'<div class="price free">Gratis{" · " + E(a["license"]) if a.get("license") else ""}</div>'
        acts = f'<a class="btn btn-bolt" href="{E(url)}">Buka aplikasi →</a>' if url else ''
    else:
        price = f'<div class="price">{E(a.get("price") or "Harga via WhatsApp")}</div>'
        acts = f'<a class="btn btn-bolt" href="{E(buy)}" target="_blank" rel="noopener">Beli via WhatsApp</a>' + (f'<a class="btn btn-ghost" href="{E(url)}">Coba demo →</a>' if url and a.get('status') != 'soon' else '')
    pic = a.get('shot') or a.get('image')
    feats = ''.join(f'<li>{E(f)}</li>' for f in a.get('features', []))
    steps = ''.join(f'<li>{E(f)}</li>' for f in a.get('steps', []))
    rel = [x for x in data['apps'] if x['id'] != a['id'] and x.get('cat') == a.get('cat')][:4]
    def relcard(x):
        im = x.get('shot') or x.get('image')
        return f'<a href="/aplikasi/{E(x["id"].removeprefix("app-"))}">' + (f'<img src="{E(im)}" alt="" loading="lazy">' if im else '') + f'<b>{E(x["name"])}</b><span>{E(x.get("cat", ""))}</span></a>'
    rels = ''.join(relcard(x) for x in rel)
    body = f"""<div class="crumb"><a href="/">Beranda</a> / <a href="/#aplikasi">Aplikasi</a> / {E(a['name'])}</div>
<section class="hero"><div><div class="kick">{E(a.get('cat', ''))}<span class="st">{'LIVE' if a.get('status', 'live') == 'live' else 'SEGERA'}</span></div>
<h1>{E(a['name'])}</h1><p class="lead">{E(a.get('desc', ''))}</p>{price}<div class="acts">{acts}</div></div>
{f'<div class="pic"><img src="{E(pic)}" alt="Tampilan {E(a["name"])}"></div>' if pic else ''}</section>
<section class="grid2"><div class="card">{f'<h2>Fitur utama</h2><ul>{feats}</ul>' if feats else ''}{f'<h2 style="margin-top:22px">Cara memakai</h2><ol>{steps}</ol>' if steps else ''}</div>
<div><div class="card">{f'<h2>Cocok untuk</h2><p style="margin:0;color:var(--muted)">{E(a["audience"])}</p>' if a.get('audience') else ''}</div>
<div class="card" style="margin-top:20px"><h2>Info aplikasi</h2><table class="info"><tr><td>Kategori</td><td>{E(a.get('cat', ''))}</td></tr><tr><td>Rilis</td><td>{E(str(a.get('year', '')))}</td></tr><tr><td>Harga</td><td>{'Gratis' if a.get('free') else E(a.get('price') or 'Hubungi via WhatsApp')}</td></tr>{f'<tr><td>Kata kunci</td><td>{E(", ".join(a.get("tags", [])))}</td></tr>' if a.get('tags') else ''}</table></div></div></section>
{f'<section class="rel"><h2>Aplikasi lain di {E(a.get("cat", ""))}</h2><div class="rels">{rels}</div></section>' if rels else ''}"""
    ld = {'@context': 'https://schema.org', '@type': 'SoftwareApplication', 'name': a['name'], 'description': a.get('desc', ''), 'applicationCategory': a.get('cat', ''),
          'operatingSystem': 'Web', 'url': f'{SITE}/aplikasi/{slug}', 'author': {'@type': 'Organization', 'name': 'Kabuzen Rumah AI'}}
    if pic and pic.startswith('/'): ld['image'] = SITE + pic
    return slug, page(a['name'], a.get('desc', ''), f'{SITE}/aplikasi/{slug}', pic, body, data, ld)


def book_page(b, data):
    slug = b['id'].removeprefix('b-')
    order = wa_link(data, f'Halo Kabuzen, saya ingin membeli buku “{b["title"]}”' + (f' ({b["price"]})' if b.get('price') else '') + '. Mohon info cara pembayaran dan pengirimannya.')
    pdf, sample = b.get('pdf') or '', b.get('sample') or ''
    if b.get('free') or pdf:
        price = f'<div class="price free">Gratis{" · " + E(b["license"]) if b.get("license") else ""}</div>'
        acts = f'<a class="btn btn-bolt" href="{E(pdf)}" target="_blank" rel="noopener">Baca PDF</a><a class="btn btn-ghost" href="{E(pdf)}" download>Unduh</a>' if pdf else ''
    else:
        price = f'<div class="price">{E(b.get("price") or "Harga via WhatsApp")}</div>'
        acts = f'<a class="btn btn-bolt" href="{E(order)}" target="_blank" rel="noopener">Beli via WhatsApp</a>' + (f'<a class="btn btn-ghost" href="{E(sample)}" target="_blank" rel="noopener">Baca contoh</a>' if sample else '')
    rel = [x for x in data['books'] if x['id'] != b['id'] and x.get('cat') == b.get('cat')][:4]
    rels = ''.join(f'<a class="bk" href="/buku/{E(x["id"].removeprefix("b-"))}">' + (f'<img src="{E(x["cover"])}" alt="" loading="lazy">' if x.get('cover') else '') + f'<b>{E(x["title"])}</b><span>{E(x.get("kind", ""))}</span></a>' for x in rel)
    body = f"""<div class="crumb"><a href="/">Beranda</a> / <a href="/#buku">Buku</a> / {E(b['title'])}</div>
<section class="hero"><div><div class="kick">{E(b.get('cat', ''))}{f'<span>{E(b["kind"])}</span>' if b.get('kind') else ''}</div>
<h1>{E(b['title'])}</h1>{f'<p class="sub">{E(b["subtitle"])}</p>' if b.get('subtitle') else ''}<p class="lead">{E(b.get('desc', ''))}</p>
{f'<p style="color:var(--muted);margin:0">Oleh {E(b["author"])}</p>' if b.get('author') else ''}{price}<div class="acts">{acts}</div></div>
{f'<div class="pic book"><img src="{E(b["cover"])}" alt="Sampul {E(b["title"])}"></div>' if b.get('cover') else ''}</section>
<section class="grid2"><div class="card"><h2>Tentang buku ini</h2><p style="margin:0;color:var(--muted)">{E(b.get('desc', ''))}</p>{'<p style="margin:14px 0 0;color:var(--muted)">Baca halaman contohnya dulu, lalu pesan versi lengkap dalam format PDF lewat WhatsApp.</p>' if sample and not pdf else ''}</div>
<div class="card"><h2>Info buku</h2><table class="info"><tr><td>Penulis</td><td>{E(b.get('author', ''))}</td></tr><tr><td>Jenis</td><td>{E(b.get('kind', ''))}</td></tr><tr><td>Tahun</td><td>{E(str(b.get('year', '')))}</td></tr><tr><td>Tebal</td><td>{E(str(b.get('pages', '')))} halaman</td></tr><tr><td>Format</td><td>PDF</td></tr></table></div></section>
{f'<section class="rel"><h2>Buku lain di {E(b.get("cat", ""))}</h2><div class="rels">{rels}</div></section>' if rels else ''}"""
    ld = {'@context': 'https://schema.org', '@type': 'Book', 'name': b['title'], 'description': b.get('desc', ''), 'author': {'@type': 'Person', 'name': b.get('author', '')},
          'numberOfPages': b.get('pages'), 'bookFormat': 'https://schema.org/EBook', 'inLanguage': 'id', 'url': f'{SITE}/buku/{slug}'}
    if b.get('cover', '').startswith('/'): ld['image'] = SITE + b['cover']
    return slug, page(b['title'], b.get('desc', ''), f'{SITE}/buku/{slug}', b.get('cover'), body, data, ld)


def fmt_dur(n):
    n = int(round(float(n or 0)))
    return f'{n // 60}:{n % 60:02d}' if n else ''


def anim_page(x, data):
    slug = x['id'].removeprefix('an-')
    apps = {a['id']: a for a in data['apps']}; books = {b['id']: b for b in data['books']}
    app = apps.get(x.get('app') or '')
    order = wa_link(data, f'Halo Kabuzen, saya sudah menonton animasi “{x["title"]}” dan ingin memesan animasi serupa untuk lembaga/produk saya. Mohon info prosesnya.')
    vs = x.get('versions') or []
    if vs:
        first = vs[0]
        tabs = ''.join(f'<button type="button" data-src="{E(v["url"])}" data-r="{E(v.get("label", ""))}"{" aria-pressed=true" if i == 0 else ""}>{E(v.get("label", ""))}<small>{E(v.get("note", ""))}</small></button>' for i, v in enumerate(vs))
        ratio = 'tall' if first.get('label') == '9:16' else ''
        player = f"""<div class="player {ratio}" id="pl"><video id="vd" controls playsinline preload="metadata" poster="{E(x.get('cover', ''))}" src="{E(first['url'])}"></video></div>
{f'<div class="vtabs" role="group" aria-label="Pilih versi">{tabs}</div>' if len(vs) > 1 else ''}
<script>document.querySelectorAll('.vtabs button').forEach(b=>b.onclick=()=>{{const v=document.getElementById('vd');document.querySelectorAll('.vtabs button').forEach(x=>x.removeAttribute('aria-pressed'));b.setAttribute('aria-pressed','true');document.getElementById('pl').classList.toggle('tall',b.dataset.r==='9:16');v.src=b.dataset.src;v.play().catch(()=>{{}});}});</script>"""
    else:
        player = f'<a class="player poster" href="{E(app.get("url", "#") if app else "#")}">' + (f'<img src="{E(x["cover"])}" alt="Cuplikan {E(x["title"])}">' if x.get('cover') else '') + '<span class="pbtn">▶ Putar animasi interaktif</span></a>'
    acts = f'<a class="btn btn-bolt" href="{E(order)}" target="_blank" rel="noopener">Pesan animasi serupa</a>'
    if app:
        acts += f'<a class="btn btn-ghost" href="{E(app.get("url", ""))}">{"Buka versi interaktif" if vs else "Coba animasi (demo)"} →</a>'
        if not app.get('free'):
            buy = wa_link(data, f'Halo Kabuzen, saya ingin membeli animasi interaktif “{app["name"]}”. Mohon info harga dan cara pemasangannya.')
            acts += f'<a class="btn btn-ghost" href="{E(buy)}" target="_blank" rel="noopener">Beli versi lengkap</a>'
    hl = ''.join(f'<li>{E(h)}</li>' for h in x.get('highlights', []))
    def relcard(rid):
        if rid in books:
            r = books[rid]; return f'<a class="bk" href="/buku/{E(rid.removeprefix("b-"))}">' + (f'<img src="{E(r["cover"])}" alt="" loading="lazy">' if r.get('cover') else '') + f'<b>{E(r["title"])}</b><span>Buku · {E(r.get("kind", ""))}</span></a>'
        if rid in apps:
            r = apps[rid]; im = r.get('shot') or r.get('image')
            return f'<a href="/aplikasi/{E(rid.removeprefix("app-"))}">' + (f'<img src="{E(im)}" alt="" loading="lazy">' if im else '') + f'<b>{E(r["name"])}</b><span>Aplikasi · {E(r.get("cat", ""))}</span></a>'
        return ''
    others = [y for y in data.get('animations', []) if y['id'] != x['id']][:3]
    def animcard(y):
        return f'<a href="/animasi/{E(y["id"].removeprefix("an-"))}">' + (f'<img src="{E(y["cover"])}" alt="" loading="lazy">' if y.get('cover') else '') + f'<b>{E(y["title"])}</b><span>{E(y.get("kind", ""))}</span></a>'
    rels = ''.join(relcard(r) for r in x.get('related', []))
    info = ''.join(f'<tr><td>{k}</td><td>{v}</td></tr>' for k, v in [('Jenis', E(x.get('kind', ''))), ('Durasi', fmt_dur(x.get('duration'))), ('Versi', ' · '.join([E(', '.join(v.get('label', '') + (' (' + v['note'] + ')' if v.get('note') else '') for v in vs))] * bool(vs) + ['Interaktif'] * bool(app))), ('Rilis', E(str(x.get('year', ''))))] if v)
    body = f"""<div class="crumb"><a href="/">Beranda</a> / <a href="/#animasi">Animasi</a> / {E(x['title'])}</div>
<div class="kick">{E(x.get('kind', 'Animasi'))}</div><h1>{E(x['title'])}</h1>
{player}
<div class="acts" style="margin-top:20px">{acts}</div>
<section class="grid2"><div class="card"><h2>Tentang animasi ini</h2><p style="margin:0;color:var(--muted)">{E(x.get('desc', ''))}</p>{f'<h2 style="margin-top:22px">Isi animasi</h2><ul>{hl}</ul>' if hl else ''}</div>
<div><div class="card">{f'<h2>Cocok untuk</h2><p style="margin:0 0 4px;color:var(--muted)">{E(x["audience"])}</p>' if x.get('audience') else ''}<h2 style="margin-top:{'18px' if x.get('audience') else '0'}">Info</h2><table class="info">{info}</table></div>
<div class="card" style="margin-top:20px"><h2>Pesan animasi untuk lembaga Anda</h2><p style="margin:0 0 14px;color:var(--muted)">Kabuzen membuat animasi 2D, 3D, dan interaktif untuk sekolah, pelatihan, dan instansi: naskah, narasi, sampai versi 9:16 dan 16:9.</p><a class="btn btn-bolt" href="{E(order)}" target="_blank" rel="noopener">Konsultasi via WhatsApp</a></div></div></section>
{f'<section class="rel"><h2>Produk terkait</h2><div class="rels">{rels}</div></section>' if rels else ''}
{f'<section class="rel"><h2>Animasi lainnya</h2><div class="rels">{"".join(animcard(y) for y in others)}</div></section>' if others else ''}"""
    canon = f'{SITE}/animasi/{slug}'
    if vs:
        ld = {'@context': 'https://schema.org', '@type': 'VideoObject', 'name': x['title'], 'description': x.get('desc', ''), 'inLanguage': 'id',
              'contentUrl': SITE + vs[0]['url'], 'embedUrl': canon, 'uploadDate': x.get('date') or str(x.get('year', ''))}
        if x.get('duration'): ld['duration'] = f'PT{int(x["duration"]) // 60}M{int(x["duration"]) % 60}S'
        if (x.get('cover') or '').startswith('/'): ld['thumbnailUrl'] = SITE + x['cover']
    else:
        ld = {'@context': 'https://schema.org', '@type': 'CreativeWork', 'name': x['title'], 'description': x.get('desc', ''), 'inLanguage': 'id', 'url': canon}
        if (x.get('cover') or '').startswith('/'): ld['image'] = SITE + x['cover']
    return slug, page(x['title'], x.get('desc', ''), canon, x.get('cover'), body, data, ld)


def katalog(data):
    """Data ringkas untuk asisten katalog (assets/kz.js) -> data/katalog.json."""
    cut = lambda t, n=170: (t[:n].rsplit(' ', 1)[0] + '…') if len(t or '') > n else (t or '')
    out = []
    for a in data['apps']:
        out.append({'t': 'app', 'id': a['id'].removeprefix('app-'), 'n': a['name'], 'c': a.get('cat', ''), 'd': cut(a.get('desc', '')),
                    'k': ' '.join(a.get('tags', []) + [a.get('audience', '')]), 'u': '/aplikasi/' + a['id'].removeprefix('app-'),
                    'i': a.get('shot') or a.get('image') or '', 'p': 'Gratis' if a.get('free') else (a.get('price') or '')})
    for b in data['books']:
        out.append({'t': 'buku', 'id': b['id'].removeprefix('b-'), 'n': b['title'], 'c': b.get('cat', ''), 'd': cut(b.get('desc', '')),
                    'k': ' '.join([b.get('subtitle', ''), b.get('kind', '')]), 'u': '/buku/' + b['id'].removeprefix('b-'),
                    'i': b.get('cover') or '', 'p': 'Gratis' if (b.get('free') or b.get('pdf')) else (b.get('price') or '')})
    for v in data.get('videos', []):
        if v.get('url'): out.append({'t': 'video', 'id': v['id'].removeprefix('v-'), 'n': v['title'], 'c': '', 'd': '', 'k': '', 'u': v['url'], 'i': v.get('cover') or '', 'p': ''})
    for x in data.get('animations', []):
        out.append({'t': 'animasi', 'id': x['id'].removeprefix('an-'), 'n': x['title'], 'c': x.get('kind', ''), 'd': cut(x.get('desc', '')),
                    'k': ' '.join(x.get('highlights', []) + [x.get('audience', '')]), 'u': '/animasi/' + x['id'].removeprefix('an-'), 'i': x.get('cover') or '', 'p': ''})
    for p in data.get('posts', []):
        out.append({'t': 'artikel', 'id': p['slug'], 'n': p['title'], 'c': p.get('cat', ''), 'd': cut(p.get('excerpt', '')), 'k': '', 'u': '/#artikel-' + p['slug'], 'i': p.get('cover') or '', 'p': ''})
    os.makedirs(os.path.join(ROOT, 'data'), exist_ok=True)
    json.dump(out, open(os.path.join(ROOT, 'data', 'katalog.json'), 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
    return len(out)


def main():
    s, m, data = load()
    n = extract_images(data)
    size = save_index(s, m, data)
    urls = [SITE + '/']
    for folder in ('aplikasi',):
        os.makedirs(os.path.join(ROOT, folder), exist_ok=True)
        for f in os.listdir(os.path.join(ROOT, folder)):
            if f.endswith('.html'): os.remove(os.path.join(ROOT, folder, f))
    for f in os.listdir(os.path.join(ROOT, 'buku')):
        if f.endswith('.html'): os.remove(os.path.join(ROOT, 'buku', f))
    for a in data['apps']:
        slug, h = app_page(a, data); open(os.path.join(ROOT, 'aplikasi', slug + '.html'), 'w', encoding='utf8').write(h); urls.append(f'{SITE}/aplikasi/{slug}')
    for b in data['books']:
        slug, h = book_page(b, data); open(os.path.join(ROOT, 'buku', slug + '.html'), 'w', encoding='utf8').write(h); urls.append(f'{SITE}/buku/{slug}')
    os.makedirs(os.path.join(ROOT, 'animasi'), exist_ok=True)
    for f in os.listdir(os.path.join(ROOT, 'animasi')):
        if f.endswith('.html'): os.remove(os.path.join(ROOT, 'animasi', f))
    for x in data.get('animations', []):
        slug, h = anim_page(x, data); open(os.path.join(ROOT, 'animasi', slug + '.html'), 'w', encoding='utf8').write(h); urls.append(f'{SITE}/animasi/{slug}')
    for dp, _, fs in sorted(os.walk(os.path.join(ROOT, 'majalah'))):
        for f in sorted(fs):
            if f.endswith('.html'):
                rel = os.path.relpath(os.path.join(dp, f), ROOT)[:-5]
                urls.append(SITE + '/' + (rel[:-6].rstrip('/') if rel.endswith('index') else rel))
    today = date.today().isoformat()
    open(os.path.join(ROOT, 'sitemap.xml'), 'w').write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join(f'<url><loc>{u}</loc><lastmod>{today}</lastmod></url>\n' for u in urls) + '</urlset>\n')
    open(os.path.join(ROOT, 'robots.txt'), 'w').write(f'User-agent: *\nAllow: /\nDisallow: /log\nSitemap: {SITE}/sitemap.xml\n')
    nk = katalog(data)
    print(f'{n} gambar dipindah ke img/ · index.html {size // 1024} KB · {len(data["apps"])} halaman aplikasi · {len(data["books"])} halaman buku · {len(data.get("animations", []))} halaman animasi · sitemap {len(urls)} alamat · katalog asisten {nk} entri')


if __name__ == '__main__':
    main()
