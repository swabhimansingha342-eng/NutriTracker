import { DetectLabelsCommand, RekognitionClient } from '@aws-sdk/client-rekognition';
import { GoogleAuth } from 'google-auth-library';

export const config = {
  api: {
    bodyParser: false
  }
};

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const FOOD_KEYWORDS = [
  'food', 'meal', 'dish', 'chicken', 'rice', 'salad', 'bread', 'roti', 'egg', 'eggs',
  'banana', 'apple', 'toast', 'avocado', 'salmon', 'paneer', 'dal', 'lentil', 'tofu',
  'oatmeal', 'porridge', 'quinoa', 'almond', 'potato', 'curd', 'yogurt', 'vegetable',
  'fruit', 'pasta', 'noodle', 'soup', 'curry', 'sandwich', 'pizza', 'burger'
];
const LOCAL_FOODS = [
  { name: 'Grilled Chicken', emoji: '🍗', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: 'Avocado Toast', emoji: '🥑', calories: 295, protein: 8, carbs: 35, fat: 15 },
  { name: 'Greek Salad', emoji: '🥗', calories: 180, protein: 6, carbs: 14, fat: 12 },
  { name: 'Brown Rice', emoji: '🍚', calories: 215, protein: 5, carbs: 45, fat: 1.8 },
  { name: 'Salmon Fillet', emoji: '🐟', calories: 208, protein: 28, carbs: 0, fat: 10 },
  { name: 'Banana', emoji: '🍌', calories: 89, protein: 1, carbs: 23, fat: 0.3 },
  { name: 'Scrambled Eggs', emoji: '🍳', calories: 148, protein: 10, carbs: 1, fat: 11 },
  { name: 'Oatmeal', emoji: '🥣', calories: 158, protein: 6, carbs: 27, fat: 3.2 },
  { name: 'Mixed Berries', emoji: '🫐', calories: 57, protein: 0.7, carbs: 13, fat: 0.3 },
  { name: 'Quinoa Bowl', emoji: '🥙', calories: 222, protein: 8, carbs: 39, fat: 3.5 },
  { name: 'Almonds', emoji: '🥜', calories: 164, protein: 6, carbs: 6, fat: 14 },
  { name: 'Sweet Potato', emoji: '🍠', calories: 103, protein: 2, carbs: 24, fat: 0.1 },
  { name: 'Paneer Tikka', emoji: '🧀', calories: 265, protein: 18, carbs: 9, fat: 18 },
  { name: 'Dal Tadka', emoji: '🍲', calories: 198, protein: 12, carbs: 28, fat: 5 },
  { name: 'Roti', emoji: '🫓', calories: 120, protein: 4, carbs: 22, fat: 3 },
  { name: 'Curd Bowl', emoji: '🥛', calories: 98, protein: 5, carbs: 7, fat: 5 },
  { name: 'Tofu Stir Fry', emoji: '🥬', calories: 240, protein: 20, carbs: 18, fat: 11 },
  { name: 'Apple', emoji: '🍎', calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
  { name: 'Whey Shake', emoji: '🥤', calories: 130, protein: 25, carbs: 4, fat: 2 },
  { name: 'Vegetable Poha', emoji: '🍛', calories: 250, protein: 7, carbs: 46, fat: 6 }
];
const DUMMY_SCAN_FOODS = [
  {
    foodName: 'Chicken Biryani',
    emoji: '🍛',
    calories: 292,
    protein: 13.4,
    carbs: 31.8,
    fat: 12.6,
    insight: 'Demo scan result: aromatic rice with chicken, spices, and moderate fat. Values are estimated per 100g.'
  },
  {
    foodName: 'Grilled Chicken',
    emoji: '🍗',
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    insight: 'Demo scan result: lean high-protein chicken. Values are estimated per 100g.'
  },
  {
    foodName: 'Fish Curry',
    emoji: '🐟',
    calories: 142,
    protein: 18.5,
    carbs: 4.8,
    fat: 5.4,
    insight: 'Demo scan result: fish in a light curry base. Values are estimated per 100g.'
  },
  {
    foodName: 'Paneer Tikka',
    emoji: '🧀',
    calories: 265,
    protein: 18,
    carbs: 9,
    fat: 18,
    insight: 'Demo scan result: paneer with spices, higher in protein and fat. Values are estimated per 100g.'
  },
  {
    foodName: 'Dal Rice',
    emoji: '🍚',
    calories: 173,
    protein: 6.4,
    carbs: 31.2,
    fat: 2.8,
    insight: 'Demo scan result: lentils with rice, balanced carbs and plant protein. Values are estimated per 100g.'
  }
];

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
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
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
    emoji: raw.emoji || '🍽️',
    calories: Math.max(0, Math.round(Number(raw.calories) || 0)),
    protein: Math.max(0, Number(Number(raw.protein || 0).toFixed(1))),
    carbs: Math.max(0, Number(Number(raw.carbs || 0).toFixed(1))),
    fat: Math.max(0, Number(Number(raw.fat || 0).toFixed(1))),
    insight: raw.insight || raw.note || 'Nutrition estimate generated from the scanned image.',
    healthScore: Number(raw.healthScore) || null,
    recognized: raw.recognized !== false && Boolean(foodName),
    source: raw.source || 'vision'
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

async function analyzeWithGemini(image, weight) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY on the server.');
  }

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const prompt = [
    'Identify the main food in this image and estimate nutrition for the provided serving weight.',
    `Serving weight: ${weight} grams.`,
    'Return only JSON with this exact shape:',
    '{"foodName":"string","calories":number,"protein":number,"carbs":number,"fat":number,"insight":"string","healthScore":number,"recognized":boolean}',
    'If the image is not clearly food, set recognized to false and use 0 for numeric nutrition values.'
  ].join('\n');

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-goog-api-key': apiKey
    },
    body: JSON.stringify({
      contents: [{
        role: 'user',
        parts: [
          {
            inline_data: {
              mime_type: image.contentType,
              data: image.buffer.toString('base64')
            }
          },
          { text: prompt }
        ]
      }]
    })
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Gemini API failed.');
  }

  const text = payload?.candidates?.[0]?.content?.parts
    ?.map(part => part.text || '')
    .join('\n');

  return normalizeNutrition({
    ...extractJson(text),
    source: 'gemini'
  });
}

