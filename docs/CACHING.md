# Multi-Layered Caching Implementation Guide

## 🎯 Overview

This application implements a **4-layer caching architecture**:

1. **Browser Cache** - HTTP caching with Cache-Control headers
2. **Service Worker Cache** - Programmable browser caching for offline support
3. **CDN/Edge Cache** - Cloudflare/CloudFront/Fastly edge caching
4. **Redis Cache** - Backend application cache (existing)

---

## 📊 Caching Strategy

### Layer 1: Browser HTTP Cache

**Static Assets** (Fingerprinted files)
```
Cache-Control: public, max-age=31536000, immutable
```
- Files: `/_next/static/*` (automatically fingerprinted by Next.js)
- Duration: 1 year
- Safe because filename changes on content change

**Public Pages** (Home, News List)
```
Cache-Control: public, max-age=10, s-maxage=30, stale-while-revalidate=60
```
- Browser: 10 seconds
- CDN: 30 seconds  
- Stale content served while revalidating: 60 seconds

**API Endpoints** (Public news data)
```
Cache-Control: public, max-age=5, s-maxage=10, stale-while-revalidate=5
```
- Browser: 5 seconds
- CDN: 10 seconds
- Matches backend Redis cache TTL

**Private Content** (Auth, User data)
```
Cache-Control: private, no-store, no-cache, must-revalidate
```
- Never cached
- Always fresh from server

### Layer 2: Service Worker Cache

**Strategies Implemented:**

1. **Cache First** - Static assets
   - Check cache → Return if found → Fetch and cache if not

2. **Network First** - API calls
   - Fetch from network → Cache response → Return cached if network fails

3. **Stale While Revalidate** - Pages
   - Return cached immediately → Fetch fresh in background → Update cache

**Files:**
- `public/sw.js` - Service worker implementation
- `components/providers/ServiceWorkerManager.tsx` - Registration and update management

### Layer 3: CDN/Edge Cache

**Controlled by `s-maxage` directive:**
```
s-maxage=30  → CDN caches for 30 seconds
```

**CDN Providers Supported:**
- Cloudflare
- AWS CloudFront
- Fastly

**Purge Utilities:**
- `lib/utils/cdn-purge.ts` - CDN cache invalidation

### Layer 4: Redis Cache (Backend)

Existing backend implementation:
- News list: 60s TTL
- Single news: 30s TTL

---

## 🚀 Implementation Details

### 1. Next.js Configuration

**File: `next.config.ts`**

```typescript
async headers() {
  return [
    {
      source: '/_next/static/:path*',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
      ],
    },
    // ... more headers
  ];
}
```

### 2. Middleware for Dynamic Headers

**File: `middleware.ts`**

Adds cache headers to pages and API routes based on path patterns.

```typescript
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  if (pathname === '/') {
    response.headers.set(
      'Cache-Control',
      'public, max-age=10, s-maxage=30, stale-while-revalidate=60'
    );
  }
  
  return response;
}
```

### 3. Service Worker

**File: `public/sw.js`**

Implements intelligent caching strategies:

```javascript
// Network first for API
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch {
    return await caches.match(request);
  }
}
```

### 4. CDN Purge Utilities

**File: `lib/utils/cdn-purge.ts`**

```typescript
// Purge specific URLs
await purgeCDN(config, {
  urls: ['https://example.com/news/123']
});

// Purge by tags (surrogate keys)
await purgeCDN(config, {
  tags: ['news', 'article-123']
});
```

### 5. Cache Monitoring

**File: `lib/utils/cache-monitor.ts`**

Tracks cache performance:
- Hit/miss ratios per layer
- Response times
- Request counts

---

## 🧪 Testing

### Stress Test Tool

**URL:** `http://localhost:3000/stress-test.html`

**Features:**
- Configure concurrent requests
- Test different endpoints
- Monitor cache hit ratios
- Export results as JSON

**Quick Start:**
1. Open `http://localhost:3000/stress-test.html`
2. Configure API URL and test parameters
3. Click "Start Test"
4. Monitor real-time metrics

### Manual Testing

**Test Browser Cache:**
```bash
# First request (miss)
curl -I http://localhost:3000/

# Second request within TTL (hit - check Age header)
curl -I http://localhost:3000/
```

**Test CDN Cache:**
```bash
# Check CDN headers
curl -I https://your-domain.com/

# Look for:
# - Age: [seconds] (cache age)
# - CF-Cache-Status: HIT (Cloudflare)
# - X-Cache: Hit from cloudfront (CloudFront)
```

**Test Redis Cache:**
```bash
# Backend logs should show:
# "Cache HIT" or "Cache MISS"
```

---

## 📈 Cache Performance Metrics

### Expected Hit Ratios

**Development:**
- Browser: 60-70%
- Service Worker: 70-80%
- CDN: N/A (usually disabled in dev)
- Redis: 80-90%

**Production:**
- Browser: 70-80%
- Service Worker: 80-90%
- CDN: 90-95%
- Redis: 85-95%

### Response Time Goals

| Source | Target | Typical |
|--------|--------|---------|
| Browser Cache | <5ms | 2-3ms |
| Service Worker | <10ms | 5-8ms |
| CDN | <50ms | 20-40ms |
| Redis | <100ms | 30-80ms |
| Origin (uncached) | <500ms | 200-400ms |

