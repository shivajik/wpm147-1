import axios from 'axios';
import * as cheerio from 'cheerio';
import { URL } from 'url';

// Temporary inline types until we resolve the import issue
export interface DetailedFinding {
  category: string;
  title: string;
  description: string;
  impact: 'critical' | 'high' | 'medium' | 'low';
  technicalDetails: string;
  recommendation: string;
  howToFix?: string;
  resources?: string[];
}

export interface SeoAnalysisResult {
  url: string;
  domain?: string;
  title: string;
  metaDescription: string;
  h1Tags: string[];
  h2Tags: string[];
  h3Tags: string[];
  pageContent: {
    wordCount: number;
    readabilityScore: number;
    keywordDensity: { [keyword: string]: number };
    sentences?: number;
    paragraphs?: number;
    avgWordsPerSentence?: number;
  };
  technicalSeo: {
    hasSSL: boolean;
    hasRobotsTxt: boolean;
    hasSitemap: boolean;
    isResponsive: boolean;
    hasValidStructuredData: boolean;
    statusCode: number;
    responseTime: number;
    canonicalTag?: string;
    metaViewport?: string;
    charset?: string;
    doctype?: string;
    lang?: string;
    hreflang?: string[];
    httpHeaders?: { [key: string]: string };
  };
  images: {
    total: number;
    withAlt: number;
    missingAlt: number;
    oversized: number;
    formats: { [format: string]: number };
    lazyLoaded: number;
  };
  links: {
    internal: number;
    external: number;
    broken: number;
    nofollow: number;
    dofollow: number;
    redirectChains: number;
  };
  performance: {
    loadTime: number;
    pageSize: number;
    pageSizeBytes?: number;
    requests: number;
    resourceBreakdown?: {
      scripts: number;
      stylesheets: number;
      images: number;
      fonts: number;
      preloads: number;
      prefetches: number;
    };
    optimizations?: {
      compression: boolean;
      minifiedCSS: boolean;
      minifiedJS: boolean;
      cacheHeaders: boolean;
      hasLazyLoading: boolean;
      hasWebP: boolean;
      hasAvif: boolean;
      hasCriticalCSS: boolean;
      hasAsyncJS: boolean;
    };
    performanceScore?: number;
    performanceIssues?: string[];
    recommendations?: string[];
    // Legacy compatibility
    compression: boolean;
    minifiedCSS: boolean;
    minifiedJS: boolean;
    cacheHeaders: boolean;
  };
  socialMeta: {
    hasOpenGraph: boolean;
    hasTwitterCards: boolean;
    hasFacebookMeta: boolean;
    openGraphData: { [key: string]: string };
    twitterCardData: { [key: string]: string };
  };
  accessibility: {
    score: number;
    issues: string[];
    contrastIssues: number;
    missingLabels: number;
    missingHeadings: boolean;
    skipLinks: boolean;
  };
  detailedFindings?: {
    criticalIssues: DetailedFinding[];
    warnings: DetailedFinding[];
    recommendations: DetailedFinding[];
    positiveFindings: DetailedFinding[];
  };
  javascriptAnalysis?: {
    totalScripts: number;
    htmlScriptTags?: number;
    externalScripts: number;
    inlineScripts: number;
    asyncScripts: number;
    deferScripts: number;
    blockingScripts: number;
    securityFeatures?: number;
    largestInlineScript?: number;
    optimizationIssues: string[];
    scripts: Array<{
      type: 'inline' | 'external';
      src?: string;
      size?: number;
      hasAsync: boolean;
      hasDefer: boolean;
      hasType?: string;
      hasNonce?: boolean;
      hasIntegrity?: boolean;
    }>;
  };
  cssAnalysis?: {
    totalStylesheets: number;
    externalStylesheets: number;
    inlineStyles: number;
    minifiedStylesheets: number;
    criticalCssCount?: number;
    inlineStyleElements?: number;
    totalInlineSize?: number;
    largestInlineStyle?: number;
    optimizationIssues: string[];
    stylesheets: Array<{
      type: 'external' | 'inline';
      href?: string;
      size?: number;
      media?: string;
      isMinified?: boolean;
      hasIntegrity?: boolean;
      isCritical?: boolean;
    }>;
  };
};




export class SeoAnalyzer {
  private userAgent = 'Mozilla/5.0 (compatible; SEO-Analyzer/1.0)';
  
