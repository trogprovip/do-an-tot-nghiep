-- Add avatar_url and update_at fields to accounts table
ALTER TABLE accounts 
ADD COLUMN avatar_url VARCHAR(255) NULL,
ADD COLUMN update_at DATETIME NULL;
