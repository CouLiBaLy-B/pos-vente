import express from 'express';
import cors from 'cors';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3001;

const pool = new pg.Pool({
  host: process.env.DB_HOST || 'localhost', port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'pos_db', user: process.env.DB_USER || 'pos_user',
  password: process.env.DB_PASSWORD || 'pos_secret', max: 20, idleTimeoutMillis: 30000, connectionTimeoutMillis: 5000,
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));

async function initDatabase() {
  try { const c = await pool.connect(); const sql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8'); await c.query(sql); c.release(); console.log('✅ DB initialisée'); }
  catch (err) { console.error('❌ Erreur DB:', err); process.exit(1); }
}

function toCamel(row) {
  if (!row || typeof row !== 'object') return row;
  const r = {}; for (const [k, v] of Object.entries(row)) { r[k.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] = v; } return r;
}

// Health
app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Auth
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE username = $1 AND password = $2 AND active = TRUE', [username, password]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Identifiants invalides' });
    const user = toCamel(result.rows[0]); delete user.password;
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);
    user.lastLogin = new Date().toISOString();
    res.json({ user });
  } catch { res.status(500).json({ error: 'Erreur serveur' }); }
});

// Products
app.get('/api/products', async (_req, res) => { try { const r = await pool.query('SELECT * FROM products ORDER BY name'); res.json(r.rows.map(toCamel)); } catch { res.status(500).json({ error: 'Erreur serveur' }); } });
app.post('/api/products', async (req, res) => { try { const d = req.body; const id = 'p' + Date.now(); const r = await pool.query('INSERT INTO products (id,name,category_id,purchase_price,selling_price,min_price,stock,unit,barcode,description,image) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *', [id,d.name,d.category,d.purchasePrice,d.sellingPrice,d.minPrice,d.stock,d.unit,d.barcode||null,d.description||null,d.image||null]); res.json(toCamel(r.rows[0])); } catch { res.status(500).json({ error: 'Erreur serveur' }); } });
app.put('/api/products/:id', async (req, res) => { try { const d = req.body; const r = await pool.query('UPDATE products SET name=$1,category_id=$2,purchase_price=$3,selling_price=$4,min_price=$5,stock=$6,unit=$7,barcode=$8,description=$9,image=$10,updated_at=NOW() WHERE id=$11 RETURNING *', [d.name,d.category,d.purchasePrice,d.sellingPrice,d.minPrice,d.stock,d.unit,d.barcode||null,d.description||null,d.image||null,req.params.id]); if (!r.rows.length) return res.status(404).json({ error: 'Non trouvé' }); res.json(toCamel(r.rows[0])); } catch { res.status(500).json({ error: 'Erreur serveur' }); } });
app.delete('/api/products/:id', async (req, res) => { try { await pool.query('DELETE FROM products WHERE id=$1', [req.params.id]); res.json({ success: true }); } catch { res.status(500).json({ error: 'Erreur serveur' }); } });

// Categories
app.get('/api/categories', async (_req, res) => { try { const r = await pool.query('SELECT * FROM categories ORDER BY name'); res.json(r.rows.map(toCamel)); } catch { res.status(500).json({ error: 'Erreur serveur' }); } });
app.post('/api/categories', async (req, res) => { try { const d = req.body; const id = Date.now().toString(); const r = await pool.query('INSERT INTO categories (id,name,icon,color) VALUES ($1,$2,$3,$4) RETURNING *', [id,d.name,d.icon||'📦',d.color||'#3B82F6']); res.json(toCamel(r.rows[0])); } catch { res.status(500).json({ error: 'Erreur serveur' }); } });
app.delete('/api/categories/:id', async (req, res) => { try { await pool.query('DELETE FROM categories WHERE id=$1', [req.params.id]); res.json({ success: true }); } catch { res.status(500).json({ error: 'Erreur serveur' }); } });

