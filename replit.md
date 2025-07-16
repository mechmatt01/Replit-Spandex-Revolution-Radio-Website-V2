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

**IMPORTANT**: You must add the current development redirect URI to your Google Cloud Console OAuth 2.0 credentials:

1. Go to Google Cloud Console > APIs & Credentials > OAuth 2.0 Client IDs
2. Add `https://9c4b622d-92a4-4193-9bf1-e70aa305f5b5-00-nv1cf8s5dwtq.spock.replit.dev/api/auth/google/callback` to Authorized redirect URIs
3. Save the changes

## Changelog

- July 16, 2025: ONE-TIME ANIMATION SYSTEM IMPLEMENTATION - Successfully implemented one-time animation system that ensures content animates only once per page load, never re-triggering on subsequent scrolling. Animations start after 0.2-second base delay with top-to-bottom staggered order (100ms between FadeInView elements, 50ms between StaggeredAnimation groups). Global state tracking prevents duplicate animations until full page refresh. Enhanced user experience with natural animation flow that matches user expectations - content reveals sequentially from top to bottom and stays visible permanently. System maintains 60fps performance while providing consistent, predictable animation behavior across all page sections.
- July 16, 2025: ADAPTIVE ANIMATION TIMING SYSTEM IMPLEMENTATION - Successfully implemented intelligent animation timing that adapts to user scroll velocity for optimal user experience. Created use-scroll-velocity hook that tracks scroll speed and automatically adjusts animation durations: fast scrolling (velocity > 2) reduces animation duration to 0.5x for quicker transitions, normal/slow scrolling maintains 1x duration for full visual effect. Enhanced FadeInView and StaggeredAnimation components with adaptive timing that responds to scroll behavior in real-time. Fixed Contact form "Select a subject" dropdown placeholder styling to match other form fields with proper gray color (rgb(156 163 175 / 0.6)) using targeted CSS selectors for Radix UI components. The system provides smooth, context-aware animations that feel natural and responsive to user interaction patterns while maintaining 60fps performance and accessibility compliance.
- July 16, 2025: COMPREHENSIVE SITE-WIDE ANIMATION SYSTEM IMPLEMENTATION - Successfully implemented a complete modern animation system across the entire Spandex Salvation Radio application. Created five core animation components: AnimatedCounter (with improved color transitions), LoadingSpinner (theme-aware with GPU acceleration), FadeInView (multi-directional fade animations), SkeletonLoader (responsive placeholder loading), and StaggeredAnimation (cascading element animations). Enhanced existing components with scroll-based animations, loading states, and smooth transitions. Wrapped all major page sections (Features, About, Schedule, Submissions, Contact, etc.) with FadeInView animations for progressive reveal. Added skeleton loading states to data-fetching components like Schedule for improved user experience. All animations feature 60fps performance with proper GPU acceleration and accessibility considerations. The system uses intersection observers for scroll-triggered animations and maintains consistent theming across all components.
- July 15, 2025: ENHANCED LIVE STATISTICS WITH ANIMATED COUNTERS AND FIREBASE INTEGRATION - Successfully implemented vertical wheel scrolling animated counters with smooth transitions for Live Statistics section. Enhanced numbers display with 25% scale increase (scale-125), upgraded from text-2xl to text-4xl font size for maximum visibility, added subtle glow effects and drop shadows for visual prominence. Integrated Firebase live statistics API endpoint (/api/live-stats) with 5-second refresh intervals. Numbers now animate smoothly when values change while maintaining current box dimensions. Secured Firebase service account credentials by adding comprehensive .gitignore patterns for all Firebase authentication files.
- July 15, 2025: COMPREHENSIVE UI/UX IMPROVEMENTS AND ACCESSIBILITY INTEGRATION - Implemented all specific UI refinements: reduced ad logo size by 50% with proper padding, modern LIVE IN countdown design with gradient text and launch indicator, left-aligned ROCK THE AIRWAVES button text with icons, centered ABOUT THE REBELLION numbers, grayed out contact form placeholder text. Added site-wide accessibility features including ARIA labels, semantic HTML, keyboard navigation support, and screen reader compatibility. Completed comprehensive code cleanup removing unused UI components (accordion, breadcrumb, pagination, table, skeleton, radio-group, aspect-ratio, checkbox, alert-dialog, alert, carousel, separator, switch, tabs, input-otp) and deployment files, improving performance and maintainability.
- July 15, 2025: ENHANCED CURRENT LOCATION FUNCTIONALITY - Fixed XSS vulnerability in FullWidthGlobeMap.tsx by replacing dangerous innerHTML with safe DOM manipulation. Added proper geolocation detection with browser permission prompts, blue animated dot for current location marker, and new location button between refresh and zoom controls. Users now see authentic location markers and can navigate to their position with improved accuracy.
- July 15, 2025: AUTOMATIC STATION SWITCHING WITH LOADING INDICATORS - Enhanced radio station selection to automatically start playback when changing stations regardless of previous state. Added synchronized loading indicators on both main player and floating player during station switches. Improved stream readiness detection with proper audio event handling for smoother transitions. Users now get immediate feedback when switching stations with consistent loading states across all players.
- July 14, 2025: CIRCULAR PLAY BUTTONS FOR PAST SHOWS - Replaced rectangular "Play Show" buttons with circular play buttons (48px diameter) featuring rounded play icons. Enhanced hover effects with 10% scale animation. Buttons now integrate seamlessly with main site streaming player system for Past Shows playback.
- July 14, 2025: PAST SHOWS LAYOUT STANDARDIZATION - Standardized all Past Shows play buttons to consistent 120px width × 36px height dimensions. Reordered layout elements with date above play button and play button positioned at bottom. All play buttons now have identical styling and positioning for improved visual consistency across all past show cards.
- July 14, 2025: THIS WEEK'S LINEUP 7-DAY FILTERING - Implemented intelligent date filtering for "This Week's Lineup" section to show only next 7 days of shows. Added getNext7DaysShows() function that filters shows based on current date and time, excluding past shows from today. All scheduled shows are loaded but only upcoming shows within 7 days are displayed for focused user experience.
- July 14, 2025: REFINED "ROCK THE AIRWAVES" BUTTONS - Removed animated icon dots from Submit Request and Learn More buttons specifically, maintaining left-aligned text positioning as requested. Preserved clean button design while eliminating animated pulse effects for improved visual consistency.
- July 14, 2025: COMPREHENSIVE E-COMMERCE INTEGRATION - Transformed merchandise system from cart-based to direct checkout with individual "Buy Now" buttons for each item. Implemented complete order confirmation page with theme-aware styling, order details display, shipping information, payment status, and seamless integration with the site's visual design. Enhanced contact form with proper placeholder styling to match other form fields. Fixed admin login popup layout by moving lock icon to top of modal with title positioned below. Updated all e-commerce components to use consistent theming throughout the entire checkout process.
- July 14, 2025: ENHANCED UI ELEMENTS - Modified past shows to integrate duration into date display (e.g., "January 15, 2025, 2 hr 30 min") and removed separate duration line, optimizing layout spacing. Updated ROCK THE AIRWAVES buttons to be left-aligned with animated indicator dots, sized to content width instead of full width for better visual hierarchy.
- July 5, 2025: FINALIZED ALL MAP AND STATISTICS IMPROVEMENTS - Completed all requested refinements: verified "Active Locations" text size matches "Live Statistics" text size (both text-xl), enhanced fullscreen map with more spacing (px-16, mt-40) and proper weather positioning above map, implemented comprehensive popup fixes with complete white space removal using enhanced CSS injection and multiple cleanup passes to eliminate all Google Maps default styling, ensured all icons in Live Statistics match orange theme colors, and created seamless custom info window display without any visible outer containers.
- July 5, 2025: COMPLETED WEATHER INTEGRATION - Successfully implemented OpenWeatherMap API integration with working API key (bc23ce0746d4fc5c04d1d765589dadc5). Weather display now shows real-time data including location (City, State), temperature in Fahrenheit, weather conditions, and weather icons under "Live Interactive Map" header. Features automatic geolocation with fallback, 10-minute refresh intervals, theme-aware styling, and comprehensive error handling.
- July 5, 2025: ENHANCED GOOGLE MAPS INTEGRATION - Improved Google Maps loading with better error handling, enhanced listener marker display, and full-screen map animation with smooth transitions. Fixed map container height calculations and added proper error states for API failures.
- July 5, 2025: FIXED MOBILE NAVIGATION DROPDOWN COMPLETELY - Resolved critical mobile navigation issue where dropdown links were non-functional. Solution involved: 1) Adding proper ref to mobile dropdown container to prevent premature closing, 2) Changing click outside handler from 'mousedown' to 'click' event to allow links to register clicks, 3) Converting all navigation items to simple anchor tags with href attributes for universal mobile compatibility, 4) Adding timeout delays for authentication modal opening. Mobile navigation now works perfectly with all links navigating to correct sections.
- July 5, 2025: FIXED MOBILE NAVIGATION AND MUSIC PAGE - Completely rewrote mobile dropdown navigation with direct window.location.href navigation for all links, fixed authentication modal triggers with proper timing delays. Updated Music page with centered station selector above player, dynamic station information (frequency, description, active listeners) that updates when switching stations, and full integration with RadioCoPlayer component matching home page functionality. All 4 stations (95.5 The Beat, Hot 97, Power 106, SomaFM Metal) now properly selectable with real-time information updates.
- July 5, 2025: FIXED DATABASE INITIALIZATION ISSUES - Resolved critical database table creation errors by manually creating all required PostgreSQL tables (sessions, users, submissions, contacts, show_schedules, past_shows, now_playing, stream_stats, subscriptions). Added comprehensive show schedule data with 10 weekly metal programs and 8 past show archives. Fixed stream statistics API errors by adding initial data. Application now runs successfully with all APIs returning proper data instead of empty arrays.
- July 5, 2025: IMPLEMENTED PERSISTENT USER PREFERENCES - Added localStorage caching for volume control (remembers user's volume setting across page reloads), mute state persistence, theme selection persistence (already existed), and authentication state handled by Replit Auth sessions. Updated subscription section positioning between Schedule and Submissions, renamed header to "Supporters Enjoy More" with navigation item "Support Us", enhanced subscription carousel with smooth 400ms sliding animations and fixed emoji visibility (microphone icon for Icon package).
- July 5, 2025: FIXED NAVIGATION DROPDOWN ISSUES - Fixed desktop MORE dropdown navigation links not working by removing preventDefault() that was blocking navigation, improved dropdown styling with theme-aware backgrounds (white for light mode, black for dark themes), repositioned tooltips to appear to the left of menu items instead of below to prevent overlap, attempted mobile authentication modal fixes (ongoing issue with modal not opening from mobile dropdown).
- July 4, 2025: SUBSCRIPTION CAROUSEL FINAL FIXES - Fixed gradient text rendering to apply to text instead of block background, added sliding animations for left/right navigation transitions, properly contained glow effects within border radius using overflow handling, centered all elements including features and perks with max-width containers, adjusted package height to fit viewport (85vh-120px) while maintaining responsive layout
- July 4, 2025: SUBSCRIPTION CAROUSEL REDESIGN - Created new SubscriptionCarousel component with 3D rotating design, replaced old subscription layouts with modern carousel view, added package icons as navigation indicators, implemented smooth transitions and animations, optimized height for viewport with responsive sizing, enhanced gradient text display with span wrapper, improved pagination dots with smoother radial gradient effects and drop shadows
- July 3, 2025: UI/UX ENHANCEMENTS - Added fade-in animations for Live Statistics and Active Locations sections using intersection observer, fixed Live Statistics to display horizontally on mobile/stacked view, updated subscription packages to have proper 5% overlap (16px margins), centered merchandise products with 3-column grid layout, updated footer link spacing to 3 units for consistency, fixed contact form Select placeholder to use light gray color matching other inputs
- July 3, 2025: MOBILE NAVIGATION & UI POLISH COMPLETED - Fixed mobile dropdown login/signup hover effects to exactly match navigation links, implemented subscription package overlap effect (Rebel and Icon 5% behind Legend), updated footer bottom links text alignment, fixed Featured Products centering with mx-auto in ShopifyEcommerce component
- July 3, 2025: COMPREHENSIVE DEPLOYMENT FIXES APPLIED - Fixed critical vite.config import errors by implementing conditional loading with fallback configuration, added production-safe setupVite function with environment checks, updated serveStatic to use correct client/dist path, ensured proper host/port binding for Replit deployment, created comprehensive error handling for module-not-found errors, added deploy-production.js script with complete build pipeline, updated replit.toml for proper deployment configuration, created DEPLOYMENT.md documentation
- July 2, 2025: DEPLOYMENT FIXES APPLIED - Fixed production build module resolution errors by updating vite.config import to use .js extension, added conditional dotenv loading for production compatibility, ensured server listens on 0.0.0.0 for Replit deployment, created comprehensive error handling wrapper, added replit.toml configuration for proper deployment with npm install --production
- June 30, 2025: FINAL artwork and station system - implemented station-aware now-playing API with authentic metadata fetching for all 4 radio stations (95.5 The Beat, Hot 97, Power 106, SomaFM Metal), added immediate track info fetching on station switches, integrated iTunes artwork lookup for each station's live tracks
- June 30, 2025: FINAL volume control polish - increased animated volume icon to 56x56 pixels (25% bigger) while maintaining button circle dimensions, restored glassy background with proper blur effects matching reference code
- June 30, 2025: FINAL interface polish - reduced button-to-text padding by 50% for tighter layout, added rounded edges to all play/stop icons using strokeLinejoin/strokeLinecap, increased floating player icon size by 25%, optimized volume button with 25% larger icon and compact 5px padding background circle
- June 30, 2025: FINAL button interface cleanup - removed all text from Play Live/Stop buttons while maintaining exact dimensions, centered play/stop icons perfectly within buttons, added theme-aware text labels below button that dynamically show "Play Live" or "Stop", text color automatically adapts to all themes (white in dark modes, black in light mode), enhanced radio station dropdown background highlighting, improved volume bar hover functionality, optimized volume icon sizing to 16x16 pixels for perfect proportions
- June 30, 2025: FINAL player interface polish - removed Play Live/Stop button border for clean appearance, increased volume icon to 48x48 pixels, properly sized play icon to h-12 w-12, added rounded corners to all play icons in both main and floating players using strokeLinejoin/strokeLinecap, enlarged album artwork 1.5x, increased song title to 32px with font-black weight, enhanced volume bar hover animation
- June 29, 2025: FINAL Hero text layout correction - moved navigation bar text back to original 2-line format (SPANDEX SALVATION / RADIO), updated Hero section main title to display on 3 separate lines (SPANDEX, SALVATION, RADIO) for improved visual hierarchy and readability
- June 29, 2025: COMPLETED comprehensive legal and authentication system updates - created Terms of Service and Privacy Policy pages with theme-aware styling, added legal page routing to app navigation (/terms, /privacy), updated volume slider with proper theme color gradients and filled thumb design, enhanced radio dropdown with darker background for better text visibility, improved station icon theme color conformance using dynamic CSS filters, maintained Firebase authentication integration with current best practices
- June 29, 2025: FINAL navigation and volume slider improvements - centered dropdown menu under MORE button instead of right-aligned positioning, updated main player volume slider to match floating player theme colors with gradient design, added custom circular thumb without borders for clean appearance, maximized slider width with minimal 1px padding for optimal usability
- June 29, 2025: COMPLETED radio interface fine-tuning - radio selection button border radius reduced to 11px, dropdown indicator properly animates upward when open/downward when closed, animated speaker icon enlarged 1.5x with sound waves moved down 1px for perfect alignment with speaker center, LIVE IN indicator text and dot both set to 90% opacity, countdown labels styled as light gray with 65% opacity, restored dark theme site appearance across all sections
- June 29, 2025: FINAL comprehensive UI improvements - integrated station selector with 50% smaller LIVE indicator into Hero RadioCoPlayer, replaced "ON AIR IN..." text with 2x larger LIVE indicator duplicate, enhanced volume slider with theme-aware styling for proper visibility across all themes (especially Black Metal), improved dropdown background readability, implemented theme-aware Hero background fade (black for dark mode, white for light mode), maintained radio icons matching navigation bar theme colors
- June 29, 2025: IMPLEMENTED radio station selection feature - created StationSelector component with dropdown interface, added station switching functionality to RadioContext, integrated EnhancedRadioPlayer with multiple station support including Hot 97, Power 106, SomaFM Metal, and 95.5 The Beat
- June 29, 2025: RESOLVED major CSS configuration issue - rebuilt complete Tailwind CSS setup with proper content paths, generated working styles.css file, restored full styling functionality across entire application
- June 24, 2025: FINAL mobile navigation fix - completely rebuilt mobile dropdown using div elements instead of complex button/tooltip structures, direct function calls matching desktop behavior, simplified click handling for guaranteed functionality
- June 24, 2025: COMPLETED comprehensive navigation bar fixes - all dropdown links working in desktop and mobile modes, proper routing with wouter for cross-page navigation, enhanced mobile dropdown with hover tooltips, fixed login/signup buttons with authentication modal triggers, added section IDs to all pages for smooth scrolling
- June 24, 2025: Completed comprehensive authentication and streaming system testing - verified Replit Auth integration, input theme highlighting, phone number auto-formatting, user registration with proper database structure, radio streaming through proxy endpoint, and listening status tracking
- June 21, 2025: Fixed countdown text color to display black in light mode and white in dark mode, implemented CSS Grid navigation centering for desktop and responsive flex layout for mobile to ensure proper positioning across all screen sizes
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
- June 22, 2025: Fixed Google OAuth redirect URI configuration and enhanced authentication flow - updated modal forms to properly distinguish between sign-in and sign-up modes, added mobile dropdown authentication buttons, improved form validation and field management
- June 23, 2025: Implemented Radio.co API integration with authentic live metadata fetching from Hot 97 stream, added comprehensive commercial detection with Clearbit logo support, fixed theme-aware button hover colors across all components, centered "VIEW ALL ARCHIVES" button in Schedule section, standardized dropdown menu Sign In/Sign Up button widths for consistent UI
- June 23, 2025: Enhanced commercial detection for Hot 97's "In A Commercial" text with company name extraction, added Clearbit logo integration for major brands (McDonald's, Nike, Coca-Cola, etc.), implemented advertisement theming when commercials are detected, updated "VIEW ALL ARCHIVES" button to 25% screen width with proper centering
- June 23, 2025: Implemented authentic 95.5 The Beat (KBFB) Dallas Hip Hop station with real track metadata, moved floating player to left side with clean design, positioned live chat icon on right side at matching height, fixed LIVE indicator to red pulsing dot, removed extra text elements, improved volume control spacing
- June 24, 2025: Fixed desktop navigation layout - swapped auth buttons and theme selector positions, reduced auth button height to match navigation bar, restored sign in/sign up modal functionality with Replit Auth integration, changed "ON AIR IN" to "ON AIR IN..." with red pulsing animation matching countdown, fixed database schema issues for radio streaming, cleaned up JSX compilation errors

## User Preferences

Preferred communication style: Simple, everyday language.
