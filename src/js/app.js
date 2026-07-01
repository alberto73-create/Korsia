import '../css/styles.css';
import { GPSService } from './gps.js';
import {
  autoUpdateDemoPackage,
  getMeta,
  loadCameraPackage,
  updateDemoPackage,
} from './database.js';
import { loadSettings, saveSettings } from './settings.js';
import { AlertEngine, findRelevantCamera, formatDistance } from './alerts.js';
import { onNetworkChange, registerServiceWorker } from './offline.js';
import { addReport, clearReports, loadReports, removeReport, reportTypes, shareReportToGoogleSheet } from './reports.js';

const state = {
  screen: 'dashboard',
  moto: false,
  online: navigator.onLine,
  pos: null,
  cameras: [],
  pkg: null,
  meta: null,
  updateStatus: 'Pronto',
  settings: loadSettings(),
  next: null,
  reports: loadReports(),
};

const gps = new GPSService();
let engine = new AlertEngine(state.settings);

const $ = (selector) => document.querySelector(selector);
const kmh = () => Math.round(state.pos?.speed || 0);
const limit = () => state.next?.speedLimit || '—';

function render() {
  document.getElementById('app').innerHTML = `
    <div class="app ${batterySaverClass()}">
      <header class="topbar">
        <div class="brand brand-row">
          <img class="brand-logo" src="/assets/icon.svg" alt="Speed Guard logo"/>
          <div><h1>Speed Guard</h1>
          <p>Assistente offline per velocità e guida sicura.</p></div>
        </div>
        <div class="pill">${state.online ? 'Online' : 'Offline attivo'}</div>
      </header>
      <nav class="tabs">
        ${tab('dashboard', 'Dashboard')}
        ${tab('moto', 'Modalità guida')}
        ${tab('maps', 'Mappe')}
        ${tab('reports', 'Segnalazioni')}
        ${tab('settings', 'Avvisi')}
        ${tab('privacy', 'Privacy')}
      </nav>
      ${dashboard()}
      ${moto()}
      ${maps()}
      ${reports()}
      ${settings()}
      ${privacy()}
      <div class="footer-actions">
        <button class="primary" id="toggleMoto">${state.moto ? 'Ferma modalità guida' : 'Avvia modalità guida'}</button>
      </div>
    </div>`;

  bind();
}

function tab(id, label) {
  return `<button class="tab ${state.screen === id ? 'active' : ''}" data-screen="${id}">${label}</button>`;
}



function batterySaverClass() {
  if (!state.settings.batterySaver || !state.moto) return '';
  const distance = state.next?.distance;
  const shouldWake = distance != null && distance <= state.settings.wakeDistance;
  return shouldWake ? 'battery-awake' : 'battery-dim';
}

function batterySaverStatus() {
  if (!state.settings.batterySaver) return 'Risparmio batteria off';
  const distance = state.next?.distance;
  if (distance != null && distance <= state.settings.wakeDistance) return `Schermo attivo: evento entro ${formatDistance(distance)}`;
  return `Risparmio attivo fino a ${formatDistance(state.settings.wakeDistance)} dall'evento`;
}

function speedStatusClass() {
  const currentLimit = Number(limit());

  if (!currentLimit) return 'speed-ok';
  if (kmh() > currentLimit + state.settings.overspeedTolerance) return 'speed-danger';
  if (kmh() >= currentLimit - 5) return 'speed-warning';
  return 'speed-ok';
}

function limitBadge() {
  return `<div class="limit-badge ${speedStatusClass()}" aria-label="Limite ${limit()} chilometri orari"><span>${limit()}</span></div>`;
}

function quickReportButtons() {
  return reportTypes.slice(0, 4).map((type) => `<button class="secondary compact" data-quick-report="${type.id}">${type.label}</button>`).join('');
}

