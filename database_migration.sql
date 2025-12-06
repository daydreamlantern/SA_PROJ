-- Migration script to add date fields to existing leave_requests table
-- Run this if you already have the database set up
-- Note: If you get an error that columns already exist, that's okay - just skip those lines

USE employee_leave_db;

-- Add start_date column (ignore error if it already exists)
ALTER TABLE leave_requests 
ADD COLUMN start_date DATE AFTER reason;

-- Add end_date column (ignore error if it already exists)
ALTER TABLE leave_requests 
ADD COLUMN end_date DATE AFTER start_date;

-- Update existing records to have today's date as both start and end date
UPDATE leave_requests 
SET start_date = CURDATE(), end_date = CURDATE() 
WHERE start_date IS NULL OR end_date IS NULL;

-- Make the columns NOT NULL after setting default values
ALTER TABLE leave_requests 
MODIFY COLUMN start_date DATE NOT NULL,
MODIFY COLUMN end_date DATE NOT NULL;
