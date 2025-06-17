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

## Changelog
- June 17, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.