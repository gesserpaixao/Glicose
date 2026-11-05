const CACHE='controlglicose-v3';
const CORE=['./','index.html','manifest.webmanifest','firebase-config.js','icon-192.png','icon-512.png','apple-touch-icon.png','pdf-lib.min.js'];
const EXT=['fonts.googleapis.com','fonts.gstatic.com','www.gstatic.com'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.all(CORE.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  if(u.origin===location.origin){
    // arquivos do próprio app: tenta a rede primeiro (pega atualizações) e cai para o cache sem internet
    e.respondWith(fetch(e.request).then(r=>{if(r&&r.ok){const c=r.clone();caches.open(CACHE).then(ch=>ch.put(e.request,c))}return r})
      .catch(()=>caches.match(e.request,{ignoreSearch:true}).then(h=>h||(e.request.mode==='navigate'?caches.match('index.html'):Response.error()))));
  }else if(EXT.includes(u.hostname)){
    // fontes e biblioteca do Firebase: cache primeiro
    e.respondWith(caches.open(CACHE).then(async c=>{
      const hit=await c.match(e.request);
      const net=fetch(e.request).then(r=>{if(r&&(r.ok||r.type==='opaque'))c.put(e.request,r.clone());return r}).catch(()=>null);
      return hit||net||Response.error();
    }));
  }
});
