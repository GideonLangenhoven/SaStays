-- POPIA Compliance Database Schema
-- Implements South African Protection of Personal Information Act (POPIA) requirements

-- Create data processing purposes table
CREATE TABLE IF NOT EXISTS data_processing_purposes (
    id SERIAL PRIMARY KEY,
    purpose_code VARCHAR(50) UNIQUE NOT NULL,
    purpose_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    legal_basis VARCHAR(100) NOT NULL, -- 'consent', 'contract', 'legal_obligation', 'vital_interests', 'public_task', 'legitimate_interests'
    retention_period INTEGER, -- in days
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert standard processing purposes
INSERT INTO data_processing_purposes (purpose_code, purpose_name, description, legal_basis, retention_period) VALUES
('BOOKING', 'Booking Management', 'Process bookings and provide accommodation services', 'contract', 2555), -- 7 years
('MARKETING', 'Marketing Communications', 'Send promotional materials and offers', 'consent', 1095), -- 3 years
('ANALYTICS', 'Business Analytics', 'Analyze usage patterns and improve services', 'legitimate_interests', 1095),
('COMPLIANCE', 'Legal Compliance', 'Meet legal and regulatory requirements', 'legal_obligation', 2555),
('SUPPORT', 'Customer Support', 'Provide customer service and support', 'contract', 1825), -- 5 years
('SECURITY', 'Security and Fraud Prevention', 'Protect against fraud and security threats', 'legitimate_interests', 1095);

-- Create consent records table
CREATE TABLE IF NOT EXISTS consent_records (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    purpose_code VARCHAR(50) REFERENCES data_processing_purposes(purpose_code),
    consent_given BOOLEAN NOT NULL,
    consent_method VARCHAR(50) NOT NULL, -- 'explicit', 'implicit', 'opt_in', 'opt_out'
    consent_source VARCHAR(100), -- 'website', 'mobile_app', 'email', 'phone', 'in_person'
    consent_timestamp TIMESTAMP NOT NULL,
    withdrawal_timestamp TIMESTAMP,
    withdrawal_method VARCHAR(50),
    ip_address INET,
    user_agent TEXT,
    additional_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(customer_id, purpose_code, consent_timestamp)
);

-- Create data retention policies table
CREATE TABLE IF NOT EXISTS data_retention_policies (
    id SERIAL PRIMARY KEY,
    data_category VARCHAR(100) NOT NULL,
    retention_period INTEGER NOT NULL, -- in days
    deletion_method VARCHAR(50) NOT NULL, -- 'automatic', 'manual', 'anonymize'
    last_review_date DATE,
    next_review_date DATE,
    policy_description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert standard retention policies
INSERT INTO data_retention_policies (data_category, retention_period, deletion_method, policy_description) VALUES
('personal_information', 2555, 'anonymize', 'Customer personal information retained for 7 years after last interaction'),
('payment_data', 2555, 'automatic', 'Payment information retained for 7 years for compliance'),
('communication_logs', 1825, 'automatic', 'Email and message logs retained for 5 years'),
('usage_analytics', 1095, 'anonymize', 'Anonymized usage data retained for 3 years'),
('marketing_preferences', 1095, 'automatic', 'Marketing consent data retained for 3 years');

-- Create data access requests table (for POPIA access rights)
CREATE TABLE IF NOT EXISTS data_access_requests (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    request_type VARCHAR(50) NOT NULL, -- 'access', 'portability', 'rectification', 'erasure', 'restriction'
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    request_details TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'rejected'
    response_date TIMESTAMP,
    response_details TEXT,
    processed_by INTEGER REFERENCES owners(id),
    verification_method VARCHAR(100),
    verification_date TIMESTAMP,
    completion_date TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create data breach log table
CREATE TABLE IF NOT EXISTS data_breach_log (
    id SERIAL PRIMARY KEY,
    breach_reference VARCHAR(100) UNIQUE NOT NULL,
    detection_date TIMESTAMP NOT NULL,
    breach_type VARCHAR(100) NOT NULL, -- 'confidentiality', 'integrity', 'availability'
    severity_level VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    affected_data_categories TEXT[],
    affected_individuals_count INTEGER DEFAULT 0,
    description TEXT NOT NULL,
    cause TEXT,
    immediate_actions TEXT,
    containment_date TIMESTAMP,
    risk_assessment TEXT,
    notification_required BOOLEAN DEFAULT FALSE,
    regulator_notified BOOLEAN DEFAULT FALSE,
    regulator_notification_date TIMESTAMP,
    individuals_notified BOOLEAN DEFAULT FALSE,
    individuals_notification_date TIMESTAMP,
    resolution_date TIMESTAMP,
    lessons_learned TEXT,
    status VARCHAR(50) DEFAULT 'open', -- 'open', 'contained', 'resolved', 'closed'
    created_by INTEGER REFERENCES owners(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create privacy audit trail table
CREATE TABLE IF NOT EXISTS privacy_audit_trail (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    action_type VARCHAR(100) NOT NULL, -- 'data_created', 'data_accessed', 'data_modified', 'data_deleted', 'consent_given', 'consent_withdrawn'
    data_category VARCHAR(100),
    field_name VARCHAR(100),
    old_value TEXT,
    new_value TEXT,
    action_by INTEGER, -- NULL for system actions
    action_source VARCHAR(100), -- 'system', 'admin', 'customer', 'api'
    ip_address INET,
    user_agent TEXT,
    purpose_code VARCHAR(50) REFERENCES data_processing_purposes(purpose_code),
    legal_basis VARCHAR(100),
    additional_context JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add POPIA-related columns to existing customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS data_processing_consent JSONB DEFAULT '{}';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT FALSE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS marketing_consent_date TIMESTAMP;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS privacy_policy_version VARCHAR(10);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS privacy_policy_accepted_date TIMESTAMP;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_consent_review TIMESTAMP;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS data_retention_expiry DATE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS anonymization_date TIMESTAMP;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS deletion_scheduled_date DATE;

-- Create privacy settings table for granular consent management
CREATE TABLE IF NOT EXISTS customer_privacy_settings (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    allow_marketing_emails BOOLEAN DEFAULT FALSE,
    allow_marketing_sms BOOLEAN DEFAULT FALSE,
    allow_promotional_calls BOOLEAN DEFAULT FALSE,
    allow_analytics_tracking BOOLEAN DEFAULT TRUE,
    allow_personalization BOOLEAN DEFAULT TRUE,
    allow_third_party_sharing BOOLEAN DEFAULT FALSE,
    data_retention_preference VARCHAR(50) DEFAULT 'standard', -- 'minimal', 'standard', 'extended'
    communication_frequency VARCHAR(50) DEFAULT 'normal', -- 'minimal', 'normal', 'frequent'
    preferred_contact_method VARCHAR(50) DEFAULT 'email', -- 'email', 'sms', 'phone', 'post'
    privacy_level VARCHAR(50) DEFAULT 'standard', -- 'minimal', 'standard', 'enhanced'
    settings_last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(customer_id)
);

-- Create function to automatically anonymize expired data
CREATE OR REPLACE FUNCTION anonymize_expired_customer_data()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER := 0;
    customer_record RECORD;
BEGIN
    -- Find customers whose data retention period has expired
    FOR customer_record IN 
        SELECT id, email, full_name 
        FROM customers 
        WHERE data_retention_expiry <= CURRENT_DATE 
        AND anonymization_date IS NULL
    LOOP
        -- Anonymize personal data
        UPDATE customers 
        SET 
            email = 'anonymized_' || id || '@deleted.com',
            full_name = 'Anonymized User',
            phone_number = NULL,
            date_of_birth = NULL,
            address = NULL,
            anonymization_date = CURRENT_TIMESTAMP
        WHERE id = customer_record.id;
        
        -- Log the anonymization
        INSERT INTO privacy_audit_trail (
            customer_id, action_type, data_category, 
            action_source, additional_context
        ) VALUES (
            customer_record.id, 'data_anonymized', 'personal_information',
            'system', json_build_object('original_email', customer_record.email)
        );
        
        expired_count := expired_count + 1;
    END LOOP;
    
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to schedule data retention expiry
CREATE OR REPLACE FUNCTION set_data_retention_expiry()
RETURNS TRIGGER AS $$
BEGIN
    -- Set retention expiry date based on last activity
    NEW.data_retention_expiry := CURRENT_DATE + INTERVAL '7 years';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set retention expiry for new customers
CREATE TRIGGER set_customer_retention_expiry
    BEFORE INSERT ON customers
    FOR EACH ROW
    EXECUTE FUNCTION set_data_retention_expiry();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_consent_records_customer_purpose ON consent_records(customer_id, purpose_code);
CREATE INDEX IF NOT EXISTS idx_consent_records_timestamp ON consent_records(consent_timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_trail_customer_action ON privacy_audit_trail(customer_id, action_type);
CREATE INDEX IF NOT EXISTS idx_audit_trail_timestamp ON privacy_audit_trail(created_at);
CREATE INDEX IF NOT EXISTS idx_data_access_requests_status ON data_access_requests(status, customer_id);
CREATE INDEX IF NOT EXISTS idx_customers_retention_expiry ON customers(data_retention_expiry) WHERE data_retention_expiry IS NOT NULL;

-- Create view for POPIA compliance dashboard
CREATE OR REPLACE VIEW popia_compliance_summary AS
SELECT 
    (SELECT COUNT(*) FROM customers WHERE anonymization_date IS NULL) as active_customers,
    (SELECT COUNT(*) FROM customers WHERE anonymization_date IS NOT NULL) as anonymized_customers,
    (SELECT COUNT(*) FROM consent_records WHERE consent_given = true) as active_consents,
    (SELECT COUNT(*) FROM consent_records WHERE withdrawal_timestamp IS NOT NULL) as withdrawn_consents,
    (SELECT COUNT(*) FROM data_access_requests WHERE status = 'pending') as pending_requests,
    (SELECT COUNT(*) FROM customers WHERE data_retention_expiry <= CURRENT_DATE + INTERVAL '30 days') as expiring_soon,
    (SELECT COUNT(*) FROM data_breach_log WHERE status IN ('open', 'contained')) as active_breaches;

-- Add comment for documentation
COMMENT ON TABLE consent_records IS 'Tracks all consent given and withdrawn by customers for POPIA compliance';
COMMENT ON TABLE data_retention_policies IS 'Defines how long different categories of data should be retained';
COMMENT ON TABLE data_access_requests IS 'Records all customer requests for data access, rectification, erasure etc.';
COMMENT ON TABLE privacy_audit_trail IS 'Complete audit trail of all data processing activities';
COMMENT ON TABLE data_breach_log IS 'Records and tracks all data security incidents';