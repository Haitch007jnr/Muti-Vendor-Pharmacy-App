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

-- Insert system roles
INSERT INTO roles (id, name, display_name, description, is_system) VALUES
(uuid_generate_v4(), 'super_admin', 'Super Administrator', 'Full system access and control', TRUE),
(uuid_generate_v4(), 'admin', 'Administrator', 'Platform administration access', TRUE),
(uuid_generate_v4(), 'vendor', 'Vendor', 'Store owner with full vendor access', TRUE),
(uuid_generate_v4(), 'vendor_manager', 'Vendor Manager', 'Manage vendor operations', TRUE),
(uuid_generate_v4(), 'vendor_staff', 'Vendor Staff', 'Limited vendor operations', TRUE),
(uuid_generate_v4(), 'customer', 'Customer', 'Shopping and order management', TRUE),
(uuid_generate_v4(), 'delivery', 'Delivery Personnel', 'Order delivery and tracking', TRUE);

-- Insert system permissions
INSERT INTO permissions (name, display_name, description, resource, action) VALUES
-- User Management
('users.create', 'Create Users', 'Create new users', 'users', 'create'),
('users.read', 'View Users', 'View user information', 'users', 'read'),
('users.update', 'Update Users', 'Update user information', 'users', 'update'),
('users.delete', 'Delete Users', 'Delete users', 'users', 'delete'),
('users.manage_roles', 'Manage User Roles', 'Assign/revoke user roles', 'users', 'manage_roles'),

-- Vendor Management
('vendors.create', 'Create Vendors', 'Create new vendors', 'vendors', 'create'),
('vendors.read', 'View Vendors', 'View vendor information', 'vendors', 'read'),
('vendors.update', 'Update Vendors', 'Update vendor information', 'vendors', 'update'),
('vendors.delete', 'Delete Vendors', 'Delete vendors', 'vendors', 'delete'),
('vendors.verify', 'Verify Vendors', 'Verify vendor accounts', 'vendors', 'verify'),

-- Product Management
('products.create', 'Create Products', 'Create new products', 'products', 'create'),
('products.read', 'View Products', 'View product information', 'products', 'read'),
('products.update', 'Update Products', 'Update product information', 'products', 'update'),
('products.delete', 'Delete Products', 'Delete products', 'products', 'delete'),

-- Order Management
('orders.create', 'Create Orders', 'Create new orders', 'orders', 'create'),
('orders.read', 'View Orders', 'View order information', 'orders', 'read'),
('orders.update', 'Update Orders', 'Update order status', 'orders', 'update'),
('orders.cancel', 'Cancel Orders', 'Cancel orders', 'orders', 'cancel'),

-- Payment Management
('payments.process', 'Process Payments', 'Process payment transactions', 'payments', 'process'),
('payments.refund', 'Refund Payments', 'Refund payments', 'payments', 'refund'),
('payments.read', 'View Payments', 'View payment information', 'payments', 'read'),

-- Inventory Management
('inventory.create', 'Create Inventory', 'Add inventory items', 'inventory', 'create'),
('inventory.read', 'View Inventory', 'View inventory information', 'inventory', 'read'),
('inventory.update', 'Update Inventory', 'Update inventory levels', 'inventory', 'update'),
('inventory.delete', 'Delete Inventory', 'Remove inventory items', 'inventory', 'delete'),

-- Reports & Analytics
('reports.view', 'View Reports', 'View system reports', 'reports', 'view'),
('reports.export', 'Export Reports', 'Export reports data', 'reports', 'export'),

-- System Settings
('settings.read', 'View Settings', 'View system settings', 'settings', 'read'),
('settings.update', 'Update Settings', 'Update system settings', 'settings', 'update');

-- Assign permissions to Super Admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'super_admin';

-- Assign permissions to Admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'admin'
AND p.resource IN ('users', 'vendors', 'products', 'orders', 'payments', 'inventory', 'reports');

-- Assign permissions to Vendor role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'vendor'
AND p.resource IN ('products', 'orders', 'inventory', 'reports')
AND p.action IN ('create', 'read', 'update');

-- Assign permissions to Customer role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'customer'
AND (
    (p.resource = 'products' AND p.action = 'read')
    OR (p.resource = 'orders' AND p.action IN ('create', 'read'))
);

-- Assign permissions to Delivery role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'delivery'
AND p.resource = 'orders'
AND p.action IN ('read', 'update');

-- Note: In production, you should:
-- 1. Remove these seed credentials
-- 2. Use strong, unique passwords
-- 3. Implement proper user creation workflows
-- 4. Enable multi-factor authentication
