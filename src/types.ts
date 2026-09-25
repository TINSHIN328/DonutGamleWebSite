export interface User {
  id: string;
  discordId: string;
  discordUsername: string;
  discordAvatar: string;
  minecraftUsername: string | null;
  minecraftUuid: string | null;
  minecraftOnline: boolean;
  isAdmin: boolean;
  createdAt: string;
  referralCode: string;
  referredBy: string | null;
}

export interface Wallet {
  balance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalWagered: number;
  totalWon: number;
  totalLost: number;
  profit: number;
  rakebackAvailable: number;
  rakebackRate: number;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'game_bet' | 'game_win' | 'rakeback' | 'refund' | 'admin_adjust';
  amount: number;
  before: number;
  after: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  description: string;
  gameId?: string;
  createdAt: string;
}

export interface GameSession {
  id: string;
  game: GameType;
  bet: number;
  status: 'active' | 'completed' | 'cancelled';
  result?: GameResult;
  serverSeedHash: string;
  serverSeed?: string;
  clientSeed: string;
  nonce: number;
  createdAt: string;
  completedAt?: string;
}

export interface GameResult {
  won: boolean;
  grossPayout: number;
  profit: number;
  tax: number;
  netProfit: number;
  finalBalance: number;
  details: Record<string, unknown>;
}

export type GameType = 'coinflip' | 'blackjack' | 'roulette' | 'slots' | 'dice' | 'chicken' | 'keno' | 'limbo' | 'mines' | 'tower';

export interface GameHistory {
  id: string;
  game: GameType;
  bet: number;
  won: boolean;
  grossPayout: number;
  profit: number;
  tax: number;
  netProfit: number;
  finalBalance: number;
  gameId: string;
  createdAt: string;
}

export interface MinecraftBotStatus {
  online: boolean;
  username: string;
  server: string;
  ping: number;
  lastConnected: string;
  lastDisconnected: string | null;
  reconnectCount: number;
}

export interface DepositSession {
  id: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'expired';
  minecraftSender: string | null;
  paymentHash: string | null;
  createdAt: string;
  expiresAt: string;
}

export interface WithdrawalRequest {
  id: string;
  amount: number;
  tax: number;
  netAmount: number;
  minecraftUsername: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
}

export interface BigWin {
  id: string;
  username: string;
  game: GameType;
  bet: number;
  grossProfit: number;
  tax: number;
  netProfit: number;
  gameId: string;
  createdAt: string;
}

export interface InviteStat {
  code: string;
  totalInvites: number;
  totalEarned: number;
  invites: { username: string; joinedAt: string; earned: number }[];
}

export interface AdminStats {
  totalUsers: number;
  totalGames: number;
  totalWagered: number;
  totalTaxCollected: number;
  activeDeposits: number;
  activeWithdrawals: number;
  minecraftOnline: boolean;
}
