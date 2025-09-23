const https = require('https');

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
    const { prompt, style, aspect_ratio, user_id, job_id } = req.body;

    // Validate required fields
    if (!prompt || !user_id || !job_id) {
      console.log('Missing required fields');
      return res.status(400).json({ 
        error: 'Missing required fields: prompt, user_id, job_id' 
      });
    }

    // Prepare the payload for the external webhook
    const payload = {
      prompt: prompt,
      style: style || 'realistic',
      aspect_ratio: aspect_ratio || '16:9',
      user_id: user_id,
      job_id: job_id
    };

    console.log('Sending payload to external webhook:', payload);

    // Make request to external webhook
    const webhookUrl = 'https://n8n.reclad.site/webhook/c82b79e7-a7f4-4527-a0a5-f126d29a93cb';
    
    const postData = JSON.stringify(payload);
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 30000 // 30 second timeout
    };

    const webhookResponse = await new Promise((resolve, reject) => {
      const webhookReq = https.request(webhookUrl, options, (webhookRes) => {
        let data = '';
        
        webhookRes.on('data', (chunk) => {
          data += chunk;
        });
        
        webhookRes.on('end', () => {
          try {
            const responseData = JSON.parse(data);
            resolve({
              statusCode: webhookRes.statusCode,
              data: responseData
            });
          } catch (error) {
            resolve({
              statusCode: webhookRes.statusCode,
              data: data
            });
          }
        });
      });

      webhookReq.on('error', (error) => {
        console.error('Webhook request error:', error);
        reject(error);
      });

      webhookReq.on('timeout', () => {
        console.error('Webhook request timeout');
        webhookReq.destroy();
        reject(new Error('Request timeout'));
      });

      webhookReq.write(postData);
      webhookReq.end();
    });

    console.log('Webhook response:', webhookResponse);

    // Return the response from the external webhook
    return res.status(webhookResponse.statusCode).json(webhookResponse.data);

  } catch (error) {
    console.error('Error in webhook function:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
