
import { GoogleGenAI } from "@google/genai";

// 檢查 API Key 是否存在
const apiKey = process.env.API_KEY;

// 如果沒有 Key，不要初始化 client，避免直接噴錯，而是在函式內回傳提示
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateTransportSuggestion = async (start: string, end: string): Promise<string> => {
  if (!ai) {
      return "train|??m|[系統] 尚未設定 API Key (請至 Vercel Settings > Environment Variables 新增 API_KEY)";
  }

  const prompt = `從「${start}」到「${end}」的最佳交通？格式: MODE|DURATION|NOTES`;
  try {
    // @google/genai: Using gemini-3-flash-preview for basic text tasks.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt
    });
    const text = response.text;
    return text || "train|30m|建議搭火車";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // Check for API key issues
    const msg = error.message || "";
    if (msg.includes("400") || msg.includes("403") || msg.includes("API key not valid")) {
         return "train|??m|API Key 無效 (可能過期或專案未啟用 Gemini API)";
    }
    
    return "train|??m|AI 連線失敗 (請稍後再試)";
  }
};

export const translateText = async (text: string, mode: 'to_zh' | 'to_de' | 'to_it'): Promise<string> => {
  if (!ai) {
      return "[系統] 錯誤：尚未設定 API Key。\n\n請在 Vercel 後台 (Settings > Environment Variables) 新增名為 'API_KEY' 的變數，並填入您的 Google AI Studio 金鑰，設定後請記得 Redeploy。";
  }

  let prompt = "";
  if (mode === 'to_zh') {
    prompt = `Translate the following text (which is likely German or Italian) into Traditional Chinese (Taiwan). Only return the translated text. Text: "${text}"`;
  } else if (mode === 'to_de') {
    prompt = `Translate the following Chinese text into German. Only return the translated text. Text: "${text}"`;
  } else if (mode === 'to_it') {
    prompt = `Translate the following Chinese text into Italian. Only return the translated text. Text: "${text}"`;
  }

  try {
     // @google/genai: Using gemini-3-flash-preview for translation (basic text task).
     const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt
    });
    return response.text || "翻譯結果為空";
  } catch (error: any) {
    console.error("Translation Error:", error);
    
    let msg = error.message || "未知錯誤";
    if (msg.includes("400") || msg.includes("403") || msg.includes("API key not valid")) {
        return "[系統] API Key 無效。請檢查 Vercel 環境變數中的 API_KEY 是否正確，或金鑰對應的 Google Cloud 專案是否已啟用 Gemini API。";
    }
    if (msg.includes("429")) msg = "請求次數過多 (Quota Exceeded)";
    if (msg.includes("Failed to fetch")) msg = "網路連線失敗";
    
    return `[系統] 翻譯失敗: ${msg}`;
  }
};

export const checkWeatherWithAI = async (location: string, date: string): Promise<string> => {
  if (!ai) {
      return "⚠️ 尚未設定 API Key，無法啟用 AI 驗證功能。";
  }

  const prompt = `請幫我查詢「${location}」在「${date}」的天氣預報。
  請簡短回答當天的「最高溫」、「最低溫」以及「天氣狀況」(例如晴天、雨天)。
  
  回答格式範例：
  氣溫：1°C ~ 6°C
  狀況：多雲時陰，午後有短暫陣雨。
  
  (請使用繁體中文回答)`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Using flash preview which supports googleSearch
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}], // Enable Google Search Grounding
      },
    });
    
    let text = response.text || "無法取得 AI 回覆";
    
    // Append source links if available
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks && chunks.length > 0) {
        // Simple extraction of the first source for brevity
        const firstSource = chunks.find((c: any) => c.web?.uri)?.web;
        if (firstSource) {
            text += `\n\n(資料來源: ${firstSource.title || 'Google Search'})`;
        }
    }
    
    return text;
  } catch (error: any) {
    console.error("Weather AI Error:", error);
    return "AI 查詢失敗，請稍後再試。";
  }
};
