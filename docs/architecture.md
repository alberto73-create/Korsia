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
- `service-worker.js`: cache offline degli asset e del database demo.

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
