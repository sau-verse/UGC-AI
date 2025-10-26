import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = req.body;
    console.log('Received regenerate payload:', JSON.stringify(payload, null, 2));

    // Transform the payload to match n8n workflow expectations
    const transformedPayload = {
      ...payload,
      // Map input_image_url to image_url for n8n workflow
      image_url: payload.input_image_url,
      // Remove the original input_image_url field to avoid confusion
      input_image_url: undefined
    };
    
    // Remove undefined fields
    Object.keys(transformedPayload).forEach(key => {
      if (transformedPayload[key] === undefined) {
        delete transformedPayload[key];
      }
    });

    console.log('Transformed regenerate payload:', JSON.stringify(transformedPayload, null, 2));

    // Forward the request to the n8n webhook
    const n8nWebhookUrl = 'https://n8n.reclad.site/webhook/6c5a5941-63b0-463e-8a16-0c7e08882c72';
    
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'image/*,application/octet-stream,application/json'
      },
      body: JSON.stringify(transformedPayload),
      // Add timeout for long-running processes
      signal: AbortSignal.timeout(300000) // 5 minutes timeout
    });

    // Get the response body
    const responseBody = await response.text();
    
    // Set the content type from the original response
    const contentType = response.headers.get('content-type') || 'application/json';
    res.setHeader('Content-Type', contentType);

    // Return the response from n8n
    return res.status(response.status).send(responseBody);

  } catch (error) {
    console.error('Error processing regenerate webhook:', error);
    
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
