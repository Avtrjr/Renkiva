import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  Video, 
  Image, 
  FileText, 
  Check, 
  AlertTriangle,
  ExternalLink,
  Smartphone,
  Wifi
} from 'lucide-react';

const ContentUploadGuide = () => {
  const supportedFormats = [
    { type: 'Video', formats: ['MP4', 'WebM', 'OGV'], icon: Video },
    { type: 'Images', formats: ['JPG', 'PNG', 'WebP'], icon: Image },
    { type: 'Metadata', formats: ['JSON', 'XML'], icon: FileText }
  ];

  const uploadSteps = [
    {
      step: 1,
      title: 'Prepare Your Content',
      description: 'Ensure your video files are in supported formats (MP4, WebM) and have proper metadata.',
      icon: FileText
    },
    {
      step: 2,
      title: 'Connect to Mesh Network',
      description: 'Make sure your device is connected to the mesh network and has sufficient signal strength.',
      icon: Wifi
    },
    {
      step: 3,
      title: 'Upload & Share',
      description: 'Use the upload form to add your content. It will be automatically fragmented and distributed.',
      icon: Upload
    },
    {
      step: 4,
      title: 'Verify Distribution',
      description: 'Check that your content is successfully distributed across nearby mesh nodes.',
      icon: Check
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Content Upload Guide
          </CardTitle>
          <CardDescription>
            Learn how to upload and share content through the mesh network
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Supported Formats */}
          <div>
            <h3 className="font-semibold mb-3">Supported Formats</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {supportedFormats.map((format) => (
                <div key={format.type} className="flex items-center gap-3 p-3 border rounded-lg bg-card/50">
                  <format.icon className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-medium">{format.type}</div>
                    <div className="text-sm text-muted-foreground">
                      {format.formats.join(', ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upload Process */}
          <div>
            <h3 className="font-semibold mb-3">Upload Process</h3>
            <div className="space-y-4">
              {uploadSteps.map((step) => (
                <div key={step.step} className="flex gap-4 p-4 border rounded-lg bg-card/30">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                      {step.step}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium flex items-center gap-2">
                      <step.icon className="w-4 h-4" />
                      {step.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Best Practices */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Best Practices:</strong> Use H.264 encoding for videos, keep file sizes under 2GB for optimal mesh distribution, and always include descriptive metadata.
            </AlertDescription>
          </Alert>

          {/* Network Requirements */}
          <div>
            <h3 className="font-semibold mb-3">Network Requirements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Badge variant="outline" className="w-full justify-start">
                  <Smartphone className="w-4 h-4 mr-2" />
                  Bluetooth LE 5.0+
                </Badge>
                <Badge variant="outline" className="w-full justify-start">
                  <Wifi className="w-4 h-4 mr-2" />
                  WiFi Direct Support
                </Badge>
              </div>
              <div className="space-y-2">
                <Badge variant="outline" className="w-full justify-start">
                  <Check className="w-4 h-4 mr-2" />
                  Signal Strength &gt; 60%
                </Badge>
                <Badge variant="outline" className="w-full justify-start">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Speed &gt; 1 Mbps
                </Badge>
              </div>
            </div>
          </div>

          {/* External Resources */}
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <a href="https://docs.meshtv.network" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Documentation
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="https://community.meshtv.network" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Community
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentUploadGuide;