
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { InvoiceData, AppStatus, LineItem } from './types';
import { INITIAL_INVOICE } from './constants';
import InvoiceEditor from './components/InvoiceEditor';
import InvoicePreview from './components/InvoicePreview';
import { Printer, Download, Sparkles, Loader2, AlertCircle, Trash2, CheckCircle2, Layers, ArrowLeft, FileText } from 'lucide-react';
import { generateInvoiceFromText } from './services/geminiService';

const STORAGE_KEY = 'genai-invoice-draft';

export default function App() {
  // Initialize state from localStorage if available
  const [invoice, setInvoice] = useState<InvoiceData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with INITIAL_INVOICE to ensure structure integrity if schema changes
        return { ...INITIAL_INVOICE, ...parsed };
      }
    } catch (e) {
      console.error("Failed to load invoice draft", e);
    }
    return INITIAL_INVOICE;
  });

  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [prompt, setPrompt] = useState<string>('');
  const [showAiModal, setShowAiModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Split Invoice State
  const [splitInvoices, setSplitInvoices] = useState<InvoiceData[]>([]);
  const [activeSplitIndex, setActiveSplitIndex] = useState<number>(0);
  
  // Auto-save toast state
  const [showSaveToast, setShowSaveToast] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstRender = useRef(true);

  // Auto-save effect
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Only save if we are NOT in split mode (editing the master draft)
    if (splitInvoices.length === 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(invoice));
        
        setShowSaveToast(true);
        
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        
        saveTimeoutRef.current = setTimeout(() => {
          setShowSaveToast(false);
        }, 2000);

      } catch (e) {
        console.error("Failed to save invoice draft (quota exceeded?)", e);
      }
    }
  }, [invoice, splitInvoices.length]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    setIsDownloading(true);
    const element = document.getElementById('invoice-preview-content');
    
    // @ts-ignore
    if (typeof window.html2pdf === 'undefined') {
        alert("PDF library is still loading, please try again in a moment.");
        setIsDownloading(false);
        return;
    }

    const currentData = splitInvoices.length > 0 ? splitInvoices[activeSplitIndex] : invoice;
    const filename = `Invoice-${currentData.invoiceNumber}.pdf`;

    const opt = {
      margin: 0,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        logging: false,
        scrollY: 0, // Critical fix: Force capturing from top of element
        windowWidth: document.documentElement.offsetWidth, // Ensure full width capture
        letterRendering: true
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // @ts-ignore
    window.html2pdf().set(opt).from(element).save().then(() => {
        setIsDownloading(false);
    }).catch((err: any) => {
        console.error("PDF generation failed", err);
        setIsDownloading(false);
    });
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to create a new invoice? This will clear your current draft.")) {
      setInvoice(INITIAL_INVOICE);
      setSplitInvoices([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleSplitByDate = () => {
    if (invoice.items.length === 0) {
      alert("No items to split.");
      return;
    }

    const groupedItems: Record<string, LineItem[]> = {};
    const noDateKey = invoice.date; // Default to invoice date if item has no date

    invoice.items.forEach(item => {
      const dateKey = item.date && item.date.trim() !== '' ? item.date : noDateKey;
      if (!groupedItems[dateKey]) {
        groupedItems[dateKey] = [];
      }
      groupedItems[dateKey].push(item);
    });

    const dates = Object.keys(groupedItems).sort();
    
    if (dates.length <= 1) {
      alert("All items have the same date (or no date). Cannot split.");
      return;
    }

    const newInvoices: InvoiceData[] = dates.map((date, index) => {
      const dateCompact = date.replace(/-/g, '');
      // Generate a sequence suffix based on the index
      const suffix = String(index + 1).padStart(3, '0');
      
      return {
        ...invoice,
        invoiceNumber: `INV-${dateCompact}-${suffix}`, // New number based on item date
        date: date, // Set invoice date to item date
        // Calculate a simplistic due date (e.g. 14 days after item date) if needed, 
        // or just keep original. Let's keep original or set it same as date for now.
        dueDate: invoice.dueDate, 
        items: groupedItems[date],
        showItemDates: false, // Often redundant if the whole invoice is for that date
        notes: `${invoice.notes ? invoice.notes + '\n\n' : ''}Split invoice for date: ${date}`
      };
    });

    setSplitInvoices(newInvoices);
    setActiveSplitIndex(0);
  };

  const exitSplitMode = () => {
    setSplitInvoices([]);
    setActiveSplitIndex(0);
  };

  const handleAiGenerate = async () => {
    if (!prompt.trim()) return;
    
    setStatus(AppStatus.GENERATING);
    setErrorMsg('');

    try {
      const generatedData = await generateInvoiceFromText(prompt);
      
      setInvoice(prev => ({
        ...prev,
        ...generatedData,
        items: generatedData.items && generatedData.items.length > 0 ? generatedData.items : prev.items
      }));
      
      setStatus(AppStatus.SUCCESS);
      setShowAiModal(false);
      setPrompt('');
    } catch (err) {
      console.error(err);
      setStatus(AppStatus.ERROR);
      setErrorMsg("Failed to generate invoice. Please check your API key or try a detailed prompt.");
    } finally {
        if(status !== AppStatus.ERROR) {
             setTimeout(() => setStatus(AppStatus.IDLE), 2000);
        }
    }
  };

  const isSplitMode = splitInvoices.length > 0;

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white text-gray-800">
      
      {/* Navigation / Header - Hidden on Print */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-brand-600 p-1.5 rounded-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900">
                {isSplitMode ? 'GenAI Invoice (Multi-View)' : 'GenAI Invoice'}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              
              {!isSplitMode && (
                <>
                  <button 
                    onClick={() => setShowAiModal(true)}
                    className="hidden sm:flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-700 rounded-full text-sm font-medium hover:bg-brand-100 transition border border-brand-200"
                  >
                    <Sparkles className="w-4 h-4" />
                    AI Smart Fill
                  </button>
                  
                  <div className="h-6 w-px bg-gray-200 mx-1"></div>

                  <button 
                    onClick={handleSplitByDate}
                    title="Split items into separate invoices by date"
                    className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md transition text-sm font-medium border border-gray-200"
                  >
                    <Layers className="w-4 h-4 text-brand-500" />
                    <span className="hidden sm:inline">Split by Date</span>
                  </button>

                  <button 
                    onClick={handleReset}
                    title="Clear draft and start new"
                    className="flex items-center justify-center p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-md transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}

              {isSplitMode && (
                 <button 
                    onClick={exitSplitMode}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-800 text-white rounded-md text-sm font-medium hover:bg-gray-700 transition"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Editor
                  </button>
              )}

              <button 
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition shadow-sm disabled:opacity-50"
              >
                {isDownloading ? (
                   <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                   <Download className="w-4 h-4" />
                )}
                <span>PDF</span>
              </button>

              <button 
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 transition shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {isSplitMode ? (
          /* Split View Layout */
          <div className="flex flex-col lg:flex-row gap-8">
             {/* Left Sidebar: Invoice List */}
             <div className="w-full lg:w-1/4 no-print space-y-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-brand-500"/> Generated Invoices
                  </h3>
                  <div className="space-y-2">
                    {splitInvoices.map((inv, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveSplitIndex(idx)}
                        className={`w-full text-left p-3 rounded-md text-sm border transition-all ${
                          activeSplitIndex === idx 
                          ? 'bg-brand-50 border-brand-500 ring-1 ring-brand-500 text-brand-900' 
                          : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                           <span className="font-semibold">{inv.date}</span>
                           <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{inv.items.length} items</span>
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          #{inv.invoiceNumber}
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                    <p>Select an invoice to preview or print.</p>
                  </div>
                </div>
             </div>

             {/* Right: Preview Area */}
             <div className="w-full lg:w-3/4">
               <InvoicePreview data={splitInvoices[activeSplitIndex]} />
             </div>
          </div>
        ) : (
          /* Standard Editor Layout */
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Left: Editor - Hidden on Print */}
            <div className="w-full lg:w-5/12 xl:w-1/3 no-print space-y-6">
              
              {/* Mobile AI Button */}
              <button 
                  onClick={() => setShowAiModal(true)}
                  className="w-full sm:hidden flex items-center justify-center gap-2 px-4 py-3 bg-brand-50 text-brand-700 rounded-lg text-sm font-bold hover:bg-brand-100 transition border border-brand-200 mb-4"
                >
                  <Sparkles className="w-4 h-4" />
                  Auto-Fill with AI
                </button>

              <div className="sticky top-24">
                <InvoiceEditor data={invoice} onChange={setInvoice} />
              </div>
            </div>

            {/* Right: Preview - Full Width on Print */}
            <div className="w-full lg:w-7/12 xl:w-2/3 print:w-full">
              <div className="lg:sticky lg:top-24">
                  <InvoicePreview data={invoice} />
                  
                  <div className="mt-8 text-center text-gray-400 text-xs no-print">
                    <p>Tip: Use "PDF" button or Print > Save as PDF for best results.</p>
                  </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Auto-save Toast Notification */}
      <div 
        className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium transition-all duration-300 z-50 no-print ${showSaveToast ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'}`}
      >
        <CheckCircle2 className="w-4 h-4 text-green-400" />
        <span>Draft saved automatically</span>
      </div>

      {/* AI Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-brand-500" />
                  AI Smart Fill
                </h3>
                <button onClick={() => setShowAiModal(false)} className="text-gray-400 hover:text-gray-600">
                  <span className="sr-only">Close</span>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Paste any rough notes, chat logs, or email text below. Gemini will extract the invoice details, line items, and addresses automatically.
              </p>

              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Bill John Smith at 123 Main St for 5 hours of consulting at $100/hr and a $50 software license. Invoice #999 due next Friday."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none resize-none mb-4"
              />

              {status === AppStatus.ERROR && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md flex items-start gap-2">
                   <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                   <span>{errorMsg || "An error occurred."}</span>
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => setShowAiModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAiGenerate}
                  disabled={status === AppStatus.GENERATING || !prompt.trim()}
                  className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-md hover:bg-brand-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {status === AppStatus.GENERATING ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Generate Invoice'
                  )}
                </button>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 text-xs text-gray-500">
               Powered by Gemini 2.5 Flash
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
