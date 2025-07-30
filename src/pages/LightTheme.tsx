// 📺 AI-Curated MeshTV Homepage (Light Theme)
import React, { useEffect, useState } from 'react';
import { getTopOfflinePicks, getLiveDemoVideo, VideoItem, DemoVideo } from '../services/meshTVService';

export default function LightTheme() {
  const [suggestions, setSuggestions] = useState<VideoItem[]>([]);
  const [demoVideo, setDemoVideo] = useState<DemoVideo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [suggestionsData, videoData] = await Promise.all([
          getTopOfflinePicks(),
          getLiveDemoVideo()
        ]);
        setSuggestions(suggestionsData);
        setDemoVideo(videoData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="bg-white text-gray-800 p-6 min-h-screen font-sans">
      <h1 className="text-4xl font-bold mb-2 text-indigo-700">🎬 Welcome to MeshTV</h1>
      <p className="text-md mb-6 text-gray-600">Decentralized streaming. No internet needed. Watch, share, and connect offline.</p>

      {/* Mini Offline TV Streaming Window */}
      <div className="bg-gray-200 border border-gray-300 rounded-lg p-4 w-full sm:w-1/2 mb-6 shadow-md">
        <h2 className="text-lg font-semibold mb-2">📡 MeshTV Live Demo (Offline)</h2>
        {loading ? (
          <div className="animate-pulse">
            <div className="bg-gray-300 h-48 rounded w-full border border-gray-400"></div>
            <p className="text-sm italic mt-2">Loading live demo...</p>
          </div>
        ) : demoVideo ? (
          <div className="relative">
            <img
              src={demoVideo.url}
              alt={demoVideo.title}
              className="rounded w-full border border-gray-400 h-48 object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded">
              <div className="bg-white bg-opacity-90 rounded-full p-2">
                <div className="w-8 h-8 border-l-4 border-indigo-600 rounded-full animate-spin"></div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm italic">Demo video unavailable</p>
        )}
      </div>

      {/* AI-Curated Recommendations */}
      <div>
        <h2 className="text-xl font-semibold mb-3">🤖 AI-Curated Top Picks</h2>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, idx) => (
              <div key={idx} className="bg-gray-100 border border-gray-200 p-4 rounded shadow-sm animate-pulse">
                <div className="bg-gray-300 h-6 rounded mb-2"></div>
                <div className="bg-gray-300 h-4 rounded mb-2 w-3/4"></div>
                <div className="bg-gray-300 h-16 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestions.map((item, idx) => (
              <div 
                key={idx} 
                className="bg-indigo-50 border border-indigo-200 p-4 rounded shadow-sm hover-scale transition-all duration-200 hover:shadow-md"
              >
                <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{item.category} • {item.duration}</p>
                <p className="text-sm text-gray-700">{item.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="mt-12 text-center">
        <button className="bg-indigo-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-indigo-500 transition-all duration-200 hover:scale-105">
          Start Watching Offline
        </button>
        <p className="mt-2 text-sm text-gray-500">Powered by BitChat Protocol and your local mesh network.</p>
      </div>
    </div>
  );
}