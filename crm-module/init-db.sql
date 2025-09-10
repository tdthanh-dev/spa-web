-- Database initialization script for CRM Spa Dr. Oha
-- This script creates the necessary schemas and initial data

-- Create schemas
CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS lead;
CREATE SCHEMA IF NOT EXISTS service;
CREATE SCHEMA IF NOT EXISTS billing;
CREATE SCHEMA IF NOT EXISTS audit;

-- Set default search path
SET search_path TO core,lead,service,billing,audit,public;

-- Note: The actual table creation will be handled by JPA/Hibernate
-- This file is mainly for any custom initialization if needed

-- Create extension for UUID if needed (optional)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create extension for full-text search (optional)
-- CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Grant permissions (adjust as needed)
-- GRANT ALL PRIVILEGES ON SCHEMA core TO postgres;
-- GRANT ALL PRIVILEGES ON SCHEMA lead TO postgres;
-- GRANT ALL PRIVILEGES ON SCHEMA service TO postgres;
-- GRANT ALL PRIVILEGES ON SCHEMA billing TO postgres;
-- GRANT ALL PRIVILEGES ON SCHEMA audit TO postgres;

-- Optional: Create a read-only user for reporting
-- CREATE USER crm_readonly WITH PASSWORD 'readonly123';
-- GRANT CONNECT ON DATABASE crm_spa TO crm_readonly;
-- GRANT USAGE ON SCHEMA core TO crm_readonly;
-- GRANT USAGE ON SCHEMA lead TO crm_readonly;
-- GRANT USAGE ON SCHEMA service TO crm_readonly;
-- GRANT USAGE ON SCHEMA billing TO crm_readonly;
-- GRANT USAGE ON SCHEMA audit TO crm_readonly;
-- GRANT SELECT ON ALL TABLES IN SCHEMA core TO crm_readonly;
-- GRANT SELECT ON ALL TABLES IN SCHEMA lead TO crm_readonly;
-- GRANT SELECT ON ALL TABLES IN SCHEMA service TO crm_readonly;
-- GRANT SELECT ON ALL TABLES IN SCHEMA billing TO crm_readonly;
-- GRANT SELECT ON ALL TABLES IN SCHEMA audit TO crm_readonly;

-- Log successful initialization
DO $$
BEGIN
    RAISE NOTICE 'CRM Spa Database initialized successfully at %', now();
END $$;
