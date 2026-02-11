-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create programs table
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Core Metadata
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  duration_seconds INT DEFAULT 0,
  category VARCHAR(50),
  thumbnail_url VARCHAR(500),        -- URL for program thumbnail/poster image
  
  -- Status & Visibility
  status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  published_at TIMESTAMP,
  deleted_at TIMESTAMP DEFAULT NULL,
  
  -- Search Optimization
  search_vector TSVECTOR,
  
  -- Localization
  language VARCHAR(10) DEFAULT 'ar-SA',
  
  -- Source Provider Integration
  source_provider VARCHAR(50),  -- 'YOUTUBE', 'VIMEO', etc.
  external_id VARCHAR(255),
  source_metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 1. GIN Index for Full Text Search (Instant Keyword Lookup)
CREATE INDEX idx_programs_search ON programs USING GIN(search_vector);

-- 2. GIN Trigram Index for Fuzzy/Typo Tolerance
CREATE INDEX idx_programs_title_trgm ON programs USING GIN(title gin_trgm_ops);

-- 3. Composite Index for Filtering
CREATE INDEX idx_programs_status_created ON programs(status, created_at DESC);

-- 4. Unique Index for Deduplication
CREATE UNIQUE INDEX idx_unique_import ON programs(source_provider, external_id) 
WHERE source_provider IS NOT NULL AND external_id IS NOT NULL;

-- 5. Slug Index for URL lookups
CREATE INDEX idx_programs_slug ON programs(slug) WHERE deleted_at IS NULL;

-- 6. Language & Status Index for filtering
CREATE INDEX idx_programs_language_status ON programs(language, status) WHERE deleted_at IS NULL;

-- 7. Performance indexes for sorting operations
CREATE INDEX idx_programs_published_at_desc ON programs(published_at DESC) 
WHERE status = 'PUBLISHED' AND deleted_at IS NULL;

CREATE INDEX idx_programs_duration_desc ON programs(duration_seconds DESC) 
WHERE status = 'PUBLISHED' AND deleted_at IS NULL;

-- 8. Category index for filtering by category
CREATE INDEX idx_programs_category ON programs(category) WHERE deleted_at IS NULL;

-- 8. Composite index for language + status + sorting
CREATE INDEX idx_programs_lang_status_published ON programs(language, status, published_at DESC) 
WHERE deleted_at IS NULL;

-- 9. Create the Function to update search_vector automatically
CREATE FUNCTION programs_search_trigger() RETURNS trigger AS $$
begin
  new.search_vector :=
    setweight(to_tsvector('arabic', coalesce(new.title,'')), 'A') ||
    setweight(to_tsvector('arabic', coalesce(new.description,'')), 'B');
  return new;
end
$$ LANGUAGE plpgsql;

-- 10. Attach the Trigger (Fires on every Insert/Update)
CREATE TRIGGER tsvectorupdate BEFORE INSERT OR UPDATE
ON programs FOR EACH ROW EXECUTE PROCEDURE programs_search_trigger();

-- 11. Create audit timestamp update function
CREATE FUNCTION update_programs_timestamp() RETURNS trigger AS $$
begin
  new.updated_at = NOW();
  return new;
end
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_programs_timestamp_trigger BEFORE UPDATE
ON programs FOR EACH ROW EXECUTE PROCEDURE update_programs_timestamp();
