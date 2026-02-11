# API Specification

## Overview

Thamanya Media Backend provides two separate APIs:
- **CMS Admin API** (Port 3001) - Internal content management
- **Discovery Public API** (Port 3002) - Public content discovery

---

## CMS Admin API (Port 3001)

### Health Check

Monitor CMS API health and uptime.

```
GET /admin/programs/health
```

**Response (200 OK):**
```json
{
  "status": "ok",
  "service": "cms",
  "timestamp": "2026-02-11T01:12:00.000Z",
  "uptime": 1234.56
}
```

---

### 1. Search External Providers

Search YouTube/others for programs to import.

```
POST /admin/programs/integrations/search
Content-Type: application/json
```

**Request:**
```json
{
  "provider": "YOUTUBE",
  "q": "coding tutorials",
  "limit": 10
}
```

**Response (200 OK):**
```json
[
  {
    "externalId": "vid_123",
    "title": "Coding Tutorial",
    "thumbnail": "https://i.ytimg.com/vi/vid_123/default.jpg",
    "duration": 3600,
    "provider": "YOUTUBE"
  }
]
```

---

### 2. Import Program

Import a program from external provider as DRAFT.

```
POST /admin/programs/import
Content-Type: application/json
```

**Request:**
```json
{
  "provider": "YOUTUBE",
  "externalId": "vid_123"
}
```

**Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "YouTube Video vid_123",
  "slug": "youtube-video-vid-123",
  "description": "A sample YouTube video",
  "duration_seconds": 600,
  "category": null,
  "thumbnail_url": "https://i.ytimg.com/vi/vid_123/default.jpg",
  "status": "DRAFT",
  "published_at": null,
  "deleted_at": null,
  "language": "ar-SA",
  "source_provider": "YOUTUBE",
  "external_id": "vid_123",
  "source_metadata": {
    "channel": "Sample Channel",
    "uploadedAt": "2026-02-07T10:30:00Z"
  },
  "created_at": "2026-02-07T10:30:15Z",
  "updated_at": "2026-02-07T10:30:15Z"
}
```

---

### 3. List Draft Programs

Get all draft programs for the dashboard.

```
GET /admin/programs?page=1&limit=20
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Draft Program",
      "status": "DRAFT",
      "created_at": "2026-02-07T10:30:15Z",
      ...
    }
  ],
  "total": 5
}
```

---

### 4. Get Program for Editing

Get a specific program to edit.

```
GET /admin/programs/:id
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Program Title",
  "description": "Description",
  "duration_seconds": 3600,
  "status": "DRAFT",
  "language": "ar-SA",
  ...
}
```

**Response (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Program not found"
}
```

---

### 5. Update Program Metadata

Update program details (triggers search index update).

```
PATCH /admin/programs/:id
Content-Type: application/json
```

**Request:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "duration_seconds": 7200,
  "language": "en-US"
}
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Updated Title",
  "description": "Updated description",
  "duration_seconds": 7200,
  "language": "en-US",
  "updated_at": "2026-02-07T10:35:00Z",
  ...
}
```

---

### 6. Publish Program

Publish program to PUBLISHED status (goes live).

```
PUT /admin/programs/:id/publish
Content-Type: application/json
```

**Request:**
```json
{}
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Program Title",
  "status": "PUBLISHED",
  "published_at": "2026-02-07T10:40:00Z",
  ...
}
```

---

### 7. Archive Program

Soft delete a program (marks as deleted but preserves data).

```
DELETE /admin/programs/:id
```

**Response (204 No Content):**
```
(empty response)
```

---

## Discovery Public API (Port 3002)

### Health Check

Monitor Discovery API health and uptime.

```
GET /programs/health
```

**Response (200 OK):**
```json
{
  "status": "ok",
  "service": "discovery",
  "timestamp": "2026-02-11T01:12:00.000Z",
  "uptime": 1234.56
}
```

---

### 8. Search Programs

Full-text search across published programs.

```
GET /programs/search?q=tutorial&lang=ar-SA&limit=10&offset=0
```

**Parameters:**
- `q` (required): Search query
- `lang` (optional, default: ar-SA): Language filter
- `limit` (optional, default: 10): Results per page
- `offset` (optional, default: 0): Pagination offset

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Tutorial Program",
      "description": "Full description",
      "duration_seconds": 3600,
      "category": "EDUCATIONAL",
      "thumbnail_url": "https://i.ytimg.com/vi/tutorial123/default.jpg",
      "status": "PUBLISHED",
      "published_at": "2026-02-07T08:00:00Z",
      "language": "ar-SA",
      ...
    }
  ],
  "total": 856
}
```

**Headers:**
```
Cache-Control: public, s-maxage=60, stale-while-revalidate=300
```

---

### 9. Get Home Feed

Browse programs with sorting.

```
GET /programs?page=1&sort=newest&lang=ar-SA&limit=20
```

