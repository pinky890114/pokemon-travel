
import { CITY_KEYWORDS, CITY_WEATHER_DB } from "./constants";
import { ItineraryEvent, WeatherInfo } from "./types";

export const getPokemonSprite = (id: number) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

// Level progression: Lv 1 requires 0 exp.
// Lv 2 requires 1 exp (1 post).
// Lv 3 requires 1+2=3 exp.
// Lv 4 requires 1+2+3=6 exp.
// Formula: Level L requires (L-1)*L / 2 EXP.
// Inverse: Level = floor((1 + sqrt(1 + 8*exp)) / 2)
export const calculateLevelFromExp = (exp: number) => {
    return Math.floor((1 + Math.sqrt(1 + 8 * exp)) / 2);
};

export const getExpForNextLevel = (currentLevel: number) => {
    // Exp needed to reach next level (currentLevel + 1)
    // Formula: Sum of integers from 1 to currentLevel
    return (currentLevel * (currentLevel + 1)) / 2;
};

export const getDateStrFromDay = (dayIndex: number, startDateStr: string) => {
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

export const identifyCityKey = (day: number, dayEvents: ItineraryEvent[] = []): string => {
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
  if (day <= 3) return "ZURICH";
  if (day <= 6) return "INTERLAKEN";
  if (day <= 9) return "ZERMATT";
  if (day <= 12) return "MILAN";
  if (day <= 15) return "VENICE";
  if (day <= 18) return "FLORENCE";
  return "ROME";
};

export const getCityWeather = (day: number, dayEvents: ItineraryEvent[] = []): WeatherInfo => {
  const key = identifyCityKey(day, dayEvents);
  return CITY_WEATHER_DB[key];
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

export const fetchRealtimeWeather = async (lat: number, lng: number): Promise<Partial<WeatherInfo> | null> => {
  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`);
    const data = await res.json();
    
    if (!data.current_weather) return null;

    const { temperature, weathercode } = data.current_weather;
    const { temperature_2m_max, temperature_2m_min, sunrise, sunset } = data.daily;
    const { icon, condition } = getWeatherIcon(weathercode);

    return {
      temp: Math.round(temperature),
      minTemp: Math.round(temperature_2m_min[0]),
      maxTemp: Math.round(temperature_2m_max[0]),
      condition,
      icon,
      sunrise: sunrise[0].split('T')[1].slice(0, 5),
      sunset: sunset[0].split('T')[1].slice(0, 5),
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
        // Compress to JPEG with reduced quality
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};