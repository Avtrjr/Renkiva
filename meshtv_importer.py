#!/usr/bin/env python3
"""
MeshTV Auto-Import Script
Populates MeshTV with open-source movies and content from legitimate sources.
"""

import requests
import json
import time
import os
from typing import List, Dict, Optional
from urllib.parse import urljoin
import logging
from dataclasses import dataclass
from supabase import create_client, Client

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@dataclass
class ContentItem:
    title: str
    description: str
    category: str
    duration_minutes: Optional[int]
    thumbnail_url: Optional[str]
    video_url: str
    file_size_bytes: Optional[int]
    source: str

class MeshTVImporter:
    def __init__(self, supabase_url: str, supabase_key: str):
        """Initialize the importer with Supabase credentials."""
        self.supabase: Client = create_client(supabase_url, supabase_key)
        self.content_items: List[ContentItem] = []
        
    def scrape_internet_archive(self) -> List[ContentItem]:
        """Scrape public domain movies from Internet Archive."""
        logger.info("Scraping Internet Archive for public domain content...")
        
        # Internet Archive collections for different genres
        collections = {
            "Sci-Fi": "SciFi_Horror_B-Movies",
            "Horror": "horror",
            "Animation": "opensource_movies", 
            "Documentary": "documentaries",
            "Classic": "feature_films",
            "Comedy": "comedy_films"
        }
        
        content_items = []
        
        for genre, collection in collections.items():
            try:
                # Search Internet Archive API
                search_url = f"https://archive.org/advancedsearch.php"
                params = {
                    'q': f'collection:{collection} AND mediatype:movies',
                    'fl': 'identifier,title,description,downloads,avg_rating',
                    'sort[]': 'downloads desc',
                    'rows': 20,
                    'page': 1,
                    'output': 'json'
                }
                
                response = requests.get(search_url, params=params, timeout=30)
                if response.status_code == 200:
                    data = response.json()
                    
                    for doc in data.get('response', {}).get('docs', []):
                        identifier = doc.get('identifier')
                        if not identifier:
                            continue
                            
                        # Get detailed metadata
                        metadata_url = f"https://archive.org/metadata/{identifier}"
                        metadata_response = requests.get(metadata_url, timeout=30)
                        
                        if metadata_response.status_code == 200:
                            metadata = metadata_response.json()
                            video_file = self._find_video_file(metadata)
                            
                            if video_file:
                                content_item = ContentItem(
                                    title=doc.get('title', identifier.replace('_', ' ').title()),
                                    description=doc.get('description', f"Public domain {genre.lower()} film from Internet Archive."),
                                    category=genre,
                                    duration_minutes=self._extract_duration(metadata),
                                    thumbnail_url=f"https://archive.org/services/img/{identifier}",
                                    video_url=f"https://archive.org/download/{identifier}/{video_file}",
                                    file_size_bytes=self._extract_file_size(metadata, video_file),
                                    source="Internet Archive"
                                )
                                content_items.append(content_item)
                                logger.info(f"Added: {content_item.title} ({genre})")
                        
                        # Rate limiting
                        time.sleep(1)
                        
            except Exception as e:
                logger.error(f"Error scraping {genre} from Internet Archive: {e}")
                
        logger.info(f"Scraped {len(content_items)} items from Internet Archive")
        return content_items
    
    def scrape_wikimedia_commons(self) -> List[ContentItem]:
        """Scrape Creative Commons videos from Wikimedia Commons."""
        logger.info("Scraping Wikimedia Commons...")
        
        content_items = []
        
        try:
            # Search for videos on Wikimedia Commons
            api_url = "https://commons.wikimedia.org/w/api.php"
            params = {
                'action': 'query',
                'format': 'json',
                'list': 'search',
                'srsearch': 'filetype:webm OR filetype:ogv',
                'srnamespace': 6,  # File namespace
                'srlimit': 50
            }
            
            response = requests.get(api_url, params=params, timeout=30)
            if response.status_code == 200:
                data = response.json()
                
                for item in data.get('query', {}).get('search', []):
                    title = item.get('title', '').replace('File:', '')
                    
                    # Get file info
                    file_params = {
                        'action': 'query',
                        'format': 'json',
                        'titles': item.get('title'),
                        'prop': 'imageinfo',
                        'iiprop': 'url|size|mediatype'
                    }
                    
                    file_response = requests.get(api_url, params=file_params, timeout=30)
                    if file_response.status_code == 200:
                        file_data = file_response.json()
                        pages = file_data.get('query', {}).get('pages', {})
                        
                        for page in pages.values():
                            imageinfo = page.get('imageinfo', [])
                            if imageinfo and imageinfo[0].get('mediatype') == 'VIDEO':
                                info = imageinfo[0]
                                
                                content_item = ContentItem(
                                    title=title.replace('.webm', '').replace('.ogv', '').replace('_', ' '),
                                    description=f"Creative Commons video from Wikimedia Commons.",
                                    category="Documentary",
                                    duration_minutes=None,
                                    thumbnail_url=None,
                                    video_url=info.get('url'),
                                    file_size_bytes=info.get('size'),
                                    source="Wikimedia Commons"
                                )
                                content_items.append(content_item)
                                logger.info(f"Added: {content_item.title}")
                    
                    time.sleep(0.5)  # Rate limiting
                    
        except Exception as e:
            logger.error(f"Error scraping Wikimedia Commons: {e}")
            
        logger.info(f"Scraped {len(content_items)} items from Wikimedia Commons")
        return content_items
    
    def add_curated_content(self) -> List[ContentItem]:
        """Add manually curated open-source content."""
        logger.info("Adding curated open-source content...")
        
        curated_content = [
            ContentItem(
                title="Big Buck Bunny",
                description="A large and lovable rabbit deals with three tiny bullies in this Blender Foundation animated short.",
                category="Animation",
                duration_minutes=10,
                thumbnail_url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg",
                video_url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                file_size_bytes=158000000,
                source="Blender Foundation"
            ),
            ContentItem(
                title="Sintel",
                description="A woman searching for her pet dragon in this award-winning Blender Foundation short film.",
                category="Animation",
                duration_minutes=15,
                thumbnail_url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg",
                video_url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
                file_size_bytes=267000000,
                source="Blender Foundation"
            ),
            ContentItem(
                title="Tears of Steel",
                description="A sci-fi short film set in a post-apocalyptic world from the Blender Foundation.",
                category="Sci-Fi",
                duration_minutes=12,
                thumbnail_url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/TearsOfSteel.jpg",
                video_url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
                file_size_bytes=198000000,
                source="Blender Foundation"
            ),
            ContentItem(
                title="Elephants Dream",
                description="The world's first open movie, created entirely using open source software.",
                category="Animation",
                duration_minutes=11,
                thumbnail_url="https://archive.org/download/ElephantsDream/ed_1024_512kb.thumbs/ed_hd_000001.jpg",
                video_url="https://archive.org/download/ElephantsDream/ed_1024_512kb.mp4",
                file_size_bytes=180000000,
                source="Orange Open Movie Project"
            )
        ]
        
        logger.info(f"Added {len(curated_content)} curated items")
        return curated_content
    
    def populate_database(self, content_items: List[ContentItem]) -> bool:
        """Upload content items to Supabase database."""
        logger.info(f"Uploading {len(content_items)} items to database...")
        
        try:
            # Prepare data for batch insert
            insert_data = []
            for item in content_items:
                insert_data.append({
                    'title': item.title[:255],  # Ensure title fits in database
                    'description': item.description,
                    'category': item.category,
                    'duration_minutes': item.duration_minutes,
                    'thumbnail_url': item.thumbnail_url,
                    'video_url': item.video_url,
                    'file_size_bytes': item.file_size_bytes,
                    'is_public': True,
                    'created_by': None  # Public content, no specific creator
                })
            
            # Batch insert with chunking for large datasets
            chunk_size = 50
            success_count = 0
            
            for i in range(0, len(insert_data), chunk_size):
                chunk = insert_data[i:i + chunk_size]
                
                response = self.supabase.table('shows').insert(chunk).execute()
                
                if response.data:
                    success_count += len(chunk)
                    logger.info(f"Uploaded chunk {i//chunk_size + 1}: {len(chunk)} items")
                else:
                    logger.error(f"Failed to upload chunk {i//chunk_size + 1}")
                
                time.sleep(1)  # Rate limiting
            
            logger.info(f"Successfully uploaded {success_count}/{len(content_items)} items")
            return success_count == len(content_items)
            
        except Exception as e:
            logger.error(f"Error uploading to database: {e}")
            return False
    
    def run_import(self) -> bool:
        """Run the complete import process."""
        logger.info("Starting MeshTV content import...")
        
        all_content = []
        
        # Collect content from all sources
        all_content.extend(self.add_curated_content())
        all_content.extend(self.scrape_internet_archive())
        all_content.extend(self.scrape_wikimedia_commons())
        
        if not all_content:
            logger.warning("No content found to import")
            return False
        
        # Remove duplicates based on title
        unique_content = {}
        for item in all_content:
            key = item.title.lower().strip()
            if key not in unique_content:
                unique_content[key] = item
        
        final_content = list(unique_content.values())
        logger.info(f"Importing {len(final_content)} unique items (removed {len(all_content) - len(final_content)} duplicates)")
        
        # Upload to database
        return self.populate_database(final_content)
    
    def _find_video_file(self, metadata: Dict) -> Optional[str]:
        """Find the best video file from Internet Archive metadata."""
        files = metadata.get('files', [])
        
        # Prefer MP4, then other video formats
        video_extensions = ['.mp4', '.avi', '.mkv', '.webm', '.ogv']
        
        for ext in video_extensions:
            for file_info in files:
                filename = file_info.get('name', '')
                if filename.lower().endswith(ext) and 'original' not in filename.lower():
                    return filename
        
        return None
    
    def _extract_duration(self, metadata: Dict) -> Optional[int]:
        """Extract video duration in minutes from metadata."""
        try:
            files = metadata.get('files', [])
            for file_info in files:
                if file_info.get('name', '').lower().endswith(('.mp4', '.avi', '.mkv')):
                    length = file_info.get('length')
                    if length:
                        # Convert seconds to minutes
                        return int(float(length) / 60)
        except:
            pass
        return None
    
    def _extract_file_size(self, metadata: Dict, filename: str) -> Optional[int]:
        """Extract file size from metadata."""
        try:
            files = metadata.get('files', [])
            for file_info in files:
                if file_info.get('name') == filename:
                    size = file_info.get('size')
                    if size:
                        return int(size)
        except:
            pass
        return None

def main():
    """Main function to run the importer."""
    # Configuration
    SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://btsriforcmdugnuemlhx.supabase.co')
    SUPABASE_KEY = os.getenv('SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0c3JpZm9yY21kdWdudWVtbGh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4NzMwMjYsImV4cCI6MjA2OTQ0OTAyNn0.tLS61UwxkuoahhF0kNTCto3TJ4UrLd5RqAy4sfdW_UU')
    
    if not SUPABASE_URL or not SUPABASE_KEY:
        logger.error("Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables")
        return
    
    try:
        importer = MeshTVImporter(SUPABASE_URL, SUPABASE_KEY)
        success = importer.run_import()
        
        if success:
            logger.info("✅ MeshTV import completed successfully!")
        else:
            logger.error("❌ Import failed")
            
    except Exception as e:
        logger.error(f"Import failed with error: {e}")

if __name__ == "__main__":
    main()