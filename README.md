# Speed Guard

**Speed Guard** è un MVP di web app/PWA offline-first pensata per motociclisti e automobilisti. L'obiettivo è offrire un assistente leggero per velocità, limiti e avvisi preventivi su controlli fissi mappati, senza diventare un navigatore completo.

> Posizionamento del prodotto: **assistente alla guida e al rispetto dei limiti**, non app per eludere controlli.

## Funzionalità incluse nell'MVP

- Dashboard ad alto contrasto con velocità GPS, limite stimato, stato online/offline e prossimo controllo compatibile.
- Modalità moto con UI minimale, caratteri molto grandi, vibrazione e avvisi vocali.
- Database demo Italia salvato localmente in IndexedDB.
- Funzionamento offline tramite Service Worker e cache degli asset principali.
- Logica base per ridurre falsi avvisi usando distanza, direzione di marcia, bearing e direzione del controllo.
- Schermata **Mappe e download** con Italia demo e aree future.
- Impostazioni per voce, vibrazione, volume e distanze di avviso.
- Configurazione pronta per Capacitor Android.

## Avvio rapido

```bash
npm install
npm run dev
```

Poi aprire l'URL mostrato da Vite. Per GPS reale in browser serve `localhost` o HTTPS. Su smartphone Android il test migliore è tramite APK Capacitor.

> Nota ambiente: in alcuni container o reti aziendali `npm install` può essere bloccato da policy registry. In quel caso installare le dipendenze in un ambiente con accesso a npm o registry mirror autorizzato.

## Build web

```bash
npm run build
npm run preview
```

## Build Android/APK con Capacitor

```bash
npm run build
npx cap add android
npx cap sync android
npm run apk:debug
```

L'APK debug viene generato normalmente in:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

La cartella `android/` è predisposta per il progetto Capacitor; dopo `npx cap add android` verrà popolata con il progetto nativo.

## Come funziona il database autovelox/controlli

Nel MVP i dati sono dimostrativi e vivono in:

```text
src/data/cameras-it-demo.json
```

Ogni elemento contiene almeno:

- `id`: identificativo stabile;
- `type`: tipo controllo, es. `speed_camera`;
- `latitude` / `longitude`: coordinate;
- `roadName`: strada o area;
- `direction`: direzione prevista in gradi;
- `speedLimit`: limite associato;
- `country`: paese;
- `source`: origine del pacchetto;
- `lastUpdated`: data aggiornamento record.

All'avvio `src/js/database.js` carica il JSON demo, lo salva in IndexedDB e lo riusa anche offline. La schermata **Mappe e download** permette di forzare il ricaricamento del pacchetto demo locale.

## Aggiornamenti database e mappe: flusso previsto

### MVP attuale

1. L'app prova a caricare il pacchetto locale demo Italia.
2. Se IndexedDB contiene già una versione, usa quella per garantire continuità offline.
3. Se l'utente preme **Aggiorna database**, l'app rilegge il pacchetto demo e aggiorna IndexedDB.
4. Se il download/lettura fallisce, resta valida l'ultima copia locale funzionante.

### Evoluzione produzione

Per dati reali si consiglia un sistema a pacchetti statici versionati:

```text
/data/packages/index.json
/data/packages/it/speed-cameras-v2026-07-01.json
/data/packages/fr/speed-cameras-v2026-07-01.json
/data/packages/ch/speed-cameras-v2026-07-01.json
```

`index.json` dovrebbe contenere metadati scaricabili senza inviare posizione utente:

```json
{
  "version": "2026-07-01",
  "packages": [
    {
      "id": "it",
      "label": "Italia",
      "url": "/data/packages/it/speed-cameras-v2026-07-01.json",
      "sizeBytes": 2500000,
      "lastUpdated": "2026-07-01",
      "checksum": "sha256-demo"
    }
  ]
}
```

Flusso consigliato:

1. una volta a settimana, se online, scaricare solo `index.json`;
2. confrontare `version`, `lastUpdated` e `checksum` con i metadati locali;
3. proporre o avviare download del pacchetto selezionato dall'utente;
4. validare JSON e checksum prima di sovrascrivere IndexedDB;
5. salvare il nuovo pacchetto in una transazione;
6. mantenere sempre l'ultima versione valida se il download fallisce;
7. non inviare mai coordinate, account o telemetria obbligatoria.

## Come funziona la logica avvisi

Quando arriva una posizione GPS:

1. l'app calcola velocità e heading;
2. confronta i controlli nel raggio massimo configurato;
3. scarta quelli dietro l'utente o con direzione incompatibile;
4. seleziona il controllo più vicino compatibile;
5. genera avvisi progressivi a distanza configurabile;
6. genera un avviso separato se la velocità supera il limite noto con tolleranza.

Questa logica è volutamente semplice per l'MVP. La versione finale dovrebbe aggiungere map matching offline su dati OpenStreetMap per distinguere meglio strade parallele, rampe e carreggiate opposte.

## Struttura progetto

```text
src/
  css/styles.css
  js/app.js
  js/gps.js
  js/alerts.js
  js/database.js
  js/settings.js
  js/speech.js
  js/vibration.js
  js/offline.js
  data/cameras-it-demo.json
  manifest.json
service-worker.js
capacitor.config.json
android/
docs/
```

## Privacy

Speed Guard elabora la posizione localmente sul dispositivo. Non richiede account e non invia la posizione a server esterni. Internet serve solo per aggiornamenti app o pacchetti dati statici.

## Limiti noti dell'MVP

- GPS in background affidabile a schermo spento richiede Foreground Service Android nativo.
- Il database è demo, non dati reali certificati.
- La logica anti falsi avvisi non sostituisce il map matching.
- La build APK richiede ambiente Android completo e dipendenze npm installabili.
