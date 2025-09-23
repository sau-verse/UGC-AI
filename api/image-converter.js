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

  console.log('Image converter function called:', req.method, req.url);
  
  try {
    console.log('Image converter endpoint called');
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Body length:', req.body ? req.body.length : 0);
    
    // Forward the multipart form data to the reclad.site API
    const recladApiUrl = 'https://reclad.site/n8n_binary/n8n-to-url-converter.php';
    console.log('Forwarding to reclad.site API:', recladApiUrl);
    
    const response = await makeRequest(recladApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': req.headers['content-type'] || 'multipart/form-data'
      },
      body: req.body
    });

    console.log('Reclad API response status:', response.statusCode);
    console.log('Reclad API response headers:', response.headers);
    console.log('Reclad API response body length:', response.body ? response.body.length : 0);

    // Parse the response body if it's JSON
    let responseData;
    try {
      responseData = JSON.parse(response.body);
    } catch (parseError) {
      responseData = response.body;
    }

    // Return the response from the reclad.site API
    return res.status(response.statusCode).json({
      success: true,
      data: responseData,
      statusCode: response.statusCode
    });

  } catch (error) {
    console.error('Error in image converter function:', error);
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
    console.log('Making image converter request to:', url);
    console.log('Image converter request options:', options);
    
    const requestOptions = {
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: 300000 // 5 minutes timeout
    };

    const req = https.request(url, requestOptions, (res) => {
      console.log('Image converter response received:', res.statusCode);
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('Image converter response completed, data length:', data.length);
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (error) => {
      console.error('Image converter request error:', error);
      reject(error);
    });

    req.on('timeout', () => {
      console.error('Image converter request timeout after 5 minutes');
      req.destroy();
      reject(new Error('Request timeout after 5 minutes'));
    });

    if (options.body) {
      console.log('Writing image converter body to request');
      req.write(options.body);
    }
    
    req.end();
  });
}
