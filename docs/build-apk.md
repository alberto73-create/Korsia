# Guida build e APK Android

## 1. Installare dipendenze

```bash
npm install
```

Servono anche Android Studio, Android SDK e JDK compatibile con Gradle/Android.

## 2. Avviare la web app

```bash
npm run dev
```

Aprire l'indirizzo mostrato da Vite. Il GPS reale richiede HTTPS o `localhost`; su telefono conviene usare build APK o tunnel HTTPS.

## 3. Testare GPS e avvisi

1. Aprire la Dashboard.
2. Premere **Avvia modalità guida**.
3. Concedere permesso posizione.
4. Se il browser non espone il GPS, `gps.js` usa un percorso demo vicino al controllo `SS 42`.
5. Verificare distanza prossimo controllo, voce e vibrazione.

## 4. Generare progetto Android Capacitor

```bash
npm run build
npx cap add android
npx cap sync android
```

Il comando crea la cartella `android/` se non esiste. Aprirla con Android Studio per configurare firma, permessi e servizi nativi.

## 5. Generare APK debug

```bash
npm run apk:debug
```

APK atteso: `android/app/build/outputs/apk/debug/app-debug.apk`.

## 5.1 Installare APK su Android

1. Trasferire l'APK sul telefono via USB, cloud o download dal sito. Per abilitarlo dal sito, copiare l'APK in `public/downloads/speed-guard.apk` e redeployare.
2. Toccare il file `.apk`.
3. Se Android lo richiede, abilitare **Installa app sconosciute** per il browser o file manager usato.
4. Completare l'installazione.
5. Aprire Speed Guard e concedere il permesso posizione.
6. Per test a schermo spento usare una build Capacitor con Foreground Service nativo: una PWA semplice può essere sospesa da Android.

## 6. Aggiornare database demo

Il database demo è in `public/data/cameras-it-demo.json`. Per modificarlo, aggiornare i record e incrementare `lastUpdated`. Ogni record deve avere `id`, coordinate, `roadName`, `direction`, `speedLimit`, `country`, `source` e `lastUpdated`. Poi eseguire:

```bash
npm run build
npx cap sync android
```

Nell'app, la schermata **Mappe e download** permette di ricaricare il pacchetto demo in IndexedDB. Il flusso produzione previsto è descritto in `docs/database-updates.md`: manifest pacchetti, download area, validazione checksum, salvataggio atomico e mantenimento dell'ultima copia valida in caso di errore.

## 7. Mancante per versione finale

- Foreground Service Android nativo per GPS affidabile a schermo spento.
- Notifica persistente Android e canale notifiche.
- Ottimizzazioni batteria basate su velocità e stato fermo/in movimento.
- Pacchetti dati reali verificati e processo di aggiornamento firmato.
- Map matching offline per ridurre ulteriormente falsi avvisi.
- Test su strada e revisione legale/UX per presentazione come assistente sicurezza.
