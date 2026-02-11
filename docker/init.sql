CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS moddatetime;

CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  duration_seconds INT DEFAULT 0,
  category VARCHAR(50),
  thumbnail_url VARCHAR(500),
  
  status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  published_at TIMESTAMP,
  deleted_at TIMESTAMP DEFAULT NULL,
  
  search_vector TSVECTOR,
  language VARCHAR(10) DEFAULT 'ar-SA',
  
  source_provider VARCHAR(50),
  external_id VARCHAR(255),
  source_metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Full Text Search (Instant Keyword Lookup)
CREATE INDEX idx_programs_search ON programs USING GIN(search_vector);

-- Fuzzy Search (Typo tolerance for titles)
CREATE INDEX idx_programs_title_trgm ON programs USING GIN(title gin_trgm_ops);

-- Exact URL Lookup (Essential for routing)
CREATE INDEX idx_programs_slug ON programs(slug) WHERE deleted_at IS NULL;

-- Import Deduplication (Global check to prevent duplicate imports)
CREATE UNIQUE INDEX idx_unique_import ON programs(source_provider, external_id) 
WHERE source_provider IS NOT NULL AND external_id IS NOT NULL;

-- MAIN FEED: Handles filtering by Language+Status AND sorting by Date.
CREATE INDEX idx_programs_feed 
ON programs(language, status, published_at DESC) 
WHERE deleted_at IS NULL;

-- CATEGORY BROWSER: Optimized for "Show me Arabic News"
CREATE INDEX idx_programs_category_composite 
ON programs(language, status, category) 
WHERE deleted_at IS NULL;

-- ADMIN DASHBOARD: Good for "Show me latest uploads" regardless of language
CREATE INDEX idx_programs_status_created ON programs(status, created_at DESC);

CREATE FUNCTION programs_search_trigger() RETURNS trigger AS $$
begin
  new.search_vector :=
    setweight(to_tsvector('arabic', coalesce(new.title,'')), 'A') ||
    setweight(to_tsvector('arabic', coalesce(new.description,'')), 'B');
  return new;
end
$$ LANGUAGE plpgsql;

CREATE TRIGGER tsvectorupdate BEFORE INSERT OR UPDATE
ON programs FOR EACH ROW EXECUTE PROCEDURE programs_search_trigger();

CREATE TRIGGER update_programs_timestamp_trigger
BEFORE UPDATE ON programs
FOR EACH ROW
EXECUTE PROCEDURE moddatetime (updated_at);