import axios, { AxiosError } from 'axios';
import * as cheerio from 'cheerio';

export interface BrokenLink {
  url: string;
  sourceUrl: string;
  linkText: string;
  linkType: 'internal' | 'external' | 'image' | 'script' | 'stylesheet' | 'other';
  statusCode?: number;
  error: string;
  priority: 'high' | 'medium' | 'low';
  checkedAt: Date;
}

export interface LinkScanProgress {
  totalPages: number;
  scannedPages: number;
  totalLinks: number;
  checkedLinks: number;
  brokenLinks: number;
  isComplete: boolean;
  startedAt: Date;
  completedAt?: Date;
}

export interface LinkScanResult {
  brokenLinks: BrokenLink[];
  progress: LinkScanProgress;
  summary: {
    totalLinksFound: number;
    brokenLinksFound: number;
    internalBrokenLinks: number;
    externalBrokenLinks: number;
    imageBrokenLinks: number;
    otherBrokenLinks: number;
  };
}

export class LinkScanner {
  private baseUrl: string;
  private domain: string;
  private brokenLinks: BrokenLink[] = [];
  private checkedUrls = new Set<string>();
  private pagesToScan = new Set<string>();
  private progress: LinkScanProgress;
  private maxPages: number = 50; // Limit to prevent infinite scanning
  private maxLinksPerPage: number = 100;
  private requestTimeout: number = 10000; // 10 seconds
  private concurrent: number = 5; // Max concurrent requests

  constructor(baseUrl: string, options: { maxPages?: number; maxLinksPerPage?: number; timeout?: number; concurrent?: number } = {}) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.domain = new URL(baseUrl).hostname;
    this.maxPages = options.maxPages || 50;
    this.maxLinksPerPage = options.maxLinksPerPage || 100;
    this.requestTimeout = options.timeout || 10000;
    this.concurrent = options.concurrent || 5;
    
    this.progress = {
      totalPages: 0,
      scannedPages: 0,
      totalLinks: 0,
      checkedLinks: 0,
      brokenLinks: 0,
      isComplete: false,
      startedAt: new Date()
    };
    
