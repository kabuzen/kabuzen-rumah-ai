/* Service worker KABUZEN CEGAH TUBRUKAN DI LAUT. Hanya menangani berkas aplikasi ini; aplikasi lain di /apps/ tidak disentuh. */
const VERSI="p2tl-web-v1.0", NAMA="kabuzen-cegah-tubrukan";
const BERKAS=["./"+NAMA,"./"+NAMA+".webmanifest","./"+NAMA+"-192.png","./"+NAMA+"-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(VERSI).then(c=>c.addAll(BERKAS)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith("p2tl-web-")&&x!==VERSI).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{const u=new URL(e.request.url);if(e.request.method!=="GET"||u.origin!==location.origin||!u.pathname.includes(NAMA))return;
 e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request).then(x=>{if(x.ok){const k=x.clone();caches.open(VERSI).then(c=>c.put(e.request,k))}return x}).catch(()=>caches.match("./"+NAMA))))});
