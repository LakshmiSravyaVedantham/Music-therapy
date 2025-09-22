# Design Guidelines: HealthTune - Mood-Based Music Therapy

## Design Approach
**Reference-Based Approach**: Drawing inspiration from the medical-grade aesthetic of the Mind-Weaver reference app, combined with modern music streaming interfaces like Spotify and Apple Music. The design emphasizes clinical precision with accessible, consumer-friendly music discovery.

## Core Design Elements

### A. Color Palette
**Primary Colors:**
- Dark mode primary: 220 15% 15% (deep navy-charcoal)
- Light mode primary: 220 20% 98% (clinical white)
- Accent: 200 100% 60% (medical blue for health data)
- Success/positive mood: 142 71% 45% (calm green)
- Warning/stress indicators: 25 95% 53% (warm orange)
- Error/critical alerts: 0 84% 60% (medical red)

**Mood-Based Color System:**
- Calm/Relaxed: 200 30% 70% (soft blue)
- Energetic/Happy: 45 86% 62% (vibrant yellow)
- Focus/Productive: 260 60% 65% (purple)
- Sad/Melancholy: 220 13% 40% (muted blue-gray)

### B. Typography
- **Primary**: Inter (Google Fonts) - clean, medical-grade readability
- **Accent**: JetBrains Mono (Google Fonts) - for health data displays
- **Hierarchy**: 
  - Headers: 600 weight, larger scales
  - Body: 400 weight, optimal reading size
  - Data displays: 500 weight, monospace for precision

### C. Layout System
**Tailwind Spacing Units**: Consistently use 2, 4, 6, 8, 12, 16 units
- Tight spacing: p-2, m-2 (health metrics)
- Standard spacing: p-4, gap-4 (content sections)
- Generous spacing: p-8, my-12 (section separators)
- Extra spacing: p-16 (hero sections)

### D. Component Library

**Health Data Visualization:**
- Real-time charts with medical-grade precision
- Circular progress indicators for mood metrics
- Timeline views for mood/health correlation
- Clean data cards with subtle shadows

**Music Interface Components:**
- Album art integration with health mood overlays
- Playlist cards showing mood-health connections
- Playback controls with health context
- Music recommendation cards based on current mood

**Navigation:**
- Clean sidebar with health/music sections
- Contextual tabs for different mood states
- Breadcrumb navigation for health history

**Forms & Inputs:**
- Health device connection interfaces
- Music service authentication
- Preference settings with visual feedback
- Consent forms for health data usage

### E. Animations
Minimal, medical-appropriate animations:
- Subtle fade-ins for health data updates
- Smooth transitions between mood states
- Gentle pulse effects for active health monitoring
- Simple loading states for data synchronization

## Images
**Hero Section**: Large background image featuring abstract health/music visualization (EKG waves transforming into sound waves) with blurred gradient overlay. Implement outline buttons with blurred backgrounds over this hero image.

**Health Device Images**: Clean, minimal product shots of Apple Watch, Whoop, and other health devices in the integration section.

**Mood Visualization**: Abstract geometric patterns representing different emotional states, used as subtle background elements.

**Music Integration**: Clean interface mockups showing Spotify/YouTube Music integration without using actual branded screenshots.

## Visual Treatment
The design should feel like a premium health application with music streaming capabilities - clinical precision meets creative expression. Use gradients sparingly, primarily for mood state transitions (blue to green for calm states, warm oranges for energetic moods).

**Background Treatments**: Subtle mesh gradients in mood-appropriate colors, never overwhelming the data presentation. Medical-grade white backgrounds in light mode with precise shadows and clean card designs.

## Key Design Principles
1. **Medical-Grade Precision**: All health data displays must feel trustworthy and accurate
2. **Mood-Responsive Design**: Interface adapts colors/themes based on detected mood
3. **Seamless Integration**: Health and music elements feel naturally connected
4. **Privacy-First**: Clear visual indicators for health data security and user consent
5. **Accessible Design**: High contrast ratios, clear typography, comprehensive dark mode support