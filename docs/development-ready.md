# Checklist develop, web e APK

Questa checklist serve per capire se Speed Guard è pronto per un branch/ambiente `develop` e per test su smartphone.

## Web/PWA smartphone

- Layout responsive sotto 640 px.
- Supporto safe-area per notch e barre Android/iOS browser.
- Pulsanti con altezza minima touch-friendly.
- Tab orizzontali scrollabili senza scrollbar visibile.
- Pulsante principale fisso sopra la safe-area inferiore.
- Mappa online OpenStreetMap quando c'è rete.
- Mappa offline locale quando non c'è rete.
- Service Worker con cache di app shell, database demo e GeoJSON demo.

## APK Android Capacitor

Per APK reale servono ancora i passaggi nativi:

1. `npm install` in ambiente con registry npm accessibile.
2. `npm run build`.
3. `npx cap add android` se la cartella Android nativa non esiste.
4. `npx cap sync android`.
5. Aprire `android/` in Android Studio.
6. Configurare permessi posizione e Foreground Service.
7. Generare APK debug o release firmata.

## Test manuali consigliati su telefono

1. Aprire la PWA da URL HTTPS Vercel.
2. Installare la PWA dalla UI browser.
3. Aprire Dashboard e verificare layout verticale.
4. Avviare **Modalità guida** e concedere posizione.
5. Spegnere rete e verificare apertura app, database e mappa offline locale.
6. Provare segnalazione rapida e verifica lista segnalazioni.
7. Provare impostazioni avvisi e risparmio batteria UI.
8. Se disponibile APK, installarlo e ripetere gli stessi test.

## Non ancora completo per produzione

- Foreground Service Android nativo per GPS affidabile a schermo spento.
- Controllo luminosità/schermo reale tramite plugin nativo.
- Pacchetti mappe offline completi PMTiles/MBTiles.
- Firma APK release.
- Test su strada e revisione legale/UX finale.
