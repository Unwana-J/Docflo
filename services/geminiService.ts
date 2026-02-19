import { apiFetch } from './api';
import { DetectionResult, TemplateField, FieldCategory } from '../types';

export const detectTemplateFields = async (
  fileData: string,
  mimeType: string,
  _rawText?: string
): Promise<DetectionResult> => {
  try {
    const data = await apiFetch<any>("/ai/detect-fields", {
      method: "POST",
      body: JSON.stringify({ fileData, mimeType }),
    });

    return {
      fields: data.fields || [],
      suggestedTitle: data.suggestedTitle || "New Template",
      processedContent: ""
    };
  } catch (err: any) {
    console.error("Field Detection Error:", err);
    throw new Error(err.message || "Failed to analyze document with AI.");
  }
};

export const fillFormWithAI = async (
  templateName: string,
  fields: TemplateField[],
  userInstruction: string
): Promise<Record<string, string>> => {
  try {
    const dynamicFields = fields.filter(f => f.category === FieldCategory.DYNAMIC).map(f => f.name).join(', ');
    const data = await apiFetch<any>("/ai/fill-form", {
      method: "POST",
      body: JSON.stringify({ templateName, dynamicFields, userInstruction }),
    });
    return data || {};
  } catch (err) {
    console.error("AI Fill failed", err);
    return {};
  }
};

export const suggestSubCategories = async (categoryName: string): Promise<string[]> => {
  try {
    const data = await apiFetch<string[]>("/ai/suggest-categories", {
      method: "POST",
      body: JSON.stringify({ categoryName }),
    });
    return data || [];
  } catch (err) {
    return [];
  }
};

export const suggestFieldMapping = async (fieldList: string, headerList: string): Promise<Record<string, string>> => {
  try {
    const data = await apiFetch<Record<string, string>>("/ai/suggest-mapping", {
      method: "POST",
      body: JSON.stringify({ fieldList, headerList }),
    });
    return data || {};
  } catch (err) {
    console.error("Field Mapping Error:", err);
    return {};
  }
};
