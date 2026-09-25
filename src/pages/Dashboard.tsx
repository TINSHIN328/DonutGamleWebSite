import React from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { Wallet, TrendingUp, TrendingDown, Gamepad2, ArrowUpRight, Zap } from 'lucide-react';

const formatMoney = (n: number) => `$${n.toLocaleString()}`;
const formatTime = (d: string) => {
  const date = new Date(d);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
};

const gameColors: Record<string, string> = {
  coinflip: 'text-yellow-400',
  blackjack: 'text-green-400',
  roulette: 'text-red-400',
  slots: 'text-purple-400',
  dice: 'text-blue-400',
  chicken: 'text-orange-400',
  keno: 'text-pink-400',
  limbo: 'text-cyan-400',
  mines: 'text-amber-400',
  tower: 'text-indigo-400',
};

export default function Dashboard() {
  const { wallet, gameHistory, transactions, bigWins, minecraftStatus } = useApp();

  if (!wallet) return null;

  const recentGames = gameHistory.slice(0, 5);
  const recentTx = transactions.slice(0, 5);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back to ZyroGamble</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${minecraftStatus?.online ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
            <div className={`w-2 h-2 rounded-full ${minecraftStatus?.online ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
            <span className="text-xs text-gray-400">{minecraftStatus?.online ? 'Bot Online' : 'Bot Offline'}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#0f0f1a] border border-gray-800/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wallet size={14} className="text-emerald-400" />
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Balance</span>
          </div>
          <p className="text-xl font-bold font-mono text-emerald-400">{formatMoney(wallet.balance)}</p>
        </div>
        <div className="bg-[#0f0f1a] border border-gray-800/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} className="text-green-400" />
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Total Won</span>
          </div>
          <p className="text-xl font-bold font-mono text-green-400">{formatMoney(wallet.totalWon)}</p>
        </div>
        <div className="bg-[#0f0f1a] border border-gray-800/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown size={14} className="text-red-400" />
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Total Wagered</span>
          </div>
          <p className="text-xl font-bold font-mono text-gray-300">{formatMoney(wallet.totalWagered)}</p>
        </div>
        <div className="bg-[#0f0f1a] border border-gray-800/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={14} className="text-amber-400" />
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Profit</span>
          </div>
          <p className={`text-xl font-bold font-mono ${wallet.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {wallet.profit >= 0 ? '+' : ''}{formatMoney(wallet.profit)}
          </p>
        </div>
      </div>

      {/* Minecraft Status */}
      <div className="bg-[#0f0f1a] border border-gray-800/50 rounded-xl p-4">
        <h3 className="text-sm font-medium text-white mb-3">Minecraft Bot Status</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-[10px] text-gray-500 uppercase">Status</p>
            <p className={`text-sm font-medium ${minecraftStatus?.online ? 'text-emerald-400' : 'text-red-400'}`}>
              {minecraftStatus?.online ? '🟢 Online' : '🔴 Offline'}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase">Username</p>
            <p className="text-sm font-medium text-white">{minecraftStatus?.username}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase">Server</p>
            <p className="text-sm font-medium text-white">{minecraftStatus?.server}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase">Ping</p>
            <p className="text-sm font-medium text-white">{minecraftStatus?.ping}ms</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent Games */}
        <div className="bg-[#0f0f1a] border border-gray-800/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-white">Recent Games</h3>
            <Link to="/history" className="text-xs text-emerald-400 hover:text-emerald-300">View all</Link>
          </div>
          <div className="space-y-2">
            {recentGames.map((game) => (
              <div key={game.id} className="flex items-center justify-between p-2.5 rounded-lg bg-[#1a1a2e]/50">
                <div className="flex items-center gap-3">
                  <Gamepad2 size={14} className={gameColors[game.game]} />
                  <div>
                    <p className="text-xs font-medium text-white capitalize">{game.game}</p>
                    <p className="text-[10px] text-gray-500">{formatTime(game.createdAt)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-mono font-medium ${game.won ? 'text-green-400' : 'text-red-400'}`}>
                    {game.won ? '+' : ''}{formatMoney(game.netProfit)}
                  </p>
                  <p className="text-[10px] text-gray-500">Bet: {formatMoney(game.bet)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-[#0f0f1a] border border-gray-800/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-white">Recent Transactions</h3>
            <Link to="/wallet" className="text-xs text-emerald-400 hover:text-emerald-300">View all</Link>
          </div>
          <div className="space-y-2">
            {recentTx.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-2.5 rounded-lg bg-[#1a1a2e]/50">
                <div>
                  <p className="text-xs font-medium text-white capitalize">{tx.type.replace('_', ' ')}</p>
                  <p className="text-[10px] text-gray-500">{tx.description}</p>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-mono font-medium ${tx.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {tx.amount >= 0 ? '+' : ''}{formatMoney(tx.amount)}
                  </p>
                  <p className="text-[10px] text-gray-500">{formatTime(tx.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Big Wins */}
      {bigWins.length > 0 && (
        <div className="bg-[#0f0f1a] border border-amber-500/20 rounded-xl p-4">
          <h3 className="text-sm font-medium text-amber-400 mb-3 flex items-center gap-2">
            <span>🎉</span> Big Wins
          </h3>
          <div className="space-y-2">
            {bigWins.map((bw) => (
              <div key={bw.id} className="flex items-center justify-between p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                <div>
                  <p className="text-xs font-medium text-white">{bw.username}</p>
                  <p className="text-[10px] text-gray-500 capitalize">{bw.game} • Bet: {formatMoney(bw.bet)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold font-mono text-amber-400">+{formatMoney(bw.netProfit)}</p>
                  <p className="text-[10px] text-gray-500">Tax: {formatMoney(bw.tax)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Access Games */}
      <div>
        <h3 className="text-sm font-medium text-white mb-3">Quick Play</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { name: 'Coinflip', path: '/games/coinflip', color: 'from-yellow-500/20 to-yellow-600/5' },
            { name: 'Blackjack', path: '/games/blackjack', color: 'from-green-500/20 to-green-600/5' },
            { name: 'Roulette', path: '/games/roulette', color: 'from-red-500/20 to-red-600/5' },
            { name: 'Chicken', path: '/games/chicken', color: 'from-orange-500/20 to-orange-600/5' },
            { name: 'Mines', path: '/games/mines', color: 'from-amber-500/20 to-amber-600/5' },
          ].map((game) => (
            <Link
              key={game.path}
              to={game.path}
              className={`p-4 rounded-xl bg-gradient-to-br ${game.color} border border-gray-800/50 hover:border-gray-700/50 transition-all hover:scale-[1.02]`}
            >
              <p className="text-sm font-medium text-white">{game.name}</p>
              <ArrowUpRight size={14} className="text-gray-500 mt-2" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
