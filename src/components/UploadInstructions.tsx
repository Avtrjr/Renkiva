import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Film, 
  Image, 
  Clock, 
  FileVideo, 
  Link,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

interface UploadInstructionsProps {
  onGetStarted?: () => void;
}

const UploadInstructions = ({ onGetStarted }: UploadInstructionsProps) => {
  const steps = [
    {
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      title: "Sign In",
      description: "Create an account or log in to access upload features"
    },
    {
      icon: <Upload className="w-5 h-5 text-blue-500" />,
      title: "Click Upload Content",
      description: "Find the upload button in the main interface"
    },
    {
      icon: <Film className="w-5 h-5 text-purple-500" />,
      title: "Fill Movie Details",
      description: "Add title, description, category, and duration"
    },
    {
      icon: <Link className="w-5 h-5 text-orange-500" />,
      title: "Add Video URL",
      description: "Provide a direct link to your video file"
    },
    {
      icon: <Image className="w-5 h-5 text-pink-500" />,
      title: "Optional Thumbnail",
      description: "Add a thumbnail image URL for better presentation"
    }
  ];

  const supportedFormats = [
    { format: "MP4", description: "Most widely supported" },
    { format: "WebM", description: "Good compression" },
    { format: "MOV", description: "High quality" },
    { format: "AVI", description: "Compatible format" }
  ];

  const categories = [
    "Animation", "Comedy", "Drama", "Horror", "Sci-Fi", 
    "Documentary", "Action", "Romance", "Thriller", "Mystery"
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-6 h-6 text-primary" />
            How to Upload Movies & TV Shows
          </CardTitle>
          <CardDescription>
            Follow these simple steps to share your content on MeshTV
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Step by Step Guide */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-3">Step-by-Step Guide</h3>
            <div className="grid gap-3">
              {steps.map((step, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {step.icon}
                      <h4 className="font-medium">{step.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Supported Formats */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileVideo className="w-5 h-5" />
              Supported Video Formats
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {supportedFormats.map((format) => (
                <div key={format.format} className="p-3 rounded-lg bg-muted/20 border border-border/30 text-center">
                  <div className="font-medium text-sm">{format.format}</div>
                  <div className="text-xs text-muted-foreground">{format.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Available Categories</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge key={category} variant="secondary" className="text-xs">
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          {/* Important Notes */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Important Notes
            </h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800 dark:text-amber-200">Legal Content Only</p>
                  <p className="text-amber-700 dark:text-amber-300">
                    Only upload content you own or have permission to share. Respect copyright laws.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800 dark:text-blue-200">Video URL Requirements</p>
                  <p className="text-blue-700 dark:text-blue-300">
                    Video URLs should be direct links to video files, not streaming platform links.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <Info className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-green-800 dark:text-green-200">Community Guidelines</p>
                  <p className="text-green-700 dark:text-green-300">
                    All content is public and will be reviewed by the community. Keep it appropriate.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Get Started Button */}
          {onGetStarted && (
            <div className="pt-4 border-t border-border/30">
              <Button onClick={onGetStarted} className="w-full" size="lg">
                <Upload className="w-4 h-4 mr-2" />
                Get Started with Upload
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadInstructions;