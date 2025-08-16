// Utility functions for resource preloading and optimization
export const preloadImages = (urls: string[]) => {
  if (typeof window === 'undefined') return;

  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
};

export const preloadCriticalAssets = () => {
  if (typeof window === 'undefined') return;

  // Preload critical CSS variables and fonts
  const criticalAssets: string[] = [
    // Add any critical assets here
  ];

  criticalAssets.forEach(asset => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = asset;
    document.head.appendChild(link);
  });
};

// Resource hints for better loading performance
export const addResourceHints = () => {
  if (typeof window === 'undefined') return;

  // DNS prefetch for external services
  const prefetchDomains = [
    'screenshotone.com',
    'url2png.com',
    'fonts.googleapis.com',
    'fonts.gstatic.com',
  ];

  prefetchDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = `//${domain}`;
    document.head.appendChild(link);
  });
};

// Memory-aware image loading
export const shouldPreloadImages = () => {
  if (typeof navigator === 'undefined') return true;
  
  // Don't preload on low-memory devices
  const connection = (navigator as any).connection;
  if (connection && connection.saveData) return false;
  
  // Check memory if available
  const memory = (performance as any).memory;
  if (memory && memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.8) {
    return false;
  }
  
  return true;
};