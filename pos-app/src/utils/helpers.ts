export const formatCurrency = (amount: number, currency: string = 'EGP'): string => {
  return `${amount.toFixed(2)} ${currency}`;
};

export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString();
};

export const formatDateTime = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleString();
};

export const generateInvoiceNumber = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `INV-${timestamp}-${random}`;
};

export const calculateInstallments = (
  total: number,
  downPayment: number,
  percentage: number,
  months: number = 12
): { amount: number; dueDate: string }[] => {
  const remaining = total - downPayment;
  const monthlyAmount = remaining / months;
  const installments = [];

  for (let i = 1; i <= months; i++) {
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + i);
    installments.push({
      amount: monthlyAmount,
      dueDate: dueDate.toISOString().split('T')[0]
    });
  }

  return installments;
};

export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => {
      const value = row[header];
      // Escape commas and quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
};

export const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const getMonthStartDate = (): string => {
  const date = new Date();
  date.setDate(1);
  return date.toISOString().split('T')[0];
};

export const getMonthEndDate = (): string => {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  date.setDate(0);
  return date.toISOString().split('T')[0];
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
