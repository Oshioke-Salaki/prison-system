-- ==========================================
-- PRISON SYSTEM DATABASE INITIALIZATION SCRIPT
-- ==========================================
-- Instructions: 
-- 1. Open the Supabase SQL Editor in your dashboard.
-- 2. Paste this entire script and run it.
-- 3. It will create all necessary tables and insert Nigerian-themed dummy data.

-- Note: We are not inserting directly into auth.users as that requires internal Supabase handling.
-- The profile_id for inmates and staff will be NULL initially. 
-- You can link auth users later via your application API.

-- ==========================================
-- 1. DROP EXISTING TABLES (CAUTION: This resets the database)
-- ==========================================
DROP TABLE IF EXISTS visits CASCADE;
DROP TABLE IF EXISTS incidents CASCADE;
DROP TABLE IF EXISTS requests CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS wallets CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS inmates CASCADE;
DROP TABLE IF EXISTS cells CASCADE;
DROP TABLE IF EXISTS staff CASCADE;

-- ==========================================
-- 2. CREATE TABLES
-- ==========================================

-- Cells Table
CREATE TABLE cells (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    block_name TEXT NOT NULL,
    cell_number TEXT NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 1,
    current_occupancy INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inmates Table
CREATE TABLE inmates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID UNIQUE, -- References auth.users(id), left nullable for seeding
    inmate_number TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE,
    offense TEXT,
    sentence_start_date DATE,
    sentence_end_date DATE,
    cell_id UUID REFERENCES cells(id) ON DELETE SET NULL,
    photo_url TEXT,
    status TEXT DEFAULT 'active', -- active, released, solitary
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wallets Table
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inmate_id UUID REFERENCES inmates(id) ON DELETE CASCADE,
    balance DECIMAL(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions Table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('deposit', 'purchase', 'transfer')),
    amount DECIMAL(15, 2) NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory Table
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- Food, Hygiene, Stationery, Clothing
    price DECIMAL(15, 2) NOT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Requests Table
CREATE TABLE requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inmate_id UUID REFERENCES inmates(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- medical, visit, item, other
    subject TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Incidents Table
CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inmate_id UUID REFERENCES inmates(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- fight, contraband, etc.
    description TEXT,
    severity TEXT CHECK (severity IN ('minor', 'major', 'critical')),
    status TEXT DEFAULT 'reported', -- reported, resolved
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Visits Table
CREATE TABLE visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inmate_id UUID REFERENCES inmates(id) ON DELETE CASCADE,
    visitor_name TEXT NOT NULL,
    visit_date DATE NOT NULL,
    visit_time TIME NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'scheduled', -- scheduled, completed, cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Staff Table
CREATE TABLE staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID UNIQUE, -- References auth.users(id)
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'officer', -- admin, officer, warden
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 3. INSERT DUMMY DATA (NIGERIAN THEME)
-- ==========================================

-- Seed Cells
INSERT INTO cells (block_name, cell_number, capacity, current_occupancy) VALUES
('Block A', 'A-101', 4, 0),
('Block A', 'A-102', 4, 0),
('Block A', 'A-103', 2, 0),
('Block B', 'B-101', 8, 0),
('Block B', 'B-102', 8, 0),
('Block C', 'C-101', 1, 0), -- Solitary
('Block C', 'C-102', 1, 0);

-- Seed Inventory (Prices in Naira ₦)
INSERT INTO inventory (name, category, price, stock_quantity, image_url) VALUES
('Gala Sausage Roll', 'Food', 150.00, 100, NULL),
('Indomie Noodles (Hungry Man)', 'Food', 500.00, 200, NULL),
('Super Yogo', 'Food', 250.00, 50, NULL),
('Peak Milk (Sachet)', 'Food', 100.00, 300, NULL),
('Bournvita (500g)', 'Food', 2500.00, 20, NULL),
('Dudu Osun Soap', 'Hygiene', 400.00, 100, NULL),
('Close-Up Toothpaste', 'Hygiene', 600.00, 80, NULL),
('Singlet (White)', 'Clothing', 1500.00, 50, NULL),
('Bathroom Slippers', 'Clothing', 1200.00, 40, NULL),
('Exercise Book (60 Leaves)', 'Stationery', 200.00, 150, NULL),
('Biro (Blue)', 'Stationery', 100.00, 200, NULL);

-- Seed Inmates (Nigerian Names)
-- Using CTE to capture IDs for dependent tables
WITH new_inmates AS (
  INSERT INTO inmates (first_name, last_name, inmate_number, date_of_birth, offense, sentence_start_date, sentence_end_date, status, cell_id) 
  VALUES 
  ('Emeka', 'Okonkwo', '100001', '1990-05-12', 'Financial Fraud', '2023-01-15', '2028-01-15', 'active', (SELECT id FROM cells WHERE cell_number = 'A-101' LIMIT 1)),
  ('Tunde', 'Bakare', '100002', '1985-08-20', 'Armed Robbery', '2024-02-10', '2034-02-10', 'active', (SELECT id FROM cells WHERE cell_number = 'A-101' LIMIT 1)),
  ('Chinedu', 'Eze', '100003', '1992-11-03', 'Assault', '2023-06-01', '2026-06-01', 'active', (SELECT id FROM cells WHERE cell_number = 'B-101' LIMIT 1)),
  ('Abdullahi', 'Musa', '100004', '1988-03-15', 'Drug Trafficking', '2023-11-20', '2030-11-20', 'active', (SELECT id FROM cells WHERE cell_number = 'B-101' LIMIT 1)),
  ('Segun', 'Adeyemi', '100005', '1995-07-22', 'Cybercrime (Yahoo Boys)', '2024-01-05', '2029-01-05', 'solitary', (SELECT id FROM cells WHERE cell_number = 'C-101' LIMIT 1)),
  ('Ngozi', 'Ibrahim', '100006', '1993-02-14', 'Theft', '2022-04-10', '2025-04-10', 'active', (SELECT id FROM cells WHERE cell_number = 'A-102' LIMIT 1))
  RETURNING id, first_name, last_name, inmate_number
)

-- Seed Wallets (Initial balances in Naira)
INSERT INTO wallets (inmate_id, balance)
SELECT id, 5000.00 FROM new_inmates;

-- Seed Transactions
INSERT INTO transactions (wallet_id, type, amount, description, created_at, status)
SELECT 
    w.id, 
    'deposit', 
    20000.00, 
    'Family Support Deposit via Transfer', 
    NOW() - INTERVAL '5 days', 
    'completed'
FROM wallets w
JOIN inmates i ON w.inmate_id = i.id
WHERE i.inmate_number = '100001'; -- Emeka

INSERT INTO transactions (wallet_id, type, amount, description, created_at, status)
SELECT 
    w.id, 
    'purchase', 
    1500.00, 
    'Commissary: Indomie x3', 
    NOW() - INTERVAL '2 days', 
    'completed'
FROM wallets w
JOIN inmates i ON w.inmate_id = i.id
WHERE i.inmate_number = '100001'; -- Emeka

-- Seed Requests
INSERT INTO requests (inmate_id, type, subject, description, status, created_at)
SELECT 
    i.id, 
    'medical', 
    'Malaria Symptoms', 
    'I have been having high fever and headache since yesterday evening. Need Panadol and Malaria drug.', 
    'pending', 
    NOW()
FROM inmates i WHERE i.inmate_number = '100002'; -- Tunde

INSERT INTO requests (inmate_id, type, subject, description, status, created_at)
SELECT 
    i.id, 
    'visit', 
    'Wife Visit Request', 
    'Requesting visitation approval for my wife next Saturday.', 
    'approved', 
    NOW() - INTERVAL '3 days'
FROM inmates i WHERE i.inmate_number = '100003'; -- Chinedu

-- Seed Incidents
INSERT INTO incidents (inmate_id, type, description, severity, status, reported_at)
SELECT 
    i.id, 
    'fight', 
    'Altercation with another inmate over food rations.', 
    'major', 
    'resolved', 
    NOW() - INTERVAL '1 month'
FROM inmates i WHERE i.inmate_number = '100003'; -- Chinedu

INSERT INTO incidents (inmate_id, type, description, severity, status, reported_at)
SELECT 
    i.id, 
    'contraband', 
    'Found with smuggled mobile phone.', 
    'critical', 
    'reported', 
    NOW() - INTERVAL '2 days'
FROM inmates i WHERE i.inmate_number = '100005'; -- Segun

-- Seed Visits
INSERT INTO visits (inmate_id, visitor_name, visit_date, visit_time, status, notes)
SELECT 
    i.id, 
    'Nneka Okonkwo', 
    (CURRENT_DATE + INTERVAL '5 days')::date, 
    '14:00', 
    'scheduled', 
    'Family visit approved by Warden.'
FROM inmates i WHERE i.inmate_number = '100001'; -- Emeka

-- Seed Staff
INSERT INTO staff (first_name, last_name, role, status) VALUES
('Babatunde', 'Fashola', 'warden', 'active'),
('Olamide', 'Adewale', 'officer', 'active'),
('Aisha', 'Mohammed', 'admin', 'active');

-- ==========================================
-- 4. UPDATE CELL OCCUPANCY
-- ==========================================
UPDATE cells c
SET current_occupancy = (
    SELECT COUNT(*) FROM inmates i WHERE i.cell_id = c.id
);

-- ==========================================
-- SCRIPT COMPLETE
-- ==========================================
