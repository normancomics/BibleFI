import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, FileText, Users, Lock } from 'lucide-react';

export const LegalFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background/95 backdrop-blur-sm border-t border-border/50 mt-auto">
      <div className="container mx-auto px-4 py-8">
        {/* Copyright and Trademark Section */}
        <div className="text-center mb-6 space-y-2">
          <div className="text-sm text-muted-foreground">
            © {currentYear} BibleFi Holdings LLC. All rights reserved.
          </div>
          <div className="text-xs text-muted-foreground">
            BibleFi™, Biblefi.xyz™, Biblical DeFi™, and $BIBLEFI™ are trademarks of BibleFi Holdings LLC. 
            Built on Base Chain with Biblical principles. USPTO Applications Pending.
          </div>
        </div>

        {/* IP Protection Notice */}
        <div className="bg-card/50 rounded-lg p-4 mb-6 border border-border/30">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Intellectual Property Protection:</strong> This work, including smart contract 
              architecture, algorithmic implementations, Biblical principle → DeFi mechanism mapping, tithing algorithms, 
              wisdom scoring methodology, and faith-based yield optimization formulas, is protected under U.S. and 
              international copyright laws. The unique synthesis of Biblical principles with DeFi protocols constitutes 
              a proprietary methodology and trade secret. Unauthorized copying, modification, or distribution is strictly prohibited.
            </div>
          </div>
        </div>

        {/* Legal Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Link 
            to="/terms" 
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors p-2 rounded hover:bg-accent/50"
          >
            <FileText className="h-4 w-4" />
            Terms of Service
          </Link>
          <Link 
            to="/privacy" 
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors p-2 rounded hover:bg-accent/50"
          >
            <Lock className="h-4 w-4" />
            Privacy Policy
          </Link>
          <Link 
            to="/security" 
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors p-2 rounded hover:bg-accent/50"
          >
            <Shield className="h-4 w-4" />
            Security
          </Link>
          <Link 
            to="/compliance" 
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors p-2 rounded hover:bg-accent/50"
          >
            <Users className="h-4 w-4" />
            Compliance
          </Link>
        </div>

        {/* Disclaimers */}
        <div className="space-y-3 text-xs text-muted-foreground/80">
          <div className="text-center">
            <strong>Risk Disclaimer:</strong> DeFi protocols involve financial risk. Past performance does not guarantee future results. 
            Consult financial advisors before making investment decisions.
          </div>
          <div className="text-center">
            <strong>Religious Disclaimer:</strong> Biblical references are for educational and inspirational purposes. 
            Consult religious authorities for spiritual guidance.
          </div>
          <div className="text-center">
            <strong>Regulatory Notice:</strong> Services may not be available in all jurisdictions. 
            Users are responsible for compliance with local laws.
          </div>
        </div>

        {/* Made with Love */}
        <div className="text-center mt-6 pt-4 border-t border-border/30">
          <div className="text-xs text-muted-foreground">
            Made with ❤️ for the Kingdom • Built on Base Chain
          </div>
        </div>
      </div>
    </footer>
  );
};