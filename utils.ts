
import { CITY_KEYWORDS, CITY_WEATHER_DB } from "./constants";
import { ItineraryEvent, WeatherInfo } from "./types";

// --- AI Service Exports ---
// 統一從 geminiService 匯入 AI 功能，確保錯誤處理一致
export { generateTransportSuggestion, translateText } from './services/geminiService';

// --- Existing Utils ---

export const getPokemonSprite = (id: number) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

export const calculateLevelFromExp = (exp: number) => {
    return Math.floor((1 + Math.sqrt(1 + 8 * exp)) / 2);
};

export const getExpForNextLevel = (currentLevel: number) => {
    return (currentLevel * (currentLevel + 1)) / 2;
};

export const getDateStrFromDay = (dayIndex: number, startDateStr: string) => {
  if (!startDateStr) return new Date().toISOString().split('T')[0];
  const startDate = new Date(startDateStr + 'T00:00:00'); 
  const targetDate = new Date(startDate);
  targetDate.setDate(startDate.getDate() + (dayIndex - 1));
  const y = targetDate.getFullYear();
  const m = String(targetDate.getMonth() + 1).padStart(2, '0');
  const d = String(targetDate.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const getDayInfo = (dayIndex: number, startDateStr: string) => {
  const dateStr = getDateStrFromDay(dayIndex, startDateStr);
  const dateObj = new Date(dateStr + 'T00:00:00'); 
  const month = dateObj.getMonth() + 1;
  const date = dateObj.getDate();
  return { dateStr: `${month}/${date}`, fullDate: dateStr };
};

export const identifyCityKey = (day: number, dayEvents: ItineraryEvent[] = [], overrides: Record<string, string> = {}): string => {
  const dayKey = String(day);
  if (overrides && overrides[dayKey]) {
      return overrides[dayKey];
  }

  for (const event of dayEvents) {
    const textToCheck = (event.title + " " + (event.location || "")).toLowerCase();
    for (const cityGroup of CITY_KEYWORDS) {
      for (const word of cityGroup.words) {
        if (textToCheck.includes(word.toLowerCase())) {
          return cityGroup.key;
        }
      }
    }
  }
  
  if (day === 1) return "TAOYUAN";
  if (day <= 3) return "ZURICH";
  if (day <= 6) return "INTERLAKEN";
  if (day <= 9) return "ZERMATT";
  if (day <= 12) return "MILAN";
  if (day <= 15) return "VENICE";
  if (day <= 18) return "FLORENCE";
  return "ROME";
};

export const getCityWeather = (day: number, dayEvents: ItineraryEvent[] = [], overrides: Record<string, string> = {}): WeatherInfo => {
  const key = identifyCityKey(day, dayEvents, overrides);
  return CITY_WEATHER_DB[key] || CITY_WEATHER_DB["ZURICH"];
};

const getWeatherIcon = (code: number): { icon: string; condition: string } => {
  if (code === 0) return { icon: "☀️", condition: "sunny" };
  if (code >= 1 && code <= 3) return { icon: "☁️", condition: "cloudy" };
  if (code === 45 || code === 48) return { icon: "🌫️", condition: "fog" };
  if (code >= 51 && code <= 67) return { icon: "🌧️", condition: "rain" };
  if (code >= 71 && code <= 77) return { icon: "❄️", condition: "snow" };
  if (code >= 80 && code <= 82) return { icon: "🌧️", condition: "showers" };
  if (code >= 95) return { icon: "⚡", condition: "thunder" };
  return { icon: "🌤️", condition: "clear" };
};

export const fetchRealtimeWeather = async (lat: number, lng: number, targetDate: string): Promise<Partial<WeatherInfo> | null> => {
  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max&timezone=auto`);
    const data = await res.json();
    
    if (!data.daily) return null;

    // 尋找目標日期在預報陣列中的索引
    let dateIndex = data.daily.time.indexOf(targetDate);
    
    // 如果找不到索引（日期太遠或已過去），則返回空以顯示預設資料
    if (dateIndex === -1) {
       return null;
    }

    const { temperature_2m_max, temperature_2m_min, sunrise, sunset, precipitation_probability_max } = data.daily;
    
    // 如果是「今天」，我們可以使用 current_weather 的即時氣溫
    const todayStr = new Date().toISOString().split('T')[0];
    let displayTemp = Math.round((temperature_2m_max[dateIndex] + temperature_2m_min[dateIndex]) / 2);
    
    if (targetDate === todayStr && data.current_weather) {
        displayTemp = Math.round(data.current_weather.temperature);
    }

    const { icon, condition } = getWeatherIcon(data.daily.weather_code?.[dateIndex] || data.current_weather?.weathercode || 0);

    return {
      temp: displayTemp,
      minTemp: Math.round(temperature_2m_min[dateIndex]),
      maxTemp: Math.round(temperature_2m_max[dateIndex]),
      condition,
      icon,
      sunrise: sunrise[dateIndex].split('T')[1].slice(0, 5),
      sunset: sunset[dateIndex].split('T')[1].slice(0, 5),
      rainProb: Math.round(precipitation_probability_max[dateIndex])
    };
  } catch (e) {
    console.error("Failed to fetch weather", e);
    return null;
  }
};

export const compressImage = (file: File, maxWidth = 800, quality = 0.6): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            resolve(event.target?.result as string);
            return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};
