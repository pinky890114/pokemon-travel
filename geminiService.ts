
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
