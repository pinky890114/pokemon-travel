import React from 'react';
import { X, Sun, Plus, Minus } from 'lucide-react';
import { POKE_CARD_STYLE, POKE_INPUT_STYLE, POKE_BTN_STYLE, DIGITAL_FONT_STYLE } from '../constants';
import { TripSettings, ItineraryEvent, FlightSegment, Theme } from '../types';

// --- Weather Modal ---
export const WeatherModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in">
    <div className={`${POKE_CARD_STYLE} w-full max-w-sm h-[60vh] flex flex-col overflow-hidden`}>
       <div className="flex justify-between items-center p-4 border-b-[3px] border-black bg-gray-50 font-black">
         <h3 className="text-xl">氣候分析</h3>
         <button onClick={onClose}><X size={18} /></button>
       </div>
       <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
             {[...Array(12)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-2 border-b-2 border-dashed border-gray-200">
                   <span className="text-sm font-bold text-gray-500 w-12">{9+i}:00</span>
                   <Sun size={16} className="text-yellow-500" />
                   <span className={`font-black text-gray-800 w-12 text-right ${DIGITAL_FONT_STYLE}`}>15°</span>
                </div>
             ))}
          </div>
       </div>
    </div>
  </div>
);

// --- Settings Modal ---
interface SettingsModalProps {
  settings: TripSettings;
  totalDays: number;
  onClose: () => void;
  onSave: (settings: TripSettings, days: number) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ settings, totalDays, onClose, onSave }) => {
  const [localSettings, setLocalSettings] = React.useState(settings);
  const [localDays, setLocalDays] = React.useState(totalDays);

  return (
    <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in">
      <div className={`${POKE_CARD_STYLE} w-full max-w-sm p-6`}>
        <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-2">
          <h3 className="font-black text-xl">旅行設定</h3>
          <button onClick={onClose}><X size={20}/></button>
        </div>
        <div className="space-y-4">
           <div>
             <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Title</label>
             <input type="text" value={localSettings.title} onChange={e => setLocalSettings({...localSettings, title: e.target.value})} className={`w-full p-2 bg-gray-50 font-black ${POKE_INPUT_STYLE}`} />
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Start Date</label>
                <input type="date" value={localSettings.startDate} onChange={e => setLocalSettings({...localSettings, startDate: e.target.value})} className={`w-full p-2 bg-gray-50 font-black ${POKE_INPUT_STYLE}`} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Total Days</label>
                <input 
                   type="number" 
                   value={localDays} 
                   onChange={e => setLocalDays(Math.max(1, parseInt(e.target.value) || 1))} 
                   className={`w-full p-2 bg-gray-50 font-black text-center ${POKE_INPUT_STYLE}`} 
                />
              </div>
           </div>
           <button onClick={() => onSave(localSettings, localDays)} className={`w-full bg-[#8B5A2B] text-white py-3 font-black ${POKE_BTN_STYLE}`}>確定儲存</button>
        </div>
      </div>
    </div>
  );
};

// --- Add/Edit Event Modal ---
interface EventModalProps {
  event: ItineraryEvent;
  isEditing: boolean;
  currentTheme: Theme;
  onClose: () => void;
  onSave: (event: ItineraryEvent) => void;
}

export const EventModal: React.FC<EventModalProps> = ({ event, isEditing, currentTheme, onClose, onSave }) => {
  const [localEvent, setLocalEvent] = React.useState(event);

  return (
    <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in">
      <div className={`${POKE_CARD_STYLE} w-full max-w-sm p-6 max-h-[85vh] overflow-y-auto`}>
        <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-2 font-black">
          <h3 className="text-xl">{isEditing ? '編輯' : '新增'}任務</h3>
          <button onClick={onClose}><X size={20}/></button>
        </div>
        <div className="space-y-4 pb-12">
           <div className="grid grid-cols-2 gap-4">
             <input type="date" value={localEvent.date} onChange={e => setLocalEvent({...localEvent, date: e.target.value})} className={`w-full p-2 text-xs font-black ${POKE_INPUT_STYLE}`} />
             <input type="time" value={localEvent.time} onChange={e => setLocalEvent({...localEvent, time: e.target.value})} className={`w-full p-2 text-xs font-black ${POKE_INPUT_STYLE}`} />
           </div>
           <input type="text" placeholder="標題" value={localEvent.title} onChange={e => setLocalEvent({...localEvent, title: e.target.value})} className={`w-full p-2 font-black ${POKE_INPUT_STYLE}`} />
           <input type="text" placeholder="地點" value={localEvent.location} onChange={e => setLocalEvent({...localEvent, location: e.target.value})} className={`w-full p-2 font-black ${POKE_INPUT_STYLE}`} />
           <div className="grid grid-cols-2 gap-4">
              <select value={localEvent.type} onChange={e => setLocalEvent({...localEvent, type: e.target.value as 'event' | 'transport'})} className={`w-full p-2 font-black ${POKE_INPUT_STYLE}`}>
                <option value="event">景點事件</option>
                <option value="transport">交通移動</option>
              </select>
              {localEvent.type === 'transport' && (
                <select value={localEvent.transportMode} onChange={e => setLocalEvent({...localEvent, transportMode: e.target.value as any})} className={`w-full p-2 font-black ${POKE_INPUT_STYLE}`}>
                  <option value="walk">步行</option>
                  <option value="train">火車</option>
                  <option value="car">計程車</option>
                  <option value="bus">公車</option>
                </select>
              )}
           </div>
           <textarea placeholder="備註資訊..." value={localEvent.notes} onChange={e => setLocalEvent({...localEvent, notes: e.target.value})} className={`w-full p-2 h-24 font-bold resize-none ${POKE_INPUT_STYLE}`}></textarea>
           <button onClick={() => onSave(localEvent)} className={`w-full ${currentTheme.color} text-white py-3 font-black ${POKE_BTN_STYLE}`}>確定儲存</button>
        </div>
      </div>
    </div>
  );
};