function dashboard() {
  return `
    <main class="screen ${state.screen === 'dashboard' ? 'active' : ''}">
      <section class="grid">
        <div class="card speed-card ${speedStatusClass()}">
          <div class="label">Velocità GPS</div>
          ${limitBadge()}
          <div class="speed">${kmh()}</div>
          <div class="unit">km/h</div>
        </div>
        <div class="card">
          <div class="label">Limite attuale</div>
          <div class="limit limit-sign ${speedStatusClass()}">${limit()}</div>
        </div>
        <div class="card">
          <div class="label">Database</div>
          <div class="value">${state.pkg?.lastUpdated ? `Aggiornato ${state.pkg.lastUpdated}` : 'Demo locale'}</div>
          <div class="muted">${state.cameras.length} controlli conosciuti</div>
          <div class="muted">Auto update: ${state.updateStatus}</div>
        </div>
        <div class="card span">
          <div class="label">Prossimo controllo</div>
          <div class="value">${state.next ? `${formatDistance(state.next.distance)} - ${state.next.roadName}` : 'Nessun controllo compatibile vicino'}</div>
          <div class="muted">Filtro anti falsi avvisi: posizione, direzione e angolo frontale.</div>
        </div>
      </section>
    </main>`;
}

function moto() {
  return `
    <main class="screen moto ${state.screen === 'moto' ? 'active' : ''}">
      <div class="card">
        <div class="label">Modalità guida</div>
        ${limitBadge()}
        <div class="speed ${speedStatusClass()}">${kmh()}</div>
        <div class="unit">km/h</div>
        <h2>Prossimo controllo: ${state.next ? formatDistance(state.next.distance) : '—'}</h2>
        <div class="status-row">
          <span class="pill">${state.settings.vibration ? 'Vibrazione attiva' : 'Vibrazione off'}</span>
          <span class="pill">${state.settings.voice ? 'Avvisi vocali attivi' : 'Voce off'}</span>
          <span class="pill">${state.moto ? 'Background attivo*' : 'In pausa'}</span>
          <span class="pill">${batterySaverStatus()}</span>
        </div>
        <div class="quick-report"><h3>Segnala rapido</h3>${quickReportButtons()}</div>
        <p class="muted">* In APK Android Capacitor: usare Foreground Service per GPS persistente a schermo spento.</p>
      </div>
    </main>`;
}

function maps() {
  return `
    <main class="screen ${state.screen === 'maps' ? 'active' : ''}">
      <div class="card">
        <h2>Mappe e download</h2>
        <p class="muted">Una sola vista mappa: online usa OpenStreetMap, offline usa il pacchetto locale già scaricato. Il download mappe resta nella lista aree sotto.</p>
        <a class="secondary download-apk" href="/downloads/speed-guard.apk" download>Scarica APK dal sito</a>
        <p class="muted">Se il file non esiste ancora, carica l'APK generato in <code>public/downloads/speed-guard.apk</code>.</p>
        ${mapDisplay()}
        <div class="list">
          ${['Italia demo', 'Francia', 'Svizzera', 'Austria', 'Europa'].map((name, index) => `
            <div class="download">
              <div>
                <b>${name}</b>
                <div class="muted">${index ? 'Non scaricato' : `Scaricato · ${state.pkg?.lastUpdated || 'demo'} · ${state.cameras.length} controlli`}</div>
              </div>
              <button class="secondary" ${index ? 'disabled' : ''} data-update-db="${index === 0 ? 'it-demo' : ''}">${index ? 'Prossimamente' : 'Aggiorna ora'}</button>
            </div>`).join('')}
        </div>
        <div class="card nested">
          <div class="label">Aggiornamenti automatici</div>
          <div class="value">Settimanali quando online</div>
          <div class="muted">Ultimo controllo: ${state.meta?.lastAutoCheckAt || 'non ancora eseguito'}</div>
          <div class="muted">Stato: ${state.updateStatus}</div>
        </div>
      </div>
    </main>`;
}



function mapDisplay() {
  return state.online ? realMap() : offlineMap();
}

