const https = require('https');

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const payload = event.body || '{}';

    // Forward to n8n test webhook
    const n8nWebhookUrl = 'https://n8n.reclad.site/webhook-test/c82b79e7-a7f4-4527-a0a5-f126d29a93cb';

    const response = await makeRequest(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload).toString(),
        'Accept': 'application/json, image/*,application/octet-stream'
      },
      body: payload
    });

    return {
      statusCode: response.statusCode,
      headers: { ...corsHeaders(), 'Content-Type': response.headers['content-type'] || 'application/json' },
      body: response.body
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error', message: error.message })
    };
  }
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
}

function makeRequest(url, options) {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: 300000
    };

    const req = https.request(url, requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, headers: res.headers, body: data });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });

    if (options.body) req.write(options.body);
    req.end();
  });
}


