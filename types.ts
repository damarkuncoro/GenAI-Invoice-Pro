
export interface LineItem {
  id: string;
  date?: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  senderName: string;
  senderEmail: string;
  senderAddress: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  currency: string;
  taxRate: number;
  showItemDates?: boolean;
  showTax?: boolean;
  showDueDate?: boolean;
  showNameWithLogo?: boolean;
  notes: string;
  items: LineItem[];
  logoImage?: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS'
}