
import React from 'react';
import { Plus, Trash2, Calendar, FileText, User, MapPin, Hash, DollarSign, Percent, Eye } from 'lucide-react';
import { InvoiceData, LineItem } from '../types';
import { CURRENCIES } from '../constants';

interface InvoiceEditorProps {
  data: InvoiceData;
  onChange: (data: InvoiceData) => void;
}

const InvoiceEditor: React.FC<InvoiceEditorProps> = ({ data, onChange }) => {
  
  const updateField = (field: keyof InvoiceData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const updateItem = (id: string, field: keyof LineItem, value: any) => {
    const newItems = data.items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    );
    updateField('items', newItems);
  };

  const addItem = () => {
    const newItem: LineItem = {
      id: crypto.randomUUID(),
      description: 'New Item',
      quantity: 1,
      unit: 'pcs',
      rate: 0
    };
    updateField('items', [...data.items, newItem]);
  };

  const removeItem = (id: string) => {
    updateField('items', data.items.filter(item => item.id !== id));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-8">
      
      {/* Settings Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Currency</label>
          <div className="relative">
             <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <select 
              value={data.currency}
              onChange={(e) => updateField('currency', e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.code} - {c.symbol}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tax Rate (%)</label>
          <div className="relative">
            <Percent className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input 
              type="number"
              value={data.taxRate}
              onChange={(e) => updateField('taxRate', parseFloat(e.target.value) || 0)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
            />
          </div>
        </div>
        <div className="pb-2">
           <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={data.showItemDates !== false}
              onChange={(e) => updateField('showItemDates', e.target.checked)}
              className="w-4 h-4 text-brand-500 border-gray-300 rounded focus:ring-brand-500"
            />
            <span className="text-sm text-gray-700 font-medium">Show Dates on Items</span>
          </label>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="space-y-4">
         <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b pb-2">
            <Hash className="w-4 h-4 text-brand-500"/> Invoice Details
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Number</label>
              <input 
                type="text" 
                value={data.invoiceNumber}
                onChange={(e) => updateField('invoiceNumber', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Date</label>
              <div className="relative">
                <input 
                  type="date" 
                  value={data.date}
                  onChange={(e) => updateField('date', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Due Date</label>
               <input 
                  type="date" 
                  value={data.dueDate}
                  onChange={(e) => updateField('dueDate', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                />
            </div>
         </div>
      </div>

      {/* Sender Info */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b pb-2">
          <User className="w-4 h-4 text-brand-500"/> From (Sender)
        </h3>
        <div className="grid grid-cols-1 gap-3">
          <input 
            placeholder="Business Name"
            value={data.senderName}
            onChange={(e) => updateField('senderName', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
          />
          <input 
             placeholder="Email"
             value={data.senderEmail}
             onChange={(e) => updateField('senderEmail', e.target.value)}
             className="w-full p-2 border border-gray-300 rounded-md text-sm"
          />
          <textarea 
            placeholder="Address"
            value={data.senderAddress}
            onChange={(e) => updateField('senderAddress', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm h-20 resize-none"
          />
        </div>
      </div>

      {/* Client Info */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b pb-2">
           <User className="w-4 h-4 text-brand-500"/> To (Client)
        </h3>
        <div className="grid grid-cols-1 gap-3">
          <input 
            placeholder="Client Name"
            value={data.clientName}
            onChange={(e) => updateField('clientName', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
          />
           <input 
             placeholder="Client Email"
             value={data.clientEmail}
             onChange={(e) => updateField('clientEmail', e.target.value)}
             className="w-full p-2 border border-gray-300 rounded-md text-sm"
          />
          <textarea 
            placeholder="Client Address"
            value={data.clientAddress}
            onChange={(e) => updateField('clientAddress', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm h-20 resize-none"
          />
        </div>
      </div>

      {/* Line Items */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b pb-2">
           <FileText className="w-4 h-4 text-brand-500"/> Items
        </h3>
        <div className="space-y-3">
          {data.items.map((item) => (
            <div key={item.id} className="flex flex-col sm:flex-row gap-2 items-start p-3 bg-gray-50 rounded-md border border-gray-100 group">
              <div className="flex-grow space-y-2 w-full">
                <input 
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white"
                />
                <div className="flex gap-2 flex-wrap">
                   {data.showItemDates !== false && (
                   <div className="w-32">
                      <label className="text-[10px] text-gray-500 uppercase">Date</label>
                      <input 
                        type="date" 
                        value={item.date || ''}
                        onChange={(e) => updateItem(item.id, 'date', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white"
                      />
                   </div>
                   )}
                   <div className="w-20">
                      <label className="text-[10px] text-gray-500 uppercase">Qty</label>
                      <input 
                        type="number" 
                        min="0"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white"
                      />
                   </div>
                   <div className="w-20">
                      <label className="text-[10px] text-gray-500 uppercase">Unit</label>
                      <input 
                        type="text" 
                        value={item.unit}
                        onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                        placeholder="kg, pcs"
                        className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white"
                      />
                   </div>
                   <div className="w-28 flex-grow">
                      <label className="text-[10px] text-gray-500 uppercase">Rate</label>
                      <input 
                        type="number" 
                        min="0"
                        value={item.rate}
                        onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white"
                      />
                   </div>
                </div>
              </div>
              <button 
                onClick={() => removeItem(item.id)}
                className="mt-8 text-red-400 hover:text-red-600 p-1 rounded transition"
                title="Remove Item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button 
            onClick={addItem}
            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-md text-gray-500 hover:border-brand-500 hover:text-brand-500 transition flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Add Line Item
          </button>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-4">
         <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b pb-2">
           <FileText className="w-4 h-4 text-brand-500"/> Terms & Notes
        </h3>
        <textarea 
          value={data.notes}
          onChange={(e) => updateField('notes', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md text-sm h-24 resize-none"
          placeholder="Enter notes or terms..."
        />
      </div>

    </div>
  );
};

export default InvoiceEditor;