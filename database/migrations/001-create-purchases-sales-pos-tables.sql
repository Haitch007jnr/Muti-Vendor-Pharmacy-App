-- Phase 3: Financial Operations Database Migration
-- Adds tables for Purchase Management, Sales Management, and POS

-- Create ENUM types for purchases, sales, and POS
CREATE TYPE purchase_status AS ENUM ('draft', 'pending', 'approved', 'received', 'cancelled');
CREATE TYPE sales_status AS ENUM ('quotation', 'confirmed', 'invoiced', 'paid', 'cancelled', 'returned');
CREATE TYPE pos_session_status AS ENUM ('open', 'closed');

-- Purchases Table
CREATE TABLE purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_number VARCHAR(50) UNIQUE NOT NULL,
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    status purchase_status NOT NULL DEFAULT 'draft',
    purchase_date DATE NOT NULL,
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    shipping_cost DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    payment_method payment_method,
    payment_status payment_status DEFAULT 'pending',
    payment_terms TEXT,
    notes TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP,
    received_by UUID REFERENCES users(id) ON DELETE SET NULL,
    received_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Purchase Items Table
CREATE TABLE purchase_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_id UUID REFERENCES purchases(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    quantity INT NOT NULL,
    unit_cost DECIMAL(10,2) NOT NULL,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    tax_percentage DECIMAL(5,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    subtotal DECIMAL(15,2) NOT NULL,
    batch_number VARCHAR(100),
    expiry_date DATE,
    received_quantity INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sales Table
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sales_number VARCHAR(50) UNIQUE NOT NULL,
    invoice_number VARCHAR(50) UNIQUE,
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status sales_status NOT NULL DEFAULT 'quotation',
    sales_date DATE NOT NULL,
    due_date DATE,
    subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    paid_amount DECIMAL(15,2) DEFAULT 0,
    balance_due DECIMAL(15,2) DEFAULT 0,
    payment_method payment_method,
    payment_status payment_status DEFAULT 'pending',
    payment_terms TEXT,
    notes TEXT,
    customer_notes TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP,
    invoiced_at TIMESTAMP,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sales Items Table
CREATE TABLE sales_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sales_id UUID REFERENCES sales(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    tax_percentage DECIMAL(5,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    subtotal DECIMAL(15,2) NOT NULL,
    batch_number VARCHAR(100),
    returned_quantity INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- POS Sessions Table
CREATE TABLE pos_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_number VARCHAR(50) UNIQUE NOT NULL,
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    cashier_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status pos_session_status NOT NULL DEFAULT 'open',
    opening_balance DECIMAL(15,2) NOT NULL DEFAULT 0,
    closing_balance DECIMAL(15,2),
    expected_balance DECIMAL(15,2),
    cash_sales DECIMAL(15,2) DEFAULT 0,
    card_sales DECIMAL(15,2) DEFAULT 0,
    bank_transfer_sales DECIMAL(15,2) DEFAULT 0,
    total_sales DECIMAL(15,2) DEFAULT 0,
    total_transactions INT DEFAULT 0,
    notes TEXT,
    opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- POS Transactions Table (linked to sales for detailed tracking)
CREATE TABLE pos_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_number VARCHAR(50) UNIQUE NOT NULL,
    session_id UUID REFERENCES pos_sessions(id) ON DELETE CASCADE,
    sales_id UUID REFERENCES sales(id) ON DELETE SET NULL,
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    cashier_id UUID REFERENCES users(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    subtotal DECIMAL(15,2) NOT NULL,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    amount_paid DECIMAL(15,2) NOT NULL,
    change_amount DECIMAL(15,2) DEFAULT 0,
    payment_method payment_method NOT NULL,
    receipt_printed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_purchases_vendor_id ON purchases(vendor_id);
CREATE INDEX idx_purchases_supplier_id ON purchases(supplier_id);
CREATE INDEX idx_purchases_status ON purchases(status);
CREATE INDEX idx_purchases_purchase_date ON purchases(purchase_date);
CREATE INDEX idx_purchases_purchase_number ON purchases(purchase_number);
CREATE INDEX idx_purchase_items_purchase_id ON purchase_items(purchase_id);
CREATE INDEX idx_purchase_items_product_id ON purchase_items(product_id);

CREATE INDEX idx_sales_vendor_id ON sales(vendor_id);
CREATE INDEX idx_sales_client_id ON sales(client_id);
CREATE INDEX idx_sales_customer_id ON sales(customer_id);
CREATE INDEX idx_sales_status ON sales(status);
CREATE INDEX idx_sales_sales_date ON sales(sales_date);
CREATE INDEX idx_sales_sales_number ON sales(sales_number);
CREATE INDEX idx_sales_invoice_number ON sales(invoice_number);
CREATE INDEX idx_sales_items_sales_id ON sales_items(sales_id);
CREATE INDEX idx_sales_items_product_id ON sales_items(product_id);

CREATE INDEX idx_pos_sessions_vendor_id ON pos_sessions(vendor_id);
CREATE INDEX idx_pos_sessions_cashier_id ON pos_sessions(cashier_id);
CREATE INDEX idx_pos_sessions_status ON pos_sessions(status);
CREATE INDEX idx_pos_sessions_opened_at ON pos_sessions(opened_at);
CREATE INDEX idx_pos_transactions_session_id ON pos_transactions(session_id);
CREATE INDEX idx_pos_transactions_sales_id ON pos_transactions(sales_id);
CREATE INDEX idx_pos_transactions_vendor_id ON pos_transactions(vendor_id);
CREATE INDEX idx_pos_transactions_transaction_number ON pos_transactions(transaction_number);

-- Apply updated_at triggers
CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON purchases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pos_sessions_updated_at BEFORE UPDATE ON pos_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
