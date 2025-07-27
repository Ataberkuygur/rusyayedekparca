-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    role VARCHAR(20) NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    permissions TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inventory table for stock management
CREATE TABLE IF NOT EXISTS inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE UNIQUE,
    quantity INTEGER NOT NULL DEFAULT 0,
    reserved_quantity INTEGER NOT NULL DEFAULT 0,
    available_quantity INTEGER NOT NULL DEFAULT 0,
    minimum_stock INTEGER NOT NULL DEFAULT 5,
    maximum_stock INTEGER NOT NULL DEFAULT 1000,
    reorder_point INTEGER NOT NULL DEFAULT 10,
    location VARCHAR(100) DEFAULT 'Ana Depo',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Admin activity logs
CREATE TABLE IF NOT EXISTS admin_activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add admin_notes column to orders table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'admin_notes') THEN
        ALTER TABLE orders ADD COLUMN admin_notes TEXT;
    END IF;
END $$;

-- Function to automatically calculate available quantity
CREATE OR REPLACE FUNCTION calculate_available_quantity()
RETURNS TRIGGER AS $$
BEGIN
    NEW.available_quantity = NEW.quantity - NEW.reserved_quantity;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to sync product quantity with inventory
CREATE OR REPLACE FUNCTION sync_product_inventory()
RETURNS TRIGGER AS $$
BEGIN
    -- Update product quantity when inventory changes
    UPDATE products 
    SET quantity = NEW.quantity,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.product_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to log admin activities
CREATE OR REPLACE FUNCTION log_admin_activity()
RETURNS TRIGGER AS $$
DECLARE
    admin_id UUID;
BEGIN
    -- Get admin user ID from current session (simplified approach)
    -- In production, this should be properly handled by the application
    
    INSERT INTO admin_activity_logs (
        admin_user_id,
        action,
        resource_type,
        resource_id,
        details,
        created_at
    ) VALUES (
        COALESCE(current_setting('app.admin_user_id', true)::UUID, gen_random_uuid()),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE 
            WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD)
            ELSE to_jsonb(NEW)
        END,
        CURRENT_TIMESTAMP
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_calculate_available_quantity ON inventory;
CREATE TRIGGER trigger_calculate_available_quantity
    BEFORE INSERT OR UPDATE ON inventory
    FOR EACH ROW
    EXECUTE FUNCTION calculate_available_quantity();

DROP TRIGGER IF EXISTS trigger_sync_product_inventory ON inventory;
CREATE TRIGGER trigger_sync_product_inventory
    AFTER INSERT OR UPDATE ON inventory
    FOR EACH ROW
    EXECUTE FUNCTION sync_product_inventory();

-- Create triggers for admin activity logging
DROP TRIGGER IF EXISTS trigger_log_product_activity ON products;
CREATE TRIGGER trigger_log_product_activity
    AFTER INSERT OR UPDATE OR DELETE ON products
    FOR EACH ROW
    EXECUTE FUNCTION log_admin_activity();

DROP TRIGGER IF EXISTS trigger_log_order_activity ON orders;
CREATE TRIGGER trigger_log_order_activity
    AFTER UPDATE ON orders
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status OR OLD.admin_notes IS DISTINCT FROM NEW.admin_notes)
    EXECUTE FUNCTION log_admin_activity();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_quantity ON inventory(quantity);
CREATE INDEX IF NOT EXISTS idx_inventory_available_quantity ON inventory(available_quantity);
CREATE INDEX IF NOT EXISTS idx_inventory_reorder_point ON inventory(quantity, reorder_point) WHERE quantity <= reorder_point;
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_admin_user_id ON admin_activity_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_created_at ON admin_activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_resource ON admin_activity_logs(resource_type, resource_id);

-- Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin_users
CREATE POLICY "Only super admins can view admin users" ON admin_users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.user_id = auth.uid() AND au.role = 'super_admin'
        )
    );

CREATE POLICY "Only super admins can manage admin users" ON admin_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.user_id = auth.uid() AND au.role = 'super_admin'
        )
    );

-- Create RLS policies for inventory
CREATE POLICY "Admins can view inventory" ON inventory
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage inventory" ON inventory
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.user_id = auth.uid()
        )
    );

-- Create RLS policies for admin_activity_logs
CREATE POLICY "Admins can view activity logs" ON admin_activity_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.user_id = auth.uid()
        )
    );

-- Insert default super admin (replace with actual admin email)
INSERT INTO admin_users (user_id, role, permissions, created_at)
SELECT 
    u.id,
    'super_admin',
    ARRAY['users:read', 'users:write', 'products:read', 'products:write', 'orders:read', 'orders:write', 'inventory:read', 'inventory:write', 'reports:read', 'admin:read', 'admin:write'],
    CURRENT_TIMESTAMP
FROM auth.users u
WHERE u.email = 'admin@yedekparca.com'
ON CONFLICT (user_id) DO NOTHING;

-- Create view for low stock alerts
CREATE OR REPLACE VIEW low_stock_alerts AS
SELECT 
    p.id,
    p.name,
    p.sku,
    i.quantity,
    i.minimum_stock,
    i.reorder_point,
    i.location,
    (i.minimum_stock - i.quantity) as shortage_amount
FROM products p
JOIN inventory i ON p.id = i.product_id
WHERE i.quantity <= i.reorder_point
ORDER BY (i.minimum_stock - i.quantity) DESC;

-- Create view for inventory summary
CREATE OR REPLACE VIEW inventory_summary AS
SELECT 
    p.id as product_id,
    p.name,
    p.sku,
    p.price,
    c.name as category_name,
    i.quantity,
    i.reserved_quantity,
    i.available_quantity,
    i.minimum_stock,
    i.maximum_stock,
    i.reorder_point,
    i.location,
    CASE 
        WHEN i.quantity <= 0 THEN 'out_of_stock'
        WHEN i.quantity <= i.reorder_point THEN 'low_stock'
        WHEN i.quantity >= i.maximum_stock THEN 'overstock'
        ELSE 'normal'
    END as stock_status,
    i.last_updated
FROM products p
JOIN inventory i ON p.id = i.product_id
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.is_active = true
ORDER BY i.last_updated DESC;
