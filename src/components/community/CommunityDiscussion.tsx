
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import PixelButton from "@/components/PixelButton";
import { Share2, Users, MessageSquare, Heart, BookOpen, User } from "lucide-react";
import { useSound } from "@/contexts/SoundContext";
import { useToast } from "@/hooks/use-toast";

// Mock community discussions
const mockDiscussions = [
  {
    id: "1",
    user: "SolomonDisciple",
    avatar: "solomon",
    topic: "Understanding the Parable of the Talents",
    message: "How can we apply the Parable of the Talents to modern investment strategies?",
    likes: 12,
    replies: 5,
    timestamp: "2h ago"
  },
  {
    id: "2",
    user: "GoodSteward",
    avatar: "david",
    topic: "Ethical crypto investments",
    message: "Which crypto projects align best with biblical principles of stewardship?",
    likes: 8,
    replies: 3,
    timestamp: "5h ago"
  },
  {
    id: "3",
    user: "JosephsStrategy",
    avatar: "moses",
    topic: "Saving during abundance",
    message: "Let's discuss Joseph's 7-year storage plan and how we can apply it today.",
    likes: 15,
    replies: 7,
    timestamp: "1d ago"
  }
];

interface CommunityDiscussionProps {
  simplified?: boolean;
}

const CommunityDiscussion: React.FC<CommunityDiscussionProps> = ({ simplified = false }) => {
  const { playSound } = useSound();
  const { toast } = useToast();
  const [connected, setConnected] = useState(false);

  const handleConnect = () => {
    playSound("powerup");
    setConnected(true);
    toast({
      title: "Farcaster Connection Initiated",
      description: "Please authorize Bible.fi to connect with your Farcaster account.",
    });
  };

  const handleShareTopic = () => {
    playSound("select");
    toast({
      title: "Share on Farcaster",
      description: "Create a new discussion topic about biblical finances.",
    });
  };
  
  const handleJoinGroup = () => {
    playSound("coin");
    toast({
      title: "Study Group Formation",
      description: "Join or create an investment study group based on biblical principles.",
    });
  };

  return (
    <Card className="pixel-card mt-8">
      <CardContent className="pt-6">
        <div className="relative px-4 py-2 mb-4 bg-gradient-to-r from-pixel-blue/60 via-pixel-blue to-pixel-blue/60 border-2 border-ancient-gold">
          <div className="absolute inset-0 bg-black/10 opacity-30"></div>
          <div className="absolute top-0 left-0 w-full h-0.5 bg-ancient-gold"></div>
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-ancient-gold"></div>
          <div className="absolute -left-1 -top-1 w-2 h-2 border-t border-l border-ancient-gold"></div>
          <div className="absolute -right-1 -top-1 w-2 h-2 border-t border-r border-ancient-gold"></div>
          <div className="absolute -left-1 -bottom-1 w-2 h-2 border-b border-l border-ancient-gold"></div>
          <div className="absolute -right-1 -bottom-1 w-2 h-2 border-b border-r border-ancient-gold"></div>
          <h3 className="text-xl font-scroll text-white drop-shadow-[0_0_5px_rgba(255,215,0,0.5)] flex items-center relative z-10" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5), 0 0 6px rgba(255,215,0,0.7)' }}>
            <Users size={20} className="text-ancient-gold mr-2" /> 
            Community Discussion
          </h3>
        </div>
        
        {!connected ? (
          <div className="text-center py-6">
            <p className="mb-4 text-sm">Connect your Farcaster account to join the discussion on biblical financial principles.</p>
            <PixelButton onClick={handleConnect}>
              Connect to Farcaster
            </PixelButton>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-scroll">Recent Discussions</h2>
              <div className="flex gap-2">
                <PixelButton size="sm" variant="outline" onClick={handleShareTopic}>
                  <Share2 size={16} className="mr-1" /> New Topic
                </PixelButton>
                <PixelButton size="sm" onClick={handleJoinGroup}>
                  <Users size={16} className="mr-1" /> Study Groups
                </PixelButton>
              </div>
            </div>
            
            {!simplified ? (
              <div className="space-y-4">
                {mockDiscussions.map(discussion => (
                  <div key={discussion.id} className="border border-scripture/20 rounded-md p-3 hover:bg-black/5 cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 bg-scripture rounded-full flex items-center justify-center text-white mr-2">
                          <User size={16} />
                        </div>
                        <div>
                          <div className="font-pixel text-sm">{discussion.user}</div>
                          <div className="text-xs text-muted-foreground">{discussion.timestamp}</div>
                        </div>
                      </div>
                      <div className="text-xs bg-scripture/10 rounded-full px-2 py-1">
                        <BookOpen size={12} className="inline mr-1" /> Finance
                      </div>
                    </div>
                    <h3 className="font-semibold mb-1">{discussion.topic}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{discussion.message}</p>
                    <div className="flex text-xs text-muted-foreground">
                      <span className="flex items-center mr-3">
                        <Heart size={12} className="mr-1" /> {discussion.likes}
                      </span>
                      <span className="flex items-center">
                        <MessageSquare size={12} className="mr-1" /> {discussion.replies} replies
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center mb-4">Join the discussion about biblical financial principles with others and form investment study groups.</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CommunityDiscussion;
