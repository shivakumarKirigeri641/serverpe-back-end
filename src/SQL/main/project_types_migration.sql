-- =====================================================
-- PROJECT TYPES MIGRATION
-- =====================================================
-- Adds support for Full Stack vs UI Only project types
-- UI Only projects generate API keys on purchase
-- =====================================================

-- 1. Add project_type column to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_type VARCHAR(20) 
    DEFAULT 'FULL_STACK';

-- Add constraint for valid values
-- Note: If constraint exists, this will be skipped
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'projects_project_type_check'
    ) THEN
        ALTER TABLE projects ADD CONSTRAINT projects_project_type_check 
            CHECK (project_type IN ('FULL_STACK', 'UI_ONLY'));
    END IF;
END$$;

-- Add comment
COMMENT ON COLUMN projects.project_type IS 
    'FULL_STACK = complete backend+frontend, UI_ONLY = frontend with API key';

-- =====================================================
-- 2. Add api_key columns to licenses table
-- =====================================================

-- API key for UI Only projects
ALTER TABLE licenses ADD COLUMN IF NOT EXISTS api_key VARCHAR(64) NULL;

-- API key status
ALTER TABLE licenses ADD COLUMN IF NOT EXISTS api_key_status VARCHAR(20) 
    DEFAULT 'ACTIVE';

-- Add constraint for api_key_status
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'licenses_api_key_status_check'
    ) THEN
        ALTER TABLE licenses ADD CONSTRAINT licenses_api_key_status_check 
            CHECK (api_key_status IN ('ACTIVE', 'EXPIRED', 'REVOKED'));
    END IF;
END$$;

-- Add index for api_key lookups
CREATE INDEX IF NOT EXISTS idx_licenses_api_key ON licenses(api_key) 
    WHERE api_key IS NOT NULL;

-- Comments
COMMENT ON COLUMN licenses.api_key IS 
    'API key for UI_ONLY projects - used to authenticate with backend';
COMMENT ON COLUMN licenses.api_key_status IS 
    'Status of API key: ACTIVE, EXPIRED, REVOKED';

-- =====================================================
-- 3. Update existing Mock Train project (if exists)
-- =====================================================

-- Update Mock Train to have both types (we'll create 2 entries)
-- First, check if Mock Train project exists and update it
UPDATE projects 
SET project_type = 'FULL_STACK',
    description = COALESCE(description, '') || ' (Full Stack Edition with SQLite Database)'
WHERE LOWER(title) LIKE '%mock train%' 
  AND project_type IS NULL;

-- Insert UI Only version of Mock Train if Full Stack exists
INSERT INTO projects (
    title, 
    project_code, 
    description, 
    base_price, 
    gst_percent, 
    technology, 
    project_type
)
SELECT 
    REPLACE(title, 'Mock Train', 'Mock Train UI Only'),
    project_code || '_UI',
    REPLACE(description, 'Full Stack', 'UI Only') || ' - Requires API Key',
    base_price * 0.7, -- 30% cheaper for UI only
    gst_percent,
    technology,
    'UI_ONLY'
FROM projects 
WHERE LOWER(title) LIKE '%mock train%' 
  AND project_type = 'FULL_STACK'
  AND NOT EXISTS (
      SELECT 1 FROM projects 
      WHERE LOWER(title) LIKE '%mock train ui only%'
  )
LIMIT 1;

-- =====================================================
-- ROLLBACK (if needed)
-- =====================================================
-- ALTER TABLE projects DROP COLUMN IF EXISTS project_type;
-- ALTER TABLE licenses DROP COLUMN IF EXISTS api_key;
-- ALTER TABLE licenses DROP COLUMN IF EXISTS api_key_status;
