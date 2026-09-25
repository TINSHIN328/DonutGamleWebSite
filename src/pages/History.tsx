import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GameType } from '../types';
const formatMoney = (n: number) => `$${n.toLocaleString()}`;
const formatTime = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function History() {
  const { gameHistory } = useApp();
  const [filter, setFilter] = useState<'all' | 'win' | 'loss' | GameType>('all');

  const filtered = gameHistory.filter(g => {
    if (filter === 'all') return true;
    if (filter === 'win') return g.won;
    if (filter === 'loss') return !g.won;
    return g.game === filter;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">Game History</h1>
      <div className="flex flex-wrap gap-2">
        {(['all', 'win', 'loss', 'coinflip', 'blackjack', 'roulette', 'slots', 'dice', 'chicken', 'keno', 'limbo', 'mines', 'tower'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-[#1a1a2e] text-gray-500 border border-gray-800 hover:text-gray-300'}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      <div className="bg-[#0f0f1a] border border-gray-800/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-800/50">
                <th className="text-left p-3 text-gray-500 font-medium">Game</th>
                <th className="text-right p-3 text-gray-500 font-medium">Bet</th>
                <th className="text-right p-3 text-gray-500 font-medium">Payout</th>
                <th className="text-right p-3 text-gray-500 font-medium">Tax</th>
                <th className="text-right p-3 text-gray-500 font-medium">Net</th>
                <th className="text-right p-3 text-gray-500 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(g => (
                <tr key={g.id} className="border-b border-gray-800/30 hover:bg-white/[0.02]">
                  <td className="p-3"><span className="capitalize text-white">{g.game}</span></td>
                  <td className="p-3 text-right font-mono text-gray-300">{formatMoney(g.bet)}</td>
                  <td className="p-3 text-right font-mono text-gray-300">{formatMoney(g.grossPayout)}</td>
                  <td className="p-3 text-right font-mono text-amber-400">{formatMoney(g.tax)}</td>
                  <td className={`p-3 text-right font-mono font-medium ${g.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {g.netProfit >= 0 ? '+' : ''}{formatMoney(g.netProfit)}
                  </td>
                  <td className="p-3 text-right text-gray-500">{formatTime(g.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <p className="text-center text-gray-500 text-sm p-8">No games found</p>}
      </div>
    </div>
  );
}
