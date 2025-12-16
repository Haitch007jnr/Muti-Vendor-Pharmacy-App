-- Seed initial data for development

-- Insert default super admin user
INSERT INTO users (id, email, phone, password_hash, first_name, last_name, role, status, email_verified)
VALUES (
    uuid_generate_v4(),
    'admin@pharmacy.com',
    '+2348012345678',
    '$2b$10$YourHashedPasswordHere', -- Change this in production
    'Super',
    'Admin',
    'super_admin',
    'active',
    TRUE
);

-- Insert sample vendor user
INSERT INTO users (id, email, phone, password_hash, first_name, last_name, role, status, email_verified)
VALUES (
    uuid_generate_v4(),
    'vendor@pharmacy.com',
    '+2348087654321',
    '$2b$10$YourHashedPasswordHere', -- Change this in production
    'John',
    'Vendor',
    'vendor',
    'active',
    TRUE
);

-- Insert sample customer user
INSERT INTO users (id, email, phone, password_hash, first_name, last_name, role, status, email_verified)
VALUES (
    uuid_generate_v4(),
    'customer@pharmacy.com',
    '+2348098765432',
    '$2b$10$YourHashedPasswordHere', -- Change this in production
    'Jane',
    'Customer',
    'customer',
    'active',
    TRUE
);

-- Note: In production, you should:
-- 1. Remove these seed credentials
-- 2. Use strong, unique passwords
-- 3. Implement proper user creation workflows
-- 4. Enable multi-factor authentication
