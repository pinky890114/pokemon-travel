
import { FlightData, Hotel, Member, Theme, WeatherInfo, Voucher } from './types';

export const POKE_CARD_STYLE = "bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl";
export const POKE_BTN_STYLE = "border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all rounded-xl";
export const POKE_INPUT_STYLE = "font-['DotGothic16'] border-2 border-black shadow-[2px_2px_0px_0px_#ccc] focus:shadow-[2px_2px_0px_0px_#000] rounded-lg outline-none transition-all placeholder:text-gray-400";
export const DIGITAL_FONT_STYLE = "font-['VT323'] text-lg tracking-wider";

export const CITY_WEATHER_DB: Record<string, WeatherInfo> = {
  "ZURICH": { name: "ZURICH", temp: 5, minTemp: -2, maxTemp: 8, condition: "cloudy", icon: "☁️", type: "city", sunrise: "07:25", sunset: "17:45" },
  "LUZERN": { name: "LUZERN", temp: 4, minTemp: -1, maxTemp: 7, condition: "rain", icon: "🌧️", type: "city", sunrise: "07:28", sunset: "17:48" }, 
  "INTERLAKEN": { name: "INTERLAKEN", temp: 2, minTemp: -5, maxTemp: 5, condition: "snow", icon: "❄️", type: "mountain", sunrise: "07:30", sunset: "17:50" },
  "ZERMATT": { name: "ZERMATT", temp: -3, minTemp: -10, maxTemp: 2, condition: "snow", icon: "🏔️", type: "mountain", sunrise: "07:28", sunset: "17:52" },
  "MILAN": { name: "MILAN", temp: 12, minTemp: 5, maxTemp: 15, condition: "sunny", icon: "☀️", type: "city", sunrise: "07:10", sunset: "18:05" },
  "VENICE": { name: "VENICE", temp: 13, minTemp: 8, maxTemp: 16, condition: "rain", icon: "🌧️", type: "water", sunrise: "06:55", sunset: "18:00" },
  "FLORENCE": { name: "FLORENCE", temp: 15, minTemp: 9, maxTemp: 19, condition: "sunny", icon: "☀️", type: "city", sunrise: "06:50", sunset: "18:10" },
  "ROME": { name: "ROME", temp: 16, minTemp: 10, maxTemp: 20, condition: "sunny", icon: "☀️", type: "city", sunrise: "06:45", sunset: "18:15" },
};

export const CITY_KEYWORDS = [
  { key: "LUZERN", words: ["luzern", "琉森", "lucerne"] },
  { key: "ZURICH", words: ["zurich", "蘇黎世"] },
  { key: "INTERLAKEN", words: ["interlaken", "因特拉肯"] },
  { key: "ZERMATT", words: ["zermatt", "策馬特"] },
  { key: "MILAN", words: ["milan", "米蘭"] },
  { key: "VENICE", words: ["venice", "威尼斯"] },
  { key: "FLORENCE", words: ["florence", "佛羅倫斯", "firenze"] },
  { key: "ROME", words: ["rome", "羅馬", "roma"] },
];

export const EEVEE_THEMES: Theme[] = [
  { name: '伊布', color: 'bg-[#C69C6D]', border: 'border-[#5C4033]', text: 'text-[#5C4033]', bgLight: 'bg-[#F9F4E8]', id: 133 },      
  { name: '水伊布', color: 'bg-[#6890F0]', border: 'border-[#1E3A8A]', text: 'text-[#1E3A8A]', bgLight: 'bg-[#E0F2FE]', id: 134 },    
  { name: '雷伊布', color: 'bg-[#F8D030]', border: 'border-[#854D0E]', text: 'text-[#854D0E]', bgLight: 'bg-[#FEFCE8]', id: 135 },    
  { name: '火伊布', color: 'bg-[#F08030]', border: 'border-[#9A3412]', text: 'text-[#9A3412]', bgLight: 'bg-[#FFF7ED]', id: 136 },    
  { name: '太陽伊布', color: 'bg-[#F95587]', border: 'border-[#831843]', text: 'text-[#831843]', bgLight: 'bg-[#FDF2F8]', id: 196 },  
  { name: '月亮伊布', color: 'bg-[#3C3C3C]', border: 'border-black', text: 'text-[#1F2937]', bgLight: 'bg-[#F3F4F6]', id: 197 },  
  { name: '葉伊布', color: 'bg-[#78C850]', border: 'border-[#14532D]', text: 'text-[#14532D]', bgLight: 'bg-[#F0FDF4]', id: 470 },    
  { name: '冰伊布', color: 'bg-[#98D8D8]', border: 'border-[#164E63]', text: 'text-[#164E63]', bgLight: 'bg-[#ECFEFF]', id: 471 },    
  { name: '仙子伊布', color: 'bg-[#F472B6]', border: 'border-[#881337]', text: 'text-[#881337]', bgLight: 'bg-[#FFF1F2]', id: 700 },  
];

