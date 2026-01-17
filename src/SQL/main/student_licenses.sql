-- =====================================================
-- STUDENT LICENSES TABLE
-- =====================================================
-- Stores license keys for students who purchase projects
-- Used by checkStudentLicense middleware
-- =====================================================

CREATE TABLE IF NOT EXISTS student_licenses (
    id SERIAL PRIMARY KEY,
    
    -- License key (unique identifier)
    license_key VARCHAR(64) UNIQUE NOT NULL,
    
    -- Student information
    student_name VARCHAR(255) NOT NULL,
    student_email VARCHAR(255) NOT NULL,
    student_mobile VARCHAR(20),
    student_college VARCHAR(255),
    
    -- Project information
    project_name VARCHAR(100) NOT NULL DEFAULT 'mock_train_reservation',
    project_version VARCHAR(20) DEFAULT '1.0',
    
    -- License dates
    purchase_date TIMESTAMP DEFAULT NOW(),
    expiry_date TIMESTAMP NOT NULL,
    
    -- License status: active, expired, revoked, suspended
    status VARCHAR(20) DEFAULT 'active',
    
    -- Machine binding (optional)
    fingerprint VARCHAR(255),
    
    -- Usage tracking
    last_used_at TIMESTAMP,
    usage_count INTEGER DEFAULT 0,
    
    -- Payment info (optional)
    order_id VARCHAR(100),
    payment_id VARCHAR(100),
    amount_paid DECIMAL(10, 2),
    
    -- Metadata
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for license key lookups
CREATE INDEX IF NOT EXISTS idx_student_licenses_key ON student_licenses(license_key);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_student_licenses_email ON student_licenses(student_email);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_student_licenses_status ON student_licenses(status);

-- =====================================================
-- SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert demo license key
INSERT INTO student_licenses (
    license_key, 
    student_name, 
    student_email, 
    project_name,
    expiry_date,
    status
) VALUES (
    'DEMO_LICENSE_KEY_1234',
    'Demo Student',
    'demo@serverpe.in',
    'mock_train_reservation',
    NOW() + INTERVAL '1 year',
    'active'
) ON CONFLICT (license_key) DO NOTHING;

-- Insert ServerPE demo key
INSERT INTO student_licenses (
    license_key, 
    student_name, 
    student_email, 
    project_name,
    expiry_date,
    status
) VALUES (
    'SERVERPE_DEMO_KEY',
    'ServerPE Demo',
    'support@serverpe.in',
    'mock_train_reservation',
    NOW() + INTERVAL '10 years',
    'active'
) ON CONFLICT (license_key) DO NOTHING;

-- =====================================================
-- HELPER FUNCTION TO GENERATE LICENSE KEY
-- =====================================================
CREATE OR REPLACE FUNCTION generate_license_key()
RETURNS VARCHAR(32) AS $$
DECLARE
    chars VARCHAR(36) := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result VARCHAR(32) := 'SRV-';
    i INTEGER;
BEGIN
    FOR i IN 1..24 LOOP
        IF i IN (5, 10, 15, 20) THEN
            result := result || '-';
        END IF;
        result := result || substr(chars, floor(random() * 36)::integer + 1, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE student_licenses IS 
'Stores API keys/licenses for students who purchase projects';

COMMENT ON COLUMN student_licenses.license_key IS 
'Unique API key used by student frontend to authenticate with backend';

COMMENT ON COLUMN student_licenses.fingerprint IS 
'Optional machine fingerprint to bind license to specific device';
