import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/mockServer';
import { GameResult } from '../../types';
const formatMoney = (n: number) => `$${n.toLocaleString()}`;

export default function Limbo() {
  const { wallet, refreshWallet, refreshHistory } = useApp();
  const [bet, setBet] = useState(100000);
  const [multiplier, setMultiplier] = useState(2.0);
  const [result, setResult] = useState<GameResult | null>(null);
  const [crashPoint, setCrashPoint] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState('');

  const play = async () => {
    if (!wallet || bet <= 0 || bet > wallet.balance || multiplier < 1.01) { setError('Invalid bet'); return; }
    setError(''); setPlaying(true); setResult(null); setCrashPoint(null);
    try {
      const { result: r } = await api.playLimbo(bet, multiplier);
      setCrashPoint((r.details as any).crashPoint);
      setResult(r);
      await refreshWallet(); await refreshHistory();
    } catch (e: any) { setError(e.message); }
    setPlaying(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Limbo</h1><p className="text-sm text-gray-500 mt-1">Set a target multiplier. If the crash point reaches it, you win.</p></div>
      <div className="bg-[#0f0f1a] border border-gray-800/50 rounded-2xl p-6 space-y-4">
        <div className="flex justify-center">
          <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center ${
            crashPoint !== null ? (result?.won ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10') : 'border-gray-700 bg-[#1a1a2e]'
          } ${playing ? 'animate-pulse' : ''}`}>
            <span className={`text-2xl font-bold font-mono ${crashPoint !== null ? (result?.won ? 'text-green-400' : 'text-red-400') : 'text-gray-500'}`}>
              {crashPoint !== null ? `${crashPoint.toFixed(2)}x` : playing ? '...' : `${multiplier.toFixed(2)}x`}
            </span>
          </div>
        </div>
        {crashPoint !== null && (
          <p className="text-center text-sm text-gray-400">
            Crash point: <span className={`font-mono font-bold ${result?.won ? 'text-green-400' : 'text-red-400'}`}>{crashPoint.toFixed(2)}x</span>
            {' '}vs target: <span className="font-mono font-bold text-white">{multiplier.toFixed(2)}x</span>
          </p>
        )}
        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wider">Target Multiplier</label>
          <input type="number" step={0.01} min={1.01} value={multiplier} onChange={e => setMultiplier(Math.max(1.01, parseFloat(e.target.value) || 1.01))}
            className="w-full mt-1 bg-[#1a1a2e] border border-gray-800 rounded-lg px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-emerald-500/50" />
          <p className="text-[10px] text-gray-600 mt-1">Win chance: ~{(100 / multiplier).toFixed(1)}%</p>
        </div>
        <div><label className="text-xs text-gray-500 uppercase tracking-wider">Bet Amount</label>
          <div className="flex gap-2 mt-1">
            <input type="number" value={bet} onChange={e => setBet(Math.max(0, parseInt(e.target.value) || 0))}
              className="flex-1 bg-[#1a1a2e] border border-gray-800 rounded-lg px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-emerald-500/50" />
            <button onClick={() => setBet(wallet?.balance || 0)} className="px-3 py-2 rounded-lg bg-[#1a1a2e] border border-gray-800 text-xs text-gray-400">MAX</button>
          </div>
        </div>
        <button onClick={play} disabled={playing || !wallet || bet <= 0 || bet > wallet.balance}
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-800 disabled:text-gray-600 text-white font-medium transition-colors">
          {playing ? 'Playing...' : `Play - ${formatMoney(bet)}`}
        </button>
        {error && <p className="text-red-400 text-xs">{error}</p>}
      </div>
      {result && (
        <div className={`bg-[#0f0f1a] border rounded-2xl p-6 ${result.won ? 'border-green-500/30' : 'border-red-500/30'}`}>
          <h3 className={`text-lg font-bold mb-4 ${result.won ? 'text-green-400' : 'text-red-400'}`}>{result.won ? '🎉 You Won!' : '💀 Crashed!'}</h3>
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