    // Start with the homepage
    this.pagesToScan.add(this.baseUrl);
  }

  private isInternalUrl(url: string): boolean {
    try {
      const urlObj = new URL(url, this.baseUrl);
      return urlObj.hostname === this.domain;
    } catch {
      return false;
    }
  }

  private normalizeUrl(url: string, baseUrl: string): string {
    try {
      const urlObj = new URL(url, baseUrl);
      return urlObj.href;
    } catch {
      return url;
    }
  }

  private async checkUrl(url: string): Promise<{ statusCode?: number; error?: string }> {
    try {
      // Skip mailto: and tel: links
      if (url.startsWith('mailto:') || url.startsWith('tel:') || url.startsWith('#')) {
        return { statusCode: 200 };
      }

      // Try HEAD request first (faster)
      try {
        const headResponse = await axios.head(url, {
          timeout: this.requestTimeout,
          validateStatus: (status) => status < 500, // Don't throw for client errors
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; LinkScanner/1.0; +https://example.com/bot)'
          }
        });
        return { statusCode: headResponse.status };
      } catch (headError) {
        // If HEAD fails, try GET request
        const getResponse = await axios.get(url, {
          timeout: this.requestTimeout,
          validateStatus: (status) => status < 500,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; LinkScanner/1.0; +https://example.com/bot)'
          },
          maxRedirects: 5
        });
        return { statusCode: getResponse.status };
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        const statusCode = error.response?.status;
        const errorMessage = error.code === 'ECONNABORTED' ? 'Timeout' :
                           error.code === 'ENOTFOUND' ? 'Domain not found' :
                           error.code === 'ECONNREFUSED' ? 'Connection refused' :
                           error.message;
        return { statusCode, error: errorMessage };
      }
      return { error: 'Unknown error' };
    }
  }

  private getLinkType(element: any, $: cheerio.CheerioAPI): 'internal' | 'external' | 'image' | 'script' | 'stylesheet' | 'other' {
    const tagName = element.tagName.toLowerCase();
    const href = $(element).attr('href');
    const src = $(element).attr('src');
    const url = href || src || '';

    if (tagName === 'img') return 'image';
    if (tagName === 'script') return 'script';
    if (tagName === 'link' && $(element).attr('rel') === 'stylesheet') return 'stylesheet';
    
    if (this.isInternalUrl(url)) return 'internal';
    if (url.startsWith('http')) return 'external';
    
    return 'other';
  }

  private getPriority(linkType: 'internal' | 'external' | 'image' | 'script' | 'stylesheet' | 'other', statusCode?: number): 'high' | 'medium' | 'low' {
    if (statusCode && statusCode >= 500) return 'high';
    if (statusCode && statusCode >= 400) {
      if (linkType === 'internal' || linkType === 'stylesheet' || linkType === 'script') return 'high';
      if (linkType === 'image') return 'medium';
      return 'low';
    }
    return 'low';
  }

  private async extractLinksFromPage(url: string): Promise<{ links: string[], internalPages: string[] }> {
    try {
      const response = await axios.get(url, {
        timeout: this.requestTimeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; LinkScanner/1.0; +https://example.com/bot)'
        }
      });

      const $ = cheerio.load(response.data);
      const links: string[] = [];
      const internalPages: string[] = [];

      // Extract links from various elements
      $('a[href], img[src], link[href], script[src]').each((_: number, element: any) => {
        const href = $(element).attr('href');
        const src = $(element).attr('src');
        const url = href || src;

        if (url && !url.startsWith('#') && !url.startsWith('javascript:') && !url.startsWith('mailto:') && !url.startsWith('tel:')) {
          const fullUrl = this.normalizeUrl(url, this.baseUrl);
          links.push(fullUrl);

          // If it's an internal page link, add it to pages to scan
          if (this.isInternalUrl(fullUrl) && element.tagName.toLowerCase() === 'a') {
            const cleanUrl = fullUrl.split('#')[0]; // Remove anchor
            if (!this.checkedUrls.has(cleanUrl) && internalPages.length < this.maxLinksPerPage) {
              internalPages.push(cleanUrl);
            }
          }
        }
      });

      return { links: links.slice(0, this.maxLinksPerPage), internalPages };
    } catch (error) {
      console.warn(`Failed to extract links from ${url}:`, error instanceof Error ? error.message : 'Unknown error');
      return { links: [], internalPages: [] };
    }
  }

  public async scanWebsite(): Promise<LinkScanResult> {
    console.log(`Starting link scan for: ${this.baseUrl}`);
    
    const allLinks = new Set<string>();
    
    // Scan pages iteratively to avoid deep recursion
    while (this.pagesToScan.size > 0 && this.progress.scannedPages < this.maxPages) {
      const currentUrl = Array.from(this.pagesToScan)[0];
      this.pagesToScan.delete(currentUrl);
      
      if (this.checkedUrls.has(currentUrl)) {
        continue;
      }
      
      this.checkedUrls.add(currentUrl);
      console.log(`Scanning page ${this.progress.scannedPages + 1}/${this.maxPages}: ${currentUrl}`);
      
      const { links, internalPages } = await this.extractLinksFromPage(currentUrl);
      
      // Add new internal pages to scan
      internalPages.forEach(page => {
        if (!this.checkedUrls.has(page) && this.pagesToScan.size < this.maxPages) {
          this.pagesToScan.add(page);
        }
      });
      
      // Add all links to our set
      links.forEach(link => allLinks.add(link));
      
      this.progress.scannedPages++;
      this.progress.totalPages = this.progress.scannedPages + this.pagesToScan.size;
    }

    // Now check all collected links
    const allLinksArray = Array.from(allLinks);
    this.progress.totalLinks = allLinksArray.length;
    
    console.log(`Found ${allLinksArray.length} links across ${this.progress.scannedPages} pages. Checking for broken links...`);

    // Check links in batches to control concurrency
    const batchSize = this.concurrent;
    for (let i = 0; i < allLinksArray.length; i += batchSize) {
      const batch = allLinksArray.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (link) => {
        const result = await this.checkUrl(link);
        this.progress.checkedLinks++;
        
        // Determine if this is a broken link
        const isBroken = (result.statusCode && result.statusCode >= 400) || result.error;
        
        if (isBroken) {
          // Find the source page for this link (simplified - just use base URL for now)
          const brokenLink: BrokenLink = {
            url: link,
            sourceUrl: this.baseUrl,
            linkText: '', // Would need to track this during extraction
            linkType: this.isInternalUrl(link) ? 'internal' : 'external',
            statusCode: result.statusCode,
            error: result.error || `HTTP ${result.statusCode}`,
            priority: this.getPriority(this.isInternalUrl(link) ? 'internal' : 'external', result.statusCode),
            checkedAt: new Date()
          };

          // Refine link type based on URL
          if (link.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
            brokenLink.linkType = 'image';
          } else if (link.match(/\.(js)$/i)) {
            brokenLink.linkType = 'script';
          } else if (link.match(/\.(css)$/i)) {
            brokenLink.linkType = 'stylesheet';
          }

          brokenLink.priority = this.getPriority(brokenLink.linkType, result.statusCode);
          
          this.brokenLinks.push(brokenLink);
          this.progress.brokenLinks++;
        }
      });

      await Promise.all(batchPromises);
      
      // Small delay between batches to be respectful
      if (i + batchSize < allLinksArray.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    this.progress.isComplete = true;
    this.progress.completedAt = new Date();

    const summary = {
      totalLinksFound: allLinksArray.length,
      brokenLinksFound: this.brokenLinks.length,
      internalBrokenLinks: this.brokenLinks.filter(link => link.linkType === 'internal').length,
      externalBrokenLinks: this.brokenLinks.filter(link => link.linkType === 'external').length,
      imageBrokenLinks: this.brokenLinks.filter(link => link.linkType === 'image').length,
      otherBrokenLinks: this.brokenLinks.filter(link => !['internal', 'external', 'image'].includes(link.linkType)).length,
    };

    console.log(`Link scan completed. Found ${this.brokenLinks.length} broken links out of ${allLinksArray.length} total links.`);

    return {
      brokenLinks: this.brokenLinks,
      progress: this.progress,
      summary
    };
  }

  public getProgress(): LinkScanProgress {
    return { ...this.progress };
  }
}