export const INITIAL_MEMBERS: Member[] = [
  { id: 'kevin', name: '凱文', themeIdx: 1, img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kevin', level: 1, exp: 0 }, 
  { id: 'neo', name: '尼歐', themeIdx: 3, img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Neo', level: 1, exp: 0 },   
  { id: 'sheep', name: '小羊', themeIdx: 2, img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sheep', level: 1, exp: 0 }, 
  { id: 'hero', name: '大俠', themeIdx: 6, img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hero', level: 1, exp: 0 }, 
];

// Expanded Pokemon Themes
export const POKEMON_THEMES: Theme[] = [
  ...EEVEE_THEMES,
  // Gen 1 Starters & Pikachu
  { name: '皮卡丘', color: 'bg-[#FACC15]', border: 'border-[#854D0E]', text: 'text-[#854D0E]', bgLight: 'bg-[#FEFCE8]', id: 25 },
  { name: '妙蛙種子', color: 'bg-[#4ADE80]', border: 'border-[#14532D]', text: 'text-[#14532D]', bgLight: 'bg-[#F0FDF4]', id: 1 },
  { name: '小火龍', color: 'bg-[#FB923C]', border: 'border-[#9A3412]', text: 'text-[#9A3412]', bgLight: 'bg-[#FFF7ED]', id: 4 },
  { name: '傑尼龜', color: 'bg-[#60A5FA]', border: 'border-[#1E3A8A]', text: 'text-[#1E3A8A]', bgLight: 'bg-[#EFF6FF]', id: 7 },
  
  // Gen 2 Starters
  { name: '菊草葉', color: 'bg-[#A3E635]', border: 'border-[#365314]', text: 'text-[#365314]', bgLight: 'bg-[#F7FEE7]', id: 152 },
  { name: '火球鼠', color: 'bg-[#FCD34D]', border: 'border-[#78350F]', text: 'text-[#78350F]', bgLight: 'bg-[#FFFBEB]', id: 155 },
  { name: '小鋸鱷', color: 'bg-[#38BDF8]', border: 'border-[#0C4A6E]', text: 'text-[#0C4A6E]', bgLight: 'bg-[#F0F9FF]', id: 158 },

  // Gen 3 Starters
  { name: '木守宮', color: 'bg-[#4ADE80]', border: 'border-[#14532D]', text: 'text-[#14532D]', bgLight: 'bg-[#F0FDF4]', id: 252 },
  { name: '火稚雞', color: 'bg-[#F97316]', border: 'border-[#7C2D12]', text: 'text-[#7C2D12]', bgLight: 'bg-[#FFEDD5]', id: 255 },
  { name: '水躍魚', color: 'bg-[#7DD3FC]', border: 'border-[#075985]', text: 'text-[#075985]', bgLight: 'bg-[#E0F2FE]', id: 258 },

  // Popular & Cute
  { name: '胖丁', color: 'bg-[#F472B6]', border: 'border-[#831843]', text: 'text-[#831843]', bgLight: 'bg-[#FDF2F8]', id: 39 },
  { name: '喵喵', color: 'bg-[#FDE68A]', border: 'border-[#78350F]', text: 'text-[#78350F]', bgLight: 'bg-[#FFFBEB]', id: 52 },
  { name: '可達鴨', color: 'bg-[#FACC15]', border: 'border-[#A16207]', text: 'text-[#A16207]', bgLight: 'bg-[#FEFCE8]', id: 54 },
  { name: '卡蒂狗', color: 'bg-[#EA580C]', border: 'border-[#7C2D12]', text: 'text-[#7C2D12]', bgLight: 'bg-[#FFEDD5]', id: 58 },
  { name: '呆呆獸', color: 'bg-[#F9A8D4]', border: 'border-[#9D174D]', text: 'text-[#9D174D]', bgLight: 'bg-[#FDF2F8]', id: 79 },
  { name: '卡拉卡拉', color: 'bg-[#D6D3D1]', border: 'border-[#44403C]', text: 'text-[#44403C]', bgLight: 'bg-[#FAFAF9]', id: 104 },
  { name: '百變怪', color: 'bg-[#C084FC]', border: 'border-[#581C87]', text: 'text-[#581C87]', bgLight: 'bg-[#F3E8FF]', id: 132 },
  { name: '波克比', color: 'bg-[#FEF08A]', border: 'border-[#854D0E]', text: 'text-[#854D0E]', bgLight: 'bg-[#FEFCE8]', id: 175 },
  { name: '瑪力露', color: 'bg-[#60A5FA]', border: 'border-[#1E3A8A]', text: 'text-[#1E3A8A]', bgLight: 'bg-[#EFF6FF]', id: 183 },
  { name: '果然翁', color: 'bg-[#3B82F6]', border: 'border-[#172554]', text: 'text-[#172554]', bgLight: 'bg-[#EFF6FF]', id: 202 },

  // Cool & Strong
  { name: '耿鬼', color: 'bg-[#7E22CE]', border: 'border-[#3B0764]', text: 'text-[#3B0764]', bgLight: 'bg-[#F3E8FF]', id: 94 },
  { name: '大岩蛇', color: 'bg-[#78716C]', border: 'border-[#292524]', text: 'text-[#292524]', bgLight: 'bg-[#F5F5F4]', id: 95 },
  { name: '卡比獸', color: 'bg-[#60A5FA]', border: 'border-[#1E3A8A]', text: 'text-[#1E3A8A]', bgLight: 'bg-[#EFF6FF]', id: 143 },
  { name: '快龍', color: 'bg-[#F59E0B]', border: 'border-[#78350F]', text: 'text-[#78350F]', bgLight: 'bg-[#FFFBEB]', id: 149 },
  { name: '超夢', color: 'bg-[#A855F7]', border: 'border-[#4C1D95]', text: 'text-[#4C1D95]', bgLight: 'bg-[#F3E8FF]', id: 150 },
  { name: '夢幻', color: 'bg-[#F472B6]', border: 'border-[#831843]', text: 'text-[#831843]', bgLight: 'bg-[#FDF2F8]', id: 151 },
  { name: '巨鉗螳螂', color: 'bg-[#DC2626]', border: 'border-[#7F1D1D]', text: 'text-[#7F1D1D]', bgLight: 'bg-[#FEF2F2]', id: 212 },
  { name: '赫拉克羅斯', color: 'bg-[#1D4ED8]', border: 'border-[#1E3A8A]', text: 'text-[#1E3A8A]', bgLight: 'bg-[#EFF6FF]', id: 214 },
  { name: '班基拉斯', color: 'bg-[#65A30D]', border: 'border-[#1A2E05]', text: 'text-[#1A2E05]', bgLight: 'bg-[#ECFCCB]', id: 248 },
  { name: '路卡利歐', color: 'bg-[#2563EB]', border: 'border-[#1E3A8A]', text: 'text-[#1E3A8A]', bgLight: 'bg-[#EFF6FF]', id: 448 },
  { name: '烈咬陸鯊', color: 'bg-[#0F172A]', border: 'border-black', text: 'text-[#0F172A]', bgLight: 'bg-[#F1F5F9]', id: 445 },
  { name: '謎擬Q', color: 'bg-[#E7E5E4]', border: 'border-[#44403C]', text: 'text-[#44403C]', bgLight: 'bg-[#FAFAF9]', id: 778 },

  // Legendaries
  { name: '洛奇亞', color: 'bg-[#E0F2FE]', border: 'border-[#075985]', text: 'text-[#075985]', bgLight: 'bg-[#F0F9FF]', id: 249 },
  { name: '鳳王', color: 'bg-[#EF4444]', border: 'border-[#7F1D1D]', text: 'text-[#7F1D1D]', bgLight: 'bg-[#FEF2F2]', id: 250 },
  { name: '拉帝亞斯', color: 'bg-[#EF4444]', border: 'border-[#7F1D1D]', text: 'text-[#7F1D1D]', bgLight: 'bg-[#FEF2F2]', id: 380 },
  { name: '拉帝歐斯', color: 'bg-[#3B82F6]', border: 'border-[#1E3A8A]', text: 'text-[#1E3A8A]', bgLight: 'bg-[#EFF6FF]', id: 381 },
  { name: '蓋歐卡', color: 'bg-[#1D4ED8]', border: 'border-[#1E3A8A]', text: 'text-[#1E3A8A]', bgLight: 'bg-[#EFF6FF]', id: 382 },
  { name: '固拉多', color: 'bg-[#DC2626]', border: 'border-[#7F1D1D]', text: 'text-[#7F1D1D]', bgLight: 'bg-[#FEF2F2]', id: 383 },
  { name: '裂空座', color: 'bg-[#16A34A]', border: 'border-[#14532D]', text: 'text-[#14532D]', bgLight: 'bg-[#DCFCE7]', id: 384 },
  { name: '基拉祈', color: 'bg-[#FDE047]', border: 'border-[#854D0E]', text: 'text-[#854D0E]', bgLight: 'bg-[#FEFCE8]', id: 385 },
];

export const INITIAL_FLIGHT_DATA: FlightData = {
  outbound: [
    {
      from: 'TPE', fromCity: 'TAIPEI', to: 'DXB', toCity: 'DUBAI',
      depTime: '23:00', arrTime: '04:50', date: 'FEB 19', duration: '9h 50m',
      airline: 'Emirates', flight: 'EK 367', depTerminal: '2', arrTerminal: '3',
      gate: 'C3', seat: '42A', class: 'Y', baggage: '30KG'
    },
    {
      from: 'DXB', fromCity: 'DUBAI', to: 'ZRH', toCity: 'ZURICH',
      depTime: '08:25', arrTime: '12:25', date: 'FEB 20', duration: '7h 00m',
      airline: 'Emirates', flight: 'EK 87', depTerminal: '3', arrTerminal: '1',
      gate: 'A12', seat: '42A', class: 'Y', baggage: '30KG', layover: '3h 35m'
    }
  ],
  inbound: [
    {
      from: 'FCO', fromCity: 'ROME', to: 'AUH', toCity: 'ABU DHABI',
      depTime: '10:25', arrTime: '19:30', date: 'MAR 10', duration: '6h 05m',
      airline: 'Etihad', flight: 'EY 86', depTerminal: '3', arrTerminal: 'A',
      gate: 'E12', seat: '25K', class: 'Y', baggage: '30KG'
    },
    {
      from: 'AUH', fromCity: 'ABU DHABI', to: 'TPE', toCity: 'TAIPEI',
      depTime: '20:55', arrTime: '08:30', date: 'MAR 11', duration: '7h 35m',
      airline: 'Etihad', flight: 'EY 898', depTerminal: 'A', arrTerminal: '1',
      gate: 'F08', seat: '25K', class: 'Y', baggage: '30KG', layover: '1h 25m'
    }
  ]
};

export const INITIAL_HOTELS: Hotel[] = [
  { id: 'h1', name: 'Hotel Spinne', location: 'Grindelwald, Switzerland', bookingCode: 'AG-98322', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300', checkIn: '2026-02-20', checkOut: '2026-02-23' },
  { id: 'h2', name: 'Backstage Hotel', location: 'Zermatt, Switzerland', bookingCode: 'BK-11029', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=300', checkIn: '2026-02-23', checkOut: '2026-02-25' }
];

export const INITIAL_VOUCHERS: Voucher[] = [
  { 
    id: 'v1', 
    title: 'Swiss Travel Pass', 
    type: 'transport', 
    referenceNo: 'CH-STP-8829103', 
    date: '2026-02-20',
    notes: '15 Days Continuous Pass. Valid for trains, boats, and buses in Switzerland.',
  },
  { 
    id: 'v2', 
    title: 'Jungfraujoch Ticket', 
    type: 'attraction', 
    referenceNo: 'JFJ-9921', 
    date: '2026-02-22',
    notes: 'Top of Europe. Boarding at Grindelwald Terminal.',
  },
  { 
    id: 'v3', 
    title: 'Trenitalia: Milan > Venice', 
    type: 'transport', 
    referenceNo: 'PNR: YH992K', 
    date: '2026-03-03',
    notes: 'Frecciarossa 9723. Car 4, Seat 12D.',
  },
  { 
    id: 'v4', 
    title: 'Colosseum & Forum', 
    type: 'attraction', 
    referenceNo: 'ROM-COL-221', 
    date: '2026-03-08',
    notes: 'Skip-the-line access. Meeting point: Arch of Constantine.',
  }
];
