-- Remove unsupported video format files that cause browser errors
-- Delete entries with archive.org URLs that are not browser-compatible

DELETE FROM shows 
WHERE video_url LIKE '%archive.org%' 
AND is_public = true;