// --- Edit Flight Modal ---
interface FlightModalProps {
  flightData: FlightSegment[];
  currentTheme: Theme;
  onClose: () => void;
  onSave: (data: FlightSegment[]) => void;
}

export const FlightModal: React.FC<FlightModalProps> = ({ flightData, currentTheme, onClose, onSave }) => {
  const [localData, setLocalData] = React.useState(flightData);

  const updateSegment = (index: number, field: keyof FlightSegment, value: string) => {
    const newData = [...localData];
    newData[index] = { ...newData[index], [field]: value };
    setLocalData(newData);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in">
      <div className={`${POKE_CARD_STYLE} w-full max-w-sm p-6 max-h-[85vh] overflow-y-auto`}>
         <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-2 font-black">
           <h3 className="text-xl">編輯航班</h3>
           <button onClick={onClose}><X size={20}/></button>
         </div>
         <div className="space-y-8 pb-12">
           {localData.map((seg, i) => (
             <div key={seg.id || i} className="p-4 border-2 border-gray-200 rounded-xl bg-gray-50 relative space-y-3 shadow-inner">
                <div className="absolute -top-3 left-4 bg-white px-2 text-[10px] font-black border border-gray-300 rounded uppercase tracking-widest">Segment {i+1}</div>
                <div className="grid grid-cols-2 gap-2">
                  <input placeholder="From" value={seg.from} onChange={e => updateSegment(i, 'from', e.target.value)} className={`p-1 text-xs font-black ${POKE_INPUT_STYLE}`} />
                  <input placeholder="To" value={seg.to} onChange={e => updateSegment(i, 'to', e.target.value)} className={`p-1 text-xs font-black ${POKE_INPUT_STYLE}`} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="time" value={seg.depTime} onChange={e => updateSegment(i, 'depTime', e.target.value)} className={`p-1 text-xs font-black ${POKE_INPUT_STYLE}`} />
                  <input type="time" value={seg.arrTime} onChange={e => updateSegment(i, 'arrTime', e.target.value)} className={`p-1 text-xs font-black ${POKE_INPUT_STYLE}`} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input placeholder="Dep Term" value={seg.depTerminal} onChange={e => updateSegment(i, 'depTerminal', e.target.value)} className={`p-1 text-xs font-black ${POKE_INPUT_STYLE}`} />
                  <input placeholder="Arr Term" value={seg.arrTerminal} onChange={e => updateSegment(i, 'arrTerminal', e.target.value)} className={`p-1 text-xs font-black ${POKE_INPUT_STYLE}`} />
                </div>
                <input placeholder="Airline" value={seg.airline} onChange={e => updateSegment(i, 'airline', e.target.value)} className={`w-full p-1 text-xs font-black ${POKE_INPUT_STYLE}`} />
                <div className="grid grid-cols-3 gap-2">
                  <input placeholder="Flight" value={seg.flight} onChange={e => updateSegment(i, 'flight', e.target.value)} className={`p-1 text-xs font-black ${POKE_INPUT_STYLE}`} />
                  <input placeholder="Gate" value={seg.gate} onChange={e => updateSegment(i, 'gate', e.target.value)} className={`p-1 text-xs font-black ${POKE_INPUT_STYLE}`} />
                  <input placeholder="Seat" value={seg.seat} onChange={e => updateSegment(i, 'seat', e.target.value)} className={`p-1 text-xs font-black ${POKE_INPUT_STYLE}`} />
                </div>
                <input placeholder="Baggage" value={seg.baggage} onChange={e => updateSegment(i, 'baggage', e.target.value)} className={`w-full p-1 text-xs font-black ${POKE_INPUT_STYLE}`} />
                {i > 0 && <input placeholder="Layover Time" value={seg.layover || ''} onChange={e => updateSegment(i, 'layover', e.target.value)} className={`w-full p-1 text-xs font-black ${POKE_INPUT_STYLE}`} />}
             </div>
           ))}
           <button onClick={() => onSave(localData)} className={`w-full ${currentTheme.color} text-white py-3 font-black ${POKE_BTN_STYLE}`}>確定儲存</button>
         </div>
      </div>
    </div>
  );
};