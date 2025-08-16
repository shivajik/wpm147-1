// Query optimization utilities for performance
export const QUERY_STALE_TIMES = {
  // Fast changing data - 30 seconds
  REAL_TIME: 30 * 1000,
  
  // Moderate changing data - 5 minutes
  MODERATE: 5 * 60 * 1000,
  
  // Slow changing data - 30 minutes
  SLOW: 30 * 60 * 1000,
  
  // Static data - 24 hours
  STATIC: 24 * 60 * 60 * 1000,
} as const;

export const QUERY_CACHE_TIMES = {
  // Keep in memory for 5 minutes after last use
  SHORT: 5 * 60 * 1000,
  
  // Keep in memory for 30 minutes after last use
  MEDIUM: 30 * 60 * 1000,
  
  // Keep in memory for 2 hours after last use
  LONG: 2 * 60 * 60 * 1000,
} as const;

// Optimized query configurations
export const OPTIMIZED_QUERIES = {
  // User profile - changes rarely
  USER_PROFILE: {
    staleTime: QUERY_STALE_TIMES.SLOW,
    gcTime: QUERY_CACHE_TIMES.LONG,
  },
  
  // Website list - moderate changes
  WEBSITES: {
    staleTime: QUERY_STALE_TIMES.MODERATE,
    gcTime: QUERY_CACHE_TIMES.MEDIUM,
  },
  
  // Client list - moderate changes
  CLIENTS: {
    staleTime: QUERY_STALE_TIMES.MODERATE,
    gcTime: QUERY_CACHE_TIMES.MEDIUM,
  },
  
  // WordPress data - real-time but cacheable for short periods
  WORDPRESS_DATA: {
    staleTime: QUERY_STALE_TIMES.REAL_TIME,
    gcTime: QUERY_CACHE_TIMES.SHORT,
  },
  
  // Security scans - moderate changes
  SECURITY_SCANS: {
    staleTime: QUERY_STALE_TIMES.MODERATE,
    gcTime: QUERY_CACHE_TIMES.MEDIUM,
  },
  
  // Performance scans - moderate changes
  PERFORMANCE_SCANS: {
    staleTime: QUERY_STALE_TIMES.MODERATE,
    gcTime: QUERY_CACHE_TIMES.MEDIUM,
  },
  
  // Reports - slow changes
  REPORTS: {
    staleTime: QUERY_STALE_TIMES.SLOW,
    gcTime: QUERY_CACHE_TIMES.LONG,
  },
  
  // Notifications count - real-time
  NOTIFICATIONS: {
    staleTime: QUERY_STALE_TIMES.REAL_TIME,
    gcTime: QUERY_CACHE_TIMES.SHORT,
  },
} as const;

// Query key helpers for consistent caching
export const createQueryKey = {
  user: () => ['/api/auth/user'],
  profile: () => ['/api/profile'],
  websites: () => ['/api/websites'],
  website: (id: string | number) => ['/api/websites', id],
  clients: () => ['/api/clients'],
  client: (id: string | number) => ['/api/clients', id],
  tasks: () => ['/api/tasks'],
  reports: () => ['/api/client-reports'],
  report: (id: string | number) => ['/api/client-reports', id],
  notifications: () => ['/api/notifications'],
  notificationCount: () => ['/api/notifications/unread-count'],
  
  // WordPress specific
  wordpressData: (websiteId: string | number) => ['/api/websites', websiteId, 'wordpress-data'],
  wrmUpdates: (websiteId: string | number) => ['/api/websites', websiteId, 'wrm', 'updates'],
  wrmPlugins: (websiteId: string | number) => ['/api/websites', websiteId, 'wrm-plugins'],
  wrmThemes: (websiteId: string | number) => ['/api/websites', websiteId, 'wrm-themes'],
  wrmUsers: (websiteId: string | number) => ['/api/websites', websiteId, 'wrm-users'],
  
  // Scans
  securityScans: (websiteId: string | number) => ['/api/websites', websiteId, 'security-scans'],
  performanceScans: (websiteId: string | number) => ['/api/websites', websiteId, 'performance-scans'],
  linkScans: (websiteId: string | number) => ['/api/websites', websiteId, 'link-monitor'],
} as const;