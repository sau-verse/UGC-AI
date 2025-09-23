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
    console.log('Received payload:', JSON.stringify(payload, null, 2));

    // Forward the request to the n8n webhook
    const n8nWebhookUrl = 'https://n8n.reclad.site/webhook/c82b79e7-a7f4-4527-a0a5-f126d29a93cb';
    console.log('Forwarding to n8n webhook:', n8nWebhookUrl);
    
    const response = await makeRequest(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'image/*,application/octet-stream,application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log('n8n response status:', response.statusCode);
    console.log('n8n response headers:', response.headers);
    console.log('n8n response body length:', response.body ? response.body.length : 0);

    // Return the response from n8n
    return {
      statusCode: response.statusCode,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': response.headers['content-type'] || 'application/json'
      },
      body: response.body
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
        stack: error.stack
      })
    };
  }
};

// Helper function to make HTTP requests with proper timeout handling
function makeRequest(url, options) {
  return new Promise((resolve, reject) => {
    console.log('Making request to:', url);
    console.log('Request options:', options);
    
    const requestOptions = {
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: 300000 // 5 minutes timeout
    };

    const req = https.request(url, requestOptions, (res) => {
      console.log('Response received:', res.statusCode);
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('Response completed, data length:', data.length);
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (error) => {
      console.error('Request error:', error);
      reject(error);
    });

    req.on('timeout', () => {
      console.error('Request timeout after 5 minutes');
      req.destroy();
      reject(new Error('Request timeout after 5 minutes'));
    });

    if (options.body) {
      console.log('Writing body to request');
      req.write(options.body);
    }
    
    req.end();
  });
}
