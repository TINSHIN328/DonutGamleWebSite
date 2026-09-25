import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/mockServer';
import { GameResult } from '../../types';
const formatMoney = (n: number) => `$${n.toLocaleString()}`;
const REDS = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];

export default function Roulette() {
  const { wallet, refreshWallet, refreshHistory } = useApp();
  const [bet, setBet] = useState(100000);
  const [betType, setBetType] = useState('red');
  const [number, setNumber] = useState(0);
  const [result, setResult] = useState<GameResult | null>(null);
  const [spinResult, setSpinResult] = useState<number | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [error, setError] = useState('');

  const spin = async () => {
    if (!wallet || bet <= 0 || bet > wallet.balance) { setError('Invalid bet'); return; }
    setError(''); setSpinning(true); setResult(null); setSpinResult(null);
    try {
      const { result: r } = await api.playRoulette(bet, betType, betType === 'number' ? number : undefined);
      setSpinResult((r.details as any).number);
      setResult(r);
      await refreshWallet(); await refreshHistory();
    } catch (e: any) { setError(e.message); }
    setSpinning(false);
  };

  const getColor = (n: number) => n === 0 ? 'bg-green-600' : REDS.includes(n) ? 'bg-red-600' : 'bg-gray-900';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Roulette</h1><p className="text-sm text-gray-500 mt-1">Place your bets on the wheel.</p></div>
      <div className="bg-[#0f0f1a] border border-gray-800/50 rounded-2xl p-6 space-y-4">
        {/* Result display */}
        <div className="flex justify-center">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold border-4 border-gray-700 transition-all ${spinning ? 'animate-spin' : spinResult !== null ? getColor(spinResult) : 'bg-[#1a1a2e]'}`}>
            {spinResult !== null ? spinResult : '?'}
          </div>
        </div>
        {/* Bet type */}
        <div className="grid grid-cols-3 gap-2">
          {[{t:'red',l:'Red',c:'bg-red-600/20 border-red-600/50 text-red-400'},{t:'black',l:'Black',c:'bg-gray-800/50 border-gray-600/50 text-gray-300'},{t:'green',l:'Green (0)',c:'bg-green-600/20 border-green-600/50 text-green-400'}].map(b => (
            <button key={b.t} onClick={() => setBetType(b.t)} className={`p-3 rounded-xl border text-sm font-medium transition-all ${betType === b.t ? b.c : 'border-gray-800 text-gray-500 hover:border-gray-700'}`}>{b.l}</button>
          ))}
          {[{t:'odd',l:'Odd'},{t:'even',l:'Even'}].map(b => (
            <button key={b.t} onClick={() => setBetType(b.t)} className={`p-3 rounded-xl border text-sm font-medium transition-all ${betType === b.t ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-gray-800 text-gray-500 hover:border-gray-700'}`}>{b.l}</button>
          ))}
        </div>
        {betType === 'number' && (
          <div><label className="text-xs text-gray-500">Number (0-36)</label>
            <input type="number" min={0} max={36} value={number} onChange={e => setNumber(parseInt(e.target.value) || 0)}
              className="w-full mt-1 bg-[#1a1a2e] border border-gray-800 rounded-lg px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-emerald-500/50" />
          </div>
        )}
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
          <h3 className={`text-lg font-bold mb-4 ${result.won ? 'text-green-400' : 'text-red-400'}`}>{result.won ? '🎉 Winner!' : '💀 No Luck'}</h3>
          <p className="text-sm text-gray-400 mb-3">Landed on: <span className="font-bold text-white">{spinResult}</span> ({spinResult === 0 ? 'Green' : REDS.includes(spinResult!) ? 'Red' : 'Black'})</p>
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
