import React from 'react';
import { useApp } from '../context/AppContext';
import { Wallet as WalletIcon, ArrowDownToLine, ArrowUpFromLine, TrendingUp, TrendingDown, Zap, Gift } from 'lucide-react';
const formatMoney = (n: number) => `$${n.toLocaleString()}`;
const formatTime = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function WalletPage() {
  const { wallet, transactions } = useApp();
  if (!wallet) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">Wallet</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#0f0f1a] border border-gray-800/50 rounded-xl p-4">
          <WalletIcon size={14} className="text-emerald-400 mb-2" />
          <p className="text-[10px] text-gray-500 uppercase">Balance</p>
          <p className="text-lg font-bold font-mono text-emerald-400">{formatMoney(wallet.balance)}</p>
        </div>
        <div className="bg-[#0f0f1a] border border-gray-800/50 rounded-xl p-4">
          <ArrowDownToLine size={14} className="text-blue-400 mb-2" />
          <p className="text-[10px] text-gray-500 uppercase">Deposited</p>
          <p className="text-lg font-bold font-mono text-white">{formatMoney(wallet.totalDeposited)}</p>
        </div>
        <div className="bg-[#0f0f1a] border border-gray-800/50 rounded-xl p-4">
          <ArrowUpFromLine size={14} className="text-purple-400 mb-2" />
          <p className="text-[10px] text-gray-500 uppercase">Withdrawn</p>
          <p className="text-lg font-bold font-mono text-white">{formatMoney(wallet.totalWithdrawn)}</p>
        </div>
        <div className="bg-[#0f0f1a] border border-gray-800/50 rounded-xl p-4">
          <Zap size={14} className="text-amber-400 mb-2" />
          <p className="text-[10px] text-gray-500 uppercase">Profit</p>
          <p className={`text-lg font-bold font-mono ${wallet.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>{wallet.profit >= 0 ? '+' : ''}{formatMoney(wallet.profit)}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#0f0f1a] border border-gray-800/50 rounded-xl p-4">
          <TrendingUp size={14} className="text-green-400 mb-2" />
          <p className="text-[10px] text-gray-500 uppercase">Total Won</p>
          <p className="text-lg font-bold font-mono text-green-400">{formatMoney(wallet.totalWon)}</p>
        </div>
        <div className="bg-[#0f0f1a] border border-gray-800/50 rounded-xl p-4">
          <TrendingDown size={14} className="text-red-400 mb-2" />
          <p className="text-[10px] text-gray-500 uppercase">Total Lost</p>
          <p className="text-lg font-bold font-mono text-red-400">{formatMoney(wallet.totalLost)}</p>
        </div>
        <div className="bg-[#0f0f1a] border border-gray-800/50 rounded-xl p-4">
          <Zap size={14} className="text-cyan-400 mb-2" />
          <p className="text-[10px] text-gray-500 uppercase">Wagered</p>
          <p className="text-lg font-bold font-mono text-white">{formatMoney(wallet.totalWagered)}</p>
        </div>
        <div className="bg-[#0f0f1a] border border-gray-800/50 rounded-xl p-4">
          <Gift size={14} className="text-pink-400 mb-2" />
          <p className="text-[10px] text-gray-500 uppercase">Rakeback</p>
          <p className="text-lg font-bold font-mono text-pink-400">{formatMoney(wallet.rakebackAvailable)}</p>
        </div>
      </div>
      {/* Transactions */}
      <div className="bg-[#0f0f1a] border border-gray-800/50 rounded-xl p-4">
        <h3 className="text-sm font-medium text-white mb-3">Transaction History</h3>
        <div className="space-y-1">
          {transactions.map(tx => (
            <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/[0.02]">
              <div>
                <p className="text-xs font-medium text-white capitalize">{tx.type.replace(/_/g, ' ')}</p>
                <p className="text-[10px] text-gray-500">{tx.description} • {formatTime(tx.createdAt)}</p>
              </div>
              <div className="text-right">
                <p className={`text-xs font-mono font-medium ${tx.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {tx.amount >= 0 ? '+' : ''}{formatMoney(tx.amount)}
                </p>
                <p className="text-[10px] text-gray-600">{tx.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
