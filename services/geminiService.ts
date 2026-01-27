
import { GoogleGenAI } from "@google/genai";

// Declare process to avoid TypeScript errors during build because Vite replaces it
declare var process: {
  env: {
    API_KEY: string;
  };
};

// Fallback to the key from .env if process.env.API_KEY is missing
const apiKey = process.env.API_KEY || "AIzaSyDvewEpnydylKdanAlP3QX81VP79hc1FIcFix";

const ai = new GoogleGenAI({ apiKey });

export const generateTransportSuggestion = async (start: string, end: string): Promise<string> => {
  const prompt = `從「${start}」到「${end}」的最佳交通？格式: MODE|DURATION|NOTES`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt
    });
    const text = response.text;
    return text || "train|30m|建議搭火車";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "train|??m|連線失敗";
  }
};

export const translateText = async (text: string, mode: 'to_zh' | 'to_de' | 'to_it'): Promise<string> => {
  let prompt = "";
  if (mode === 'to_zh') {
    prompt = `Translate the following text (which is likely German or Italian) into Traditional Chinese (Taiwan). Only return the translated text. Text: "${text}"`;
  } else if (mode === 'to_de') {
    prompt = `Translate the following Chinese text into German. Only return the translated text. Text: "${text}"`;
  } else if (mode === 'to_it') {
    prompt = `Translate the following Chinese text into Italian. Only return the translated text. Text: "${text}"`;
  }

  try {
     const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt
    });
    return response.text || "翻譯結果為空";
  } catch (error: any) {
    console.error("Translation Error:", error);
    // Return the actual error message so it can be displayed in the UI
    let msg = error.message || "未知錯誤";
    if (msg.includes("403")) msg = "API Key 權限不足或額度已滿";
    if (msg.includes("Failed to fetch")) msg = "網路連線失敗";
    return `[系統] 翻譯失敗: ${msg}`;
  }
};
