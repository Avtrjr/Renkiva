# Lovable.dev Integration Prompt: Mesh TV Network Fragment-Based Streaming UI

## Project Overview
Build a decentralized video streaming interface for **Mesh TV Network** that displays real-time fragment reassembly using the MNMP (MeshTV Noise Mesh Protocol) v1. This UI demonstrates peer-to-peer video distribution through Bluetooth Low Energy mesh networks.

## Core Requirements

### 1. Main Streaming Dashboard
Create a responsive React component that displays:
- **Network Status Header**: Shows active streams, connected mesh nodes, encryption status, and fragments received
- **Stream List Panel**: Available streams from mesh network with progress bars and metadata
- **Main Player Area**: Video player with fragment assembly progress visualization
- **Network Statistics**: Real-time protocol metrics and node connectivity

### 2. Fragment Visualization
- **Assembly Progress Bar**: Shows percentage of video fragments received
- **Fragment Grid**: Visual representation of received/missing fragments (small numbered squares)
- **Real-time Updates**: Live updates as fragments arrive from mesh nodes
- **Signal Strength Indicators**: Visual mesh network connectivity status

### 3. Stream Management
- Stream selection from available mesh broadcasts
- Play/pause controls with fragment-based buffering
- Download assembled streams for offline viewing
- Favorite streams and share with mesh network

### 4. Design System
- **Color Scheme**: Cyberpunk-inspired with electric blue primary (#00D4FF), dark backgrounds, and neon accents
- **Typography**: Modern sans-serif with tech aesthetic
- **Components**: Use shadcn/ui cards, badges, buttons, and progress bars
- **Responsive**: Mobile-first design with grid layouts

### 5. Protocol Integration
- Connect to MNMP manager service for stream data
- Display encryption status (Noise Protocol Framework)
- Show mesh node connectivity and signal strength
- Real-time fragment receipt notifications

## Technical Implementation

### Component Structure
```typescript
interface StreamUIProps {
  streamId?: string;
  autoStart?: boolean;
}

// Main component with:
// - Stream discovery and selection
// - Fragment reassembly visualization  
// - Network status monitoring
// - Video playback controls
```

### Key Features to Implement
1. **Stream Discovery**: Scan for nearby mesh broadcasts
2. **Fragment Assembly**: Visual progress of video reconstruction
3. **Mesh Network Map**: Show connected nodes and signal strength
4. **Encryption Status**: Display secure channel indicators
5. **Protocol Statistics**: Bandwidth, latency, and reliability metrics

### Data Flow
- Subscribe to MNMP protocol events
- Update UI in real-time as fragments arrive
- Handle stream completion and playback
- Sync with Supabase database for persistence

## UI/UX Guidelines

### Visual Design
- **Neon Blue Accents**: Electric blue (#00D4FF) for primary actions
- **Dark Theme**: Black/dark gray backgrounds with high contrast
- **Gradient Cards**: Subtle gradients for depth and modern feel
- **Icon Usage**: Lucide React icons for consistent iconography

### User Experience
- **Auto-Discovery**: Automatically detect and display available streams
- **Progress Feedback**: Clear visual feedback for fragment assembly
- **Network Awareness**: Show mesh connectivity and node status
- **Offline Support**: Cache completed streams for offline viewing

### Responsive Behavior
- **Mobile**: Single column layout with stacked panels
- **Tablet**: Two-column grid with stream list and player
- **Desktop**: Three-column layout with full feature set

## Example Implementation Guide

1. **Initialize with** `npm create lovable@latest mesh-tv-streaming`
2. **Install dependencies**: shadcn/ui components, Supabase client
3. **Create components**: StreamDiscovery, FragmentAssembler, NetworkStatus
4. **Integrate protocol**: Connect to MNMP manager and database
5. **Style with** Tailwind CSS using cyberpunk color palette

## Success Criteria
- Real-time fragment visualization updates
- Smooth stream selection and playback
- Clear network status indicators
- Responsive design across all devices
- Polished cyberpunk aesthetic matching Mesh TV Network branding

This UI showcases the power of decentralized streaming with visual appeal and technical sophistication, perfect for demonstrating the MNMP protocol capabilities.