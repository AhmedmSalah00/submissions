import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'database.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

export const initializeDatabase = () => {
  // Create Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'cashier')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create Categories table
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create Products table
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      barcode TEXT UNIQUE,
      category_id INTEGER,
      price REAL NOT NULL,
      cost REAL NOT NULL DEFAULT 0,
      stock INTEGER NOT NULL DEFAULT 0,
      image TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    )
  `);

  // Create Customers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create Suppliers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create Invoices table
  db.exec(`
    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_number TEXT UNIQUE NOT NULL,
      customer_id INTEGER,
      user_id INTEGER NOT NULL,
      subtotal REAL NOT NULL,
      discount REAL DEFAULT 0,
      tax REAL DEFAULT 0,
      total REAL NOT NULL,
      payment_method TEXT NOT NULL CHECK(payment_method IN ('cash', 'card', 'multi', 'installment')),
      down_payment REAL DEFAULT 0,
      installment_percentage REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Create Invoice Items table
  db.exec(`
    CREATE TABLE IF NOT EXISTS invoice_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      discount REAL DEFAULT 0,
      total REAL NOT NULL,
      FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // Create Installment Payments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS installment_payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id INTEGER NOT NULL,
      customer_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      due_date DATE NOT NULL,
      paid_date DATE,
      status TEXT NOT NULL CHECK(status IN ('pending', 'paid', 'overdue')) DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
    )
  `);

  // Create Expenses table
  db.exec(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT,
      date DATE NOT NULL,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Create Returns table
  db.exec(`
    CREATE TABLE IF NOT EXISTS returns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      amount REAL NOT NULL,
      reason TEXT,
      date DATE NOT NULL,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (invoice_id) REFERENCES invoices(id),
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Create Settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  console.log('Database tables created successfully');
};

export const seedDemoData = () => {
  // Check if data already exists
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  
  if (userCount.count > 0) {
    console.log('Demo data already exists');
    return;
  }

  // Insert default admin user
  const hashedPassword = bcrypt.hashSync('password', 10);
  db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)').run('admin', hashedPassword, 'admin');

  // Insert default settings
  const defaultSettings = [
    ['business_mode', 'supermarket'],
    ['language', 'en'],
    ['currency', 'EGP'],
    ['printer_type', 'a4'],
    ['theme', 'light'],
    ['first_run', 'false'],
    ['logo', '']
  ];

  const insertSetting = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
  defaultSettings.forEach(([key, value]) => {
    insertSetting.run(key, value);
  });

  // Insert demo categories
  const categories = [
    ['Electronics', 'Electronic devices and accessories'],
    ['Food & Beverages', 'Food items and drinks'],
    ['Clothing', 'Apparel and fashion items'],
    ['Home & Garden', 'Home improvement and garden supplies']
  ];

  const insertCategory = db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)');
  categories.forEach(([name, description]) => {
    insertCategory.run(name, description);
  });

  // Insert demo products
  const products = [
    ['Laptop', '1001', 1, 15000, 12000, 10],
    ['Smartphone', '1002', 1, 8000, 6500, 15],
    ['Headphones', '1003', 1, 500, 350, 25],
    ['Coffee', '2001', 2, 50, 30, 100],
    ['Tea', '2002', 2, 40, 25, 80],
    ['T-Shirt', '3001', 3, 200, 120, 50],
    ['Jeans', '3002', 3, 400, 250, 30],
    ['Garden Tools Set', '4001', 4, 800, 500, 20]
  ];

  const insertProduct = db.prepare('INSERT INTO products (name, barcode, category_id, price, cost, stock) VALUES (?, ?, ?, ?, ?, ?)');
  products.forEach(([name, barcode, category_id, price, cost, stock]) => {
    insertProduct.run(name, barcode, category_id, price, cost, stock);
  });

  // Insert demo customer
  db.prepare('INSERT INTO customers (name, phone, email, address) VALUES (?, ?, ?, ?)').run(
    'John Doe',
    '+20123456789',
    'john.doe@example.com',
    '123 Main Street, Cairo, Egypt'
  );

  // Insert demo supplier
  db.prepare('INSERT INTO suppliers (name, phone, email, address) VALUES (?, ?, ?, ?)').run(
    'Tech Supplies Co.',
    '+20198765432',
    'info@techsupplies.com',
    '456 Business District, Cairo, Egypt'
  );

  // Insert demo invoice
  const invoiceNumber = `INV-${Date.now()}`;
  db.prepare(`
    INSERT INTO invoices (invoice_number, customer_id, user_id, subtotal, discount, tax, total, payment_method)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(invoiceNumber, 1, 1, 500, 0, 50, 550, 'cash');

  // Insert demo invoice items
  db.prepare(`
    INSERT INTO invoice_items (invoice_id, product_id, product_name, quantity, price, discount, total)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(1, 3, 'Headphones', 1, 500, 0, 500);

  console.log('Demo data seeded successfully');
};

export default db;
