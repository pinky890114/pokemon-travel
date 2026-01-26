import React, { useState } from 'react';
import { Calculator } from 'lucide-react';
import { Expense, Theme } from '../types';
import { INITIAL_MEMBERS, POKE_CARD_STYLE, POKE_INPUT_STYLE, POKE_BTN_STYLE, DIGITAL_FONT_STYLE } from '../constants';

interface LedgerViewProps {
  currentTheme: Theme;
  expenses: Expense[];
  onAddExpense: (amount: number, item: string, payer: string) => void;
}

export const LedgerView: React.FC<LedgerViewProps> = ({ currentTheme, expenses, onAddExpense }) => {
  const [ledgerMode, setLedgerMode] = useState<'input' | 'detail'>('input');
  const [amount, setAmount] = useState('');
  const [item, setItem] = useState('');
  const [payer, setPayer] = useState(INITIAL_MEMBERS[0].id);
  const [calcValues, setCalcValues] = useState({ chf: '', eur: '', twd: '' });

  const handleCalcChange = (curr: 'chf' | 'eur' | 'twd', val: string) => {
    if (!val) { setCalcValues({ chf: '', eur: '', twd: '' }); return; }
    const n = parseFloat(val);
    const RATES_CONV = { CHF: 36.5, EUR: 34.2 };
    if (curr === 'chf') setCalcValues({ chf: val, eur: (n * RATES_CONV.CHF / RATES_CONV.EUR).toFixed(2), twd: (n * RATES_CONV.CHF).toFixed(0) });
    else if (curr === 'eur') setCalcValues({ chf: (n * RATES_CONV.EUR / RATES_CONV.CHF).toFixed(2), eur: val, twd: (n * RATES_CONV.EUR).toFixed(0) });
    else setCalcValues({ chf: (n / 36.5).toFixed(2), eur: (n / 34.2).toFixed(2), twd: val });
  };

  const handleSubmit = () => {
    if (!amount || !item) return;
    onAddExpense(Number(amount), item, payer);
    setAmount('');
    setItem('');
    setLedgerMode('detail');
  };

  return (
    <div className="px-6 space-y-4 pb-40 animate-in fade-in">
       <div className={`${POKE_CARD_STYLE} p-4 bg-[#FFFBEB]`}>
        <div className="flex items-center space-x-2 text-gray-800 mb-3 font-bold border-b-2 border-black pb-2 uppercase tracking-widest"><Calculator size={16} /><span className="text-xs">Calculator</span></div>
        <div className="space-y-2">
          {['chf', 'eur', 'twd'].map(curr => (
            <div key={curr} className="flex items-center space-x-2">
              <span className="w-8 text-[10px] font-black uppercase">{curr}</span>
              <input type="number" value={calcValues[curr as keyof typeof calcValues]} onChange={(e) => handleCalcChange(curr as any, e.target.value)} className={`flex-1 p-1 text-xs bg-white ${POKE_INPUT_STYLE} font-mono`} placeholder="0" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex bg-white/50 p-2 rounded-xl border-2 border-black/10">
        <button onClick={() => setLedgerMode('input')} className={`flex-1 py-1.5 text-xs font-black rounded-lg ${ledgerMode === 'input' ? `${currentTheme.color} text-white border-2 border-black` : 'text-gray-500'}`}>記帳</button>
        <button onClick={() => setLedgerMode('detail')} className={`flex-1 py-1.5 text-xs font-black rounded-lg ${ledgerMode === 'detail' ? `${currentTheme.color} text-white border-2 border-black` : 'text-gray-500'}`}>明細</button>
      </div>

      {ledgerMode === 'input' ? (
        <div className={`${POKE_CARD_STYLE} p-4 space-y-4`}>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className={`w-full p-2 text-2xl font-black text-center ${POKE_INPUT_STYLE}`} />
          <input type="text" value={item} onChange={(e) => setItem(e.target.value)} placeholder="消費項目 (例如: 神奇糖果)" className={`w-full p-2 text-xs font-bold text-center ${POKE_INPUT_STYLE}`} />
          <div className="flex space-x-2 overflow-x-auto py-2 no-scrollbar">
            {INITIAL_MEMBERS.map(m => (
              <button key={m.id} onClick={() => setPayer(m.id)} className={`flex-shrink-0 flex items-center px-2 py-1 rounded-lg border-2 transition-all ${payer === m.id ? 'bg-gray-100 border-black shadow-[2px_2px_0px_#000]' : 'opacity-40 grayscale border-transparent'}`}>
                <img src={m.img} className="w-5 h-5 rounded-full mr-1" alt="av" /><span className="text-[10px] font-black">{m.name}</span>
              </button>
            ))}
          </div>
          <button onClick={handleSubmit} className={`w-full ${currentTheme.color} text-white py-3 font-black ${POKE_BTN_STYLE}`}>確定儲存</button>
        </div>
      ) : (
        <div className="space-y-3">
           {expenses.map((exp, i) => {
             const m = INITIAL_MEMBERS.find(x => x.id === exp.payer) || INITIAL_MEMBERS[0];
             return (
               <div key={exp.id || i} className={`${POKE_CARD_STYLE} p-3 flex justify-between items-center bg-white`}>
                  <div className="flex items-center space-x-3">
                    <img src={m.img} className="w-8 h-8 rounded-full border border-black" alt="av" />
                    <div><div className="font-black text-gray-800 text-sm">{exp.item}</div><div className="text-[10px] text-gray-400 font-bold">{m.name} · {exp.date}</div></div>
                  </div>
                  <span className={`font-black text-lg ${DIGITAL_FONT_STYLE}`}>₩ {exp.amount}</span>
               </div>
             );
           })}
        </div>
      )}
    </div>
  );
};