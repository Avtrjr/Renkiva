import { useState, useEffect } from 'react';
import type { HelpArticle } from '@/types/help';

// Mock help articles - in production these would be loaded from local markdown files
const HELP_ARTICLES: HelpArticle[] = [
  {
    slug: 'quickstart',
    title: 'Quick Start Guide',
    section: 'getting-started',
    bodyMarkdown: `
# Quick Start Guide

Welcome to Mesh TV Network! This guide will get you started in minutes.

## Step 1: Verify Your Device
Tap the **Verify** button to scan and verify other devices on your local mesh.

## Step 2: Start a Call
Use **Start Call** to begin a private video call over the local mesh network.

## Step 3: Go Global
Enable **Global Mode** to connect with users worldwide via encrypted bridges.

## Step 4: Share Content
Use **Share** to send media files with signed Safety Manifests.

## Status Indicators
- 🟢 **Local Mesh**: Direct device-to-device connection
- 🔵 **Global Direct**: End-to-end encrypted global connection
- 🟡 **Global Relaying**: Still end-to-end encrypted, may add delay
- 🔴 **Audio Only**: Video dropped to maintain call quality
`
  },
  {
    slug: 'verification',
    title: 'Device Verification',
    section: 'privacy-security',
    bodyMarkdown: `
# Device Verification

Verification ensures you're communicating with the correct device and prevents man-in-the-middle attacks.

## How to Verify
1. Tap the **Verify** button
2. Scan the QR code displayed on the other device
3. Compare the fingerprint shown on both devices
4. Confirm the match

## Why Verify?
- Prevents spoofing attacks
- Ensures message authenticity
- Required for high-security communications

## Troubleshooting
If verification fails:
- Check both devices are on the same network
- Ensure cameras have permission
- Try manual fingerprint comparison
`
  },
  {
    slug: 'global-mode',
    title: 'Global Mode Setup',
    section: 'calls-groups',
    bodyMarkdown: `
# Global Mode

Global Mode allows you to communicate with users anywhere in the world through encrypted bridge connections.

## How It Works
1. Your device connects to a local bridge
2. The bridge forwards encrypted traffic (ciphertext only)
3. Remote bridge connects to destination device
4. End-to-end encryption maintained throughout

## Bridge Battery Management
Bridge mode uses additional battery and data:
- Disable Bridge mode when not needed
- Monitor battery usage in settings
- Bridge auto-disables at low battery (<20%)

## Connection Types
- **Direct**: Fastest, lowest latency
- **Relaying**: Uses relay servers when direct connection blocked
- **Audio Only**: Fallback mode for poor connections
`
  },
  {
    slug: 'safety-manifests',
    title: 'Safety Manifests',
    section: 'sharing-safety',
    bodyMarkdown: `
# Safety Manifests

Safety Manifests ensure shared content meets community standards and is safe to view.

## What Are Safety Manifests?
- Cryptographic signatures attached to content
- Verify content origin and integrity
- Contain safety metadata and ratings

## Content Blocking
Content may be blocked if:
- Missing or invalid Safety Manifest
- Flagged by moderation bulletins
- Violates community guidelines
- Origin not verified

## What to Do If Content Is Blocked
1. Check if sender is verified
2. Request content re-share with valid manifest
3. Report false positives to moderators
4. Review community guidelines
`
  },
  {
    slug: 'status-indicators',
    title: 'Status Indicators',
    section: 'status-troubleshooting',
    bodyMarkdown: `
# Status Indicators

Understanding the status badges helps you know your connection state.

## Connection Status
- 🟢 **Local Mesh**: Device-to-device connection on local network
- 🔵 **Global (Direct)**: Direct encrypted connection worldwide
- 🟡 **Global (Relaying)**: Connection via relay servers (still encrypted)

## Quality Status
- 🔴 **Audio Only**: Video disabled to maintain call quality
- ⚠️ **Unverified Origin**: Content hidden until sender verified
- 🚫 **Safety Blocked**: Content blocked by safety policies

## Troubleshooting
- **Poor Quality**: Try audio-only mode
- **Can't Connect**: Check network and bridge status
- **Content Blocked**: Verify sender or check safety settings
`
  }
];

export function useHelpRepository() {
  const [articles] = useState<HelpArticle[]>(HELP_ARTICLES);

  const searchArticles = (query: string): HelpArticle[] => {
    if (!query.trim()) return articles;
    
    const lowercaseQuery = query.toLowerCase();
    return articles.filter(article => 
      article.title.toLowerCase().includes(lowercaseQuery) ||
      article.bodyMarkdown.toLowerCase().includes(lowercaseQuery) ||
      article.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  };

  const getArticleBySlug = (slug: string): HelpArticle | undefined => {
    return articles.find(article => article.slug === slug);
  };

  const getArticlesBySection = (section: string): HelpArticle[] => {
    return articles.filter(article => article.section === section);
  };

  return {
    articles,
    searchArticles,
    getArticleBySlug,
    getArticlesBySection
  };
}