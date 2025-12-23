import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import StreamPlayer from "@/components/StreamPlayer";
import { fetchContentById, type ContentItem } from "@/lib/contentProviderAPI";

const StreamPage = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      if (!id) {
        setError(t('stream.noContentId'));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const contentData = await fetchContentById(id);
        
        if (!contentData) {
          setError(t('stream.contentNotFound'));
        } else {
          setContent(contentData);
        }
      } catch (err) {
        console.error('Error loading content:', err);
        setError(t('stream.loadFailed'));
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [id, t]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse-mesh mb-4">
            <div className="w-16 h-16 bg-primary/20 rounded-full mx-auto flex items-center justify-center">
              📺
            </div>
          </div>
          <p className="text-muted-foreground">{t('stream.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-foreground mb-2">{t('stream.notFoundTitle')}</h1>
          <p className="text-muted-foreground mb-6">{error || t('stream.notFoundMessage')}</p>
          <Button onClick={() => navigate("/")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('stream.backToLibrary')}
          </Button>
        </div>
      </div>
    );
  }

  if (!content.streaming_url) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-foreground mb-2">{t('stream.notAvailableTitle')}</h1>
          <p className="text-muted-foreground mb-6">{t('stream.notAvailableMessage')}</p>
          <Button onClick={() => navigate("/")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('stream.backToLibrary')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/")}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('stream.backToLibrary')}
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-foreground">{content.title}</h1>
              <p className="text-sm text-muted-foreground">
                {content.category} • {content.rating}⭐ • {content.releaseDate}
                {content.duration_minutes && ` • ${content.duration_minutes}${t('stream.min')}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stream Player */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <StreamPlayer
            title={content.title}
            source="MeshTV Network"
            fragments={[
              { id: 1, sequence: 1, size: 1024 },
              { id: 2, sequence: 2, size: 2048 },
              { id: 3, sequence: 3, size: 1536 }
            ]}
            streaming_url={content.streaming_url}
            signalStrength={95}
            distance="Direct"
            onAdImpression={(data) => console.log('Ad impression:', data)}
            onViewingStats={(stats) => console.log('Viewing stats:', stats)}
          />

          {/* Content Info */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Description */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-foreground mb-4">{t('stream.about')}</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {content.description}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">{t('stream.category')}</p>
                  <p className="font-medium text-foreground">{content.category}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t('stream.rating')}</p>
                  <p className="font-medium text-foreground">{content.rating}⭐</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t('stream.release')}</p>
                  <p className="font-medium text-foreground">{content.releaseDate}</p>
                </div>
                {content.duration_minutes && (
                  <div>
                    <p className="text-muted-foreground">{t('stream.duration')}</p>
                    <p className="font-medium text-foreground">{content.duration_minutes}{t('stream.min')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Poster */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="aspect-[2/3] bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg overflow-hidden">
                  {content.thumbnailUrl && !content.thumbnailUrl.includes('placeholder') ? (
                    <img 
                      src={content.thumbnailUrl} 
                      alt={content.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-6xl opacity-50">📺</div>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 p-4 bg-card/50 rounded-lg border border-border/30">
                  <p className="text-sm text-muted-foreground mb-2">{t('stream.source')}</p>
                  <p className="font-medium text-foreground">{content.source}</p>
                  
                  {content.file_size_bytes && (
                    <>
                      <p className="text-sm text-muted-foreground mb-2 mt-3">{t('stream.fileSize')}</p>
                      <p className="font-medium text-foreground">
                        {(content.file_size_bytes / (1024 * 1024)).toFixed(0)} MB
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamPage;
