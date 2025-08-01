import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { 
  Video, 
  Eye, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  TrendingUp, 
  Search,
  Globe,
  Lock
} from "lucide-react";

interface VideoItem {
  id: string;
  title: string;
  thumbnail: string;
  category: string;
  visibility: "public" | "private";
  offlineViews: number;
  onlineViews: number;
  uploadDate: string;
  fileSize: string;
  duration: string;
  status: "processing" | "live" | "error";
}

export default function MyVideosList() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Mock data - in real app, fetch from database
  useEffect(() => {
    const mockVideos: VideoItem[] = [
      {
        id: "1",
        title: "Introduction to Mesh Networks",
        thumbnail: "/api/placeholder/160/90",
        category: "Educational",
        visibility: "public",
        offlineViews: 247,
        onlineViews: 1432,
        uploadDate: "2024-01-15",
        fileSize: "1.2 GB",
        duration: "15:32",
        status: "live"
      },
      {
        id: "2", 
        title: "Cyberpunk City Tour",
        thumbnail: "/api/placeholder/160/90",
        category: "Travel",
        visibility: "private",
        offlineViews: 89,
        onlineViews: 567,
        uploadDate: "2024-01-12",
        fileSize: "2.8 GB",
        duration: "28:45",
        status: "live"
      },
      {
        id: "3",
        title: "Decentralized Streaming Demo",
        thumbnail: "/api/placeholder/160/90", 
        category: "Technology",
        visibility: "public",
        offlineViews: 156,
        onlineViews: 892,
        uploadDate: "2024-01-10",
        fileSize: "956 MB",
        duration: "12:18",
        status: "processing"
      }
    ];

    setTimeout(() => {
      setVideos(mockVideos);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "processing": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "error": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-muted/20 text-muted-foreground";
    }
  };

  const handleEdit = (videoId: string) => {
    console.log("Edit video:", videoId);
    // Navigate to edit page or open edit modal
  };

  const handleDelete = (videoId: string) => {
    if (confirm("Are you sure you want to delete this video?")) {
      setVideos(videos.filter(v => v.id !== videoId));
    }
  };

  const handlePromote = (videoId: string) => {
    console.log("Promote video:", videoId);
    // Add promotion logic
  };

  return (
    <Card className="mesh-card backdrop-blur-lg border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-primary">
            <Video className="w-5 h-5" />
            My Videos ({videos.length})
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-64 bg-input/50"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 rounded-lg border border-border/30 animate-pulse">
                <div className="w-20 h-12 bg-muted/30 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted/30 rounded w-1/3"></div>
                  <div className="h-3 bg-muted/30 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/30 hover:bg-muted/5">
                  <TableHead>Video</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVideos.map((video) => (
                  <TableRow key={video.id} className="border-border/30 hover:bg-muted/5">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-16 h-10 bg-muted/30 rounded-md flex items-center justify-center">
                          <Video className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{video.title}</div>
                          <div className="flex items-center gap-2 mt-1">
                            {video.visibility === "public" ? (
                              <Globe className="w-3 h-3 text-primary" />
                            ) : (
                              <Lock className="w-3 h-3 text-secondary" />
                            )}
                            <span className="text-xs text-muted-foreground">
                              {video.visibility}
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-primary/30">
                        {video.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(video.status)}>
                        {video.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Eye className="w-3 h-3 text-primary" />
                          <span className="text-primary font-medium">{video.offlineViews}</span>
                          <span className="text-muted-foreground text-xs">offline</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Globe className="w-3 h-3 text-secondary" />
                          <span className="text-secondary font-medium">{video.onlineViews}</span>
                          <span className="text-muted-foreground text-xs">online</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {video.duration}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {video.fileSize}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(video.uploadDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border/50">
                          <DropdownMenuItem 
                            onClick={() => handleEdit(video.id)}
                            className="cursor-pointer hover:bg-muted/20"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handlePromote(video.id)}
                            className="cursor-pointer hover:bg-primary/20"
                          >
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Promote
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(video.id)}
                            className="cursor-pointer hover:bg-destructive/20 text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredVideos.length === 0 && (
              <div className="text-center py-12">
                <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {searchTerm ? "No videos found" : "No videos uploaded yet"}
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm 
                    ? "Try adjusting your search terms" 
                    : "Upload your first video to get started"
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}