export default async function handler(request, response) {
  if (request.method === 'OPTIONS') {
    response.setHeader('Allow', 'POST, OPTIONS');
    return response.status(204).end();
  }

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST, OPTIONS');
    return response.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;

  if (!webhookUrl) {
    return response.status(501).json({ ok: false, error: 'Google Sheet endpoint not configured' });
  }

  try {
    const payload = typeof request.body === 'string' ? request.body : JSON.stringify(request.body || {});
    const sheetResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: payload,
    });

    if (!sheetResponse.ok) {
      return response.status(502).json({ ok: false, error: 'Google Sheet rejected report' });
    }

    return response.status(200).json({ ok: true });
  } catch (error) {
    return response.status(500).json({ ok: false, error: error.message });
  }
}
