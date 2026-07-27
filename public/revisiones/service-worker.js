const CACHE='diagnostico-quio-18.1-cloud-v1';
const ASSETS=['./','./index.html','./styles.css?v=18.0.4','./decision-engine.js?v=18.0.4','./script.js?v=18.0.4','./supabase-config.js?v=18.1.0','./sync.js?v=18.1.0','./manifest.webmanifest','./assets/icons/favicon.svg'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;event.respondWith(fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response}).catch(()=>caches.match(event.request).then(hit=>hit||caches.match('./index.html'))));});
