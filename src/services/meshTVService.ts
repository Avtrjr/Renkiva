// Mock MeshTV service for the light theme homepage
export interface VideoItem {
  title: string;
  category: string;
  duration: string;
  description: string;
}

export interface DemoVideo {
  url: string;
  title: string;
}

// Mock data for top offline picks
const mockSuggestions: VideoItem[] = [
  {
    title: "Mesh Network Documentary",
    category: "Tech",
    duration: "45 min",
    description: "Learn how decentralized networks are changing the way we share content."
  },
  {
    title: "Offline Cinema Classics",
    category: "Movies",
    duration: "2h 15min",
    description: "Curated collection of timeless films shared by the community."
  },
  {
    title: "Local Music Sessions",
    category: "Music",
    duration: "1h 30min",
    description: "Live performances from local artists broadcasted through mesh."
  },
  {
    title: "Citizen Journalism",
    category: "News",
    duration: "25 min",
    description: "Community-driven news and stories from your local area."
  },
  {
    title: "DIY Tech Tutorials",
    category: "Education",
    duration: "35 min",
    description: "Step-by-step guides for building your own mesh network setup."
  },
  {
    title: "Mesh Gaming Streams",
    category: "Gaming",
    duration: "2h",
    description: "Local multiplayer gaming sessions and tournaments."
  }
];

export async function getTopOfflinePicks(): Promise<VideoItem[]> {
  // Simulate API delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockSuggestions);
    }, 500);
  });
}

export async function getLiveDemoVideo(): Promise<DemoVideo | null> {
  // Simulate API delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        url: "/placeholder.svg", // Using placeholder since we don't have a real video
        title: "MeshTV Live Demo"
      });
    }, 800);
  });
}