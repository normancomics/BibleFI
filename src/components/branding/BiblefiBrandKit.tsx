import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, Copy, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface BrandAsset {
  name: string;
  description: string;
  preview: string;
  downloadUrl: string;
  size?: string;
  format?: string;
}

interface ColorPalette {
  name: string;
  hex: string;
  hsl: string;
  usage: string;
}

const BiblefiBrandKit: React.FC = () => {
  const { toast } = useToast();
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  // Logo Assets
  const logoAssets: BrandAsset[] = [
    {
      name: "Bible.fi Logo + Text (White)",
      description: "Bible.fi logo with text for dark backgrounds",
      preview: "/bible-fi-brand-logo.png",
      downloadUrl: "/bible-fi-brand-logo.png",
      format: "PNG"
    },
    {
      name: "Bible.fi Logo + Text (Dark)",
      description: "Bible.fi logo with text for light backgrounds",
      preview: "/bible-fi-brand-logo-v2.png",
      downloadUrl: "/bible-fi-brand-logo-v2.png",
      format: "PNG"
    },
    {
      name: "Bible.fi Text Logo (Exact)",
      description: "Standalone text logo with perfect pixel alignment",
      preview: "/bible-fi-text-exact.png",
      downloadUrl: "/bible-fi-text-exact.png",
      format: "PNG"
    },
    {
      name: "Bible Icon (Pixel)",
      description: "Standalone Bible book icon in pixel art style",
      preview: "/bible-book-exact.png",
      downloadUrl: "/bible-book-exact.png",
      format: "PNG"
    },
    {
      name: "Glowing Bible Icon",
      description: "Bible icon with divine glow effect",
      preview: "/glowing-bible-icon.png",
      downloadUrl: "/glowing-bible-icon.png",
      format: "PNG"
    },
    {
      name: "Bible.fi Square (iOS)",
      description: "Square format logo for app icons and profile pictures",
      preview: "/bible-fi-ios-icon.png",
      downloadUrl: "/bible-fi-ios-icon.png",
      format: "PNG"
    }
  ];

  // Color Palette
  const colorPalette: ColorPalette[] = [
    {
      name: "Divine Purple",
      hex: "#7C3AED",
      hsl: "hsl(280, 100%, 65%)",
      usage: "Primary brand color, buttons, highlights"
    },
    {
      name: "Ancient Gold",
      hex: "#F59E0B",
      hsl: "hsl(45, 100%, 55%)",
      usage: "Secondary color, accents, wisdom elements"
    },
    {
      name: "Sacred White",
      hex: "#FAFAFA",
      hsl: "hsl(0, 0%, 98%)",
      usage: "Text on dark backgrounds, card backgrounds"
    },
    {
      name: "Holy Navy",
      hex: "#1E1B39",
      hsl: "hsl(220, 27%, 8%)",
      usage: "Dark backgrounds, main background"
    },
    {
      name: "Base Blue",
      hex: "#0052FF",
      hsl: "hsl(200, 100%, 55%)",
      usage: "Base chain indicators, links"
    },
    {
      name: "Temple Stone",
      hex: "#D1D5DB",
      hsl: "hsl(0, 0%, 75%)",
      usage: "Borders, subtle backgrounds"
    }
  ];

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedColor(text);
    toast({
      title: "Copied!",
      description: `${type} copied to clipboard`,
    });
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const downloadAsset = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download Started",
      description: `Downloading ${filename}`,
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl md:text-6xl font-bold font-scroll">
            Bible.fi Brand Guidelines
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Biblical DeFi Brand Assets - Rules, guidelines, and downloadable assets for proper Bible.fi branding usage
          </p>
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="font-pixel">BIBLEFI.BASE.ETH</span>
            <Badge variant="outline" className="font-pixel">
              v1.0
            </Badge>
          </div>
        </motion.div>

        {/* Brand Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="font-scroll">Brand Overview</CardTitle>
              <CardDescription>
                Bible.fi represents the intersection of biblical wisdom and decentralized finance, built on Base chain
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div className="space-y-2">
                  <h4 className="font-semibold font-scroll">Mission</h4>
                  <p className="text-sm text-muted-foreground">
                    Biblical stewardship for modern finance
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold font-scroll">Vision</h4>
                  <p className="text-sm text-muted-foreground">
                    Faith-driven financial wisdom for all
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold font-scroll">Values</h4>
                  <p className="text-sm text-muted-foreground">
                    Transparency, wisdom, stewardship
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Logo Assets */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="font-scroll">Logo Assets</CardTitle>
              <CardDescription>
                Different variations of the Bible.fi logo for various use cases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {logoAssets.map((asset, index) => (
                  <div key={index} className="space-y-3">
                    <div className="aspect-square bg-muted rounded-lg p-4 flex items-center justify-center">
                      <img
                        src={asset.preview}
                        alt={asset.name}
                        className="max-w-full max-h-full object-contain pixelated"
                      />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm font-scroll">{asset.name}</h4>
                      <p className="text-xs text-muted-foreground">{asset.description}</p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadAsset(asset.downloadUrl, asset.name)}
                          className="text-xs"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                        {asset.format && (
                          <Badge variant="secondary" className="text-xs">
                            {asset.format}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Color Palette */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="font-scroll">Color Palette</CardTitle>
              <CardDescription>
                Official Bible.fi colors with HSL and hex values
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {colorPalette.map((color, index) => (
                  <div key={index} className="space-y-3">
                    <div 
                      className="h-20 rounded-lg border-2 border-border cursor-pointer hover:scale-105 transition-transform"
                      style={{ backgroundColor: color.hex }}
                      onClick={() => copyToClipboard(color.hex, "Hex color")}
                    />
                    <div className="space-y-2">
                      <h4 className="font-semibold font-scroll">{color.name}</h4>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">HEX:</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-1 font-mono"
                            onClick={() => copyToClipboard(color.hex, "Hex color")}
                          >
                            {color.hex}
                            {copiedColor === color.hex ? (
                              <CheckCircle className="w-3 h-3 ml-1 text-green-500" />
                            ) : (
                              <Copy className="w-3 h-3 ml-1" />
                            )}
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">HSL:</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-1 font-mono text-xs"
                            onClick={() => copyToClipboard(color.hsl, "HSL color")}
                          >
                            {color.hsl}
                            {copiedColor === color.hsl ? (
                              <CheckCircle className="w-3 h-3 ml-1 text-green-500" />
                            ) : (
                              <Copy className="w-3 h-3 ml-1" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{color.usage}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Brand Guidelines */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-2 gap-6"
        >
          {/* Do's */}
          <Card>
            <CardHeader>
              <CardTitle className="font-scroll text-green-600 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Do's
              </CardTitle>
              <CardDescription>
                Approved uses of Bible.fi brand assets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <p>✅ Use official assets in good faith to represent Bible.fi</p>
                <p>✅ Use in DeFi projects affiliated with biblical wisdom</p>
                <p>✅ Use in educational content about faith and finance</p>
                <p>✅ Use in hackathons and events on Base chain</p>
                <p>✅ Maintain original proportions and colors</p>
                <p>✅ Ensure proper contrast for readability</p>
                <p>✅ Link back to Bible.fi when appropriate</p>
              </div>
            </CardContent>
          </Card>

          {/* Don'ts */}
          <Card>
            <CardHeader>
              <CardTitle className="font-scroll text-red-600 flex items-center">
                <XCircle className="w-5 h-5 mr-2" />
                Don'ts
              </CardTitle>
              <CardDescription>
                Prohibited uses of Bible.fi brand assets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <p>❌ Modify colors, fonts, or appearance</p>
                <p>❌ Use in business names without permission</p>
                <p>❌ Create confusingly similar assets</p>
                <p>❌ Use in false or misleading contexts</p>
                <p>❌ Display more prominently than your own brand</p>
                <p>❌ Use in objectionable or inappropriate content</p>
                <p>❌ Stretch, distort, or alter the logo proportions</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contract Information */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="font-scroll">Contract Information</CardTitle>
              <CardDescription>
                Official Bible.fi smart contract details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold font-scroll">ENS Domain</h4>
                  <div className="flex items-center gap-2">
                    <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                      biblefi.base.eth
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard("biblefi.base.eth", "ENS domain")}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold font-scroll">Base Chain</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">
                      Base Mainnet
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open("https://base.org", "_blank")}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center py-8"
        >
          <Separator className="mb-6" />
          <p className="text-sm text-muted-foreground font-scroll">
            Bible.fi Brand Guidelines v1.0 - Built with faith on Base chain
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            For brand partnerships and licensing inquiries, please contact us through our official channels
          </p>
        </motion.div>

      </div>
    </div>
  );
};

export default BiblefiBrandKit;