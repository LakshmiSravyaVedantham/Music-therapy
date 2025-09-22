# HealthTune - AI-Powered Mood Music Therapy

## Overview

HealthTune is an innovative health technology application that transforms personal health data into personalized music therapy recommendations. The platform uses AI-powered mood analysis to correlate health metrics from various devices (Apple Watch, Whoop, iPhone, etc.) with emotional states, then delivers targeted music recommendations through Spotify integration. The application features a medical-grade design aesthetic with real-time health monitoring, mood visualization, and automatic music playback capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety and component-based architecture
- **Styling**: Tailwind CSS with custom design system featuring medical-grade color palette and spacing
- **UI Components**: shadcn/ui component library with Radix UI primitives for accessible, composable components
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture  
- **Runtime**: Node.js with Express.js framework for RESTful API endpoints
- **Database Layer**: Drizzle ORM with PostgreSQL for type-safe database operations
- **Session Management**: PostgreSQL-backed sessions with connect-pg-simple
- **Data Simulation**: Built-in health data simulator for demo purposes with realistic metric generation

### Core Features
- **Health Data Integration**: Multi-device support (Apple Watch, iPhone, Whoop) with real-time metric collection
- **AI Mood Analysis**: OpenAI integration for analyzing health patterns and determining emotional states
- **Music Therapy Engine**: Spotify Web API integration for personalized music recommendations based on mood analysis
- **Auto-Play System**: Intelligent music playback that responds to mood changes automatically
- **Real-time Monitoring**: Live health metric updates with 30-second refresh intervals

### Data Schema Design
- **Users**: Profile management with music preferences and health goals
- **Health Metrics**: Time-series data storage for various biometric measurements
- **Mood Analysis**: AI-generated mood states with confidence scores and contributing factors
- **Music Recommendations**: Spotify track recommendations linked to specific mood analyses
- **Connected Devices**: Device management with sync status and battery monitoring

### Authentication & User Management
- Email-based user identification with demo user support
- Session-based authentication for secure API access
- User preference storage for personalized experience

## External Dependencies

### Music Streaming Services
- **Spotify Web API**: Primary music streaming integration for track search, playlist management, and audio playback
- **Spotify SDK**: Client-side integration for seamless music control

### AI & Machine Learning
- **OpenAI API**: GPT-powered mood analysis from health data patterns
- **Custom AI Prompts**: Specialized prompts for health-to-mood correlation analysis

### Database & Storage
- **PostgreSQL**: Primary database via Neon serverless platform
- **Drizzle ORM**: Type-safe database schema and query management

### Health Data Sources
- **Apple HealthKit**: Integration planned for iOS health data
- **Whoop API**: Fitness tracker data integration
- **Device Simulators**: Built-in data generation for development and demo

### Development & Hosting
- **Replit**: Development environment with built-in deployment
- **Vite**: Frontend bundling and development server
- **TypeScript**: Type safety across frontend and backend

### UI & Design Libraries
- **Radix UI**: Accessible component primitives
- **Lucide Icons**: Consistent iconography
- **Tailwind CSS**: Utility-first styling framework
- **Recharts**: Health data visualization and charting

### Additional Services
- **Google Fonts**: Typography (Inter, JetBrains Mono)
- **Date-fns**: Date manipulation and formatting
- **Zod**: Runtime type validation and schema definition