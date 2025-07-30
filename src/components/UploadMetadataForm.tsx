import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UploadMetadata {
  title: string;
  category: string;
  description: string;
}

interface UploadMetadataFormProps {
  metadata: UploadMetadata;
  setMetadata: (metadata: UploadMetadata | ((prev: UploadMetadata) => UploadMetadata)) => void;
}

export default function UploadMetadataForm({ metadata, setMetadata }: UploadMetadataFormProps) {
  return (
    <Card className="bg-card/80 backdrop-blur-lg border-border/50 shadow-clay">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">📝 Upload Metadata</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium text-foreground">
            🎬 Title
          </Label>
          <Input
            id="title"
            value={metadata.title}
            onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter video title..."
            className="bg-background/50 border-border/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category" className="text-sm font-medium text-foreground">
            🎞️ Category
          </Label>
          <Input
            id="category"
            value={metadata.category}
            onChange={(e) => setMetadata(prev => ({ ...prev, category: e.target.value }))}
            placeholder="e.g., Movie, TV Show, Documentary..."
            className="bg-background/50 border-border/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium text-foreground">
            📝 Description
          </Label>
          <Textarea
            id="description"
            value={metadata.description}
            onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe the content..."
            className="bg-background/50 border-border/50 min-h-[100px]"
          />
        </div>
      </CardContent>
    </Card>
  );
}