
import React from 'react';
import { InvoiceData } from '../types';
import { CURRENCIES } from '../constants';

interface InvoicePreviewProps {
  data: InvoiceData;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ data }) => {
  const currencyInfo = CURRENCIES.find(c => c.code === data.currency) || CURRENCIES[0];
  
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat(currencyInfo.locale, {
      style: 'currency',
      currency: currencyInfo.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const showTax = data.showTax !== false;
  const subtotal = data.items.reduce((acc, item) => acc + (item.quantity * item.rate), 0);
  const taxAmount = showTax ? subtotal * (data.taxRate / 100) : 0;
  const total = subtotal + taxAmount;
  
  const showDates = data.showItemDates !== false;
  const logoAlign = data.logoAlignment || 'right';
  const logoBg = data.logoBackgroundColor || 'transparent';

  return (
    // Outer wrapper handles the visual presentation (shadow, centering) on the screen
    // We do NOT put the ID here to avoid capturing shadows in the PDF
    <div className="invoice-preview-wrapper bg-white shadow-xl rounded-sm w-full max-w-[210mm] mx-auto print:shadow-none">
      
      {/* This inner container is what gets converted to PDF. It must be clean white. */}
      <div id="invoice-preview-content" className="w-full min-h-[297mm] p-12 text-gray-800 relative flex flex-col bg-white">
        
        {/* Top Section: Logo (Full Width Row) */}
        {data.logoImage && (
          <div className={`mb-8 flex ${logoAlign === 'center' ? 'justify-center' : logoAlign === 'left' ? 'justify-start' : 'justify-end'}`}>
            <div className="inline-block rounded overflow-hidden" style={{ backgroundColor: logoBg }}>
               <img src={data.logoImage} alt="Logo" className="h-20 object-contain max-w-[300px] p-2" />
            </div>
          </div>
        )}

        {/* Header Info Grid */}
        <div className="flex justify-between items-start mb-12">
          {/* Left Column: Invoice Title & Number */}
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">INVOICE</h1>
            <p className="text-gray-500 font-medium">#{data.invoiceNumber}</p>
          </div>

          {/* Right Column: Sender Info */}
          <div className="text-right">
            {(data.showNameWithLogo || !data.logoImage) && (
                 <h2 className="text-xl font-bold text-gray-800">{data.senderName}</h2>
            )}

            <div className="text-sm text-gray-500 mt-1 whitespace-pre-wrap max-w-[250px] ml-auto">
              {data.senderAddress}
            </div>
            {data.senderEmail && (
                <p className="text-sm text-gray-500 mt-1">{data.senderEmail}</p>
            )}
          </div>
        </div>

        {/* Bill To & Details */}
        <div className="flex justify-between mb-12">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Bill To</h3>
            <p className="font-bold text-gray-800 text-lg">{data.clientName || 'Client Name'}</p>
            <div className="text-sm text-gray-600 mt-1 whitespace-pre-wrap max-w-[300px]">
              {data.clientAddress || 'Client Address'}
            </div>
            {data.clientEmail && (
                <p className="text-sm text-gray-600 mt-1">{data.clientEmail}</p>
            )}
          </div>
          <div className="text-right space-y-2">
            <div>
              <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Date</span>
              <span className="text-sm font-medium">{data.date}</span>
            </div>
            {data.showDueDate !== false && (
            <div>
              <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Due Date</span>
              <span className="text-sm font-medium">{data.dueDate}</span>
            </div>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-100">
                {showDates && (
                  <th className="text-left py-3 text-xs font-bold text-gray-400 uppercase tracking-wider w-1/6">Date</th>
                )}
                <th className={`text-left py-3 text-xs font-bold text-gray-400 uppercase tracking-wider ${showDates ? 'w-1/3' : 'w-1/2'}`}>Description</th>
                <th className="text-right py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Qty</th>
                <th className="text-right py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Rate</th>
                <th className="text-right py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {data.items.map((item) => (
                <tr key={item.id} className="border-b border-gray-50">
                  {showDates && (
                    <td className="py-4 text-gray-600 whitespace-nowrap align-top pr-2">
                        {item.date || '-'}
                    </td>
                  )}
                  <td className="py-4 font-medium text-gray-800 break-words pr-4 align-top">{item.description}</td>
                  <td className="py-4 text-right text-gray-600 align-top">
                    {item.quantity} <span className="text-gray-400 text-xs">{item.unit}</span>
                  </td>
                  <td className="py-4 text-right text-gray-600 align-top">{formatMoney(item.rate)}</td>
                  <td className="py-4 text-right font-semibold text-gray-800 align-top">{formatMoney(item.quantity * item.rate)}</td>
                </tr>
              ))}
              {data.items.length === 0 && (
                  <tr>
                      <td colSpan={showDates ? 5 : 4} className="py-8 text-center text-gray-400 italic">No items added yet.</td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-12">
          <div className="w-64 space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatMoney(subtotal)}</span>
              </div>
              {showTax && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax ({data.taxRate}%)</span>
                  <span>{formatMoney(taxAmount)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-lg text-gray-900">
                <span>Total</span>
                <span>{formatMoney(total)}</span>
              </div>
          </div>
        </div>

        {/* Notes & Terms Footer */}
        <div className="mt-auto pt-8 border-t border-gray-100 space-y-6">
          {data.notes && (
            <div>
               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Notes</h3>
               <p className="text-sm text-gray-600 whitespace-pre-wrap">{data.notes}</p>
            </div>
          )}
          {data.terms && (
            <div>
               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Terms & Conditions</h3>
               <p className="text-sm text-gray-600 whitespace-pre-wrap">{data.terms}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;