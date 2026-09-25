import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/mockServer';
const formatMoney = (n: number) => `$${n.toLocaleString()}`;

export default function Rakeback() {
  const { wallet, refreshWallet } = useApp();
  const [claiming, setClaiming] = useState(false);
  if (!wallet) return null;

  const claim = async () => {
    setClaiming(true);
    await api.claimRakeback();
    await refreshWallet();
    setClaiming(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Rakeback</h1><p className="text-sm text-gray-500 mt-1">Earn back a percentage of every wager.</p></div>
      <div className="bg-[#0f0f1a] border border-gray-800/50 rounded-2xl p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#1a1a2e]"><p className="text-[10px] text-gray-500 uppercase">Total Wagered</p><p className="text-xl font-bold font-mono text-white">{formatMoney(wallet.totalWagered)}</p></div>
          <div className="p-4 rounded-xl bg-[#1a1a2e]"><p className="text-[10px] text-gray-500 uppercase">Rakeback Rate</p><p className="text-xl font-bold font-mono text-emerald-400">{(wallet.rakebackRate * 100).toFixed(1)}%</p></div>
        </div>
        <div className="p-4 rounded-xl bg-pink-500/5 border border-pink-500/20">
          <p className="text-[10px] text-gray-500 uppercase">Available Rakeback</p>
          <p className="text-3xl font-bold font-mono text-pink-400">{formatMoney(wallet.rakebackAvailable)}</p>
        </div>
        <button onClick={claim} disabled={claiming || wallet.rakebackAvailable <= 0}
          className="w-full py-3 rounded-xl bg-pink-600 hover:bg-pink-500 disabled:bg-gray-800 disabled:text-gray-600 text-white font-medium transition-colors">
          {claiming ? 'Claiming...' : 'Claim Rakeback'}
        </button>
        <div className="p-3 rounded-lg bg-[#1a1a2e] text-xs text-gray-400">
          <p className="font-medium text-gray-300 mb-1">How it works:</p>
          <p>• Earn {(wallet.rakebackRate * 100).toFixed(1)}% of every wager</p>
          <p>• Rakeback accumulates automatically</p>
          <p>• Claim anytime to add to your balance</p>
          <p>• Calculated server-side, cannot be manipulated</p>
        </div>
      </div>
    </div>
  );
}
