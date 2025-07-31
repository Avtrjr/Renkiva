import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, CheckCircle, XCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ImportResult {
  title: string;
  identifier: string;
  status: 'success' | 'error';
  error?: string;
}

interface ImportResponse {
  success: boolean;
  message: string;
  results: ImportResult[];
}

export function MassImportDashboard() {
  const [importing, setImporting] = useState(false);
  const [limit, setLimit] = useState(5);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [progress, setProgress] = useState(0);

  const startMassImport = async () => {
    if (importing) return;
    
    setImporting(true);
    setResults([]);
    setProgress(0);
    
    try {
      toast.info(`Starting import of ${limit} movies...`);
      
      const { data, error } = await supabase.functions.invoke('mass-import', {
        body: { limit }
      });
      
      if (error) throw error;
      
      const response = data as ImportResponse;
      setResults(response.results);
      setProgress(100);
      
      const successCount = response.results.filter(r => r.status === 'success').length;
      toast.success(`Import completed! ${successCount}/${response.results.length} movies imported successfully.`);
      
    } catch (error) {
      console.error('Import error:', error);
      toast.error(`Import failed: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Processing</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Mass Import Dashboard
          </CardTitle>
          <CardDescription>
            Automatically import public domain movies from Archive.org into MeshTV
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label htmlFor="limit" className="text-sm font-medium">
                Number of movies to import:
              </label>
              <Input
                id="limit"
                type="number"
                min="1"
                max="50"
                value={limit}
                onChange={(e) => setLimit(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                disabled={importing}
                className="mt-1"
              />
            </div>
            <Button 
              onClick={startMassImport} 
              disabled={importing}
              className="mt-6"
            >
              {importing ? 'Importing...' : 'Start Import'}
            </Button>
          </div>
          
          {importing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Import Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Import Results</CardTitle>
            <CardDescription>
              {results.filter(r => r.status === 'success').length} successful, {' '}
              {results.filter(r => r.status === 'error').length} failed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {results.map((result, index) => (
                  <div
                    key={`${result.identifier}-${index}`}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <h4 className="font-medium">{result.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          ID: {result.identifier}
                        </p>
                        {result.error && (
                          <p className="text-sm text-red-600 mt-1">
                            Error: {result.error}
                          </p>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(result.status)}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline">1</Badge>
            <span className="text-sm">Fetch public domain movies from Archive.org</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">2</Badge>
            <span className="text-sm">Extract MP4 video files and metadata</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">3</Badge>
            <span className="text-sm">Upload videos to Supabase storage</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">4</Badge>
            <span className="text-sm">Add metadata to MeshTV database</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">5</Badge>
            <span className="text-sm">Content automatically appears in MeshTV</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}