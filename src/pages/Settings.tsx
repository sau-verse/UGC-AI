import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Bell, CreditCard, Key, Shield, Trash2 } from "lucide-react";
import Navigation from "@/components/Navigation";

const Settings = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 px-6">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-heading font-bold text-foreground mb-2">
              Settings
            </h1>
            <p className="text-xl text-muted-foreground">
              Manage your account preferences and billing
            </p>
          </div>

          <div className="space-y-8">
            {/* Profile Settings */}
            <Card className="shadow-soft border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 w-5 h-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" defaultValue="Alex" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue="Johnson" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" defaultValue="alex.johnson@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company (Optional)</Label>
                  <Input id="company" defaultValue="Creative Agency Co." />
                </div>
                <Button className="bg-gradient-primary hover:opacity-90">
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            {/* Subscription */}
            <Card className="shadow-soft border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 w-5 h-5" />
                  Subscription & Billing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-foreground">Pro Plan</h3>
                    <p className="text-sm text-muted-foreground">
                      100 AI images, 50 UGC videos per month
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-foreground">$29</div>
                    <div className="text-sm text-muted-foreground">per month</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">AI Images Used</span>
                    <Badge variant="secondary">47/100</Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-gradient-primary h-2 rounded-full transition-smooth" style={{width: '47%'}}></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">UGC Videos Used</span>
                    <Badge variant="secondary">23/50</Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-gradient-primary h-2 rounded-full transition-smooth" style={{width: '46%'}}></div>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1">
                    Change Plan
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Billing History
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* API Access */}
            <Card className="shadow-soft border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="mr-2 w-5 h-5" />
                  API Access
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Integrate UGCGen with your existing workflows using our API
                </p>
                
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="apiKey" 
                      type="password" 
                      defaultValue="ugc_sk_1234567890abcdef"
                      readOnly 
                    />
                    <Button variant="outline">
                      Copy
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">API Calls This Month</span>
                    <Badge variant="secondary">127/1000</Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-gradient-primary h-2 rounded-full transition-smooth" style={{width: '12.7%'}}></div>
                  </div>
                </div>

                <Button variant="outline">
                  Generate New Key
                </Button>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="shadow-soft border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="mr-2 w-5 h-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive updates about your projects and account
                    </p>
                  </div>
                  <Switch id="emailNotifications" defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="marketingEmails">Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Get tips, tutorials, and product updates
                    </p>
                  </div>
                  <Switch id="marketingEmails" />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="processComplete">Processing Complete</Label>
                    <p className="text-sm text-muted-foreground">
                      Notify when your AI content is ready
                    </p>
                  </div>
                  <Switch id="processComplete" defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card className="shadow-soft border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 w-5 h-5" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Button variant="outline" className="w-full justify-start">
                    Change Password
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Two-Factor Authentication</Label>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                    <Button variant="outline" size="sm">
                      Enable 2FA
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="shadow-soft border-0 border-destructive/20">
              <CardHeader>
                <CardTitle className="flex items-center text-destructive">
                  <Trash2 className="mr-2 w-5 h-5" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Delete Account</Label>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <Button variant="destructive" size="sm">
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;