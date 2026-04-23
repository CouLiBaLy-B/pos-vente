-- =============================================
-- Coulibaly & Frères POS - Database Schema
-- =============================================

CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(10) DEFAULT '📦',
  color VARCHAR(20) DEFAULT '#3B82F6'
);

CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category_id VARCHAR(20) REFERENCES categories(id),
  purchase_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  selling_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  min_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  unit VARCHAR(50) DEFAULT 'pièce',
  barcode VARCHAR(255),
  description TEXT,
  image TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  email VARCHAR(255),
  balance DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(20) PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'cashier',
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales (
  id VARCHAR(30) PRIMARY KEY,
  subtotal DECIMAL(12,2) NOT NULL,
  discount DECIMAL(12,2) DEFAULT 0,
  tax DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,
  paid DECIMAL(12,2) NOT NULL,
  change_amount DECIMAL(12,2) DEFAULT 0,
  payment_method VARCHAR(20) NOT NULL,
  customer_id VARCHAR(20),
  customer_name VARCHAR(255),
  seller_id VARCHAR(20),
  seller_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sale_items (
  id SERIAL PRIMARY KEY,
  sale_id VARCHAR(30) REFERENCES sales(id) ON DELETE CASCADE,
  product_id VARCHAR(20),
  product_name VARCHAR(255),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  discount DECIMAL(5,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(255) PRIMARY KEY,
  value TEXT NOT NULL
);

-- NEW TABLES
CREATE TABLE IF NOT EXISTS expenses (
  id VARCHAR(30) PRIMARY KEY,
  date DATE NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  paid_by VARCHAR(255) NOT NULL,
  receipt_number VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS suppliers (
  id VARCHAR(30) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  items TEXT,
  balance DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id VARCHAR(30) PRIMARY KEY,
  product_id VARCHAR(20) NOT NULL,
  product_name VARCHAR(255),
  type VARCHAR(20) NOT NULL,
  quantity INTEGER NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  reason TEXT,
  user_id VARCHAR(20),
  user_name VARCHAR(255),
  cost DECIMAL(12,2),
  supplier_id VARCHAR(30),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customer_payments (
  id VARCHAR(30) PRIMARY KEY,
  customer_id VARCHAR(20) NOT NULL,
  customer_name VARCHAR(255),
  amount DECIMAL(12,2) NOT NULL,
  payment_method VARCHAR(20) NOT NULL,
  note TEXT,
  user_id VARCHAR(20),
  user_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS register_sessions (
  id VARCHAR(30) PRIMARY KEY,
  opener_id VARCHAR(20),
  opener_name VARCHAR(255),
  opened_at TIMESTAMP DEFAULT NOW(),
  closed_at TIMESTAMP,
  opening_balance DECIMAL(12,2) DEFAULT 0,
  closing_balance DECIMAL(12,2),
  expected_balance DECIMAL(12,2),
  difference DECIMAL(12,2),
  status VARCHAR(10) DEFAULT 'open',
  sales_count INTEGER DEFAULT 0,
  sales_total DECIMAL(12,2) DEFAULT 0,
  cash_payments DECIMAL(12,2) DEFAULT 0,
  mobile_payments DECIMAL(12,2) DEFAULT 0,
  other_payments DECIMAL(12,2) DEFAULT 0,
  expenses_total DECIMAL(12,2) DEFAULT 0,
  note TEXT
);

-- =============================================
-- SEED DATA
-- =============================================
INSERT INTO categories (id, name, icon, color) VALUES
  ('1', 'Outils', '🔧', '#3B82F6'), ('2', 'Plomberie', '🔧', '#06B6D4'),
  ('3', 'Électricité', '⚡', '#EAB308'), ('4', 'Peinture', '🎨', '#8B5CF6'),
  ('5', 'Quincaillerie', '🔩', '#6B7280'), ('6', 'Menuiserie', '🪚', '#A16207'),
  ('7', 'Jardin', '🌿', '#16A34A'), ('8', 'Divers', '📦', '#EC4899')
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, name, category_id, purchase_price, selling_price, min_price, stock, unit) VALUES
  ('p1','Marteau 500g','1',1500,2500,2000,45,'pièce'),('p2','Tournevis plat','1',800,1500,1200,60,'pièce'),
  ('p3','Pince universelle','1',2000,3500,2800,30,'pièce'),('p4','Robinet mélangeur','2',5000,8500,7000,15,'pièce'),
  ('p5','Tuyau PVC 1m (20mm)','2',500,1000,800,200,'mètre'),('p6','Coude PVC 90°','2',200,500,350,150,'pièce'),
  ('p7','Câble électrique 2.5mm²','3',300,600,500,500,'mètre'),('p8','Interrupteur simple','3',400,800,600,80,'pièce'),
  ('p9','Ampoule LED 12W','3',600,1200,900,100,'pièce'),('p10','Peinture glycéro 5L','4',8000,14000,11000,25,'bidon'),
  ('p11','Peinture émail 1L','4',2500,4500,3500,40,'bidon'),('p12','Rouleau peinture','4',1000,2000,1500,35,'pièce'),
  ('p13','Clous 2 pouces (kg)','5',1500,2500,2000,50,'kg'),('p14','Vis à bois 3x30 (boîte)','5',800,1500,1200,60,'boîte'),
  ('p15','Cadenas 50mm','5',2000,3500,2800,40,'pièce'),('p16','Scie à métaux','6',2500,4500,3500,20,'pièce'),
  ('p17','Planches 2x4 (2m)','6',3000,5500,4500,30,'pièce'),('p18','Tuyau arrosage 10m','7',4000,7500,6000,15,'pièce'),
  ('p19','Sceau plastique 20L','8',1500,3000,2500,50,'pièce'),('p20','Fil de fer (kg)','5',1200,2200,1800,40,'kg')
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, username, name, role, password, phone, active) VALUES
  ('u1','admin','Amadou Coulibaly','admin','admin123','+225 07 00 00 00',TRUE),
  ('u2','manager','Moussa Koné','manager','manager123','+225 05 00 00 00',TRUE),
  ('u3','caissier1','Awa Diallo','cashier','caissier123','+225 01 00 00 00',TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO settings (key, value) VALUES
  ('storeName','Coulibaly & Frères'),('currency','FCFA'),('taxRate','0'),
  ('address','Quartier Commerce, Abidjan, Côte d''Ivoire'),('phone','+225 07 00 00 00 00'),
  ('sellerName','Vendeur 1'),('receiptFooter','Merci pour votre achat chez Coulibaly & Frères ! À bientôt !')
ON CONFLICT (key) DO NOTHING;
