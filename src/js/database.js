const DB = 'speed-guard-db';
const STORE = 'packages';
const KEY = 'it-demo';
const META_KEY = 'it-demo-meta';
const DEMO_PACKAGE_URL = '/data/cameras-it-demo.json';
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function put(key, value) {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(value, key);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

async function get(key) {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE).objectStore(STORE).get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function fetchDemoPackage() {
  const response = await fetch(DEMO_PACKAGE_URL, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error('Download database non riuscito');
  }

  const pkg = await response.json();

  if (!Array.isArray(pkg.items)) {
    throw new Error('Formato database non valido');
  }

  return {
    ...pkg,
    downloadedAt: new Date().toISOString(),
  };
}

async function savePackage(pkg, extraMeta = {}) {
  const currentMeta = (await get(META_KEY)) || {};
  const meta = {
    ...currentMeta,
    ...extraMeta,
    packageKey: KEY,
    lastUpdated: pkg.lastUpdated,
    downloadedAt: pkg.downloadedAt,
    itemCount: pkg.items.length,
  };

  await put(KEY, pkg);
  await put(META_KEY, meta);

  return pkg;
}

export async function loadCameraPackage() {
  const localPackage = await get(KEY);

  if (localPackage) {
    return localPackage;
  }

  const response = await fetch(DEMO_PACKAGE_URL);
  const pkg = await response.json();

  return savePackage({
    ...pkg,
    downloadedAt: pkg.downloadedAt || new Date().toISOString(),
  });
}

export async function updateDemoPackage() {
  const pkg = await fetchDemoPackage();
  return savePackage(pkg, { lastManualUpdateAt: new Date().toISOString() });
}

export async function autoUpdateDemoPackage({ online = navigator.onLine, force = false } = {}) {
  const meta = (await get(META_KEY)) || {};
  const now = Date.now();
  const lastCheck = meta.lastAutoCheckAt ? Date.parse(meta.lastAutoCheckAt) : 0;
  const due = force || !lastCheck || now - lastCheck >= WEEK_MS;

  if (!online) {
    return { status: 'offline', updated: false, package: await loadCameraPackage() };
  }

  if (!due) {
    return { status: 'not-due', updated: false, package: await loadCameraPackage(), meta };
  }

  try {
    const pkg = await fetchDemoPackage();
    await savePackage(pkg, {
      lastAutoCheckAt: new Date().toISOString(),
      lastAutoUpdateAt: new Date().toISOString(),
      lastAutoUpdateError: null,
    });

    return { status: 'updated', updated: true, package: pkg };
  } catch (error) {
    await put(META_KEY, {
      ...meta,
      lastAutoCheckAt: new Date().toISOString(),
      lastAutoUpdateError: error.message,
    });

    return { status: 'failed', updated: false, package: await loadCameraPackage(), error };
  }
}

export async function getMeta() {
  const pkg = await loadCameraPackage();
  const meta = (await get(META_KEY)) || {};

  return {
    ...meta,
    label: pkg.package,
    lastUpdated: pkg.lastUpdated,
    count: pkg.items.length,
    downloadedAt: pkg.downloadedAt,
  };
}
