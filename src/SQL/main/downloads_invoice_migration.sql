-- =====================================================
-- DOWNLOADS AND INVOICE PDF MIGRATION
-- =====================================================
-- Adds zip path columns and invoice pdf path
-- =====================================================

-- 1. Add zip paths to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS zip_path_fullstack VARCHAR(500);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS zip_path_ui_only VARCHAR(500);

-- 2. Add invoice_pdf_path to invoices table (if not exists)
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_pdf_path VARCHAR(500);

-- =====================================================
-- UPDATE MOCK TRAIN PROJECT WITH ZIP PATHS (SAFENED)
-- =====================================================

DO $$
BEGIN
    -- Only run updates if project_type column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='projects' AND column_name='project_type') THEN
               
        -- Update Full Stack project
        UPDATE projects 
        SET 
            zip_path_fullstack = 'src/secure-storage/dowloads/projects/mock_train_fullstack/mock_train_fullstack_v1.0.zip',
            zip_path_ui_only = NULL
        WHERE LOWER(title) LIKE '%mock train%' 
          AND project_type = 'FULL_STACK';

        -- Update UI Only project
        UPDATE projects 
        SET 
            zip_path_fullstack = NULL,
            zip_path_ui_only = 'src/secure-storage/dowloads/projects/mock_train_ui_only/mock_train_ui_only_v1.0.zip'
        WHERE LOWER(title) LIKE '%mock train%' 
          AND project_type = 'UI_ONLY';
          
    ELSE
        -- Fallback: Update based on title only if column missing
        UPDATE projects 
        SET 
            zip_path_fullstack = 'src/secure-storage/dowloads/projects/mock_train_fullstack/mock_train_fullstack_v1.0.zip'
        WHERE LOWER(title) LIKE '%mock train%' AND LOWER(title) NOT LIKE '%ui only%';
    END IF;
END$$;
