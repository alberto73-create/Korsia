export async function registerServiceWorker(){if('serviceWorker'in navigator){try{return await navigator.serviceWorker.register('/service-worker.js')}catch(e){console.warn('Service worker non registrato',e)}}}
export function onNetworkChange(cb){const fire=()=>cb(navigator.onLine);window.addEventListener('online',fire);window.addEventListener('offline',fire);fire()}
