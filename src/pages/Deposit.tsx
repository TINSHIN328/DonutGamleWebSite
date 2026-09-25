import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/mockServer';
const formatMoney = (n: number) => `$${n.toLocaleString()}`;

export default function Deposit() {
  const { wallet, refreshWallet } = useApp();
  const [amount, setAmount] = useState(1000000);
  const [session, setSession] = useState<{ sessionId: string; instructions: string } | null>(null);
  const [error, setError] = useState('');

  const requestDeposit = async () => {
    if (!amount || amount <= 0) { setError('Enter a valid amount'); return; }
    try {
      const s = await api.requestDeposit(amount);
      setSession(s);
      setError('');
    } catch (e: any) { setError(e.message); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Deposit</h1><p className="text-sm text-gray-500 mt-1">Send DonutSMP money to the bot in Minecraft. Deposits are verified automatically.</p></div>
      <div className="bg-[#0f0f1a] border border-gray-800/50 rounded-2xl p-6 space-y-4">
        {!session ? (
          <>
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
              <p className="text-xs text-amber-400 font-medium">⚠️ Important</p>
              <p className="text-xs text-gray-400 mt-1">Deposits are NOT credited by clicking a button. You must send an actual Minecraft payment to ZpSniper. The payment monitor will detect it automatically.</p>
            </div>
            <div><label className="text-xs text-gray-500 uppercase tracking-wider">Amount</label>
              <input type="number" value={amount} onChange={e => setAmount(parseInt(e.target.value) || 0)}
                className="w-full mt-1 bg-[#1a1a2e] border border-gray-800 rounded-lg px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-emerald-500/50" />
            </div>
            <button onClick={requestDeposit} className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors">
              Generate Deposit Address
            </button>
            {error && <p className="text-red-400 text-xs">{error}</p>}
          </>
        ) : (
          <>
            <div className="p-4 rounded-xl bg-[#1a1a2e] border border-gray-800">
              <p className="text-xs text-gray-500 mb-2">Session ID</p>
              <p className="text-xs font-mono text-gray-300">{session.sessionId}</p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
              <p className="text-xs text-emerald-400 font-medium mb-2">📋 Instructions</p>
              <p className="text-sm text-gray-300">{session.instructions}</p>
            </div>
            <div className="p-4 rounded-xl bg-[#1a1a2e] border border-gray-800">
              <p className="text-xs text-gray-500 mb-3">Payment Verification Flow</p>
              <div className="space-y-2 text-xs text-gray-400">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400" /> Minecraft payment detected</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400" /> Sender verification</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400" /> Amount verification</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400" /> Duplicate check</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400" /> Wallet credited</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#1a1a2e]">
              <span className="text-xs text-gray-500">Status</span>
              <span className="text-xs text-amber-400 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" /> Waiting for payment...</span>
            </div>
            <button onClick={() => setSession(null)} className="w-full py-2.5 rounded-xl bg-[#1a1a2e] border border-gray-800 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
          </>
        )}
      </div>
    </div>
  );
}
