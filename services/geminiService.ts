
import { GoogleGenAI, Type } from "@google/genai";
import { InvoiceData, LineItem } from '../types';

export const generateInvoiceFromText = async (promptText: string): Promise<Partial<InvoiceData>> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Extract invoice details from the following text. 
    
    Important instructions:
    1. If the text looks like raw data or a list, parse it into line items.
    2. Handle Indonesian/European number formats where a comma (,) is often used as a decimal separator (e.g., "0,5" means 0.5).
    3. Extract units of measurement (e.g., kg, liter, pcs, pack) if present.
    4. Extract specific dates for line items if mentioned.
    5. GENERATE Invoice Number with format "INV-{YYYYMMDD}-{Sequence}" (e.g. INV-20231025-001) based on the Invoice Date.
    6. For Line Items: If no specific date is mentioned for an item, generate a date for it that falls strictly within the range of the Invoice Date and the Due Date (inclusive).
    7. Today's date is ${new Date().toISOString().split('T')[0]}.
    
    Text to process: "${promptText}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          invoiceNumber: { type: Type.STRING },
          date: { type: Type.STRING, description: "YYYY-MM-DD format" },
          dueDate: { type: Type.STRING, description: "YYYY-MM-DD format" },
          senderName: { type: Type.STRING },
          senderAddress: { type: Type.STRING },
          clientName: { type: Type.STRING },
          clientAddress: { type: Type.STRING },
          currency: { type: Type.STRING, description: "Currency code e.g. IDR, USD" },
          notes: { type: Type.STRING },
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING, description: "Item specific date in YYYY-MM-DD format. Must be between Invoice Date and Due Date." },
                description: { type: Type.STRING },
                quantity: { type: Type.NUMBER },
                unit: { type: Type.STRING, description: "Unit like kg, liter, pcs" },
                rate: { type: Type.NUMBER }
              },
              required: ["description", "quantity", "rate"]
            }
          }
        }
      }
    }
  });

  if (response.text) {
    try {
        const data = JSON.parse(response.text);
        // Add IDs to items as they are required by our frontend state
        if (data.items && Array.isArray(data.items)) {
            data.items = data.items.map((item: Omit<LineItem, 'id'>) => ({
                ...item,
                unit: item.unit || 'pcs', // Default unit if missing
                id: crypto.randomUUID()
            }));
        }
        return data;
    } catch (e) {
        console.error("Failed to parse Gemini response", e);
        throw new Error("Failed to parse invoice data from AI response.");
    }
  }
  
  throw new Error("No data returned from Gemini.");
};
