import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { testWebhook } from '@/api/test-webhook';

const WebhookTest = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const { toast } = useToast();

  const handleTestWebhook = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const result = await testWebhook();
      setTestResult(result);
      
      if (result.success) {
        toast({
          title: "Webhook Test Successful",
          description: "The webhook is working correctly.",
        });
      } else {
        toast({
          title: "Webhook Test Failed",
          description: result.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setTestResult({ success: false, error: errorMessage });
      toast({
        title: "Webhook Test Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Webhook Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleTestWebhook}
              disabled={isTesting}
              className="w-full"
            >
              {isTesting ? 'Testing...' : 'Test Webhook Connection'}
            </Button>
            
            {testResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">
                    Test Result: {testResult.success ? '✅ Success' : '❌ Failed'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
                    {JSON.stringify(testResult, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WebhookTest;
