# Deploy sito/PWA su Vercel

Vercel non è obbligatorio per usare Speed Guard come APK Android, ma è utile per pubblicare:

- demo web/PWA installabile da browser;
- landing page del progetto;
- pagina download APK quando sarà disponibile;
- pacchetti database statici aggiornabili dall'app.

## Quando serve Vercel

Usa Vercel se vuoi far aprire l'app o la pagina informativa da un link HTTPS pubblico. HTTPS è importante perché il GPS browser funziona solo su contesti sicuri (`https://` o `localhost`).

Non basta invece per garantire GPS a schermo spento su Android: per quello serve comunque APK Capacitor con Foreground Service nativo.

## Configurazione inclusa

Il file `vercel.json` imposta:

- framework Vite;
- comando build `npm run build`;
- directory output `dist`;
- header no-cache per `/service-worker.js`, così gli aggiornamenti PWA arrivano più rapidamente;
- content type corretto per `manifest.json`;
- cache breve per i dati demo in `/data/*`;
- rewrite verso `index.html` per funzionamento SPA/PWA.

## Deploy da dashboard Vercel

1. Creare un progetto su Vercel collegando il repository Git.
2. Framework preset: **Vite**.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Install command: `npm install`.
6. Deploy.

## Deploy da CLI

```bash
npm install
npm run build
npx vercel
```

Per produzione:

```bash
npx vercel --prod
```

## Variabili ambiente

L'MVP non richiede variabili ambiente. Quando verranno aggiunti pacchetti remoti reali, si potrà introdurre ad esempio:

```text
VITE_PACKAGE_INDEX_URL=https://example.org/data/packages/index.json
```

## Download APK dal sito

Quando sarà disponibile un APK, il sito Vercel può ospitare una pagina download o un link a un file statico. Per una distribuzione semplice:

1. creare una cartella `public/downloads/`;
2. inserire `speed-guard-debug.apk` o una release firmata;
3. aggiungere nel README o nella UI un link a `/downloads/speed-guard.apk`.

Per produzione è preferibile pubblicare APK firmati, versionati e accompagnati da checksum.

## Aggiornamenti database tramite Vercel

Vercel può ospitare file statici per il database controlli:

```text
public/data/packages/index.json
public/data/packages/it.json
public/data/packages/fr.json
```

L'app scaricherà solo il manifest e i pacchetti scelti dall'utente, senza inviare la posizione. Il comportamento completo è descritto in `docs/database-updates.md`.

## Checklist prima del deploy

- `npm install` completato senza errori.
- `npm run build` completato.
- PWA aperta su URL HTTPS Vercel.
- Verifica in browser: Service Worker registrato.
- Test su Android: permesso posizione e lettura GPS.
- Verifica che il testo del sito presenti Speed Guard come assistente sicurezza/rispetto limiti.
