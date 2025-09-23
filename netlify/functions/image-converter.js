const https = require('https');
const FormData = require('form-data');

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
    // Parse the multipart form data
    const boundary = event.headers['content-type']?.split('boundary=')[1];
    if (!boundary) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'No boundary found in content-type header' })
      };
    }

    // For now, we'll create a simple response that returns a data URL
    // In a real implementation, you might want to upload to a cloud storage service
    const body = Buffer.from(event.body, 'base64');
    const bodyString = body.toString('binary');
    
    // Find the image data in the multipart form
    const imageStart = bodyString.indexOf('\r\n\r\n') + 4;
    const imageEnd = bodyString.lastIndexOf('\r\n--' + boundary);
    
    if (imageStart === -1 || imageEnd === -1) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Could not parse image data from form' })
      };
    }
    
    const imageData = bodyString.substring(imageStart, imageEnd);
    const imageBuffer = Buffer.from(imageData, 'binary');
    
    // Convert to base64 data URL
    const mimeType = 'image/png'; // Default to PNG
    const base64Data = imageBuffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64Data}`;
    
    console.log('Image converted successfully, size:', imageBuffer.length);
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        url: dataUrl,
        imageUrl: dataUrl,
        success: true,
        size: imageBuffer.length
      })
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
        stack: error.stack
      })
    };
  }
};
