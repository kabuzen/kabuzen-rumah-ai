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
    for coll, folder, pre in [('apps', 'aplikasi', 'app-'), ('books', 'buku', 'b-'), ('videos', 'video', 'v-'), ('posts', 'artikel', ''), ('gallery', 'galeri', '')]:
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
<nav><a href="/#aplikasi">Aplikasi</a><a href="/#buku">Buku</a><a href="/#galeri">Video</a><a href="/#layanan">Layanan</a><a class="cta btn btn-bolt" style="padding:9px 14px" href="/#kontak">Kontak</a></nav></div></header>
<main>{body}</main>
<footer>© {date.today().year} Kabuzen Rumah AI · Batam, Kepulauan Riau · WhatsApp {E(data['config'].get('whatsappLabel', ''))}</footer>
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
    today = date.today().isoformat()
    open(os.path.join(ROOT, 'sitemap.xml'), 'w').write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join(f'<url><loc>{u}</loc><lastmod>{today}</lastmod></url>\n' for u in urls) + '</urlset>\n')
    open(os.path.join(ROOT, 'robots.txt'), 'w').write(f'User-agent: *\nAllow: /\nSitemap: {SITE}/sitemap.xml\n')
    print(f'{n} gambar dipindah ke img/ · index.html {size // 1024} KB · {len(data["apps"])} halaman aplikasi · {len(data["books"])} halaman buku · sitemap {len(urls)} alamat')


if __name__ == '__main__':
    main()
