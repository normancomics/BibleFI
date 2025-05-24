
import React from 'react';
import NavBar from '@/components/NavBar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Shield, Zap, Heart, Globe, Users } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <NavBar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <img 
              src="/lovable-uploads/b2a5ac39-70d2-41c8-8526-8e54375b1c1f.png" 
              alt="Bible.fi Logo" 
              className="h-20 mx-auto mb-6"
            />
            <h1 className="text-4xl font-scroll text-ancient-gold mb-4">About Bible.fi</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              The world's first Biblical DeFi platform, combining ancient wisdom with modern technology to transform how believers approach finance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card className="bg-black/40 border-ancient-gold/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-ancient-gold">
                  <BookOpen size={24} />
                  Our Mission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/90">
                  To help believers apply biblical principles to their financial lives through decentralized finance, 
                  creating a bridge between timeless wisdom and cutting-edge technology.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-ancient-gold/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-ancient-gold">
                  <Heart size={24} />
                  Our Vision
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/90">
                  A world where every financial decision is guided by biblical wisdom, where believers can grow their wealth 
                  while honoring God and supporting His kingdom work globally.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-scripture/20 border-ancient-gold/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-ancient-gold">
                  <Shield size={20} />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-white/80">
                  Military-grade encryption and security protocols protect your spiritual and financial journey.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-scripture/20 border-ancient-gold/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-ancient-gold">
                  <Zap size={20} />
                  Innovation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-white/80">
                  Built on Base Chain as a Farcaster mini-app, bringing biblical finance to the forefront of Web3.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-scripture/20 border-ancient-gold/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-ancient-gold">
                  <Globe size={20} />
                  Global Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-white/80">
                  Supporting ministries worldwide through digital tithing and biblical stewardship principles.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-black/40 border-ancient-gold/30 mb-8">
            <CardHeader>
              <CardTitle className="text-ancient-gold text-center">Biblical Foundation</CardTitle>
              <CardDescription className="text-center">
                Every feature is grounded in Scripture
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-scripture/20 p-4 rounded-lg border border-ancient-gold/30">
                  <p className="italic text-white/90 mb-2">
                    "Honor the LORD with your wealth, with the firstfruits of all your crops; then your barns will be filled to overflowing, and your vats will brim over with new wine."
                  </p>
                  <p className="text-ancient-gold text-sm">Proverbs 3:9-10</p>
                </div>
                
                <div className="bg-scripture/20 p-4 rounded-lg border border-ancient-gold/30">
                  <p className="italic text-white/90 mb-2">
                    "Invest in seven ventures, yes, in eight; you do not know what disaster may come upon the land."
                  </p>
                  <p className="text-ancient-gold text-sm">Ecclesiastes 11:2</p>
                </div>
                
                <div className="bg-scripture/20 p-4 rounded-lg border border-ancient-gold/30">
                  <p className="italic text-white/90 mb-2">
                    "The wise store up choice food and olive oil, but fools gulp theirs down."
                  </p>
                  <p className="text-ancient-gold text-sm">Proverbs 21:20</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <h2 className="text-2xl font-scroll text-ancient-gold mb-4">Built With</h2>
            <div className="flex flex-wrap justify-center gap-6 items-center">
              <div className="flex items-center gap-2">
                <img src="/lovable-uploads/922260ef-cba9-4437-9d77-07bcba6560aa.png" alt="Base Chain" className="h-8" />
                <span className="text-white/80">Base Chain</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={20} className="text-purple-400" />
                <span className="text-white/80">Farcaster Protocol</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap size={20} className="text-blue-400" />
                <span className="text-white/80">Superfluid Streams</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield size={20} className="text-green-400" />
                <span className="text-white/80">Daimo Payments</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AboutPage;
