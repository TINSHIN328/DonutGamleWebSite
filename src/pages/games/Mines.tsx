import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/mockServer';
import { GameResult } from '../../types';
const formatMoney = (n: number) => `$${n.toLocaleString()}`;

export default function Mines() {
  const { wallet, refreshWallet, refreshHistory } = useApp();
  const [bet, setBet] = useState(100000);
  const [mineCount, setMineCount] = useState(5);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'lost' | 'won'>('idle');
  const [sessionId, setSessionId] = useState('');
  const [revealed, setRevealed] = useState<number[]>([]);
  const [minePositions, setMinePositions] = useState<number[]>([]);
  const [multiplier, setMultiplier] = useState(1);
  const [result, setResult] = useState<GameResult | null>(null);
  const [error, setError] = useState('');

  const startGame = async () => {
    if (!wallet || bet <= 0 || bet > wallet.balance) { setError('Invalid bet'); return; }
    setError(''); setResult(null);
    try {
      const session = await api.startMines(bet, mineCount);
      setSessionId(session.id);
      setGameState('playing');
      setRevealed([]);
      setMinePositions([]);
      setMultiplier(1);
    } catch (e: any) { setError(e.message); }
  };

  const reveal = async (cell: number) => {
    if (gameState !== 'playing' || revealed.includes(cell)) return;
    try {
      const res = await api.minesReveal(sessionId, cell);
      setRevealed(prev => [...prev, cell]);
      setMultiplier(res.multiplier);
      if (!res.safe) {
        setGameState('lost');
        if (res.gameResult) {
          setMinePositions((res.gameResult.details as any).minePositions || []);
          setResult(res.gameResult);
        }
        await refreshWallet(); await refreshHistory();
      } else if (res.gameResult) {
        setGameState('won');
        setResult(res.gameResult);
        await refreshWallet(); await refreshHistory();
      }
    } catch (e: any) { setError(e.message); }
  };

  const cashout = async () => {
    if (gameState !== 'playing' || revealed.length === 0) return;
    try {
      const res = await api.minesCashout(sessionId);
      setResult(res);
      setGameState('won');
      await refreshWallet(); await refreshHistory();
    } catch (e: any) { setError(e.message); }
  };

  const reset = () => { setGameState('idle'); setRevealed([]); setMinePositions([]); setMultiplier(1); setResult(null); setError(''); };

  const isRevealed = (i: number) => revealed.includes(i);
  const isMine = (i: number) => minePositions.includes(i);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Mines</h1><p className="text-sm text-gray-500 mt-1">Reveal safe tiles. Avoid mines. Cash out anytime.</p></div>
      {gameState === 'idle' && (
        <div className="bg-[#0f0f1a] border border-gray-800/50 rounded-2xl p-6 space-y-4">
          <div><label className="text-xs text-gray-500">Mine Count</label>
            <input type="range" min={1} max={20} value={mineCount} onChange={e => setMineCount(parseInt(e.target.value))} className="w-full mt-1 accent-emerald-500" />
            <p className="text-xs text-gray-500 mt-1">{mineCount} mines on 5×5 grid</p>
          </div>
          <div><label className="text-xs text-gray-500 uppercase tracking-wider">Bet Amount</label>
            <div className="flex gap-2 mt-1">
              <input type="number" value={bet} onChange={e => setBet(Math.max(0, parseInt(e.target.value) || 0))}
                className="flex-1 bg-[#1a1a2e] border border-gray-800 rounded-lg px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-emerald-500/50" />
              <button onClick={() => setBet(wallet?.balance || 0)} className="px-3 py-2 rounded-lg bg-[#1a1a2e] border border-gray-800 text-xs text-gray-400">MAX</button>
            </div>
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
            <p className="text-xs text-gray-500">Potential: {formatMoney(Math.floor(bet * multiplier))}</p>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 25 }, (_, i) => {
              const rev = isRevealed(i);
              const mine = isMine(i);
              const showMine = (gameState === 'lost' || gameState === 'won') && mine;
              return (
                <button key={i} onClick={() => reveal(i)} disabled={gameState !== 'playing' || rev}
                  className={`aspect-square rounded-lg border text-sm font-bold transition-all ${
                    showMine ? 'bg-red-500/20 border-red-500 text-red-400' :
                    rev ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' :
                    gameState === 'playing' ? 'bg-[#1a1a2e] border-gray-700 hover:border-emerald-500 hover:bg-emerald-500/10' :
                    'bg-[#1a1a2e]/50 border-gray-800/50 text-gray-600'
                  }`}>
                  {showMine ? '💣' : rev ? '💎' : gameState === 'playing' ? '' : '·'}
                </button>
              );
            })}
          </div>
          {gameState === 'playing' && (
            <button onClick={cashout} disabled={revealed.length === 0}
              className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:bg-gray-800 disabled:text-gray-600 text-white font-medium transition-colors">
              Cash Out ({formatMoney(Math.floor(bet * multiplier))})
            </button>
          )}
          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>
      )}
      {result && (
        <div className={`bg-[#0f0f1a] border rounded-2xl p-6 ${result.won ? 'border-green-500/30' : 'border-red-500/30'}`}>
          <h3 className={`text-lg font-bold mb-4 ${result.won ? 'text-green-400' : 'text-red-400'}`}>{result.won ? '🎉 Cashed Out!' : '💀 Hit a Mine!'}</h3>
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
