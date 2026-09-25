import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/mockServer';
import { GameResult } from '../../types';

const formatMoney = (n: number) => `$${n.toLocaleString()}`;
const cardColor = (card: string) => (card.includes('♥') || card.includes('♦')) ? 'text-red-400' : 'text-white';

export default function Blackjack() {
  const { wallet, refreshWallet, refreshHistory } = useApp();
  const [bet, setBet] = useState(100000);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [playerCards, setPlayerCards] = useState<string[]>([]);
  const [dealerCards, setDealerCards] = useState<string[]>([]);
  const [dealerHidden, setDealerHidden] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [result, setResult] = useState<GameResult | null>(null);
  const [error, setError] = useState('');

  const startGame = async () => {
    if (!wallet || bet <= 0 || bet > wallet.balance) { setError('Invalid bet'); return; }
    setError('');
    try {
      const session = await api.startBlackjack(bet);
      setSessionId(session.id);
      setPlayerCards(session.playerCards);
      setDealerCards(session.dealerCards);
      setDealerHidden(session.dealerHidden);
      setGameState('playing');
      setResult(null);
      if ((session as any).result) {
        setResult((session as any).result);
        setGameState('finished');
        await refreshWallet();
        await refreshHistory();
      }
    } catch (e: any) { setError(e.message); }
  };

  const hit = async () => {
    try {
      const res = await api.blackjackHit(sessionId);
      setPlayerCards(res.playerCards);
      if (res.bust) {
        setDealerCards(res.dealerCards);
        setDealerHidden('');
        setResult(res.gameResult!);
        setGameState('finished');
        await refreshWallet();
        await refreshHistory();
      }
    } catch (e: any) { setError(e.message); }
  };

  const stand = async () => {
    try {
      const res = await api.blackjackStand(sessionId);
      setResult(res);
      setDealerCards((res.details as any)?.dealerHand || []);
      setDealerHidden('');
      setGameState('finished');
      await refreshWallet();
      await refreshHistory();
    } catch (e: any) { setError(e.message); }
  };

  const double = async () => {
    try {
      const res = await api.blackjackDouble(sessionId);
      setResult(res);
      setDealerCards((res.details as any)?.dealerHand || []);
      setDealerHidden('');
      setGameState('finished');
      await refreshWallet();
      await refreshHistory();
    } catch (e: any) { setError(e.message); }
  };

  const handValue = (hand: string[]) => {
    let v = 0, aces = 0;
    for (const c of hand) {
      const val = c.replace(/[♠♥♦♣]/g, '');
      if (val === 'A') { aces++; v += 11; }
      else if (['K','Q','J'].includes(val)) v += 10;
      else v += parseInt(val);
    }
    while (v > 21 && aces > 0) { v -= 10; aces--; }
    return v;
  };

  const reset = () => { setGameState('idle'); setPlayerCards([]); setDealerCards([]); setDealerHidden(''); setResult(null); setError(''); };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Blackjack</h1>
        <p className="text-sm text-gray-500 mt-1">Get closer to 21 than the dealer. Blackjack pays 2.5x.</p>
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
          <button onClick={startGame} disabled={!wallet || bet <= 0 || bet > wallet.balance}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-800 disabled:text-gray-600 text-white font-medium transition-colors">
            Deal Cards - {formatMoney(bet)}
          </button>
          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>
      )}

      {gameState !== 'idle' && (
        <div className="bg-[#0f0f1a] border border-gray-800/50 rounded-2xl p-6 space-y-6">
          {/* Dealer */}
          <div>
            <p className="text-xs text-gray-500 mb-2">Dealer {gameState === 'finished' && `(${handValue([...dealerCards, dealerHidden].filter(Boolean))})`}</p>
            <div className="flex gap-2">
              {dealerCards.map((c, i) => (
                <div key={i} className={`w-14 h-20 rounded-lg bg-[#1a1a2e] border border-gray-700 flex items-center justify-center font-bold text-sm ${cardColor(c)}`}>{c}</div>
              ))}
              {dealerHidden && gameState !== 'finished' && (
                <div className="w-14 h-20 rounded-lg bg-gradient-to-br from-blue-900 to-blue-950 border border-blue-700/50 flex items-center justify-center text-blue-400 text-lg">?</div>
              )}
              {dealerHidden && gameState === 'finished' && (
                <div className={`w-14 h-20 rounded-lg bg-[#1a1a2e] border border-gray-700 flex items-center justify-center font-bold text-sm ${cardColor(dealerHidden)}`}>{dealerHidden}</div>
              )}
            </div>
          </div>

          {/* Player */}
          <div>
            <p className="text-xs text-gray-500 mb-2">Your Hand ({handValue(playerCards)})</p>
            <div className="flex gap-2">
              {playerCards.map((c, i) => (
                <div key={i} className={`w-14 h-20 rounded-lg bg-[#1a1a2e] border border-emerald-700/50 flex items-center justify-center font-bold text-sm ${cardColor(c)}`}>{c}</div>
              ))}
            </div>
          </div>

          {/* Actions */}
          {gameState === 'playing' && (
            <div className="flex gap-3">
              <button onClick={hit} className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-colors">Hit</button>
              <button onClick={stand} className="flex-1 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm transition-colors">Stand</button>
              {playerCards.length === 2 && (
                <button onClick={double} className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm transition-colors">Double</button>
              )}
            </div>
          )}
          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>
      )}

      {result && (
        <div className={`bg-[#0f0f1a] border rounded-2xl p-6 ${(result.details as any)?.push ? 'border-yellow-500/30' : result.won ? 'border-green-500/30' : 'border-red-500/30'}`}>
          <h3 className={`text-lg font-bold mb-4 ${(result.details as any)?.push ? 'text-yellow-400' : result.won ? 'text-green-400' : 'text-red-400'}`}>
            {(result.details as any)?.push ? '🤝 Push - Bet Returned' : result.won ? '🎉 You Won!' : '💀 Dealer Wins'}
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-gray-500 text-xs">Bet</p><p className="font-mono text-white">{formatMoney(bet)}</p></div>
            <div><p className="text-gray-500 text-xs">Payout</p><p className="font-mono text-white">{formatMoney(result.grossPayout)}</p></div>
            <div><p className="text-gray-500 text-xs">Tax</p><p className="font-mono text-amber-400">-{formatMoney(result.tax)}</p></div>
            <div><p className="text-gray-500 text-xs">Net</p><p className={`font-mono ${result.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>{result.netProfit >= 0 ? '+' : ''}{formatMoney(result.netProfit)}</p></div>
          </div>
          <button onClick={reset} className="w-full mt-4 py-2.5 rounded-xl bg-[#1a1a2e] border border-gray-800 text-sm text-gray-300 hover:text-white transition-colors">Play Again</button>
        </div>
      )}
    </div>
  );
}
