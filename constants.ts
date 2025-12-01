
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
  senderEmail: 'orders@urscoffee.com',
  senderAddress: 'Rukan Cordoba Blok No. H63, Jakarta Utara, Indonesia',
  clientName: 'Shantei',
  clientEmail: '',
  clientAddress: '',
  currency: 'IDR',
  taxRate: 11,
  showItemDates: true,
  showTax: false,
  showDueDate: true,
  showNameWithLogo: false,
  notes: 'URS Coffee. Terima kasih!',
  logoImage: '',
  items: [
    {
      id: '1',
      date: getRandomDate(dateStr, dueDateStr),
      description: 'Robusta Lampung Roasted Bean',
      quantity: 1,
      unit: 'kg',
      rate: 135000
    },
    {
      id: '2',
      date: getRandomDate(dateStr, dueDateStr),
      description: 'Robusta Lampung Roasted Bean',
      quantity: 1,
      unit: 'kg',
      rate: 135000
    },
    {
      id: '3',
      date: getRandomDate(dateStr, dueDateStr),
      description: 'Gula Aren Cair',
      quantity: 2,
      unit: 'liter',
      rate: 75000
    },
    {
      id: '4',
      date: getRandomDate(dateStr, dueDateStr),
      description: 'Gula Aren Cair',
      quantity: 1,
      unit: 'liter',
      rate: 75000
    },
    {
      id: '5',
      date: getRandomDate(dateStr, dueDateStr),
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