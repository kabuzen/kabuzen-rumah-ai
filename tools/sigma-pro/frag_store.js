/* ---------- Penyimpanan: Supabase (versi berlisensi) ---------- */
let sb = null, CFG = null, pollT = null;
const lower = s => String(s || "").trim().toLowerCase();
const sbErr = e => {
  const c = e && e.code, m = (e && e.message) || "";
  if (/lisensi/i.test(m)) return m;
  if (c === "42501" || /row-level security/i.test(m)) return "Tidak diizinkan. Lisensi tim mungkin tidak berlaku, atau Anda tidak berhak mengubah data ini.";
  if (c === "23505") return "Data itu sudah ada. Email mungkin sudah terdaftar di tim lain.";
  if (/fetch|network/i.test(m)) return "Koneksi terputus. Periksa internet lalu coba lagi.";
  return m || "Gagal menyimpan. Coba lagi.";
};
function supaStore(){
  let teamCb = null, ver = 0, teams = {}, lastSig = null;
  const subs = {logs:{}, debates:{}}, cache = {logs:{}, debates:{}}, since = {}, known = {}, queue = {};
  const ok = r => { if (r.error) throw r.error; return r.data; };
  const chain = (key, fn) => { const p = (queue[key] || Promise.resolve()).then(fn, fn); queue[key] = p.catch(() => {}); return p; };
  const rowToLog = r => {
    const o = Object.assign({}, r.data || {}, {k:r.member_key, s:r.stage, d:r.day});
    if (r.status) o.status = r.status; else delete o.status;
    if (r.review) o.review = r.review; else delete o.review;
    return o;
  };
  const emit = (kind, tid) => { const f = subs[kind][tid]; if (f) f(Object.assign({}, cache[kind][tid] || {})); };
  async function loadTeams(){
    const v = ver;
    const [ts, inv, cd, lc] = await Promise.all([
      sb.from("teams").select("*"),
      sb.from("invites").select("email,name,role,team_id,member_key,user_id,joined_at"),
      sb.from("invite_codes").select("email,code"),
      sb.from("licenses").select("*").order("created_at", {ascending:false})]);
    let sum = []; if (S.owner) { try { sum = ok(await sb.rpc("ringkasan_tim")) || []; } catch (e) {} }
    if (v !== ver) return;
    ok(ts); const iv = ok(inv);
    const o = {};
    ts.data.forEach(t => {
      const mine = iv.filter(i => i.team_id === t.id);
      const koor = mine.find(i => i.member_key === "koor");
      o[t.id] = { name:t.name, start:t.start, created:Date.parse(t.created_at), holidays:t.holidays || {},
        coord:{ name:t.coord_name, email:lower(t.coord_email), uid:(koor && koor.user_id) || null },
        members:[1,2,3,4,5].map(n => { const i = mine.find(x => x.member_key === "m" + n);
          return i ? {k:"m"+n, name:i.name || i.email, email:i.email, uid:i.user_id || null}
                   : {k:"m"+n, name:"Anggota " + n, email:"", uid:null}; }) };
    });
    const codes = {}; (cd.data || []).forEach(c => { codes[c.email] = c.code; });
    const sig = JSON.stringify([o, codes, lc.data || [], iv, sum]);
    teams = o; S.codes = codes; S.lics = lc.data || []; S.invites = iv; S.sum = sum;
    if (sig !== lastSig || !S.teamsLoaded) { lastSig = sig; if (teamCb) teamCb(clone(o)); }
  }
  async function loadLogs(tid, full){
    if (full || !cache.logs[tid]) { cache.logs[tid] = {}; since[tid] = null; }
    let from = 0, changed = !!full, max = since[tid];
    for (;;) {
      let q = sb.from("logs").select("*").eq("team_id", tid).order("updated_at").range(from, from + 999);
      if (since[tid]) q = q.gte("updated_at", since[tid]);
      const rows = ok(await q);
      rows.forEach(r => {
        const id = logId(r.member_key, r.stage, r.day), o = rowToLog(r);
        if (JSON.stringify(cache.logs[tid][id]) !== JSON.stringify(o)) { cache.logs[tid][id] = o; changed = true; }
        if (!max || Date.parse(r.updated_at) > Date.parse(max)) max = r.updated_at;
      });
      if (rows.length < 1000) break;
      from += 1000;
    }
    since[tid] = max;
    if (changed) emit("logs", tid);
  }
  async function loadDebates(tid){
    const v = ver;
    const rows = ok(await sb.from("debates").select("id,data").eq("team_id", tid));
    if (v !== ver) return;
    const o = {}; rows.forEach(r => { o[r.id] = r.data || {}; });
    known[tid] = new Set(rows.map(r => r.id));
    if (JSON.stringify(o) !== JSON.stringify(cache.debates[tid] || null)) { cache.debates[tid] = o; emit("debates", tid); }
  }
  return {
    onTeams(cb){ teamCb = cb; loadTeams().catch(e => toast(sbErr(e))); return () => {}; },
    onLogs(tid, cb){ subs.logs[tid] = cb; loadLogs(tid, true).catch(e => toast(sbErr(e))); return () => { delete subs.logs[tid]; }; },
    onDebates(tid, cb){ subs.debates[tid] = cb; loadDebates(tid).catch(() => {}); return () => { delete subs.debates[tid]; }; },
    async setTeam(tid, o){
      ver++;
      if (!teams[tid]) {
        ok(await sb.from("teams").insert({id:tid, name:o.name, start:o.start, holidays:o.holidays || {}, coord_email:S.email, coord_name:o.coord.name}));
      } else {
        ok(await sb.from("teams").update({name:o.name, start:o.start, holidays:o.holidays || {}, coord_name:o.coord.name}).eq("id", tid));
        for (const m of (o.members || [])) {
          const old = (teams[tid].members || []).find(x => x.k === m.k);
          if (m.email && old && old.name !== m.name) ok(await sb.from("invites").update({name:m.name}).eq("email", m.email));
        }
      }
      await loadTeams();
    },
    setLog(tid, id, o){
      ver++;
      (cache.logs[tid] = cache.logs[tid] || {})[id] = clone(o);
      return chain("l:" + tid + ":" + id, async () => {
        const data = clone(o); delete data.status; delete data.review;
        const row = { team_id:tid, member_key:o.k, stage:o.s, day:o.d, data,
          status:["diterima","ulang","menunggu"].includes(o.status) ? o.status : "menunggu", review:o.review || null };
        const r = ok(await sb.from("logs").upsert(row, {onConflict:"team_id,member_key,stage,day"}).select().single());
        cache.logs[tid][id] = rowToLog(r); emit("logs", tid);
      });
    },
    setDebate(tid, id, o){
      ver++;
      (cache.debates[tid] = cache.debates[tid] || {})[id] = clone(o);
      return chain("d:" + id, async () => {
        const has = known[tid] && known[tid].has(id);
        (known[tid] = known[tid] || new Set()).add(id);
        try {
          if (has) ok(await sb.from("debates").update({data:o, updated_at:new Date().toISOString()}).eq("id", id));
          else ok(await sb.from("debates").insert({id, team_id:tid, data:o}));
        } catch (e) { if (!has) known[tid].delete(id); throw e; }
      });
    },
    delDebate(tid, id){
      ver++;
      if (cache.debates[tid]) delete cache.debates[tid][id];
      return chain("d:" + id, async () => { ok(await sb.from("debates").delete().eq("id", id)); if (known[tid]) known[tid].delete(id); });
    },
    async addMember(tid, k, name, email){ ver++; ok(await sb.from("invites").insert({email, role:"anggota", name, team_id:tid, member_key:k})); await loadTeams(); },
    async delMember(email){ ver++; ok(await sb.from("invites").delete().eq("email", email)); await loadTeams(); },
    async issue(email, nama, wa, harga){ ver++; const code = ok(await sb.rpc("terbitkan_lisensi", {p_email:email, p_nama:nama, p_wa:wa || null, p_harga:harga})); await loadTeams(); return code; },
    async extend(id){ ver++; ok(await sb.rpc("perpanjang_lisensi", {p_id:id, p_bulan:12})); await loadTeams(); },
    async setRevoked(id, on){ ver++; ok(await sb.from("licenses").update({revoked_at:on ? new Date().toISOString() : null}).eq("id", id)); await loadTeams(); },
    poll(tid){
      loadTeams().catch(() => {});
      if (tid && subs.logs[tid]) loadLogs(tid).catch(() => {});
      if (tid && subs.debates[tid]) loadDebates(tid).catch(() => {});
    }
  };
}
