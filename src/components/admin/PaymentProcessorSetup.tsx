import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  CreditCard, 
  Smartphone, 
  Building, 
  Users, 
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  Key,
  Shield,
  Globe,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentProcessor {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  status: 'connected' | 'disconnected' | 'error';
  category: 'church' | 'general' | 'crypto';
  description: string;
  features: string[];
  apiKeyRequired: boolean;
  webhookRequired: boolean;
}

const PaymentProcessorSetup: React.FC = () => {
  const { toast } = useToast();
  const [activeProcessor, setActiveProcessor] = useState<string>('tithely');
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [webhookUrls, setWebhookUrls] = useState<Record<string, string>>({});

  const processors: PaymentProcessor[] = [
    {
      id: 'tithely',
      name: 'Tithe.ly',
      icon: Building,
      status: 'disconnected',
      category: 'church',
      description: 'Leading church donation platform with comprehensive giving tools',
      features: ['Recurring donations', 'Text-to-give', 'Kiosk giving', 'Tax receipts'],
      apiKeyRequired: true,
      webhookRequired: true
    },
    {
      id: 'pushpay',
      name: 'Pushpay',
      icon: Smartphone,
      status: 'disconnected',
      category: 'church',
      description: 'Mobile-first church giving platform with advanced analytics',
      features: ['Mobile app integration', 'Donor management', 'Campaign tracking', 'Analytics'],
      apiKeyRequired: true,
      webhookRequired: true
    },
    {
      id: 'givelify',
      name: 'Givelify',
      icon: Users,
      status: 'disconnected',
      category: 'church',
      description: 'User-friendly mobile giving platform for religious organizations',
      features: ['Social giving', 'Event fundraising', 'Pledge management', 'Donor engagement'],
      apiKeyRequired: true,
      webhookRequired: false
    },
    {
      id: 'planning_center',
      name: 'Planning Center Giving',
      icon: Settings,
      status: 'disconnected',
      category: 'church',
      description: 'Integrated giving solution as part of Planning Center suite',
      features: ['Church management integration', 'Batch processing', 'Fund designation', 'Reporting'],
      apiKeyRequired: true,
      webhookRequired: true
    },
    {
      id: 'stripe',
      name: 'Stripe',
      icon: CreditCard,
      status: 'connected',
      category: 'general',
      description: 'Global payment processing with extensive API capabilities',
      features: ['Global payments', 'Subscriptions', 'Connect platform', 'Advanced fraud protection'],
      apiKeyRequired: true,
      webhookRequired: true
    },
    {
      id: 'square',
      name: 'Square',
      icon: Building,
      status: 'disconnected',
      category: 'general',
      description: 'Complete payment solution with point-of-sale integration',
      features: ['In-person payments', 'Online payments', 'Invoicing', 'Inventory management'],
      apiKeyRequired: true,
      webhookRequired: false
    },
    {
      id: 'daimo',
      name: 'Daimo Pay',
      icon: Zap,
      status: 'disconnected',
      category: 'crypto',
      description: 'Fast crypto payments with USDC on Base chain',
      features: ['Instant USDC transfers', 'Base chain integration', 'Low fees', 'Mobile-first'],
      apiKeyRequired: false,
      webhookRequired: false
    }
  ];

  const getStatusIcon = (status: PaymentProcessor['status']) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-eboy-green" />;
      case 'error': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'disconnected': return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: PaymentProcessor['status']) => {
    switch (status) {
      case 'connected': return 'bg-eboy-green text-primary-foreground';
      case 'error': return 'bg-destructive text-destructive-foreground';
      case 'disconnected': return 'bg-muted text-muted-foreground';
    }
  };

  const handleApiKeyUpdate = (processorId: string, value: string) => {
    setApiKeys(prev => ({ ...prev, [processorId]: value }));
  };

  const handleWebhookUpdate = (processorId: string, value: string) => {
    setWebhookUrls(prev => ({ ...prev, [processorId]: value }));
  };

  const handleConnect = (processor: PaymentProcessor) => {
    if (processor.apiKeyRequired && !apiKeys[processor.id]) {
      toast({
        title: 'API Key Required',
        description: `Please enter your ${processor.name} API key first.`,
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Connecting...',
      description: `Setting up ${processor.name} integration.`
    });

    // Simulate connection process
    setTimeout(() => {
      toast({
        title: 'Connected!',
        description: `${processor.name} has been successfully connected.`
      });
    }, 2000);
  };

  const categoryProcessors = (category: string) => 
    processors.filter(p => p.category === category);

  return (
    <div className="space-y-6">
      <Card className="border-ancient-gold/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <CreditCard className="h-6 w-6 text-ancient-gold" />
            Payment Processor Configuration
          </CardTitle>
          <p className="text-muted-foreground">
            Configure and manage payment integrations for church tithing and general payments
          </p>
        </CardHeader>
      </Card>

      <Tabs defaultValue="church" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="church" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Church-Specific
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            General Payments
          </TabsTrigger>
          <TabsTrigger value="crypto" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Crypto Payments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="church" className="space-y-4">
          <div className="grid gap-4">
            {categoryProcessors('church').map((processor) => (
              <Card key={processor.id} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <processor.icon className="h-6 w-6 text-ancient-gold" />
                      <div>
                        <CardTitle className="text-lg">{processor.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{processor.description}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(processor.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(processor.status)}
                        {processor.status}
                      </div>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Features</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {processor.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-eboy-green" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-3">
                      {processor.apiKeyRequired && (
                        <div>
                          <Label htmlFor={`${processor.id}-api`} className="flex items-center gap-2">
                            <Key className="h-4 w-4" />
                            API Key
                          </Label>
                          <Input
                            id={`${processor.id}-api`}
                            type="password"
                            placeholder="Enter API key..."
                            value={apiKeys[processor.id] || ''}
                            onChange={(e) => handleApiKeyUpdate(processor.id, e.target.value)}
                          />
                        </div>
                      )}
                      {processor.webhookRequired && (
                        <div>
                          <Label htmlFor={`${processor.id}-webhook`} className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            Webhook URL
                          </Label>
                          <Input
                            id={`${processor.id}-webhook`}
                            placeholder="https://api.biblefi.app/webhooks/..."
                            value={webhookUrls[processor.id] || ''}
                            onChange={(e) => handleWebhookUpdate(processor.id, e.target.value)}
                          />
                        </div>
                      )}
                      <Button 
                        onClick={() => handleConnect(processor)}
                        className="w-full"
                        disabled={processor.status === 'connected'}
                      >
                        {processor.status === 'connected' ? 'Connected' : 'Connect'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="general" className="space-y-4">
          <div className="grid gap-4">
            {categoryProcessors('general').map((processor) => (
              <Card key={processor.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <processor.icon className="h-6 w-6 text-ancient-gold" />
                      <div>
                        <CardTitle className="text-lg">{processor.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{processor.description}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(processor.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(processor.status)}
                        {processor.status}
                      </div>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Features</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {processor.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-eboy-green" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-3">
                      {processor.apiKeyRequired && (
                        <div>
                          <Label htmlFor={`${processor.id}-api`} className="flex items-center gap-2">
                            <Key className="h-4 w-4" />
                            API Key
                          </Label>
                          <Input
                            id={`${processor.id}-api`}
                            type="password"
                            placeholder="Enter API key..."
                            value={apiKeys[processor.id] || ''}
                            onChange={(e) => handleApiKeyUpdate(processor.id, e.target.value)}
                          />
                        </div>
                      )}
                      <Button 
                        onClick={() => handleConnect(processor)}
                        className="w-full"
                        disabled={processor.status === 'connected'}
                      >
                        {processor.status === 'connected' ? 'Connected' : 'Connect'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="crypto" className="space-y-4">
          <div className="grid gap-4">
            {categoryProcessors('crypto').map((processor) => (
              <Card key={processor.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <processor.icon className="h-6 w-6 text-ancient-gold" />
                      <div>
                        <CardTitle className="text-lg">{processor.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{processor.description}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(processor.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(processor.status)}
                        {processor.status}
                      </div>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Features</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {processor.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-eboy-green" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <Button 
                        onClick={() => handleConnect(processor)}
                        className="w-full"
                        disabled={processor.status === 'connected'}
                      >
                        {processor.status === 'connected' ? 'Connected' : 'Connect'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Global Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-scripture" />
            Security & Global Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="test-mode">Test Mode</Label>
                <Switch id="test-mode" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="webhook-verification">Webhook Verification</Label>
                <Switch id="webhook-verification" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-reconciliation">Auto Reconciliation</Label>
                <Switch id="auto-reconciliation" defaultChecked />
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <Label htmlFor="default-currency">Default Currency</Label>
                <Input id="default-currency" value="USD" readOnly />
              </div>
              <div>
                <Label htmlFor="fee-percentage">Platform Fee (%)</Label>
                <Input id="fee-percentage" type="number" placeholder="2.5" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentProcessorSetup;