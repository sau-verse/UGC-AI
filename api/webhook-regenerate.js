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
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('Regenerate webhook function called:', req.method, req.url);
  
  try {
    const payload = req.body;
    console.log('Received regenerate payload keys:', Object.keys(payload));
    console.log('Regenerate payload size:', JSON.stringify(payload).length, 'bytes');

    // Forward the request to the n8n webhook
    const n8nWebhookUrl = 'https://n8n.reclad.site/webhook/6c5a5941-63b0-463e-8a16-0c7e08882c72';
    console.log('Forwarding regenerate request to n8n webhook:', n8nWebhookUrl);
    
    // Fire-and-forget request to n8n - don't wait for response
    makeRequest(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'image/*,application/octet-stream,application/json'
      },
      body: JSON.stringify(payload)
    }).then(response => {
      console.log('n8n regenerate response status:', response.statusCode);
      console.log('n8n regenerate response headers:', response.headers);
      console.log('n8n regenerate response body length:', response.body ? response.body.length : 0);
    }).catch(error => {
      console.error('n8n regenerate request failed:', error);
    });

    // Return immediately - let realtime handle status updates
    return res.status(200).json({ 
      success: true, 
      message: 'Image regeneration started',
      jobId: payload.id
    });

  } catch (error) {
    console.error('Error processing regenerate webhook:', error);
    console.error('Error stack:', error.stack);
    
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// Helper function to make HTTP requests with proper timeout handling
function makeRequest(url, options) {
  return new Promise((resolve, reject) => {
    console.log('Making regenerate request to:', url);
    console.log('Regenerate request options:', options);
    
    const requestOptions = {
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: 300000 // 5 minutes timeout
    };

    const req = https.request(url, requestOptions, (res) => {
      console.log('Regenerate response received:', res.statusCode);
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('Regenerate response completed, data length:', data.length);
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (error) => {
      console.error('Regenerate request error:', error);
      reject(error);
    });

    req.on('timeout', () => {
      console.error('Regenerate request timeout after 5 minutes');
      req.destroy();
      reject(new Error('Request timeout after 5 minutes'));
    });

    if (options.body) {
      console.log('Writing regenerate body to request');
      req.write(options.body);
    }
    
    req.end();
  });
}
