import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Share2, BookOpen, TrendingUp, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WisdomPost {
  id: string;
  content: string;
  verse: string;
  category: string;
  engagement: number;
}

const WisdomSharing: React.FC = () => {
  const [wisdomText, setWisdomText] = useState('');
  const [selectedVerse, setSelectedVerse] = useState('');
  const [recentPosts] = useState<WisdomPost[]>([
    {
      id: '1',
      content: 'Just learned that diversification isn\'t just smart investing - it\'s biblical wisdom! 📖💰',
      verse: 'Ecclesiastes 11:2',
      category: 'Investment',
      engagement: 42
    },
    {
      id: '2',
      content: 'The best DeFi strategy? Give first, then invest wisely. Tithing brings divine favor! 🙏',
      verse: 'Malachi 3:10',
      category: 'Tithing',
      engagement: 38
    }
  ]);

  const { toast } = useToast();

  const shareToFarcaster = () => {
    toast({
      title: "Shared to Farcaster! 🚀",
      description: "Your biblical wisdom has been shared with the community.",
    });
    setWisdomText('');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Share2 className="h-5 w-5" />
            <span>Share Biblical Wisdom</span>
          </CardTitle>
          <CardDescription>Share your financial wisdom insights on Farcaster</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Share your biblical financial wisdom..."
            value={wisdomText}
            onChange={(e) => setWisdomText(e.target.value)}
            className="min-h-[100px]"
          />
          <Button onClick={shareToFarcaster} className="w-full">
            <Share2 className="mr-2 h-4 w-4" />
            Share on Farcaster
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Wisdom Posts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentPosts.map(post => (
            <div key={post.id} className="p-4 border rounded-lg">
              <p className="mb-2">{post.content}</p>
              <div className="flex items-center justify-between text-sm">
                <Badge variant="secondary">{post.verse}</Badge>
                <span className="text-muted-foreground">{post.engagement} likes</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default WisdomSharing;