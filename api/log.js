function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.end(JSON.stringify(payload));
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks).toString('utf8');
  return body ? JSON.parse(body) : {};
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    const entry = await readJson(req);
    if (!entry?.foodName || !Number.isFinite(Number(entry.calories))) {
      sendJson(res, 400, { error: 'A valid scanned food entry is required.' });
      return;
    }

    sendJson(res, 200, {
      success: true,
      entry: {
        ...entry,
        loggedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    sendJson(res, 400, { error: 'Invalid log payload.' });
  }
}
