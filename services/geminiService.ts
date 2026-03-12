
import { GoogleGenAI, Type } from "@google/genai";
import { TemplateField, FieldType } from "../types";

export interface DetectionResult {
  fields: TemplateField[];
  suggestedTitle: string;
  processedContent: string; // Now expected to be high-fidelity HTML
}

// Simple Promise Queue to ensure sequential execution
class TaskQueue {
  private queue: (() => Promise<void>)[] = [];
  private isProcessing = false;

  async enqueue<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await task();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.processNext();
    });
  }

  private async processNext() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;
    const task = this.queue.shift();
    if (task) {
      await task();
    }
    this.isProcessing = false;
    this.processNext();
  }
}

const apiQueue = new TaskQueue();

export const detectTemplateFields = async (
  fileData?: string, 
  mimeType?: string, 
  rawText?: string,
  onRetry?: (attempt: number) => void
): Promise<DetectionResult> => {
  return apiQueue.enqueue(() => executeDetection(fileData, mimeType, rawText, onRetry));
};

const executeDetection = async (
  fileData?: string, 
  mimeType?: string, 
  rawText?: string,
  onRetry?: (attempt: number) => void
): Promise<DetectionResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const parts: any[] = [];
  
  const supportedMultimodalTypes = [
    'application/pdf', 
    'image/png', 
    'image/jpeg', 
    'image/webp', 
    'image/heic', 
    'image/heif'
  ];
  
  const isBinarySupported = fileData && mimeType && supportedMultimodalTypes.includes(mimeType);

  if (isBinarySupported) {
    parts.push({
      inlineData: {
        data: fileData,
        mimeType: mimeType
      }
    });
  }

  const textContext = rawText ? `\n\nEXTRACTED TEXT FOR CONTEXT:\n${rawText}` : "";

  const prompt = `You are a world-class Document Layout & Brand Engineer.
    
    TASK:
    1. Analyze the uploaded document's layout, typography, and color palette.
    2. Convert this document into a high-fidelity HTML/CSS template. 
    3. The HTML MUST use inline styles or a <style> block to replicate the original document's look (fonts, colors, spacing, alignment).
    4. Identify professional editable variables (e.g., Names, Dates, Amounts, Project Titles).
    5. Replace these variables in the HTML with double-curly placeholders like {{variableName}}.
    6. Ensure the result is a valid HTML fragment that looks like a professional A4 document.

    DATA EXTRACTION:
    - Identify field types (STRING, NUMBER, DATE, or DROPDOWN).
    - Suggest a professional title for the template.

    ${textContext}
    
    RETURN JSON SCHEMA:
    {
      "suggestedTitle": "Document Title",
      "processedContent": "<html>... (High fidelity HTML version of the document with {{placeholders}}) ...</html>",
      "fields": [
        {
          "variableName": "camelCaseName",
          "label": "Human Readable Label",
          "type": "STRING|NUMBER|DATE|DROPDOWN",
          "required": true,
          "defaultValue": "Optional initial value",
          "options": ["Option 1", "Option 2"]
        }
      ]
    }`;

  parts.push({ text: prompt });

  let retries = 0;
  const maxRetries = 3;
  let delay = 1000;

  while (retries <= maxRetries) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: { parts },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              suggestedTitle: { type: Type.STRING },
              processedContent: { 
                type: Type.STRING, 
                description: "The complete document as styled HTML with placeholders." 
              },
              fields: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    variableName: { type: Type.STRING },
                    label: { type: Type.STRING },
                    type: { type: Type.STRING },
                    required: { type: Type.BOOLEAN },
                    defaultValue: { type: Type.STRING },
                    options: { 
                      type: Type.ARRAY, 
                      items: { type: Type.STRING }
                    }
                  },
                  required: ["variableName", "label", "type", "required"]
                }
              }
            },
            required: ["suggestedTitle", "processedContent", "fields"]
          }
        }
      });
      
      const data = JSON.parse(response.text || "{}");
      const fields: TemplateField[] = data.fields.map((f: any, idx: number) => ({
        id: `field-${idx}-${Date.now()}`,
        name: f.variableName,
        type: f.type as FieldType,
        required: f.required,
        defaultValue: f.defaultValue,
        options: f.options
      }));
      return { 
        fields, 
        suggestedTitle: data.suggestedTitle,
        processedContent: data.processedContent 
      };
    } catch (err: any) {
      const isRateLimit = err?.status === 429 || err?.message?.includes("429");
      if (isRateLimit && retries < maxRetries) {
        retries++;
        if (onRetry) onRetry(retries);
        await new Promise(res => setTimeout(res, delay));
        delay *= 2; // Exponential backoff
        continue;
      }
      if (isRateLimit && retries >= maxRetries) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      
      console.error("Failed to parse AI response or logic API error", err);
      // Logic for explicit non rate-limit error fallback
      return { 
        fields: [], 
        suggestedTitle: "Untitled Template", 
        processedContent: `<div style="font-family: serif; padding: 40px;">${rawText || "Extraction Error"}</div>` 
      };
    }
  }
  
  throw new Error("Unexpected end of retry loop");
};

