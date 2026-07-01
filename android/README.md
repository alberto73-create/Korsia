# Android Capacitor

Questa cartella è riservata al progetto Android generato da Capacitor.

Generazione prevista:

```bash
npm install
npm run build
npx cap add android
npx cap sync android
```

Nel container attuale `npm install` è bloccato da policy registry (HTTP 403 su `@capacitor/android`), quindi il progetto nativo non è stato generato automaticamente. Dopo l'installazione delle dipendenze, Capacitor popolerà questa cartella con il progetto Android.

Per la versione finale aggiungere qui un Foreground Service nativo con notifica persistente per mantenere GPS e avvisi affidabili a schermo spento.
