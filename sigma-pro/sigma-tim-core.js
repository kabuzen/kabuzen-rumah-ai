/* Fungsi bersama: konjugasi, hari kerja, penanda kata hafalan, suara */
(function(){
const ET = window.ET;
const first = s => String(s).split("/")[0].trim();
ET.first = first;

ET.verb = i => {
  const v = ET.VERBS[i];
  return {i, b:v[0], p:v[1], pp:v[2], m:v[3], c:v[4], s:v[5]||"She", stat:!!v[6], set:Math.floor(i/5)+1};
};
ET.setVerbs = n => [0,1,2,3,4].map(j => ET.verb((n-1)*5+j)).filter(v => v.i < ET.VERBS.length);

const third = b => {
  const sp = {have:"has", do:"does", go:"goes", be:"is", undergo:"undergoes"};
  if (sp[b]) return sp[b];
  if (/(s|sh|ch|x|z|o)$/.test(b)) return b + "es";
  if (/[^aeiou]y$/.test(b)) return b.slice(0,-1) + "ies";
  return b + "s";
};
const DOUBLE = new Set(["run","swim","begin","forget","sit","get","put","cut","hit","let","set","shut","win","dig","spin","quit","split","bet","upset","forbid","bid"]);
const ing = b => {
  if (/ie$/.test(b)) return b.slice(0,-2) + "ying";
  if (DOUBLE.has(b)) return b + b.slice(-1) + "ing";
  if (b === "be" || b === "see" || b === "flee" || b === "foresee") return b + "ing";
  if (/[^aeiou]e$/.test(b) || /[aiou]e$/.test(b) && !/(ee|oe|ye)$/.test(b)) return b.slice(0,-1) + "ing";
  return b + "ing";
};
ET.third = third; ET.ing = ing;

const AUX = {
  pcont:["is","",  "ing"], pperf:["has","","pp"], ppc:["has","been","ing"],
  pastc:["was","","ing"], pastp:["had","","pp"], pastpc:["had","been","ing"],
  sfut:["will","","b"], fcont:["will","be","ing"], fperf:["will","have","pp"], fpc:["will","have been","ing"],
  pfut:["would","","b"], pfutc:["would","be","ing"], pfutp:["would","have","pp"], pfutpc:["would","have been","ing"]
};
const low = s => /^(I )/.test(s) ? s : s[0].toLowerCase() + s.slice(1);
const join = a => a.filter(Boolean).join(" ").replace(/\s+/g," ").trim();
/* type: "+", "-", "?" */
ET.conj = (v, tk, type="+") => {
  const T = ET.TENSES.find(t => t.k === tk);
  if (!T) return "";
  if (T.cont && v.stat) return null;
  const S = v.s, c = v.c, m = T.m, b = first(v.b);
  let out;
  if (tk === "spres") {
    out = type === "+" ? join([S, third(b), c, m]) : type === "-" ? join([S, "does not", b, c, m]) : join(["Does", low(S), b, c, m]) + "?";
  } else if (tk === "spast") {
    out = type === "+" ? join([S, first(v.p), c, m]) : type === "-" ? join([S, "did not", b, c, m]) : join(["Did", low(S), b, c, m]) + "?";
  } else {
    const [a, rest, f] = AUX[tk];
    const vf = f === "ing" ? ing(b) : f === "pp" ? first(v.pp) : b;
    out = type === "+" ? join([S, a, rest, vf, c, m]) : type === "-" ? join([S, a, "not", rest, vf, c, m]) : join([a[0].toUpperCase()+a.slice(1), low(S), rest, vf, c, m]) + "?";
  }
  return type === "?" ? out : out + ".";
};

/* Cek jawaban dengan alternatif "learnt/learned" */
ET.norm = s => String(s||"").toLowerCase().replace(/[^a-z\/ ]/g,"").trim();
ET.ok = (ans, key) => {
  const a = ET.norm(ans); if (!a) return false;
  const opts = key.split("/").map(x => x.trim().toLowerCase());
  return a.split("/").map(x=>x.trim()).every(x => opts.includes(x));
};

/* Tanggal & hari kerja (zona waktu perangkat) */
const pad = n => String(n).padStart(2,"0");
ET.iso = d => d.getFullYear() + "-" + pad(d.getMonth()+1) + "-" + pad(d.getDate());
ET.parse = s => { const [y,m,d] = s.split("-").map(Number); return new Date(y, m-1, d); };
ET.today = () => ET.iso(new Date());
ET.isWork = (s, hol) => { const d = ET.parse(s).getDay(); return d !== 0 && d !== 6 && !(hol && hol[s]); };
ET.workdays = (start, hol, n=180) => {
  const out = []; const d = ET.parse(start); let guard = 0;
  while (out.length < n && guard++ < 1000) { const s = ET.iso(d); if (ET.isWork(s, hol)) out.push(s); d.setDate(d.getDate()+1); }
  return out;
};
/* posisi program: {before, done, idx, stage, day, date} */
ET.position = (start, hol, today=ET.today()) => {
  const list = ET.workdays(start, hol);
  if (today < list[0]) return {before:true, idx:0, stage:1, day:1, list};
  let idx = 0; for (let i=0;i<list.length;i++) if (list[i] <= today) idx = i;
  if (today > list[list.length-1]) return {done:true, idx:179, stage:6, day:30, list};
  return {idx, stage:Math.floor(idx/30)+1, day:idx%30+1, list, isWork:list[idx]===today};
};
const BULAN = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
const HARI = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
ET.fmt = (s, withDay) => { if (!s) return ""; const d = ET.parse(s); return (withDay ? HARI[d.getDay()] + ", " : "") + d.getDate() + " " + BULAN[d.getMonth()] + " " + d.getFullYear(); };
ET.fmtShort = s => { const d = ET.parse(s); return d.getDate() + " " + BULAN[d.getMonth()]; };

/* Kata target tahap 3–4: dua set per hari, berputar melalui 30 set */
ET.targetSets = day => [((2*day-2) % 30) + 1, ((2*day-1) % 30) + 1];

/* Penanda kata hafalan dalam teks */
let FORMS = null;
const AMBIG = new Set(["has","have","had","do","does","did","left","light","lights","ground","wound","bound","rose","saw","spring","bear","lie","lies","lay","wind","fly","flies","fell","ring","stick","sink","mean","set","sets","lead","show","shows","cost","costs","fall","run","draw","swing","hide","bit","cast","beat","rise","tear","felt","fed"]);
const buildForms = () => {
  FORMS = new Map();
  ET.VERBS.forEach((v, i) => {
    const b = v[0]; const add = (f) => f.split("/").forEach(x => { x = x.trim().toLowerCase(); if (x && !FORMS.has(x)) FORMS.set(x, i); });
    add(v[1]); add(v[2]); add(b); add(third(b)); add(ing(b));
  });
};
ET.esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
ET.scan = text => {
  if (!FORMS) buildForms();
  const used = new Set(); let html = "";
  String(text||"").split(/(\b[A-Za-z']+\b)/).forEach(tok => {
    const k = tok.toLowerCase();
    if (/^[a-z']+$/i.test(tok) && k.length > 1 && FORMS.has(k) && !AMBIG.has(k)) {
      const i = FORMS.get(k); used.add(i);
      html += '<mark class="vk" title="' + ET.esc(ET.VERBS[i][0] + " – " + ET.VERBS[i][1] + " – " + ET.VERBS[i][2]) + '">' + ET.esc(tok) + "</mark>";
    } else html += ET.esc(tok);
  });
  return {html: html.replace(/\n/g,"<br>"), used:[...used]};
};
ET.words = t => (String(t||"").trim().match(/\b[\w'-]+\b/g) || []).length;

/* Suara (Text-to-Speech peramban) */
ET.canSpeak = typeof window !== "undefined" && "speechSynthesis" in window;
ET.say = (t, rate=0.9) => {
  if (!ET.canSpeak) return;
  try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = "en-US"; u.rate = rate; speechSynthesis.speak(u); } catch(e) {}
};
ET.shuffle = a => { a = a.slice(); for (let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
})();