// Customers
app.get('/api/customers', async (_req, res) => { try { const r = await pool.query('SELECT * FROM customers ORDER BY name'); res.json(r.rows.map(toCamel)); } catch { res.status(500).json({ error: 'Erreur serveur' }); } });
app.post('/api/customers', async (req, res) => { try { const d = req.body; const id = 'c' + Date.now(); const r = await pool.query('INSERT INTO customers (id,name,phone,address,email,balance) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *', [id,d.name,d.phone||null,d.address||null,d.email||null,d.balance||0]); res.json(toCamel(r.rows[0])); } catch { res.status(500).json({ error: 'Erreur serveur' }); } });
app.put('/api/customers/:id', async (req, res) => { try { const d = req.body; const r = await pool.query('UPDATE customers SET name=$1,phone=$2,address=$3,email=$4,balance=$5 WHERE id=$6 RETURNING *', [d.name,d.phone||null,d.address||null,d.email||null,d.balance||0,req.params.id]); if (!r.rows.length) return res.status(404).json({ error: 'Non trouvé' }); res.json(toCamel(r.rows[0])); } catch { res.status(500).json({ error: 'Erreur serveur' }); } });
app.delete('/api/customers/:id', async (req, res) => { try { await pool.query('DELETE FROM customers WHERE id=$1', [req.params.id]); res.json({ success: true }); } catch { res.status(500).json({ error: 'Erreur serveur' }); } });

// Sales
app.get('/api/sales', async (_req, res) => {
  try {
    const sr = await pool.query('SELECT * FROM sales ORDER BY created_at DESC');
    const sales = [];
    for (const row of sr.rows) {
      const ir = await pool.query('SELECT * FROM sale_items WHERE sale_id=$1', [row.id]);
      const sale = toCamel(row);
      sale.items = ir.rows.map(i => ({ product: { id: i.product_id, name: i.product_name }, quantity: i.quantity, unitPrice: parseFloat(i.unit_price), discount: parseFloat(i.discount), total: parseFloat(i.total) }));
      sales.push(sale);
    }
    res.json(sales);
  } catch { res.status(500).json({ error: 'Erreur serveur' }); }
});

app.post('/api/sales', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const d = req.body; const id = 'VTE-' + Date.now();
    await client.query('INSERT INTO sales (id,subtotal,discount,tax,total,paid,change_amount,payment_method,customer_id,customer_name,seller_id,seller_name) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)',
      [id,d.subtotal,d.discount,d.tax,d.total,d.paid,d.change,d.paymentMethod,d.customerId||null,d.customerName||null,d.sellerId||null,d.sellerName]);
    for (const item of d.items) {
      await client.query('INSERT INTO sale_items (sale_id,product_id,product_name,quantity,unit_price,discount,total) VALUES ($1,$2,$3,$4,$5,$6,$7)',
        [id,item.product.id,item.product.name,item.quantity,item.unitPrice,item.discount,item.total]);
      await client.query('UPDATE products SET stock=GREATEST(0,stock-$1),updated_at=NOW() WHERE id=$2', [item.quantity,item.product.id]);
    }
    if (d.paymentMethod === 'credit' && d.customerId) await client.query('UPDATE customers SET balance=balance+$1 WHERE id=$2', [d.total,d.customerId]);
    await client.query('COMMIT');
    const sr = await pool.query('SELECT * FROM sales WHERE id=$1', [id]);
    const ir = await pool.query('SELECT * FROM sale_items WHERE sale_id=$1', [id]);
    const sale = toCamel(sr.rows[0]);
    sale.items = ir.rows.map(i => ({ product: { id: i.product_id, name: i.product_name }, quantity: i.quantity, unitPrice: parseFloat(i.unit_price), discount: parseFloat(i.discount), total: parseFloat(i.total) }));
    res.json(sale);
  } catch (err) { await client.query('ROLLBACK'); console.error(err); res.status(500).json({ error: 'Erreur serveur' }); }
  finally { client.release(); }
});

