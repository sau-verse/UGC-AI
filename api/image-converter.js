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
    const { image_url, user_id, job_id } = req.body;

    // Validate required fields
    if (!image_url || !user_id || !job_id) {
      console.log('Missing required fields');
      return res.status(400).json({ 
        error: 'Missing required fields: image_url, user_id, job_id' 
      });
    }

    // Prepare the payload for the external service
    const payload = {
      image_url: image_url,
      user_id: user_id,
      job_id: job_id
    };

    console.log('Sending image conversion payload:', payload);

    // Make request to external image converter service
    const converterUrl = 'https://reclad.site/n8n_binary';
    
    const postData = JSON.stringify(payload);
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 300000 // 5 minute timeout for image processing
    };

    const converterResponse = await new Promise((resolve, reject) => {
      const converterReq = https.request(converterUrl, options, (converterRes) => {
        let data = '';
        
        converterRes.on('data', (chunk) => {
          data += chunk;
        });
        
        converterRes.on('end', () => {
          try {
            const responseData = JSON.parse(data);
            resolve({
              statusCode: converterRes.statusCode,
              data: responseData
            });
          } catch (error) {
            resolve({
              statusCode: converterRes.statusCode,
              data: data
            });
          }
        });
      });

      converterReq.on('error', (error) => {
        console.error('Image converter request error:', error);
        reject(error);
      });

      converterReq.on('timeout', () => {
        console.error('Image converter request timeout');
        converterReq.destroy();
        reject(new Error('Request timeout'));
      });

      converterReq.write(postData);
      converterReq.end();
    });

    console.log('Image converter response:', converterResponse);

    // Return the response from the external service
    return res.status(converterResponse.statusCode).json(converterResponse.data);

  } catch (error) {
    console.error('Error in image converter function:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