function realMap() {
  const camera = state.next || state.cameras[0];

  if (!state.online || !camera) {
    return '<div class="card nested"><div class="label">Mappa vera</div><p class="muted">Offline: uso anteprima locale. La mappa OSM richiede internet; i pacchetti offline veri richiedono PMTiles/MBTiles in una fase successiva.</p></div>';
  }

  const lat = camera.latitude;
  const lon = camera.longitude;
  const delta = 0.025;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - delta}%2C${lat - delta}%2C${lon + delta}%2C${lat + delta}&layer=mapnik&marker=${lat}%2C${lon}`;

  return `
    <div class="real-map-wrap">
      <iframe class="real-map" title="Mappa OpenStreetMap" src="${src}" loading="lazy"></iframe>
      <p class="muted">Mappa gratuita OpenStreetMap online. Nessuna posizione utente viene inviata da Speed Guard; il riquadro carica tile OSM dal browser.</p>
    </div>`;
}


function offlineMap() {
  if (!state.cameras.length) {
    return '<div class="offline-map"><span class="muted">Nessun pacchetto offline disponibile.</span></div>';
  }

  const latitudes = state.cameras.map((camera) => camera.latitude);
  const longitudes = state.cameras.map((camera) => camera.longitude);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLon = Math.min(...longitudes);
  const maxLon = Math.max(...longitudes);
  const latRange = maxLat - minLat || 1;
  const lonRange = maxLon - minLon || 1;
  const toPoint = (camera) => ({
    x: 40 + ((camera.longitude - minLon) / lonRange) * 720,
    y: 300 - ((camera.latitude - minLat) / latRange) * 240,
  });
  const route = state.cameras.map(toPoint).map((point) => `${point.x},${point.y}`).join(' ');
  const markers = state.cameras.map((camera) => {
    const point = toPoint(camera);
    return `<g><circle cx="${point.x}" cy="${point.y}" r="24" class="offline-marker"/><text x="${point.x}" y="${point.y + 7}" text-anchor="middle" class="offline-marker-text">${camera.speedLimit}</text></g>`;
  }).join('');

  return `
    <div class="offline-map-wrap">
      <div class="label">Mappa offline locale</div>
      <svg class="offline-map" viewBox="0 0 800 340" role="img" aria-label="Mappa offline dei controlli scaricati">
        <rect width="800" height="340" rx="22" class="offline-map-bg"/>
        <path d="M40 280 C220 210 330 235 460 170 S620 82 760 56" class="offline-road secondary-road"/>
        <polyline points="${route}" class="offline-road"/>
        ${markers}
      </svg>
      <p class="muted">Questa vista usa il pacchetto locale scaricato e resta visibile senza rete. Per strade offline complete servono pacchetti PMTiles/MBTiles.</p>
    </div>`;
}

function mapPreview() {
  if (!state.cameras.length) {
    return '<div class="mini-map"><span class="muted">Nessun dato mappa disponibile.</span></div>';
  }

  const latitudes = state.cameras.map((camera) => camera.latitude);
  const longitudes = state.cameras.map((camera) => camera.longitude);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLon = Math.min(...longitudes);
  const maxLon = Math.max(...longitudes);
  const latRange = maxLat - minLat || 1;
  const lonRange = maxLon - minLon || 1;

  const points = state.cameras.map((camera) => {
    const x = 8 + ((camera.longitude - minLon) / lonRange) * 84;
    const y = 92 - ((camera.latitude - minLat) / latRange) * 84;

    return `<button class="map-point" style="left:${x}%;top:${y}%" title="${camera.roadName} - limite ${camera.speedLimit}">${camera.speedLimit}</button>`;
  }).join('');

  return `
    <div class="mini-map" aria-label="Mappa schematica controlli demo">
      <div class="map-grid"></div>
      <div class="map-road map-road-a"></div>
      <div class="map-road map-road-b"></div>
      <div class="map-road map-road-c"></div>
      ${points}
    </div>
    <div class="camera-list">
      ${state.cameras.map((camera) => `
        <div>
          <b>${camera.roadName}</b>
          <span class="muted">${camera.country} · limite ${camera.speedLimit} · direzione ${camera.direction}°</span>
        </div>`).join('')}
    </div>`;
}


function reports() {
  return `
    <main class="screen ${state.screen === 'reports' ? 'active' : ''}">
      <div class="card">
        <h2>Segnalazioni locali</h2>
        <p class="muted">Le segnalazioni nascono come promemoria locali. Se abiliti Google Sheet nelle impostazioni, puoi condividerle su un tuo foglio; non viene creata una rete live di pattuglie o controlli mobili.</p>
        <div class="report-actions">
          ${reportTypes.map((type) => `<button class="secondary" data-add-report="${type.id}">${type.label}</button>`).join('')}
        </div>
        <p class="muted">Nota legale: i controlli temporanei/mobili live non sono implementati. Usa questa sezione per sicurezza, lavori, code, pericoli e promemoria personali.</p>
        <div class="list">
          ${state.reports.length ? state.reports.map((report) => `
            <div class="download">
              <div>
                <b>${report.label}</b>
                <div class="muted">${formatReportPosition(report)} · ${new Date(report.createdAt).toLocaleString('it-IT')}</div>
              </div>
              <button class="secondary compact" data-remove-report="${report.id}">Elimina</button>
            </div>`).join('') : '<div class="muted">Nessuna segnalazione locale salvata.</div>'}
        </div>
        ${state.reports.length ? '<button class="secondary" id="clearReports">Cancella tutte</button>' : ''}
      </div>
    </main>`;
}

function formatReportPosition(report) {
  if (!report.latitude || !report.longitude) {
    return 'Posizione non disponibile';
  }

  return `${report.latitude.toFixed(5)}, ${report.longitude.toFixed(5)}`;
}

function settings() {
  return `
    <main class="screen ${state.screen === 'settings' ? 'active' : ''}">
      <div class="card">
        <h2>Impostazioni avvisi</h2>
        <p class="muted">Gli avvisi possono essere vocali, con vibrazione, combinati oppure completamente disattivati.</p>
        <button class="secondary" id="disableAlerts">Disattiva tutti gli avvisi</button>
        ${check('voice', 'Avvisi vocali')}
        ${check('vibration', 'Vibrazione')}
        <label class="toggle">Modalità
          <select id="alertMode">
            <option value="voice-vibration">Voce + vibrazione</option>
            <option value="voice">Solo voce</option>
            <option value="vibration">Solo vibrazione</option>
            <option value="off">Disattivato</option>
          </select>
        </label>
        ${range('firstDistance', 'Primo avviso', 500, 2000)}
        ${range('secondDistance', 'Secondo avviso', 250, 1000)}
        ${range('volume', 'Volume voce', 0, 1, 0.1)}
        ${range('overspeedTolerance', 'Soglia rosso oltre limite (km/h)', 1, 15, 1)}
        <label class="toggle">Risparmio batteria guida<input type="checkbox" id="batterySaver" ${state.settings.batterySaver ? 'checked' : ''}></label>
        ${range('wakeDistance', 'Riattiva schermo/UI prima evento (m)', 500, 5000, 250)}
        <label class="toggle">Condividi segnalazioni su Google Sheet privato<input type="checkbox" id="shareReports" ${state.settings.shareReports ? 'checked' : ''}></label>
        <p class="muted">Facile e non visibile a tutti: configura l'URL Google Sheet in Vercel come variabile server <code>GOOGLE_SHEET_WEBHOOK_URL</code>. Nell'app resta solo questo interruttore.</p>
      </div>
    </main>`;
}

function privacy() {
  return `
    <main class="screen ${state.screen === 'privacy' ? 'active' : ''}">
      <div class="card">
        <h2>Privacy e sicurezza</h2>
        <p>Nessun account richiesto. La posizione viene elaborata sul dispositivo per calcolare velocità e avvisi preventivi. Non viene inviata a server esterni.</p>
        <p>Il database è salvato offline; gli aggiornamenti scaricano solo pacchetti dati anonimi.</p>
        <p class="warn">Speed Guard aiuta la guida consapevole: rispetta sempre limiti e condizioni della strada.</p>
      </div>
    </main>`;
}

function check(key, label) {
  return `<label class="toggle">${label}<input type="checkbox" id="${key}" ${state.settings[key] ? 'checked' : ''}></label>`;
}

function range(key, label, min, max, step = 50) {
  return `<label>${label}: <b>${state.settings[key]}</b><input class="range" type="range" id="${key}" min="${min}" max="${max}" step="${step}" value="${state.settings[key]}"></label>`;
}

function bind() {
  document.querySelectorAll('[data-screen]').forEach((button) => {
    button.onclick = () => {
      state.screen = button.dataset.screen;
      render();
    };
  });

  $('#toggleMoto').onclick = toggleMoto;

  ['voice', 'vibration', 'shareReports', 'batterySaver'].forEach((key) => {
    const input = $(`#${key}`);
    if (input) input.onchange = () => updateSetting(key, input.checked);
  });

  ['firstDistance', 'secondDistance', 'volume', 'overspeedTolerance', 'wakeDistance'].forEach((key) => {
    const input = $(`#${key}`);
    if (input) input.oninput = () => updateSetting(key, Number(input.value));
  });

  const mode = $('#alertMode');
  if (mode) {
    mode.value = state.settings.alertMode;
    mode.onchange = () => updateSetting('alertMode', mode.value);
  }

  document.querySelectorAll('[data-add-report]').forEach((button) => {
    button.onclick = async () => saveLocalReport(button.dataset.addReport);
  });

  document.querySelectorAll('[data-quick-report]').forEach((button) => {
    button.onclick = async () => {
      const type = reportTypes.find((item) => item.id === button.dataset.quickReport);
      if (confirm(`Confermi segnalazione: ${type?.label || 'Segnalazione'}?`)) {
        await saveLocalReport(button.dataset.quickReport);
        alert('Segnalazione salvata.');
      }
    };
  });

  document.querySelectorAll('[data-remove-report]').forEach((button) => {
    button.onclick = () => {
      state.reports = removeReport(button.dataset.removeReport);
      render();
    };
  });

  const clearReportsButton = $('#clearReports');
  if (clearReportsButton) {
    clearReportsButton.onclick = () => {
      state.reports = clearReports();
      render();
    };
  }

  const disableAlertsButton = $('#disableAlerts');
  if (disableAlertsButton) {
    disableAlertsButton.onclick = () => updateSetting('alertMode', 'off');
  }

  document.querySelectorAll('[data-update-db]').forEach((button) => {
    button.onclick = async () => {
      state.updateStatus = 'Aggiornamento manuale in corso...';
      render();

      try {
        state.pkg = await updateDemoPackage();
        state.cameras = state.pkg.items;
        state.meta = await getMeta();
        state.updateStatus = 'Aggiornato manualmente';
      } catch (error) {
        state.updateStatus = `Errore aggiornamento: ${error.message}`;
      }

      render();
    };
  });
}