---

## 🔧 Configuration

### Environment Variables

```env
# CDN Configuration (optional)
CDN_PROVIDER=cloudflare
CLOUDFLARE_API_TOKEN=your_token
CLOUDFLARE_ZONE_ID=your_zone_id

# OR for CloudFront
CDN_PROVIDER=cloudfront
AWS_DISTRIBUTION_ID=your_distribution_id

# OR for Fastly
CDN_PROVIDER=fastly
FASTLY_API_TOKEN=your_token
FASTLY_SERVICE_ID=your_service_id
```

### CDN Setup

#### Cloudflare

1. **Login to Cloudflare Dashboard**
2. **Navigate to your domain**
3. **Caching → Configuration:**
   - Caching Level: Standard
   - Browser Cache TTL: Respect Existing Headers
4. **Page Rules (optional):**
   - `*example.com/_next/static/*` → Cache Level: Cache Everything, Edge Cache TTL: 1 year
5. **API Token:**
   - Create token with "Zone.Cache Purge" permission
   - Add to environment variables

#### AWS CloudFront

1. **Create Distribution**
2. **Cache Behavior Settings:**
   - Cache Based on Selected Request Headers: None
   - Object Caching: Use Origin Cache Headers
3. **Create Invalidation API credentials**
4. **Add to environment variables**

#### Fastly

1. **Create Service**
2. **Configure VCL or use Terraform**
3. **Enable Surrogate-Key support**
4. **Add API token to environment variables**

---

## 🔄 Cache Invalidation

### Manual Purge

```typescript
import { purgeCDN } from '@/lib/utils/cdn-purge';

// Purge specific URLs
await purgeCDN(config, {
  urls: [
    'https://example.com/',
    'https://example.com/news/123'
  ]
});

// Purge by tags
await purgeCDN(config, {
  tags: ['news', 'article-123']
});

// Purge everything (use sparingly)
await purgeCDN(config, {
  purgeEverything: true
});
```

### Automatic Purge

Implement in your backend mutation endpoints:

```typescript
// After creating/updating news
await purgeNewsArticle(cdnConfig, articleId, baseUrl);

// After deleting news
await purgeAllNews(cdnConfig, baseUrl);
```

### Service Worker Update

```javascript
// Clear service worker cache
if ('caches' in window) {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map(name => caches.delete(name)));
}
```

---

## 🐛 Troubleshooting

### Problem: Cache not working

**Check:**
1. Headers in DevTools Network tab
2. `Cache-Control` header present?
3. CDN configured to respect origin headers?
4. Service worker registered? (DevTools → Application → Service Workers)

**Fix:**
```bash
# Clear all caches
npm run dev
# Hard refresh browser (Ctrl+Shift+R)
# Check service worker is active
```

### Problem: Stale content

**Diagnosis:**
- Check `Age` header (how old cached content is)
- Check TTL settings

**Fix:**
```typescript
// Purge CDN
await purgeCDN(config, { urls: ['...'] });

// Clear service worker
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(r => r.unregister());
});
```

### Problem: 401 errors with cached responses

**Cause:** Auth token expired but cached

**Fix:**
```typescript
// Add to middleware.ts
if (pathname.includes('/auth') || request.headers.get('authorization')) {
  response.headers.set('Cache-Control', 'private, no-store');
}
```

---

## 📊 Monitoring

### Browser DevTools

1. **Network Tab:**
   - Check "Disable cache" to test fresh requests
   - Look for `Age` header (cache age)
   - Status `200` (from cache) vs `304` (not modified)

2. **Application Tab:**
   - Service Worker status
   - Cache Storage contents
   - Clear storage

### Server-Side Logs

**Backend (NestJS):**
```typescript
console.log('[Cache] HIT', { key, ttl });
console.log('[Cache] MISS', { key });
```

### CDN Dashboard

- **Cloudflare:** Analytics → Caching
- **CloudFront:** Monitoring → Cache Statistics
- **Fastly:** Stats → Hit Rate

---

## 🚀 Production Checklist

- [ ] Configure CDN (Cloudflare/CloudFront/Fastly)
- [ ] Set environment variables
- [ ] Test cache headers in production
- [ ] Verify CDN respects origin headers
- [ ] Test purge API
- [ ] Set up monitoring alerts
- [ ] Document cache TTLs for team
- [ ] Test invalidation workflow
- [ ] Load test with stress tool
- [ ] Monitor hit ratios

---

## 📚 Resources

- [MDN HTTP Caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Cloudflare Cache](https://developers.cloudflare.com/cache/)
- [CloudFront Caching](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/ConfiguringCaching.html)
- [Fastly Caching](https://docs.fastly.com/en/guides/caching)

---

## 🎓 Best Practices

1. **Use versioned URLs** for static assets (done automatically by Next.js)
2. **Set appropriate TTLs** based on content volatility
3. **Use `stale-while-revalidate`** for better UX
4. **Separate `max-age` and `s-maxage`** to control browser vs CDN
5. **Never cache authenticated content** at CDN layer
6. **Implement surrogate keys** for efficient purging
7. **Monitor cache hit ratios** continuously
8. **Test invalidation workflows** before production
9. **Use ETags** for conditional requests
10. **Document your caching strategy** for the team

---

**Questions or issues?** Check the troubleshooting section or review the stress test results.
