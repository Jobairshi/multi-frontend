/**
 * CDN Cache Purge Utilities
 * Supports Cloudflare, CloudFront, and Fastly
 */

export interface PurgeOptions {
  urls?: string[];
  tags?: string[];
  purgeEverything?: boolean;
}

export interface CDNConfig {
  provider: "cloudflare" | "cloudfront" | "fastly";
  apiToken?: string;
  zoneId?: string;
  distributionId?: string;
  serviceId?: string;
}

/**
 * Purge Cloudflare cache
 */
export async function purgeCloudflare(
  config: CDNConfig,
  options: PurgeOptions
): Promise<boolean> {
  if (!config.apiToken || !config.zoneId) {
    console.error("[CDN] Missing Cloudflare credentials");
    return false;
  }

  try {
    const body: any = {};

    if (options.purgeEverything) {
      body.purge_everything = true;
    } else if (options.urls && options.urls.length > 0) {
      body.files = options.urls;
    } else if (options.tags && options.tags.length > 0) {
      body.tags = options.tags;
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${config.zoneId}/purge_cache`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const result = await response.json();

    if (result.success) {
      console.log("[CDN] Cloudflare cache purged successfully");
      return true;
    } else {
      console.error("[CDN] Cloudflare purge failed:", result.errors);
      return false;
    }
  } catch (error) {
    console.error("[CDN] Cloudflare purge error:", error);
    return false;
  }
}

/**
 * Purge CloudFront cache (AWS)
 */
export async function purgeCloudFront(
  config: CDNConfig,
  options: PurgeOptions
): Promise<boolean> {
  if (!config.distributionId) {
    console.error("[CDN] Missing CloudFront distribution ID");
    return false;
  }

  // Note: This requires AWS SDK which needs server-side implementation
  console.warn(
    "[CDN] CloudFront purge requires AWS SDK server-side implementation"
  );

  // Example paths for invalidation
  const paths = options.urls?.map((url) => new URL(url).pathname) || ["/*"];

  console.log("[CDN] CloudFront invalidation paths:", paths);

  return false; // Placeholder
}

/**
 * Purge Fastly cache
 */
export async function purgeFastly(
  config: CDNConfig,
  options: PurgeOptions
): Promise<boolean> {
  if (!config.apiToken || !config.serviceId) {
    console.error("[CDN] Missing Fastly credentials");
    return false;
  }

  try {
    if (options.purgeEverything) {
      // Purge all
      const response = await fetch(
        `https://api.fastly.com/service/${config.serviceId}/purge_all`,
        {
          method: "POST",
          headers: {
            "Fastly-Key": config.apiToken,
          },
        }
      );

      return response.ok;
    } else if (options.urls && options.urls.length > 0) {
      // Purge by URL
      const results = await Promise.all(
        options.urls.map((url) =>
          fetch(url, {
            method: "PURGE",
            headers: {
              "Fastly-Key": config.apiToken,
            },
          })
        )
      );

      return results.every((r) => r.ok);
    } else if (options.tags && options.tags.length > 0) {
      // Purge by surrogate key
      const results = await Promise.all(
        options.tags.map((tag) =>
          fetch(
            `https://api.fastly.com/service/${config.serviceId}/purge/${tag}`,
            {
              method: "POST",
              headers: {
                "Fastly-Key": config.apiToken,
              },
            }
          )
        )
      );

      return results.every((r) => r.ok);
    }

    return false;
  } catch (error) {
    console.error("[CDN] Fastly purge error:", error);
    return false;
  }
}

/**
 * Generic purge function that routes to correct CDN
 */
export async function purgeCDN(
  config: CDNConfig,
  options: PurgeOptions
): Promise<boolean> {
  switch (config.provider) {
    case "cloudflare":
      return purgeCloudflare(config, options);
    case "cloudfront":
      return purgeCloudFront(config, options);
    case "fastly":
      return purgeFastly(config, options);
    default:
      console.error("[CDN] Unknown provider:", config.provider);
      return false;
  }
}

/**
 * Helper to purge specific news articles
 */
export async function purgeNewsArticle(
  config: CDNConfig,
  articleId: string,
  baseUrl: string
): Promise<boolean> {
  const urls = [
    `${baseUrl}/`,
    `${baseUrl}/news/${articleId}`,
    `${baseUrl}/api/news`,
    `${baseUrl}/api/news/${articleId}`,
  ];

  return purgeCDN(config, { urls });
}

/**
 * Helper to purge all news-related caches
 */
export async function purgeAllNews(
  config: CDNConfig,
  baseUrl: string
): Promise<boolean> {
  const urls = [`${baseUrl}/`, `${baseUrl}/api/news`];

  return purgeCDN(config, {
    urls,
    tags: ["news", "news-list"],
  });
}
