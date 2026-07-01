const DB='speed-guard-db',STORE='packages',KEY='it-demo';
function openDb(){return new Promise((res,rej)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore(STORE);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
async function put(key,val){const db=await openDb();return new Promise((res,rej)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(val,key);tx.oncomplete=res;tx.onerror=()=>rej(tx.error)})}
async function get(key){const db=await openDb();return new Promise((res,rej)=>{const r=db.transaction(STORE).objectStore(STORE).get(key);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
export async function loadCameraPackage(){let pkg=await get(KEY);if(pkg)return pkg;const r=await fetch('/src/data/cameras-it-demo.json');pkg=await r.json();await put(KEY,pkg);return pkg}
export async function updateDemoPackage(){const r=await fetch('/src/data/cameras-it-demo.json',{cache:'no-store'});if(!r.ok)throw new Error('Download non riuscito');const pkg=await r.json();pkg.downloadedAt=new Date().toISOString();await put(KEY,pkg);return pkg}
export async function getMeta(){const p=await loadCameraPackage();return{label:p.package,lastUpdated:p.lastUpdated,count:p.items.length,downloadedAt:p.downloadedAt}}
