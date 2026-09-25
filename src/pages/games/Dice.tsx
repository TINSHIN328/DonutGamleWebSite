import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/mockServer';
import { GameResult } from '../../types';
const formatMoney = (n: number) => `$${n.toLocaleString()}`;

export default function Dice() {
  const { wallet, refreshWallet, refreshHistory } = useApp();
  const [bet, setBet] = useState(100000);
  const [target, setTarget] = useState(50);
  const [direction, setDirection] = useState<'higher' | 'lower'>('higher');
  const [result, setResult] = useState<GameResult | null>(null);
  const [roll, setRoll] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [error, setError] = useState('');

  const multiplier = direction === 'higher' ? (100 / (100 - target)) * 0.97 : (100 / target) * 0.97;
  const winChance = direction === 'higher' ? (100 - target) : target;

  const play = async () => {
    if (!wallet || bet <= 0 || bet > wallet.balance) { setError('Invalid bet'); return; }
    setError(''); setRolling(true); setResult(null); setRoll(null);
    try {
      const { result: r } = await api.playDice(bet, target, direction);
      setRoll((r.details as any).roll);
      setResult(r);
      await refreshWallet(); await refreshHistory();
    } catch (e: any) { setError(e.message); }
    setRolling(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Dice</h1><p className="text-sm text-gray-500 mt-1">Roll over or under a target number.</p></div>
      <div className="bg-[#0f0f1a] border border-gray-800/50 rounded-2xl p-6 space-y-4">
        <div className="flex justify-center">
          <div className={`w-24 h-24 rounded-2xl bg-[#1a1a2e] border-2 border-gray-700 flex items-center justify-center text-3xl font-bold font-mono ${rolling ? 'animate-pulse' : roll !== null ? (result?.won ? 'text-green-400' : 'text-red-400') : 'text-gray-500'}`}>
            {roll !== null ? roll : '?'}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setDirection('lower')} className={`p-3 rounded-xl border text-sm font-medium ${direction === 'lower' ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-gray-800 text-gray-500'}`}>
            Lower ({target})
          </button>
          <button onClick={() => setDirection('higher')} className={`p-3 rounded-xl border text-sm font-medium ${direction === 'higher' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-gray-800 text-gray-500'}`}>
            Higher ({target})
          </button>
        </div>
        <div>
          <label className="text-xs text-gray-500">Target: {target}</label>
          <input type="range" min={2} max={98} value={target} onChange={e => setTarget(parseInt(e.target.value))}
            className="w-full mt-1 accent-emerald-500" />
          <div className="flex justify-between text-[10px] text-gray-600 mt-1">
            <span>Win chance: {winChance}%</span>
            <span>Multiplier: {multiplier.toFixed(2)}x</span>
          </div>
        </div>
        <div><label className="text-xs text-gray-500 uppercase tracking-wider">Bet Amount</label>
          <div className="flex gap-2 mt-1">
            <input type="number" value={bet} onChange={e => setBet(Math.max(0, parseInt(e.target.value) || 0))}
              className="flex-1 bg-[#1a1a2e] border border-gray-800 rounded-lg px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-emerald-500/50" />
            <button onClick={() => setBet(wallet?.balance || 0)} className="px-3 py-2 rounded-lg bg-[#1a1a2e] border border-gray-800 text-xs text-gray-400">MAX</button>
          </div>
        </div>
        <button onClick={play} disabled={rolling || !wallet || bet <= 0 || bet > wallet.balance}
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-800 disabled:text-gray-600 text-white font-medium transition-colors">
          {rolling ? 'Rolling...' : `Roll - ${formatMoney(bet)}`}
        </button>
        {error && <p className="text-red-400 text-xs">{error}</p>}
      </div>
      {result && (
        <div className={`bg-[#0f0f1a] border rounded-2xl p-6 ${result.won ? 'border-green-500/30' : 'border-red-500/30'}`}>
          <h3 className={`text-lg font-bold mb-4 ${result.won ? 'text-green-400' : 'text-red-400'}`}>{result.won ? '🎉 You Won!' : '💀 You Lost'}</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-gray-500 text-xs">Bet</p><p className="font-mono text-white">{formatMoney(bet)}</p></div>
            <div><p className="text-gray-500 text-xs">Payout</p><p className="font-mono text-white">{formatMoney(result.grossPayout)}</p></div>
            <div><p className="text-gray-500 text-xs">Tax</p><p className="font-mono text-amber-400">-{formatMoney(result.tax)}</p></div>
            <div><p className="text-gray-500 text-xs">Net</p><p className={`font-mono ${result.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>{result.netProfit >= 0 ? '+' : ''}{formatMoney(result.netProfit)}</p></div>
          </div>
        </div>
      )}
    </div>
  );
}
