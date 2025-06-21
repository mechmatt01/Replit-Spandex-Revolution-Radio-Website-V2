# Spandex Salvation Radio - Old School Metal Streaming Platform

## Overview

Spandex Salvation Radio is a full-stack web application for streaming old-school metal music 24/7. It's built as a modern radio station platform with interactive features including live streaming, show schedules, song submissions, contact forms, merchandise store integration, and admin management capabilities.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side navigation
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom metal-themed color palette
- **State Management**: React Context for audio and admin state
- **Data Fetching**: TanStack Query (React Query) for server state management
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: Express sessions with PostgreSQL store
- **Development**: Hot reloading with Vite middleware integration

### Database Schema
The application uses PostgreSQL with the following main entities:
- **Users**: Admin authentication and user management
- **Submissions**: Song request system with approval workflow
- **Contacts**: Contact form submissions
- **Show Schedules**: Weekly programming schedule
- **Past Shows**: Archive of previous broadcasts
- **Now Playing**: Current track information
- **Stream Stats**: Real-time listener statistics
- **Subscriptions**: Email newsletter and premium tier management

## Key Components

### Audio System
- **Audio Context**: Centralized audio state management
- **Sticky Player**: Persistent bottom player with playback controls
- **Now Playing**: Real-time track information display
- **Stream Stats**: Live listener count and engagement metrics

### Content Management
- **Show Scheduling**: Weekly programming with host information
- **Song Submissions**: Community-driven playlist requests with moderation
- **Admin Panel**: Content moderation and stream management tools
- **Contact System**: User inquiry handling

### User Interface
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Dark Theme**: Metal-themed color scheme with orange/gold accents
- **Interactive Map**: Global listener visualization (placeholder for future implementation)
- **Subscription Tiers**: Premium membership system with feature differentiation

### External Integrations
- **Firebase**: Authentication system (configured but not fully implemented)
- **Shopify**: Merchandise store integration (placeholder)
- **Social Media**: Platform links and sharing capabilities

## Data Flow

1. **Client Requests**: Frontend makes API calls through TanStack Query
2. **API Layer**: Express.js handles REST endpoints with validation
3. **Database Operations**: Drizzle ORM manages PostgreSQL interactions
4. **Real-time Updates**: Polling-based updates for now playing and stats
5. **State Management**: React Context provides global state for audio and admin features

## External Dependencies

### Core Framework Dependencies
- React ecosystem (React, React DOM, React Query)
- Express.js with TypeScript support
- Drizzle ORM with PostgreSQL adapter
- Neon Database for serverless PostgreSQL

### UI and Styling
- Tailwind CSS for utility-first styling
- Radix UI for accessible component primitives
- Shadcn/ui for pre-built component library
- Lucide icons for consistent iconography

### Development Tools
- Vite for build tooling and development server
- TypeScript for type safety
- ESBuild for production bundling
- Drizzle Kit for database migrations

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with hot reloading
- **Database**: Neon Database connection via environment variables
- **Port Configuration**: Development on port 5000

### Production Build
- **Frontend**: Vite builds optimized static assets
- **Backend**: ESBuild bundles Node.js application
- **Deployment Target**: Replit autoscale deployment
- **Asset Serving**: Express serves static files in production

### Environment Configuration
- Database URL configuration through environment variables
- Firebase configuration for authentication
- Production/development mode switching

## Advanced Components Integration

### Real-time Interactive Features
- **Interactive Listener Map**: Global geolocation visualization with real-time listener counts and country breakdowns
- **Advanced Audio Player**: Full playlist functionality with shuffle, repeat, favorites, and social sharing
- **Advanced Admin Dashboard**: Comprehensive analytics with streaming controls, social media metrics, and content management

### Payment & E-commerce Integration
- **Stripe Payment Processing**: Secure subscription management with multiple tier options (Rebel, Legend, Icon)
- **Shopify E-commerce Integration**: Complete merchandise store with cart functionality, product variants, and checkout flow

