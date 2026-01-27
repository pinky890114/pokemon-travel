
import { GoogleGenAI } from "@google/genai";

declare var process: {
  env: {
    API_KEY: string;
    [key: string]: string | undefined;
  };
};

const DEFAULT_KEY = "AIzaSyDvewEpnydylKdanAlP3QX81VP79hc1FIcFix";

const getApiKey = () => {
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY && process.env.API_KEY !== "undefined") {
        return process.env.API_KEY;
    }
    // @ts-ignore
    if (import.meta.env?.VITE_API_KEY) {
        // @ts-ignore
        return import.meta.env.VITE_API_KEY;
    }
    if (typeof process !== 'undefined' && process.env && process.env.VITE_API_KEY) {
        return process.env.VITE_API_KEY;
    }
    return DEFAULT_KEY;
}

const apiKey = getApiKey();
console.log("Gemini Service initialized.");

const ai = new GoogleGenAI({ apiKey });

export const generateTransportSuggestion = async (start: string, end: string): Promise<string> => {
  if (!apiKey || apiKey === DEFAULT_KEY) {
    return "train|0m|API Key 未設定。請在 Vercel 設定環境變數 API_KEY。";
  }

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
    return "train|??m|連線失敗(請檢查 API Key)";
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
    
    let msg = error.message || "未知錯誤";
    if (msg.includes("400") || msg.includes("403") || msg.includes("API key not valid")) {
        return "[系統] API Key 無效或未設定。如果您在 Vercel，請至 Settings > Environment Variables 設定 API_KEY 並重新部署。";
    }
    if (msg.includes("429")) msg = "請求次數過多 (Quota Exceeded)";
    if (msg.includes("Failed to fetch")) msg = "網路連線失敗";
    
    return `[系統] 翻譯失敗: ${msg}`;
  }
};
