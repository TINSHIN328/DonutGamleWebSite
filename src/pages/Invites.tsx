import React, { useState, useEffect } from 'react';
import { api } from '../services/mockServer';
import { InviteStat } from '../types';
const formatMoney = (n: number) => `$${n.toLocaleString()}`;

export default function Invites() {
  const [stats, setStats] = useState<InviteStat | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => { api.getInvites().then(setStats); }, []);

  const copy = () => {
    if (stats) { navigator.clipboard.writeText(stats.code); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  if (!stats) return <div className="text-gray-500 text-sm">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Invites</h1><p className="text-sm text-gray-500 mt-1">Invite friends and earn rewards.</p></div>
      <div className="bg-[#0f0f1a] border border-gray-800/50 rounded-2xl p-6 space-y-4">
        <div className="p-4 rounded-xl bg-[#1a1a2e]">
          <p className="text-[10px] text-gray-500 uppercase mb-2">Your Referral Code</p>
          <div className="flex items-center gap-3">
            <p className="text-2xl font-bold font-mono text-emerald-400 flex-1">{stats.code}</p>
            <button onClick={copy} className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors">
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#1a1a2e]"><p className="text-[10px] text-gray-500 uppercase">Total Invites</p><p className="text-2xl font-bold text-white">{stats.totalInvites}</p></div>
          <div className="p-4 rounded-xl bg-[#1a1a2e]"><p className="text-[10px] text-gray-500 uppercase">Total Earned</p><p className="text-2xl font-bold text-emerald-400">{formatMoney(stats.totalEarned)}</p></div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-white mb-3">Invited Users</h3>
          <div className="space-y-2">
            {stats.invites.map((inv, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[#1a1a2e]">
                <div><p className="text-xs font-medium text-white">{inv.username}</p><p className="text-[10px] text-gray-500">Joined {new Date(inv.joinedAt).toLocaleDateString()}</p></div>
                <p className="text-xs font-mono text-emerald-400">+{formatMoney(inv.earned)}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="p-3 rounded-lg bg-[#1a1a2e] text-xs text-gray-400">
          <p className="font-medium text-gray-300 mb-1">Rules:</p>
          <p>• Earn rewards for each friend who joins and plays</p>
          <p>• Self-referrals are not allowed</p>
          <p>• Rewards are calculated server-side</p>
        </div>
      </div>
    </div>
  );
}
