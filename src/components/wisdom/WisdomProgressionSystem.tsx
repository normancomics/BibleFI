import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useWisdomProgression } from '@/hooks/useWisdomProgression';
import { 
  Trophy, 
  Star, 
  Target, 
  Flame, 
  BookOpen, 
  Crown,
  Lock,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WisdomProgressionSystem: React.FC = () => {
  const {
    progress,
    milestones,
    achievements,
    getCurrentLevelInfo,
    getNextMilestone
  } = useWisdomProgression();

  const [selectedTab, setSelectedTab] = useState('overview');
  const levelInfo = getCurrentLevelInfo();
  const nextMilestone = getNextMilestone();

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'seeker': return 'from-slate-400 to-slate-600';
      case 'steward': return 'from-emerald-400 to-emerald-600';
      case 'shepherd': return 'from-blue-400 to-blue-600';
      case 'elder': return 'from-purple-400 to-purple-600';
      case 'solomon': return 'from-amber-400 to-amber-600';
      default: return 'from-slate-400 to-slate-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'tithing': return '💰';
      case 'saving': return '🏦';
      case 'generosity': return '❤️';
      case 'stewardship': return '⚖️';
      case 'wisdom': return '📖';
      default: return '✨';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Level Display */}
      <Card className="overflow-hidden border-primary/20">
        <div className={`bg-gradient-to-r ${getLevelColor(progress.level)} p-6`}>
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
              <motion.div 
                className="text-5xl"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {progress.level === 'solomon' ? '👑' : 
                 progress.level === 'elder' ? '🧙' :
                 progress.level === 'shepherd' ? '🐑' :
                 progress.level === 'steward' ? '🔑' : '🔍'}
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold">{levelInfo.title}</h2>
                <p className="text-white/80 text-sm italic">"{levelInfo.verse}"</p>
                <p className="text-white/60 text-xs mt-1">— {levelInfo.reference}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{progress.currentScore}</div>
              <div className="text-white/80 text-sm">Wisdom Points</div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm text-white/80 mb-1">
              <span>Level Progress</span>
              <span>{progress.levelProgress}%</span>
            </div>
            <Progress value={progress.levelProgress} className="h-3 bg-white/20" />
          </div>
        </div>

        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-lg bg-muted/50">
              <Flame className="w-6 h-6 mx-auto text-orange-500 mb-1" />
              <div className="text-xl font-bold">{progress.streak}</div>
              <div className="text-xs text-muted-foreground">Day Streak</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <Trophy className="w-6 h-6 mx-auto text-amber-500 mb-1" />
              <div className="text-xl font-bold">{progress.unlockedAchievements}/{progress.totalAchievements}</div>
              <div className="text-xs text-muted-foreground">Achievements</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <Star className="w-6 h-6 mx-auto text-primary mb-1" />
              <div className="text-xl font-bold">{milestones.filter(m => m.unlocked).length}/{milestones.length}</div>
              <div className="text-xs text-muted-foreground">Milestones</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Milestones and Achievements */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="gap-2">
            <Target className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="milestones" className="gap-2">
            <Star className="w-4 h-4" />
            Milestones
          </TabsTrigger>
          <TabsTrigger value="achievements" className="gap-2">
            <Trophy className="w-4 h-4" />
            Achievements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          {/* Next Milestone Preview */}
          {nextMilestone && (
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Next Milestone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{nextMilestone.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{nextMilestone.title}</h3>
                    <p className="text-sm text-muted-foreground">{nextMilestone.description}</p>
                    <div className="mt-2">
                      <Progress 
                        value={(progress.currentScore / nextMilestone.requiredScore) * 100} 
                        className="h-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {progress.currentScore} / {nextMilestone.requiredScore} points
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Level Journey */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Crown className="w-4 h-4" />
                Wisdom Journey
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {['seeker', 'steward', 'shepherd', 'elder', 'solomon'].map((level, index) => {
                  const isCurrentOrPast = ['seeker', 'steward', 'shepherd', 'elder', 'solomon']
                    .indexOf(progress.level) >= index;
                  const isCurrent = progress.level === level;
                  
                  return (
                    <div key={level} className="flex items-center gap-4 mb-4 last:mb-0">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center text-lg
                        ${isCurrentOrPast 
                          ? `bg-gradient-to-r ${getLevelColor(level)} text-white` 
                          : 'bg-muted text-muted-foreground'}
                        ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}
                      `}>
                        {level === 'solomon' ? '👑' : 
                         level === 'elder' ? '🧙' :
                         level === 'shepherd' ? '🐑' :
                         level === 'steward' ? '🔑' : '🔍'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium capitalize ${isCurrent ? 'text-primary' : ''}`}>
                            {level}
                          </span>
                          {isCurrent && (
                            <Badge variant="secondary" className="text-xs">Current</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {level === 'solomon' ? '1000+ points' : 
                           level === 'elder' ? '600-999 points' :
                           level === 'shepherd' ? '300-599 points' :
                           level === 'steward' ? '100-299 points' : '0-99 points'}
                        </p>
                      </div>
                      {isCurrentOrPast && !isCurrent && (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="milestones" className="mt-4">
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              <AnimatePresence>
                {milestones.map((milestone, index) => (
                  <motion.div
                    key={milestone.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={`
                      ${milestone.unlocked 
                        ? 'border-green-500/30 bg-green-500/5' 
                        : 'border-muted opacity-60'}
                    `}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className={`
                            text-3xl p-2 rounded-lg
                            ${milestone.unlocked ? 'bg-green-500/10' : 'bg-muted'}
                          `}>
                            {milestone.unlocked ? milestone.icon : <Lock className="w-6 h-6" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{milestone.title}</h3>
                              {milestone.unlocked && (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{milestone.description}</p>
                            <div className="mt-2 p-2 rounded bg-muted/50">
                              <p className="text-xs italic">"{milestone.scriptureText}"</p>
                              <p className="text-xs text-primary mt-1">— {milestone.scriptureReference}</p>
                            </div>
                            {!milestone.unlocked && (
                              <p className="text-xs text-muted-foreground mt-2">
                                Requires {milestone.requiredScore} wisdom points
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="achievements" className="mt-4">
          <ScrollArea className="h-[400px]">
            <div className="grid gap-3">
              <AnimatePresence>
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={`
                      ${achievement.unlocked 
                        ? 'border-amber-500/30 bg-amber-500/5' 
                        : ''}
                    `}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className={`
                            text-2xl p-2 rounded-lg
                            ${achievement.unlocked ? 'bg-amber-500/10' : 'bg-muted'}
                          `}>
                            {achievement.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{achievement.title}</h3>
                                <Badge variant="outline" className="text-xs">
                                  {getCategoryIcon(achievement.category)} {achievement.category}
                                </Badge>
                              </div>
                              <Badge variant="secondary">+{achievement.points} pts</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{achievement.description}</p>
                            <div className="mt-2">
                              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                <span>Progress</span>
                                <span>{achievement.progress}/{achievement.target}</span>
                              </div>
                              <Progress 
                                value={(achievement.progress / achievement.target) * 100} 
                                className="h-1.5"
                              />
                            </div>
                            <p className="text-xs text-primary/80 mt-2 italic">
                              {achievement.biblicalPrinciple}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WisdomProgressionSystem;
