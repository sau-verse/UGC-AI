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

  console.log('Webhook function called:', req.method, req.url);
  
  try {
    const payload = req.body;
    console.log('Received payload keys:', Object.keys(payload));
    console.log('Payload size:', JSON.stringify(payload).length, 'bytes');

    // Forward the request to the n8n webhook
    const n8nWebhookUrl = 'https://n8n.reclad.site/webhook/c82b79e7-a7f4-4527-a0a5-f126d29a93cb';
    console.log('Forwarding to n8n webhook:', n8nWebhookUrl);
    
    // Make request to n8n with proper error handling and retry logic
    const maxRetries = 3;
    let retryCount = 0;
    
    const makeWebhookCall = async () => {
      try {
        console.log(`🔄 Attempting webhook call (attempt ${retryCount + 1}/${maxRetries + 1})`);
        console.log('📤 Sending to N8N:', n8nWebhookUrl);
        console.log('📦 Payload:', JSON.stringify(payload, null, 2));
        
        const response = await makeRequest(n8nWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'image/*,application/octet-stream,application/json'
          },
          body: JSON.stringify(payload)
        });
        
        console.log('📥 N8N response status:', response.statusCode);
        console.log('📋 N8N response headers:', response.headers);
        console.log('📄 N8N response body:', response.body);
        
        // Check if the response indicates success
        if (response.statusCode >= 200 && response.statusCode < 300) {
          console.log('✅ Webhook call successful');
          return { success: true, response };
        } else {
          throw new Error(`N8N returned status ${response.statusCode}: ${response.body}`);
        }
        
      } catch (error) {
        console.error(`❌ Webhook call failed (attempt ${retryCount + 1}):`, error.message);
        
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`⏳ Retrying in 2 seconds... (${retryCount}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          return makeWebhookCall();
        } else {
          throw error;
        }
      }
    };
    
    // Execute webhook call as fire-and-forget (realtime handles status updates)
    makeWebhookCall()
      .then(result => {
        console.log('✅ Final webhook result:', result);
      })
      .catch(error => {
        console.error('❌ All webhook attempts failed:', error);
        // Don't throw error here - realtime will handle status updates
      });

    // Return immediately - let realtime handle status updates
    return res.status(200).json({ 
      success: true, 
      message: 'Image generation started',
      jobId: payload.id
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
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
    console.log('Making request to:', url);
    console.log('Request options:', {
      method: options.method,
      headers: options.headers,
      bodyLength: options.body ? options.body.length : 0
    });
    
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        ...options.headers,
        'User-Agent': 'UGC-Generator/1.0'
      },
      timeout: 30000 // 30 seconds timeout (reduced from 5 minutes)
    };

    const req = https.request(url, requestOptions, (res) => {
      console.log('Response received:', res.statusCode, res.statusMessage);
      console.log('Response headers:', res.headers);
      
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('Response completed, data length:', data.length);
        console.log('Response body preview:', data.substring(0, 200));
        
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

    // Handle connection errors
    req.on('close', () => {
      console.log('Request connection closed');
    });

    if (options.body) {
      console.log('Writing body to request, length:', options.body.length);
      req.write(options.body);
    }
    
    req.end();
  });
}
