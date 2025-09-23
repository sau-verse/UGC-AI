const https = require('https');

exports.handler = async (event, context) => {
  // Set the function to run as a background function for longer execution time
  context.callbackWaitsForEmptyEventLoop = false;
  
  console.log('Image converter function called:', event.httpMethod, event.path);
  
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
    console.log('Image converter endpoint called');
    console.log('Content-Type:', event.headers['content-type']);
    console.log('Body length:', event.body ? event.body.length : 0);
    
    // Forward the multipart form data to the reclad.site API
    const recladApiUrl = 'https://reclad.site/n8n_binary/n8n-to-url-converter.php';
    console.log('Forwarding to reclad.site API:', recladApiUrl);
    
    const response = await makeRequest(recladApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': event.headers['content-type'] || 'multipart/form-data'
      },
      body: event.body,
      isBase64Encoded: event.isBase64Encoded
    });

    console.log('Reclad API response status:', response.statusCode);
    console.log('Reclad API response headers:', response.headers);
    console.log('Reclad API response body length:', response.body ? response.body.length : 0);

    // Return the response from reclad.site API
    return {
      statusCode: response.statusCode,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': response.headers['content-type'] || 'application/json'
      },
      body: response.body
    };

  } catch (error) {
    console.error('Error processing image conversion:', error);
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
    console.log('Making request to:', url);
    console.log('Request options:', { 
      method: options.method, 
      headers: options.headers,
      bodyLength: options.body ? options.body.length : 0,
      isBase64Encoded: options.isBase64Encoded
    });
    
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
      if (options.isBase64Encoded) {
        // Decode base64 body before sending
        const buffer = Buffer.from(options.body, 'base64');
        req.write(buffer);
      } else {
        req.write(options.body);
      }
    }
    
    req.end();
  });
}
