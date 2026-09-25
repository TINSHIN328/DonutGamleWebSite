import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/mockServer';
import { GameResult } from '../../types';
const formatMoney = (n: number) => `$${n.toLocaleString()}`;

export default function Tower() {
  const { wallet, refreshWallet, refreshHistory } = useApp();
  const [bet, setBet] = useState(100000);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'lost' | 'won'>('idle');
  const [sessionId, setSessionId] = useState('');
  const [currentFloor, setCurrentFloor] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [result, setResult] = useState<GameResult | null>(null);
  const [error, setError] = useState('');
  const [lastPick, setLastPick] = useState<{ floor: number; pos: number; safe: boolean } | null>(null);
  const FLOORS = 8;
  const COLS = 4;

  const startGame = async () => {
    if (!wallet || bet <= 0 || bet > wallet.balance) { setError('Invalid bet'); return; }
    setError(''); setResult(null); setLastPick(null);
    try {
      const session = await api.startTower(bet, FLOORS);
      setSessionId(session.id);
      setGameState('playing');
      setCurrentFloor(0);
      setMultiplier(1);
    } catch (e: any) { setError(e.message); }
  };

  const pick = async (pos: number) => {
    if (gameState !== 'playing') return;
    try {
      const res = await api.towerPick(sessionId, pos);
      setLastPick({ floor: currentFloor, pos, safe: res.safe });
      setMultiplier(res.multiplier);
      if (!res.safe) {
        setGameState('lost');
        if (res.gameResult) { setResult(res.gameResult); }
        await refreshWallet(); await refreshHistory();
      } else {
        setCurrentFloor(prev => prev + 1);
        if (res.gameResult) {
          setGameState('won');
          setResult(res.gameResult);
          await refreshWallet(); await refreshHistory();
        }
      }
    } catch (e: any) { setError(e.message); }
  };

  const cashout = async () => {
    if (gameState !== 'playing' || currentFloor === 0) return;
    try {
      const res = await api.towerCashout(sessionId);
      setResult(res);
      setGameState('won');
      await refreshWallet(); await refreshHistory();
    } catch (e: any) { setError(e.message); }
  };

  const reset = () => { setGameState('idle'); setCurrentFloor(0); setMultiplier(1); setResult(null); setLastPick(null); setError(''); };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Tower</h1><p className="text-sm text-gray-500 mt-1">Climb the tower by picking safe positions. Cash out anytime.</p></div>
      {gameState === 'idle' && (
        <div className="bg-[#0f0f1a] border border-gray-800/50 rounded-2xl p-6 space-y-4">
          <div><label className="text-xs text-gray-500 uppercase tracking-wider">Bet Amount</label>
            <div className="flex gap-2 mt-1">
              <input type="number" value={bet} onChange={e => setBet(Math.max(0, parseInt(e.target.value) || 0))}
                className="flex-1 bg-[#1a1a2e] border border-gray-800 rounded-lg px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-emerald-500/50" />
              <button onClick={() => setBet(wallet?.balance || 0)} className="px-3 py-2 rounded-lg bg-[#1a1a2e] border border-gray-800 text-xs text-gray-400">MAX</button>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            <p>{FLOORS} floors • 4 positions per floor • 1 safe each</p>
            <p className="mt-1">Multiplier: 1.5x per floor</p>
          </div>
          <button onClick={startGame} disabled={!wallet || bet <= 0 || bet > wallet.balance}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-800 disabled:text-gray-600 text-white font-medium transition-colors">
            Start - {formatMoney(bet)}
          </button>
          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>
      )}
      {gameState !== 'idle' && (
        <div className="bg-[#0f0f1a] border border-gray-800/50 rounded-2xl p-6 space-y-4">
          <div className="text-center">
            <p className="text-xs text-gray-500">Current Multiplier</p>
            <p className="text-2xl font-bold font-mono text-emerald-400">{multiplier.toFixed(2)}x</p>
            <p className="text-xs text-gray-500">Floor {currentFloor}/{FLOORS} • Potential: {formatMoney(Math.floor(bet * multiplier))}</p>
          </div>
          <div className="space-y-2">
            {Array.from({ length: FLOORS }, (_, idx) => {
              const floor = FLOORS - 1 - idx;
              const isCurrent = floor === currentFloor && gameState === 'playing';
              const isPast = floor < currentFloor;
              return (
                <div key={floor} className={`flex items-center gap-2 p-2 rounded-lg ${isCurrent ? 'bg-emerald-500/5 border border-emerald-500/20' : isPast ? 'bg-[#1a1a2e]/50' : 'bg-[#1a1a2e]/30'}`}>
                  <span className="text-[10px] text-gray-500 w-12 font-mono">{Math.round(Math.pow(1.5, floor + 1) * 100) / 100}x</span>
                  <div className="flex gap-1.5 flex-1">
                    {Array.from({ length: COLS }, (_, col) => {
                      const isLast = lastPick?.floor === floor && lastPick?.pos === col;
                      return (
                        <button key={col} onClick={() => isCurrent && pick(col)} disabled={!isCurrent}
                          className={`flex-1 h-10 rounded-lg border text-xs font-medium transition-all ${
                            isLast ? (lastPick?.safe ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-red-500/20 border-red-500 text-red-400') :
                            isCurrent ? 'bg-[#1a1a2e] border-gray-700 hover:border-emerald-500 hover:bg-emerald-500/10 cursor-pointer' :
                            'bg-[#1a1a2e]/50 border-gray-800/50 text-gray-600'
                          }`}>
                          {isLast ? (lastPick?.safe ? '✓' : '✗') : isCurrent ? '?' : '·'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          {gameState === 'playing' && (
            <button onClick={cashout} disabled={currentFloor === 0}
              className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:bg-gray-800 disabled:text-gray-600 text-white font-medium transition-colors">
              Cash Out ({formatMoney(Math.floor(bet * multiplier))})
            </button>
          )}
          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>
      )}
      {result && (
        <div className={`bg-[#0f0f1a] border rounded-2xl p-6 ${result.won ? 'border-green-500/30' : 'border-red-500/30'}`}>
          <h3 className={`text-lg font-bold mb-4 ${result.won ? 'text-green-400' : 'text-red-400'}`}>{result.won ? '🎉 Tower Conquered!' : '💀 Fell!'}</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-gray-500 text-xs">Bet</p><p className="font-mono text-white">{formatMoney(bet)}</p></div>
            <div><p className="text-gray-500 text-xs">Multiplier</p><p className="font-mono text-emerald-400">{multiplier.toFixed(2)}x</p></div>
            <div><p className="text-gray-500 text-xs">Tax</p><p className="font-mono text-amber-400">-{formatMoney(result.tax)}</p></div>
            <div><p className="text-gray-500 text-xs">Net</p><p className={`font-mono ${result.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>{result.netProfit >= 0 ? '+' : ''}{formatMoney(result.netProfit)}</p></div>
          </div>
          <button onClick={reset} className="w-full mt-4 py-2.5 rounded-xl bg-[#1a1a2e] border border-gray-800 text-sm text-gray-300 hover:text-white transition-colors">Play Again</button>
        </div>
      )}
    </div>
  );
}
