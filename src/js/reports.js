const KEY = 'speed-guard-local-reports';

export const reportTypes = [
  { id: 'roadworks', label: 'Lavori stradali', voice: 'Possibili lavori stradali più avanti.' },
  { id: 'fixed_camera', label: 'Controllo fisso', voice: 'Controllo velocità fisso segnalato.' },
  { id: 'queue', label: 'Possibile coda', voice: 'Possibile rallentamento più avanti.' },
  { id: 'hazard', label: 'Pericolo strada', voice: 'Possibile pericolo sulla strada.' },
  { id: 'other', label: 'Altro promemoria', voice: 'Promemoria di guida più avanti.' },
];

export function loadReports() {
  return JSON.parse(localStorage.getItem(KEY) || '[]');
}

export function saveReports(reports) {
  localStorage.setItem(KEY, JSON.stringify(reports));
  return reports;
}

export function addReport(type, position) {
  const knownType = reportTypes.find((item) => item.id === type) || reportTypes[reportTypes.length - 1];
  const reports = loadReports();
  const report = {
    id: `local-${Date.now()}`,
    type: knownType.id,
    label: knownType.label,
    latitude: position?.latitude || null,
    longitude: position?.longitude || null,
    heading: position?.heading || null,
    createdAt: new Date().toISOString(),
    source: 'local-only',
  };

  reports.unshift(report);
  saveReports(reports.slice(0, 100));

  return report;
}

export function removeReport(id) {
  return saveReports(loadReports().filter((report) => report.id !== id));
}

export function clearReports() {
  return saveReports([]);
}

export async function shareReportToGoogleSheet(report, settings = {}) {
  if (!settings.shareReports) {
    return { skipped: true };
  }

  const endpoint = settings.reportEndpoint || '/api/report';
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      app: 'Speed Guard',
      kind: 'local_report',
      report,
    }),
  });

  if (!response.ok) {
    throw new Error('Endpoint segnalazioni non configurato');
  }

  return { sent: true };
}
