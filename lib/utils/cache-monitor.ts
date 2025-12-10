"use client";

/**
 * Cache Monitoring Utilities
 * Track cache hits/misses and performance
 */

export interface CacheMetrics {
  browserCacheHits: number;
  browserCacheMisses: number;
  serviceworkerCacheHits: number;
  serviceworkerCacheMisses: number;
  cdnCacheHits: number;
  cdnCacheMisses: number;
  averageLoadTime: number;
  requests: CacheRequest[];
}

export interface CacheRequest {
  url: string;
  timestamp: number;
  cacheStatus: "hit" | "miss" | "stale";
  cacheLayer: "browser" | "serviceworker" | "cdn" | "origin";
  loadTime: number;
  age?: number;
}

class CacheMonitor {
  private metrics: CacheMetrics = {
    browserCacheHits: 0,
    browserCacheMisses: 0,
    serviceworkerCacheHits: 0,
    serviceworkerCacheMisses: 0,
    cdnCacheHits: 0,
    cdnCacheMisses: 0,
    averageLoadTime: 0,
    requests: [],
  };

  private maxRequests = 1000; // Keep last 1000 requests

  /**
   * Intercept fetch requests to track cache performance
   */
  startMonitoring() {
    if (typeof window === "undefined") return;

    // Override fetch to track requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = typeof args[0] === "string" ? args[0] : args[0].url;

      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const loadTime = endTime - startTime;

        this.recordRequest(url, response, loadTime);

        return response;
      } catch (error) {
        const endTime = performance.now();
        this.recordRequest(url, null, endTime - startTime);
        throw error;
      }
    };

    console.log("[CacheMonitor] Monitoring started");
  }

  /**
   * Record a request and its cache status
   */
  private recordRequest(
    url: string,
    response: Response | null,
    loadTime: number
  ) {
    if (!response) return;

    const headers = response.headers;
    const age = headers.get("age");
    const cfCacheStatus = headers.get("cf-cache-status"); // Cloudflare
    const xCache = headers.get("x-cache"); // CloudFront, Fastly
    const via = headers.get("via"); // Generic CDN indicator

    let cacheLayer: CacheRequest["cacheLayer"] = "origin";
    let cacheStatus: CacheRequest["cacheStatus"] = "miss";

    // Determine cache layer and status
    if (headers.get("x-sw-cache") === "hit") {
      cacheLayer = "serviceworker";
      cacheStatus = "hit";
      this.metrics.serviceworkerCacheHits++;
    } else if (
      cfCacheStatus === "HIT" ||
      xCache?.includes("Hit") ||
      xCache?.includes("HIT")
    ) {
      cacheLayer = "cdn";
      cacheStatus = "hit";
      this.metrics.cdnCacheHits++;
    } else if (cfCacheStatus === "MISS" || xCache?.includes("Miss")) {
      cacheLayer = "cdn";
      cacheStatus = "miss";
      this.metrics.cdnCacheMisses++;
    } else if (age && parseInt(age) > 0) {
      cacheLayer = "browser";
      cacheStatus = "hit";
      this.metrics.browserCacheHits++;
    } else {
      cacheLayer = "origin";
      cacheStatus = "miss";
      this.metrics.browserCacheMisses++;
    }

    const request: CacheRequest = {
      url,
      timestamp: Date.now(),
      cacheStatus,
      cacheLayer,
      loadTime,
      age: age ? parseInt(age) : undefined,
    };

    this.metrics.requests.push(request);

    // Keep only last N requests
    if (this.metrics.requests.length > this.maxRequests) {
      this.metrics.requests.shift();
    }

    // Update average load time
    const totalLoadTime = this.metrics.requests.reduce(
      (sum, r) => sum + r.loadTime,
      0
    );
    this.metrics.averageLoadTime = totalLoadTime / this.metrics.requests.length;
  }

  /**
   * Get current metrics
   */
  getMetrics(): CacheMetrics {
    return { ...this.metrics };
  }

  /**
   * Get cache hit ratio
   */
  getCacheHitRatio(): {
    browser: number;
    serviceworker: number;
    cdn: number;
    overall: number;
  } {
    const browserTotal =
      this.metrics.browserCacheHits + this.metrics.browserCacheMisses;
    const swTotal =
      this.metrics.serviceworkerCacheHits +
      this.metrics.serviceworkerCacheMisses;
    const cdnTotal = this.metrics.cdnCacheHits + this.metrics.cdnCacheMisses;
    const overallHits =
      this.metrics.browserCacheHits +
      this.metrics.serviceworkerCacheHits +
      this.metrics.cdnCacheHits;
    const overallTotal = browserTotal + swTotal + cdnTotal;

    return {
      browser:
        browserTotal > 0
          ? (this.metrics.browserCacheHits / browserTotal) * 100
          : 0,
      serviceworker:
        swTotal > 0 ? (this.metrics.serviceworkerCacheHits / swTotal) * 100 : 0,
      cdn: cdnTotal > 0 ? (this.metrics.cdnCacheHits / cdnTotal) * 100 : 0,
      overall: overallTotal > 0 ? (overallHits / overallTotal) * 100 : 0,
    };
  }

  /**
   * Get requests by cache layer
   */
  getRequestsByLayer(): Record<CacheRequest["cacheLayer"], number> {
    return this.metrics.requests.reduce(
      (acc, req) => {
        acc[req.cacheLayer]++;
        return acc;
      },
      { browser: 0, serviceworker: 0, cdn: 0, origin: 0 }
    );
  }

  /**
   * Clear metrics
   */
  reset() {
    this.metrics = {
      browserCacheHits: 0,
      browserCacheMisses: 0,
      serviceworkerCacheHits: 0,
      serviceworkerCacheMisses: 0,
      cdnCacheHits: 0,
      cdnCacheMisses: 0,
      averageLoadTime: 0,
      requests: [],
    };
  }

  /**
   * Export metrics as JSON
   */
  exportMetrics(): string {
    return JSON.stringify(this.metrics, null, 2);
  }
}

// Singleton instance
export const cacheMonitor = new CacheMonitor();

// Auto-start monitoring in browser
if (typeof window !== "undefined") {
  cacheMonitor.startMonitoring();
}
