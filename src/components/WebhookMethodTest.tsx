import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface TestResult {
  method: string;
  success: boolean;
  status?: number;
  response?: any;
  error?: string;
  duration?: number;
}

const WebhookMethodTest = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const { toast } = useToast();

  const testPayload = {
    test: true,
    id: 'test-' + Date.now(),
    prompt: 'test prompt for method comparison',
    aspect_ratio: 'portrait',
    timestamp: new Date().toISOString(),
    action: 'test_method_comparison'
  };

  const testDirectWebhook = async (): Promise<TestResult> => {
    const startTime = Date.now();
    try {
      console.log('🧪 Testing DIRECT webhook call to n8n...');
      
      const response = await fetch('https://n8n.reclad.site/webhook/c82b79e7-a7f4-4527-a0a5-f126d29a93cb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(testPayload)
      });

      const duration = Date.now() - startTime;
      const responseText = await response.text();
      
      console.log('📡 Direct webhook response:', response.status, responseText);

      return {
        method: 'Direct n8n Webhook',
        success: response.ok,
        status: response.status,
        response: responseText,
        duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('❌ Direct webhook error:', error);
      return {
        method: 'Direct n8n Webhook',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration
      };
    }
  };

  const testProxyMethod = async (): Promise<TestResult> => {
    const startTime = Date.now();
    try {
      console.log('🧪 Testing PROXY method via Vercel API...');
      
      const response = await fetch('https://ugcgen-ai-git-master-sau-verse.vercel.app/api/webhook-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(testPayload)
      });

      const duration = Date.now() - startTime;
      const responseText = await response.text();
      
      console.log('📡 Proxy webhook response:', response.status, responseText);

      return {
        method: 'Vercel Proxy API',
        success: response.ok,
        status: response.status,
        response: responseText,
        duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('❌ Proxy webhook error:', error);
      return {
        method: 'Vercel Proxy API',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration
      };
    }
  };

  const testLocalProxy = async (): Promise<TestResult> => {
    const startTime = Date.now();
    try {
      console.log('🧪 Testing LOCAL PROXY method...');
      
      const response = await fetch('/api/webhook-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(testPayload)
      });

      const duration = Date.now() - startTime;
      const responseText = await response.text();
      
      console.log('📡 Local proxy response:', response.status, responseText);

      return {
        method: 'Local Proxy API',
        success: response.ok,
        status: response.status,
        response: responseText,
        duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('❌ Local proxy error:', error);
      return {
        method: 'Local Proxy API',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration
      };
    }
  };

  const runAllTests = async () => {
    setIsTesting(true);
    setTestResults([]);
    
    const tests = [
      testDirectWebhook,
      testProxyMethod,
      testLocalProxy
    ];

    const results: TestResult[] = [];
    
    for (const test of tests) {
      try {
        const result = await test();
        results.push(result);
        setTestResults([...results]);
        
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Test failed:', error);
      }
    }
    
    setIsTesting(false);
    
    // Show summary toast
    const successfulTests = results.filter(r => r.success).length;
    const totalTests = results.length;
    
    toast({
      title: "Webhook Method Tests Complete",
      description: `${successfulTests}/${totalTests} methods are working`,
      variant: successfulTests === totalTests ? "default" : "destructive"
    });
  };

  const getStatusBadge = (result: TestResult) => {
    if (result.success) {
      return <Badge variant="default" className="bg-green-500">✅ Working</Badge>;
    } else {
      return <Badge variant="destructive">❌ Failed</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Webhook Method Comparison Test</CardTitle>
            <p className="text-muted-foreground">
              Test different methods of calling the n8n webhook to determine which one works best.
            </p>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={runAllTests} 
              disabled={isTesting}
              className="w-full"
            >
              {isTesting ? 'Testing Methods...' : 'Run All Webhook Tests'}
            </Button>
          </CardContent>
        </Card>

        {testResults.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Test Results</h3>
            {testResults.map((result, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{result.method}</CardTitle>
                    {getStatusBadge(result)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Status:</span>
                      <span>{result.status || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Duration:</span>
                      <span>{result.duration}ms</span>
                    </div>
                    {result.error && (
                      <div>
                        <span className="font-medium text-red-600">Error:</span>
                        <p className="text-red-600 text-xs mt-1">{result.error}</p>
                      </div>
                    )}
                    {result.response && (
                      <div>
                        <span className="font-medium">Response:</span>
                        <pre className="text-xs mt-1 bg-muted p-2 rounded overflow-auto max-h-32">
                          {typeof result.response === 'string' 
                            ? result.response 
                            : JSON.stringify(result.response, null, 2)
                          }
                        </pre>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Test Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">1. Direct n8n Webhook</h4>
                <p className="text-sm text-muted-foreground">
                  Calls n8n webhook directly: <code>https://n8n.reclad.site/webhook/c82b79e7-a7f4-4527-a0a5-f126d29a93cb</code>
                </p>
              </div>
              <div>
                <h4 className="font-medium">2. Vercel Proxy API</h4>
                <p className="text-sm text-muted-foreground">
                  Calls your Vercel deployment API: <code>https://ugcgen-ai-git-master-sau-verse.vercel.app/api/webhook-generate</code>
                </p>
              </div>
              <div>
                <h4 className="font-medium">3. Local Proxy API</h4>
                <p className="text-sm text-muted-foreground">
                  Calls local API route: <code>/api/webhook-generate</code>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WebhookMethodTest;
