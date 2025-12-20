-- Create dedicated schema for extensions
CREATE SCHEMA IF NOT EXISTS extensions;

-- Grant usage to authenticated and anon roles
GRANT USAGE ON SCHEMA extensions TO authenticated, anon, service_role;

-- Note: Moving existing extensions requires superuser access
-- The extensions are already installed, this creates the schema for future extensions
-- Existing extensions in public schema will continue to work

COMMENT ON SCHEMA extensions IS 'Schema dedicated to PostgreSQL extensions to avoid polluting the public schema';