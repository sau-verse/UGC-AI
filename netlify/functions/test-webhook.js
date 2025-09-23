const https = require('https');

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  
  console.log('Test webhook function called:', event.httpMethod, event.path);
  
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
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
    // Test the n8n webhook URL
    const n8nWebhookUrl = 'https://n8n.reclad.site/webhook/c82b79e7-a7f4-4527-a0a5-f126d29a93cb';
    console.log('Testing n8n webhook URL:', n8nWebhookUrl);
    
    const testPayload = {
      test: true,
      id: 'test-id',
      prompt: 'test prompt',
      aspect_ratio: 'portrait',
      timestamp: new Date().toISOString(),
      action: 'test_connection'
    };
    
    const response = await makeRequest(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(testPayload)
    });

    console.log('n8n test response status:', response.statusCode);
    console.log('n8n test response body:', response.body);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        n8nStatus: response.statusCode,
        n8nResponse: response.body,
        message: 'Webhook test completed'
      })
    };

  } catch (error) {
    console.error('Error testing webhook:', error);
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: error.message,
        message: 'Webhook test failed'
      })
    };
  }
};

// Helper function to make HTTP requests
function makeRequest(url, options) {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: 30000 // 30 seconds timeout for testing
    };

    const req = https.request(url, requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}
