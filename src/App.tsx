import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Wallet from './pages/Wallet';
import Deposit from './pages/Deposit';
import Withdraw from './pages/Withdraw';
import History from './pages/History';
import Profile from './pages/Profile';
import Rakeback from './pages/Rakeback';
import Invites from './pages/Invites';
import ProvablyFair from './pages/ProvablyFair';
import Admin from './pages/Admin';
import Coinflip from './pages/games/Coinflip';
import Blackjack from './pages/games/Blackjack';
import Roulette from './pages/games/Roulette';
import Slots from './pages/games/Slots';
import Dice from './pages/games/Dice';
import Chicken from './pages/games/Chicken';
import Keno from './pages/games/Keno';
import Limbo from './pages/games/Limbo';
import Mines from './pages/games/Mines';
import Tower from './pages/games/Tower';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useApp();
  if (isLoading) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useApp();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="wallet" element={<Wallet />} />
        <Route path="deposit" element={<Deposit />} />
        <Route path="withdraw" element={<Withdraw />} />
        <Route path="history" element={<History />} />
        <Route path="profile" element={<Profile />} />
        <Route path="rakeback" element={<Rakeback />} />
        <Route path="invites" element={<Invites />} />
        <Route path="provably-fair" element={<ProvablyFair />} />
        <Route path="admin" element={<Admin />} />
        <Route path="games/coinflip" element={<Coinflip />} />
        <Route path="games/blackjack" element={<Blackjack />} />
        <Route path="games/roulette" element={<Roulette />} />
        <Route path="games/slots" element={<Slots />} />
        <Route path="games/dice" element={<Dice />} />
        <Route path="games/chicken" element={<Chicken />} />
        <Route path="games/keno" element={<Keno />} />
        <Route path="games/limbo" element={<Limbo />} />
        <Route path="games/mines" element={<Mines />} />
        <Route path="games/tower" element={<Tower />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
