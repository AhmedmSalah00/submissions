import db from './database';
import bcrypt from 'bcryptjs';

// User Queries
export const userQueries = {
  authenticate: (username: string, password: string) => {
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;
    if (!user) return null;
    
    const isValid = bcrypt.compareSync(password, user.password_hash);
    if (!isValid) return null;
    
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  getAll: () => {
    return db.prepare('SELECT id, username, role, created_at FROM users').all();
  },

  getById: (id: number) => {
    return db.prepare('SELECT id, username, role, created_at FROM users WHERE id = ?').get(id);
  },

  create: (username: string, password: string, role: string) => {
    const hashedPassword = bcrypt.hashSync(password, 10);
    return db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)').run(username, hashedPassword, role);
  },

  update: (id: number, username: string, role: string) => {
    return db.prepare('UPDATE users SET username = ?, role = ? WHERE id = ?').run(username, role, id);
  },

  updatePassword: (id: number, newPassword: string) => {
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    return db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashedPassword, id);
  },

  delete: (id: number) => {
    return db.prepare('DELETE FROM users WHERE id = ?').run(id);
  }
};

// Product Queries
export const productQueries = {
  getAll: () => {
    return db.prepare(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `).all();
  },

  getById: (id: number) => {
    return db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  },

  getByBarcode: (barcode: string) => {
    return db.prepare('SELECT * FROM products WHERE barcode = ?').get(barcode);
  },

  search: (query: string) => {
    return db.prepare(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.name LIKE ? OR p.barcode LIKE ?
    `).all(`%${query}%`, `%${query}%`);
  },

  getLowStock: (threshold: number = 10) => {
    return db.prepare('SELECT * FROM products WHERE stock <= ?').all(threshold);
  },

  create: (data: any) => {
    return db.prepare(`
      INSERT INTO products (name, barcode, category_id, price, cost, stock, image)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(data.name, data.barcode, data.category_id, data.price, data.cost, data.stock, data.image);
  },

  update: (id: number, data: any) => {
    return db.prepare(`
      UPDATE products 
      SET name = ?, barcode = ?, category_id = ?, price = ?, cost = ?, stock = ?, image = ?
      WHERE id = ?
    `).run(data.name, data.barcode, data.category_id, data.price, data.cost, data.stock, data.image, id);
  },

  updateStock: (id: number, quantity: number) => {
    return db.prepare('UPDATE products SET stock = stock + ? WHERE id = ?').run(quantity, id);
  },

  delete: (id: number) => {
    return db.prepare('DELETE FROM products WHERE id = ?').run(id);
  }
};

// Category Queries
export const categoryQueries = {
  getAll: () => {
    return db.prepare('SELECT * FROM categories ORDER BY name').all();
  },

  getById: (id: number) => {
    return db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  },

  create: (name: string, description: string) => {
    return db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)').run(name, description);
  },

  update: (id: number, name: string, description: string) => {
    return db.prepare('UPDATE categories SET name = ?, description = ? WHERE id = ?').run(name, description, id);
  },

  delete: (id: number) => {
    return db.prepare('DELETE FROM categories WHERE id = ?').run(id);
  }
};

// Customer Queries
export const customerQueries = {
  getAll: () => {
    return db.prepare('SELECT * FROM customers ORDER BY created_at DESC').all();
  },

  getById: (id: number) => {
    return db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
  },

  search: (query: string) => {
    return db.prepare('SELECT * FROM customers WHERE name LIKE ? OR phone LIKE ?').all(`%${query}%`, `%${query}%`);
  },

  create: (data: any) => {
    return db.prepare('INSERT INTO customers (name, phone, email, address) VALUES (?, ?, ?, ?)').run(
      data.name, data.phone, data.email, data.address
    );
  },

  update: (id: number, data: any) => {
    return db.prepare('UPDATE customers SET name = ?, phone = ?, email = ?, address = ? WHERE id = ?').run(
      data.name, data.phone, data.email, data.address, id
    );
  },

  delete: (id: number) => {
    return db.prepare('DELETE FROM customers WHERE id = ?').run(id);
  }
};

// Supplier Queries
export const supplierQueries = {
  getAll: () => {
    return db.prepare('SELECT * FROM suppliers ORDER BY created_at DESC').all();
  },

  getById: (id: number) => {
    return db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);
  },

  create: (data: any) => {
    return db.prepare('INSERT INTO suppliers (name, phone, email, address) VALUES (?, ?, ?, ?)').run(
      data.name, data.phone, data.email, data.address
    );
  },

  update: (id: number, data: any) => {
    return db.prepare('UPDATE suppliers SET name = ?, phone = ?, email = ?, address = ? WHERE id = ?').run(
      data.name, data.phone, data.email, data.address, id
    );
  },

  delete: (id: number) => {
    return db.prepare('DELETE FROM suppliers WHERE id = ?').run(id);
  }
};

// Invoice Queries
export const invoiceQueries = {
  getAll: () => {
    return db.prepare(`
      SELECT i.*, c.name as customer_name, u.username as user_name
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      LEFT JOIN users u ON i.user_id = u.id
      ORDER BY i.created_at DESC
    `).all();
  },

  getById: (id: number) => {
    return db.prepare(`
      SELECT i.*, c.name as customer_name, c.phone as customer_phone, c.address as customer_address
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE i.id = ?
    `).get(id);
  },

  getByInvoiceNumber: (invoiceNumber: string) => {
    return db.prepare('SELECT * FROM invoices WHERE invoice_number = ?').get(invoiceNumber);
  },

  getItems: (invoiceId: number) => {
    return db.prepare('SELECT * FROM invoice_items WHERE invoice_id = ?').all(invoiceId);
  },

  create: (invoiceData: any, items: any[]) => {
    const transaction = db.transaction(() => {
      // Insert invoice
      const result = db.prepare(`
        INSERT INTO invoices (invoice_number, customer_id, user_id, subtotal, discount, tax, total, payment_method, down_payment, installment_percentage)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        invoiceData.invoice_number,
        invoiceData.customer_id,
        invoiceData.user_id,
        invoiceData.subtotal,
        invoiceData.discount,
        invoiceData.tax,
        invoiceData.total,
        invoiceData.payment_method,
        invoiceData.down_payment || 0,
        invoiceData.installment_percentage || 0
      );

      const invoiceId = result.lastInsertRowid;

      // Insert invoice items and update stock
      const insertItem = db.prepare(`
        INSERT INTO invoice_items (invoice_id, product_id, product_name, quantity, price, discount, total)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const updateStock = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');

      items.forEach(item => {
        insertItem.run(invoiceId, item.product_id, item.product_name, item.quantity, item.price, item.discount, item.total);
        updateStock.run(item.quantity, item.product_id);
      });

      return invoiceId;
    });

    return transaction();
  },

  getByDateRange: (startDate: string, endDate: string) => {
    return db.prepare(`
      SELECT * FROM invoices 
      WHERE DATE(created_at) BETWEEN ? AND ?
      ORDER BY created_at DESC
    `).all(startDate, endDate);
  },

  getTotalSales: (startDate: string, endDate: string) => {
    return db.prepare(`
      SELECT SUM(total) as total_sales, COUNT(*) as invoice_count
      FROM invoices
      WHERE DATE(created_at) BETWEEN ? AND ?
    `).get(startDate, endDate);
  }
};

// Installment Payment Queries
export const installmentQueries = {
  getAll: () => {
    return db.prepare(`
      SELECT ip.*, i.invoice_number, c.name as customer_name, c.phone as customer_phone
      FROM installment_payments ip
      JOIN invoices i ON ip.invoice_id = i.id
      JOIN customers c ON ip.customer_id = c.id
      ORDER BY ip.due_date ASC
    `).all();
  },

  getByCustomer: (customerId: number) => {
    return db.prepare(`
      SELECT ip.*, i.invoice_number
      FROM installment_payments ip
      JOIN invoices i ON ip.invoice_id = i.id
      WHERE ip.customer_id = ?
      ORDER BY ip.due_date ASC
    `).all(customerId);
  },

  getOverdue: () => {
    return db.prepare(`
      SELECT ip.*, i.invoice_number, c.name as customer_name, c.phone as customer_phone
      FROM installment_payments ip
      JOIN invoices i ON ip.invoice_id = i.id
      JOIN customers c ON ip.customer_id = c.id
      WHERE ip.status = 'pending' AND ip.due_date < DATE('now')
      ORDER BY ip.due_date ASC
    `).all();
  },

  create: (data: any) => {
    return db.prepare(`
      INSERT INTO installment_payments (invoice_id, customer_id, amount, due_date, status)
      VALUES (?, ?, ?, ?, ?)
    `).run(data.invoice_id, data.customer_id, data.amount, data.due_date, data.status || 'pending');
  },

  markAsPaid: (id: number) => {
    return db.prepare(`
      UPDATE installment_payments 
      SET status = 'paid', paid_date = DATE('now')
      WHERE id = ?
    `).run(id);
  },

  updateStatus: () => {
    return db.prepare(`
      UPDATE installment_payments 
      SET status = 'overdue'
      WHERE status = 'pending' AND due_date < DATE('now')
    `).run();
  }
};

// Expense Queries
export const expenseQueries = {
  getAll: () => {
    return db.prepare(`
      SELECT e.*, u.username as user_name
      FROM expenses e
      JOIN users u ON e.user_id = u.id
      ORDER BY e.date DESC
    `).all();
  },

  getByDateRange: (startDate: string, endDate: string) => {
    return db.prepare('SELECT * FROM expenses WHERE date BETWEEN ? AND ? ORDER BY date DESC').all(startDate, endDate);
  },

  create: (data: any) => {
    return db.prepare('INSERT INTO expenses (category, amount, description, date, user_id) VALUES (?, ?, ?, ?, ?)').run(
      data.category, data.amount, data.description, data.date, data.user_id
    );
  },

  update: (id: number, data: any) => {
    return db.prepare('UPDATE expenses SET category = ?, amount = ?, description = ?, date = ? WHERE id = ?').run(
      data.category, data.amount, data.description, data.date, id
    );
  },

  delete: (id: number) => {
    return db.prepare('DELETE FROM expenses WHERE id = ?').run(id);
  }
};

// Return Queries
export const returnQueries = {
  getAll: () => {
    return db.prepare(`
      SELECT r.*, i.invoice_number, u.username as user_name
      FROM returns r
      JOIN invoices i ON r.invoice_id = i.id
      JOIN users u ON r.user_id = u.id
      ORDER BY r.date DESC
    `).all();
  },

  create: (data: any) => {
    const transaction = db.transaction(() => {
      // Insert return record
      const result = db.prepare(`
        INSERT INTO returns (invoice_id, product_id, product_name, quantity, amount, reason, date, user_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        data.invoice_id,
        data.product_id,
        data.product_name,
        data.quantity,
        data.amount,
        data.reason,
        data.date,
        data.user_id
      );

      // Update product stock
      db.prepare('UPDATE products SET stock = stock + ? WHERE id = ?').run(data.quantity, data.product_id);

      return result;
    });

    return transaction();
  }
};

// Settings Queries
export const settingsQueries = {
  get: (key: string) => {
    const result = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as any;
    return result?.value;
  },

  set: (key: string, value: string) => {
    return db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value);
  },

  getAll: () => {
    const rows = db.prepare('SELECT * FROM settings').all() as any[];
    return rows.reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {} as Record<string, string>);
  }
};
