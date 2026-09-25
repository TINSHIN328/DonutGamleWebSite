import React, { useState, useEffect } from 'react';
import { api } from '../services/mockServer';
import { AdminStats } from '../types';
import { Shield, Users, Gamepad2, DollarSign, Activity, Database, Settings } from 'lucide-react';
const formatMoney = (n: number) => n >= 1000000 ? `$${(n / 1000000).toFixed(1)}M` : `$${n.toLocaleString()}`;

export default function Admin() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [tab, setTab] = useState<'overview' | 'users' | 'games' | 'settings'>('overview');

  useEffect(() => { api.getAdminStats().then(setStats); }, []);
  if (!stats) return <div className="text-gray-500 text-sm">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Shield size={24} className="text-amber-400" />
        <div><h1 className="text-2xl font-bold text-white">Admin Dashboard</h1><p className="text-sm text-gray-500">System management and monitoring.</p></div>
      </div>

      <div className="flex gap-2 border-b border-gray-800/50 pb-2">
        {(['overview', 'users', 'games', 'settings'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${tab === t ? 'bg-amber-500/10 text-amber-400' : 'text-gray-500 hover:text-gray-300'}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-[#0f0f1a] border border-gray-800/50 rounded-xl p-4"><Users size={14} className="text-blue-400 mb-2" /><p className="text-[10px] text-gray-500 uppercase">Total Users</p><p className="text-xl font-bold text-white">{stats.totalUsers.toLocaleString()}</p></div>
            <div className="bg-[#0f0f1a] border border-gray-800/50 rounded-xl p-4"><Gamepad2 size={14} className="text-purple-400 mb-2" /><p className="text-[10px] text-gray-500 uppercase">Total Games</p><p className="text-xl font-bold text-white">{stats.totalGames.toLocaleString()}</p></div>
            <div className="bg-[#0f0f1a] border border-gray-800/50 rounded-xl p-4"><DollarSign size={14} className="text-emerald-400 mb-2" /><p className="text-[10px] text-gray-500 uppercase">Total Wagered</p><p className="text-xl font-bold text-white">{formatMoney(stats.totalWagered)}</p></div>
            <div className="bg-[#0f0f1a] border border-gray-800/50 rounded-xl p-4"><Activity size={14} className="text-amber-400 mb-2" /><p className="text-[10px] text-gray-500 uppercase">Tax Collected</p><p className="text-xl font-bold text-amber-400">{formatMoney(stats.totalTaxCollected)}</p></div>
          </div>
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="bg-[#0f0f1a] border border-gray-800/50 rounded-xl p-4">
              <h3 className="text-sm font-medium text-white mb-3">System Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#1a1a2e]">
                  <span className="text-xs text-gray-400">Minecraft Bot</span>
                  <span className={`text-xs font-medium ${stats.minecraftOnline ? 'text-emerald-400' : 'text-red-400'}`}>{stats.minecraftOnline ? '🟢 Online' : '🔴 Offline'}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#1a1a2e]">
                  <span className="text-xs text-gray-400">Active Deposits</span>
                  <span className="text-xs text-white">{stats.activeDeposits}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#1a1a2e]">
                  <span className="text-xs text-gray-400">Active Withdrawals</span>
                  <span className="text-xs text-white">{stats.activeWithdrawals}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#1a1a2e]">
                  <span className="text-xs text-gray-400">Database</span>
                  <span className="text-xs text-emerald-400">🟢 Healthy</span>
                </div>
              </div>
            </div>
            <div className="bg-[#0f0f1a] border border-gray-800/50 rounded-xl p-4">
              <h3 className="text-sm font-medium text-white mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full p-2.5 rounded-lg bg-[#1a1a2e] border border-gray-800 text-xs text-gray-300 hover:text-white hover:border-gray-700 transition-colors text-left">Toggle Maintenance Mode</button>
                <button className="w-full p-2.5 rounded-lg bg-[#1a1a2e] border border-gray-800 text-xs text-gray-300 hover:text-white hover:border-gray-700 transition-colors text-left">Force Minecraft Reconnect</button>
                <button className="w-full p-2.5 rounded-lg bg-[#1a1a2e] border border-gray-800 text-xs text-gray-300 hover:text-white hover:border-gray-700 transition-colors text-left">Create Database Backup</button>
                <button className="w-full p-2.5 rounded-lg bg-[#1a1a2e] border border-gray-800 text-xs text-gray-300 hover:text-white hover:border-gray-700 transition-colors text-left">Clear Rate Limits</button>
                <button className="w-full p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 hover:bg-red-500/20 transition-colors text-left">Emergency Shutdown</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="bg-[#0f0f1a] border border-gray-800/50 rounded-xl p-4">
          <h3 className="text-sm font-medium text-white mb-3">User Management</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-gray-800/50"><th className="text-left p-3 text-gray-500">User</th><th className="text-left p-3 text-gray-500">Discord</th><th className="text-left p-3 text-gray-500">Minecraft</th><th className="text-right p-3 text-gray-500">Balance</th><th className="text-right p-3 text-gray-500">Actions</th></tr></thead>
              <tbody>
                <tr className="border-b border-gray-800/30"><td className="p-3 text-white">Sv2Fox041</td><td className="p-3 text-gray-400">Sv2Fox041</td><td className="p-3 text-gray-400">Sv2Fox041</td><td className="p-3 text-right font-mono text-emerald-400">$6,000,000</td><td className="p-3 text-right"><button className="text-emerald-400 hover:text-emerald-300">Edit</button></td></tr>
                <tr className="border-b border-gray-800/30"><td className="p-3 text-white">Player123</td><td className="p-3 text-gray-400">Player123</td><td className="p-3 text-gray-400">Player123</td><td className="p-3 text-right font-mono text-emerald-400">$1,250,000</td><td className="p-3 text-right"><button className="text-emerald-400 hover:text-emerald-300">Edit</button></td></tr>
                <tr className="border-b border-gray-800/30"><td className="p-3 text-white">MineGamer</td><td className="p-3 text-gray-400">MineGamer</td><td className="p-3 text-gray-400">MineGamer99</td><td className="p-3 text-right font-mono text-emerald-400">$850,000</td><td className="p-3 text-right"><button className="text-emerald-400 hover:text-emerald-300">Edit</button></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'games' && (
        <div className="bg-[#0f0f1a] border border-gray-800/50 rounded-xl p-4">
          <h3 className="text-sm font-medium text-white mb-3">Game Configuration</h3>
          <div className="space-y-2">
            {['Coinflip', 'Blackjack', 'Roulette', 'Slots', 'Dice', 'Chicken', 'Keno', 'Limbo', 'Mines', 'Tower'].map(game => (
              <div key={game} className="flex items-center justify-between p-3 rounded-lg bg-[#1a1a2e]">
                <span className="text-xs text-white">{game}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-gray-500">Tax: 15%</span>
                  <div className="w-8 h-4 rounded-full bg-emerald-500 relative cursor-pointer"><div className="absolute right-0.5 top-0.5 w-3 h-3 rounded-full bg-white" /></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'settings' && (
        <div className="bg-[#0f0f1a] border border-gray-800/50 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-medium text-white">System Settings</h3>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-[#1a1a2e]"><label className="text-[10px] text-gray-500 uppercase">Game Tax Rate</label><input type="text" defaultValue="15%" className="w-full mt-1 bg-transparent border-b border-gray-700 text-sm text-white py-1 focus:outline-none focus:border-emerald-500" /></div>
            <div className="p-3 rounded-lg bg-[#1a1a2e]"><label className="text-[10px] text-gray-500 uppercase">Withdrawal Tax</label><input type="text" defaultValue="2.5%" className="w-full mt-1 bg-transparent border-b border-gray-700 text-sm text-white py-1 focus:outline-none focus:border-emerald-500" /></div>
            <div className="p-3 rounded-lg bg-[#1a1a2e]"><label className="text-[10px] text-gray-500 uppercase">Big Win Threshold</label><input type="text" defaultValue="$100,000,000" className="w-full mt-1 bg-transparent border-b border-gray-700 text-sm text-white py-1 focus:outline-none focus:border-emerald-500" /></div>
            <div className="p-3 rounded-lg bg-[#1a1a2e]"><label className="text-[10px] text-gray-500 uppercase">Daily Wager Limit</label><input type="text" defaultValue="$50,000,000" className="w-full mt-1 bg-transparent border-b border-gray-700 text-sm text-white py-1 focus:outline-none focus:border-emerald-500" /></div>
            <div className="p-3 rounded-lg bg-[#1a1a2e]"><label className="text-[10px] text-gray-500 uppercase">Rakeback Rate</label><input type="text" defaultValue="0.3%" className="w-full mt-1 bg-transparent border-b border-gray-700 text-sm text-white py-1 focus:outline-none focus:border-emerald-500" /></div>
            <button className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors">Save Settings</button>
          </div>
        </div>
      )}
    </div>
  );
}
