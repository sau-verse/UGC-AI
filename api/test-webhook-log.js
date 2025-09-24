import https from 'https';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('🧪 TEST WEBHOOK LOG - Request received');
  console.log('📦 Payload:', JSON.stringify(req.body, null, 2));
  
  try {
    const payload = req.body;
    const n8nWebhookUrl = 'https://n8n.reclad.site/webhook/c82b79e7-a7f4-4527-a0a5-f126d29a93cb';
    
    console.log('🔄 Making direct call to N8N for testing...');
    console.log('📤 N8N URL:', n8nWebhookUrl);
    
    // Make a direct call to N8N and wait for response
    const response = await makeRequest(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'image/*,application/octet-stream,application/json'
      },
      body: JSON.stringify(payload)
    });
    
    console.log('📥 N8N Response Status:', response.statusCode);
    console.log('📋 N8N Response Headers:', response.headers);
    console.log('📄 N8N Response Body:', response.body);
    
    return res.status(200).json({
      success: true,
      message: 'Test webhook call completed',
      n8nStatus: response.statusCode,
      n8nResponse: response.body,
      payload: payload
    });
    
  } catch (error) {
    console.error('❌ Test webhook error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      payload: req.body
    });
  }
}

// Helper function to make HTTP requests
function makeRequest(url, options) {
  return new Promise((resolve, reject) => {
    console.log('Making request to:', url);
    
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        ...options.headers,
        'User-Agent': 'UGC-Generator-Test/1.0'
      },
      timeout: 30000
    };

    const req = https.request(url, requestOptions, (res) => {
      console.log('Response received:', res.statusCode, res.statusMessage);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('Response completed, data length:', data.length);
        resolve({
          statusCode: res.statusCode,
          statusMessage: res.statusMessage,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (error) => {
      console.error('Request error:', error.message, error.code);
      reject(new Error(`Request failed: ${error.message} (${error.code})`));
    });

    req.on('timeout', () => {
      console.error('Request timeout after 30 seconds');
      req.destroy();
      reject(new Error('Request timeout after 30 seconds'));
    });

    if (options.body) {
      console.log('Writing body to request, length:', options.body.length);
      req.write(options.body);
    }
    
    req.end();
  });
}
