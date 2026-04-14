export const config = {
  api: {
    bodyParser: false
  }
};

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.end(JSON.stringify(payload));
}

function readRequestBuffer(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;

    req.on('data', chunk => {
      total += chunk.length;
      if (total > MAX_UPLOAD_BYTES) {
        reject(new Error('Image is too large. Please upload an image under 8MB.'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function getBoundary(contentType) {
  const match = String(contentType || '').match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  return match ? (match[1] || match[2]) : null;
}

function parseMultipart(buffer, boundary) {
  const body = buffer.toString('latin1');
  const parts = body.split(`--${boundary}`);
  const fields = {};
  const files = {};

  for (const part of parts) {
    const headerEnd = part.indexOf('\r\n\r\n');
    if (headerEnd === -1) continue;

    const headerText = part.slice(0, headerEnd);
    let value = part.slice(headerEnd + 4);
    value = value.replace(/\r\n$/, '');
    if (!value || value === '--') continue;

    const name = headerText.match(/name="([^"]+)"/i)?.[1];
    if (!name) continue;

    const filename = headerText.match(/filename="([^"]*)"/i)?.[1];
    const contentType = headerText.match(/Content-Type:\s*([^\r\n]+)/i)?.[1]?.trim();
    const valueBuffer = Buffer.from(value, 'latin1');

    if (filename) {
      files[name] = {
        filename,
        contentType: contentType || 'application/octet-stream',
        buffer: valueBuffer
      };
    } else {
      fields[name] = valueBuffer.toString('utf8').trim();
    }
  }

  return { fields, files };
}

function normalizeNutrition(raw) {
  const foodName = String(raw.foodName || raw.name || '').trim();
  return {
    foodName: foodName || 'Food not recognized',
    calories: Math.max(0, Math.round(Number(raw.calories) || 0)),
    protein: Math.max(0, Number(Number(raw.protein || 0).toFixed(1))),
    carbs: Math.max(0, Number(Number(raw.carbs || 0).toFixed(1))),
    fat: Math.max(0, Number(Number(raw.fat || 0).toFixed(1))),
    insight: raw.insight || raw.note || 'Nutrition estimate generated from the scanned image.',
    healthScore: Number(raw.healthScore) || null,
    recognized: raw.recognized !== false && Boolean(foodName)
  };
}

function extractJson(text) {
  const match = String(text || '').match(/\{[\s\S]*\}/);
  if (!match) throw new Error('AI response did not contain JSON.');
  return JSON.parse(match[0]);
}

async function analyzeWithClaude(image, weight) {
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    throw new Error('Missing ANTHROPIC_API_KEY on the server.');
  }

  const prompt = [
    'You are NutriTrack food vision. Identify the main food in this image and estimate nutrition for the provided serving weight.',
    `Serving weight: ${weight} grams.`,
    'Return only JSON with this exact shape:',
    '{"foodName":"string","calories":number,"protein":number,"carbs":number,"fat":number,"insight":"string","healthScore":number,"recognized":boolean}',
    'If the image is not clearly food, set recognized to false and use 0 for numeric nutrition values.'
  ].join('\n');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-latest',
      max_tokens: 700,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: image.contentType,
              data: image.buffer.toString('base64')
            }
          },
          { type: 'text', text: prompt }
        ]
      }]
    })
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload?.error?.message || 'Food analysis API failed.';
    throw new Error(message);
  }

  const text = payload?.content
    ?.map(part => part.type === 'text' ? part.text : '')
    .join('\n');

  return normalizeNutrition(extractJson(text));
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
    const boundary = getBoundary(req.headers['content-type']);
    if (!boundary) {
      sendJson(res, 400, { error: 'Expected multipart/form-data upload.' });
      return;
    }

    const body = await readRequestBuffer(req);
    const { fields, files } = parseMultipart(body, boundary);
    const image = files.image;
    const weight = Math.max(10, Math.min(2000, Number(fields.weight) || 100));

    if (!image?.buffer?.length) {
      sendJson(res, 400, { error: 'Image file is required.' });
      return;
    }

    if (!ALLOWED_TYPES.has(image.contentType)) {
      sendJson(res, 415, { error: 'Only JPG, PNG, and WEBP images are supported.' });
      return;
    }

    const result = await analyzeWithClaude(image, weight);
    sendJson(res, 200, result);
  } catch (error) {
    const message = error?.message || 'Scan failed, try again.';
    const status = message.includes('Missing ANTHROPIC') ? 500 : 502;
    sendJson(res, status, {
      error: message,
      recognized: false
    });
  }
}
