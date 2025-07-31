#!/usr/bin/env python3
"""
MeshTV Content Importer
Fetches public domain movies and builds a decentralized content index for mesh networks.
"""

import os
import json
import requests
import time
from typing import List, Dict, Any
from dataclasses import dataclass, asdict
from urllib.parse import urlparse

@dataclass
class ContentItem:
    title: str
    description: str
    category: str
    duration_minutes: int
    file_size_bytes: int
    thumbnail_url: str
    video_url: str
    source: str
    tags: List[str]
    license: str
    creator: str = ""
    year: int = 0

class MeshTVImporter:
    def __init__(self):
        self.content_library = []
        self.sources = {
            "internet_archive": "https://archive.org/advancedsearch.php",
            "public_domain_movies": "https://publicdomainmovie.net/api/v1",
            "creative_commons": "https://search.creativecommons.org/api/v1"
        }
    
    def fetch_internet_archive_content(self, limit: int = 50) -> List[ContentItem]:
        """Fetch public domain movies from Internet Archive"""
        print("🎬 Fetching content from Internet Archive...")
        
        # Internet Archive search for public domain movies
        params = {
            "q": "collection:(opensource_movies) AND mediatype:(movies)",
            "fl": "identifier,title,description,creator,date,downloads,item_size",
            "rows": limit,
            "output": "json"
        }
        
        try:
            response = requests.get(self.sources["internet_archive"], params=params, timeout=30)
            data = response.json()
            
            items = []
            for doc in data.get("response", {}).get("docs", []):
                # Fetch detailed metadata for each item
                detail_url = f"https://archive.org/metadata/{doc['identifier']}"
                detail_response = requests.get(detail_url, timeout=10)
                detail_data = detail_response.json()
                
                # Extract video files
                video_files = [f for f in detail_data.get("files", []) 
                             if f.get("format") in ["MPEG4", "h.264", "MP4"]]
                
                if video_files:
                    # Use the first available video file
                    video_file = video_files[0]
                    video_url = f"https://archive.org/download/{doc['identifier']}/{video_file['name']}"
                    
                    # Look for thumbnail
                    thumbnail_files = [f for f in detail_data.get("files", []) 
                                     if f.get("format") in ["JPEG", "PNG"] and "thumb" in f.get("name", "").lower()]
                    thumbnail_url = ""
                    if thumbnail_files:
                        thumbnail_url = f"https://archive.org/download/{doc['identifier']}/{thumbnail_files[0]['name']}"
                    
                    item = ContentItem(
                        title=doc.get("title", "Unknown Title"),
                        description=doc.get("description", "No description available")[:500],
                        category="Public Domain Movie",
                        duration_minutes=self.estimate_duration(video_file.get("length", "0")),
                        file_size_bytes=int(video_file.get("size", 0)),
                        thumbnail_url=thumbnail_url,
                        video_url=video_url,
                        source="Internet Archive",
                        tags=["public-domain", "classic", "archive"],
                        license="Public Domain",
                        creator=doc.get("creator", "Unknown"),
                        year=self.extract_year(doc.get("date", ""))
                    )
                    items.append(item)
                    
                # Rate limiting
                time.sleep(0.5)
                
            print(f"✅ Found {len(items)} items from Internet Archive")
            return items
            
        except Exception as e:
            print(f"❌ Error fetching from Internet Archive: {e}")
            return []
    
    def fetch_sample_content(self) -> List[ContentItem]:
        """Generate sample content for demo purposes"""
        print("🎭 Generating sample content for demo...")
        
        sample_items = [
            ContentItem(
                title="Big Buck Bunny",
                description="A short computer-animated comedy film by the Blender Institute.",
                category="Animation",
                duration_minutes=10,
                file_size_bytes=276134003,
                thumbnail_url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg",
                video_url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                source="Blender Foundation",
                tags=["animation", "short-film", "comedy", "open-source"],
                license="Creative Commons",
                creator="Blender Foundation",
                year=2008
            ),
            ContentItem(
                title="Elephant's Dream",
                description="The world's first open movie made entirely with open source graphics software.",
                category="Animation", 
                duration_minutes=11,
                file_size_bytes=158433882,
                thumbnail_url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg",
                video_url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
                source="Blender Foundation",
                tags=["animation", "open-source", "experimental"],
                license="Creative Commons",
                creator="Blender Foundation",
                year=2006
            ),
            ContentItem(
                title="Sintel",
                description="A short computer animated film about a girl named Sintel who is searching for her dragon friend.",
                category="Animation",
                duration_minutes=15,
                file_size_bytes=355856027,
                thumbnail_url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg",
                video_url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
                source="Blender Foundation",
                tags=["animation", "fantasy", "adventure"],
                license="Creative Commons",
                creator="Blender Foundation",
                year=2010
            ),
            ContentItem(
                title="Tears of Steel",
                description="A science fiction short film that showcases the capabilities of open source software.",
                category="Sci-Fi",
                duration_minutes=12,
                file_size_bytes=733397692,
                thumbnail_url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/TearsOfSteel.jpg",
                video_url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
                source="Blender Foundation",
                tags=["sci-fi", "action", "open-source"],
                license="Creative Commons",
                creator="Blender Foundation",
                year=2012
            )
        ]
        
        print(f"✅ Generated {len(sample_items)} sample items")
        return sample_items
    
    def estimate_duration(self, length_str: str) -> int:
        """Estimate duration from length string"""
        try:
            # Try to parse common duration formats
            if ":" in length_str:
                parts = length_str.split(":")
                if len(parts) == 2:  # MM:SS
                    return int(parts[0]) + (int(parts[1]) / 60)
                elif len(parts) == 3:  # HH:MM:SS
                    return int(parts[0]) * 60 + int(parts[1]) + (int(parts[2]) / 60)
            else:
                # Assume it's in seconds
                return int(float(length_str) / 60)
        except:
            return 90  # Default to 90 minutes
    
    def extract_year(self, date_str: str) -> int:
        """Extract year from date string"""
        try:
            return int(date_str[:4])
        except:
            return 0
    
    def build_index(self) -> Dict[str, Any]:
        """Build the content index for mesh network"""
        print("🗂️ Building MeshTV content index...")
        
        # Fetch content from various sources
        all_content = []
        
        # Add sample content (always available)
        all_content.extend(self.fetch_sample_content())
        
        # Try to fetch from Internet Archive (may fail due to network/API limits)
        try:
            archive_content = self.fetch_internet_archive_content(limit=20)
            all_content.extend(archive_content)
        except Exception as e:
            print(f"⚠️ Could not fetch from Internet Archive: {e}")
        
        # Build categories
        categories = {}
        for item in all_content:
            if item.category not in categories:
                categories[item.category] = []
            categories[item.category].append(asdict(item))
        
        # Build index
        index = {
            "version": "1.0",
            "generated": time.time(),
            "total_items": len(all_content),
            "categories": list(categories.keys()),
            "content": [asdict(item) for item in all_content],
            "categories_detailed": categories,
            "mesh_metadata": {
                "protocol_version": "meshtv-1.0",
                "requires_auth": False,
                "supports_streaming": True,
                "supports_download": True,
                "encryption": "optional"
            }
        }
        
        return index
    
    def save_index(self, index: Dict[str, Any], filename: str = "public/meshtv-index.json"):
        """Save the index to a JSON file"""
        print(f"💾 Saving index to {filename}...")
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(filename), exist_ok=True)
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(index, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Index saved with {index['total_items']} items")
    
    def generate_supabase_sql(self, content_items: List[ContentItem]) -> str:
        """Generate SQL for importing content into Supabase"""
        sql_statements = []
        sql_statements.append("-- MeshTV Content Import SQL")
        sql_statements.append("-- Generated by mesh-importer.py")
        sql_statements.append("")
        
        for item in content_items:
            sql = f"""
INSERT INTO public.shows (
    title, 
    description, 
    category, 
    duration_minutes, 
    file_size_bytes, 
    thumbnail_url, 
    video_url, 
    is_public,
    created_by
) VALUES (
    '{item.title.replace("'", "''")}',
    '{item.description.replace("'", "''")}',
    '{item.category}',
    {item.duration_minutes},
    {item.file_size_bytes},
    '{item.thumbnail_url}',
    '{item.video_url}',
    true,
    NULL
);"""
            sql_statements.append(sql)
        
        return "\n".join(sql_statements)

def main():
    """Main function to run the importer"""
    print("🚀 Starting MeshTV Content Importer...")
    
    importer = MeshTVImporter()
    
    # Build the content index
    index = importer.build_index()
    
    # Save to public directory for web access
    importer.save_index(index, "public/meshtv-index.json")
    
    # Also save to src/assets for import in React
    importer.save_index(index, "src/assets/meshtv-index.json")
    
    # Generate Supabase SQL
    content_items = [ContentItem(**item) for item in index["content"]]
    sql = importer.generate_supabase_sql(content_items)
    
    with open("meshtv-import.sql", "w") as f:
        f.write(sql)
    
    print(f"📊 Content Summary:")
    print(f"   Total Items: {index['total_items']}")
    print(f"   Categories: {', '.join(index['categories'])}")
    print(f"   Index Files: public/meshtv-index.json, src/assets/meshtv-index.json")
    print(f"   SQL File: meshtv-import.sql")
    print("✅ MeshTV Content Import Complete!")

if __name__ == "__main__":
    main()