### Social Media & Revenue
- **Social Media Integration**: Platform analytics, engagement tracking, and sharing capabilities across Facebook, Twitter, Instagram, and YouTube
- **Google Ads Integration**: Revenue generation framework (ready for Google Ads implementation)

### Enhanced User Experience
- **Borderless Modern Design**: Removed all borders throughout the site for clean, modern aesthetic
- **Enhanced Typography**: Improved font weights (font-black for headings, font-semibold for content)
- **Deep Black Default Theme**: Dark theme as default for first-time visitors
- **Responsive Navigation**: Optimized spacing and mobile behavior

## Google OAuth Setup Notes
Current development domain: `https://9c4b622d-92a4-4193-9bf1-e70aa305f5b5-00-nv1cf8s5dwtq.spock.replit.dev`
Required redirect URIs in Google Cloud Console:
- Development: `https://9c4b622d-92a4-4193-9bf1-e70aa305f5b5-00-nv1cf8s5dwtq.spock.replit.dev/api/auth/google/callback`
- Production: `https://workspace.replit.app/api/auth/google/callback`

## Changelog
- June 21, 2025: Fixed countdown text color to display black in light mode and white in dark mode, implemented proper navigation centering using flexbox layout for reliable positioning relative to brand text
- June 21, 2025: Final floating player layout - swapped play button to far right position, swapped LIVE indicator and "Live Stream" text positions, volume controls positioned before play button
- June 21, 2025: Fixed navigation layout to center main menu items relative to "SPANDEX SALVATION RADIO" text width in full screen mode instead of entire screen width
- June 21, 2025: Updated favicon to display dynamic disc logo design with theme-aware gradient colors matching current theme selection
- June 21, 2025: Implemented Google reCAPTCHA Enterprise SMS fraud detection system with comprehensive phone verification security
- June 21, 2025: Fixed Google OAuth redirect URI configuration for current development domain
- June 17, 2025: Initial setup with complete radio station website
- June 17, 2025: Added PostgreSQL database with full schema migration
- June 17, 2025: Implemented theme switching (dark/light mode) with smooth transitions
- June 17, 2025: Moved "Live Now" indicator below intro text as requested
- June 17, 2025: Completed comprehensive styling overhaul - removed all borders, enhanced fonts, deep black default theme
- June 17, 2025: Integrated advanced components - interactive listener map, Stripe payments, Shopify e-commerce, advanced admin dashboard, enhanced audio player
- June 17, 2025: Updated navigation - removed "TUNE IN LIVE" button, repositioned text elements, improved spacing
- June 17, 2025: Final navigation updates - custom radio SVG logo, responsive vertical/horizontal text layout, removed theme toggle, vertically centered elements
- June 17, 2025: Navigation refinements - precise 15px left padding, 10px spacing between brand and nav items, full capitalization of menu items, stacked "SPANDEX SALVATION RADIO" layout
- June 17, 2025: Navigation layout optimization - centered navigation links between branding and controls, restored theme toggle with 15px spacing from SUBSCRIBE link
- June 17, 2025: Theme toggle enhancement - added sun/moon icons based on current mode (sun for dark mode, moon for light mode) with proper functionality
- June 17, 2025: Logo update - replaced SVG radio icon with custom RadioLogo.png image, aspect-fill centered on orange gradient background with 5px padding
- June 17, 2025: Hero text theming - updated main title to display black in light mode and white in dark mode
- June 17, 2025: Hero text layout - moved "Join the hairspray rebellion!" to new line below main description
- June 18, 2025: Fixed theme toggle icon display issue - sun icon now properly visible in dark mode with inline orange color styling
- June 18, 2025: Implemented working audio playbook system with accessible Google audio sources to resolve CORS restrictions
- June 18, 2025: Complete Spotify Web API integration implemented with authentication flow, Web Playbook SDK, and server-side token endpoints
- June 18, 2025: Added dedicated music page with live stream and Spotify streaming options
- June 18, 2025: Fixed theme toggle icon centering with perfect positioning using translate transforms
- June 18, 2025: Security vulnerability CVE-2025-30208 patched by updating Vite from 5.4.14 to 5.4.15
- June 18, 2025: Integrated live AutoDJ radio stream data displaying real-time track information from http://168.119.74.185:9858/status-json.xsl
- June 18, 2025: Home page play button now shows authentic live radio data instead of static placeholder content
- June 18, 2025: Implemented inline Icecast player streaming directly from http://168.119.74.185:9858/autodj with volume controls and live indicators
- June 18, 2025: Added responsive hamburger menu navigation for mobile accessibility with complete link coverage and smooth transitions
- June 18, 2025: Fixed duplicate theme toggle icons and enhanced Icecast streaming with proper CORS handling, timeout management, and specific error messages
- June 18, 2025: Fixed JSON parsing errors and completely rewrote Icecast player with authentic streaming from live radio server - now properly plays music when play button is clicked
- June 18, 2025: Removed all Spotify API calls and references to eliminate JSON parsing errors and streaming conflicts
- June 18, 2025: Fixed volume range errors (changed from 0-100 to 0-1 range) preventing audio playback
- June 18, 2025: Rebuilt AudioContext with proper event handling and error recovery mechanisms
- June 18, 2025: Implemented server-side streaming proxy (/api/radio-stream) to resolve CORS and audio format compatibility issues
- June 18, 2025: Added dynamic metal genre-based theme switcher with 7 different color palettes (Classic Metal, Black Metal, Death Metal, Power Metal, Doom Metal, Thrash Metal, Gothic Metal)
- June 18, 2025: Created SimpleRadioPlayer component with enhanced error handling and browser compatibility
- June 18, 2025: Successfully implemented working live radio streaming with multiple format fallbacks and proper error handling
- June 18, 2025: Updated StickyPlayer to sync with live radio stream, displaying real-time track information and listener counts
- June 18, 2025: Implemented full theme system integration across entire site using CSS custom properties for dynamic color switching
- June 18, 2025: Added album artwork fetching from MusicBrainz/Cover Art Archive for live tracks
- June 18, 2025: Removed About tab from navigation as requested
- June 18, 2025: Fixed all audio streaming errors and implemented browser-compatible streaming with volume controls
- June 18, 2025: Resolved JSON parsing errors by removing external MusicBrainz API calls from StickyPlayer component
- June 18, 2025: Implemented StreamLinkPlayer to bypass browser CORS restrictions using external link approach for radio streaming
- June 18, 2025: Created comprehensive radio streaming solution with multiple format options and direct media player integration
- June 19, 2025: Complete Radio.co-compatible streaming system overhaul - removed complex Icecast code, implemented clean RadioCoPlayer with SomaFM test stream
- June 19, 2025: Added shared RadioContext for synchronized playback state between main player and floating sticky player
- June 19, 2025: Implemented live track information fetching with fade animations for smooth track transitions
- June 19, 2025: Added album artwork support in both main and floating players with fallback gradient backgrounds
- June 19, 2025: Created synchronized volume controls that update both players when changed on either one
- June 19, 2025: Enhanced floating sticky player with proper album art, track info, and volume synchronization
- June 19, 2025: Added favicon and Open Graph meta tags for link previews and social media sharing
- June 19, 2025: Fixed scrolling text direction to properly scroll left-to-right continuously in both players
- June 19, 2025: Reorganized floating player layout with LIVE indicator and play button positioned next to volume controls
- June 19, 2025: Enhanced track information hierarchy with album name between title and artist, proper font sizing
- June 19, 2025: Implemented theme-aware button hover effects using selected theme colors throughout navigation
- June 19, 2025: Improved responsive design and removed borderless main music player styling
- June 19, 2025: Added proper light/dark mode text color handling for all interface elements
- June 19, 2025: Enhanced mobile menu with full-screen layout and stronger blur effects without darkened overlay
- June 19, 2025: Implemented comprehensive accessibility features including skip-to-content, ARIA labels, and keyboard navigation
- June 19, 2025: Updated floating player to always be visible and synchronized with main player controls
- June 19, 2025: Fixed album name display in main player - shows album when available, removes "Live Stream" text accordingly
- June 19, 2025: Improved scroll timing in floating player for faster text reappearance (4s vs 8s animation)
- June 19, 2025: Enhanced floating player pause/play icons with thicker design, better spacing, and increased size while maintaining perfect centering
- June 19, 2025: Implemented continuous scrolling text animation by duplicating text content and adjusting keyframe to prevent gaps between scroll cycles
- June 19, 2025: Fixed focus ring color on floating player play/pause button to dynamically match current theme primary color
- June 19, 2025: Enhanced scrolling text behavior - static centered display when paused, smart scrolling only for track content during playback
- June 19, 2025: Increased floating player icon size to 28px for better visibility and interaction
- June 21, 2025: Complete authentication system implementation - email/password + Google OAuth, persistent login sessions, profile avatars in navigation
- June 21, 2025: Comprehensive profile management system - sidebar navigation, profile image upload, premium avatar selection, phone number/email management
- June 21, 2025: Advanced subscription management - billing information display, payment method details, subscription cancellation with confirmation modals
- June 21, 2025: Enhanced live chat with friendly subscription prompts - only shows for first-time users or when clicking premium features, subscription upgrade flow
- June 21, 2025: Database schema updates - added profile images, phone numbers, login tracking, subscription management fields
- June 21, 2025: Created dedicated login page with proper routing, subscription page with tier selection, and profile page with complete feature set
- June 21, 2025: Added verified badge toggle in Profile section - premium users can enable/disable checkmark display on their profile avatar, with contextual premium notifications for all features
- June 21, 2025: Integrated Firebase database for user data storage/editing/removal with automatic sync between PostgreSQL and Firebase
- June 21, 2025: Implemented account deletion feature with red "Delete" button, animated confirmation popup, and business logic - cancels subscription auto-renewal but preserves account until next billing date
- June 21, 2025: Added fade-in/fade-out animations to all popups, warnings, notifications, and dialog elements throughout the site
- June 21, 2025: Implemented real-time live radio data fetching - now playing information updates every 5 seconds from actual Icecast stream, displays current Black Sabbath track instead of static placeholder data
- June 21, 2025: Enhanced button styling across site - larger Rock the Airways buttons with increased padding, proper theme color matching, gradient backgrounds, hover animations, and consistent theming for all interactive elements
- June 21, 2025: Updated Features section with proper theme integration - larger cards with enhanced padding, dynamic theme colors, improved hover effects with scale and shadow animations, and consistent color scheme throughout
- June 21, 2025: Implemented comprehensive ad detection system using OpenAI Whisper for audio transcription, GPT-4o for content analysis, metadata parsing, and keyword detection to automatically identify advertisements vs music content
- June 21, 2025: Fixed Features section styling consistency - all cards now use primary orange theme colors, removed black borders from buttons, standardized button hover effects with clean orange highlight and white text
- June 19, 2025: Improved text display logic to show single instance when static, duplicated only during scrolling animations
- June 19, 2025: Enhanced text alignment - floating player left-aligned, main player centered when not playing
- June 19, 2025: Adjusted main player width to prevent text cutoff when displaying station name
- June 19, 2025: Increased floating player icon size to 32px for improved visibility and interaction
- June 19, 2025: Addressed security vulnerabilities by updating npm packages (Vite 6.3.5, drizzle-kit 0.31.1)
- June 19, 2025: Enhanced floating player icons to 40px with bolder design for maximum visibility
- June 19, 2025: Added persistent LIVE indicator above album art in main player (always visible)
- June 19, 2025: Implemented responsive dropdown navigation with outline icons, auto-sizing width, fully right-aligned text and icons, and matching blur background identical to floating music player for both desktop and mobile menus
- June 19, 2025: Enhanced dropdown navigation with darkened blur background (bg-black/80 backdrop-blur-md) for improved text visibility while maintaining elegant visual effect
- June 19, 2025: Fixed section headers and main title text colors to display black in light mode and white in dark mode for proper visibility on all backgrounds
- June 19, 2025: Added proper spacing in theme selector to prevent selection border from being cut off by header background
- June 19, 2025: Enhanced Open Graph link previews with dynamic theme-aware colors and styling that updates based on current theme selection
- June 19, 2025: Added dynamic favicon generation that changes colors based on selected theme for consistent branding
- June 19, 2025: Implemented comprehensive tooltips with theme-aware styling throughout the interface for improved accessibility
- June 19, 2025: Complete authentication system implementation with email/password registration, bcrypt encryption, session management, and Google OAuth integration
- June 19, 2025: Added authentication modal with proper form styling (single outline colors), sign in/sign out functionality in navigation for both desktop and mobile
- June 19, 2025: Integrated Google OAuth with "Sign in with Google" button and server-side authentication routes for seamless social login
- June 19, 2025: Successfully integrated Hot 97 TuneIn embed player directly into streaming system replacing previous radio configurations
- June 19, 2025: Updated radio streaming infrastructure to use authentic Hot 97 TuneIn iframe player (https://tunein.com/embed/player/s22162/)
- June 19, 2025: Rebranded station from previous configurations to Hot 97 FM with "New York's Hip Hop & R&B" messaging throughout application
- June 19, 2025: Created dedicated Hot97Player component with TuneIn iframe integration, volume controls, and synchronized playback state
- June 19, 2025: Simplified MusicPage to focus exclusively on Hot 97 streaming, removing all Spotify-related code and dependencies
- June 19, 2025: Replaced TuneIn iframe with direct Hot 97 StreamTheWorld URLs for full integration into existing radio player infrastructure
- June 19, 2025: Updated radio players to dynamically fetch station names and handle album information properly with conditional display logic
- June 19, 2025: Implemented advertisement detection and custom "Ad" logo display with smooth 500ms fade transitions between track changes
- June 19, 2025: Added duplicate text prevention in both main and floating players to eliminate redundant station name and content repetition
- June 20, 2025: Implemented client feedback - removed album/release year fields from submissions form, eliminated duplicate components (kept InteractiveListenerMap, StripePaymentProcessor, ShopifyEcommerce), restricted submissions to paid subscribers only
- June 20, 2025: Added comprehensive live chat feature with host control toggle, authentication integration, real-time messaging, and responsive design
- June 20, 2025: Enhanced submissions form with premium feature protection, requiring paid subscription and authentication for access
- June 20, 2025: Fixed text scrolling to always move when content overflows container, restored album artwork display with default images for all tracks
- June 20, 2025: Enhanced live chat as premium feature - only shows for authenticated users with paid subscriptions, displays upgrade prompt for non-subscribers
- June 20, 2025: Streamlined submissions form UI - moved sign in/subscription buttons to single premium feature box, positioned live chat higher above floating player
- June 20, 2025: Repositioned countdown timer between "Join the hairspray rebellion!" text and main live player for improved visibility per client request
- June 20, 2025: Enhanced UI elements - improved countdown text size, added proper spacing, hid empty sections for unauthenticated users, implemented theme-aware styling for all buttons and text colors
- June 20, 2025: Fixed live chat visibility logic - completely hidden for unauthenticated users, only shows subscription prompt for authenticated non-subscribers
- June 20, 2025: Enhanced countdown styling - increased title text size to text-2xl and reduced spacing to mb-1 for better visual hierarchy
- June 20, 2025: Fixed initial music player state to display themed music logo instead of placeholder artwork when site first loads - track data now only fetches when playing, ensuring clean initial state with themed logo
- June 21, 2025: Implemented comprehensive user authentication and profile management system with persistent login, profile avatar in navigation, complete profile page with subscription management, submission tracking, and premium rock avatars feature

## User Preferences

Preferred communication style: Simple, everyday language.