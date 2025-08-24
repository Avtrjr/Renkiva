import React, { useState, useEffect } from 'react';
import { Search, Book, ArrowLeft, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useHelpRepository } from '@/hooks/useHelpRepository';
import type { HelpArticle } from '@/types/help';

interface HelpCenterProps {
  isOpen: boolean;
  onClose: () => void;
  initialArticle?: string;
}

export function HelpCenter({ isOpen, onClose, initialArticle }: HelpCenterProps) {
  const [currentView, setCurrentView] = useState<'home' | 'article'>('home');
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { articles, searchArticles, getArticleBySlug } = useHelpRepository();

  const filteredArticles = searchQuery 
    ? searchArticles(searchQuery)
    : articles;

  const sections = {
    'getting-started': 'Getting Started',
    'calls-groups': 'Calls & Groups', 
    'sharing-safety': 'Sharing & Safety',
    'privacy-security': 'Privacy & Security',
    'status-troubleshooting': 'Status & Troubleshooting'
  };

  useEffect(() => {
    if (initialArticle && isOpen) {
      const article = getArticleBySlug(initialArticle);
      if (article) {
        setSelectedArticle(article);
        setCurrentView('article');
      }
    }
  }, [initialArticle, isOpen, getArticleBySlug]);

  const handleArticleSelect = (article: HelpArticle) => {
    setSelectedArticle(article);
    setCurrentView('article');
  };

  const handleBack = () => {
    setCurrentView('home');
    setSelectedArticle(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {currentView === 'article' && (
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <Book className="h-5 w-5" />
            {currentView === 'home' ? 'Help Center' : selectedArticle?.title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {currentView === 'home' ? (
            <>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search help articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <ScrollArea className="flex-1">
                {Object.entries(sections).map(([sectionKey, sectionName]) => {
                  const sectionArticles = filteredArticles.filter(
                    article => article.section === sectionKey
                  );
                  
                  if (sectionArticles.length === 0) return null;

                  return (
                    <div key={sectionKey} className="mb-6">
                      <h3 className="font-semibold mb-3 text-foreground">{sectionName}</h3>
                      <div className="space-y-2">
                        {sectionArticles.map((article) => (
                          <button
                            key={article.slug}
                            onClick={() => handleArticleSelect(article)}
                            className="w-full text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{article.title}</h4>
                              <ExternalLink className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </ScrollArea>
            </>
          ) : (
            <ScrollArea className="flex-1">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div dangerouslySetInnerHTML={{ 
                  __html: selectedArticle?.bodyMarkdown || '' 
                }} />
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}