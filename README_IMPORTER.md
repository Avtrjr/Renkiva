# MeshTV Auto-Import Script

This Python script automatically populates your MeshTV platform with a curated library of open-source movies and content from legitimate sources.

## Features

- 🎬 **Internet Archive Integration**: Scrapes public domain movies from various collections
- 📺 **Wikimedia Commons**: Imports Creative Commons videos
- 🎨 **Curated Content**: Includes high-quality open-source films (Blender Foundation, etc.)
- 🗂️ **Genre Classification**: Automatically categorizes content by genre
- 🚀 **Batch Processing**: Efficiently uploads content to your Supabase database
- 🔄 **Duplicate Detection**: Prevents duplicate content imports

## Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Set Environment Variables
```bash
export SUPABASE_URL="your_supabase_url"
export SUPABASE_ANON_KEY="your_supabase_anon_key"
```

### 3. Run the Import
```bash
python meshtv_importer.py
```

## Content Sources

### Internet Archive Collections
- **Sci-Fi**: Classic science fiction films
- **Horror**: Public domain horror movies  
- **Animation**: Animated shorts and features
- **Documentary**: Educational documentaries
- **Classic**: Vintage feature films
- **Comedy**: Classic comedy films

### Curated Open-Source Content
- Big Buck Bunny (Blender Foundation)
- Sintel (Blender Foundation)
- Tears of Steel (Blender Foundation)
- Elephants Dream (Orange Open Movie Project)

## Running Options

### 🖥️ Local Development
```bash
python meshtv_importer.py
```

### 📦 Docker Container
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY meshtv_importer.py .
CMD ["python", "meshtv_importer.py"]
```

### ☁️ GitHub Action
```yaml
name: Update MeshTV Library
on:
  schedule:
    - cron: '0 6 * * 0'  # Weekly on Sunday
  workflow_dispatch:

jobs:
  import:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: pip install -r requirements.txt
      - run: python meshtv_importer.py
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```

### 🔧 Hosted Server (cron)
```bash
# Add to crontab for weekly updates
0 6 * * 0 cd /path/to/meshtv && python meshtv_importer.py >> import.log 2>&1
```

## Configuration

The script uses your existing Supabase configuration and populates the `shows` table with:
- Title and description
- Genre/category classification
- Video URLs and thumbnails
- File size and duration metadata
- Public availability flags

## Legal Compliance

All content sources are:
- ✅ Public domain
- ✅ Creative Commons licensed
- ✅ Explicitly open source
- ✅ Legally redistributable

## Customization

Edit the script to:
- Add new content sources
- Modify genre classifications
- Adjust content filtering
- Change import batch sizes

## Troubleshooting

- Ensure your Supabase credentials are correct
- Check network connectivity for content sources
- Review logs for specific import errors
- Verify database permissions for the `shows` table

## Output

The script will populate your MeshTV library with hundreds of high-quality open-source films, organized by genre and ready for offline mesh broadcasting!