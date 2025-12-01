
import { InvoiceData } from './types';

export const INITIAL_INVOICE: InvoiceData = {
  invoiceNumber: 'INV-2023-001',
  date: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  senderName: 'URS Coffee',
  senderEmail: 'orders@urscoffee.com',
  senderAddress: 'Jalan Kopi No. 123, Jakarta Selatan, Indonesia',
  clientName: 'Kafe Kenangan',
  clientEmail: 'procurement@kafekenangan.com',
  clientAddress: 'Jalan Senopati No. 45, Jakarta Selatan',
  currency: 'IDR',
  taxRate: 11,
  showItemDates: true,
  showTax: true,
  notes: 'Mohon transfer ke Bank BCA 1234567890 a/n URS Coffee. Terima kasih!',
  items: [
    {
      id: '1',
      date: new Date().toISOString().split('T')[0],
      description: 'Gula Aren Cair',
      quantity: 3,
      unit: 'liter',
      rate: 75000
    },
    {
      id: '2',
      date: new Date().toISOString().split('T')[0],
      description: 'Robusta Roasted Bean',
      quantity: 1,
      unit: 'kg',
      rate: 135000
    },
    {
      id: '3',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Yesterday
      description: 'Gula Aren Cair',
      quantity: 0.5,
      unit: 'liter',
      rate: 75000
    }
  ]
};

export const CURRENCIES = [
  { code: 'IDR', symbol: 'Rp', locale: 'id-ID' },
  { code: 'USD', symbol: '$', locale: 'en-US' },
  { code: 'EUR', symbol: '€', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', locale: 'en-GB' },
  { code: 'JPY', symbol: '¥', locale: 'ja-JP' },
  { code: 'CAD', symbol: 'CA$', locale: 'en-CA' },
  { code: 'AUD', symbol: 'A$', locale: 'en-AU' },
  { code: 'SGD', symbol: 'S$', locale: 'en-SG' },
];