# Segnalazioni condivise con Google Sheet privato

Le segnalazioni restano locali per impostazione predefinita. Se vuoi aiutare altri utenti in modo semplice, puoi collegare un Google Sheet tramite una API Vercel server-side inclusa nel progetto.

## Perché così è più privato

L'URL del Google Apps Script **non viene scritto nel codice frontend** e non appare nelle impostazioni dell'app. L'app invia a `/api/report`; la funzione server legge `GOOGLE_SHEET_WEBHOOK_URL` dalle variabili ambiente Vercel.

## Principio legale/privacy

- Condividere solo informazioni utili alla sicurezza: lavori, pericolo strada, coda, controllo fisso noto.
- Non creare una rete live di pattuglie o controlli mobili.
- Non inviare account o dati personali.
- La posizione viene inviata solo se l'utente abilita esplicitamente la condivisione.

## Script Apps Script di esempio

1. Crea un Google Sheet.
2. Apri **Estensioni > Apps Script**.
3. Inserisci:

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const body = JSON.parse(e.postData.contents || '{}');
  const report = body.report || {};

  sheet.appendRow([
    new Date(),
    report.type || '',
    report.label || '',
    report.latitude || '',
    report.longitude || '',
    report.heading || '',
    report.source || '',
  ]);

  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

4. Pubblica come **Web app**.
5. Accesso: **Chiunque abbia il link**.
6. Copia l'URL `/exec`.
7. In Vercel vai su **Project Settings > Environment Variables**.
8. Aggiungi `GOOGLE_SHEET_WEBHOOK_URL` con l'URL copiato.
9. Redeploy.
10. In Speed Guard abilita **Condividi segnalazioni su Google Sheet privato**.

## Limiti

Questa soluzione è semplice e raggiungibile, ma per produzione servono moderazione, anti-spam e controllo qualità dati. L'endpoint `/api/report` tiene nascosto l'URL del foglio agli utenti dell'app, ma chi può modificare il progetto Vercel può vedere la variabile ambiente.
