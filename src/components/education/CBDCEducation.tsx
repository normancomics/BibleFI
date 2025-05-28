
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Shield, Eye, Lock, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import PixelCharacter from '@/components/PixelCharacter';
import { useSound } from '@/contexts/SoundContext';

const CBDCEducation: React.FC = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const { playSound } = useSound();

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
    playSound('select');
  };

  const cbdcConcerns = [
    {
      id: 'surveillance',
      title: 'Financial Surveillance',
      icon: <Eye size={20} className="text-red-400" />,
      summary: 'CBDCs can enable unprecedented government monitoring of all transactions',
      details: `Central Bank Digital Currencies (CBDCs) create a direct digital trail of every transaction you make. Unlike cash, which provides privacy, or even traditional bank accounts with some privacy protections, CBDCs can give governments real-time visibility into:
      
• Every purchase you make and where you make it
• Your spending patterns and personal habits  
• Who you send money to and receive money from
• Your financial associations and relationships
• Your geographic movements through spending data

This level of surveillance goes far beyond what was possible with traditional currencies and could fundamentally change the relationship between citizens and government.`
    },
    {
      id: 'control',
      title: 'Asset Control & Freezing',
      icon: <Lock size={20} className="text-orange-400" />,
      summary: 'Governments could freeze, limit, or control your funds instantly',
      details: `CBDCs give central authorities unprecedented control over your money:

• Instant asset freezing without court orders
• Spending restrictions based on government policies
• Geographic limitations on where you can spend
• Time-based restrictions (weekends, holidays, etc.)
• Category restrictions (no "unapproved" purchases)
• Forced spending (negative interest rates)
• Social credit score integration
• Political dissent punishment through financial restriction

Traditional banks require legal processes for account freezing, but CBDCs could enable instant, automated control based on algorithms or political decisions.`
    },
    {
      id: 'programmability',
      title: 'Programmable Money',
      icon: <AlertTriangle size={20} className="text-yellow-400" />,
      summary: 'Your money could have built-in rules about how and when you can spend it',
      details: `CBDCs can be programmed with rules that control your spending automatically:

• Expiration dates on your money (use it or lose it)
• Restricted merchants or categories
• Mandatory spending quotas or limits
• Automatic tax deduction at point of sale
• Carbon footprint tracking and restrictions
• Health-related purchase monitoring and blocking
• Social behavior incentives and punishments
• Automatic redistribution based on wealth algorithms

This "smart money" concept means your currency itself becomes a tool of social engineering and behavioral control.`
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-red-900/30 to-orange-900/30 border-red-500/50">
        <CardHeader>
          <CardTitle className="text-red-300 flex items-center gap-2">
            <AlertTriangle size={24} />
            CBDC Awareness: Protect Your Financial Freedom
          </CardTitle>
          <p className="text-white/80">
            Understanding the potential risks of Central Bank Digital Currencies (CBDCs) and why decentralized alternatives matter for financial sovereignty.
          </p>
        </CardHeader>
        <CardContent>
          <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg mb-4">
            <h4 className="font-semibold text-red-300 mb-2">Important Disclaimer</h4>
            <p className="text-white/90 text-sm">
              This information is provided for educational purposes to help users understand potential concerns 
              raised by privacy advocates, economists, and citizens worldwide regarding CBDCs. We encourage 
              informed decision-making about your financial tools and sovereignty.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* CBDC Concerns */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-ancient-gold mb-4">Key CBDC Concerns</h3>
        {cbdcConcerns.map((concern) => (
          <Card key={concern.id} className="bg-black/40 border-ancient-gold/30">
            <CardHeader>
              <Button
                variant="ghost"
                className="w-full justify-between p-0 h-auto text-left"
                onClick={() => toggleSection(concern.id)}
              >
                <div className="flex items-center gap-3">
                  {concern.icon}
                  <div>
                    <h4 className="font-semibold text-white">{concern.title}</h4>
                    <p className="text-white/70 text-sm">{concern.summary}</p>
                  </div>
                </div>
                {expandedSection === concern.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </Button>
            </CardHeader>
            {expandedSection === concern.id && (
              <CardContent>
                <div className="bg-black/20 border border-ancient-gold/20 p-4 rounded-lg">
                  <p className="text-white/90 text-sm whitespace-pre-line leading-relaxed">
                    {concern.details}
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Biblical End Times Perspective */}
      <Card className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-500/50">
        <CardHeader>
          <CardTitle className="text-purple-300 flex items-center gap-2">
            <BookOpen size={24} />
            Biblical Perspective: End Times & The Mark of the Beast
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start mb-4">
            <PixelCharacter 
              character="jesus" 
              message="Do not be afraid of those who kill the body but cannot kill the soul. Rather, be afraid of the One who can destroy both soul and body in hell. - Matthew 10:28" 
              size="md"
              soundEffect={true}
            />
          </div>
          
          <div className="bg-purple-900/20 border border-purple-500/30 p-4 rounded-lg space-y-3">
            <h4 className="font-semibold text-purple-300">Bible.fi's Theological Position</h4>
            
            <div className="space-y-3 text-white/90">
              <p>
                <strong>We do NOT believe CBDCs or cryptocurrencies are the Mark of the Beast.</strong> 
                While some end-times focused church leaders have expressed this concern, we believe 
                this view misunderstands the spiritual nature of the Mark described in Revelation.
              </p>
              
              <div className="bg-black/20 p-3 rounded border border-purple-400/20">
                <p className="italic font-scroll text-purple-200">
                  "It also forced all people, great and small, rich and poor, free and slave, to receive a mark on their right hands or on their foreheads, so that they could not buy or sell unless they had the mark, which is the name of the beast or the number of its name." - Revelation 13:16-17
                </p>
              </div>
              
              <p>
                <strong>The Mark of the Beast will be fundamentally spiritual</strong> - something that changes your very soul and represents a conscious rejection of Christ. It will involve:
              </p>
              
              <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                <li>A willful denial of Jesus Christ as Lord and Savior</li>
                <li>Worship of the beast/antichrist instead of God</li>
                <li>A spiritual transformation that affects the soul</li>
                <li>Full knowledge of what one is rejecting (God's clear warning)</li>
                <li>Choosing temporal commerce over eternal salvation</li>
              </ul>
              
              <p>
                While CBDCs pose legitimate concerns about financial freedom and government overreach, 
                they are tools - not spiritual markers. Christians should be wise about financial 
                sovereignty while not conflating technological concerns with end-times prophecy.
              </p>
            </div>
          </div>
          
          <div className="bg-green-900/20 border border-green-500/30 p-4 rounded-lg">
            <h4 className="font-semibold text-green-300 mb-2">Our Encouragement</h4>
            <p className="text-white/90 text-sm">
              Be wise as serpents and harmless as doves (Matthew 10:16). Understand the tools you use, 
              protect your privacy and financial sovereignty, but don't let fear of technology distract 
              from the Gospel. Use wisdom in your financial choices while keeping your ultimate trust in Christ.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Alternatives & Solutions */}
      <Card className="bg-black/40 border-ancient-gold/30">
        <CardHeader>
          <CardTitle className="text-ancient-gold flex items-center gap-2">
            <Shield size={24} />
            Protecting Your Financial Sovereignty
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-900/20 border border-green-500/30 p-4 rounded-lg">
              <h4 className="font-semibold text-green-300 mb-2">Decentralized Alternatives</h4>
              <ul className="text-white/80 text-sm space-y-1">
                <li>• Use cryptocurrencies like Bitcoin and Ethereum</li>
                <li>• Maintain privacy coins for sensitive transactions</li>
                <li>• Diversify across multiple decentralized networks</li>
                <li>• Learn about self-custody wallet management</li>
              </ul>
            </div>
            
            <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-300 mb-2">Practical Steps</h4>
              <ul className="text-white/80 text-sm space-y-1">
                <li>• Keep some physical cash reserves</li>
                <li>• Use Bible.fi's DeFi tools for decentralized finance</li>
                <li>• Educate yourself about monetary policy</li>
                <li>• Support privacy-preserving financial technologies</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-ancient-scroll border border-ancient-gold/30 p-4 rounded-lg">
            <PixelCharacter 
              character="solomon" 
              message="The simple believe anything, but the prudent give thought to their steps. - Proverbs 14:15" 
              size="md"
              soundEffect={true}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CBDCEducation;