// Users
app.get('/api/users', async (_req, res) => { try { const r = await pool.query('SELECT id,username,name,role,phone,active,created_at,last_login FROM users ORDER BY name'); res.json(r.rows.map(toCamel)); } catch { res.status(500).json({ error: 'Erreur serveur' }); } });
app.post('/api/users', async (req, res) => { try { const d = req.body; const id = 'u' + Date.now(); await pool.query('INSERT INTO users (id,username,name,role,password,phone,active) VALUES ($1,$2,$3,$4,$5,$6,$7)', [id,d.username,d.name,d.role,d.password,d.phone||null,d.active!==false]); const r = await pool.query('SELECT id,username,name,role,phone,active,created_at,last_login FROM users WHERE id=$1', [id]); res.json(toCamel(r.rows[0])); } catch (err) { if (err.code === '23505') return res.status(400).json({ error: "Nom d'utilisateur déjà pris" }); res.status(500).json({ error: 'Erreur serveur' }); } });
app.put('/api/users/:id', async (req, res) => { try { const d = req.body; if (d.password) await pool.query('UPDATE users SET username=$1,name=$2,role=$3,password=$4,phone=$5,active=$6 WHERE id=$7', [d.username,d.name,d.role,d.password,d.phone||null,d.active!==false,req.params.id]); else await pool.query('UPDATE users SET username=$1,name=$2,role=$3,phone=$4,active=$5 WHERE id=$6', [d.username,d.name,d.role,d.phone||null,d.active!==false,req.params.id]); const r = await pool.query('SELECT id,username,name,role,phone,active,created_at,last_login FROM users WHERE id=$1', [req.params.id]); if (!r.rows.length) return res.status(404).json({ error: 'Non trouvé' }); res.json(toCamel(r.rows[0])); } catch (err) { if (err.code === '23505') return res.status(400).json({ error: "Nom d'utilisateur déjà pris" }); res.status(500).json({ error: 'Erreur serveur' }); } });
app.delete('/api/users/:id', async (req, res) => { try { await pool.query('DELETE FROM users WHERE id=$1', [req.params.id]); res.json({ success: true }); } catch { res.status(500).json({ error: 'Erreur serveur' }); } });

// Settings
app.get('/api/settings', async (_req, res) => { try { const r = await pool.query('SELECT key,value FROM settings'); const s = {}; for (const row of r.rows) { let v = row.value; if (row.key === 'taxRate') v = parseFloat(v); s[row.key] = v; } res.json(s); } catch { res.status(500).json({ error: 'Erreur serveur' }); } });
app.put('/api/settings', async (req, res) => { try { for (const [k,v] of Object.entries(req.body)) await pool.query('INSERT INTO settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=$2', [k,String(v)]); const r = await pool.query('SELECT key,value FROM settings'); const s = {}; for (const row of r.rows) { let v = row.value; if (row.key==='taxRate') v=parseFloat(v); s[row.key]=v; } res.json(s); } catch { res.status(500).json({ error: 'Erreur serveur' }); } });

// ============ NEW ENDPOINTS ============

// Expenses
app.get('/api/expenses', async (_req, res) => { try { const r = await pool.query('SELECT * FROM expenses ORDER BY date DESC, created_at DESC'); res.json(r.rows.map(toCamel)); } catch { res.status(500).json({ error: 'Erreur serveur' }); } });
app.post('/api/expenses', async (req, res) => { try { const d = req.body; const id = 'exp-' + Date.now(); const r = await pool.query('INSERT INTO expenses (id,date,category,description,amount,paid_by,receipt_number) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *', [id,d.date,d.category,d.description,d.amount,d.paidBy,d.receiptNumber||null]); res.json(toCamel(r.rows[0])); } catch { res.status(500).json({ error: 'Erreur serveur' }); } });
app.delete('/api/expenses/:id', async (req, res) => { try { await pool.query('DELETE FROM expenses WHERE id=$1', [req.params.id]); res.json({ success: true }); } catch { res.status(500).json({ error: 'Erreur serveur' }); } });

// Suppliers
app.get('/api/suppliers', async (_req, res) => { try { const r = await pool.query('SELECT * FROM suppliers ORDER BY name'); res.json(r.rows.map(toCamel)); } catch { res.status(500).json({ error: 'Erreur serveur' }); } });
app.post('/api/suppliers', async (req, res) => { try { const d = req.body; const id = 'sup-' + Date.now(); const r = await pool.query('INSERT INTO suppliers (id,name,phone,email,address,items,balance) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *', [id,d.name,d.phone,d.email||null,d.address||null,d.items||null,d.balance||0]); res.json(toCamel(r.rows[0])); } catch { res.status(500).json({ error: 'Erreur serveur' }); } });
app.put('/api/suppliers/:id', async (req, res) => { try { const d = req.body; const r = await pool.query('UPDATE suppliers SET name=$1,phone=$2,email=$3,address=$4,items=$5,balance=$6 WHERE id=$7 RETURNING *', [d.name,d.phone,d.email||null,d.address||null,d.items||null,d.balance||0,req.params.id]); if (!r.rows.length) return res.status(404).json({ error: 'Non trouvé' }); res.json(toCamel(r.rows[0])); } catch { res.status(500).json({ error: 'Erreur serveur' }); } });
app.delete('/api/suppliers/:id', async (req, res) => { try { await pool.query('DELETE FROM suppliers WHERE id=$1', [req.params.id]); res.json({ success: true }); } catch { res.status(500).json({ error: 'Erreur serveur' }); } });

