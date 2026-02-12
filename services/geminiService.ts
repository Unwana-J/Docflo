
import { GoogleGenAI, Type } from "@google/genai";
import { TemplateField, FieldType, FieldCategory } from "../types";

const getGeminiClient = () => {
  // Prefer Vite-style client env; fall back to any injected process env for flexibility
  const apiKey =
    (typeof import.meta !== "undefined" &&
      (import.meta as any).env &&
      ((import.meta as any).env.VITE_GEMINI_API_KEY as string | undefined)) ||
    (typeof process !== "undefined" &&
      (process.env.GEMINI_API_KEY || process.env.API_KEY)) ||
    "";

  if (!apiKey) {
    throw new Error(
      "Gemini API key is not configured. Set VITE_GEMINI_API_KEY in your environment."
    );
  }

  return new GoogleGenAI({ apiKey });
};

export interface DetectionResult {
  fields: TemplateField[];
  suggestedTitle: string;
  processedContent: string; 
}

export const detectTemplateFields = async (
  fileData: string, 
  mimeType: string, 
  rawText?: string
): Promise<DetectionResult> => {
  // Guard against massive payloads that cause RPC failures
  const approxSizeInMB = (fileData.length * (3/4)) / (1024 * 1024);
  if (approxSizeInMB > 10) {
    throw new Error("The document image is too large for AI analysis. Please try a smaller file or lower resolution.");
  }

  const ai = getGeminiClient();
  const parts: any[] = [];
  
  parts.push({
    inlineData: {
      data: fileData,
      mimeType: mimeType
    }
  });

  const prompt = `You are a High-Fidelity Document & Branding Engineer.

    TASK:
    1. Scan the provided document.
    2. Identify ONLY the DYNAMIC VARIABLE FIELDS where users should enter data.
    3. For EACH field, return its exact normalized coordinates [ymin, xmin, ymax, xmax] (0-1000).
    4. CRITICAL: Analyze the typography SURROUNDING each field. Detect the required Color (HEX), Font Weight, and Text Alignment so overlaid text looks NATIVE to the original design.
    5. Ignore static logos, headers, and standard branding—those are part of the master background.

    RETURN JSON SCHEMA:
    {
      "suggestedTitle": "Title",
      "fields": [
        {
          "variableName": "name",
          "label": "Label",
          "type": "STRING|NUMBER|DATE",
          "rect": { "ymin": 0, "xmin": 0, "ymax": 0, "xmax": 0 },
          "style": {
            "color": "#HEX",
            "fontWeight": "normal|bold|600",
            "textAlign": "left|center|right",
            "fontSize": "12pt"
          }
        }
      ]
    }`;

  parts.push({ text: prompt });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedTitle: { type: Type.STRING },
            fields: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  variableName: { type: Type.STRING },
                  label: { type: Type.STRING },
                  type: { type: Type.STRING },
                  rect: {
                    type: Type.OBJECT,
                    properties: {
                      ymin: { type: Type.NUMBER },
                      xmin: { type: Type.NUMBER },
                      ymax: { type: Type.NUMBER },
                      xmax: { type: Type.NUMBER }
                    }
                  },
                  style: {
                    type: Type.OBJECT,
                    properties: {
                      color: { type: Type.STRING },
                      fontWeight: { type: Type.STRING },
                      textAlign: { type: Type.STRING },
                      fontSize: { type: Type.STRING }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    const fields: TemplateField[] = (data.fields || []).map((f: any, idx: number) => ({
      id: `field-${idx}-${Date.now()}`,
      name: f.variableName,
      type: f.type as FieldType,
      category: FieldCategory.DYNAMIC,
      required: true,
      rect: f.rect,
      style: f.style,
      pageIndex: 0
    }));
    return { 
      fields, 
      suggestedTitle: data.suggestedTitle || "Untitled",
      processedContent: "" 
    };
  } catch (err: any) {
    console.error("Coordinate detection failed", err);
    if (err.message?.includes("Rpc failed") || err.message?.includes("500")) {
      throw new Error("AI Server encountered an error processing the image. Try compressing the file or using a smaller image.");
    }
    throw err;
  }
};

export const fillFormWithAI = async (
  templateName: string,
  fields: TemplateField[],
  userInstruction: string
): Promise<Record<string, string>> => {
  const ai = getGeminiClient();
  const dynamicFields = fields.filter(f => f.category === FieldCategory.DYNAMIC).map(f => f.name).join(', ');
  const prompt = `Fill these variables for "${templateName}": [${dynamicFields}]. User request: "${userInstruction}". Return JSON.`;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (err) {
    console.error("AI Fill failed", err);
    return {};
  }
};

export const suggestSubCategories = async (categoryName: string): Promise<string[]> => {
  const ai = getGeminiClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Suggest sub-categories for department ${categoryName}. Return JSON array of strings.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "[]");
  } catch (err) {
    return [];
  }
};

// Bulk / CSV helpers

export const mapTemplateFieldsToCsvHeaders = async (
  templateFieldNames: string[],
  csvHeaders: string[]
): Promise<Record<string, string | null>> => {
  const ai = getGeminiClient();

  const fieldList = templateFieldNames.join(", ");
  const headerList = csvHeaders.join(", ");

  const prompt = `I have a template with these fields: [${fieldList}].
I have a CSV with these headers: [${headerList}].
Please map each template field to the most likely CSV header.
Return a JSON object where keys are template fields and values are CSV headers.
If no match, use null.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const mapping = JSON.parse(response.text || "{}");
    return mapping;
  } catch (err) {
    console.error("AI mapping for template fields failed", err);
    return {};
  }
};

export const mapCustomerCsvHeaders = async (
  rawHeaderLine: string
): Promise<Record<string, string | null>> => {
  const ai = getGeminiClient();

  const prompt = `I have a CSV with these headers: "${rawHeaderLine}".
Please map them to the following fields: [name, email, company, phone].
Return a JSON object where keys are my target fields and values are the CSV header names.
If a header doesn't exist, use null.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const mapping = JSON.parse(response.text || "{}");
    return mapping;
  } catch (err) {
    console.error("AI header mapping for customers failed", err);
    return {};
  }
};
