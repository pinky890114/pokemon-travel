import { CITY_KEYWORDS, CITY_WEATHER_DB } from "./constants";
import { ItineraryEvent, WeatherInfo } from "./types";

export const getPokemonSprite = (id: number) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

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

export const getCityWeather = (day: number, dayEvents: ItineraryEvent[] = []): WeatherInfo => {
  for (const event of dayEvents) {
    const textToCheck = (event.title + " " + (event.location || "")).toLowerCase();
    for (const cityGroup of CITY_KEYWORDS) {
      for (const word of cityGroup.words) {
        if (textToCheck.includes(word.toLowerCase())) {
          return CITY_WEATHER_DB[cityGroup.key];
        }
      }
    }
  }
  if (day <= 3) return CITY_WEATHER_DB["ZURICH"];
  if (day <= 6) return CITY_WEATHER_DB["INTERLAKEN"];
  if (day <= 9) return CITY_WEATHER_DB["ZERMATT"];
  if (day <= 12) return CITY_WEATHER_DB["MILAN"];
  if (day <= 15) return CITY_WEATHER_DB["VENICE"];
  if (day <= 18) return CITY_WEATHER_DB["FLORENCE"];
  return CITY_WEATHER_DB["ROME"];
};