
import { GoogleGenAI } from "@google/genai";

// Declare process to avoid TypeScript errors during build because Vite replaces it
declare var process: {
  env: {
    API_KEY: string;
  };
};

const DEFAULT_KEY = "AIzaSyDvewEpnydylKdanAlP3QX81VP79hc1FIcFix";

const getApiKey = () => {
    // 1. Try standard process.env (Vite injected via define)
    if (process.env.API_KEY && process.env.API_KEY !== "undefined" && process.env.API_KEY !== DEFAULT_KEY) {
        return process.env.API_KEY;
    }

    // 2. Try Vite's import.meta.env
    // @ts-ignore
    if (import.meta.env?.VITE_API_KEY) {
        // @ts-ignore
        return import.meta.env.VITE_API_KEY;
    }

    // 3. Fallback
    return DEFAULT_KEY;
}

const apiKey = getApiKey();
console.log("Gemini Service initialized. Key loaded:", apiKey === DEFAULT_KEY ? "Default (Placeholder)" : "Custom Key from Env");

const ai = new GoogleGenAI({ apiKey });

export const generateTransportSuggestion = async (start: string, end: string): Promise<string> => {
  if (apiKey === DEFAULT_KEY) {
    return "train|0m|請在電腦端設定 .env 並重啟伺服器";
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
    return "train|??m|連線失敗(請檢查電腦端 .env)";
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
    // Catch common API key errors
    if (msg.includes("400") || msg.includes("403") || msg.includes("API key not valid")) {
        return "[系統] API Key 無效。請檢查電腦端的 .env 檔案是否正確，並務必「重啟伺服器」(Ctrl+C -> npm run dev)。";
    }
    if (msg.includes("429")) msg = "請求次數過多 (Quota Exceeded)";
    if (msg.includes("Failed to fetch")) msg = "網路連線失敗";
    
    return `[系統] 翻譯失敗: ${msg}`;
  }
};