**Parameters:**
- `page` (optional, default: 1): Page number
- `sort` (optional, default: newest): Sort by - newest | oldest | views | duration
- `lang` (optional, default: ar-SA): Language filter
- `limit` (optional, default: 20): Results per page

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Latest Program",
      "category": "PODCAST",
      "thumbnail_url": "https://i.ytimg.com/vi/latest456/default.jpg",
      "status": "PUBLISHED",
      "published_at": "2026-02-07T10:00:00Z",
      ...
    }
  ],
  "total": 9000
}
```

**Headers:**
```
Cache-Control: public, s-maxage=60, stale-while-revalidate=300
```

---

### 10. Get Filters

Get available filter options.

```
GET /programs/filters?lang=ar-SA
```

**Response (200 OK):**
```json
{
  "languages": ["ar-SA", "en-US", "fr-FR"],
  "statuses": ["PUBLISHED"]
}
```

**Headers:**
```
Cache-Control: public, max-age=3600, stale-while-revalidate=7200
```

---

### 11. Get Program Details

Get a single program.

```
GET /programs/:id
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Program Title",
  "description": "Full description",
  "duration_seconds": 3600,
  "category": "PODCAST",
  "thumbnail_url": "https://i.ytimg.com/vi/program789/default.jpg",
  "status": "PUBLISHED",
  "published_at": "2026-02-07T08:00:00Z",
  "language": "ar-SA",
  "created_at": "2026-02-07T06:00:00Z",
  "updated_at": "2026-02-07T08:00:00Z"
}
```

**Response (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Program not found"
}
```

**Headers:**
```
Cache-Control: public, s-maxage=60, stale-while-revalidate=300
```

---

### 12. Get Related Programs

Get similar programs based on content.

```
GET /programs/:id/related?limit=5
```

**Parameters:**
- `limit` (optional, default: 5): Number of related programs

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "aaa11111-b29b-41d4-a716-446655440001",
      "title": "Related Program 1",
      "description": "...",
      "duration_seconds": 3600,
      ...
    }
  ],
  "total": 5
}
```

**Headers:**
```
Cache-Control: public, s-maxage=300, stale-while-revalidate=600
```

---

## Rate Limiting

All endpoints are protected by rate limiting to prevent abuse:

- **CMS API (Port 3001):** 1000 requests per 60 seconds per IP
- **Discovery API (Port 3002):** 100 requests per 60 seconds per IP

When rate limit is exceeded, the API returns:

**Response (429 Too Many Requests):**
```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests"
}
```

---

## Response Codes

| Status | Meaning |
|--------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 204 | No Content - Success with no body |
| 400 | Bad Request - Invalid parameters |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Server Error - Internal error |

---

## Error Responses

All errors follow this format:

```json
{
  "statusCode": 400,
  "message": "Descriptive error message",
  "error": "BadRequest"
}
```

---

## Complete Request/Response Example

### Import → Update → Publish Workflow

```bash
# 1. Search
curl -X POST http://localhost:3001/admin/programs/integrations/search \
  -H "Content-Type: application/json" \
  -d '{"provider":"YOUTUBE","q":"tutorial","limit":1}'

# 2. Import
PROGRAM=$(curl -s -X POST http://localhost:3001/admin/programs/import \
  -H "Content-Type: application/json" \
  -d '{"provider":"YOUTUBE","externalId":"vid_123"}')
PROGRAM_ID=$(echo $PROGRAM | jq -r '.id')

# 3. Update
curl -X PATCH http://localhost:3001/admin/programs/$PROGRAM_ID \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Title","language":"en-US"}'

# 4. Publish
curl -X PUT http://localhost:3001/admin/programs/$PROGRAM_ID/publish \
  -H "Content-Type: application/json" \
  -d '{}'

# 5. Search public
curl -X GET "http://localhost:3002/programs/search?q=updated"

# 6. Get details
curl -X GET http://localhost:3002/programs/$PROGRAM_ID

# 7. Get related
curl -X GET "http://localhost:3002/programs/$PROGRAM_ID/related?limit=3"
```

---

## API Summary

**Total Endpoints:** 14
- **CMS API:** 8 endpoints (including health check)
- **Discovery API:** 6 endpoints (including health check)

---

## Notes

- **Health Checks:** Available for monitoring and load balancing on both APIs
- **Rate Limiting:** Enforced per IP address (1000/min CMS, 100/min Discovery)
- **Search:** Full-text search with Arabic language support using PostgreSQL TSVECTOR
- **Timestamps:** All timestamps are ISO 8601 format (UTC)
- **Soft Deletes:** Programs are never hard-deleted; `deleted_at` timestamp preserves data
- **Cache Headers:** Follow CDN best practices with stale-while-revalidate strategy
- **Categories:** PODCAST, DOCUMENTARY, SERIES, INTERVIEW, EDUCATIONAL, NEWS, ENTERTAINMENT
- **Media:** `thumbnail_url` field stores program poster/thumbnail images
