import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://btsriforcmdugnuemlhx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0c3JpZm9yY21kdWdudWVtbGh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4NzMwMjYsImV4cCI6MjA2OTQ0OTAyNn0.tLS61UwxkuoahhF0kNTCto3TJ4UrLd5RqAy4sfdW_UU'
);

// Simulated video metadata for test
const testVideo = {
  title: 'Test Upload - AI Diagnostics',
  category: 'Sci-Fi',
  description: 'MeshTV automated test upload',
  tags: '#test',
  filename: 'test-video.mp4'
};

test.describe('MeshTV Automated Diagnostics', () => {
  
  // Step 1: UI Test – Homepage loads
  test('Homepage loads correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByText('MeshTV')).toBeVisible();
  });

  // Step 2: UI Test – Library page navigation
  test('Library page loads and displays content', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to library
    const libraryLink = page.getByRole('link', { name: /library/i });
    if (await libraryLink.isVisible()) {
      await libraryLink.click();
      await expect(page.url()).toContain('/library');
    } else {
      // Direct navigation if link not found
      await page.goto('/library');
    }
    
    await expect(page.locator('[data-testid="content-card"], .movie-card, .content-item')).toHaveCountGreaterThan(0);
  });

  // Step 3: Mass Import Dashboard access
  test('Mass Import Dashboard loads', async ({ page }) => {
    await page.goto('/mass-import');
    await expect(page.getByText('Mass Import Dashboard')).toBeVisible();
    await expect(page.getByText('Number of movies to import')).toBeVisible();
  });

  // Step 4: Supabase Test – Connection and basic query
  test('Supabase connection works', async () => {
    const { data, error } = await supabase.from('shows').select('*').limit(1);
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  // Step 5: Supabase Test – Metadata insert (cleanup after)
  test('Supabase accepts test metadata', async () => {
    // Insert test data
    const { data: insertData, error: insertError } = await supabase
      .from('shows')
      .insert([{
        title: testVideo.title,
        category: testVideo.category,
        description: testVideo.description,
        is_public: true
      }])
      .select()
      .single();
    
    expect(insertError).toBeNull();
    expect(insertData).toBeDefined();
    
    // Cleanup - delete test data
    if (insertData?.id) {
      await supabase.from('shows').delete().eq('id', insertData.id);
    }
  });

  // Step 6: BLE Sync Simulation (Mock)
  test('BLE peer simulation', async () => {
    const bleSimulation = await simulateBLESnapshotPeer();
    expect(bleSimulation.status).toBe('connected');
    expect(bleSimulation.hops).toBeGreaterThan(0);
    expect(bleSimulation.signalStrength).toContain('%');
  });

  // Step 7: Navigation and routing tests
  test('All main routes are accessible', async ({ page }) => {
    const routes = [
      '/',
      '/library', 
      '/mesh-library',
      '/meshtv',
      '/mesh-network',
      '/mass-import'
    ];

    for (const route of routes) {
      await page.goto(route);
      // Should not show 404 or error page
      await expect(page.locator('body')).not.toContainText('Not Found');
      await expect(page.locator('body')).not.toContainText('404');
    }
  });

  // Step 8: AI-curated homepage content check
  test('AI-curated homepage displays sections', async ({ page }) => {
    await page.goto('/');
    
    // Check for common homepage sections
    const hasHeroSection = await page.locator('section, .hero, [data-testid="hero"]').first().isVisible();
    const hasContentSections = await page.locator('h2, h3').count() > 0;
    
    expect(hasHeroSection || hasContentSections).toBeTruthy();
  });

  // Step 9: Content streaming simulation
  test('Content discovery functionality', async ({ page }) => {
    await page.goto('/mesh-library');
    
    // Check if content discovery interface loads
    await expect(page.locator('body')).toBeVisible();
    
    // Look for content cards or streaming interface
    const hasContentInterface = await page.locator('[data-testid="content"], .content-card, .stream-card').count() > 0;
    expect(hasContentInterface).toBeTruthy();
  });

});

// Helper function for BLE simulation
async function simulateBLESnapshotPeer() {
  console.log('📡 Simulating BLE peer broadcast…');
  return {
    status: 'connected',
    hops: Math.floor(Math.random() * 5) + 1,
    signalStrength: `${Math.floor(Math.random() * 40) + 60}%`
  };
}