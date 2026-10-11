# Day 7 Assignment: Scaling SnapShare

## 1. Assumptions

SnapShare is a photo-sharing application where users upload photos and scroll through feed pages containing photos from people they follow.

The estimates below use the assignment's starting facts and decimal units to keep the arithmetic simple:

- Registered users: **10,000,000**.
- Daily active users (DAU): **10%** of registered users.
- Uploads: **1 original photo per active user per day**.
- Feed usage: **50 feed-page views per active user per day**.
- Average original photo size: **2 MB**.
- Average thumbnail size: **50 KB = 0.05 MB**.
- For rough estimates, **1 day ≈ 100,000 seconds**, **1 GB = 1,000 MB**, and **1 TB = 1,000 GB**.
- Peak traffic is estimated at **5 times the average**.
- Storage estimates assume usage stays constant for a year and count one stored original plus one thumbnail per upload. They exclude replicas, backups, metadata, logs, and storage overhead.

### Daily active users

10,000,000 registered users × 10% active daily = **1,000,000 daily active users**.

## 2. Traffic and storage estimates

### Uploads per second

Each of the 1,000,000 daily active users uploads one photo per day:

- Uploads per day = 1,000,000 × 1 = **1,000,000 uploads/day**.
- Average uploads per second = 1,000,000 ÷ 100,000 ≈ **10 uploads/second**.
- Estimated peak uploads = 10 × 5 = **50 uploads/second**.

### Feed views per second

Each daily active user views 50 feed pages per day:

- Feed views per day = 1,000,000 × 50 = **50,000,000 feed views/day**.
- Average feed views per second = 50,000,000 ÷ 100,000 ≈ **500 feed views/second**.
- Estimated peak feed views = 500 × 5 = **2,500 feed views/second**.

**Important:** The feed-view total is 50 million per day, not 500 million. Therefore the average is approximately 500 feed views/second and the 5× peak is approximately 2,500/second.

### Storage per year

**Original photos**

- Daily original-photo storage = 1,000,000 × 2 MB = **2,000,000 MB/day = 2,000 GB/day = 2 TB/day**.
- Annual original-photo storage = 2 TB × 365 = **730 TB/year**.

**Thumbnails**

- Daily thumbnail storage = 1,000,000 × 50 KB = 50,000,000 KB/day = **50 GB/day**.
- Annual thumbnail storage = 50 GB × 365 = **18,250 GB = 18.25 TB/year**.

**Combined annual photo storage**

730 TB + 18.25 TB = **748.25 TB/year**, approximately **0.75 petabytes per year**, before backups, replicas, and other overhead.

These estimates show that SnapShare is **read-heavy by request count**: users view feed pages far more often than they upload photos (50 feed views for every upload, based on the assumptions). The design should therefore make feed reads and image delivery efficient with caching, database read replicas, and a CDN. Uploads still require reliable storage and background processing.

## 3. Why photo files belong in object storage

Original photos and thumbnails should be stored in **object storage** (for example, Amazon S3, Cloudflare R2, or Google Cloud Storage), rather than as large binary files inside the main relational database.

Object storage is designed for large files, scales independently, is durable, and works well with CDNs. The database should store photo metadata and object keys/URLs, such as the owner, caption, upload time, object key, thumbnail key, and visibility settings. This keeps database rows smaller and makes searching, indexing, and transactions more efficient. Access must still be controlled with authorization checks and, where appropriate, short-lived signed URLs.

## 4. Proposed architecture

```text
                         ┌─────────────────────┐
                         │ DNS: snapshare.com  │
                         └──────────┬──────────┘
                                    │ resolves domain
                                    v
┌───────────────────┐       ┌──────────────────────────┐
│ Browser / Mobile  │──────>│ CDN                      │
│ Client            │ files │ photos + thumbnails +    │
└─────────┬─────────┘       │ static HTML/CSS/JS       │
          │                 └────────────▲─────────────┘
          │ HTTPS API requests           │ fetch on cache miss
          v                              │
┌─────────────────────┐                  │
│ Load Balancer       │                  │
│ health checks       │                  │
└───────┬─────────────┘                  │
        │                                │
   ┌────┴──────────┬───────────┐         │
   v               v           v         │
┌─────────┐   ┌─────────┐  ┌─────────┐    │
│ App     │   │ App     │  │ App     │    │
│ Server 1│   │ Server 2│  │ Server 3│    │
└──┬───┬──┘   └──┬───┬──┘  └──┬───┬──┘    │
   │   │         │   │        │   │        │
   │   └─────────┴───┴────────┴───┘        │
   │                │                      │
   │                v                      │
   │       ┌──────────────────┐            │
   │       │ Cache (Redis)    │            │
   │       │ feeds / metadata │            │
   │       └──────────────────┘            │
   │
   ├── writes metadata ──> ┌──────────────────┐
   │                       │ Primary Database │
   │                       └────────┬─────────┘
   │                                │ replication
   │                                v
   │                       ┌──────────────────┐
   │ reads feeds from      │ Read Replica     │
   └──────────────────────>└──────────────────┘

   Upload original ────────> ┌──────────────────┐
                             │ Object Storage   │
   CDN fetches images <───── │ originals +      │
                             │ thumbnails       │
                             └──────────────────┘

   App ── enqueue thumbnail job ──> ┌────────────────┐
                                    │ Message Queue  │
                                    └───────┬────────┘
                                            v
                                    ┌────────────────┐
                                    │ Thumbnail      │
                                    │ Worker         │
                                    └───────┬────────┘
                                            │ creates thumbnail
                                            └──────> Object Storage
```

