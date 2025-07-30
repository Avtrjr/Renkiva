-- Update shows with missing video URLs to add working streaming URLs

UPDATE shows 
SET video_url = 'https://archive.org/download/CosmosPersonalVoyage/Cosmos%20-%20Carl%20Sagan%20-%2001of13%20-%20The%20Shores%20of%20the%20Cosmic%20Ocean.mp4'
WHERE title = 'Cosmos: A Personal Voyage' AND video_url IS NULL;

UPDATE shows 
SET video_url = 'https://archive.org/download/PlanetEarth_201910/Planet%20Earth%202006%20S01E01%20From%20Pole%20to%20Pole.mp4'
WHERE title = 'Planet Earth' AND video_url IS NULL;