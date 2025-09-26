import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
interface StarterPackItem {
  title: string;
  path: string;
  category: string;
  studio: string;
  release: string;
  rating: string;
  duration: string;
  size: string;
}
interface StarterPackGalleryProps {
  onSelect: (item: StarterPackItem) => void;
}
const starterPack: StarterPackItem[] = [{
  title: 'Tears of Steel',
  path: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  category: 'Sci-Fi',
  studio: 'Blender Foundation',
  release: '2012-09-26',
  rating: '7.8⭐',
  duration: '12 min',
  size: '189 MB'
}, {
  title: 'Big Buck Bunny',
  path: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  category: 'Animation',
  studio: 'Blender Foundation',
  release: '2008-04-10',
  rating: '8.1⭐',
  duration: '10 min',
  size: '126 MB'
}, {
  title: 'Sintel',
  path: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  category: 'Animation',
  studio: 'Blender Foundation',
  release: '2010-09-30',
  rating: '7.4⭐',
  duration: '14 min',
  size: '156 MB'
}];
export default function StarterPackGallery({
  onSelect
}: StarterPackGalleryProps) {
  return <div className="mt-6">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-xl font-bold text-foreground">🎁 Renkiva Starter Pack</h3>
        <Badge variant="secondary" className="bg-card/50 backdrop-blur-lg">
          Offline Ready
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {starterPack.map((item, idx) => <Card key={idx} className="p-4 hover:shadow-lg cursor-pointer transition-all duration-200 hover:scale-[1.02] bg-card/80 backdrop-blur-sm border-border/50" onClick={() => onSelect(item)}>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-lg mb-1 text-foreground">
                  🎬 {item.title}
                </h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>📁 {item.size}</span>
                  <span>•</span>
                  <span>⏱ {item.duration}</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {item.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {item.studio}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>⭐ {item.rating}</span>
                  <span>•</span>
                  <span>📅 {item.release}</span>
                </div>
              </div>
            </div>
          </Card>)}
      </div>
      
      <div className="mt-4 p-3 bg-card/50 backdrop-blur-sm rounded-lg border border-border/50">
        <p className="text-sm text-muted-foreground">
          💡 These videos are pre-downloaded and ready for offline Renkiva streaming. 
          No internet required!
        </p>
      </div>
    </div>;
}