The app servers are stateless: persistent user data and photo files are not kept only in an individual server's memory or local disk. Every healthy app server can handle any API request.

## 5. What each component solves

- **DNS:** Resolves snapshare.com to the service's network endpoint.
- **CDN:** Serves static assets, originals, and thumbnails from nearby edge locations to reduce latency and origin traffic.
- **Load balancer:** Distributes API requests across healthy app servers and stops routing to unhealthy instances.
- **App servers:** Authenticate users, validate uploads, enforce permissions, create feed responses, and coordinate database, cache, storage, and queue operations.
- **Redis cache:** Stores frequently requested feed data and metadata so repeated reads do not all hit the database.
- **Primary database:** Stores authoritative structured data such as users, follows, photo metadata, captions, permissions, and feed-related records; it accepts writes.
- **Read replica:** Serves suitable database read queries and reduces read load on the primary, with the possibility of replication lag.
- **Object storage:** Durably stores original image files and generated thumbnails without bloating relational database rows.
- **Message queue:** Holds thumbnail-generation jobs so image processing can happen asynchronously and absorb bursts of uploads.
- **Thumbnail worker:** Consumes jobs, resizes and compresses photos, writes thumbnails to object storage, and records completion or failure.
- **Monitoring, logs, and alerts:** Track latency, error rates, queue depth, storage failures, and resource use so problems can be detected and investigated.

## 6. Step-by-step photo upload flow

1. The user signs in and selects a photo in the SnapShare client.
2. The client sends an authenticated upload request to the API through the load balancer. The app server checks the user's identity, permissions, file type, and size limits.
3. For a scalable implementation, the app can issue a short-lived, restricted signed upload URL so the client uploads the original directly to object storage. This avoids routing large file bytes through every app server. The server must verify the upload before treating it as complete.
4. The original photo is uploaded to object storage under a unique object key. The storage location and object key are not guessed from user input.
5. The client or storage event notifies the API that the upload completed. The app verifies the object and creates a photo metadata record in the primary database, including the owner, object key, upload time, and processing status.
6. The app places a thumbnail-generation job on the message queue and responds to the client with a success status and photo identifier. The UI can show a processing state until the thumbnail is ready.
7. A worker receives the job, downloads or reads the original, validates it, creates a resized/compressed thumbnail, and writes the thumbnail to object storage.
8. The worker updates the photo metadata to mark processing complete. Failed jobs are retried safely with limits and moved to a dead-letter queue or surfaced for investigation after repeated failures.
9. When a feed is requested, the API checks Redis first, then queries the database/read replica on a cache miss. The feed response includes authorized image URLs or paths. The CDN serves the images and thumbnails, fetching them from object storage on a cache miss.
10. When a new photo changes a cached feed, the relevant cache entries are invalidated or updated. Authorization is enforced on private content; a CDN must not make private photos publicly accessible.

## 7. Trade-offs

### Trade-off 1: Fast feed reads vs. freshness

Redis, a CDN, and database read replicas improve speed and reduce load, but caches can become stale and replicas can lag behind the primary. SnapShare can tolerate a short delay for many feed updates, but should invalidate relevant cache entries after important changes and read from the primary when immediate consistency is required.

### Trade-off 2: Direct-to-object-storage uploads vs. simpler server-mediated uploads

Direct uploads reduce app-server bandwidth and make large uploads more scalable, but require signed URLs, upload verification, expiration, and careful access controls. Sending every file through an app server is conceptually simpler, but consumes more server bandwidth and can become a bottleneck.

### Trade-off 3: Asynchronous thumbnails vs. immediate processing

A queue and worker keep upload responses fast and smooth out traffic spikes, but a thumbnail may not be available immediately and the queue can fall behind. The client should display a processing placeholder, while monitoring queue depth and retrying failed jobs safely.

### Trade-off 4: Reliability vs. cost and operational complexity

Read replicas, multiple app servers, object-storage durability, monitoring, and backups improve resilience, but increase cost and operational work. Start with a modest multi-server architecture and scale individual components when measured traffic, latency, or failure patterns justify it.

## 8. Monitoring and protection

Track at least these metrics:

- Feed API latency (including p95 and p99), requests per second, and error rate.
- Cache hit rate and database CPU/query latency.
- Upload success/failure rate, object-storage errors, and thumbnail-processing time.
- Queue depth, oldest queued-job age, worker failures, and retry counts.
- CDN cache-hit ratio, image-delivery latency, and bandwidth.

Use rate limits for uploads and feed requests, strict file-size/type limits, request timeouts, bounded retries with exponential back-off, and authentication/authorization checks. These protect the service from accidental overload and abuse.

## 9. Conclusion

With the stated assumptions, SnapShare has **1 million daily active users**, approximately **10 average uploads/second** (**50 peak**), **500 average feed views/second** (**2,500 peak**), and approximately **748.25 TB of new original-photo and thumbnail data per year** before overhead. It is read-heavy by request count, so the architecture prioritizes CDN delivery, feed caching, and read replicas while using object storage for images and a queue/worker for thumbnail generation. The components should be introduced to solve measured problems rather than adding unnecessary complexity prematurely.
