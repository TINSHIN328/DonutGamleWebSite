import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard, Gamepad2, Wallet, ArrowDownToLine, ArrowUpFromLine,
  History, Gift, Users, Shield, LogOut, Menu, X, ChevronDown,
  CircleDot, Spade, Dices, Zap, Bird, Hash, TrendingUp, Grid3X3, Building2
} from 'lucide-react';

const formatMoney = (n: number) => {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(2)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n.toLocaleString()}`;
};

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  {
    label: 'Games', icon: Gamepad2, children: [
      { path: '/games/coinflip', icon: CircleDot, label: 'Coinflip' },
      { path: '/games/blackjack', icon: Spade, label: 'Blackjack' },
      { path: '/games/roulette', icon: CircleDot, label: 'Roulette' },
      { path: '/games/slots', icon: Dices, label: 'Slots' },
      { path: '/games/dice', icon: Dices, label: 'Dice' },
      { path: '/games/chicken', icon: Bird, label: 'Chicken' },
      { path: '/games/keno', icon: Hash, label: 'Keno' },
      { path: '/games/limbo', icon: TrendingUp, label: 'Limbo' },
      { path: '/games/mines', icon: Grid3X3, label: 'Mines' },
      { path: '/games/tower', icon: Building2, label: 'Tower' },
    ]
  },
  { path: '/wallet', icon: Wallet, label: 'Wallet' },
  { path: '/deposit', icon: ArrowDownToLine, label: 'Deposit' },
  { path: '/withdraw', icon: ArrowUpFromLine, label: 'Withdraw' },
  { path: '/history', icon: History, label: 'History' },
  { path: '/rakeback', icon: Gift, label: 'Rakeback' },
  { path: '/invites', icon: Users, label: 'Invites' },
  { path: '/provably-fair', icon: Shield, label: 'Provably Fair' },
  { path: '/profile', icon: Users, label: 'Profile' },
];

export default function Layout() {
  const { user, wallet, minecraftStatus, logout } = useApp();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [gamesExpanded, setGamesExpanded] = useState(true);

  return (
    <div className="flex h-screen bg-[#0a0a0f] text-gray-200">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#0f0f1a] border-r border-gray-800/50 flex flex-col transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-800/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center font-bold text-sm">Z</div>
            <div>
              <h1 className="font-bold text-white text-lg leading-tight">ZyroGamble</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Minecraft Casino</p>
            </div>
          </div>
        </div>

        {/* Wallet mini */}
        {wallet && (
          <div className="p-3 border-b border-gray-800/50">
            <div className="bg-[#1a1a2e] rounded-lg p-3">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Balance</p>
              <p className="text-lg font-bold text-emerald-400 font-mono">{formatMoney(wallet.balance)}</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {navItems.map((item) => {
            if (item.children) {
              return (
                <div key={item.label}>
                  <button
                    onClick={() => setGamesExpanded(!gamesExpanded)}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <item.icon size={16} />
                    <span>{item.label}</span>
                    <ChevronDown size={14} className={`ml-auto transition-transform ${gamesExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  {gamesExpanded && (
                    <div className="ml-4 mt-0.5 space-y-0.5">
                      {item.children.map((child) => (
                        <Link
                          key={child.path}
                          to={child.path}
                          onClick={() => setSidebarOpen(false)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                            location.pathname === child.path
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                          }`}
                        >
                          <child.icon size={12} />
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <Link
                key={item.path}
                to={item.path!}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  location.pathname === item.path
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            );
          })}
          {user?.isAdmin && (
            <Link
              to="/admin"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                location.pathname === '/admin'
                  ? 'bg-amber-500/10 text-amber-400'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Shield size={16} />
              Admin
            </Link>
          )}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-gray-800/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold">
              {user?.discordUsername?.[0] || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{user?.discordUsername}</p>
              <p className="text-[10px] text-gray-500">Discord</p>
            </div>
            <button onClick={logout} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-red-400 transition-colors">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 bg-[#0f0f1a]/80 backdrop-blur border-b border-gray-800/50 flex items-center px-4 gap-4 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-white/5">
            <Menu size={18} />
          </button>

          <div className="flex-1" />

          {/* Minecraft status */}
          {minecraftStatus && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a1a2e] border border-gray-800/50">
              <div className={`w-2 h-2 rounded-full ${minecraftStatus.online ? 'bg-emerald-400' : 'bg-red-400'}`} />
              <span className="text-xs text-gray-400">{minecraftStatus.username}</span>
              <span className="text-xs text-gray-600">|</span>
              <span className="text-xs text-gray-500">{minecraftStatus.ping}ms</span>
            </div>
          )}

          {/* Balance */}
          {wallet && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a1a2e] border border-gray-800/50">
              <Wallet size={14} className="text-emerald-400" />
              <span className="text-sm font-mono font-medium text-emerald-400">{formatMoney(wallet.balance)}</span>
            </div>
          )}
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