// Stock Movements
app.get('/api/stock-movements', async (_req, res) => { try { const r = await pool.query('SELECT * FROM stock_movements ORDER BY created_at DESC LIMIT 500'); res.json(r.rows.map(toCamel)); } catch { res.status(500).json({ error: 'Erreur serveur' }); } });
app.post('/api/stock-movements', async (req, res) => { try { const d = req.body; const id = 'sm-' + Date.now(); const r = await pool.query('INSERT INTO stock_movements (id,product_id,product_name,type,quantity,previous_stock,new_stock,reason,user_id,user_name,cost,supplier_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *', [id,d.productId,d.productName,d.type,d.quantity,d.previousStock,d.newStock,d.reason,d.userId,d.userName,d.cost||null,d.supplierId||null]); res.json(toCamel(r.rows[0])); } catch { res.status(500).json({ error: 'Erreur serveur' }); } });

// Customer Payments
app.get('/api/customer-payments', async (_req, res) => { try { const r = await pool.query('SELECT * FROM customer_payments ORDER BY created_at DESC'); res.json(r.rows.map(toCamel)); } catch { res.status(500).json({ error: 'Erreur serveur' }); } });
app.post('/api/customer-payments', async (req, res) => { try { const d = req.body; const id = 'cp-' + Date.now(); const r = await pool.query('INSERT INTO customer_payments (id,customer_id,customer_name,amount,payment_method,note,user_id,user_name) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *', [id,d.customerId,d.customerName,d.amount,d.paymentMethod,d.note||null,d.userId,d.userName]); res.json(toCamel(r.rows[0])); } catch { res.status(500).json({ error: 'Erreur serveur' }); } });

// Register Sessions
app.get('/api/register-sessions', async (_req, res) => { try { const r = await pool.query('SELECT * FROM register_sessions ORDER BY opened_at DESC'); res.json(r.rows.map(toCamel)); } catch { res.status(500).json({ error: 'Erreur serveur' }); } });
app.get('/api/register-sessions/active', async (_req, res) => { try { const r = await pool.query("SELECT * FROM register_sessions WHERE status='open' ORDER BY opened_at DESC LIMIT 1"); res.json(r.rows.length ? toCamel(r.rows[0]) : null); } catch { res.status(500).json({ error: 'Erreur serveur' }); } });
app.post('/api/register-sessions', async (req, res) => { try { const d = req.body; const r = await pool.query('INSERT INTO register_sessions (id,opener_id,opener_name,opening_balance,status,sales_count,sales_total,cash_payments,mobile_payments,other_payments,expenses_total,note) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *', [d.id,d.openerId,d.openerName,d.openingBalance,d.status||'open',d.salesCount||0,d.salesTotal||0,d.cashPayments||0,d.mobilePayments||0,d.otherPayments||0,d.expensesTotal||0,d.note||null]); res.json(toCamel(r.rows[0])); } catch { res.status(500).json({ error: 'Erreur serveur' }); } });
app.put('/api/register-sessions/:id/close', async (req, res) => { try { const d = req.body; await pool.query('UPDATE register_sessions SET closed_at=NOW(),closing_balance=$1,expected_balance=$2,difference=$3,status=$4,sales_count=$5,sales_total=$6,cash_payments=$7,mobile_payments=$8,other_payments=$9,expenses_total=$10,note=$11 WHERE id=$12', [d.closingBalance||null,d.expectedBalance||null,d.difference||null,d.status||'closed',d.salesCount||0,d.salesTotal||0,d.cashPayments||0,d.mobilePayments||0,d.otherPayments||0,d.expensesTotal||0,d.note||null,req.params.id]); const r = await pool.query('SELECT * FROM register_sessions WHERE id=$1', [req.params.id]); res.json(toCamel(r.rows[0])); } catch { res.status(500).json({ error: 'Erreur serveur' }); } });

// Start
async function start() { await initDatabase(); app.listen(PORT, () => console.log(`🚀 Coulibaly & Frères POS API — port ${PORT}`)); }
start().catch(err => { console.error(err); process.exit(1); });
