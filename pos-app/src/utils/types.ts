export interface User {
  id: number;
  username: string;
  role: 'admin' | 'cashier';
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  barcode: string;
  category_id: number;
  category_name?: string;
  price: number;
  cost: number;
  stock: number;
  image: string;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  created_at: string;
}

export interface Supplier {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  created_at: string;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  customer_id: number;
  customer_name?: string;
  customer_phone?: string;
  customer_address?: string;
  user_id: number;
  user_name?: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  payment_method: 'cash' | 'card' | 'multi' | 'installment';
  down_payment: number;
  installment_percentage: number;
  created_at: string;
}

export interface InvoiceItem {
  id: number;
  invoice_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  discount: number;
  total: number;
}

export interface InstallmentPayment {
  id: number;
  invoice_id: number;
  invoice_number?: string;
  customer_id: number;
  customer_name?: string;
  customer_phone?: string;
  amount: number;
  due_date: string;
  paid_date: string | null;
  status: 'pending' | 'paid' | 'overdue';
  created_at: string;
}

export interface Expense {
  id: number;
  category: string;
  amount: number;
  description: string;
  date: string;
  user_id: number;
  user_name?: string;
  created_at: string;
}

export interface Return {
  id: number;
  invoice_id: number;
  invoice_number?: string;
  product_id: number;
  product_name: string;
  quantity: number;
  amount: number;
  reason: string;
  date: string;
  user_id: number;
  user_name?: string;
  created_at: string;
}
