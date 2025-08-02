# Spandex Salvation Radio - Old School Metal Streaming Platform

## Overview

Spandex Salvation Radio is a full-stack web application designed for 24/7 streaming of old-school metal music. It functions as a modern radio station platform, offering interactive features such as live streaming, detailed show schedules, song submission capabilities, contact forms, merchandise store integration, and comprehensive admin management tools. The project aims to provide a robust and engaging experience for metal music enthusiasts.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend

- **Framework**: React 18 with TypeScript
- **Routing**: Wouter
- **UI Components**: Shadcn/ui built on Radix UI primitives
- **Styling**: Tailwind CSS with a custom metal-themed color palette
- **State Management**: React Context (for audio and admin)
- **Data Fetching**: TanStack Query (React Query)
- **Build Tool**: Vite

### Backend

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API
- **Database**: PostgreSQL with Drizzle ORM
- **Session Management**: Express sessions with PostgreSQL store

### Database Schema

Key entities include:
- Users (admin authentication, user management)
- Submissions (song requests with approval workflow)
- Contacts (contact form submissions)
- Show Schedules (weekly programming)
- Past Shows (archive of broadcasts)
- Now Playing (current track info)
- Stream Stats (real-time listener statistics)
- Subscriptions (email newsletter, premium tiers)

### UI/UX Decisions

- **Design Aesthetic**: Responsive, mobile-first approach with desktop optimization. Features a dark theme by default, using a metal-themed color scheme with orange/gold accents. Borderless modern design, enhanced typography (font-black for headings, font-semibold for content).
- **Audio System**: Centralized audio context, persistent sticky player, real-time track info, live listener stats.
- **Content Management**: Tools for show scheduling, song submission moderation, and contact inquiry handling.
- **Interactive Elements**: Dynamic adaptive background themes for the music player, real-time interactive listener map, advanced audio player with full playlist functionality, comprehensive accessibility features (WCAG 2.1 AA compliant, screen reader support, keyboard navigation).
- **Animations**: Site-wide animation system with adaptive timing based on scroll velocity, one-time animations for content reveal, and smooth transitions (300-500ms duration).

### Technical Implementations

- **Authentication**: Comprehensive Firebase Firestore authentication system with user profiles, random avatar assignment, password encryption, and Google OAuth integration.
- **Streaming**: Supports multiple radio stations (e.g., Hot 97, SomaFM Metal), dynamic station switching, and real-time metadata fetching.
- **Live Statistics**: Real Firebase integration with `/api/live-stats` endpoint providing dynamic listener counts, country statistics, and total listeners with automatic 30-second updates.
- **Countdown Timer**: Configured to countdown to August 10th, 2025 at 12:00 PM for the first broadcast launch.
- **E-commerce**: Direct checkout system for merchandise with "Buy Now" buttons and order confirmation.
- **Security**: Enhanced security headers (CSP, HSTS), XSS vulnerability fixes, and regular dependency updates.
- **Deployment**: Optimized for Replit autoscale deployment with Vite for frontend builds and ESBuild for backend bundling.

## External Dependencies

- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Authentication**: Firebase (for Firestore and Google OAuth)
- **Radio Metadata**: Triton Digital API, StreamTheWorld (for real-time track information)
- **Merchandise**: Shopify (placeholder for integration)
- **Location/Weather**: OpenWeatherMap API, Google Maps API
- **Analytics/AI**: OpenAI Whisper (for audio transcription - noted as integrated for ad detection), GPT-4o (for content analysis - noted as integrated for ad detection)
- **Commercial Detection**: Clearbit (for brand logos in ad detection)
- **Payment Processing**: Stripe (placeholder for integration)
- **Social Media**: Direct links for sharing.
- **Security**: Google reCAPTCHA Enterprise (for SMS fraud detection)