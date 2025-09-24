// Test webhook function to debug n8n connectivity
export const testWebhook = async () => {
  const testPayload = {
    test: true,
    id: 'test-' + Date.now(),
    prompt: 'test prompt for debugging',
    aspect_ratio: 'portrait',
    timestamp: new Date().toISOString(),
    action: 'test_connection'
  };

  console.log('🧪 Testing webhook with payload:', testPayload);

  try {
    const response = await fetch('/webhook-generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(testPayload)
    });

    console.log('📡 Webhook response status:', response.status);
    console.log('📡 Webhook response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📡 Webhook response body:', responseText);

    if (response.ok) {
      console.log('✅ Webhook test successful');
      return { success: true, response: responseText };
    } else {
      console.error('❌ Webhook test failed with status:', response.status);
      return { success: false, error: `HTTP ${response.status}: ${responseText}` };
    }
  } catch (error) {
    console.error('❌ Webhook test error:', error);
    return { success: false, error: error.message };
  }
};
