import React, { useState } from 'react';
import { hashSeed } from '../services/mockServer';
import { Shield } from 'lucide-react';

export default function ProvablyFair() {
  const [serverSeed, setServerSeed] = useState('');
  const [clientSeed, setClientSeed] = useState('');
  const [nonce, setNonce] = useState('1');
  const [hash, setHash] = useState('');
  const [verifying, setVerifying] = useState(false);

  const verify = async () => {
    setVerifying(true);
    const h = await hashSeed(serverSeed);
    setHash(h);
    setVerifying(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Shield size={24} className="text-emerald-400" />
        <div><h1 className="text-2xl font-bold text-white">Provably Fair</h1><p className="text-sm text-gray-500">Verify every game result independently.</p></div>
      </div>

      <div className="bg-[#0f0f1a] border border-gray-800/50 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-medium text-white">How It Works</h3>
        <div className="space-y-3 text-sm text-gray-400">
          <div className="flex gap-3"><span className="text-emerald-400 font-bold">1.</span><p>Before each game, the server generates a <span className="text-white font-medium">Server Seed</span> and shows you its <span className="text-white font-medium">SHA-256 hash</span>.</p></div>
          <div className="flex gap-3"><span className="text-emerald-400 font-bold">2.</span><p>A <span className="text-white font-medium">Client Seed</span> is combined with the server seed and a <span className="text-white font-medium">nonce</span> to generate the game result.</p></div>
          <div className="flex gap-3"><span className="text-emerald-400 font-bold">3.</span><p>After the game, the server reveals the original <span className="text-white font-medium">Server Seed</span>.</p></div>
          <div className="flex gap-3"><span className="text-emerald-400 font-bold">4.</span><p>You can verify that <code className="px-1.5 py-0.5 rounded bg-[#1a1a2e] text-emerald-400 text-xs">SHA-256(Server Seed) = Server Seed Hash</code></p></div>
          <div className="flex gap-3"><span className="text-emerald-400 font-bold">5.</span><p>You can independently calculate the game result using the seeds and nonce.</p></div>
        </div>
      </div>

      <div className="bg-[#0f0f1a] border border-gray-800/50 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-medium text-white">Verify a Seed</h3>
        <div className="space-y-3">
          <div><label className="text-xs text-gray-500">Server Seed (revealed after game)</label>
            <input type="text" value={serverSeed} onChange={e => setServerSeed(e.target.value)} placeholder="Enter server seed..."
              className="w-full mt-1 bg-[#1a1a2e] border border-gray-800 rounded-lg px-4 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-emerald-500/50" />
          </div>
          <button onClick={verify} disabled={!serverSeed || verifying}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-800 disabled:text-gray-600 text-white text-sm font-medium transition-colors">
            {verifying ? 'Computing...' : 'Compute Hash'}
          </button>
          {hash && (
            <div className="p-3 rounded-lg bg-[#1a1a2e]">
              <p className="text-[10px] text-gray-500 uppercase mb-1">SHA-256 Hash</p>
              <p className="text-xs font-mono text-emerald-400 break-all">{hash}</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#0f0f1a] border border-gray-800/50 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-medium text-white">Game-Specific Verification</h3>
        <div className="space-y-3 text-xs text-gray-400">
          <div className="p-3 rounded-lg bg-[#1a1a2e]">
            <p className="font-medium text-gray-300 mb-1">Coinflip</p>
            <p>Result = randomFloat(serverSeed:clientSeed:nonce) &lt; 0.5 → Heads, else Tails</p>
          </div>
          <div className="p-3 rounded-lg bg-[#1a1a2e]">
            <p className="font-medium text-gray-300 mb-1">Limbo / Crash</p>
            <p>Crash point = floor((100 * 2^32 - h) / (2^32 - h)) / 100 where h = hash(serverSeed:clientSeed:nonce) mod 2^32</p>
          </div>
          <div className="p-3 rounded-lg bg-[#1a1a2e]">
            <p className="font-medium text-gray-300 mb-1">Mines</p>
            <p>Mine positions generated from serverSeed:mine:index for each mine</p>
          </div>
          <div className="p-3 rounded-lg bg-[#1a1a2e]">
            <p className="font-medium text-gray-300 mb-1">Chicken / Tower</p>
            <p>Safe column/position per row/floor from serverSeed:row_index or serverSeed:floor_index</p>
          </div>
          <div className="p-3 rounded-lg bg-[#1a1a2e]">
            <p className="font-medium text-gray-300 mb-1">Blackjack</p>
            <p>Deck shuffled using serverSeed:shuffle:index for Fisher-Yates shuffle</p>
          </div>
        </div>
      </div>

      <div className="bg-[#0f0f1a] border border-gray-800/50 rounded-2xl p-6">
        <h3 className="text-sm font-medium text-white mb-3">Security Guarantees</h3>
        <div className="space-y-2 text-xs text-gray-400">
          <p>✓ Server seed is committed before the game starts (hash shown)</p>
          <p>✓ Server cannot change the seed after seeing your actions</p>
          <p>✓ Client seed adds additional entropy</p>
          <p>✓ Nonce ensures unique results for each game</p>
          <p>✓ All results are deterministic and verifiable</p>
          <p>✓ Game state is server-authoritative (no client manipulation)</p>
          <p>✓ All financial operations are atomic and idempotent</p>
        </div>
      </div>
    </div>
  );
}
