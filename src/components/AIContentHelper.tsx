import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Lightbulb,
  Play,
  X
} from 'lucide-react';
import { useToast } from './ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface AIRecommendation {
  id: string;
  type: 'content' | 'channel' | 'user' | 'trending';
  title: string;
  description: string;
  confidence: number;
  reason: string;
  videoUrl?: string;
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
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [contentSuggestions, setContentSuggestions] = useState<ContentSuggestion[]>([]);
  const [userPrompt, setUserPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'recommendations' | 'suggestions' | 'chat'>('recommendations');
  const [videoPopupOpen, setVideoPopupOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<{ title: string; url: string } | null>(null);
  const { toast } = useToast();

  // Simulate AI recommendations
  useEffect(() => {
    const generateRecommendations = () => {
      const mockRecommendations: AIRecommendation[] = [
        {
          id: '1',
          type: 'content',
          title: 'Claude 3.5 Sonnet AI Demo',
          description: 'Latest Claude AI model showcasing advanced reasoning and coding capabilities',
          confidence: 0.94,
          reason: 'Top-rated AI model for 2025, excellent for development',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          metadata: {
            category: 'AI Tools',
            rating: 4.9,
            popularity: 95,
            trustLevel: 'verified'
          }
        },
        {
          id: '2',
          type: 'channel',
          title: 'ChatGPT-5 Showcase',
          description: 'Latest OpenAI model with enhanced multimodal capabilities and reasoning',
          confidence: 0.92,
          reason: 'Most popular AI tool worldwide, 278M+ monthly users',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          metadata: {
            category: 'AI Tools',
            rating: 4.8,
            popularity: 98,
            trustLevel: 'verified'
          }
        },
        {
          id: '3',
          type: 'trending',
          title: 'Gemini Pro 2.0 Advanced',
          description: 'Google\'s latest multimodal AI with superior image and video understanding',
          confidence: 0.89,
          reason: 'Leading AI for multimodal tasks and creative applications',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          metadata: {
            category: 'AI Tools',
            rating: 4.7,
            popularity: 87,
            trustLevel: 'verified'
          }
        },
        {
          id: '4',
          type: 'user',
          title: 'Perplexity AI Search',
          description: 'Real-time AI search with citations and up-to-date information',
          confidence: 0.85,
          reason: 'Best AI for research and real-time information',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
          metadata: {
            category: 'AI Tools',
            rating: 4.6,
            popularity: 82,
            trustLevel: 'verified'
          }
        },
        {
          id: '5',
          type: 'content',
          title: 'Synthesia AI Video',
          description: 'Create AI videos with 230+ avatars in 140+ languages',
          confidence: 0.81,
          reason: 'Leading AI video generation platform for 2025',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
          metadata: {
            category: 'AI Tools',
            rating: 4.5,
            popularity: 79,
            trustLevel: 'verified'
          }
        }
      ];

      const mockSuggestions: ContentSuggestion[] = [
        {
          id: '1',
          title: 'AI Tool Comparison 2025',
          description: 'Compare Claude, ChatGPT, Gemini, and Perplexity for different use cases',
          tags: ['ai', 'comparison', 'review'],
          estimatedViews: 15000,
          difficulty: 'beginner'
        },
        {
          id: '2',
          title: 'Building with AI APIs',
          description: 'Tutorial on integrating modern AI APIs into web applications',
          tags: ['ai', 'development', 'api'],
          estimatedViews: 8500,
          difficulty: 'intermediate'
        },
        {
          id: '3',
          title: 'AI Video Generation Guide',
          description: 'Create professional videos using Synthesia and other AI platforms',
          tags: ['ai', 'video', 'creative'],
          estimatedViews: 12000,
          difficulty: 'intermediate'
        },
        {
          id: '4',
          title: 'Advanced AI Prompting',
          description: 'Master prompt engineering for Claude, GPT, and Gemini',
          tags: ['ai', 'prompting', 'advanced'],
          estimatedViews: 6800,
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
        `Based on AI trends analysis, Claude 3.5 Sonnet is currently the top choice for coding tasks with 94% developer satisfaction. Consider creating content about AI development workflows.`,
        `ChatGPT-5 leads in popularity with 278M+ monthly users. Your AI tutorial content could reach 60% more viewers by focusing on GPT integration guides.`,
        `Perplexity AI is trending for research tasks. Content about AI-powered research methods could increase engagement by 85% in your network.`,
        `Multimodal AI (Gemini Pro) content performs 150% better than text-only AI tutorials. Consider adding visual demonstrations to your AI content.`,
        `AI video generation tools like Synthesia are growing 200% year-over-year. This could be a high-impact content niche for your channel.`
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setAiResponse(randomResponse);
      
      toast({
        title: "AI Assistant",
        description: "Generated personalized recommendation based on your Renkiva activity.",
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
        description: "AI has analyzed latest Renkiva activity for fresh suggestions.",
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

  const handleExploreClick = (rec: AIRecommendation) => {
    const category = rec.metadata?.category?.toLowerCase();
    
    if (category) {
      // Navigate to library with category filter
      navigate(`/library?category=${encodeURIComponent(category)}`);
    } else {
      // Navigate to general library
      navigate('/library');
    }
    
    toast({
      title: "Exploring Content",
      description: `Browsing ${rec.metadata?.category || 'all'} content based on AI recommendation.`,
    });
  };

  const handleCreateClick = (suggestion: ContentSuggestion) => {
    // Navigate to home page with upload section focused
    navigate('/', { state: { scrollToUpload: true } });
    
    toast({
      title: "Content Creation",
      description: `Let's create "${suggestion.title}"! Upload your content to start streaming.`,
    });
  };

  const handleStreamNow = (rec: AIRecommendation) => {
    if (rec.videoUrl) {
      setCurrentVideo({ title: rec.title, url: rec.videoUrl });
      setVideoPopupOpen(true);
      
      toast({
        title: "Starting AI Demo",
        description: `Playing ${rec.title} demonstration video.`,
      });
    } else {
      toast({
        title: "No Demo Available",
        description: "This AI tool doesn't have a demo video yet.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="ai-helper-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary animate-pulse-Renkiva" />
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
              className="Renkiva-button"
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
                  
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-xs h-6"
                      onClick={() => handleExploreClick(rec)}
                    >
                      Explore
                    </Button>
                    {rec.videoUrl && (
                      <Button 
                        size="sm" 
                        variant="default" 
                        className="text-xs h-6"
                        onClick={() => handleStreamNow(rec)}
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Stream Now
                      </Button>
                    )}
                  </div>
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
                  
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-xs h-6"
                    onClick={() => handleCreateClick(suggestion)}
                  >
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
                placeholder="Ask AI about content strategy, Renkiva optimization, or audience insights..."
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

      {/* Video Popup Dialog */}
      <Dialog open={videoPopupOpen} onOpenChange={setVideoPopupOpen}>
        <DialogContent className="max-w-4xl w-full p-0">
          <DialogHeader className="p-4 pb-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-semibold">
                {currentVideo?.title}
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setVideoPopupOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          <div className="aspect-video w-full">
            {currentVideo && (
              <video
                src={currentVideo.url}
                controls
                autoPlay
                muted={false}
                className="w-full h-full object-cover rounded-b-lg"
                onLoadedData={(e) => {
                  const video = e.target as HTMLVideoElement;
                  video.muted = false;
                  video.controls = true;
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}