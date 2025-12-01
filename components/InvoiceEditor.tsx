import React, { useRef } from 'react';
import { Plus, Trash2, Calendar, FileText, User, MapPin, Hash, DollarSign, Percent, Eye, Upload, X, Image as ImageIcon, AlignLeft, AlignCenter, AlignRight, Palette, AlertCircle } from 'lucide-react';
import { InvoiceData, LineItem } from '../types';
import { CURRENCIES } from '../constants';

interface InvoiceEditorProps {
  data: InvoiceData;
  onChange: (data: InvoiceData) => void;
}

const MAX_DESC_LENGTH = 300;

const InvoiceEditor: React.FC<InvoiceEditorProps> = ({ data, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateField('logoImage', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-8">
      
      {/* Settings Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
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
          <div className="flex justify-between items-center mb-1">
             <label className="block text-xs font-semibold text-gray-500 uppercase">Tax Rate (%)</label>
             <label className="flex items-center gap-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={data.showTax !== false}
                  onChange={(e) => updateField('showTax', e.target.checked)}
                  className="w-3 h-3 text-brand-500 border-gray-300 rounded focus:ring-brand-500"
                />
                <span className="text-[10px] text-gray-500">Enable Tax</span>
            </label>
          </div>
          <div className="relative">
            <Percent className={`absolute left-3 top-2.5 h-4 w-4 ${data.showTax !== false ? 'text-gray-400' : 'text-gray-200'}`} />
            <input 
              type="number"
              disabled={data.showTax === false}
              value={data.taxRate}
              onChange={(e) => updateField('taxRate', parseFloat(e.target.value) || 0)}
              className={`w-full pl-9 pr-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition ${data.showTax === false ? 'bg-gray-50 text-gray-400 border-gray-200' : 'border-gray-300'}`}
            />
          </div>
        </div>

        <div className="flex flex-col justify-end h-full pb-1 gap-2">
           <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={data.showItemDates !== false}
              onChange={(e) => updateField('showItemDates', e.target.checked)}
              className="w-4 h-4 text-brand-500 border-gray-300 rounded focus:ring-brand-500"
            />
            <span className="text-sm text-gray-700 font-medium">Show Dates on Items</span>
          </label>
           <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={data.showDueDate !== false}
              onChange={(e) => updateField('showDueDate', e.target.checked)}
              className="w-4 h-4 text-brand-500 border-gray-300 rounded focus:ring-brand-500"
            />
            <span className="text-sm text-gray-700 font-medium">Show Due Date</span>
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
                  disabled={data.showDueDate === false}
                  value={data.dueDate}
                  onChange={(e) => updateField('dueDate', e.target.value)}
                  className={`w-full p-2 border rounded-md text-sm ${data.showDueDate === false ? 'bg-gray-50 text-gray-400 border-gray-200' : 'border-gray-300'}`}
                />
            </div>
         </div>
      </div>

      {/* Sender Info */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b pb-2">
          <User className="w-4 h-4 text-brand-500"/> From (Sender)
        </h3>
        
        {/* Logo Upload */}
        <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
           <div className="flex justify-between items-center mb-2">
             <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
               <ImageIcon className="w-3 h-3" /> Company Logo
             </label>
             {data.logoImage && (
                <button 
                  onClick={() => updateField('logoImage', '')}
                  className="text-[10px] text-red-500 hover:text-red-700 flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Remove
                </button>
             )}
           </div>
           
           <div className="flex items-center gap-4">
              {data.logoImage ? (
                  <div 
                    className="relative border border-gray-200 rounded p-2 flex items-center justify-center h-16 w-auto min-w-[64px]"
                    style={{ backgroundColor: data.logoBackgroundColor || 'white' }}
                  >
                      <img src={data.logoImage} alt="Logo preview" className="max-h-12 max-w-[150px] object-contain" />
                  </div>
              ) : (
                 <div className="h-16 w-16 bg-white border border-dashed border-gray-300 rounded flex items-center justify-center text-gray-300">
                    <ImageIcon className="w-6 h-6" />
                 </div>
              )}
              
              <div>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleLogoUpload} 
                />
                <button 
                  onClick={triggerFileInput}
                  className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50 transition flex items-center gap-2 shadow-sm"
                >
                  <Upload className="w-3 h-3" />
                  {data.logoImage ? 'Change Logo' : 'Upload Logo'}
                </button>
                <p className="text-[10px] text-gray-400 mt-1">Replaces "Business Name" in invoice header</p>
              </div>
           </div>

           {/* Logo Configuration Controls */}
           {data.logoImage && (
             <div className="mt-4 pt-3 border-t border-gray-200 grid grid-cols-2 gap-4">
               <div>
                 <label className="text-[10px] font-semibold text-gray-500 uppercase mb-2 block">Alignment</label>
                 <div className="flex bg-white rounded-md p-1 border border-gray-200 shadow-sm">
                    {[
                      { val: 'left', icon: AlignLeft },
                      { val: 'center', icon: AlignCenter },
                      { val: 'right', icon: AlignRight }
                    ].map((opt) => (
                        <button
                          key={opt.val}
                          onClick={() => updateField('logoAlignment', opt.val)}
                          className={`flex-1 py-1.5 flex justify-center items-center rounded transition-colors ${data.logoAlignment === opt.val ? 'bg-brand-50 text-brand-600' : 'text-gray-400 hover:bg-gray-50'}`}
                          title={opt.val}
                        >
                          <opt.icon className="w-4 h-4" />
                        </button>
                    ))}
                 </div>
               </div>
               <div>
                  <label className="text-[10px] font-semibold text-gray-500 uppercase mb-2 block flex items-center gap-1">
                    <Palette className="w-3 h-3"/> Background
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-200 shadow-sm shrink-0">
                      <input
                        type="color"
                        value={data.logoBackgroundColor || '#ffffff'}
                        onChange={(e) => updateField('logoBackgroundColor', e.target.value)}
                        className="absolute -top-2 -left-2 w-12 h-12 p-0 cursor-pointer border-none"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={data.logoBackgroundColor}
                        onChange={(e) => updateField('logoBackgroundColor', e.target.value)}
                        placeholder="transparent"
                        className="w-full p-1.5 text-xs border border-gray-300 rounded"
                      />
                    </div>
                  </div>
               </div>
             </div>
           )}
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div className="flex flex-col gap-1">
             <div className="flex justify-between items-center">
                 <label className="text-xs font-semibold text-gray-500">Business Name</label>
                 {data.logoImage && (
                    <label className="flex items-center gap-1 cursor-pointer select-none">
                        <input
                        type="checkbox"
                        checked={data.showNameWithLogo || false}
                        onChange={(e) => updateField('showNameWithLogo', e.target.checked)}
                        className="w-3 h-3 text-brand-500 border-gray-300 rounded focus:ring-brand-500"
                        />
                        <span className="text-[10px] text-gray-500">Show with Logo</span>
                    </label>
                 )}
             </div>
             <input 
                placeholder="Business Name"
                value={data.senderName}
                onChange={(e) => updateField('senderName', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
             />
          </div>
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
                <div className="relative">
                    <input 
                      maxLength={MAX_DESC_LENGTH}
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      className={`w-full p-2 pr-16 border rounded-md text-sm bg-white outline-none transition ${
                          item.description.length >= MAX_DESC_LENGTH 
                          ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100' 
                          : 'border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500'
                      }`}
                    />
                    <div className={`absolute right-2 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none transition-colors ${
                        item.description.length >= MAX_DESC_LENGTH ? 'text-red-500 font-bold' : 'text-gray-400 opacity-50'
                    }`}>
                       {item.description.length}/{MAX_DESC_LENGTH}
                    </div>
                </div>
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
                   <div className="w-20 relative">
                      <label className="text-[10px] text-gray-500 uppercase">Qty</label>
                      <input 
                        type="number" 
                        min="0"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        className={`w-full p-2 border rounded-md text-sm bg-white outline-none transition ${item.quantity < 0 ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500'}`}
                      />
                      {item.quantity < 0 && (
                        <div className="absolute top-full left-0 mt-1 flex items-center gap-1 text-[10px] text-red-500 font-medium whitespace-nowrap z-10 bg-white px-1 shadow-sm border border-red-100 rounded">
                           <AlertCircle className="w-3 h-3" />
                           <span>Min 0</span>
                        </div>
                      )}
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
                   <div className="w-28 flex-grow relative">
                      <label className="text-[10px] text-gray-500 uppercase">Rate</label>
                      <input 
                        type="number" 
                        min="0"
                        value={item.rate}
                        onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                        className={`w-full p-2 border rounded-md text-sm bg-white outline-none transition ${item.rate < 0 ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500'}`}
                      />
                      {item.rate < 0 && (
                        <div className="absolute top-full left-0 mt-1 flex items-center gap-1 text-[10px] text-red-500 font-medium whitespace-nowrap z-10 bg-white px-1 shadow-sm border border-red-100 rounded">
                           <AlertCircle className="w-3 h-3" />
                           <span>Positive value required</span>
                        </div>
                      )}
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

      {/* Notes & Terms */}
      <div className="space-y-4">
         <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b pb-2">
           <FileText className="w-4 h-4 text-brand-500"/> Notes & Terms
        </h3>
        <div>
           <label className="block text-xs font-semibold text-gray-500 mb-1">Notes</label>
           <textarea 
             value={data.notes}
             onChange={(e) => updateField('notes', e.target.value)}
             className="w-full p-2 border border-gray-300 rounded-md text-sm h-16 resize-none"
             placeholder="e.g. Thanks for your business!"
           />
        </div>
        <div>
           <label className="block text-xs font-semibold text-gray-500 mb-1">Terms & Conditions</label>
           <textarea 
             value={data.terms}
             onChange={(e) => updateField('terms', e.target.value)}
             className="w-full p-2 border border-gray-300 rounded-md text-sm h-24 resize-none"
             placeholder="e.g. Payment due in 14 days. Please include invoice number."
           />
        </div>
      </div>

    </div>
  );
};

export default InvoiceEditor;