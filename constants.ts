
import { InvoiceData } from './types';

const today = new Date();
const dateStr = today.toISOString().split('T')[0];
const dateCompact = dateStr.replace(/-/g, '');
const nextWeek = new Date(today);
nextWeek.setDate(today.getDate() + 7);
const dueDateStr = nextWeek.toISOString().split('T')[0];

// Helper to get a date between two dates
const getRandomDate = (start: string, end: string) => {
  const startDate = new Date(start).getTime();
  const endDate = new Date(end).getTime();
  const randomTime = startDate + Math.random() * (endDate - startDate);
  return new Date(randomTime).toISOString().split('T')[0];
};

export const INITIAL_INVOICE: InvoiceData = {
  invoiceNumber: `INV-${dateCompact}-001`,
  date: dateStr,
  dueDate: dueDateStr,
  senderName: 'URS Coffee',
  senderEmail: 'Jakarta Utara, Indonesia',
  senderAddress: 'Rukan Cordoba Blok No. H63',
  clientName: 'Shantei',
  clientEmail: '',
  clientAddress: '',
  currency: 'IDR',
  taxRate: 11,
  showItemDates: true,
  showTax: false,
  showDueDate: true,
  showNameWithLogo: false,
  notes: 'Terima kasih atas kepercayaan Anda!',
  terms: 'Pembayaran mohon ditransfer ke rekening BCA.\nNo. Rek: 1234567890\na.n. URS Coffee',
  logoImage: '',
  logoAlignment: 'right',
  logoBackgroundColor: 'transparent',
  items: [
    {
      id: '1',
      date: new Date("2025-12-01T10:30:00Z").toISOString().split('T')[0],
      description: 'Robusta Lampung Roasted Bean',
      quantity: 1,
      unit: 'kg',
      rate: 135000
    },
    {
      id: '2',
      date: new Date("2025-10-28T10:30:00Z").toISOString().split('T')[0],
      description: 'Robusta Lampung Roasted Bean',
      quantity: 1,
      unit: 'kg',
      rate: 135000
    },
    {
      id: '3',
      date: new Date("2025-09-16T10:30:00Z").toISOString().split('T')[0],
      description: 'Gula Aren Cair',
      quantity: 2,
      unit: 'liter',
      rate: 75000
    },
    {
      id: '4',
      date: new Date("2025-09-02T10:30:00Z").toISOString().split('T')[0],
      description: 'Robusta Lampung Roasted Bean',
      quantity: 1,
      unit: 'kg',
      rate: 135000
    },
    {
      id: '5',
      date: new Date("2025-08-22T10:30:00Z").toISOString().split('T')[0],
      description: 'Gula Aren Cair',
      quantity: 3,
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