  async analyzeSite(url: string): Promise<SeoAnalysisResult> {
    console.log(`[SEO-ANALYZER] Starting comprehensive analysis for: ${url}`);
    
    const startTime = Date.now();
    let html: string;
    let statusCode: number;
    let responseTime: number;
    
    try {
      // Fetch the page
      const response = await axios.get(url, {
        headers: { 'User-Agent': this.userAgent },
        timeout: 30000, // 30 seconds
        maxRedirects: 5,
        validateStatus: (status) => status < 500 // Accept all non-server errors
      });
      
      html = response.data;
      statusCode = response.status;
      responseTime = Date.now() - startTime;
    } catch (error) {
      console.error(`[SEO-ANALYZER] Error fetching ${url}:`, error);
      throw new Error(`Failed to fetch website: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    const $ = cheerio.load(html);
    const parsedUrl = new URL(url);
    
    // Analyze page structure and content with comprehensive details
    const pageContent = await this.analyzeContent($, html);
    const technicalSeo = await this.analyzeTechnicalSeo($, url, statusCode, responseTime);
    const images = this.analyzeImages($, url);
    const links = await this.analyzeLinks($, url);
    const performance = this.analyzePerformance(html, responseTime);
    const socialMeta = this.analyzeSocialMeta($);
    const accessibility = this.analyzeAccessibility($);
    
    // Enhanced detailed analysis sections
    const headingAnalysis = this.analyzeHeadingStructure($);
    const contentKeywords = this.analyzeContentKeywords($, html);
    const httpRequests = this.analyzeHttpRequests($, html, url);
    const javascriptAnalysis = this.analyzeJavaScript($, html);
    const cssAnalysis = this.analyzeCss($, html);
    const metaTagsAnalysis = this.analyzeMetaTags($);
    const structuralData = this.analyzeStructuralData($);
    const imageKeywords = this.analyzeImageKeywords($);
    const loadingAnalysis = this.analyzeLoadingOptimization($);
    const securityHeaders = await this.analyzeSecurityHeaders(url);
    
    const result: SeoAnalysisResult = {
      url,
      domain: parsedUrl.hostname,
      title: $('title').first().text().trim() || '',
      metaDescription: $('meta[name="description"]').attr('content') || '',
      h1Tags: this.extractHeadings($, 'h1'),
      h2Tags: this.extractHeadings($, 'h2'),
      h3Tags: this.extractHeadings($, 'h3'),
      
      pageContent,
      technicalSeo,
      images,
      links,
      performance,
      socialMeta,
      accessibility,
      
      // Enhanced detailed analysis sections
      headingAnalysis,
      contentKeywords,
      httpRequests,
      javascriptAnalysis,
      cssAnalysis,
      metaTagsAnalysis,
      structuralData,
      imageKeywords,
      loadingAnalysis,
      securityHeaders,
      
      detailedFindings: this.generateDetailedFindings($, {
        title: $('title').first().text().trim() || '',
        metaDescription: $('meta[name="description"]').attr('content') || '',
        h1Tags: this.extractHeadings($, 'h1'),
        pageContent,
        technicalSeo,
        images,
        links,
        performance,
        socialMeta,
        accessibility,
        headingAnalysis,
        contentKeywords,
        httpRequests,
        javascriptAnalysis,
        cssAnalysis,
        metaTagsAnalysis,
        structuralData,
        imageKeywords,
        loadingAnalysis,
        securityHeaders
      })
    };

    console.log(`[SEO-ANALYZER] Analysis completed in ${Date.now() - startTime}ms`);
    return result;
  }

  private extractHeadings($: cheerio.CheerioAPI, tag: string): string[] {
    const headings: string[] = [];
    $(tag).each((_, el) => {
      const text = $(el).text().trim();
      if (text) headings.push(text);
    });
    return headings;
  }

  private async analyzeContent($: cheerio.CheerioAPI, html: string) {
    // Remove script and style content
    $('script, style, nav, footer, aside').remove();
    const textContent = $('body').text().replace(/\s+/g, ' ').trim();
    
    const words = textContent.split(/\s+/).filter(word => word.length > 2);
    const wordCount = words.length;
    
    // Count sentences and paragraphs
    const sentences = textContent.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const paragraphs = $('p').length;
    
    const avgWordsPerSentence = sentences > 0 ? wordCount / sentences : 0;
    const avgSyllablesPerWord = this.estimateAverageSyllables(words);
    const readabilityScore = Math.max(0, Math.min(100, 
      206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)
    ));

    // Keyword density analysis
    const keywordDensity = this.calculateKeywordDensity(words);

    return {
      wordCount,
      readabilityScore: Math.round(readabilityScore),
      keywordDensity,
      sentences,
      paragraphs,
      avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10
    };
  }

  private estimateAverageSyllables(words: string[]): number {
    if (words.length === 0) return 0;
    
    const totalSyllables = words.reduce((total, word) => {
      return total + this.countSyllables(word.toLowerCase());
    }, 0);
    
    return totalSyllables / words.length;
  }

  private countSyllables(word: string): number {
    // Simple syllable counting algorithm
    word = word.toLowerCase();
    let syllables = 0;
    let previousWasVowel = false;
    
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      const isVowel = 'aeiouy'.includes(char);
      
      if (isVowel && !previousWasVowel) {
        syllables++;
      }
      previousWasVowel = isVowel;
    }
    
    // Adjust for silent e
    if (word.endsWith('e')) syllables--;
    
    return Math.max(1, syllables);
  }

  private calculateKeywordDensity(words: string[]): { [key: string]: number } {
    const wordFreq: { [key: string]: number } = {};
    const totalWords = words.length;
    
    words.forEach(word => {
      const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
      if (cleanWord.length > 3) {
        wordFreq[cleanWord] = (wordFreq[cleanWord] || 0) + 1;
      }
    });

    // Get top keywords and their density
    const sortedKeywords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const density: { [key: string]: number } = {};
    sortedKeywords.forEach(([word, freq]) => {
      density[word] = Math.round((freq / totalWords) * 1000) / 10; // Percentage with 1 decimal
    });

    return density;
  }

  private async analyzeTechnicalSeo($: cheerio.CheerioAPI, url: string, statusCode: number, responseTime: number) {
    const parsedUrl = new URL(url);
    const baseUrl = `${parsedUrl.protocol}//${parsedUrl.hostname}`;
    
    // Check robots.txt
    let hasRobotsTxt = false;
    try {
      const robotsResponse = await axios.head(`${baseUrl}/robots.txt`, { timeout: 5000 });
      hasRobotsTxt = robotsResponse.status === 200;
    } catch (error) {
      // Robots.txt not found or inaccessible
    }

    // Check sitemap
    let hasSitemap = false;
    const sitemapUrls = [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/sitemap_index.xml`,
      `${baseUrl}/wp-sitemap.xml`
    ];

    for (const sitemapUrl of sitemapUrls) {
      try {
        const sitemapResponse = await axios.head(sitemapUrl, { timeout: 5000 });
        if (sitemapResponse.status === 200) {
          hasSitemap = true;
          break;
        }
      } catch (error) {
        // Continue checking other sitemap locations
      }
    }

    // Check for structured data
    const hasValidStructuredData = $('script[type="application/ld+json"]').length > 0 ||
                                  $('[itemscope]').length > 0 ||
                                  $('meta[property^="og:"]').length > 0;

    // Extract detailed technical information
    const canonicalTag = $('link[rel="canonical"]').attr('href') || '';
    const metaViewport = $('meta[name="viewport"]').attr('content') || '';
    const charset = $('meta[charset]').attr('charset') || $('meta[http-equiv="Content-Type"]').attr('content') || '';
    const doctype = $('html').get(0)?.type === 'tag' ? '<!DOCTYPE html>' : '';
    const lang = $('html').attr('lang') || '';
    
    // Extract hreflang attributes
    const hreflang: string[] = [];
    $('link[rel="alternate"][hreflang]').each((_, el) => {
      const hreflangValue = $(el).attr('hreflang');
      if (hreflangValue) hreflang.push(hreflangValue);
    });

    return {
      hasRobotsTxt,
      hasSitemap,
      hasSSL: parsedUrl.protocol === 'https:',
      responseTime,
      statusCode,
      isResponsive: $('meta[name="viewport"]').length > 0,
      hasValidStructuredData,
      canonicalTag,
      metaViewport,
      charset,
      doctype,
      lang,
      hreflang,
      httpHeaders: {} // Would need to be populated from response headers
    };
  }

  private analyzeImages($: cheerio.CheerioAPI, url?: string) {
    const images = $('img');
    let withAlt = 0;
    let oversized = 0;
    let lazyLoaded = 0;
    const formats: { [key: string]: number } = {};

    images.each((_, img) => {
      const $img = $(img);
      if ($img.attr('alt')?.trim()) {
        withAlt++;
      }

      // Check for lazy loading
      if ($img.attr('loading') === 'lazy' || $img.attr('data-src')) {
        lazyLoaded++;
      }

      // Check image formats
      const src = $img.attr('src') || $img.attr('data-src') || '';
      if (src) {
        const extension = src.split('.').pop()?.toLowerCase();
        if (extension) {
          formats[extension] = (formats[extension] || 0) + 1;
        }

        // Check for potentially oversized images
        if (src.includes('2048') || src.includes('1920') || src.includes('4k')) {
          oversized++;
        }
      }
    });

    return {
      total: images.length,
      withAlt,
      missingAlt: images.length - withAlt,
      oversized,
      formats,
      lazyLoaded
    };
  }

  private async analyzeLinks($: cheerio.CheerioAPI, baseUrl: string) {
    const links = $('a[href]');
    let internal = 0;
    let external = 0;
    let broken = 0;
    let nofollow = 0;
    let dofollow = 0;
    let redirectChains = 0;

    const parsedBaseUrl = new URL(baseUrl);

    links.each((_, link) => {
      const $link = $(link);
      const href = $link.attr('href');
      if (!href) return;

      try {
        // Skip anchor links, mailto, tel, etc.
        if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
          return;
        }

        // Check rel attribute
        const rel = $link.attr('rel') || '';
        if (rel.includes('nofollow')) {
          nofollow++;
        } else {
          dofollow++;
        }

        let linkUrl: URL;
        if (href.startsWith('http')) {
          linkUrl = new URL(href);
        } else {
          linkUrl = new URL(href, baseUrl);
        }

        if (linkUrl.hostname === parsedBaseUrl.hostname) {
          internal++;
        } else {
          external++;
        }
      } catch (error) {
        // Invalid URL
        broken++;
      }
    });

    return { 
      internal, 
      external, 
      broken,
      nofollow,
      dofollow,
      redirectChains // Would need additional HTTP requests to detect actual redirects
    };
  }

  private analyzePerformance(html: string, responseTime: number) {
    const pageSize = Buffer.byteLength(html, 'utf8');
    
    // Enhanced resource detection
    const scriptMatches = html.match(/<script[^>]*src=/g) || [];
    const styleMatches = html.match(/<link[^>]*stylesheet/g) || [];
    const imageMatches = html.match(/<img[^>]*src=/g) || [];
    const fontMatches = html.match(/<link[^>]*font/g) || [];
    const preloadMatches = html.match(/<link[^>]*rel="preload"/g) || [];
    const prefetchMatches = html.match(/<link[^>]*rel="prefetch"/g) || [];
    
    const totalRequests = 1 + scriptMatches.length + styleMatches.length + imageMatches.length + fontMatches.length;

    // Enhanced optimization checks
    const compression = html.includes('Content-Encoding: gzip') || html.includes('Content-Encoding: br');
    const minifiedCSS = styleMatches.some(match => match.includes('.min.css'));
    const minifiedJS = scriptMatches.some(match => match.includes('.min.js'));
    const cacheHeaders = html.includes('Cache-Control') || html.includes('Expires');
    
    // Modern performance optimizations
    const hasLazyLoading = html.includes('loading="lazy"') || html.includes('data-src');
    const hasWebP = html.includes('.webp');
    const hasAvif = html.includes('.avif');
    const hasCriticalCSS = html.includes('rel="preload"') && html.includes('as="style"');
    const hasAsyncJS = html.includes('async') || html.includes('defer');
    
    // Performance score calculation
    let performanceScore = 100;
    if (responseTime > 1000) performanceScore -= 20;
    if (responseTime > 3000) performanceScore -= 30;
    if (pageSize > 1024 * 1024) performanceScore -= 15; // > 1MB
    if (totalRequests > 50) performanceScore -= 15;
    if (!minifiedCSS) performanceScore -= 10;
    if (!minifiedJS) performanceScore -= 10;
    if (!compression) performanceScore -= 15;
    if (!cacheHeaders) performanceScore -= 10;
    
    // Bonus points for modern optimizations
    if (hasLazyLoading) performanceScore += 5;
    if (hasWebP || hasAvif) performanceScore += 5;
    if (hasCriticalCSS) performanceScore += 5;
    if (hasAsyncJS) performanceScore += 5;

    const performanceIssues = [];
    if (responseTime > 3000) performanceIssues.push(`Slow server response time: ${responseTime}ms`);
    if (pageSize > 1024 * 1024) performanceIssues.push(`Large page size: ${Math.round(pageSize / 1024)}KB`);
    if (totalRequests > 50) performanceIssues.push(`Too many HTTP requests: ${totalRequests}`);
    if (!minifiedCSS) performanceIssues.push('CSS files are not minified');
    if (!minifiedJS) performanceIssues.push('JavaScript files are not minified');
    if (!compression) performanceIssues.push('No compression detected');
    if (!hasLazyLoading && imageMatches.length > 5) performanceIssues.push('No lazy loading detected for images');

    return {
      loadTime: responseTime,
      pageSize: Math.round(pageSize / 1024), // KB
      pageSizeBytes: pageSize,
      requests: totalRequests,
      resourceBreakdown: {
        scripts: scriptMatches.length,
        stylesheets: styleMatches.length,
        images: imageMatches.length,
        fonts: fontMatches.length,
        preloads: preloadMatches.length,
        prefetches: prefetchMatches.length
      },
      optimizations: {
        compression,
        minifiedCSS,
        minifiedJS,
        cacheHeaders,
        hasLazyLoading,
        hasWebP,
        hasAvif,
        hasCriticalCSS,
        hasAsyncJS
      },
      performanceScore: Math.max(0, Math.min(100, performanceScore)),
      performanceIssues,
      recommendations: this.generatePerformanceRecommendations({
        responseTime,
        pageSize,
        totalRequests,
        minifiedCSS,
        minifiedJS,
        compression,
        hasLazyLoading,
        imageCount: imageMatches.length
      }),
      // Legacy compatibility fields
      compression,
      minifiedCSS,
      minifiedJS,
      cacheHeaders
    };
  }

  private generatePerformanceRecommendations(metrics: {
    responseTime: number;
    pageSize: number;
    totalRequests: number;
    minifiedCSS: boolean;
    minifiedJS: boolean;
    compression: boolean;
    hasLazyLoading: boolean;
    imageCount: number;
  }): string[] {
    const recommendations = [];
    
    if (metrics.responseTime > 2000) {
      recommendations.push('Optimize server response time - consider CDN or better hosting');
    }
    if (metrics.pageSize > 500 * 1024) {
      recommendations.push('Reduce page size by optimizing images and removing unused code');
    }
    if (metrics.totalRequests > 30) {
      recommendations.push('Combine CSS/JS files to reduce HTTP requests');
    }
    if (!metrics.minifiedCSS) {
      recommendations.push('Enable CSS minification for faster loading');
    }
    if (!metrics.minifiedJS) {
      recommendations.push('Enable JavaScript minification for better performance');
    }
    if (!metrics.compression) {
      recommendations.push('Enable Gzip/Brotli compression on your server');
    }
    if (!metrics.hasLazyLoading && metrics.imageCount > 3) {
      recommendations.push('Implement lazy loading for images below the fold');
    }
    
    return recommendations;
  }

  private analyzeSocialMeta($: cheerio.CheerioAPI) {
    const hasOpenGraph = $('meta[property^="og:"]').length > 0;
    const hasTwitterCards = $('meta[name^="twitter:"]').length > 0;
    const hasFacebookMeta = $('meta[property^="fb:"]').length > 0;

    // Extract Open Graph data
    const openGraphData: { [key: string]: string } = {};
    $('meta[property^="og:"]').each((_, el) => {
      const property = $(el).attr('property');
      const content = $(el).attr('content');
      if (property && content) {
        openGraphData[property] = content;
      }
    });

    // Extract Twitter Card data
    const twitterCardData: { [key: string]: string } = {};
    $('meta[name^="twitter:"]').each((_, el) => {
      const name = $(el).attr('name');
      const content = $(el).attr('content');
      if (name && content) {
        twitterCardData[name] = content;
      }
    });

    return {
      hasOpenGraph,
      hasTwitterCards,
      hasFacebookMeta,
      openGraphData,
      twitterCardData
    };
  }

  private analyzeAccessibility($: cheerio.CheerioAPI) {
    const issues: string[] = [];
    let score = 100;

    // Check for missing alt attributes
    const imagesWithoutAlt = $('img:not([alt])').length;
    const contrastIssues = 0; // Would need color analysis library for real detection
    let missingLabels = 0;
    const missingHeadings = $('h1').length === 0;
    const skipLinks = $('a[href^="#"]:contains("skip")').length > 0;

    if (imagesWithoutAlt > 0) {
      issues.push(`${imagesWithoutAlt} images missing alt attributes`);
      score -= Math.min(30, imagesWithoutAlt * 3);
    }

    // Check for missing form labels
    const inputsWithoutLabels = $('input:not([type="hidden"]):not([aria-label]):not([aria-labelledby])').length;
    missingLabels = inputsWithoutLabels;
    if (inputsWithoutLabels > 0) {
      issues.push(`${inputsWithoutLabels} form inputs without proper labels`);
      score -= Math.min(20, inputsWithoutLabels * 5);
    }

    // Check for missing page language
    if (!$('html[lang]').length) {
      issues.push('Missing language declaration in HTML tag');
      score -= 10;
    }

    // Check for heading structure
    if (missingHeadings) {
      issues.push('Missing H1 heading for proper document structure');
      score -= 15;
    }

    // Check for low contrast (basic check for common patterns)
    const lowContrastElements = $('*[style*="color:#ccc"], *[style*="color:lightgray"]').length;
    if (lowContrastElements > 0) {
      issues.push('Potential low contrast text detected');
      score -= 15;
    }

    return {
      score: Math.max(0, score),
      issues,
      contrastIssues,
      missingLabels,
      missingHeadings,
      skipLinks
    };
  }

  generateSeoScores(analysis: SeoAnalysisResult): {
    overall: number;
    technical: number;
    content: number;
    performance: number;
    accessibility: number;
    social: number;
  } {
    // Technical SEO score
    let technical = 0;
    technical += analysis.technicalSeo.hasSSL ? 20 : 0;
    technical += analysis.technicalSeo.hasRobotsTxt ? 15 : 0;
    technical += analysis.technicalSeo.hasSitemap ? 15 : 0;
    technical += analysis.technicalSeo.isResponsive ? 15 : 0;
    technical += analysis.technicalSeo.hasValidStructuredData ? 15 : 0;
    technical += analysis.technicalSeo.statusCode === 200 ? 20 : 0;

    // Content score
    let content = 0;
    content += analysis.title ? 20 : 0;
    content += analysis.metaDescription ? 20 : 0;
    content += analysis.h1Tags.length > 0 ? 15 : 0;
    content += analysis.pageContent.wordCount > 300 ? 20 : Math.max(0, analysis.pageContent.wordCount / 15);
    content += analysis.pageContent.readabilityScore > 60 ? 15 : Math.max(0, analysis.pageContent.readabilityScore / 4);
    content += analysis.images.missingAlt === 0 ? 10 : Math.max(0, 10 - analysis.images.missingAlt);

    // Performance score
    let performance = 0;
    performance += analysis.technicalSeo.responseTime < 1000 ? 30 : Math.max(0, 30 - (analysis.technicalSeo.responseTime - 1000) / 100);
    performance += analysis.performance.pageSize < 1000 ? 25 : Math.max(0, 25 - (analysis.performance.pageSize - 1000) / 100);
    performance += analysis.performance.requests < 50 ? 20 : Math.max(0, 20 - (analysis.performance.requests - 50));
    performance += analysis.images.oversized === 0 ? 25 : Math.max(0, 25 - analysis.images.oversized * 5);

    // Social media score
    let social = 0;
    social += analysis.socialMeta.hasOpenGraph ? 40 : 0;
    social += analysis.socialMeta.hasTwitterCards ? 30 : 0;
    social += analysis.socialMeta.hasFacebookMeta ? 30 : 0;

    const overall = Math.round((technical + content + performance + analysis.accessibility.score + social) / 5);

    return {
      overall: Math.min(100, overall),
      technical: Math.min(100, Math.round(technical)),
      content: Math.min(100, Math.round(content)),
      performance: Math.min(100, Math.round(performance)),
      accessibility: Math.round(analysis.accessibility.score),
      social: Math.min(100, Math.round(social))
    };
  }

  generateRecommendations(analysis: SeoAnalysisResult): string[] {
    const recommendations: string[] = [];
    const scores = this.generateSeoScores(analysis);

    // Technical recommendations
    if (!analysis.technicalSeo.hasSSL) {
      recommendations.push('🔒 Install SSL certificate to secure your website and improve search rankings');
    }
    if (!analysis.technicalSeo.hasRobotsTxt) {
      recommendations.push('🤖 Create a robots.txt file to guide search engine crawlers');
    }
    if (!analysis.technicalSeo.hasSitemap) {
      recommendations.push('🗺️ Generate and submit an XML sitemap to search engines');
    }
    if (!analysis.technicalSeo.isResponsive) {
      recommendations.push('📱 Add mobile viewport meta tag for responsive design');
    }

    // Content recommendations
    if (!analysis.title) {
      recommendations.push('📝 Add a descriptive title tag to your page');
    } else if (analysis.title.length < 30 || analysis.title.length > 60) {
      recommendations.push('📝 Optimize title tag length (30-60 characters recommended)');
    }
    if (!analysis.metaDescription) {
      recommendations.push('📄 Add a compelling meta description (150-160 characters)');
    }
    if (analysis.h1Tags.length === 0) {
      recommendations.push('🏷️ Add H1 heading tag for better content structure');
    }
    if (analysis.h1Tags.length > 1) {
      recommendations.push('🏷️ Use only one H1 tag per page for optimal SEO');
    }

    // Content quality recommendations
    if (analysis.pageContent.wordCount < 300) {
      recommendations.push('✍️ Increase content length - aim for at least 300 words');
    }
    if (analysis.pageContent.readabilityScore < 60) {
      recommendations.push('📖 Improve content readability with shorter sentences and simpler words');
    }

    // Image recommendations
    if (analysis.images.missingAlt > 0) {
      recommendations.push(`🖼️ Add alt text to ${analysis.images.missingAlt} images for accessibility and SEO`);
    }
    if (analysis.images.oversized > 0) {
      recommendations.push(`⚡ Optimize ${analysis.images.oversized} oversized images for better performance`);
    }

    // Performance recommendations
    if (analysis.technicalSeo.responseTime > 3000) {
      recommendations.push('🚀 Improve server response time - currently over 3 seconds');
    }
    if (analysis.performance.pageSize > 2000) {
      recommendations.push('📦 Reduce page size - consider compressing resources');
    }
    if (analysis.performance.requests > 100) {
      recommendations.push('🔗 Reduce HTTP requests by combining CSS/JS files');
    }

    // Social media recommendations
    if (!analysis.socialMeta.hasOpenGraph) {
      recommendations.push('👥 Add Open Graph meta tags for better social media sharing');
    }
    if (!analysis.socialMeta.hasTwitterCards) {
      recommendations.push('🐦 Add Twitter Card meta tags for enhanced Twitter sharing');
    }

    // Accessibility recommendations
    analysis.accessibility.issues.forEach(issue => {
      recommendations.push(`♿ ${issue}`);
    });

    // Structure recommendations
    if (!analysis.technicalSeo.hasValidStructuredData) {
      recommendations.push('🏗️ Add structured data markup (Schema.org) for rich snippets');
    }

    return recommendations.slice(0, 12); // Return top 12 recommendations
  }

  private generateDetailedFindings($: cheerio.CheerioAPI, analysisData: any): {
    criticalIssues: DetailedFinding[];
    warnings: DetailedFinding[];
    recommendations: DetailedFinding[];
    positiveFindings: DetailedFinding[];
  } {
    const criticalIssues: DetailedFinding[] = [];
    const warnings: DetailedFinding[] = [];
    const recommendations: DetailedFinding[] = [];
    const positiveFindings: DetailedFinding[] = [];

    // Critical Issues
    if (!analysisData.technicalSeo.hasSSL) {
      criticalIssues.push({
        category: 'Security',
        title: 'SSL Certificate Missing',
        description: 'Your website is not using HTTPS, which poses security risks and negatively impacts SEO rankings.',
        impact: 'critical',
        technicalDetails: 'Website accessed via HTTP instead of HTTPS protocol',
        recommendation: 'Install and configure an SSL certificate immediately',
        howToFix: 'Contact your hosting provider to install an SSL certificate, or use services like Let\'s Encrypt for free SSL',
        resources: ['https://letsencrypt.org/', 'https://developers.google.com/web/fundamentals/security/encrypt-in-transit/why-https']
      });
    }

    if (!analysisData.title) {
      criticalIssues.push({
        category: 'On-Page SEO',
        title: 'Missing Title Tag',
        description: 'No title tag found on this page, which is essential for SEO and user experience.',
        impact: 'critical',
        technicalDetails: 'HTML <title> element is missing from document head',
        recommendation: 'Add a descriptive, keyword-rich title tag',
        howToFix: 'Add <title>Your Page Title</title> within the <head> section of your HTML',
        resources: ['https://developers.google.com/search/docs/appearance/title-link']
      });
    }

    if (analysisData.h1Tags.length === 0) {
      criticalIssues.push({
        category: 'Content Structure',
        title: 'Missing H1 Heading',
        description: 'No H1 heading found. H1 tags are crucial for content hierarchy and SEO.',
        impact: 'critical',
        technicalDetails: 'No <h1> elements detected in page content',
        recommendation: 'Add one H1 heading that describes the main topic of the page',
        howToFix: 'Add <h1>Main Page Heading</h1> to describe your page\'s primary topic',
        resources: ['https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements']
      });
    }

    // Warnings
    if (!analysisData.metaDescription) {
      warnings.push({
        category: 'On-Page SEO',
        title: 'Missing Meta Description',
        description: 'No meta description found. This affects how your page appears in search results.',
        impact: 'high',
        technicalDetails: 'HTML meta description tag is missing',
        recommendation: 'Add a compelling meta description (150-160 characters)',
        howToFix: 'Add <meta name="description" content="Your page description"> in the head section',
        resources: ['https://developers.google.com/search/docs/appearance/snippet']
      });
    }

    if (analysisData.title && (analysisData.title.length < 30 || analysisData.title.length > 60)) {
      warnings.push({
        category: 'On-Page SEO',
        title: 'Title Tag Length Issues',
        description: `Title tag is ${analysisData.title.length} characters. Optimal length is 30-60 characters.`,
        impact: 'medium',
        technicalDetails: `Current title: "${analysisData.title.substring(0, 100)}..."`,
        recommendation: 'Optimize title length to 30-60 characters for better display in search results',
        howToFix: 'Rewrite your title to be concise yet descriptive within the recommended length',
        resources: ['https://moz.com/learn/seo/title-tag']
      });
    }

    if (analysisData.images.missingAlt > 0) {
      warnings.push({
        category: 'Accessibility',
        title: 'Images Missing Alt Text',
        description: `${analysisData.images.missingAlt} images are missing alt attributes, affecting accessibility and SEO.`,
        impact: 'medium',
        technicalDetails: `${analysisData.images.missingAlt} out of ${analysisData.images.total} images lack alt attributes`,
        recommendation: 'Add descriptive alt text to all images',
        howToFix: 'Add alt="descriptive text" attribute to each img tag',
        resources: ['https://www.w3.org/WAI/tutorials/images/', 'https://developers.google.com/search/docs/appearance/google-images']
      });
    }

    if (!analysisData.technicalSeo.hasRobotsTxt) {
      warnings.push({
        category: 'Technical SEO',
        title: 'Missing Robots.txt File',
        description: 'No robots.txt file found to guide search engine crawlers.',
        impact: 'medium',
        technicalDetails: 'HTTP request to /robots.txt returned 404 error',
        recommendation: 'Create a robots.txt file to guide search engines',
        howToFix: 'Create a robots.txt file in your website root directory',
        resources: ['https://developers.google.com/search/docs/crawling-indexing/robots/intro']
      });
    }

    if (!analysisData.technicalSeo.hasSitemap) {
      warnings.push({
        category: 'Technical SEO',
        title: 'XML Sitemap Not Found',
        description: 'No XML sitemap detected, which helps search engines discover your content.',
        impact: 'medium',
        technicalDetails: 'Common sitemap locations (/sitemap.xml, /sitemap_index.xml) returned 404',
        recommendation: 'Generate and submit an XML sitemap',
        howToFix: 'Create an XML sitemap and submit it to Google Search Console',
        resources: ['https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview']
      });
    }

    // Recommendations
    if (!analysisData.technicalSeo.isResponsive) {
      recommendations.push({
        category: 'Mobile Optimization',
        title: 'Add Mobile Viewport Meta Tag',
        description: 'No viewport meta tag found, which may affect mobile user experience.',
        impact: 'medium',
        technicalDetails: 'Missing <meta name="viewport"> tag in document head',
        recommendation: 'Add viewport meta tag for responsive design',
        howToFix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to head section',
        resources: ['https://developers.google.com/web/fundamentals/design-and-ux/responsive/']
      });
    }

    if (!analysisData.socialMeta.hasOpenGraph) {
      recommendations.push({
        category: 'Social Media',
        title: 'Add Open Graph Meta Tags',
        description: 'No Open Graph tags found, limiting social media sharing optimization.',
        impact: 'low',
        technicalDetails: 'No og: prefixed meta property tags detected',
        recommendation: 'Add Open Graph tags for better social sharing',
        howToFix: 'Add og:title, og:description, og:image, and og:url meta tags',
        resources: ['https://ogp.me/', 'https://developers.facebook.com/docs/sharing/webmasters/']
      });
    }

    if (!analysisData.socialMeta.hasTwitterCards) {
      recommendations.push({
        category: 'Social Media',
        title: 'Add Twitter Card Meta Tags',
        description: 'No Twitter Card tags found, missing enhanced Twitter sharing.',
        impact: 'low',
        technicalDetails: 'No twitter: prefixed meta name tags detected',
        recommendation: 'Add Twitter Card meta tags',
        howToFix: 'Add twitter:card, twitter:title, twitter:description meta tags',
        resources: ['https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards']
      });
    }

    if (analysisData.pageContent.wordCount < 300) {
      recommendations.push({
        category: 'Content Quality',
        title: 'Increase Content Length',
        description: `Page has only ${analysisData.pageContent.wordCount} words. More content may improve SEO.`,
        impact: 'medium',
        technicalDetails: `Current word count: ${analysisData.pageContent.wordCount} words`,
        recommendation: 'Aim for at least 300 words of quality content',
        howToFix: 'Add more relevant, valuable content that serves your users\' needs',
        resources: ['https://backlinko.com/content-study', 'https://blog.hubspot.com/marketing/how-long-should-blog-posts-be']
      });
    }

    // Positive Findings
    if (analysisData.technicalSeo.hasSSL) {
      positiveFindings.push({
        category: 'Security',
        title: 'SSL Certificate Active',
        description: 'Website properly uses HTTPS encryption for secure communication.',
        impact: 'high',
        technicalDetails: 'HTTPS protocol detected with valid SSL certificate',
        recommendation: 'Maintain SSL certificate and monitor expiration dates'
      });
    }

    if (analysisData.title && analysisData.title.length >= 30 && analysisData.title.length <= 60) {
      positiveFindings.push({
        category: 'On-Page SEO',
        title: 'Optimal Title Tag Length',
        description: `Title tag length (${analysisData.title.length} characters) is within optimal range.`,
        impact: 'medium',
        technicalDetails: `Title: "${analysisData.title}"`,
        recommendation: 'Continue using well-optimized title tags'
      });
    }

    if (analysisData.h1Tags.length === 1) {
      positiveFindings.push({
        category: 'Content Structure',
        title: 'Proper H1 Usage',
        description: 'Page has exactly one H1 heading, following SEO best practices.',
        impact: 'medium',
        technicalDetails: `H1 heading: "${analysisData.h1Tags[0]}"`,
        recommendation: 'Maintain proper heading hierarchy with one H1 per page'
      });
    }

    if (analysisData.images.missingAlt === 0 && analysisData.images.total > 0) {
      positiveFindings.push({
        category: 'Accessibility',
        title: 'All Images Have Alt Text',
        description: 'All images include alt attributes for better accessibility and SEO.',
        impact: 'medium',
        technicalDetails: `${analysisData.images.total} images all have alt attributes`,
        recommendation: 'Continue providing descriptive alt text for new images'
      });
    }

    if (analysisData.technicalSeo.responseTime < 2000) {
      positiveFindings.push({
        category: 'Performance',
        title: 'Fast Server Response',
        description: `Server responds quickly (${analysisData.technicalSeo.responseTime}ms), providing good user experience.`,
        impact: 'medium',
        technicalDetails: `Response time: ${analysisData.technicalSeo.responseTime}ms`,
        recommendation: 'Monitor and maintain fast response times'
      });
    }

    return {
      criticalIssues,
      warnings,
      recommendations,
      positiveFindings
    };
  }

  // Enhanced detailed analysis methods

  private analyzeHeadingStructure($: cheerio.CheerioAPI) {
    const headings: { [key: string]: Array<{ text: string; order: number }> } = {
      h1: [],
      h2: [],
      h3: [],
      h4: [],
      h5: [],
      h6: []
    };

    // Extract all headings with their order of appearance
    let order = 1;
    $('h1, h2, h3, h4, h5, h6').each((_, element) => {
      const tag = element.name as string;
      const text = $(element).text().trim();
      if (text) {
        headings[tag].push({ text, order: order++ });
      }
    });

    return {
      structure: headings,
      totalHeadings: order - 1,
      h1Count: headings.h1.length,
      h2Count: headings.h2.length,
      h3Count: headings.h3.length,
      h4Count: headings.h4.length,
      h5Count: headings.h5.length,
      h6Count: headings.h6.length,
      hierarchy: this.checkHeadingHierarchy(headings)
    };
  }

  private checkHeadingHierarchy(headings: { [key: string]: Array<{ text: string; order: number }> }) {
    const issues = [];
    const warnings = [];

    // Check if there's more than one H1
    if (headings.h1.length > 1) {
      issues.push(`Multiple H1 tags found (${headings.h1.length}). Should have only one H1 per page.`);
    }

    // Check if H1 is missing
    if (headings.h1.length === 0) {
      issues.push('Missing H1 tag. Every page should have exactly one H1.');
    }

    // Check heading order
    const allHeadings = Object.entries(headings)
      .flatMap(([tag, items]) => items.map(item => ({ ...item, tag })))
      .sort((a, b) => a.order - b.order);

    let expectedLevel = 1;
    for (const heading of allHeadings) {
      const currentLevel = parseInt(heading.tag.substring(1));
      if (currentLevel > expectedLevel + 1) {
        warnings.push(`Heading hierarchy skips levels: ${heading.tag.toUpperCase()} follows H${expectedLevel}`);
      }
      expectedLevel = Math.max(expectedLevel, currentLevel);
    }

    return { issues, warnings };
  }

  private analyzeContentKeywords($: cheerio.CheerioAPI, html: string) {
    // Remove script and style content for cleaner analysis
    $('script, style, nav, footer, aside').remove();
    const textContent = $('body').text().replace(/\s+/g, ' ').trim();
    
    const words = textContent.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);

    const wordFreq: { [key: string]: number } = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    // Get keyword density
    const totalWords = words.length;
    const keywordDensity = Object.entries(wordFreq)
      .map(([word, count]) => ({
        keyword: word,
        count,
        density: Math.round((count / totalWords) * 1000) / 10 // percentage with 1 decimal
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    // Analyze keyword phrases (2-3 words)
    const phrases2 = this.extractPhrases(words, 2);
    const phrases3 = this.extractPhrases(words, 3);

    return {
      totalWords,
      uniqueWords: Object.keys(wordFreq).length,
      topKeywords: keywordDensity,
      keywordPhrases2: phrases2,
      keywordPhrases3: phrases3,
      avgWordLength: words.reduce((sum, word) => sum + word.length, 0) / words.length
    };
  }

  private extractPhrases(words: string[], phraseLength: number) {
    const phrases: { [key: string]: number } = {};
    for (let i = 0; i <= words.length - phraseLength; i++) {
      const phrase = words.slice(i, i + phraseLength).join(' ');
      phrases[phrase] = (phrases[phrase] || 0) + 1;
    }

    return Object.entries(phrases)
      .filter(([phrase, count]) => count > 1)
      .map(([phrase, count]) => ({ phrase, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private analyzeHttpRequests($: cheerio.CheerioAPI, html: string, baseUrl: string) {
    const requests: Array<{
      type: string;
      url: string;
      isExternal: boolean;
      hasAsync?: boolean;
      hasDefer?: boolean;
    }> = [];

    const parsedUrl = new URL(baseUrl);

    // CSS files
    $('link[rel="stylesheet"]').each((_, element) => {
      const href = $(element).attr('href');
      if (href) {
        const fullUrl = href.startsWith('http') ? href : new URL(href, baseUrl).toString();
        requests.push({
          type: 'css',
          url: fullUrl,
          isExternal: !fullUrl.includes(parsedUrl.hostname)
        });
      }
    });

    // JavaScript files
    $('script[src]').each((_, element) => {
      const src = $(element).attr('src');
      if (src) {
        const fullUrl = src.startsWith('http') ? src : new URL(src, baseUrl).toString();
        requests.push({
          type: 'javascript',
          url: fullUrl,
          isExternal: !fullUrl.includes(parsedUrl.hostname),
          hasAsync: $(element).attr('async') !== undefined,
          hasDefer: $(element).attr('defer') !== undefined
        });
      }
    });

    // Images
    $('img[src]').each((_, element) => {
      const src = $(element).attr('src');
      if (src) {
        const fullUrl = src.startsWith('http') ? src : new URL(src, baseUrl).toString();
        requests.push({
          type: 'image',
          url: fullUrl,
          isExternal: !fullUrl.includes(parsedUrl.hostname)
        });
      }
    });

    // Fonts
    $('link[rel="preload"][as="font"], link[href*="font"]').each((_, element) => {
      const href = $(element).attr('href');
      if (href) {
        const fullUrl = href.startsWith('http') ? href : new URL(href, baseUrl).toString();
        requests.push({
          type: 'font',
          url: fullUrl,
          isExternal: !fullUrl.includes(parsedUrl.hostname)
        });
      }
    });

    const breakdown = requests.reduce((acc, req) => {
      acc[req.type] = (acc[req.type] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    return {
      totalRequests: requests.length,
      requestsByType: breakdown,
      externalRequests: requests.filter(r => r.isExternal).length,
      internalRequests: requests.filter(r => !r.isExternal).length,
      requests: requests.slice(0, 50) // Limit for display
    };
  }

  private analyzeJavaScript($: cheerio.CheerioAPI, html: string) {
    const scripts: Array<{
      type: 'inline' | 'external';
      src?: string;
      size?: number;
      hasAsync: boolean;
      hasDefer: boolean;
      hasType?: string;
      hasNonce?: boolean;
      hasIntegrity?: boolean;
    }> = [];

    // External scripts with enhanced detection
    $('script[src]').each((_, element) => {
      const $script = $(element);
      const src = $script.attr('src');
      if (src) {
        scripts.push({
          type: 'external',
          src: src,
          hasAsync: $script.attr('async') !== undefined,
          hasDefer: $script.attr('defer') !== undefined,
          hasType: $script.attr('type'),
          hasNonce: $script.attr('nonce') !== undefined,
          hasIntegrity: $script.attr('integrity') !== undefined
        });
      }
    });

    // Inline scripts with enhanced detection
    $('script:not([src])').each((_, element) => {
      const $script = $(element);
      const content = $script.html() || '';
      const type = $script.attr('type');
      
      // Skip JSON-LD and other non-executable scripts
      if (type && (type.includes('json') || type.includes('template'))) {
        return;
      }
      
      if (content.trim().length > 0) {
        scripts.push({
          type: 'inline',
          size: content.length,
          hasAsync: false,
          hasDefer: false,
          hasType: type,
          hasNonce: $script.attr('nonce') !== undefined,
          hasIntegrity: false
        });
      }
    });

    // Also check for scripts in the HTML string directly (in case cheerio misses some)
    const scriptMatches = html.match(/<script[^>]*>/g) || [];
    const htmlScriptCount = scriptMatches.length;

    const optimizationIssues = [];
    const asyncCount = scripts.filter(s => s.hasAsync).length;
    const deferCount = scripts.filter(s => s.hasDefer).length;
    const blockingScripts = scripts.filter(s => !s.hasAsync && !s.hasDefer && s.type === 'external').length;
    const securityFeatures = scripts.filter(s => s.hasNonce || s.hasIntegrity).length;

    if (blockingScripts > 3) {
      optimizationIssues.push(`${blockingScripts} render-blocking JavaScript files detected`);
    }
    
    if (scripts.length > 0 && securityFeatures === 0) {
      optimizationIssues.push('No security features (nonce, integrity) detected on scripts');
    }

    if (asyncCount === 0 && deferCount === 0 && scripts.filter(s => s.type === 'external').length > 0) {
      optimizationIssues.push('No async or defer attributes found on external scripts');
    }

    return {
      totalScripts: scripts.length,
      htmlScriptTags: htmlScriptCount, // Raw count from HTML
      externalScripts: scripts.filter(s => s.type === 'external').length,
      inlineScripts: scripts.filter(s => s.type === 'inline').length,
      asyncScripts: asyncCount,
      deferScripts: deferCount,
      blockingScripts,
      securityFeatures,
      optimizationIssues,
      scripts: scripts.slice(0, 20), // Limit for display
      largestInlineScript: scripts
        .filter(s => s.type === 'inline' && s.size)
        .sort((a, b) => (b.size || 0) - (a.size || 0))[0]?.size || 0
    };
  }

  private analyzeCss($: cheerio.CheerioAPI, html: string) {
    const stylesheets: Array<{
      type: 'external' | 'inline';
      href?: string;
      size?: number;
      media?: string;
      isMinified?: boolean;
      hasIntegrity?: boolean;
      isCritical?: boolean;
    }> = [];

    // External stylesheets with enhanced detection
    $('link[rel="stylesheet"]').each((_, element) => {
      const $link = $(element);
      const href = $link.attr('href');
      if (href) {
        stylesheets.push({
          type: 'external',
          href,
          media: $link.attr('media') || 'all',
          isMinified: href.includes('.min.css') || false,
          hasIntegrity: $link.attr('integrity') !== undefined,
          isCritical: $link.attr('rel')?.includes('preload') || false
        });
      }
    });

    // Critical CSS (preload stylesheets)
    $('link[rel="preload"][as="style"]').each((_, element) => {
      const $link = $(element);
      const href = $link.attr('href');
      if (href) {
        stylesheets.push({
          type: 'external',
          href,
          media: $link.attr('media') || 'all',
          isMinified: href.includes('.min.css') || false,
          hasIntegrity: $link.attr('integrity') !== undefined,
          isCritical: true
        });
      }
    });

    // Inline styles with enhanced detection
    $('style').each((_, element) => {
      const $style = $(element);
      const content = $style.html() || '';
      if (content.trim().length > 0) {
        stylesheets.push({
          type: 'inline',
          size: content.length,
          media: $style.attr('media') || 'all',
          isMinified: false,
          hasIntegrity: false,
          isCritical: true // Inline styles are considered critical
        });
      }
    });

    // Also check for style attributes on elements
    const inlineStyleElements = $('[style]').length;

    const optimizationIssues = [];
    const unminifiedExternal = stylesheets.filter(s => s.type === 'external' && !s.isMinified).length;
    const criticalCss = stylesheets.filter(s => s.isCritical).length;
    const totalInlineSize = stylesheets
      .filter(s => s.type === 'inline')
      .reduce((sum, s) => sum + (s.size || 0), 0);
    
    if (unminifiedExternal > 0) {
      optimizationIssues.push(`${unminifiedExternal} unminified CSS files detected`);
    }
    
    if (criticalCss === 0) {
      optimizationIssues.push('No critical CSS optimization detected');
    }
    
    if (inlineStyleElements > 50) {
      optimizationIssues.push(`${inlineStyleElements} elements with inline styles detected`);
    }

    if (totalInlineSize > 10000) {
      optimizationIssues.push(`Large inline CSS detected (${Math.round(totalInlineSize/1024)}KB)`);
    }

    return {
      totalStylesheets: stylesheets.length,
      externalStylesheets: stylesheets.filter(s => s.type === 'external').length,
      inlineStyles: stylesheets.filter(s => s.type === 'inline').length,
      minifiedStylesheets: stylesheets.filter(s => s.isMinified).length,
      criticalCssCount: criticalCss,
      inlineStyleElements,
      totalInlineSize,
      optimizationIssues,
      stylesheets: stylesheets.slice(0, 15), // Limit for display
      largestInlineStyle: stylesheets
        .filter(s => s.type === 'inline' && s.size)
        .sort((a, b) => (b.size || 0) - (a.size || 0))[0]?.size || 0
    };
  }

  private analyzeMetaTags($: cheerio.CheerioAPI) {
    const metaTags: Array<{
      name?: string;
      property?: string;
      httpEquiv?: string;
      content?: string;
      charset?: string;
    }> = [];

    $('meta').each((_, element) => {
      const $el = $(element);
      metaTags.push({
        name: $el.attr('name'),
        property: $el.attr('property'),
        httpEquiv: $el.attr('http-equiv'),
        content: $el.attr('content'),
        charset: $el.attr('charset')
      });
    });

    // Categorize meta tags
    const seoTags = metaTags.filter(tag => 
      ['description', 'keywords', 'author', 'robots'].includes(tag.name || '')
    );

    const socialTags = metaTags.filter(tag => 
      (tag.property && (tag.property.startsWith('og:') || tag.property.startsWith('fb:'))) ||
      (tag.name && tag.name.startsWith('twitter:'))
    );

    const viewportTags = metaTags.filter(tag => tag.name === 'viewport');

    return {
      totalMetaTags: metaTags.length,
      seoMetaTags: seoTags,
      socialMetaTags: socialTags,
      viewportTags,
      allMetaTags: metaTags
    };
  }

  private analyzeStructuralData($: cheerio.CheerioAPI) {
    const structuredData: Array<{ type: string; schema: string; content: any }> = [];
    const microdata: Array<{ type: string; itemType: string; itemScope: boolean }> = [];

    // JSON-LD structured data
    $('script[type="application/ld+json"]').each((_, element) => {
      try {
        const content = $(element).html();
        if (content) {
          const data = JSON.parse(content);
          structuredData.push({
            type: 'JSON-LD',
            schema: data['@type'] || 'Unknown',
            content: data
          });
        }
      } catch (e) {
        // Invalid JSON
      }
    });

    // Microdata
    $('[itemscope]').each((_, element) => {
      microdata.push({
        type: 'Microdata',
        itemType: $(element).attr('itemtype') || 'Unknown',
        itemScope: true
      });
    });

    return {
      hasStructuredData: structuredData.length > 0 || microdata.length > 0,
      jsonLdCount: structuredData.length,
      microdataCount: microdata.length,
      structuredData,
      microdata
    };
  }

  private analyzeImageKeywords($: cheerio.CheerioAPI) {
    const imageKeywords: Array<{
      src: string;
      alt?: string;
      keywords: string[];
      format?: string;
    }> = [];

    $('img').each((_, element) => {
      const $img = $(element);
      const src = $img.attr('src') || $img.attr('data-src') || '';
      const alt = $img.attr('alt') || '';
      
      if (src) {
        const keywords = alt.toLowerCase()
          .replace(/[^\w\s]/g, ' ')
          .split(/\s+/)
          .filter(word => word.length > 2);

        const format = src.split('.').pop()?.toLowerCase();

        imageKeywords.push({
          src,
          alt,
          keywords,
          format
        });
      }
    });

    return {
      totalImages: imageKeywords.length,
      imagesWithKeywords: imageKeywords.filter(img => img.keywords.length > 0).length,
      topImageKeywords: this.getTopImageKeywords(imageKeywords),
      imageFormats: this.getImageFormatsBreakdown(imageKeywords)
    };
  }

  private getTopImageKeywords(images: Array<{ keywords: string[] }>) {
    const keywordFreq: { [key: string]: number } = {};
    
    images.forEach(img => {
      img.keywords.forEach(keyword => {
        keywordFreq[keyword] = (keywordFreq[keyword] || 0) + 1;
      });
    });

    return Object.entries(keywordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([keyword, count]) => ({ keyword, count }));
  }

  private getImageFormatsBreakdown(images: Array<{ format?: string }>) {
    const formats: { [key: string]: number } = {};
    
    images.forEach(img => {
      if (img.format) {
        formats[img.format] = (formats[img.format] || 0) + 1;
      }
    });

    return formats;
  }

  private analyzeLoadingOptimization($: cheerio.CheerioAPI) {
    const lazyImages = $('img[loading="lazy"], img[data-src]').length;
    const totalImages = $('img').length;
    
    const preloadLinks = $('link[rel="preload"]').length;
    const prefetchLinks = $('link[rel="prefetch"]').length;
    const dnsPreconnect = $('link[rel="preconnect"], link[rel="dns-prefetch"]').length;

    const optimizations = [];
    if (lazyImages > 0) {
      optimizations.push(`${lazyImages} images use lazy loading`);
    }
    if (preloadLinks > 0) {
      optimizations.push(`${preloadLinks} resources are preloaded`);
    }
    if (dnsPreconnect > 0) {
      optimizations.push(`${dnsPreconnect} DNS preconnections`);
    }

    return {
      lazyLoadedImages: lazyImages,
      totalImages,
      lazyLoadingPercentage: totalImages > 0 ? Math.round((lazyImages / totalImages) * 100) : 0,
      preloadLinks,
      prefetchLinks,
      dnsPreconnects: dnsPreconnect,
      optimizations
    };
  }

  private async analyzeSecurityHeaders(url: string) {
    try {
      const response = await axios.head(url, { timeout: 10000 });
      const headers = response.headers;

      return {
        hasHTTPS: url.startsWith('https://'),
        hasHSTS: !!headers['strict-transport-security'],
        hasCSP: !!headers['content-security-policy'],
        hasXFrameOptions: !!headers['x-frame-options'],
        hasXContentTypeOptions: !!headers['x-content-type-options'],
        hasReferrerPolicy: !!headers['referrer-policy'],
        securityScore: this.calculateSecurityScore(headers)
      };
    } catch (error) {
      return {
        hasHTTPS: url.startsWith('https://'),
        hasHSTS: false,
        hasCSP: false,
        hasXFrameOptions: false,
        hasXContentTypeOptions: false,
        hasReferrerPolicy: false,
        securityScore: 0,
        error: 'Could not analyze security headers'
      };
    }
  }

  private calculateSecurityScore(headers: any): number {
    let score = 0;
    if (headers['strict-transport-security']) score += 20;
    if (headers['content-security-policy']) score += 25;
    if (headers['x-frame-options']) score += 15;
    if (headers['x-content-type-options']) score += 15;
    if (headers['referrer-policy']) score += 10;
    if (headers['x-xss-protection']) score += 15;
    return score;
  }
}