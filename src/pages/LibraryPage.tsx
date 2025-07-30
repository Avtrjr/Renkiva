import { useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ContentLibrary from '@/components/ContentLibrary';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LibraryPage = () => {
  const navigate = useNavigate();
  const { genre } = useParams();
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');
  const [pageTitle, setPageTitle] = useState('Content Library');

  useEffect(() => {
    if (genre) {
      setPageTitle(`${genre.charAt(0).toUpperCase() + genre.slice(1)} Library`);
    } else if (category) {
      setPageTitle(`${category} Content`);
    }
  }, [genre, category]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
          <h1 className="text-2xl font-bold text-foreground">{pageTitle}</h1>
        </div>

        {/* Content Library */}
        <ContentLibrary />
      </div>
    </div>
  );
};

export default LibraryPage;