function getGoogleServiceAccountConfig() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
  }
}

async function analyzeWithVertexGemini(image, weight) {
  const credentials = getGoogleServiceAccountConfig();
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || credentials?.project_id;
  const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
  const model = process.env.VERTEX_GEMINI_MODEL || 'gemini-2.5-flash';

  if (!credentials || !projectId) {
    throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_CLOUD_PROJECT_ID on the server.');
  }

  const auth = new GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
  const token = typeof accessToken === 'string' ? accessToken : accessToken?.token;
  if (!token) throw new Error('Could not create Google service account access token.');

  const prompt = [
    'Identify the main food in this image and estimate nutrition for the provided serving weight.',
    `Serving weight: ${weight} grams.`,
    'Return only JSON with this exact shape:',
    '{"foodName":"string","calories":number,"protein":number,"carbs":number,"fat":number,"insight":"string","healthScore":number,"recognized":boolean}',
    'If the image is not clearly food, set recognized to false and use 0 for numeric nutrition values.'
  ].join('\n');

  const host = location === 'global' ? 'aiplatform.googleapis.com' : `${location}-aiplatform.googleapis.com`;
  const response = await fetch(`https://${host}/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:generateContent`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: image.contentType,
              data: image.buffer.toString('base64')
            }
          },
          { text: prompt }
        ]
      }]
    })
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Vertex Gemini API failed.');
  }

  const text = payload?.candidates?.[0]?.content?.parts
    ?.map(part => part.text || '')
    .join('\n');

  return normalizeNutrition({
    ...extractJson(text),
    source: 'vertex-gemini'
  });
}

