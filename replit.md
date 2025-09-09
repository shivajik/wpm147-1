# WordPress Maintenance Dashboard

## Overview
AIO Webcare is a full-stack web application designed as a comprehensive dashboard for managing WordPress maintenance workflows. It aims to efficiently track clients, websites, and maintenance tasks, with a strong focus on real-time data, security, performance optimization, and task handling. The platform serves agencies and freelancers by offering advanced SEO analysis and reporting, security scanning, and performance scanning capabilities. Its business vision is to provide a powerful, all-in-one solution for managing multiple WordPress sites, enhancing efficiency and offering a competitive edge in the market.

## User Preferences
Preferred communication style: Simple, everyday language.
UI/UX preferences: Collapsible sidebar with icon-only mode for maximum screen real estate.
Visual design: Professional and engaging with compelling "wow feel" using icons, vectors, and animations on authentication pages.
Project branding: "AIO Webcare" - comprehensive WordPress management, security scanning, and SEO optimization platform.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite.
- **Styling**: Tailwind CSS with shadcn/ui for components.
- **Routing**: Wouter.
- **State Management**: TanStack Query (React Query) for server state.
- **Form Handling**: React Hook Form with Zod validation.
- **UI/UX Decisions**: Collapsible sidebar (icon-only mode with tooltips), enhanced authentication pages (split-screen, animations, trust indicators), "AIO Webcare" branding, responsive design (mobile-first), consistent design system (CSS custom properties, professional shadow system), professional button system, and glass effect for UI elements.

### Backend Architecture
- **Runtime**: Node.js with Express.js (TypeScript, ES modules).
- **Database ORM**: Drizzle ORM with PostgreSQL dialect.
- **Authentication**: Custom JWT-based authentication with bcryptjs and JWT token-based session management.
- **Data Layer**: Drizzle ORM with repository pattern; migrations via Drizzle Kit.

### Database Design
- **Provider**: Supabase PostgreSQL.
- **Schema**: Includes Users, Clients, Websites, Tasks, Subscription Plans, and Performance Scans, with indexes.

### Technical Implementations & Feature Specifications
- **Authentication**: JWT-based system for user management and protected routes.
- **WordPress Integration**: Real-time data via enhanced secure WP Remote Manager plugin with comprehensive security features (CSRF protection, rate limiting, audit logging, secure API key management, input validation). Features automatic reconnection and data refresh, multi-tier fallback for updates, and improved navigation to API key settings. Includes real-time optimization features with actual WordPress data fetching (Post Revisions, Database Performance, spam/trash cleanup).
- **Client Management**: CRUD for clients, websites, and tasks.
- **Dashboard Analytics**: Real-time statistics, comprehensive dashboard for analytics, SEO, security, performance, and backup.
- **Maintenance Workflow**: Plugin/theme management, update tracking, Quick Actions sidebar, improved update timeout management, intelligent error recovery, automatic verification of completed updates, and accurate update validation.
- **SEO Analysis & Reporting**: Comprehensive real-time analysis with phpRank-style reporting, detailed technical SEO analysis, content quality assessment, performance metrics, accessibility scoring, and professional client reporting with authentic website data.
- **Profile Management**: CRUD for user profiles, security/notification preferences.
- **Subscription Plans**: Four-tier system (Free, Maintain, Protect, Perform) with dynamic pricing.
- **Optimization Section**: Database optimization, content cleanup based on real WordPress data.
- **Loading States**: Comprehensive skeleton loaders and indicators.
- **Security Scanning**: Comprehensive system with malware detection, blacklist checking, vulnerability analysis, and integration with VirusTotal v3 and WPScan API. Detects pending WordPress updates as vulnerabilities.
- **Website Thumbnails**: Automatic thumbnail capture.
- **Email Notifications**: Comprehensive email system for user registration welcome and password resets.
- **Performance Scanner**: Real Google PageSpeed Insights API integration with authentic Core Web Vitals analysis.
- **Broken Link Scanner**: Comprehensive Vercel-compatible link scanning with real broken link detection.
- **Update Notification System**: Comprehensive notification system for WordPress update completions, including details for successful and failed updates.

### Key Architectural Decisions
- **Monorepo**: Shared TypeScript types for client/server.
- **Type Safety**: End-to-end with Drizzle ORM and Zod.
- **Authentication**: Custom JWT for flexibility.
- **Database**: Supabase PostgreSQL with Drizzle ORM.
- **Component Library**: shadcn/ui for accessible, customizable components.
- **State Management**: TanStack Query for server state.
- **Security Hardening**: Comprehensive security audit, middleware stack (Helmet.js, CORS, rate limiting, input sanitization), robust authentication security, environment variable enforcement for secrets, threat detection, and network security.
- **Vercel Serverless Functions**: Extensive use for API endpoints (authentication, profile, client reports, performance scanning, broken link scanning, complete WordPress Remote Manager integration, optimization endpoints) to ensure scalability and efficiency.
- **Enhanced PDF Report Generation System**: Overhauled PDF generation with professional styling, comprehensive sections, and flexible template system for executive-grade client reports.

## External Dependencies

### Core Dependencies
- **postgres**: PostgreSQL database connection.
- **drizzle-orm**: Type-safe ORM.
- **@tanstack/react-query**: Server state management.
- **@radix-ui/***: Accessible UI component primitives.
- **tailwindcss**: Utility-first CSS framework.

### Authentication
- **passport**: Authentication middleware.
- **openid-client**: OpenID Connect client.
- **connect-pg-simple**: PostgreSQL session store.

### Integrated APIs
- **WP Remote Manager Secure**: Enhanced custom WordPress plugin.
- **VirusTotal v3 API**: Malware detection.
- **WPScan API**: WordPress vulnerability scanning.
- **SendGrid API**: Email delivery service.
- **ScreenshotOne.com API**: Automatic website thumbnail capture.
- **URL2PNG**: Fallback for website thumbnail capture.
- **Google PageSpeed Insights API**: Real performance scanning.