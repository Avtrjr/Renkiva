import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { 
  Sparkles, 
  Brain, 
  TrendingUp, 
  Users, 
  Star,
  RefreshCw,
  Send,
  Lightbulb
} from 'lucide-react';
import { useToast } from './ui/use-toast';

interface AIRecommendation {
  id: string;
  type: 'content' | 'channel' | 'user' | 'trending';
  title: string;
  description: string;
  confidence: number;
  reason: string;
  metadata?: {
    category?: string;
    rating?: number;
    popularity?: number;
    trustLevel?: 'verified' | 'private' | 'anonymous';
  };
}

interface ContentSuggestion {
  id: string;
  title: string;
  description: string;
  tags: string[];
  estimatedViews: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export function AIContentHelper() {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [contentSuggestions, setContentSuggestions] = useState<ContentSuggestion[]>([]);
  const [userPrompt, setUserPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'recommendations' | 'suggestions' | 'chat'>('recommendations');
  const { toast } = useToast();

  // Simulate AI recommendations
  useEffect(() => {
    const generateRecommendations = () => {
      const mockRecommendations: AIRecommendation[] = [
        {
          id: '1',
          type: 'content',
          title: 'Sci-Fi Movie Collection',
          description: 'Based on your viewing history, you might enjoy these space exploration films',
          confidence: 0.87,
          reason: 'High match with your previous sci-fi preferences',
          metadata: {
            category: 'Movies',
            rating: 4.5,
            popularity: 78,
            trustLevel: 'verified'
          }
        },
        {
          id: '2',
          type: 'channel',
          title: 'Tech Review Network',
          description: 'Private channel for latest technology reviews and discussions',
          confidence: 0.75,
          reason: 'Matches your tech interest profile',
          metadata: {
            category: 'Technology',
            trustLevel: 'private'
          }
        },
        {
          id: '3',
          type: 'trending',
          title: 'Mesh Gaming Hub',
          description: 'Gaming content is trending 45% higher in your mesh network',
          confidence: 0.92,
          reason: 'Local network trending analysis',
          metadata: {
            category: 'Gaming',
            popularity: 145,
            trustLevel: 'verified'
          }
        },
        {
          id: '4',
          type: 'user',
          title: 'Creative Collective',
          description: 'Connect with verified content creators in your area',
          confidence: 0.68,
          reason: 'Geographic proximity + shared interests',
          metadata: {
            trustLevel: 'verified'
          }
        }
      ];

      const mockSuggestions: ContentSuggestion[] = [
        {
          id: '1',
          title: 'Local Mesh Network Tutorial',
          description: 'Create a guide on setting up BLE mesh networks for beginners',
          tags: ['tutorial', 'networking', 'beginner'],
          estimatedViews: 1200,
          difficulty: 'beginner'
        },
        {
          id: '2',
          title: 'Privacy-First Streaming',
          description: 'Showcase anonymous content sharing without compromising quality',
          tags: ['privacy', 'streaming', 'security'],
          estimatedViews: 850,
          difficulty: 'intermediate'
        },
        {
          id: '3',
          title: 'Mesh Network Art Project',
          description: 'Collaborative digital art created across mesh networks',
          tags: ['art', 'collaboration', 'creative'],
          estimatedViews: 600,
          difficulty: 'advanced'
        }
      ];

      setRecommendations(mockRecommendations);
      setContentSuggestions(mockSuggestions);
    };

    generateRecommendations();
  }, []);

  const handleAIChat = async () => {
    if (!userPrompt.trim()) return;

    setIsLoading(true);
    try {
      // Simulate AI response
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const responses = [
        `Based on your mesh network activity, I'd recommend focusing on privacy-themed content. Your audience shows 73% preference for anonymous sharing features.`,
        `I notice your content performs 34% better when posted during evening hours (6-9 PM). Consider scheduling your next upload accordingly.`,
        `Your sci-fi content has the highest engagement rate (4.2x average). I suggest creating a series around space exploration themes.`,
        `The mesh network near you is trending toward educational content. Tutorial-style videos could increase your reach by 60%.`
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setAiResponse(randomResponse);
      
      toast({
        title: "AI Assistant",
        description: "Generated personalized recommendation based on your mesh activity.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setUserPrompt('');
    }
  };

  const refreshRecommendations = () => {
    setIsLoading(true);
    setTimeout(() => {
      // Rotate recommendations with new ones
      const currentTime = Date.now();
      const updatedRecs = recommendations.map(rec => ({
        ...rec,
        confidence: Math.min(0.95, rec.confidence + Math.random() * 0.1),
        id: `${rec.id}_${currentTime}`
      }));
      setRecommendations(updatedRecs);
      setIsLoading(false);
      
      toast({
        title: "Recommendations Updated",
        description: "AI has analyzed latest mesh activity for fresh suggestions.",
      });
    }, 1000);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.6) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getTrustBadgeVariant = (trustLevel?: string) => {
    switch (trustLevel) {
      case 'verified': return 'default';
      case 'private': return 'secondary';
      case 'anonymous': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <Card className="ai-helper-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary animate-pulse-mesh" />
            AI Content Helper
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Badge className="ai-active">
              <Brain className="w-3 h-3 mr-1" />
              Neural Active
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              onClick={refreshRecommendations}
              disabled={isLoading}
              className="mesh-button"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg">
          {[
            { id: 'recommendations', label: 'Recommendations', icon: TrendingUp },
            { id: 'suggestions', label: 'Content Ideas', icon: Lightbulb },
            { id: 'chat', label: 'AI Chat', icon: Brain }
          ].map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant={activeTab === id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(id as any)}
              className="flex-1"
            >
              <Icon className="w-4 h-4 mr-1" />
              {label}
            </Button>
          ))}
        </div>

        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <div className="space-y-3">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="border border-border/50 rounded-lg p-3 space-y-2 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{rec.title}</h4>
                      {rec.metadata?.trustLevel && (
                        <Badge variant={getTrustBadgeVariant(rec.metadata.trustLevel)} className="text-xs">
                          {rec.metadata.trustLevel === 'verified' ? '⭐' : 
                           rec.metadata.trustLevel === 'private' ? '🔒' : '👻'}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{rec.description}</p>
                    <p className="text-xs text-primary/80">{rec.reason}</p>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-xs font-mono ${getConfidenceColor(rec.confidence)}`}>
                      {Math.round(rec.confidence * 100)}%
                    </div>
                    {rec.metadata?.popularity && (
                      <div className="text-xs text-muted-foreground">
                        {rec.metadata.popularity}% trend
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {rec.type === 'content' ? '📹' : 
                     rec.type === 'channel' ? '📡' : 
                     rec.type === 'user' ? '👤' : '📈'} {rec.type}
                  </Badge>
                  
                  <Button size="sm" variant="ghost" className="text-xs h-6">
                    Explore
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Content Suggestions Tab */}
        {activeTab === 'suggestions' && (
          <div className="space-y-3">
            {contentSuggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="border border-border/50 rounded-lg p-3 space-y-2 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm mb-1">{suggestion.title}</h4>
                    <p className="text-xs text-muted-foreground mb-2">{suggestion.description}</p>
                    
                    <div className="flex items-center gap-2 mb-2">
                      {suggestion.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>📊 {suggestion.estimatedViews} views</span>
                    <Badge 
                      variant={suggestion.difficulty === 'beginner' ? 'default' : 
                              suggestion.difficulty === 'intermediate' ? 'secondary' : 'destructive'}
                      className="text-xs"
                    >
                      {suggestion.difficulty}
                    </Badge>
                  </div>
                  
                  <Button size="sm" variant="ghost" className="text-xs h-6">
                    Create
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* AI Chat Tab */}
        {activeTab === 'chat' && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Textarea
                placeholder="Ask AI about content strategy, mesh optimization, or audience insights..."
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                className="min-h-[80px] text-sm"
              />
              
              <Button
                onClick={handleAIChat}
                disabled={isLoading || !userPrompt.trim()}
                className="w-full"
                size="sm"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                {isLoading ? 'AI Thinking...' : 'Ask AI'}
              </Button>
            </div>

            {aiResponse && (
              <div className="border border-primary/20 rounded-lg p-3 bg-primary/5">
                <div className="flex items-start gap-2">
                  <Brain className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-primary mb-1">AI Assistant</p>
                    <p className="text-xs text-muted-foreground">{aiResponse}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}