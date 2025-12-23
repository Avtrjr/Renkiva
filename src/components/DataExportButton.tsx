import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Download, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export function DataExportButton() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleExport = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to export your data.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      const { data, error } = await supabase.functions.invoke('export-user-data', {
        method: 'POST',
      });

      if (error) {
        throw error;
      }

      // Create and download the JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `renkiva-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccess(true);
      toast({
        title: "Data exported successfully",
        description: "Your data has been downloaded as a JSON file.",
      });

      // Reset success state after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "Unable to export your data. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={loading || !user}
      className="gap-2"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : success ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {loading ? 'Exporting...' : success ? 'Downloaded!' : 'Download My Data'}
    </Button>
  );
}
