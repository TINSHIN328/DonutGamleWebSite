import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/mockServer';
const formatMoney = (n: number) => `$${n.toLocaleString()}`;

export default function Withdraw() {
  const { wallet, user, refreshWallet, refreshHistory } = useApp();
  const [amount, setAmount] = useState(500000);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState<{ withdrawalId: string; netAmount: number; tax: number } | null>(null);
  const [error, setError] = useState('');
  const TAX_RATE = 0.025;

  const withdraw = async () => {
    if (!wallet || amount <= 0 || amount > wallet.balance) { setError('Invalid amount'); return; }
    if (!user?.minecraftUsername) { setError('Link Minecraft account first'); return; }
    setProcessing(true); setError(''); setSuccess(null);
    try {
      const res = await api.requestWithdrawal(amount);
      setSuccess(res);
      await refreshWallet(); await refreshHistory();
    } catch (e: any) { setError(e.message); }
    setProcessing(false);
  };

  const tax = Math.floor(amount * TAX_RATE);
  const net = amount - tax;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Withdraw</h1><p className="text-sm text-gray-500 mt-1">Send DonutSMP money back to your Minecraft account.</p></div>
      <div className="bg-[#0f0f1a] border border-gray-800/50 rounded-2xl p-6 space-y-4">
        {!success ? (
          <>
            <div className="p-3 rounded-lg bg-[#1a1a2e]">
              <p className="text-[10px] text-gray-500">Recipient</p>
              <p className="text-sm text-white font-medium">{user?.minecraftUsername || 'Not linked'}</p>
            </div>
            <div><label className="text-xs text-gray-500 uppercase tracking-wider">Amount</label>
              <div className="flex gap-2 mt-1">
                <input type="number" value={amount} onChange={e => setAmount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="flex-1 bg-[#1a1a2e] border border-gray-800 rounded-lg px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-emerald-500/50" />
                <button onClick={() => setAmount(wallet?.balance || 0)} className="px-3 py-2 rounded-lg bg-[#1a1a2e] border border-gray-800 text-xs text-gray-400">MAX</button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-[#1a1a2e]">
              <div><p className="text-[10px] text-gray-500">Amount</p><p className="text-xs font-mono text-white">{formatMoney(amount)}</p></div>
              <div><p className="text-[10px] text-gray-500">Tax (2.5%)</p><p className="text-xs font-mono text-amber-400">-{formatMoney(tax)}</p></div>
              <div><p className="text-[10px] text-gray-500">You Receive</p><p className="text-xs font-mono text-emerald-400">{formatMoney(net)}</p></div>
            </div>
            <button onClick={withdraw} disabled={processing || !wallet || amount <= 0 || amount > wallet.balance}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-800 disabled:text-gray-600 text-white font-medium transition-colors">
              {processing ? 'Processing...' : `Withdraw ${formatMoney(amount)}`}
            </button>
            {error && <p className="text-red-400 text-xs">{error}</p>}
          </>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
              <p className="text-sm text-emerald-400 font-medium">✓ Withdrawal Submitted</p>
              <p className="text-xs text-gray-400 mt-1">The bot will send {formatMoney(success.netAmount)} to {user?.minecraftUsername}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-[#1a1a2e]"><p className="text-[10px] text-gray-500">Transaction ID</p><p className="text-xs font-mono text-gray-300">{success.withdrawalId}</p></div>
              <div className="p-3 rounded-lg bg-[#1a1a2e]"><p className="text-[10px] text-gray-500">Net Amount</p><p className="text-xs font-mono text-emerald-400">{formatMoney(success.netAmount)}</p></div>
            </div>
            <button onClick={() => { setSuccess(null); setAmount(500000); }} className="w-full py-2.5 rounded-xl bg-[#1a1a2e] border border-gray-800 text-sm text-gray-400 hover:text-white transition-colors">New Withdrawal</button>
          </div>
        )}
      </div>
    </div>
  );
}
