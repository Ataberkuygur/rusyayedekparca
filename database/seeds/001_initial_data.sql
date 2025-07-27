-- Seed data for car parts e-commerce database
-- This file contains initial data for development and testing

-- Insert product categories
INSERT INTO product_categories (id, name, slug, description) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Engine Parts', 'engine-parts', 'Engine components and related parts'),
    ('550e8400-e29b-41d4-a716-446655440002', 'Transmission', 'transmission', 'Transmission and drivetrain components'),
    ('550e8400-e29b-41d4-a716-446655440003', 'Brakes', 'brakes', 'Brake system components'),
    ('550e8400-e29b-41d4-a716-446655440004', 'Suspension', 'suspension', 'Suspension and steering components'),
    ('550e8400-e29b-41d4-a716-446655440005', 'Electrical', 'electrical', 'Electrical system components'),
    ('550e8400-e29b-41d4-a716-446655440006', 'Body Parts', 'body-parts', 'Exterior and interior body components'),
    ('550e8400-e29b-41d4-a716-446655440007', 'Exhaust', 'exhaust', 'Exhaust system components'),
    ('550e8400-e29b-41d4-a716-446655440008', 'Cooling', 'cooling', 'Cooling system components');

-- Insert subcategories
INSERT INTO product_categories (id, name, slug, description, parent_id) VALUES
    ('550e8400-e29b-41d4-a716-446655440011', 'Air Filters', 'air-filters', 'Engine air filtration components', '550e8400-e29b-41d4-a716-446655440001'),
    ('550e8400-e29b-41d4-a716-446655440012', 'Oil Filters', 'oil-filters', 'Engine oil filtration components', '550e8400-e29b-41d4-a716-446655440001'),
    ('550e8400-e29b-41d4-a716-446655440013', 'Spark Plugs', 'spark-plugs', 'Engine ignition components', '550e8400-e29b-41d4-a716-446655440001'),
    ('550e8400-e29b-41d4-a716-446655440014', 'Brake Pads', 'brake-pads', 'Brake friction components', '550e8400-e29b-41d4-a716-446655440003'),
    ('550e8400-e29b-41d4-a716-446655440015', 'Brake Rotors', 'brake-rotors', 'Brake disc components', '550e8400-e29b-41d4-a716-446655440003'),
    ('550e8400-e29b-41d4-a716-446655440016', 'Struts', 'struts', 'Suspension strut components', '550e8400-e29b-41d4-a716-446655440004'),
    ('550e8400-e29b-41d4-a716-446655440017', 'Shocks', 'shocks', 'Shock absorber components', '550e8400-e29b-41d4-a716-446655440004');

-- Insert sample products
INSERT INTO products (id, sku, name, description, category_id, make, model, year, part_number, condition, price, original_price, quantity, weight, dimensions, specifications, is_active) VALUES
    (
        '660e8400-e29b-41d4-a716-446655440001',
        'AF-HON-CIV-2018-001',
        'Honda Civic Air Filter 2018-2022',
        'High-quality replacement air filter for Honda Civic 2018-2022. Improves engine performance and fuel efficiency.',
        '550e8400-e29b-41d4-a716-446655440011',
        'Honda',
        'Civic',
        2018,
        '17220-5AA-A00',
        'new',
        24.99,
        29.99,
        50,
        0.5,
        '{"length": 10.5, "width": 8.2, "height": 1.5, "unit": "in"}',
        '{"material": "High-flow paper", "filtration_efficiency": "99.5%", "service_interval": "12000_miles"}',
        true
    ),
    (
        '660e8400-e29b-41d4-a716-446655440002',
        'BP-TOY-CAM-2015-001',
        'Toyota Camry Brake Pads Front Set 2015-2020',
        'Premium ceramic brake pads for Toyota Camry front axle. Excellent stopping power and low dust.',
        '550e8400-e29b-41d4-a716-446655440014',
        'Toyota',
        'Camry',
        2015,
        '04465-06090',
        'new',
        89.99,
        109.99,
        25,
        3.2,
        '{"length": 12, "width": 6, "height": 2, "unit": "in"}',
        '{"material": "Ceramic", "noise_level": "Low", "dust_level": "Low", "temperature_range": "-40F to 800F"}',
        true
    ),
    (
        '660e8400-e29b-41d4-a716-446655440003',
        'OF-FOR-F150-2017-001',
        'Ford F-150 Oil Filter 2017-2023',
        'OEM quality oil filter for Ford F-150 with 3.5L EcoBoost engine. Ensures optimal engine protection.',
        '550e8400-e29b-41d4-a716-446655440012',
        'Ford',
        'F-150',
        2017,
        'FL-820-S',
        'new',
        12.99,
        16.99,
        75,
        0.8,
        '{"length": 4.5, "width": 4.5, "height": 6, "unit": "in"}',
        '{"thread_size": "3/4-16", "bypass_valve": "Yes", "anti_drainback_valve": "Yes"}',
        true
    ),
    (
        '660e8400-e29b-41d4-a716-446655440004',
        'ST-BMW-328-2014-001',
        'BMW 328i Front Strut Assembly 2014-2016',
        'Complete front strut assembly for BMW 328i. Includes spring and mount for easy installation.',
        '550e8400-e29b-41d4-a716-446655440016',
        'BMW',
        '328i',
        2014,
        '31316792205',
        'refurbished',
        189.99,
        299.99,
        8,
        12.5,
        '{"length": 24, "width": 6, "height": 6, "unit": "in"}',
        '{"type": "Gas-charged", "spring_rate": "Medium", "warranty": "12_months"}',
        true
    ),
    (
        '660e8400-e29b-41d4-a716-446655440005',
        'BR-CHV-SIL-2019-001',
        'Chevrolet Silverado Brake Rotor Rear 2019-2023',
        'High-carbon steel brake rotor for Chevrolet Silverado rear axle. Precision machined for smooth operation.',
        '550e8400-e29b-41d4-a716-446655440015',
        'Chevrolet',
        'Silverado',
        2019,
        '23380545',
        'used',
        65.99,
        89.99,
        12,
        18.5,
        '{"diameter": 13.6, "thickness": 1.1, "unit": "in"}',
        '{"material": "High-carbon steel", "venting": "Vented", "coating": "Zinc plated"}',
        true
    );

