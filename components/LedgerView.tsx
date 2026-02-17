
import React, { useState, useMemo } from 'react';
import { Calculator, ArrowDown, PieChart, Coffee, Bed, Bus, Shirt, Gift, MoreHorizontal } from 'lucide-react';
import { Expense, Theme, Member } from '../types';
import { POKE_CARD_STYLE, POKE_INPUT_STYLE, POKE_BTN_STYLE, DIGITAL_FONT_STYLE } from '../constants';

interface LedgerViewProps {
  currentTheme: Theme;
  expenses: Expense[];
  members: Member[];
  onAddExpense: (amount: number, item: string, payer: string, category: string) => void;
}

const CATEGORIES = [
  { id: 'food', label: '飲食', icon: Coffee, color: '#F59E0B', bg: 'bg-amber-500' },
  { id: 'stay', label: '住宿', icon: Bed, color: '#3B82F6', bg: 'bg-blue-500' },
  { id: 'transport', label: '交通', icon: Bus, color: '#10B981', bg: 'bg-emerald-500' },
  { id: 'wear', label: '穿搭', icon: Shirt, color: '#EC4899', bg: 'bg-pink-500' },
  { id: 'gift', label: '紀念品', icon: Gift, color: '#EF4444', bg: 'bg-red-500' },
  { id: 'misc', label: '雜支', icon: MoreHorizontal, color: '#A855F7', bg: 'bg-purple-500' },
];

