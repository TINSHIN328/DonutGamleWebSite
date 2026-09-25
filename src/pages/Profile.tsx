import React from 'react';
import { useApp } from '../context/AppContext';
const formatMoney = (n: number) => `$${n.toLocaleString()}`;

export default function Profile() {
  const { user, wallet, gameHistory } = useApp();
  if (!user || !wallet) return null;

  const wins = gameHistory.filter(g => g.won).length;
  const losses = gameHistory.filter(g => !g.won).length;
  const winRate = gameHistory.length > 0 ? (wins / gameHistory.length * 100).toFixed(1) : '0';
  const biggestWin = gameHistory.filter(g => g.won).reduce((max, g) => g.netProfit > max ? g.netProfit : max, 0);
  const biggestLoss = gameHistory.filter(g => !g.won).reduce((min, g) => g.netProfit < min ? g.netProfit : min, 0);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">Profile</h1>
      <div className="bg-[#0f0f1a] border border-gray-800/50 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl font-bold">{user.discordUsername[0]}</div>
          <div>
            <h2 className="text-lg font-bold text-white">{user.discordUsername}</h2>
            <p className="text-xs text-gray-500">Discord ID: {user.discordId}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-[#1a1a2e]">
            <p className="text-[10px] text-gray-500 uppercase">Discord</p>
            <p className="text-sm text-white">{user.discordUsername}</p>
            <p className="text-[10px] text-emerald-400 mt-1">✓ Verified</p>
          </div>
          <div className="p-3 rounded-lg bg-[#1a1a2e]">
            <p className="text-[10px] text-gray-500 uppercase">Minecraft</p>
            <p className="text-sm text-white">{user.minecraftUsername || 'Not linked'}</p>
            <p className={`text-[10px] mt-1 ${user.minecraftOnline ? 'text-emerald-400' : 'text-red-400'}`}>
              {user.minecraftOnline ? '🟢 Online' : '🔴 Offline'}
            </p>
          </div>
        </div>
        {user.minecraftUuid && (
          <div className="p-3 rounded-lg bg-[#1a1a2e]">
            <p className="text-[10px] text-gray-500 uppercase">Minecraft UUID</p>
            <p className="text-xs font-mono text-gray-400">{user.minecraftUuid}</p>
          </div>
        )}
      </div>
      <div className="bg-[#0f0f1a] border border-gray-800/50 rounded-2xl p-6">
        <h3 className="text-sm font-medium text-white mb-4">Statistics</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div><p className="text-[10px] text-gray-500 uppercase">Games Played</p><p className="text-lg font-bold text-white">{gameHistory.length}</p></div>
          <div><p className="text-[10px] text-gray-500 uppercase">Wins</p><p className="text-lg font-bold text-green-400">{wins}</p></div>
          <div><p className="text-[10px] text-gray-500 uppercase">Losses</p><p className="text-lg font-bold text-red-400">{losses}</p></div>
          <div><p className="text-[10px] text-gray-500 uppercase">Win Rate</p><p className="text-lg font-bold text-white">{winRate}%</p></div>
          <div><p className="text-[10px] text-gray-500 uppercase">Biggest Win</p><p className="text-lg font-bold text-green-400">{formatMoney(biggestWin)}</p></div>
          <div><p className="text-[10px] text-gray-500 uppercase">Biggest Loss</p><p className="text-lg font-bold text-red-400">{formatMoney(Math.abs(biggestLoss))}</p></div>
          <div><p className="text-[10px] text-gray-500 uppercase">Total Wagered</p><p className="text-lg font-bold text-white">{formatMoney(wallet.totalWagered)}</p></div>
          <div><p className="text-[10px] text-gray-500 uppercase">Profit</p><p className={`text-lg font-bold ${wallet.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>{wallet.profit >= 0 ? '+' : ''}{formatMoney(wallet.profit)}</p></div>
          <div><p className="text-[10px] text-gray-500 uppercase">Rakeback</p><p className="text-lg font-bold text-pink-400">{formatMoney(wallet.rakebackAvailable)}</p></div>
        </div>
      </div>
      <div className="bg-[#0f0f1a] border border-gray-800/50 rounded-2xl p-6">
        <h3 className="text-sm font-medium text-white mb-3">Referral Code</h3>
        <div className="flex items-center gap-3">
          <div className="flex-1 p-3 rounded-lg bg-[#1a1a2e] font-mono text-sm text-emerald-400">{user.referralCode}</div>
          <button onClick={() => navigator.clipboard.writeText(user.referralCode)} className="px-4 py-3 rounded-lg bg-[#1a1a2e] border border-gray-800 text-xs text-gray-400 hover:text-white">Copy</button>
        </div>
        <p className="text-[10px] text-gray-500 mt-2">Share this code to earn rewards when friends join.</p>
      </div>
    </div>
  );
}
