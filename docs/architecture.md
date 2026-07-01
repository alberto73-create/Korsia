# Speed Guard - architettura MVP

Speed Guard è una PWA offline-first convertibile in APK Android con Capacitor. L'MVP evita navigazione turn-by-turn, account e funzioni social: il cuore è velocità GPS, limite stimato dal controllo compatibile, avvisi preventivi, database locale e interfaccia ad alta leggibilità.

## Moduli

- `src/js/app.js`: stato applicazione, rendering schermate, avvio/stop modalità moto.
- `src/js/gps.js`: wrapper GPS reale via Geolocation API e fallback demo per ambienti senza sensore.
- `src/js/alerts.js`: selezione del controllo compatibile e soglie avvisi.
- `src/js/database.js`: persistenza IndexedDB e caricamento pacchetto demo Italia.
- `src/js/settings.js`: preferenze locali per voce, vibrazione, distanze e filtri.
- `src/js/speech.js`: Text-to-Speech browser/WebView.
- `src/js/vibration.js`: vibrazione con Vibration API.
- `public/service-worker.js`: cache offline degli asset e del database demo.

## Logica anti falsi avvisi MVP

Per ogni controllo vicino l'app calcola:

1. distanza GPS;
2. bearing dalla posizione utente al controllo;
3. differenza tra direzione di marcia e bearing;
4. differenza tra direzione di marcia e direzione censita del controllo.

Viene selezionato solo un controllo entro raggio massimo, davanti all'utente ed entro tolleranza di direzione. In futuro questo punto va sostituito o integrato con map matching su OpenStreetMap/GraphHopper/Valhalla offline.

## Android e schermo spento

La PWA da sola non garantisce GPS continuo a schermo spento. La versione APK deve integrare Capacitor e un Foreground Service Android con notifica persistente "Speed Guard attivo". I plugin Capacitor già previsti coprono base app, geolocalizzazione, notifiche locali e haptics; per produzione va aggiunto o scritto un plugin nativo per il servizio foreground.

## Privacy

La posizione non viene inviata a server esterni. È usata localmente per velocità, prossimità e avvisi. Gli aggiornamenti database devono scaricare pacchetti statici anonimi e mantenere l'ultima copia valida in IndexedDB.

## Aggiornamenti database e gestione mappe

La gestione dati è separata dall'interfaccia e vive in `src/js/database.js`. Nell'MVP il pacchetto Italia demo viene caricato da `public/data/cameras-it-demo.json` e copiato in IndexedDB. Questo permette all'app di riaprire l'ultima versione disponibile anche senza internet.

La schermata **Mappe e download** rappresenta le aree scaricabili. Oggi abilita solo Italia demo; Francia, Svizzera, Austria ed Europa sono segnaposto per pacchetti futuri. Il comportamento previsto per la produzione è documentato in `docs/database-updates.md` e prevede:

1. manifest remoto leggero con elenco pacchetti e checksum;
2. download solo dell'area scelta o già installata;
3. validazione schema/checksum;
4. salvataggio atomico in IndexedDB;
5. mantenimento dell'ultima versione valida se l'aggiornamento fallisce;
6. controllo automatico massimo settimanale quando l'app è online e non è in modalità moto.


## Segnalazioni e traffico offline

Le segnalazioni dell'MVP sono locali e privacy-first: vengono salvate nel browser/WebView con `localStorage` e non sono inviate a server esterni. Le categorie supportate sono lavori stradali, controllo fisso, possibile coda, pericolo strada e altro promemoria.

Una funzione di traffico live completamente offline non è tecnicamente realistica: le code cambiano in tempo reale e richiedono dati aggiornati. Per una versione gratuita e legale si possono valutare solo:

1. open data ufficiali scaricabili;
2. dati storici/statici per zone critiche;
3. rilevamento locale di rallentamento usando solo la velocità GPS del dispositivo;
4. segnalazioni personali non condivise.

Sono escluse dal design MVP segnalazioni live di pattuglie o controlli mobili condivisi tra utenti.


## Mappe vere e offline

L'MVP ora usa OpenStreetMap come mappa vera gratuita quando il dispositivo è online. Per consultazione offline viene fornito un pacchetto demo GeoJSON scaricabile. Una mappa offline completa, con strade vere e zoom fluidi, richiede un formato tile offline come PMTiles/MBTiles e una libreria dedicata: è fattibile, ma va gestito come step successivo perché i pacchetti regionali possono diventare pesanti.

## Endpoint privato segnalazioni

La condivisione Google Sheet passa da `/api/report`, una funzione Vercel server-side. L'URL Apps Script resta in `GOOGLE_SHEET_WEBHOOK_URL` e non viene mostrato nell'interfaccia utente.