export const LedgerView: React.FC<LedgerViewProps> = ({ currentTheme, expenses, members, onAddExpense }) => {
  const [ledgerMode, setLedgerMode] = useState<'input' | 'detail' | 'stats'>('input');
  const [amount, setAmount] = useState('');
  const [item, setItem] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].id);
  const [calcValues, setCalcValues] = useState({ chf: '', eur: '', twd: '' });

  const [selectedCurrency, setSelectedCurrency] = useState<'CHF' | 'EUR'>('CHF');
  const [foreignAmount, setForeignAmount] = useState('');
  
  const RATES = { CHF: 36.5, EUR: 34.2 };

  const statsData = useMemo(() => {
    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
    
    const catStats = CATEGORIES.map(cat => {
        const catTotal = expenses
            .filter(e => e.category === cat.id)
            .reduce((sum, e) => sum + e.amount, 0);
        return {
            ...cat,
            total: catTotal,
            percentage: totalExpense > 0 ? (catTotal / totalExpense) * 100 : 0
        };
    }).sort((a, b) => b.total - a.total);

    // Calculate conic gradient string
    let currentDeg = 0;
    const gradientParts = catStats.map(cat => {
        const deg = (cat.percentage / 100) * 360;
        const part = `${cat.color} ${currentDeg}deg ${currentDeg + deg}deg`;
        currentDeg += deg;
        return part;
    });
    
    const gradientString = totalExpense > 0 
        ? `conic-gradient(${gradientParts.join(', ')})`
        : 'conic-gradient(#e5e7eb 0deg 360deg)';

    return { totalExpense, catStats, gradientString };
  }, [expenses]);


  const handleCalcChange = (curr: 'chf' | 'eur' | 'twd', val: string) => {
    if (!val) { setCalcValues({ chf: '', eur: '', twd: '' }); return; }
    const n = parseFloat(val);
    if (curr === 'chf') setCalcValues({ chf: val, eur: (n * RATES.CHF / RATES.EUR).toFixed(2), twd: (n * RATES.CHF).toFixed(0) });
    else if (curr === 'eur') setCalcValues({ chf: (n * RATES.EUR / RATES.CHF).toFixed(2), eur: val, twd: (n * RATES.EUR).toFixed(0) });
    else setCalcValues({ chf: (n / 36.5).toFixed(2), eur: (n / 34.2).toFixed(2), twd: val });
  };

  const handleCurrencyToggle = (curr: 'CHF' | 'EUR') => {
    setSelectedCurrency(curr);
    if (foreignAmount) {
        const n = parseFloat(foreignAmount);
        if (!isNaN(n)) {
            setAmount((n * RATES[curr]).toFixed(0));
        }
    }
  };

  const handleForeignChange = (val: string) => {
    setForeignAmount(val);
    if (!val) {
        setAmount('');
        return;
    }
    const n = parseFloat(val);
    if (!isNaN(n)) {
        setAmount((n * RATES[selectedCurrency]).toFixed(0));
    }
  };

  const handleAmountChange = (val: string) => {
    setAmount(val);
    if (!val) {
        setForeignAmount('');
        return;
    }
    const n = parseFloat(val);
    if (!isNaN(n)) {
        setForeignAmount((n / RATES[selectedCurrency]).toFixed(2));
    }
  };

  const handleSubmit = () => {
    if (!amount || !item) return;
    // Default payer to first member as "Current User" since we hid the selector
    const payerId = members[0]?.id || 'unknown';
    onAddExpense(Number(amount), item, payerId, selectedCategory);
    setAmount('');
    setItem('');
    setForeignAmount('');
    setLedgerMode('detail');
  };

  return (
    <div className="px-6 space-y-4 pb-40 animate-in fade-in">
       {ledgerMode === 'input' && (
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
       )}

      <div className="flex bg-white/50 p-2 rounded-xl border-2 border-black/10">
        <button onClick={() => setLedgerMode('input')} className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all ${ledgerMode === 'input' ? `${currentTheme.color} text-white border-2 border-black shadow-sm` : 'text-gray-500 hover:bg-white/50'}`}>記帳</button>
        <button onClick={() => setLedgerMode('detail')} className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all ${ledgerMode === 'detail' ? `${currentTheme.color} text-white border-2 border-black shadow-sm` : 'text-gray-500 hover:bg-white/50'}`}>明細</button>
        <button onClick={() => setLedgerMode('stats')} className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all flex items-center justify-center ${ledgerMode === 'stats' ? `${currentTheme.color} text-white border-2 border-black shadow-sm` : 'text-gray-500 hover:bg-white/50'}`}>
            <PieChart size={12} className="mr-1" />統計
        </button>
      </div>

      {ledgerMode === 'input' ? (
        <div className={`${POKE_CARD_STYLE} p-4 space-y-4`}>
          
          <div className="flex gap-2 pt-2">
             <div className="flex bg-gray-100 p-1 rounded-lg border-2 border-gray-200">
                {(['CHF', 'EUR'] as const).map(c => (
                    <button 
                        key={c}
                        onClick={() => handleCurrencyToggle(c)}
                        className={`px-3 py-1.5 rounded-md text-xs font-black transition-all ${selectedCurrency === c ? 'bg-white text-black shadow-sm border border-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        {c}
                    </button>
                ))}
             </div>
             <div className="relative flex-1">
                <label className="absolute -top-2 left-2 bg-white px-1 text-[10px] font-bold text-gray-500 border border-gray-200 rounded">{selectedCurrency}</label>
                <input 
                    type="number" 
                    placeholder="金額" 
                    value={foreignAmount} 
                    onChange={(e) => handleForeignChange(e.target.value)} 
                    className={`w-full p-2 text-sm font-bold text-center ${POKE_INPUT_STYLE}`} 
                />
             </div>
          </div>

          <div className="flex justify-center -my-2 text-gray-400">
             <ArrowDown size={16} />
          </div>

          <div className="relative">
             <label className="absolute -top-2 left-2 bg-white px-1 text-[10px] font-bold text-gray-500 border border-gray-200 rounded">TWD (Total)</label>
             <input type="number" value={amount} onChange={(e) => handleAmountChange(e.target.value)} placeholder="0" className={`w-full p-2 text-2xl font-black text-center ${POKE_INPUT_STYLE}`} />
          </div>

          <input type="text" value={item} onChange={(e) => setItem(e.target.value)} placeholder="消費項目 (例如: 拉麵)" className={`w-full p-2 text-xs font-bold text-center ${POKE_INPUT_STYLE}`} />
          
          {/* Category Selection - Changed to grid-cols-3 for better fit with 6 items */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            {CATEGORIES.map(cat => (
              <button 
                key={cat.id} 
                onClick={() => setSelectedCategory(cat.id)} 
                className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all active:scale-95 ${selectedCategory === cat.id ? `bg-white border-black shadow-[2px_2px_0px_#000]` : 'bg-gray-50 border-transparent opacity-60 grayscale'}`}
              >
                <div className={`w-8 h-8 rounded-full ${cat.bg} text-white flex items-center justify-center mb-1 border border-black`}>
                    <cat.icon size={14} />
                </div>
                <span className="text-[10px] font-black whitespace-nowrap">{cat.label}</span>
              </button>
            ))}
          </div>

          <button onClick={handleSubmit} className={`w-full ${currentTheme.color} text-white py-3 font-black ${POKE_BTN_STYLE}`}>確定儲存</button>
        </div>
      ) : ledgerMode === 'detail' ? (
        <div className="space-y-3">
           {expenses.length === 0 && (
              <div className={`${POKE_CARD_STYLE} p-8 text-center bg-gray-50 text-gray-400 font-bold`}>
                  尚未有任何消費紀錄...
              </div>
           )}
           {expenses.map((exp, i) => {
             const cat = CATEGORIES.find(c => c.id === exp.category) || CATEGORIES[0];
             return (
               <div key={exp.id || i} className={`${POKE_CARD_STYLE} p-3 flex justify-between items-center bg-white`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full border border-black ${cat.bg} text-white flex items-center justify-center`}>
                        <cat.icon size={16} />
                    </div>
                    <div><div className="font-black text-gray-800 text-sm">{exp.item}</div><div className="text-[10px] text-gray-400 font-bold">{exp.date}</div></div>
                  </div>
                  <span className={`font-black text-lg ${DIGITAL_FONT_STYLE}`}>NT$ {exp.amount}</span>
               </div>
             );
           })}
        </div>
      ) : (
        <div className="space-y-4">
            <div className={`${POKE_CARD_STYLE} p-4 bg-white`}>
                <div className="flex justify-between items-center mb-6 pb-2 border-b-2 border-dashed border-gray-200">
                    <span className="text-xs font-black text-gray-500 uppercase">Total Expense</span>
                    <span className={`text-2xl font-black ${DIGITAL_FONT_STYLE}`}>NT$ {statsData.totalExpense.toFixed(0)}</span>
                </div>
                
                {/* Pie Chart */}
                <div className="flex justify-center mb-6 relative">
                    <div 
                        className="w-40 h-40 rounded-full border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,0.2)]"
                        style={{ background: statsData.gradientString }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-16 h-16 bg-white rounded-full border-2 border-black flex items-center justify-center shadow-inner">
                            <PieChart size={24} className="text-gray-400" />
                        </div>
                    </div>
                </div>

                {/* Legend List */}
                <div className="space-y-2">
                    {statsData.catStats.map(cat => (
                        <div key={cat.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100">
                            <div className="flex items-center">
                                <div className={`w-3 h-3 rounded-full border border-black mr-2 ${cat.bg}`}></div>
                                <span className="text-xs font-black text-gray-700">{cat.label}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-gray-400">{cat.percentage.toFixed(1)}%</span>
                                <span className={`text-sm font-black ${DIGITAL_FONT_STYLE}`}>NT$ {cat.total}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
