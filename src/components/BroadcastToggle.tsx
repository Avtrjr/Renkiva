import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface BroadcastToggleProps {
  onBroadcastStart?: (data: { title: string; fragments: any[]; metadata: any }) => void;
}

export default function BroadcastToggle({ onBroadcastStart }: BroadcastToggleProps) {
  const [enabled, setEnabled] = useState(false);
  const [title, setTitle] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [meta, setMeta] = useState<any>({});

  const fragmentPayload = (buffer: Uint8Array) => {
    const MTU = 1024;
    const fragments = [];
    
    for (let i = 0; i < buffer.length; i += MTU) {
      const chunk = buffer.slice(i, i + MTU);
      fragments.push({
        id: Math.floor(i / MTU) + 1,
        sequence: Math.floor(i / MTU) + 1,
        data: chunk,
        size: chunk.length,
        total: Math.ceil(buffer.length / MTU)
      });
    }
    
    return fragments;
  };

  const extractMetadata = (file: File) => {
    setTitle(file.name);
    setMeta({
      size: (file.size / 1_000_000).toFixed(1) + ' MB',
      duration: 'Loading...',
      release: new Date().toISOString().split('T')[0],
      studio: 'User Uploaded',
      rating: '⭐️⭐️⭐️⭐️',
    });

    const url = URL.createObjectURL(file);
    setPreviewURL(url);

    const video = document.createElement('video');
    video.src = url;
    video.addEventListener('loadedmetadata', () => {
      setMeta((m: any) => ({ ...m, duration: Math.floor(video.duration / 60) + ' min' }));
    });
  };

  const handleStart = async () => {
    if (!videoFile) return alert('Upload a video file first.');
    const buffer = await videoFile.arrayBuffer();
    const fragments = fragmentPayload(new Uint8Array(buffer));
    onBroadcastStart?.({ title, fragments, metadata: meta });
    setEnabled(true);
  };

  return (
    <Card className="bg-card/80 backdrop-blur-lg border-border/50 shadow-clay">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          🎙️ Start Broadcasting
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          type="file"
          accept="video/mp4,video/webm"
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) {
              setVideoFile(file);
              extractMetadata(file);
            }
          }}
          className="w-full"
        />
        
        {previewURL && (
          <video className="w-full rounded" src={previewURL} controls muted />
        )}
        
        <div className="text-sm text-muted-foreground">
          <p>🎬 {title}</p>
          <p>⏱️ {meta.duration} | 💾 {meta.size}</p>
        </div>
        
        <Button
          className={`w-full ${enabled ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary hover:bg-primary/90'}`}
          onClick={handleStart}
        >
          {enabled ? 'Broadcasting...' : 'Start Broadcast'}
        </Button>
      </CardContent>
    </Card>
  );
}