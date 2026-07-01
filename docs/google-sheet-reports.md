# Segnalazioni condivise con Google Sheet

Le segnalazioni restano locali per impostazione predefinita. Se vuoi aiutare altri utenti in modo semplice e gratuito puoi collegare un Google Sheet tramite Google Apps Script.

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
6. Copia l'URL `/exec` in Speed Guard > Avvisi > URL Web App Google Sheet.
7. Abilita **Condividi segnalazioni su Google Sheet**.

## Limiti

Con `mode: no-cors` il browser può inviare il dato ma non leggere una risposta dettagliata. Per una versione produzione conviene creare un piccolo backend o un endpoint con CORS configurato, moderazione e protezione anti-spam.
