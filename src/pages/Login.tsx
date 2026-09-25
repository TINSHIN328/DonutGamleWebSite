import React from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();

  const handleLogin = async () => {
    await login();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-[#0f0f1a] border border-gray-800/50 rounded-2xl p-8 backdrop-blur">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
              <span className="text-2xl font-bold">Z</span>
            </div>
            <h1 className="text-3xl font-bold text-white">ZyroGamble</h1>
            <p className="text-gray-500 mt-2 text-sm">Minecraft Virtual Casino</p>
            <p className="text-gray-600 mt-1 text-xs">DonutSMP Economy</p>
          </div>

          {/* Info */}
          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1a1a2e]">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs text-gray-400">Virtual in-game currency only</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1a1a2e]">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-xs text-gray-400">Linked to Minecraft DonutSMP</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1a1a2e]">
              <div className="w-2 h-2 rounded-full bg-purple-400" />
              <span className="text-xs text-gray-400">Provably fair games</span>
            </div>
          </div>

          {/* Login button */}
          <button
            onClick={handleLogin}
            className="w-full py-3 px-4 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium text-sm transition-colors flex items-center justify-center gap-3"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
            </svg>
            Login with Discord
          </button>

          <p className="text-center text-[10px] text-gray-600 mt-4">
            By logging in, you agree to link your Discord and Minecraft accounts.
            <br />No real money is involved. All currency is virtual.
          </p>
        </div>

        <div className="mt-4 text-center">
          <p className="text-[10px] text-gray-700">Server: play.donutsmp.net:25565</p>
        </div>
      </div>
    </div>
  );
}