function cleanName(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function findLocalFood(name = '') {
  const normalized = cleanName(name);
  if (!normalized) return null;
  return LOCAL_FOODS.find(food => {
    const foodName = cleanName(food.name);
    return foodName === normalized || foodName.includes(normalized) || normalized.includes(foodName);
  }) || null;
}

function estimateFromLocalFood(food, weight, source = 'selected-food hint') {
  const factor = Math.max(10, Math.min(2000, Number(weight) || 100)) / 100;
  return normalizeNutrition({
    ...food,
    calories: food.calories * factor,
    protein: food.protein * factor,
    carbs: food.carbs * factor,
    fat: food.fat * factor,
    insight: `Estimated from ${source}. Add a vision API key for automatic image recognition.`,
    recognized: true,
    source
  });
}

function getDummyScanResult(index, weight) {
  const safeIndex = Math.max(0, Number(index) || 0) % DUMMY_SCAN_FOODS.length;
  const food = DUMMY_SCAN_FOODS[safeIndex];
  const factor = Math.max(10, Math.min(2000, Number(weight) || 100)) / 100;
  return normalizeNutrition({
    ...food,
    calories: food.calories * factor,
    protein: food.protein * factor,
    carbs: food.carbs * factor,
    fat: food.fat * factor,
    recognized: true,
    source: 'dummy-scan',
    dummyIndex: safeIndex
  });
}

function pickFoodLabel(labels = []) {
  const candidates = labels
    .map(label => String(label.description || label.name || '').trim())
    .filter(Boolean);

  return candidates.find(label => {
    const normalized = cleanName(label);
    return FOOD_KEYWORDS.some(keyword => normalized.includes(keyword));
  }) || candidates[0] || '';
}

async function getUsdaNutrition(foodName, weight) {
  const apiKeys = [process.env.USDA_API_KEY, 'DEMO_KEY'].filter(Boolean);
  if (!foodName) return null;

  for (const apiKey of apiKeys) {
    const url = new URL('https://api.nal.usda.gov/fdc/v1/foods/search');
    url.searchParams.set('api_key', apiKey);
    url.searchParams.set('query', foodName);
    url.searchParams.set('pageSize', '1');

    const response = await fetch(url);
    if (!response.ok) continue;

    const payload = await response.json().catch(() => null);
    const food = payload?.foods?.[0];
    if (!food) continue;

    const nutrients = food.foodNutrients || [];
    const findNutrient = (...names) => {
      const item = nutrients.find(nutrient => {
        const name = cleanName(nutrient.nutrientName || nutrient.nutrient?.name || '');
        return names.some(target => name.includes(cleanName(target)));
      });
      return Number(item?.value ?? item?.amount) || 0;
    };
    const factor = Math.max(10, Math.min(2000, Number(weight) || 100)) / 100;

    return normalizeNutrition({
      foodName: food.description || foodName,
      calories: findNutrient('energy') * factor,
      protein: findNutrient('protein') * factor,
      carbs: findNutrient('carbohydrate') * factor,
      fat: findNutrient('total lipid', 'fat') * factor,
      insight: 'Food identified by Google Vision and nutrition fetched from USDA FoodData Central.',
      recognized: true,
      source: 'google-vision-usda'
    });
  }

  return null;
}

async function analyzeWithGoogleVision(image, weight) {
  const apiKey = process.env.GOOGLE_VISION_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GOOGLE_VISION_API_KEY on the server.');
  }

  const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      requests: [{
        image: { content: image.buffer.toString('base64') },
        features: [{ type: 'LABEL_DETECTION', maxResults: 10 }]
      }]
    })
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Google Vision API failed.');
  }

  const labels = payload?.responses?.[0]?.labelAnnotations || [];
  const label = pickFoodLabel(labels);
  if (!label) {
    throw new Error('Food not recognized clearly.');
  }

  const usda = await getUsdaNutrition(label, weight);
  if (usda) return usda;

  const localFood = findLocalFood(label);
  if (localFood) {
    return estimateFromLocalFood(localFood, weight, 'Google Vision label match');
  }

  return normalizeNutrition({
    foodName: label,
    insight: 'Food label identified by Google Vision. Add USDA_API_KEY for nutrition lookup.',
    recognized: true,
    source: 'google-vision'
  });
}

