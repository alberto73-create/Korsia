# Aggiornamenti database autovelox e mappe

Questo documento descrive il comportamento attuale dell'MVP e il flusso consigliato per arrivare a pacchetti reali aggiornabili offline-first.

## Stato MVP

- Pacchetto disponibile: **Italia demo**.
- File sorgente: `public/data/cameras-it-demo.json`.
- Persistenza locale: IndexedDB, database `speed-guard-db`, object store `packages`.
- Aggiornamento manuale: pulsante **Aggiorna ora** nella schermata **Mappe e download**.
- Aggiornamento automatico: controllo massimo settimanale quando l'app è online.
- Fallback offline: se l'app ha già salvato un pacchetto valido, continua a usare quello anche senza internet.
- Visualizzazione: mappa schematica offline e lista controlli nella schermata **Mappe e download**.

## Schema record controllo

```json
{
  "id": "unique_id",
  "type": "speed_camera",
  "latitude": 43.123456,
  "longitude": 11.123456,
  "roadName": "SS 42",
  "direction": 35,
  "speedLimit": 90,
  "country": "IT",
  "source": "osm",
  "lastUpdated": "2026-07-01"
}
```

## Schema pacchetto area

```json
{
  "country": "IT",
  "package": "Italia",
  "version": "2026-07-01",
  "lastUpdated": "2026-07-01",
  "items": []
}
```

## Manifest pacchetti consigliato

In produzione l'app dovrebbe leggere un manifest leggero, senza inviare posizione utente:

```json
{
  "schemaVersion": 1,
  "generatedAt": "2026-07-01T00:00:00Z",
  "packages": [
    {
      "id": "it",
      "label": "Italia",
      "url": "https://example.org/speed-guard/packages/it.json",
      "sizeBytes": 2500000,
      "lastUpdated": "2026-07-01",
      "checksumSha256": "..."
    }
  ]
}
```

## Flusso aggiornamento manuale

1. L'utente apre **Mappe e download**.
2. L'app mostra stato scaricato/non scaricato, dimensione pacchetto e ultimo aggiornamento.
3. L'utente preme **Aggiorna database**.
4. L'app verifica connettività.
5. Scarica il pacchetto selezionato.
6. Valida schema e checksum.
7. Salva in IndexedDB in una transazione.
8. Aggiorna metadati UI.
9. Se qualcosa fallisce, conserva il pacchetto precedente.

## Flusso aggiornamento automatico settimanale

1. Salvare in IndexedDB `lastAutoCheckAt`.
2. All'avvio, se online e sono passati almeno 7 giorni, scaricare solo il manifest.
3. Se esiste una versione più recente dell'area già scaricata, scaricare il pacchetto in background quando l'utente non è in modalità moto.
4. Validare e salvare atomicamente.
5. Mostrare in UI: `Aggiornato oggi`, `Aggiornato 3 giorni fa` o `Aggiornamento disponibile`.

## Mappe vs database controlli

Nel MVP non ci sono mappe complete: ci sono solo pacchetti di controlli fissi. La voce **Mappe e download** è pensata per evolvere in gestione aree:

- Italia;
- Francia;
- Svizzera;
- Austria;
- Europa.

Per la versione finale si possono aggiungere due livelli separati:

1. **Database controlli**: leggero, aggiornabile spesso.
2. **Dati stradali/map matching**: più pesanti, aggiornabili meno spesso, usati solo per capire la strada reale e ridurre falsi avvisi.

## Requisiti privacy

- Nessun upload della posizione.
- Nessun account obbligatorio.
- Download pacchetti statici anonimi.
- Nessuna telemetria obbligatoria.
- Possibilità di usare l'ultima copia scaricata anche completamente offline.
