import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/mockServer';
import { GameResult } from '../../types';
const formatMoney = (n: number) => `$${n.toLocaleString()}`;

export default function Slots() {
  const { wallet, refreshWallet, refreshHistory } = useApp();
  const [bet, setBet] = useState(50000);
  const [reels, setReels] = useState(['🎰', '🎰', '🎰']);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<GameResult | null>(null);
  const [error, setError] = useState('');

  const spin = async () => {
    if (!wallet || bet <= 0 || bet > wallet.balance) { setError('Invalid bet'); return; }
    setError(''); setSpinning(true); setResult(null);
    // Animate
    const interval = setInterval(() => {
      const syms = ['🍒','🍋','🍊','🍇','💎','7️⃣','🔔','⭐'];
      setReels([syms[Math.floor(Math.random()*syms.length)], syms[Math.floor(Math.random()*syms.length)], syms[Math.floor(Math.random()*syms.length)]]);
    }, 100);
    try {
      const { result: r } = await api.playSlots(bet);
      clearInterval(interval);
      setReels((r.details as any).reels);
      setResult(r);
      await refreshWallet(); await refreshHistory();
    } catch (e: any) { clearInterval(interval); setError(e.message); }
    setSpinning(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Slots</h1><p className="text-sm text-gray-500 mt-1">Match symbols to win. 3 matching = big payout!</p></div>
      <div className="bg-[#0f0f1a] border border-gray-800/50 rounded-2xl p-6 space-y-6">
        <div className="flex justify-center gap-4">
          {reels.map((s, i) => (
            <div key={i} className={`w-24 h-28 rounded-xl bg-[#1a1a2e] border-2 border-gray-700 flex items-center justify-center text-4xl ${spinning ? 'animate-pulse' : ''}`}>{s}</div>
          ))}
        </div>
        <div className="text-center text-xs text-gray-500 space-y-1">
          <p>7️⃣7️⃣7️⃣ = 50x | 💎💎💎 = 25x | Triple = 10x | Pair = 2x</p>
        </div>
        <div><label className="text-xs text-gray-500 uppercase tracking-wider">Bet Amount</label>
          <div className="flex gap-2 mt-1">
            <input type="number" value={bet} onChange={e => setBet(Math.max(0, parseInt(e.target.value) || 0))}
              className="flex-1 bg-[#1a1a2e] border border-gray-800 rounded-lg px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-emerald-500/50" />
            <button onClick={() => setBet(wallet?.balance || 0)} className="px-3 py-2 rounded-lg bg-[#1a1a2e] border border-gray-800 text-xs text-gray-400">MAX</button>
          </div>
        </div>
        <button onClick={spin} disabled={spinning || !wallet || bet <= 0 || bet > wallet.balance}
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-800 disabled:text-gray-600 text-white font-medium transition-colors">
          {spinning ? 'Spinning...' : `Spin - ${formatMoney(bet)}`}
        </button>
        {error && <p className="text-red-400 text-xs">{error}</p>}
      </div>
      {result && (
        <div className={`bg-[#0f0f1a] border rounded-2xl p-6 ${result.won ? 'border-green-500/30' : 'border-red-500/30'}`}>
          <h3 className={`text-lg font-bold mb-4 ${result.won ? 'text-green-400' : 'text-red-400'}`}>{result.won ? '🎉 Jackpot!' : '💀 No Match'}</h3>
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
