-- =====================================================
-- CRM MODULE DATA CLEANUP SCRIPT
-- Xóa tất cả dữ liệu theo đúng thứ tự để tránh foreign key constraints
-- =====================================================

-- Disable foreign key checks temporarily
SET session_replication_role = 'replica';

-- =====================================================
-- 1. AUDIT SCHEMA - Xóa trước vì không có foreign keys
-- =====================================================
TRUNCATE TABLE audit.audit_log CASCADE;
TRUNCATE TABLE audit.task CASCADE;
TRUNCATE TABLE audit.retouch_schedule CASCADE;

-- =====================================================
-- 2. BILLING SCHEMA - Xóa payments trước, sau đó invoices
-- =====================================================
TRUNCATE TABLE billing.payment CASCADE;
TRUNCATE TABLE billing.point_transaction CASCADE;
TRUNCATE TABLE billing.invoice CASCADE;

-- =====================================================
-- 3. SERVICE SCHEMA - Xóa case photos, notes, services trước
-- =====================================================
TRUNCATE TABLE service.case_photo CASCADE;
TRUNCATE TABLE service.technician_note CASCADE;
TRUNCATE TABLE service.case_service CASCADE;
TRUNCATE TABLE service.customer_case CASCADE;

-- =====================================================
-- 4. LEAD SCHEMA - Xóa appointments trước, sau đó leads
-- =====================================================
TRUNCATE TABLE lead.appointment CASCADE;
TRUNCATE TABLE lead.lead CASCADE;

-- =====================================================
-- 5. CORE SCHEMA - Xóa theo thứ tự dependencies
-- =====================================================
-- Xóa staff users (có foreign key đến role)
TRUNCATE TABLE core.staff_user CASCADE;

-- Xóa roles
TRUNCATE TABLE core.role CASCADE;

-- Xóa tiers và customers (customers có foreign key đến tier)
TRUNCATE TABLE core.customer CASCADE;
TRUNCATE TABLE core.tier CASCADE;

-- =====================================================
-- Re-enable foreign key checks
-- =====================================================
SET session_replication_role = 'origin';

-- =====================================================
-- Reset sequences về 1 (optional)
-- =====================================================
-- Core Schema
ALTER SEQUENCE core.customer_seq RESTART WITH 1;
ALTER SEQUENCE core.staff_user_seq RESTART WITH 1;
ALTER SEQUENCE core.role_seq RESTART WITH 1;
ALTER SEQUENCE core.tier_seq RESTART WITH 1;

-- Lead Schema
ALTER SEQUENCE lead.lead_seq RESTART WITH 1;
ALTER SEQUENCE lead.appointment_seq RESTART WITH 1;

-- Service Schema
ALTER SEQUENCE service.customer_case_seq RESTART WITH 1;

-- Billing Schema
ALTER SEQUENCE billing.invoice_seq RESTART WITH 1;

-- Audit Schema
-- (Không có sequences trong audit schema)

COMMIT;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Uncomment để kiểm tra sau khi chạy script:
/*
SELECT 'core.customer' as table_name, COUNT(*) as count FROM core.customer
UNION ALL
SELECT 'core.staff_user', COUNT(*) FROM core.staff_user
UNION ALL
SELECT 'core.role', COUNT(*) FROM core.role
UNION ALL
SELECT 'core.tier', COUNT(*) FROM core.tier
UNION ALL
SELECT 'lead.lead', COUNT(*) FROM lead.lead
UNION ALL
SELECT 'lead.appointment', COUNT(*) FROM lead.appointment
UNION ALL
SELECT 'service.customer_case', COUNT(*) FROM service.customer_case
UNION ALL
SELECT 'billing.invoice', COUNT(*) FROM billing.invoice
UNION ALL
SELECT 'audit.audit_log', COUNT(*) FROM audit.audit_log;
*/