-- Insert product images
INSERT INTO product_images (id, product_id, url, alt_text, is_primary, order_index) VALUES
    ('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '/images/products/honda-civic-air-filter-main.jpg', 'Honda Civic Air Filter - Main View', true, 0),
    ('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', '/images/products/honda-civic-air-filter-side.jpg', 'Honda Civic Air Filter - Side View', false, 1),
    ('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440002', '/images/products/toyota-camry-brake-pads-main.jpg', 'Toyota Camry Brake Pads - Main View', true, 0),
    ('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440002', '/images/products/toyota-camry-brake-pads-detail.jpg', 'Toyota Camry Brake Pads - Detail View', false, 1),
    ('770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440003', '/images/products/ford-f150-oil-filter-main.jpg', 'Ford F-150 Oil Filter - Main View', true, 0),
    ('770e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440004', '/images/products/bmw-328i-strut-main.jpg', 'BMW 328i Front Strut - Main View', true, 0),
    ('770e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440004', '/images/products/bmw-328i-strut-installed.jpg', 'BMW 328i Front Strut - Installation View', false, 1),
    ('770e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440005', '/images/products/chevy-silverado-rotor-main.jpg', 'Chevrolet Silverado Brake Rotor - Main View', true, 0);

-- Insert vehicle compatibility data
INSERT INTO vehicle_compatibility (id, product_id, make, model, year_start, year_end, engine, trim) VALUES
    ('880e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Honda', 'Civic', 2018, 2022, '1.5L Turbo', 'LX'),
    ('880e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'Honda', 'Civic', 2018, 2022, '1.5L Turbo', 'EX'),
    ('880e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', 'Honda', 'Civic', 2018, 2022, '1.5L Turbo', 'EX-L'),
    ('880e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', 'Honda', 'Civic', 2018, 2022, '2.0L', 'Sport'),
    ('880e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440002', 'Toyota', 'Camry', 2015, 2020, '2.5L', 'LE'),
    ('880e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440002', 'Toyota', 'Camry', 2015, 2020, '2.5L', 'SE'),
    ('880e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440002', 'Toyota', 'Camry', 2015, 2020, '3.5L V6', 'XLE'),
    ('880e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440003', 'Ford', 'F-150', 2017, 2023, '3.5L EcoBoost', 'XLT'),
    ('880e8400-e29b-41d4-a716-446655440009', '660e8400-e29b-41d4-a716-446655440003', 'Ford', 'F-150', 2017, 2023, '3.5L EcoBoost', 'Lariat'),
    ('880e8400-e29b-41d4-a716-446655440010', '660e8400-e29b-41d4-a716-446655440004', 'BMW', '328i', 2014, 2016, '2.0L Turbo', 'Base'),
    ('880e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440004', 'BMW', '328i', 2014, 2016, '2.0L Turbo', 'Sport'),
    ('880e8400-e29b-41d4-a716-446655440012', '660e8400-e29b-41d4-a716-446655440005', 'Chevrolet', 'Silverado', 2019, 2023, '5.3L V8', 'LT'),
    ('880e8400-e29b-41d4-a716-446655440013', '660e8400-e29b-41d4-a716-446655440005', 'Chevrolet', 'Silverado', 2019, 2023, '6.2L V8', 'LTZ');

-- Note: User data and orders will be created through the application
-- as they require Supabase Auth integration for proper user management