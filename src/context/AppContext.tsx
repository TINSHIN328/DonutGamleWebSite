import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, Wallet, Transaction, GameHistory, MinecraftBotStatus, BigWin } from '../types';
import { api } from '../services/mockServer';

interface AppContextType {
  user: User | null;
  wallet: Wallet | null;
  transactions: Transaction[];
  gameHistory: GameHistory[];
  bigWins: BigWin[];
  minecraftStatus: MinecraftBotStatus | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshWallet: () => Promise<void>;
  refreshHistory: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [gameHistory, setGameHistory] = useState<GameHistory[]>([]);
  const [bigWins, setBigWins] = useState<BigWin[]>([]);
  const [minecraftStatus, setMinecraftStatus] = useState<MinecraftBotStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshWallet = useCallback(async () => {
    const w = await api.getWallet();
    setWallet(w);
  }, []);

  const refreshHistory = useCallback(async () => {
    const [txs, history, wins] = await Promise.all([
      api.getTransactions(),
      api.getGameHistory(),
      api.getBigWins(),
    ]);
    setTransactions(txs);
    setGameHistory(history);
    setBigWins(wins);
  }, []);

  useEffect(() => {
    async function init() {
      const u = await api.getUser();
      if (u) {
        setUser(u);
        await Promise.all([refreshWallet(), refreshHistory()]);
        const status = await api.getMinecraftStatus();
        setMinecraftStatus(status);
      }
      setIsLoading(false);
    }
    init();
  }, [refreshWallet, refreshHistory]);

  const login = async () => {
    const u = await api.login();
    setUser(u);
    await Promise.all([refreshWallet(), refreshHistory()]);
    const status = await api.getMinecraftStatus();
    setMinecraftStatus(status);
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    setWallet(null);
  };

  return (
    <AppContext.Provider value={{
      user, wallet, transactions, gameHistory, bigWins, minecraftStatus,
      isAuthenticated: !!user, isLoading, login, logout, refreshWallet, refreshHistory,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
