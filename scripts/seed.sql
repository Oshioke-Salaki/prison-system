-- SEED DATA SCRIPT
-- Run this in the Supabase SQL Editor to populate your database with Nigerian-themed data.

-- 0. Create Tables (If Not Exists) to ensure script runs smoothly
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('deposit', 'purchase', 'transfer')),
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inmate_id UUID REFERENCES inmates(id) ON DELETE CASCADE,
    type TEXT,
    description TEXT,
    severity TEXT CHECK (severity IN ('minor', 'major', 'critical')),
    status TEXT DEFAULT 'reported',
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inmate_id UUID REFERENCES inmates(id) ON DELETE CASCADE,
    type TEXT,
    subject TEXT,
    description TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1. Create Cells
INSERT INTO cells (block_name, cell_number, capacity, current_occupancy) VALUES
('Block A', 'A-101', 4, 0),
('Block A', 'A-102', 4, 0),
('Block A', 'A-103', 2, 0),
('Block B', 'B-101', 8, 0),
('Block B', 'B-102', 8, 0),
('Block C', 'C-101', 1, 0), -- Solitary
('Block C', 'C-102', 1, 0);

-- 2. Create Inventory (Nigerian Items)
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

-- 3. Create Inmates (Nigerian Names)
-- We use CTEs to capturing IDs for subsequent inserts
WITH new_inmates AS (
  INSERT INTO inmates (first_name, last_name, inmate_number, date_of_birth, offense, sentence_start_date, sentence_end_date, status, cell_id) 
  VALUES 
  ('Emeka', 'Okonkwo', '100001', '1990-05-12', 'Fraud', '2023-01-15', '2028-01-15', 'active', (SELECT id FROM cells WHERE cell_number = 'A-101' LIMIT 1)),
  ('Tunde', 'Bakare', '100002', '1985-08-20', 'Theft', '2024-02-10', '2025-02-10', 'active', (SELECT id FROM cells WHERE cell_number = 'A-101' LIMIT 1)),
  ('Chinedu', 'Eze', '100003', '1992-11-03', 'Assault', '2023-06-01', '2026-06-01', 'active', (SELECT id FROM cells WHERE cell_number = 'B-101' LIMIT 1)),
  ('Abdullahi', 'Musa', '100004', '1988-03-15', 'Drug Possession', '2023-11-20', '2025-11-20', 'active', (SELECT id FROM cells WHERE cell_number = 'B-101' LIMIT 1)),
  ('Segun', 'Adeyemi', '100005', '1995-07-22', 'Cybercrime', '2024-01-05', '2029-01-05', 'active', (SELECT id FROM cells WHERE cell_number = 'C-101' LIMIT 1)) -- In Solitary
  RETURNING id, first_name, last_name
)

-- 4. Create Wallets for each new inmate
INSERT INTO wallets (inmate_id, balance)
SELECT id, 5000.00 FROM new_inmates;

-- 5. Create Transactions (Mock Data)
INSERT INTO transactions (wallet_id, type, amount, description, created_at, status)
SELECT 
    w.id, 
    'deposit', 
    10000.00, 
    'Family Support Deposit', 
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

-- 6. Create Requests
INSERT INTO requests (inmate_id, type, subject, description, status, created_at)
SELECT 
    i.id, 
    'medical', 
    'Malaria Symptoms', 
    'I have been having high fever and headache since yesterday evening.', 
    'pending', 
    NOW()
FROM inmates i WHERE i.inmate_number = '100002'; -- Tunde

INSERT INTO requests (inmate_id, type, subject, description, status, created_at)
SELECT 
    i.id, 
    'visit', 
    'Wife Visit', 
    'Requesting visitation approval for my wife next Saturday.', 
    'approved', 
    NOW() - INTERVAL '3 days'
FROM inmates i WHERE i.inmate_number = '100003'; -- Chinedu

-- 7. Create Incidents
INSERT INTO incidents (inmate_id, type, description, severity, status, reported_at)
SELECT 
    i.id, 
    'fight', 
    'Altercation with another inmate over food rations.', 
    'major', 
    'resolved', 
    NOW() - INTERVAL '1 month'
FROM inmates i WHERE i.inmate_number = '100003'; -- Chinedu

-- 8. Create Visits
INSERT INTO visits (inmate_id, visitor_name, visit_date, visit_time, status, notes)
SELECT 
    i.id, 
    'Nneka Okonkwo', 
    (CURRENT_DATE + INTERVAL '5 days')::date, 
    '14:00', 
    'scheduled', 
    'Family visit approved.'
FROM inmates i WHERE i.inmate_number = '100001'; -- Emeka

-- Update Cell Occupancy (Simple approximation)
UPDATE cells
SET current_occupancy = (
    SELECT COUNT(*) FROM inmates WHERE inmates.cell_id = cells.id
);