async function saveLocalReport(type) {
  const report = addReport(type, state.pos);
  state.reports = loadReports();

  try {
    await shareReportToGoogleSheet(report, state.settings);
  } catch (error) {
    console.warn('Condivisione Google Sheet non riuscita', error);
  }

  render();
}

function updateSetting(key, value) {
  state.settings[key] = value;
  saveSettings(state.settings);
  engine = new AlertEngine(state.settings);
  render();
}

function toggleMoto() {
  state.moto = !state.moto;
  state.screen = state.moto ? 'moto' : 'dashboard';

  if (state.moto) {
    gps.start();
  } else {
    gps.stop();
  }

  render();
}

async function refreshPackageFromAutoUpdate() {
  const result = await autoUpdateDemoPackage({ online: state.online });

  state.pkg = result.package;
  state.cameras = result.package.items;
  state.meta = await getMeta();

  if (result.status === 'updated') state.updateStatus = 'Aggiornato automaticamente';
  if (result.status === 'not-due') state.updateStatus = 'Già aggiornato questa settimana';
  if (result.status === 'offline') state.updateStatus = 'Offline, uso copia locale';
  if (result.status === 'failed') state.updateStatus = 'Aggiornamento fallito, uso copia locale';
}

gps.addEventListener('position', (event) => {
  state.pos = event.detail;
  state.next = findRelevantCamera(state.pos, state.cameras, state.settings);
  engine.process(state.pos, state.next);
  render();
});

gps.addEventListener('error', (event) => console.warn(event.detail));

onNetworkChange((online) => {
  state.online = online;
  render();
});

registerServiceWorker();
loadCameraPackage()
  .then(async (pkg) => {
    state.pkg = pkg;
    state.cameras = pkg.items;
    state.meta = await getMeta();
    render();
    await refreshPackageFromAutoUpdate();
    render();
  })
  .catch((error) => {
    state.updateStatus = `Errore database: ${error.message}`;
    render();
  });

render();
