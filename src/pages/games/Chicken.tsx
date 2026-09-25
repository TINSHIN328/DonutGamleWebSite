import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/mockServer';
import { GameResult } from '../../types';

const formatMoney = (n: number) => `$${n.toLocaleString()}`;

export default function Chicken() {
  const { wallet, refreshWallet, refreshHistory } = useApp();
  const [bet, setBet] = useState(100000);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'lost' | 'won'>('idle');
  const [currentRow, setCurrentRow] = useState(0);
  const [multiplier, setMultiplier] = useState(1.0);
  const [sessionId, setSessionId] = useState('');
  const [result, setResult] = useState<GameResult | null>(null);
  const [error, setError] = useState('');
  const [lastPick, setLastPick] = useState<{ row: number; col: number; safe: boolean } | null>(null);
  const TOTAL_ROWS = 8;
  const COLS = 5;

  const multipliers = Array.from({ length: TOTAL_ROWS + 1 }, (_, i) => Math.round(Math.pow(1.4, i) * 100) / 100);

  const startGame = async () => {
    if (!wallet || bet <= 0 || bet > wallet.balance) { setError('Invalid bet'); return; }
    setError('');
    try {
      const session = await api.startChicken(bet, TOTAL_ROWS);
      setSessionId(session.id);
      setGameState('playing');
      setCurrentRow(0);
      setMultiplier(1.0);
      setResult(null);
      setLastPick(null);
    } catch (e: any) { setError(e.message); }
  };

  const pickColumn = async (col: number) => {
    if (gameState !== 'playing') return;
    try {
      const res = await api.chickenPick(sessionId, col);
      setLastPick({ row: currentRow, col, safe: res.survived });
      if (!res.survived) {
        setGameState('lost');
        setResult(res.gameResult!);
        await refreshWallet();
        await refreshHistory();
      } else {
        setMultiplier(res.multiplier);
        setCurrentRow(prev => prev + 1);
        if (res.gameResult) {
          setGameState('won');
          setResult(res.gameResult);
          await refreshWallet();
          await refreshHistory();
        }
      }
    } catch (e: any) { setError(e.message); }
  };

  const cashout = async () => {
    if (gameState !== 'playing' || currentRow === 0) return;
    try {
      const res = await api.chickenCashout(sessionId);
      setResult(res);
      setGameState('won');
      await refreshWallet();
      await refreshHistory();
    } catch (e: any) { setError(e.message); }
  };

  const reset = () => {
    setGameState('idle');
    setCurrentRow(0);
    setMultiplier(1.0);
    setResult(null);
    setLastPick(null);
    setError('');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Chicken</h1>
        <p className="text-sm text-gray-500 mt-1">Pick the safe column. Cash out anytime. Multiplier increases each row.</p>
      </div>

      {gameState === 'idle' && (
        <div className="bg-[#0f0f1a] border border-gray-800/50 rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider">Bet Amount</label>
            <div className="flex gap-2 mt-1">
              <input type="number" value={bet} onChange={(e) => setBet(Math.max(0, parseInt(e.target.value) || 0))}
                className="flex-1 bg-[#1a1a2e] border border-gray-800 rounded-lg px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-emerald-500/50" />
              <button onClick={() => setBet(wallet?.balance || 0)} className="px-3 py-2 rounded-lg bg-[#1a1a2e] border border-gray-800 text-xs text-gray-400">MAX</button>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-2">Multiplier Table</p>
            <div className="grid grid-cols-4 gap-1">
              {multipliers.map((m, i) => (
                <div key={i} className="text-center p-1.5 rounded bg-[#1a1a2e] text-xs font-mono text-gray-400">
                  Row {i}: <span className="text-emerald-400">{m}x</span>
                </div>
              ))}
            </div>
          </div>
          <button onClick={startGame} disabled={!wallet || bet <= 0 || bet > wallet.balance}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-800 disabled:text-gray-600 text-white font-medium transition-colors">
            Start Game - {formatMoney(bet)}
          </button>
          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>
      )}

      {gameState !== 'idle' && (
        <div className="bg-[#0f0f1a] border border-gray-800/50 rounded-2xl p-6 space-y-4">
          {/* Multiplier display */}
          <div className="text-center">
            <p className="text-xs text-gray-500">Current Multiplier</p>
            <p className="text-3xl font-bold font-mono text-emerald-400">{multiplier.toFixed(2)}x</p>
            <p className="text-xs text-gray-500 mt-1">Potential: {formatMoney(Math.floor(bet * multiplier))}</p>
          </div>

          {/* Grid */}
          <div className="space-y-2">
            {Array.from({ length: TOTAL_ROWS }, (_, rowIdx) => {
              const row = TOTAL_ROWS - 1 - rowIdx;
              const isCurrentRow = row === currentRow && gameState === 'playing';
              const isPast = row < currentRow;
              return (
                <div key={row} className={`flex items-center gap-2 p-2 rounded-lg ${isCurrentRow ? 'bg-emerald-500/5 border border-emerald-500/20' : isPast ? 'bg-[#1a1a2e]/50' : 'bg-[#1a1a2e]/30'}`}>
                  <span className="text-[10px] text-gray-500 w-8 font-mono">{multipliers[row + 1]}x</span>
                  <div className="flex gap-1.5 flex-1">
                    {Array.from({ length: COLS }, (_, col) => {
                      const isLastPick = lastPick?.row === row && lastPick?.col === col;
                      return (
                        <button
                          key={col}
                          onClick={() => isCurrentRow && pickColumn(col)}
                          disabled={!isCurrentRow}
                          className={`flex-1 h-10 rounded-lg border text-xs font-medium transition-all ${
                            isLastPick
                              ? lastPick?.safe
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                : 'bg-red-500/20 border-red-500 text-red-400'
                              : isCurrentRow
                                ? 'bg-[#1a1a2e] border-gray-700 hover:border-emerald-500 hover:bg-emerald-500/10 cursor-pointer'
                                : 'bg-[#1a1a2e]/50 border-gray-800/50 text-gray-600'
                          }`}
                        >
                          {isLastPick ? (lastPick?.safe ? '✓' : '✗') : isCurrentRow ? '?' : '·'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          {gameState === 'playing' && (
            <div className="flex gap-3">
              <button onClick={cashout} disabled={currentRow === 0}
                className="flex-1 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:bg-gray-800 disabled:text-gray-600 text-white font-medium transition-colors">
                Cash Out ({formatMoney(Math.floor(bet * multiplier))})
              </button>
            </div>
          )}

          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className={`bg-[#0f0f1a] border rounded-2xl p-6 ${result.won ? 'border-green-500/30' : 'border-red-500/30'}`}>
          <h3 className={`text-lg font-bold mb-4 ${result.won ? 'text-green-400' : 'text-red-400'}`}>
            {result.won ? '🎉 Cashed Out!' : '💀 Wrong Column!'}
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-gray-500 text-xs">Bet</p><p className="font-mono text-white">{formatMoney(bet)}</p></div>
            <div><p className="text-gray-500 text-xs">Multiplier</p><p className="font-mono text-emerald-400">{multiplier.toFixed(2)}x</p></div>
            <div><p className="text-gray-500 text-xs">Gross Payout</p><p className="font-mono text-white">{formatMoney(result.grossPayout)}</p></div>
            <div><p className="text-gray-500 text-xs">Tax (15%)</p><p className="font-mono text-amber-400">-{formatMoney(result.tax)}</p></div>
            <div><p className="text-gray-500 text-xs">Net Profit</p><p className={`font-mono ${result.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>{result.netProfit >= 0 ? '+' : ''}{formatMoney(result.netProfit)}</p></div>
            <div><p className="text-gray-500 text-xs">Final Balance</p><p className="font-mono text-emerald-400">{formatMoney(result.finalBalance)}</p></div>
          </div>
          <button onClick={reset} className="w-full mt-4 py-2.5 rounded-xl bg-[#1a1a2e] border border-gray-800 text-sm text-gray-300 hover:text-white transition-colors">Play Again</button>
        </div>
      )}
    </div>
  );
}
