import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/mockServer';
import { GameResult } from '../../types';

const formatMoney = (n: number) => `$${n.toLocaleString()}`;

export default function Coinflip() {
  const { wallet, refreshWallet, refreshHistory } = useApp();
  const [bet, setBet] = useState(100000);
  const [choice, setChoice] = useState<'heads' | 'tails'>('heads');
  const [result, setResult] = useState<GameResult | null>(null);
  const [coinResult, setCoinResult] = useState<'heads' | 'tails' | null>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState('');

  const play = async () => {
    if (!wallet || bet <= 0 || bet > wallet.balance) {
      setError('Invalid bet amount');
      return;
    }
    setPlaying(true);
    setError('');
    setResult(null);
    setCoinResult(null);

    try {
      const { result: gameResult } = await api.playCoinflip(bet, choice);
      const seed = `${Date.now()}`;
      const flip = Math.random() < 0.5 ? 'heads' : 'tails';
      setCoinResult(flip);
      setResult(gameResult);
      await refreshWallet();
      await refreshHistory();
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
    }
    setPlaying(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Coinflip</h1>
        <p className="text-sm text-gray-500 mt-1">Pick heads or tails. 2x payout on win.</p>
      </div>

      {/* Game Area */}
      <div className="bg-[#0f0f1a] border border-gray-800/50 rounded-2xl p-6">
        {/* Coin Display */}
        <div className="flex justify-center mb-8">
          <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center transition-all duration-500 ${
            coinResult === 'heads' ? 'border-yellow-500 bg-yellow-500/10' :
            coinResult === 'tails' ? 'border-gray-400 bg-gray-400/10' :
            'border-gray-700 bg-[#1a1a2e]'
          } ${playing ? 'animate-spin' : ''}`}>
            {coinResult ? (
              <span className="text-3xl font-bold">{coinResult === 'heads' ? 'H' : 'T'}</span>
            ) : (
              <span className="text-2xl text-gray-600">?</span>
            )}
          </div>
        </div>

        {/* Choice Selection */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setChoice('heads')}
            disabled={playing}
            className={`p-4 rounded-xl border-2 transition-all ${
              choice === 'heads'
                ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
                : 'border-gray-800 bg-[#1a1a2e] text-gray-400 hover:border-gray-700'
            }`}
          >
            <p className="text-lg font-bold">HEADS</p>
            <p className="text-xs text-gray-500 mt-1">2x payout</p>
          </button>
          <button
            onClick={() => setChoice('tails')}
            disabled={playing}
            className={`p-4 rounded-xl border-2 transition-all ${
              choice === 'tails'
                ? 'border-gray-400 bg-gray-400/10 text-gray-300'
                : 'border-gray-800 bg-[#1a1a2e] text-gray-400 hover:border-gray-700'
            }`}
          >
            <p className="text-lg font-bold">TAILS</p>
            <p className="text-xs text-gray-500 mt-1">2x payout</p>
          </button>
        </div>

        {/* Bet Input */}
        <div className="space-y-3 mb-6">
          <label className="text-xs text-gray-500 uppercase tracking-wider">Bet Amount</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={bet}
              onChange={(e) => setBet(Math.max(0, parseInt(e.target.value) || 0))}
              disabled={playing}
              className="flex-1 bg-[#1a1a2e] border border-gray-800 rounded-lg px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-emerald-500/50"
            />
            <button onClick={() => setBet(Math.floor((wallet?.balance || 0) / 2))} className="px-3 py-2 rounded-lg bg-[#1a1a2e] border border-gray-800 text-xs text-gray-400 hover:text-white">½</button>
            <button onClick={() => setBet(wallet?.balance || 0)} className="px-3 py-2 rounded-lg bg-[#1a1a2e] border border-gray-800 text-xs text-gray-400 hover:text-white">MAX</button>
          </div>
        </div>

        {/* Play Button */}
        <button
          onClick={play}
          disabled={playing || !wallet || bet <= 0 || bet > wallet.balance}
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-800 disabled:text-gray-600 text-white font-medium transition-colors"
        >
          {playing ? 'Flipping...' : `Flip Coin - ${formatMoney(bet)}`}
        </button>

        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
      </div>

      {/* Result */}
      {result && (
        <div className={`bg-[#0f0f1a] border rounded-2xl p-6 ${result.won ? 'border-green-500/30' : 'border-red-500/30'}`}>
          <h3 className={`text-lg font-bold mb-4 ${result.won ? 'text-green-400' : 'text-red-400'}`}>
            {result.won ? '🎉 You Won!' : '💀 You Lost'}
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 text-xs">Bet</p>
              <p className="font-mono text-white">{formatMoney(bet)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Gross Payout</p>
              <p className="font-mono text-white">{formatMoney(result.grossPayout)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">15% Tax on Profit</p>
              <p className="font-mono text-amber-400">-{formatMoney(result.tax)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Net Profit</p>
              <p className={`font-mono ${result.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {result.netProfit >= 0 ? '+' : ''}{formatMoney(result.netProfit)}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-500 text-xs">Final Balance</p>
              <p className="font-mono text-lg text-emerald-400">{formatMoney(result.finalBalance)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
