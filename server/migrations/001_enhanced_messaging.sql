-- Enhanced Messaging System Database Schema
-- Run this migration to add enhanced messaging capabilities

-- Add columns to existing messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS message_type VARCHAR(50) DEFAULT 'text';
ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachments JSONB;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMP;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_scheduled BOOLEAN DEFAULT FALSE;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMP;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS template_id INTEGER;

-- Create message templates table
CREATE TABLE IF NOT EXISTS message_templates (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER REFERENCES owners(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    content TEXT NOT NULL,
    category VARCHAR(100), -- 'welcome', 'checkin', 'checkout', 'general'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create message attachments table
CREATE TABLE IF NOT EXISTS message_attachments (
    id SERIAL PRIMARY KEY,
    message_id INTEGER REFERENCES messages(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_size INTEGER,
    file_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create scheduled messages table
CREATE TABLE IF NOT EXISTS scheduled_messages (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    template_id INTEGER REFERENCES message_templates(id),
    trigger_type VARCHAR(50), -- 'days_before_checkin', 'checkin_day', 'days_after_checkout'
    trigger_offset INTEGER, -- number of days
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sent', 'failed'
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_booking_read ON messages(booking_id, is_read);
CREATE INDEX IF NOT EXISTS idx_scheduled_messages_status ON scheduled_messages(status, trigger_type);
CREATE INDEX IF NOT EXISTS idx_message_templates_owner ON message_templates(owner_id, category);