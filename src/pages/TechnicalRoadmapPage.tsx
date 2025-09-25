import React, { useState } from 'react';
import NavBar from '@/components/NavBar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, Clock, Database, Brain, Zap, Globe, Coins } from 'lucide-react';

const TechnicalRoadmapPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('rag-agi');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'IN_PROGRESS': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'CRITICAL': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'PLANNED': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const ragAgiTasks = [
    {
      category: "RAG INFRASTRUCTURE",
      status: "IN_PROGRESS",
      completion: 45,
      tasks: [
        { name: "Vector DB Setup (Supabase pgvector)", status: "COMPLETED", priority: "HIGH" },
        { name: "Biblical Knowledge Embeddings Pipeline", status: "IN_PROGRESS", priority: "CRITICAL" },
        { name: "Semantic Search Implementation", status: "IN_PROGRESS", priority: "HIGH" },
        { name: "Context Window Management (200K tokens)", status: "PLANNED", priority: "HIGH" },
        { name: "Multi-modal RAG (Text + Images)", status: "PLANNED", priority: "MEDIUM" }
      ]
    },
    {
      category: "MCP INTEGRATION",
      status: "PLANNED",
      completion: 0,
      tasks: [
        { name: "MCP Server Setup", status: "PLANNED", priority: "CRITICAL" },
        { name: "Bible.fi MCP Tools", status: "PLANNED", priority: "HIGH" },
        { name: "Blockchain MCP Connectors", status: "PLANNED", priority: "HIGH" },
        { name: "Church Database MCP Interface", status: "PLANNED", priority: "MEDIUM" },
        { name: "DeFi Protocol MCP Bridges", status: "PLANNED", priority: "HIGH" }
      ]
    },
    {
      category: "AGI REASONING",
      status: "PLANNED",
      completion: 15,
      tasks: [
        { name: "Claude-4 Integration (Opus/Sonnet)", status: "IN_PROGRESS", priority: "HIGH" },
        { name: "Biblical Reasoning Engine", status: "PLANNED", priority: "CRITICAL" },
        { name: "Multi-step Financial Planning", status: "PLANNED", priority: "HIGH" },
        { name: "Cross-chain Strategy Optimization", status: "PLANNED", priority: "HIGH" },
        { name: "Autonomous Tithing Strategies", status: "PLANNED", priority: "MEDIUM" }
      ]
    }
  ];

  const blockchainTasks = [
    {
      category: "SUPERFLUID INTEGRATION",
      status: "IN_PROGRESS",
      completion: 60,
      tasks: [
        { name: "Superfluid SDK Integration", status: "COMPLETED", priority: "HIGH" },
        { name: "Stream Creation UI", status: "COMPLETED", priority: "HIGH" },
        { name: "Multi-token Stream Support", status: "IN_PROGRESS", priority: "HIGH" },
        { name: "Automated Tithing Streams", status: "IN_PROGRESS", priority: "CRITICAL" },
        { name: "Cross-chain Stream Bridging", status: "PLANNED", priority: "HIGH" },
        { name: "Stream Analytics Dashboard", status: "PLANNED", priority: "MEDIUM" },
        { name: "Emergency Stream Controls", status: "PLANNED", priority: "HIGH" }
      ]
    },
    {
      category: "DAIMO INTEGRATION",
      status: "PLANNED",
      completion: 25,
      tasks: [
        { name: "Daimo SDK Integration", status: "IN_PROGRESS", priority: "HIGH" },
        { name: "USDC Quick Send/Receive", status: "PLANNED", priority: "CRITICAL" },
        { name: "Church Payment Rails", status: "PLANNED", priority: "HIGH" },
        { name: "Farcaster Social Payments", status: "PLANNED", priority: "HIGH" },
        { name: "QR Code Payment System", status: "PLANNED", priority: "MEDIUM" },
        { name: "Offline Payment Caching", status: "PLANNED", priority: "LOW" }
      ]
    },
    {
      category: "MULTI-CHAIN SUPPORT",
      status: "PLANNED",
      completion: 20,
      tasks: [
        { name: "Base Chain Integration", status: "COMPLETED", priority: "HIGH" },
        { name: "Ethereum Mainnet Support", status: "PLANNED", priority: "HIGH" },
        { name: "Polygon Integration", status: "PLANNED", priority: "MEDIUM" },
        { name: "Optimism Support", status: "PLANNED", priority: "MEDIUM" },
        { name: "Arbitrum Integration", status: "PLANNED", priority: "MEDIUM" },
        { name: "USDC Native Chains", status: "PLANNED", priority: "CRITICAL" },
        { name: "Cross-chain Bridge Aggregation", status: "PLANNED", priority: "HIGH" },
        { name: "Chain Abstraction Layer", status: "PLANNED", priority: "HIGH" }
      ]
    }
  ];

  const dataCrawlerTasks = [
    {
      category: "BIBLICAL FINANCIAL KNOWLEDGE",
      status: "IN_PROGRESS",
      completion: 40,
      tasks: [
        { name: "Complete Bible Text Ingestion (66 Books)", status: "COMPLETED", priority: "HIGH" },
        { name: "Financial Keyword Extraction", status: "IN_PROGRESS", priority: "CRITICAL" },
        { name: "Verse Classification by Financial Topics", status: "IN_PROGRESS", priority: "HIGH" },
        { name: "Cross-reference Mapping", status: "PLANNED", priority: "HIGH" },
        { name: "Hebrew/Greek Original Text Analysis", status: "PLANNED", priority: "MEDIUM" },
        { name: "Commentaries Integration", status: "PLANNED", priority: "MEDIUM" },
        { name: "Historical Context Database", status: "PLANNED", priority: "LOW" }
      ],
      metrics: {
        totalVerses: "31,102",
        financialVerses: "2,350+",
        categorized: "1,240",
        embedded: "856"
      }
    },
    {
      category: "GLOBAL CHURCH CRAWLER",
      status: "PLANNED",
      completion: 15,
      tasks: [
        { name: "Church Directory APIs Integration", status: "PLANNED", priority: "CRITICAL" },
        { name: "Denominational Database Scraping", status: "PLANNED", priority: "HIGH" },
        { name: "Geographic Church Mapping", status: "PLANNED", priority: "HIGH" },
        { name: "Payment Method Verification", status: "PLANNED", priority: "CRITICAL" },
        { name: "Crypto Wallet Address Validation", status: "PLANNED", priority: "HIGH" },
        { name: "Multi-language Support", status: "PLANNED", priority: "MEDIUM" },
        { name: "Real-time Church Data Updates", status: "PLANNED", priority: "MEDIUM" }
      ],
      targets: {
        northAmerica: "300,000+",
        europe: "180,000+",
        africa: "250,000+",
        asia: "150,000+",
        oceania: "15,000+",
        southAmerica: "80,000+"
      }
    }
  ];

  const infrastructureTasks = [
    {
      category: "EDGE FUNCTION ARCHITECTURE",
      status: "IN_PROGRESS",
      completion: 70,
      tasks: [
        { name: "Biblical Advisor Function", status: "COMPLETED", priority: "HIGH" },
        { name: "Wisdom Score Calculator", status: "COMPLETED", priority: "MEDIUM" },
        { name: "Frame Handler", status: "COMPLETED", priority: "HIGH" },
        { name: "Image Generation Service", status: "COMPLETED", priority: "MEDIUM" },
        { name: "Real-time Data Aggregator", status: "PLANNED", priority: "HIGH" },
        { name: "Blockchain Event Processor", status: "PLANNED", priority: "CRITICAL" },
        { name: "Cross-chain Transaction Router", status: "PLANNED", priority: "HIGH" }
      ]
    },
    {
      category: "SECURITY & COMPLIANCE",
      status: "IN_PROGRESS",
      completion: 55,
      tasks: [
        { name: "Multi-layer Security Implementation", status: "COMPLETED", priority: "CRITICAL" },
        { name: "Wallet Security Auditing", status: "IN_PROGRESS", priority: "CRITICAL" },
        { name: "Smart Contract Security", status: "PLANNED", priority: "CRITICAL" },
        { name: "PCI DSS Compliance", status: "PLANNED", priority: "HIGH" },
        { name: "GDPR Data Protection", status: "PLANNED", priority: "HIGH" },
        { name: "Religious Data Sensitivity", status: "PLANNED", priority: "MEDIUM" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black font-mono">
      <NavBar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-ancient-gold mb-4">
            BIBLE.FI TECHNICAL ROADMAP
          </h1>
          <p className="text-green-400 text-sm mb-2">
            BLOCKCHAIN • RAG • AGI • MCP • MULTI-CHAIN INTEGRATION
          </p>
          <div className="text-xs text-white/60 space-y-1">
            <div>BUILD: v2.1.0-alpha | CHAIN: Base (8453) | BLOCK: {Date.now()}</div>
            <div>TARGET: Multi-chain DeFi + Global Church Network + AGI Financial Advisor</div>
          </div>
        </div>

        <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-card/50 border border-primary/20">
            <TabsTrigger value="rag-agi" className="data-[state=active]:bg-primary/20">
              <Brain className="w-4 h-4 mr-2" />
              RAG/AGI/MCP
            </TabsTrigger>
            <TabsTrigger value="blockchain" className="data-[state=active]:bg-primary/20">
              <Zap className="w-4 h-4 mr-2" />
              BLOCKCHAIN
            </TabsTrigger>
            <TabsTrigger value="crawlers" className="data-[state=active]:bg-primary/20">
              <Database className="w-4 h-4 mr-2" />
              DATA CRAWLERS
            </TabsTrigger>
            <TabsTrigger value="infrastructure" className="data-[state=active]:bg-primary/20">
              <Globe className="w-4 h-4 mr-2" />
              INFRASTRUCTURE
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rag-agi" className="space-y-6">
            {ragAgiTasks.map((section, idx) => (
              <Card key={idx} className="bg-card/30 border-primary/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-ancient-gold text-sm font-mono">
                      {section.category}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(section.status)}>
                        {section.status}
                      </Badge>
                      <span className="text-xs text-white/60">
                        {section.completion}% COMPLETE
                      </span>
                    </div>
                  </div>
                  <Progress value={section.completion} className="h-1" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {section.tasks.map((task, taskIdx) => (
                      <div key={taskIdx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          {task.status === 'COMPLETED' ? (
                            <CheckCircle className="w-3 h-3 text-green-400" />
                          ) : task.status === 'IN_PROGRESS' ? (
                            <Clock className="w-3 h-3 text-yellow-400" />
                          ) : (
                            <AlertTriangle className="w-3 h-3 text-red-400" />
                          )}
                          <span className="text-white/80">{task.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              task.priority === 'CRITICAL' ? 'border-red-500 text-red-400' :
                              task.priority === 'HIGH' ? 'border-yellow-500 text-yellow-400' :
                              'border-blue-500 text-blue-400'
                            }`}
                          >
                            {task.priority}
                          </Badge>
                          <Badge className={getStatusColor(task.status)}>
                            {task.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="blockchain" className="space-y-6">
            {blockchainTasks.map((section, idx) => (
              <Card key={idx} className="bg-card/30 border-primary/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-ancient-gold text-sm font-mono">
                      {section.category}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(section.status)}>
                        {section.status}
                      </Badge>
                      <span className="text-xs text-white/60">
                        {section.completion}% COMPLETE
                      </span>
                    </div>
                  </div>
                  <Progress value={section.completion} className="h-1" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {section.tasks.map((task, taskIdx) => (
                      <div key={taskIdx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          {task.status === 'COMPLETED' ? (
                            <CheckCircle className="w-3 h-3 text-green-400" />
                          ) : task.status === 'IN_PROGRESS' ? (
                            <Clock className="w-3 h-3 text-yellow-400" />
                          ) : (
                            <AlertTriangle className="w-3 h-3 text-red-400" />
                          )}
                          <span className="text-white/80">{task.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              task.priority === 'CRITICAL' ? 'border-red-500 text-red-400' :
                              task.priority === 'HIGH' ? 'border-yellow-500 text-yellow-400' :
                              'border-blue-500 text-blue-400'
                            }`}
                          >
                            {task.priority}
                          </Badge>
                          <Badge className={getStatusColor(task.status)}>
                            {task.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="crawlers" className="space-y-6">
            {dataCrawlerTasks.map((section, idx) => (
              <Card key={idx} className="bg-card/30 border-primary/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-ancient-gold text-sm font-mono">
                      {section.category}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(section.status)}>
                        {section.status}
                      </Badge>
                      <span className="text-xs text-white/60">
                        {section.completion}% COMPLETE
                      </span>
                    </div>
                  </div>
                  <Progress value={section.completion} className="h-1" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      {section.tasks.map((task, taskIdx) => (
                        <div key={taskIdx} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            {task.status === 'COMPLETED' ? (
                              <CheckCircle className="w-3 h-3 text-green-400" />
                            ) : task.status === 'IN_PROGRESS' ? (
                              <Clock className="w-3 h-3 text-yellow-400" />
                            ) : (
                              <AlertTriangle className="w-3 h-3 text-red-400" />
                            )}
                            <span className="text-white/80">{task.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                task.priority === 'CRITICAL' ? 'border-red-500 text-red-400' :
                                task.priority === 'HIGH' ? 'border-yellow-500 text-yellow-400' :
                                'border-blue-500 text-blue-400'
                              }`}
                            >
                              {task.priority}
                            </Badge>
                            <Badge className={getStatusColor(task.status)}>
                              {task.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {section.metrics && (
                      <div className="border-t border-primary/20 pt-4">
                        <h4 className="text-xs text-ancient-gold mb-2">CURRENT METRICS:</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {Object.entries(section.metrics).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-white/60">{key.toUpperCase()}:</span>
                              <span className="text-green-400">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {section.targets && (
                      <div className="border-t border-primary/20 pt-4">
                        <h4 className="text-xs text-ancient-gold mb-2">TARGET COVERAGE:</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {Object.entries(section.targets).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-white/60">{key.toUpperCase()}:</span>
                              <span className="text-blue-400">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="infrastructure" className="space-y-6">
            {infrastructureTasks.map((section, idx) => (
              <Card key={idx} className="bg-card/30 border-primary/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-ancient-gold text-sm font-mono">
                      {section.category}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(section.status)}>
                        {section.status}
                      </Badge>
                      <span className="text-xs text-white/60">
                        {section.completion}% COMPLETE
                      </span>
                    </div>
                  </div>
                  <Progress value={section.completion} className="h-1" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {section.tasks.map((task, taskIdx) => (
                      <div key={taskIdx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          {task.status === 'COMPLETED' ? (
                            <CheckCircle className="w-3 h-3 text-green-400" />
                          ) : task.status === 'IN_PROGRESS' ? (
                            <Clock className="w-3 h-3 text-yellow-400" />
                          ) : (
                            <AlertTriangle className="w-3 h-3 text-red-400" />
                          )}
                          <span className="text-white/80">{task.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              task.priority === 'CRITICAL' ? 'border-red-500 text-red-400' :
                              task.priority === 'HIGH' ? 'border-yellow-500 text-yellow-400' :
                              'border-blue-500 text-blue-400'
                            }`}
                          >
                            {task.priority}
                          </Badge>
                          <Badge className={getStatusColor(task.status)}>
                            {task.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {/* Summary Footer */}
        <Card className="mt-8 bg-gradient-to-r from-ancient-gold/10 to-transparent border-ancient-gold/30">
          <CardHeader>
            <CardTitle className="text-ancient-gold text-sm font-mono">CRITICAL PATH ANALYSIS</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <h4 className="text-red-400 mb-1">IMMEDIATE PRIORITIES:</h4>
                <ul className="text-white/80 space-y-1">
                  <li>• MCP Server Implementation</li>
                  <li>• Biblical Knowledge Embeddings</li>
                  <li>• Global Church Crawler</li>
                  <li>• Daimo USDC Integration</li>
                </ul>
              </div>
              <div>
                <h4 className="text-yellow-400 mb-1">30-DAY TARGETS:</h4>
                <ul className="text-white/80 space-y-1">
                  <li>• Multi-chain Support</li>
                  <li>• Advanced RAG Pipeline</li>
                  <li>• Church Payment Verification</li>
                  <li>• Smart Contract Deployment</li>
                </ul>
              </div>
              <div>
                <h4 className="text-blue-400 mb-1">90-DAY VISION:</h4>
                <ul className="text-white/80 space-y-1">
                  <li>• AGI Financial Advisor</li>
                  <li>• Global Church Network</li>
                  <li>• Cross-chain Abstraction</li>
                  <li>• Enterprise API Launch</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default TechnicalRoadmapPage;