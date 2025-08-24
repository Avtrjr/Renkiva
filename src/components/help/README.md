# Help & Onboarding System

Comprehensive offline help system for Mesh TV Network with privacy-first design.

## Components

### Core Components
- `HelpCenter` - Main help center with offline articles and search
- `StatusLegend` - Explains all status indicators (tap status dot to open)
- `QuickStartSheet` - One-page first-run guide
- `CoachMarks` - Feature walkthrough system (shows once per feature)
- `HelpOnboardingPanel` - Main integration panel on home page

### Contextual Help
- `CallRecoveryChip` - Shows "Retry (Audio-only)" during poor connections
- `BridgeBatteryHint` - Battery warning after Global Mode sessions
- `PolicyDialog` - Explains content blocking with learn more links
- `HelpButton` - Contextual help buttons with article deep-linking

## Features

✅ **Offline First** - All content stored locally, no network calls
✅ **Privacy Safe** - Local-only metrics, no user tracking
✅ **Accessible** - Screen reader support, large text compatible
✅ **Coach Marks** - One-time feature tips with "show again" option
✅ **Deep Linking** - Direct links to specific help articles
✅ **Search** - Full-text search across all help content
✅ **Status Legend** - Tap any status dot for explanations
✅ **Recovery UI** - Smart fallbacks during connection issues

## Usage

```tsx
// Add help button with specific article
<HelpButton article="verification" />

// Add status legend button (green dot)
<HelpButton variant="status" />

// Coach mark targets (add data attribute)
<Button data-coach-mark="verify-button">Verify</Button>
```

## Content Management

Help articles are managed in `useHelpRepository.ts`. Add new articles to the `HELP_ARTICLES` array.

Coach mark targets are defined in `useCoachMarks.ts` - add new targets to the `COACH_MARK_TARGETS` array.

## Privacy & Storage

- All metrics stored locally only (localStorage)
- No network requests for help content
- Reset option available for coach marks
- Battery/data usage tracked locally for bridge hints