const CACHE='speed-guard-v1';
const ASSETS=['/','/index.html','/manifest.json','/src/css/styles.css','/src/js/app.js','/src/js/gps.js','/src/js/alerts.js','/src/js/database.js','/src/js/settings.js','/src/js/speech.js','/src/js/vibration.js','/src/js/offline.js','/src/data/cameras-it-demo.json','/src/assets/icon.svg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match('/index.html'))))});
