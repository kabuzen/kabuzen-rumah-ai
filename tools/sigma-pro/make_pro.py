#!/usr/bin/env python3
"""Membangun SIGMA Tim Enam Tahap versi berlisensi dari apps/sigma-tim.html.

    python3 make_pro.py <repo> <supabase_url> <publishable_key>
"""
import os, re, shutil, sys

repo, url, key = sys.argv[1], sys.argv[2], sys.argv[3]
here = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(repo, 'apps', 'sigma-tim.html'), encoding='utf8').read()
store = open(os.path.join(here, 'frag_store.js'), encoding='utf8').read()
views = open(os.path.join(here, 'frag_views.js'), encoding='utf8').read()
out_dir = os.path.join(repo, 'sigma-pro')
os.makedirs(out_dir, exist_ok=True)


def sub(s, old, new, count=1):
    n = s.count(old)
    assert n == count, f'{n} kemunculan (harap {count}): {old[:70]!r}'
    return s.replace(old, new)


s = src
# 1. buang lapisan demo
a = s.index('<!-- KABUZEN-DEMO -->'); b = s.index('</script>', a) + len('</script>')
s = s[:a] + '<meta name="robots" content="noindex,nofollow">' + s[b:]
s = sub(s, '<title>Tim Enam Tahap</title>', '<title>SIGMA Tim Enam Tahap</title>')
s = sub(s, '</span>Tim Enam Tahap</div>', '</span>SIGMA Tim Enam Tahap</div>')

# 2. skrip
s = sub(s, '<script src="sigma-tim-content.js"></script>\n<script src="sigma-tim-core.js"></script>',
        '<script src="/sigma-pro/sigma-tim-content.js"></script>\n<script src="/sigma-pro/sigma-tim-core.js"></script>\n'
        '<script src="/sigma-pro/supabase.js"></script>\n'
        f'<script>window.SIGMA_CFG = {{url:"{url}", key:"{key}"}};</script>')

# 3. penyimpanan Supabase + pesan galat
s = sub(s, 'const writeErr = e => toast(', store + 'const writeErr = e => toast(S.mode === "supa" ? sbErr(e) : ')

# 4. identitas
s = sub(s, '  if (S.guest) return null;\n  if (S.uid){',
        '  if (S.guest) return null;\n'
        '  if (S.mode === "supa") { if (!S.email) return null; if (lower(t.coord.email) === S.email) return "koor"; '
        'const mm = (t.members||[]).find(m => m.email === S.email); return mm ? mm.k : null; }\n  if (S.uid){')
s = sub(s, '(S.owner && S.mode === "db")', '(S.owner && S.mode !== "local")')

# 5. render
s = sub(s, '  const m = $("#main");\n  if (!S.teamsLoaded)',
        '  const m = $("#main");\n  if (S.mode === "supa" && !S.session) { m.innerHTML = viewAuth(); return; }\n  if (!S.teamsLoaded)')
s = sub(s, 'else if (!team()) m.innerHTML = viewTeams();',
        'else if (!team()) m.innerHTML = S.mode === "supa" ? viewTeamsPro() : viewTeams();')
s = sub(s, '  if (fid) { const el = document.getElementById(fid);',
        '  if (S.mode === "supa" && team()) m.insertAdjacentHTML("afterbegin", licNotice());\n'
        '  if (fid) { const el = document.getElementById(fid);')
s = sub(s, '  $("#tabs").innerHTML = t &&',
        '  if (S.mode === "supa") { const w = $("#who"); if (!S.session) w.innerHTML = ""; else {\n'
        '    const sw = w.querySelector(\'[data-act="switch-team"]\'); if (sw && S.owner) sw.textContent = "Panel admin"; else if (sw && Object.keys(S.teams).length < 2) sw.remove();\n'
        '    w.insertAdjacentHTML("beforeend", `<span class="chip">${esc(S.email)}</span><button class="link small" data-act="logout">Keluar</button>`); } }\n'
        '  $("#tabs").innerHTML = t &&')

# 6. buat tim
s = sub(s, 'function createTeam(){\n',
        'function createTeam(){\n  if (S.mode === "supa") return createTeamPro($(\'[data-act="create-team"]\'));\n')

# 7. pengaturan tim: kelola anggota dengan email
a = s.index('<div class="grid2">${t.members.map((m,i) => `<div class="stack" style="gap:4px">')
endmark = '<span class="small muted">Belum masuk</span>`}</div>`).join("")}</div>'
b = s.index(endmark, a) + len(endmark)
s = s[:a] + '${S.mode === "supa" ? membersPro(t) : `' + s[a:b] + '`}' + s[b:]
s = sub(s, '<details class="card"><summary>Pengaturan tim</summary>',
        '<details class="card" id="set-det" ${S.openSet ? "open" : ""}><summary>Pengaturan tim</summary>')
s = sub(s, 't.members.forEach((m,i) => { m.name = $("#ts-m"+i).value.trim() || m.name; }); }); break;',
        't.members.forEach((m,i) => { const el = $("#ts-m"+i); if (el) m.name = el.value.trim() || m.name; delete S.drafts["ts-m"+i]; }); }); break;')

# 8. aksi + tampilan + init
s = sub(s, '  switch (a) {\n    case "switch-team":', '  if (proAct(a, b)) return;\n  switch (a) {\n    case "switch-team":')
s = sub(s, '/* ---------- Langganan data ---------- */', views + '/* ---------- Langganan data ---------- */')
s = sub(s, 'async function init(){\n  route();\n', 'async function init(){\n  route();\n  if (window.SIGMA_CFG && window.supabase) return initSupa();\n')

open(os.path.join(out_dir, 'index.html'), 'w', encoding='utf8').write(s)
for f in ('sigma-tim-content.js', 'sigma-tim-core.js'):
    shutil.copy(os.path.join(repo, 'apps', f), os.path.join(out_dir, f))
umd = os.path.join(here, 'node_modules/@supabase/supabase-js/dist/umd/supabase.js')
if os.path.exists(umd):  # jika tidak ada, sigma-pro/supabase.js yang lama dipertahankan
    shutil.copy(umd, os.path.join(out_dir, 'supabase.js'))
print('ok', len(s), 'byte ->', out_dir)