async function analyzeWithAwsRekognition(image, weight) {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error('Missing AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY on the server.');
  }

  const client = new RekognitionClient({
    region: process.env.AWS_REGION || 'us-east-1'
  });

  const payload = await client.send(new DetectLabelsCommand({
    Image: { Bytes: image.buffer },
    MaxLabels: 10,
    MinConfidence: 65
  }));

  const label = pickFoodLabel(payload.Labels || []);
  if (!label) {
    throw new Error('Food not recognized clearly.');
  }

  const usda = await getUsdaNutrition(label, weight);
  if (usda) {
    return {
      ...usda,
      insight: 'Food identified by Amazon Rekognition and nutrition fetched from USDA FoodData Central.',
      source: 'aws-rekognition-usda'
    };
  }

  const localFood = findLocalFood(label);
  if (localFood) {
    return estimateFromLocalFood(localFood, weight, 'Amazon Rekognition label match');
  }

  return normalizeNutrition({
    foodName: label,
    insight: 'Food label identified by Amazon Rekognition. USDA did not return a nutrition match.',
    recognized: true,
    source: 'aws-rekognition'
  });
}

async function analyzeFood(image, weight, hint, dummyIndex) {
  const localHint = findLocalFood(hint);
  const errors = [];

  if (process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY) {
    try {
      return await analyzeWithClaude(image, weight);
    } catch (error) {
      errors.push(`Claude: ${error.message}`);
    }
  }

  if (process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    try {
      return await analyzeWithGemini(image, weight);
    } catch (error) {
      errors.push(`Gemini: ${error.message}`);
    }
  }

  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    try {
      return await analyzeWithVertexGemini(image, weight);
    } catch (error) {
      errors.push(`Vertex Gemini: ${error.message}`);
    }
  }

  if (process.env.GOOGLE_VISION_API_KEY) {
    try {
      return await analyzeWithGoogleVision(image, weight);
    } catch (error) {
      errors.push(`Google Vision: ${error.message}`);
    }
  }

  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    try {
      return await analyzeWithAwsRekognition(image, weight);
    } catch (error) {
      errors.push(`Amazon Rekognition: ${error.message}`);
    }
  }

  if (dummyIndex !== undefined && dummyIndex !== null && dummyIndex !== '') {
    return getDummyScanResult(dummyIndex, weight);
  }

  if (localHint) {
    const usda = await getUsdaNutrition(localHint.name, weight);
    if (usda) {
      return {
        ...usda,
        foodName: localHint.name,
        emoji: localHint.emoji,
        insight: 'Nutrition fetched from USDA FoodData Central using the selected food hint. Add a vision API key for automatic image recognition.',
        source: 'selected-food-usda'
      };
    }
    return estimateFromLocalFood(localHint, weight);
  }

  return getDummyScanResult(0, weight);
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
    const hint = fields.hint || '';
    const dummyIndex = fields.dummyIndex;

    if (!image?.buffer?.length) {
      sendJson(res, 400, { error: 'Image file is required.' });
      return;
    }

    if (!ALLOWED_TYPES.has(image.contentType)) {
      sendJson(res, 415, { error: 'Only JPG, PNG, and WEBP images are supported.' });
      return;
    }

    const result = await analyzeFood(image, weight, hint, dummyIndex);
    sendJson(res, 200, result);
  } catch (error) {
    const message = error?.message || 'Scan failed, try again.';
    const status = message.includes('Scanner needs') || message.includes('Missing ') ? 503 : 502;
    sendJson(res, status, {
      error: message,
      recognized: false
    });
  }
}
