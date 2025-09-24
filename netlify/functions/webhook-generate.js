const https = require('https');

exports.handler = async (event, context) => {
  // Set the function to run as a background function for longer execution time
  context.callbackWaitsForEmptyEventLoop = false;
  
  console.log('Webhook function called:', event.httpMethod, event.path);
  
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    console.log('Method not allowed:', event.httpMethod);
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    console.log('CORS preflight request');
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  try {
    const payload = JSON.parse(event.body);
    console.log('Received payload keys:', Object.keys(payload));
    console.log('Payload size:', JSON.stringify(payload).length, 'bytes');

    // Forward the request to the n8n webhook
    const n8nWebhookUrl = 'https://n8n.reclad.site/webhook/c82b79e7-a7f4-4527-a0a5-f126d29a93cb';
    console.log('Forwarding to n8n webhook:', n8nWebhookUrl);
    
    // Make request to n8n with better error handling
    try {
      const response = await makeRequest(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'image/*,application/octet-stream,application/json'
        },
        body: JSON.stringify(payload)
      });
      
      console.log('✅ n8n response status:', response.statusCode);
      console.log('✅ n8n response headers:', response.headers);
      console.log('✅ n8n response body length:', response.body ? response.body.length : 0);
      console.log('✅ n8n response body preview:', response.body ? response.body.substring(0, 200) : 'No body');
      
      if (response.statusCode >= 200 && response.statusCode < 300) {
        console.log('🎉 Webhook call successful to n8n');
      } else {
        console.error('❌ n8n returned error status:', response.statusCode, response.body);
      }
    } catch (error) {
      console.error('❌ n8n request failed:', error.message);
      console.error('❌ Error details:', error);
    }

    // Return immediately - let realtime handle status updates
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        success: true, 
        message: 'Image generation started',
        jobId: payload.id
      })
    };

  } catch (error) {
    console.error('Error processing webhook:', error);
    console.error('Error stack:', error.stack);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};

// Helper function to make HTTP requests with proper timeout handling
function makeRequest(url, options) {
  return new Promise((resolve, reject) => {
    console.log('🌐 Making request to:', url);
    console.log('📋 Request options:', {
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
      console.log('📡 Response received:', res.statusCode, res.statusMessage);
      console.log('📋 Response headers:', res.headers);
      
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('✅ Response completed, data length:', data.length);
        console.log('📄 Response body preview:', data.substring(0, 200));
        
        resolve({
          statusCode: res.statusCode,
          statusMessage: res.statusMessage,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error.message, error.code);
      reject(new Error(`Request failed: ${error.message} (${error.code})`));
    });

    req.on('timeout', () => {
      console.error('⏰ Request timeout after 30 seconds');
      req.destroy();
      reject(new Error('Request timeout after 30 seconds'));
    });

    // Handle connection errors
    req.on('close', () => {
      console.log('🔌 Request connection closed');
    });

    if (options.body) {
      console.log('📤 Writing body to request, length:', options.body.length);
      req.write(options.body);
    }
    
    req.end();
  });
}
