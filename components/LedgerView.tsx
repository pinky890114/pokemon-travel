
import React, { useState, useMemo } from 'react';
import { Calculator, ArrowDown, ArrowRight, Scale, Coins, Wallet } from 'lucide-react';
import { Expense, Theme, Member } from '../types';
import { POKE_CARD_STYLE, POKE_INPUT_STYLE, POKE_BTN_STYLE, DIGITAL_FONT_STYLE } from '../constants';

interface LedgerViewProps {
  currentTheme: Theme;
  expenses: Expense[];
  members: Member[];
  onAddExpense: (amount: number, item: string, payer: string) => void;
}

export const LedgerView: React.FC<LedgerViewProps> = ({ currentTheme, expenses, members, onAddExpense }) => {
  const [ledgerMode, setLedgerMode] = useState<'input' | 'detail' | 'settle'>('input');
  const [amount, setAmount] = useState('');
  const [item, setItem] = useState('');
  const [payer, setPayer] = useState(members[0]?.id || '');
  const [calcValues, setCalcValues] = useState({ chf: '', eur: '', twd: '' });

  const [selectedCurrency, setSelectedCurrency] = useState<'CHF' | 'EUR'>('CHF');
  const [foreignAmount, setForeignAmount] = useState('');
  
  const RATES = { CHF: 36.5, EUR: 34.2 };

  const settlementData = useMemo(() => {
    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
    const averageExpense = totalExpense / (members.length || 1);

    const memberBalances = members.map(m => {
        const paid = expenses.filter(e => e.payer === m.id).reduce((sum, e) => sum + e.amount, 0);
        return {
            ...m,
            paid,
            balance: paid - averageExpense
        };
    }).sort((a, b) => b.balance - a.balance); 

    const transfers: { from: string; fromImg: string; to: string; toImg: string; amount: number }[] = [];
    
    let debtors = memberBalances.filter(m => m.balance < -1).map(m => ({ ...m }));
    let creditors = memberBalances.filter(m => m.balance > 1).map(m => ({ ...m }));
    
    debtors.sort((a, b) => a.balance - b.balance);
    creditors.sort((a, b) => b.balance - a.balance);

    let i = 0;
    let j = 0; 

    while (i < debtors.length && j < creditors.length) {
        let debtor = debtors[i];
        let creditor = creditors[j];

        let amount = Math.min(Math.abs(debtor.balance), creditor.balance);
        
        if (amount > 0) {
            transfers.push({
                from: debtor.name,
                fromImg: debtor.img,
                to: creditor.name,
                toImg: creditor.img,
                amount: Math.round(amount)
            });
        }

        debtor.balance += amount;
        creditor.balance -= amount;

        if (Math.abs(debtor.balance) < 1) i++;
        if (creditor.balance < 1) j++;
    }

    return { totalExpense, averageExpense, memberBalances, transfers };
  }, [expenses, members]);


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
    onAddExpense(Number(amount), item, payer);
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
        <button onClick={() => setLedgerMode('settle')} className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all flex items-center justify-center ${ledgerMode === 'settle' ? `${currentTheme.color} text-white border-2 border-black shadow-sm` : 'text-gray-500 hover:bg-white/50'}`}>
            <Scale size={12} className="mr-1" />分帳
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

          <input type="text" value={item} onChange={(e) => setItem(e.target.value)} placeholder="消費項目 (例如: 神奇糖果)" className={`w-full p-2 text-xs font-bold text-center ${POKE_INPUT_STYLE}`} />
          <div className="flex space-x-2 overflow-x-auto py-2 no-scrollbar">
            {members.map(m => (
              <button key={m.id} onClick={() => setPayer(m.id)} className={`flex-shrink-0 flex items-center px-2 py-1 rounded-lg border-2 transition-all ${payer === m.id ? 'bg-gray-100 border-black shadow-[2px_2px_0px_#000]' : 'opacity-40 grayscale border-transparent'}`}>
                <img src={m.img} className="w-5 h-5 rounded-full mr-1" alt="av" /><span className="text-[10px] font-black">{m.name}</span>
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
             const m = members.find(x => x.id === exp.payer) || members[0];
             return (
               <div key={exp.id || i} className={`${POKE_CARD_STYLE} p-3 flex justify-between items-center bg-white`}>
                  <div className="flex items-center space-x-3">
                    <img src={m?.img} className="w-8 h-8 rounded-full border border-black" alt="av" />
                    <div><div className="font-black text-gray-800 text-sm">{exp.item}</div><div className="text-[10px] text-gray-400 font-bold">{m?.name} · {exp.date}</div></div>
                  </div>
                  <span className={`font-black text-lg ${DIGITAL_FONT_STYLE}`}>₩ {exp.amount}</span>
               </div>
             );
           })}
        </div>
      ) : (
        <div className="space-y-4">
            <div className={`${POKE_CARD_STYLE} p-4 bg-white`}>
                <div className="flex justify-between items-center mb-4 pb-2 border-b-2 border-dashed border-gray-200">
                    <span className="text-xs font-black text-gray-500 uppercase">Total Expense</span>
                    <span className={`text-2xl font-black ${DIGITAL_FONT_STYLE}`}>₩ {settlementData.totalExpense.toFixed(0)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-gray-500 uppercase">Avg / Person</span>
                    <span className={`text-xl font-black text-blue-600 ${DIGITAL_FONT_STYLE}`}>₩ {settlementData.averageExpense.toFixed(0)}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
                {settlementData.memberBalances.map(m => (
                    <div key={m.id} className={`${POKE_CARD_STYLE} p-2 flex items-center justify-between`}>
                        <div className="flex items-center space-x-2">
                             <img src={m.img} className="w-8 h-8 rounded-full border border-black" alt={m.name} />
                             <div>
                                 <div className="text-xs font-black">{m.name}</div>
                                 <div className="text-[9px] font-bold text-gray-400">Paid: {m.paid}</div>
                             </div>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-black border border-black/10 ${m.balance >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                             {m.balance >= 0 ? '+' : ''}{m.balance.toFixed(0)}
                        </div>
                    </div>
                ))}
            </div>

            {settlementData.transfers.length > 0 && (
                <div className="relative">
                     <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t-2 border-black border-dashed -z-10"></div>
                     <span className="bg-[#f3f4f6] px-2 text-xs font-black text-gray-400 mx-auto block w-fit">SUGGESTED TRANSFERS</span>
                </div>
            )}

            <div className="space-y-2">
                {settlementData.transfers.length === 0 && settlementData.totalExpense > 0 ? (
                    <div className="text-center text-xs font-bold text-green-600 py-4 bg-green-50 rounded-xl border border-green-200">
                        All settled! No transfers needed.
                    </div>
                ) : (
                    settlementData.transfers.map((t, idx) => (
                        <div key={idx} className={`${POKE_CARD_STYLE} p-3 flex items-center justify-between bg-yellow-50`}>
                             <div className="flex items-center space-x-2">
                                <img src={t.fromImg} className="w-6 h-6 rounded-full border border-black" alt={t.from} />
                                <span className="text-xs font-black">{t.from}</span>
                             </div>
                             
                             <div className="flex flex-col items-center px-2">
                                <span className={`text-sm font-black ${DIGITAL_FONT_STYLE}`}>₩ {t.amount}</span>
                                <ArrowRight size={14} className="text-gray-400" />
                             </div>

                             <div className="flex items-center space-x-2">
                                <span className="text-xs font-black">{t.to}</span>
                                <img src={t.toImg} className="w-6 h-6 rounded-full border border-black" alt={t.to} />
                             </div>
                        </div>
                    ))
                )}
            </div>
        </div>
      )}
    </div>
  );
};
