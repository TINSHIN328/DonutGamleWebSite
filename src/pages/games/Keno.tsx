import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/mockServer';
import { GameResult } from '../../types';
const formatMoney = (n: number) => `$${n.toLocaleString()}`;

export default function Keno() {
  const { wallet, refreshWallet, refreshHistory } = useApp();
  const [bet, setBet] = useState(100000);
  const [selected, setSelected] = useState<number[]>([]);
  const [result, setResult] = useState<GameResult | null>(null);
  const [winningNums, setWinningNums] = useState<number[]>([]);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState('');

  const toggle = (n: number) => {
    if (selected.includes(n)) setSelected(selected.filter(x => x !== n));
    else if (selected.length < 10) setSelected([...selected, n]);
  };

  const play = async () => {
    if (!wallet || bet <= 0 || bet > wallet.balance || selected.length === 0) { setError('Select numbers and set bet'); return; }
    setError(''); setPlaying(true); setResult(null); setWinningNums([]);
    try {
      const { result: r } = await api.playKeno(bet, selected);
      setWinningNums((r.details as any).winningNumbers);
      setResult(r);
      await refreshWallet(); await refreshHistory();
    } catch (e: any) { setError(e.message); }
    setPlaying(false);
  };

  const matches = selected.filter(n => winningNums.includes(n)).length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Keno</h1><p className="text-sm text-gray-500 mt-1">Pick up to 10 numbers. Match winning numbers to win.</p></div>
      <div className="bg-[#0f0f1a] border border-gray-800/50 rounded-2xl p-6 space-y-4">
        <div className="grid grid-cols-8 gap-1.5">
          {Array.from({ length: 40 }, (_, i) => i + 1).map(n => {
            const isSelected = selected.includes(n);
            const isWinning = winningNums.includes(n);
            const isMatch = isSelected && isWinning;
            return (
              <button key={n} onClick={() => !playing && toggle(n)} disabled={playing}
                className={`h-9 rounded-lg text-xs font-medium transition-all ${
                  isMatch ? 'bg-green-500/20 border border-green-500 text-green-400' :
                  isWinning ? 'bg-amber-500/20 border border-amber-500 text-amber-400' :
                  isSelected ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-400' :
                  'bg-[#1a1a2e] border border-gray-800 text-gray-400 hover:border-gray-600'
                }`}>{n}</button>
            );
          })}
        </div>
        <p className="text-xs text-gray-500">Selected: {selected.length}/10 {winningNums.length > 0 && `| Matches: ${matches}`}</p>
        <div><label className="text-xs text-gray-500 uppercase tracking-wider">Bet Amount</label>
          <div className="flex gap-2 mt-1">
            <input type="number" value={bet} onChange={e => setBet(Math.max(0, parseInt(e.target.value) || 0))}
              className="flex-1 bg-[#1a1a2e] border border-gray-800 rounded-lg px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-emerald-500/50" />
            <button onClick={() => setBet(wallet?.balance || 0)} className="px-3 py-2 rounded-lg bg-[#1a1a2e] border border-gray-800 text-xs text-gray-400">MAX</button>
          </div>
        </div>
        <button onClick={play} disabled={playing || !wallet || bet <= 0 || bet > wallet.balance || selected.length === 0}
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-800 disabled:text-gray-600 text-white font-medium transition-colors">
          {playing ? 'Drawing...' : `Play - ${formatMoney(bet)}`}
        </button>
        {error && <p className="text-red-400 text-xs">{error}</p>}
      </div>
      {result && (
        <div className={`bg-[#0f0f1a] border rounded-2xl p-6 ${result.won ? 'border-green-500/30' : 'border-red-500/30'}`}>
          <h3 className={`text-lg font-bold mb-4 ${result.won ? 'text-green-400' : 'text-red-400'}`}>{result.won ? `🎉 ${matches} Matches!` : '💀 No Win'}</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-gray-500 text-xs">Bet</p><p className="font-mono text-white">{formatMoney(bet)}</p></div>
            <div><p className="text-gray-500 text-xs">Multiplier</p><p className="font-mono text-emerald-400">{(result.details as any).multiplier}x</p></div>
            <div><p className="text-gray-500 text-xs">Tax</p><p className="font-mono text-amber-400">-{formatMoney(result.tax)}</p></div>
            <div><p className="text-gray-500 text-xs">Net</p><p className={`font-mono ${result.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>{result.netProfit >= 0 ? '+' : ''}{formatMoney(result.netProfit)}</p></div>
          </div>
        </div>
      )}
    </div>
  );
}
