import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, CheckCircle, ExternalLink, Lock, Eye } from "lucide-react";

interface SecurityAudit {
  protocol: string;
  auditFirm: string;
  score: number;
  status: 'passed' | 'warning' | 'failed';
  lastAudit: string;
  findings: number;
  criticalIssues: number;
  reportUrl?: string;
}

const SecurityAuditCard: React.FC = () => {
  const audits: SecurityAudit[] = [
    {
      protocol: "BibleFi Core",
      auditFirm: "CertiK",
      score: 95,
      status: 'passed',
      lastAudit: '2024-01-15',
      findings: 0,
      criticalIssues: 0,
      reportUrl: "#"
    },
    {
      protocol: "Staking Contract",
      auditFirm: "Trail of Bits",
      score: 92,
      status: 'passed',
      lastAudit: '2024-01-20',
      findings: 2,
      criticalIssues: 0,
      reportUrl: "#"
    },
    {
      protocol: "Tithe Distribution",
      auditFirm: "OpenZeppelin",
      score: 98,
      status: 'passed',
      lastAudit: '2024-01-25',
      findings: 0,
      criticalIssues: 0,
      reportUrl: "#"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'text-green-400 bg-green-400/20';
      case 'warning': return 'text-yellow-400 bg-yellow-400/20';
      case 'failed': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'failed': return <AlertTriangle className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  return (
    <Card className="border-scripture/30 bg-black/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-ancient-gold" />
          <span>Security Audits</span>
        </CardTitle>
        <CardDescription>
          Third-party security audits ensuring the safety of your funds
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {audits.map((audit, index) => (
          <div key={index} className="border border-white/10 rounded-lg p-4 bg-black/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-ancient-gold" />
                <span className="font-medium text-white">{audit.protocol}</span>
              </div>
              <Badge className={`${getStatusColor(audit.status)} border-0`}>
                <div className="flex items-center gap-1">
                  {getStatusIcon(audit.status)}
                  <span className="capitalize">{audit.status}</span>
                </div>
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
              <div>
                <p className="text-white/60">Audit Firm</p>
                <p className="font-medium text-white">{audit.auditFirm}</p>
              </div>
              <div>
                <p className="text-white/60">Security Score</p>
                <p className="font-medium text-ancient-gold">{audit.score}/100</p>
              </div>
              <div>
                <p className="text-white/60">Last Audit</p>
                <p className="font-medium text-white">{audit.lastAudit}</p>
              </div>
              <div>
                <p className="text-white/60">Critical Issues</p>
                <p className={`font-medium ${audit.criticalIssues === 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {audit.criticalIssues}
                </p>
              </div>
            </div>
            
            {audit.reportUrl && (
              <Button 
                variant="link" 
                className="text-scripture hover:text-ancient-gold p-0 h-auto"
                onClick={() => window.open(audit.reportUrl, '_blank')}
              >
                <span className="flex items-center gap-1 text-sm">
                  View Full Report
                  <ExternalLink className="h-3 w-3" />
                </span>
              </Button>
            )}
          </div>
        ))}
        
        <div className="bg-black/30 p-3 rounded-lg border border-ancient-gold/20 mt-4">
          <div className="flex items-center gap-2 text-ancient-gold mb-2">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-medium">Biblical Security Principle</span>
          </div>
          <p className="text-xs italic text-white/80">
            "Above all else, guard your heart, for everything you do flows from it."
          </p>
          <p className="text-xs text-ancient-gold/70 text-right mt-1">Proverbs 4:23</p>
          <p className="text-xs text-white/70 mt-2">
            Just as we guard our hearts, we guard your digital assets with the highest security standards.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityAuditCard;