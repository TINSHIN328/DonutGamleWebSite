import { User, Wallet, Transaction, GameSession, GameResult, GameType, GameHistory, MinecraftBotStatus, BigWin, InviteStat, AdminStats } from '../types';

// Provably fair system
function generateSeed(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

async function hashSeed(seed: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(seed);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateNonce(): number {
  return Math.floor(Math.random() * 1000000);
}

// Game result generation (server-side simulation)
function generateCrashPoint(serverSeed: string, clientSeed: string, nonce: number): number {
  const combined = `${serverSeed}:${clientSeed}:${nonce}`;
  const hash = simpleHash(combined);
  const e = 2 ** 32;
  const h = hash % e;
  if (h % 33 === 0) return 1.0;
  return Math.max(1.0, Math.floor((100 * e - h) / (e - h)) / 100);
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function randomFloat(seed: string): number {
  const hash = simpleHash(seed);
  return (hash % 10000) / 10000;
}

// Tax calculation - 15% on profit only
function calculateTax(profit: number): number {
  if (profit <= 0) return 0;
  return Math.floor(profit * 0.15);
}

// State management
let currentUser: User | null = null;
let currentWallet: Wallet = {
  balance: 5000000,
  totalDeposited: 10000000,
  totalWithdrawn: 2000000,
  totalWagered: 15000000,
  totalWon: 18000000,
  totalLost: 12000000,
  profit: 6000000,
  rakebackAvailable: 45000,
  rakebackRate: 0.003,
};

let transactions: Transaction[] = [];
let gameHistory: GameHistory[] = [];
let activeGameSession: GameSession | null = null;
let bigWins: BigWin[] = [];

const BIG_WIN_THRESHOLD = 100000000;
const GAME_TAX_RATE = 0.15;

// Initialize with some data
function initData() {
  transactions = [
    { id: 'tx_001', type: 'deposit', amount: 5000000, before: 0, after: 5000000, status: 'completed', description: 'Minecraft deposit from Sv2Fox041', createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 'tx_002', type: 'game_bet', amount: -500000, before: 5000000, after: 4500000, status: 'completed', description: 'Coinflip bet', gameId: 'game_001', createdAt: new Date(Date.now() - 72000000).toISOString() },
    { id: 'tx_003', type: 'game_win', amount: 925000, before: 4500000, after: 5425000, status: 'completed', description: 'Coinflip win (15% tax on profit)', gameId: 'game_001', createdAt: new Date(Date.now() - 72000000).toISOString() },
    { id: 'tx_004', type: 'game_bet', amount: -1000000, before: 5425000, after: 4425000, status: 'completed', description: 'Mines bet', gameId: 'game_002', createdAt: new Date(Date.now() - 36000000).toISOString() },
    { id: 'tx_005', type: 'game_win', amount: 2550000, before: 4425000, after: 6975000, status: 'completed', description: 'Mines win (15% tax on profit)', gameId: 'game_002', createdAt: new Date(Date.now() - 36000000).toISOString() },
    { id: 'tx_006', type: 'withdrawal', amount: -975000, before: 6975000, after: 6000000, status: 'completed', description: 'Withdrawal to Sv2Fox041', createdAt: new Date(Date.now() - 18000000).toISOString() },
  ];

  gameHistory = [
    { id: 'gh_001', game: 'coinflip', bet: 500000, won: true, grossPayout: 1000000, profit: 500000, tax: 75000, netProfit: 425000, finalBalance: 5425000, gameId: 'game_001', createdAt: new Date(Date.now() - 72000000).toISOString() },
    { id: 'gh_002', game: 'mines', bet: 1000000, won: true, grossPayout: 3000000, profit: 2000000, tax: 300000, netProfit: 1700000, finalBalance: 6975000, gameId: 'game_002', createdAt: new Date(Date.now() - 36000000).toISOString() },
    { id: 'gh_003', game: 'blackjack', bet: 250000, won: false, grossPayout: 0, profit: -250000, tax: 0, netProfit: -250000, finalBalance: 6725000, gameId: 'game_003', createdAt: new Date(Date.now() - 28000000).toISOString() },
    { id: 'gh_004', game: 'roulette', bet: 100000, won: true, grossPayout: 3600000, profit: 3500000, tax: 525000, netProfit: 2975000, finalBalance: 9700000, gameId: 'game_004', createdAt: new Date(Date.now() - 20000000).toISOString() },
    { id: 'gh_005', game: 'slots', bet: 50000, won: false, grossPayout: 0, profit: -50000, tax: 0, netProfit: -50000, finalBalance: 9650000, gameId: 'game_005', createdAt: new Date(Date.now() - 15000000).toISOString() },
    { id: 'gh_006', game: 'chicken', bet: 200000, won: true, grossPayout: 768000, profit: 568000, tax: 85200, netProfit: 482800, finalBalance: 10132800, gameId: 'game_006', createdAt: new Date(Date.now() - 10000000).toISOString() },
  ];

  bigWins = [
    { id: 'bw_001', username: 'Sv2Fox041', game: 'roulette', bet: 100000, grossProfit: 3500000, tax: 525000, netProfit: 2975000, gameId: 'game_004', createdAt: new Date(Date.now() - 20000000).toISOString() },
  ];
}

initData();

// Mock API
export const api = {
  // Auth
  async login(): Promise<User> {
    currentUser = {
      id: 'user_001',
      discordId: '123456789012345678',
      discordUsername: 'Sv2Fox041',
      discordAvatar: '',
      minecraftUsername: 'Sv2Fox041',
      minecraftUuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      minecraftOnline: true,
      isAdmin: true,
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      referralCode: 'SV2FOX',
      referredBy: null,
    };
    return currentUser;
  },

  async logout(): Promise<void> {
    currentUser = null;
  },

  async getUser(): Promise<User | null> {
    return currentUser;
  },

  // Wallet
  async getWallet(): Promise<Wallet> {
    return { ...currentWallet };
  },

  async getTransactions(): Promise<Transaction[]> {
    return [...transactions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  // Games
  async getGameHistory(filters?: { game?: GameType; result?: 'win' | 'loss' }): Promise<GameHistory[]> {
    let result = [...gameHistory];
    if (filters?.game) result = result.filter(g => g.game === filters.game);
    if (filters?.result === 'win') result = result.filter(g => g.won);
    if (filters?.result === 'loss') result = result.filter(g => !g.won);
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getActiveGame(): Promise<GameSession | null> {
    return activeGameSession;
  },

  async getBigWins(): Promise<BigWin[]> {
    return bigWins;
  },

  // Deposit
  async requestDeposit(amount: number): Promise<{ sessionId: string; instructions: string }> {
    return {
      sessionId: `dep_${Date.now()}`,
      instructions: `Send exactly $${amount.toLocaleString()} to ZpSniper in Minecraft using /pay ZpSniper ${amount}. The payment will be detected automatically.`,
    };
  },

  // Withdrawal
  async requestWithdrawal(amount: number): Promise<{ withdrawalId: string; netAmount: number; tax: number }> {
    const tax = Math.floor(amount * 0.025);
    const netAmount = amount - tax;
    if (amount > currentWallet.balance) throw new Error('INSUFFICIENT_BALANCE');
    currentWallet.balance -= amount;
    currentWallet.totalWithdrawn += amount;
    transactions.push({
      id: `tx_${Date.now()}`,
      type: 'withdrawal',
      amount: -amount,
      before: currentWallet.balance + amount,
      after: currentWallet.balance,
      status: 'processing',
      description: `Withdrawal to Sv2Fox041`,
      createdAt: new Date().toISOString(),
    });
    return { withdrawalId: `wd_${Date.now()}`, netAmount, tax };
  },

  // Rakeback
  async claimRakeback(): Promise<number> {
    const amount = currentWallet.rakebackAvailable;
    currentWallet.balance += amount;
    currentWallet.rakebackAvailable = 0;
    transactions.push({
      id: `tx_${Date.now()}`,
      type: 'rakeback',
      amount,
      before: currentWallet.balance - amount,
      after: currentWallet.balance,
      status: 'completed',
      description: 'Rakeback claimed',
      createdAt: new Date().toISOString(),
    });
    return amount;
  },

  // Invites
  async getInvites(): Promise<InviteStat> {
    return {
      code: currentUser?.referralCode || 'SV2FOX',
      totalInvites: 3,
      totalEarned: 150000,
      invites: [
        { username: 'Player123', joinedAt: new Date(Date.now() - 20 * 86400000).toISOString(), earned: 50000 },
        { username: 'MineGamer', joinedAt: new Date(Date.now() - 15 * 86400000).toISOString(), earned: 50000 },
        { username: 'DiamondKing', joinedAt: new Date(Date.now() - 5 * 86400000).toISOString(), earned: 50000 },
      ],
    };
  },

  // Minecraft status
  async getMinecraftStatus(): Promise<MinecraftBotStatus> {
    return {
      online: true,
      username: 'ZpSniper',
      server: 'play.donutsmp.net',
      ping: 42,
      lastConnected: new Date(Date.now() - 3600000).toISOString(),
      lastDisconnected: null,
      reconnectCount: 0,
    };
  },

  // Admin
  async getAdminStats(): Promise<AdminStats> {
    return {
      totalUsers: 1247,
      totalGames: 45892,
      totalWagered: 892000000,
      totalTaxCollected: 67000000,
      activeDeposits: 3,
      activeWithdrawals: 1,
      minecraftOnline: true,
    };
  },

  // Game Engine - Centralized
  async startGame(game: GameType, bet: number, gameData?: Record<string, unknown>): Promise<GameSession> {
    if (bet > currentWallet.balance) throw new Error('INSUFFICIENT_BALANCE');
    if (activeGameSession) throw new Error('ACTIVE_SESSION');
    if (bet <= 0) throw new Error('INVALID_BET');

    const serverSeed = generateSeed();
    const serverSeedHash = await hashSeed(serverSeed);
    const clientSeed = generateSeed().substring(0, 16);
    const nonce = generateNonce();

    // Reserve bet
    currentWallet.balance -= bet;
    currentWallet.totalWagered += bet;

    const session: GameSession = {
      id: `game_${Date.now()}`,
      game,
      bet,
      status: 'active',
      serverSeedHash,
      serverSeed,
      clientSeed,
      nonce,
      createdAt: new Date().toISOString(),
    };

    activeGameSession = { ...session, ...gameData } as GameSession;

    transactions.push({
      id: `tx_${Date.now()}`,
      type: 'game_bet',
      amount: -bet,
      before: currentWallet.balance + bet,
      after: currentWallet.balance,
      status: 'completed',
      description: `${game} bet`,
      gameId: session.id,
      createdAt: new Date().toISOString(),
    });

    return session;
  },

  async completeGame(sessionId: string, won: boolean, grossPayout: number, details: Record<string, unknown> = {}): Promise<GameResult> {
    if (!activeGameSession || activeGameSession.id !== sessionId) throw new Error('NOT_YOUR_SESSION');

    const profit = won ? grossPayout - activeGameSession.bet : -activeGameSession.bet;
    const tax = calculateTax(profit);
    const netProfit = profit - tax;
    const finalPayout = won ? grossPayout - tax : 0;

    currentWallet.balance += finalPayout;
    if (won) {
      currentWallet.totalWon += grossPayout;
      currentWallet.rakebackAvailable += Math.floor(activeGameSession.bet * currentWallet.rakebackRate);
    } else {
      currentWallet.totalLost += activeGameSession.bet;
    }

    const result: GameResult = {
      won,
      grossPayout: won ? grossPayout : 0,
      profit,
      tax,
      netProfit,
      finalBalance: currentWallet.balance,
      details,
    };

    gameHistory.push({
      id: `gh_${Date.now()}`,
      game: activeGameSession.game,
      bet: activeGameSession.bet,
      won,
      grossPayout: result.grossPayout,
      profit,
      tax,
      netProfit,
      finalBalance: currentWallet.balance,
      gameId: sessionId,
      createdAt: new Date().toISOString(),
    });

    transactions.push({
      id: `tx_${Date.now()}_win`,
      type: 'game_win',
      amount: finalPayout,
      before: currentWallet.balance - finalPayout,
      after: currentWallet.balance,
      status: 'completed',
      description: `${activeGameSession.game} ${won ? 'win' : 'loss'}`,
      gameId: sessionId,
      createdAt: new Date().toISOString(),
    });

    // Check big win
    if (profit >= BIG_WIN_THRESHOLD) {
      bigWins.push({
        id: `bw_${Date.now()}`,
        username: currentUser?.discordUsername || 'Unknown',
        game: activeGameSession.game,
        bet: activeGameSession.bet,
        grossProfit: profit,
        tax,
        netProfit,
        gameId: sessionId,
        createdAt: new Date().toISOString(),
      });
    }

    activeGameSession = null;
    return result;
  },

  // Specific game logic
  async playCoinflip(bet: number, choice: 'heads' | 'tails'): Promise<{ session: GameSession; result: GameResult }> {
    const session = await this.startGame('coinflip', bet, { choice });
    const coinSeed = `${session.serverSeed}:${session.clientSeed}:${session.nonce}`;
    const result = randomFloat(coinSeed) < 0.5 ? 'heads' : 'tails';
    const won = result === choice;
    const grossPayout = won ? bet * 2 : 0;
    const gameResult = await this.completeGame(session.id, won, grossPayout, { result, choice });
    return { session, result: gameResult };
  },

  async playLimbo(bet: number, targetMultiplier: number): Promise<{ session: GameSession; result: GameResult }> {
    const session = await this.startGame('limbo', bet, { targetMultiplier });
    const crashPoint = generateCrashPoint(session.serverSeed!, session.clientSeed!, session.nonce);
    const won = crashPoint >= targetMultiplier;
    const grossPayout = won ? Math.floor(bet * targetMultiplier) : 0;
    const gameResult = await this.completeGame(session.id, won, grossPayout, { crashPoint, targetMultiplier });
    return { session, result: gameResult };
  },

  async playDice(bet: number, target: number, direction: 'higher' | 'lower'): Promise<{ session: GameSession; result: GameResult }> {
    const session = await this.startGame('dice', bet, { target, direction });
    const diceSeed = `${session.serverSeed}:${session.clientSeed}:${session.nonce}`;
    const roll = Math.floor(randomFloat(diceSeed) * 100) + 1;
    const won = direction === 'higher' ? roll > target : roll < target;
    const multiplier = direction === 'higher' ? 100 / (100 - target) : 100 / target;
    const grossPayout = won ? Math.floor(bet * multiplier * 0.97) : 0;
    const gameResult = await this.completeGame(session.id, won, grossPayout, { roll, target, direction });
    return { session, result: gameResult };
  },

  async playRoulette(bet: number, betType: string, value?: number): Promise<{ session: GameSession; result: GameResult }> {
    const session = await this.startGame('roulette', bet, { betType, value });
    const rouletteSeed = `${session.serverSeed}:${session.clientSeed}:${session.nonce}`;
    const number = Math.floor(randomFloat(rouletteSeed) * 37);
    const reds = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
    const isRed = reds.includes(number);
    const isBlack = number !== 0 && !isRed;
    const isGreen = number === 0;

    let won = false;
    let multiplier = 0;

    if (betType === 'red' && isRed) { won = true; multiplier = 2; }
    else if (betType === 'black' && isBlack) { won = true; multiplier = 2; }
    else if (betType === 'green' && isGreen) { won = true; multiplier = 36; }
    else if (betType === 'number' && value === number) { won = true; multiplier = 36; }
    else if (betType === 'odd' && number % 2 === 1 && number !== 0) { won = true; multiplier = 2; }
    else if (betType === 'even' && number % 2 === 0 && number !== 0) { won = true; multiplier = 2; }

    const grossPayout = won ? Math.floor(bet * multiplier) : 0;
    const gameResult = await this.completeGame(session.id, won, grossPayout, { number, isRed, isBlack, isGreen, betType });
    return { session, result: gameResult };
  },

  async playSlots(bet: number): Promise<{ session: GameSession; result: GameResult }> {
    const session = await this.startGame('slots', bet);
    const slotsSeed = `${session.serverSeed}:${session.clientSeed}:${session.nonce}`;
    const symbols = ['🍒', '🍋', '🍊', '🍇', '💎', '7️⃣', '🔔', '⭐'];
    const reels = [
      symbols[Math.floor(randomFloat(slotsSeed + '1') * symbols.length)],
      symbols[Math.floor(randomFloat(slotsSeed + '2') * symbols.length)],
      symbols[Math.floor(randomFloat(slotsSeed + '3') * symbols.length)],
    ];

    let multiplier = 0;
    if (reels[0] === reels[1] && reels[1] === reels[2]) {
      if (reels[0] === '7️⃣') multiplier = 50;
      else if (reels[0] === '💎') multiplier = 25;
      else multiplier = 10;
    } else if (reels[0] === reels[1] || reels[1] === reels[2]) {
      multiplier = 2;
    }

    const won = multiplier > 0;
    const grossPayout = won ? Math.floor(bet * multiplier) : 0;
    const gameResult = await this.completeGame(session.id, won, grossPayout, { reels, multiplier });
    return { session, result: gameResult };
  },

  // Chicken game - server authoritative
  async startChicken(bet: number, rows: number = 8): Promise<GameSession & { serverSeedHash: string }> {
    const session = await this.startGame('chicken', bet, { rows, currentRow: 0, safeColumns: [] as number[], multiplier: 1.0, cashedOut: false });
    // Generate safe column for each row
    const safeColumns: number[] = [];
    for (let i = 0; i < rows; i++) {
      safeColumns.push(Math.floor(randomFloat(`${session.serverSeed}:${i}`) * 5));
    }
    (activeGameSession as any).safeColumns = safeColumns;
    (activeGameSession as any).currentRow = 0;
    (activeGameSession as any).multiplier = 1.0;
    (activeGameSession as any).cashedOut = false;
    return { ...session, serverSeedHash: session.serverSeedHash };
  },

  async chickenPick(sessionId: string, column: number): Promise<{ survived: boolean; multiplier: number; gameResult?: GameResult }> {
    if (!activeGameSession || activeGameSession.id !== sessionId) throw new Error('NOT_YOUR_SESSION');
    const session = activeGameSession as any;
    if (session.cashedOut) throw new Error('SESSION_EXPIRED');

    const safeColumn = session.safeColumns[session.currentRow];
    const survived = column === safeColumn;

    if (!survived) {
      const result = await this.completeGame(sessionId, false, 0, { row: session.currentRow, column, safeColumn });
      return { survived: false, multiplier: session.multiplier, gameResult: result };
    }

    session.currentRow++;
    session.multiplier = Math.round((1.0 * Math.pow(1.4, session.currentRow)) * 100) / 100;

    if (session.currentRow >= session.rows) {
      // Completed all rows
      const grossPayout = Math.floor(session.bet * session.multiplier);
      const result = await this.completeGame(sessionId, true, grossPayout, { completed: true, multiplier: session.multiplier });
      return { survived: true, multiplier: session.multiplier, gameResult: result };
    }

    return { survived: true, multiplier: session.multiplier };
  },

  async chickenCashout(sessionId: string): Promise<GameResult> {
    if (!activeGameSession || activeGameSession.id !== sessionId) throw new Error('NOT_YOUR_SESSION');
    const session = activeGameSession as any;
    if (session.currentRow === 0) throw new Error('INVALID_BET');
    const grossPayout = Math.floor(session.bet * session.multiplier);
    return this.completeGame(sessionId, true, grossPayout, { cashedOut: true, multiplier: session.multiplier, row: session.currentRow });
  },

  // Mines game
  async startMines(bet: number, mineCount: number = 5): Promise<GameSession> {
    const session = await this.startGame('mines', bet, { mineCount, revealed: [] as number[], minePositions: [] as number[], cashedOut: false });
    const positions: number[] = [];
    while (positions.length < mineCount) {
      const pos = Math.floor(randomFloat(`${session.serverSeed}:mine:${positions.length}`) * 25);
      if (!positions.includes(pos)) positions.push(pos);
    }
    (activeGameSession as any).minePositions = positions;
    (activeGameSession as any).revealed = [];
    (activeGameSession as any).cashedOut = false;
    return session;
  },

  async minesReveal(sessionId: string, cell: number): Promise<{ safe: boolean; multiplier: number; gameResult?: GameResult }> {
    if (!activeGameSession || activeGameSession.id !== sessionId) throw new Error('NOT_YOUR_SESSION');
    const session = activeGameSession as any;
    if (session.cashedOut) throw new Error('SESSION_EXPIRED');
    if (session.revealed.includes(cell)) throw new Error('INVALID_BET');

    const isMine = session.minePositions.includes(cell);
    session.revealed.push(cell);

    if (isMine) {
      const result = await this.completeGame(sessionId, false, 0, { revealed: session.revealed, minePositions: session.minePositions });
      return { safe: false, multiplier: 1, gameResult: result };
    }

    const safeTiles = 25 - session.mineCount;
    const revealed = session.revealed.length;
    const multiplier = Math.round(calculateMinesMultiplier(revealed, session.mineCount) * 100) / 100;

    if (revealed >= safeTiles) {
      const grossPayout = Math.floor(session.bet * multiplier);
      const result = await this.completeGame(sessionId, true, grossPayout, { revealed: session.revealed, multiplier });
      return { safe: true, multiplier, gameResult: result };
    }

    return { safe: true, multiplier };
  },

  async minesCashout(sessionId: string): Promise<GameResult> {
    if (!activeGameSession || activeGameSession.id !== sessionId) throw new Error('NOT_YOUR_SESSION');
    const session = activeGameSession as any;
    if (session.revealed.length === 0) throw new Error('INVALID_BET');
    const multiplier = calculateMinesMultiplier(session.revealed.length, session.mineCount);
    const grossPayout = Math.floor(session.bet * multiplier);
    return this.completeGame(sessionId, true, grossPayout, { cashedOut: true, multiplier, revealed: session.revealed });
  },

  // Tower game
  async startTower(bet: number, floors: number = 8): Promise<GameSession> {
    const session = await this.startGame('tower', bet, { floors, currentFloor: 0, safePositions: [] as number[], cashedOut: false });
    const safePositions: number[] = [];
    for (let i = 0; i < floors; i++) {
      safePositions.push(Math.floor(randomFloat(`${session.serverSeed}:tower:${i}`) * 4));
    }
    (activeGameSession as any).safePositions = safePositions;
    (activeGameSession as any).currentFloor = 0;
    (activeGameSession as any).cashedOut = false;
    return session;
  },

  async towerPick(sessionId: string, position: number): Promise<{ safe: boolean; multiplier: number; gameResult?: GameResult }> {
    if (!activeGameSession || activeGameSession.id !== sessionId) throw new Error('NOT_YOUR_SESSION');
    const session = activeGameSession as any;
    if (session.cashedOut) throw new Error('SESSION_EXPIRED');

    const safePos = session.safePositions[session.currentFloor];
    const isSafe = position === safePos;

    if (!isSafe) {
      const result = await this.completeGame(sessionId, false, 0, { floor: session.currentFloor, position, safePosition: safePos });
      return { safe: false, multiplier: 1, gameResult: result };
    }

    session.currentFloor++;
    const multiplier = Math.round(Math.pow(1.5, session.currentFloor) * 100) / 100;

    if (session.currentFloor >= session.floors) {
      const grossPayout = Math.floor(session.bet * multiplier);
      const result = await this.completeGame(sessionId, true, grossPayout, { completed: true, multiplier });
      return { safe: true, multiplier, gameResult: result };
    }

    return { safe: true, multiplier };
  },

  async towerCashout(sessionId: string): Promise<GameResult> {
    if (!activeGameSession || activeGameSession.id !== sessionId) throw new Error('NOT_YOUR_SESSION');
    const session = activeGameSession as any;
    if (session.currentFloor === 0) throw new Error('INVALID_BET');
    const multiplier = Math.round(Math.pow(1.5, session.currentFloor) * 100) / 100;
    const grossPayout = Math.floor(session.bet * multiplier);
    return this.completeGame(sessionId, true, grossPayout, { cashedOut: true, multiplier, floor: session.currentFloor });
  },

  // Blackjack
  async startBlackjack(bet: number): Promise<GameSession & { playerCards: string[]; dealerCards: string[]; dealerHidden: string }> {
    const session = await this.startGame('blackjack', bet, { deck: [], playerHand: [] as string[], dealerHand: [] as string[], dealerHidden: '', doubledDown: false, stood: false });
    const deck = createDeck(session.serverSeed!);
    const playerHand = [deck.pop() as string, deck.pop() as string];
    const dealerHand = [deck.pop() as string, deck.pop() as string];
    const dealerHidden = dealerHand[1];

    (activeGameSession as any).deck = deck;
    (activeGameSession as any).playerHand = playerHand;
    (activeGameSession as any).dealerHand = [dealerHand[0]];
    (activeGameSession as any).dealerHidden = dealerHidden;

    // Check for natural blackjack
    const playerBJ = isBlackjack(playerHand);
    if (playerBJ) {
      const grossPayout = Math.floor(bet * 2.5);
      const result = await this.completeGame(session.id, true, grossPayout, { playerHand, dealerHand, dealerHidden, natural: true });
      return { ...session, playerCards: playerHand, dealerCards: dealerHand, dealerHidden, result } as any;
    }

    return { ...session, playerCards: playerHand, dealerCards: [dealerHand[0]], dealerHidden };
  },

  async blackjackHit(sessionId: string): Promise<{ playerCards: string[]; dealerCards: string[]; bust: boolean; gameResult?: GameResult }> {
    if (!activeGameSession || activeGameSession.id !== sessionId) throw new Error('NOT_YOUR_SESSION');
    const session = activeGameSession as any;
    const card = session.deck.pop()!;
    session.playerHand.push(card);

    const playerValue = handValue(session.playerHand);
    if (playerValue > 21) {
      const result = await this.completeGame(sessionId, false, 0, { playerHand: session.playerHand, dealerHand: [...session.dealerHand, session.dealerHidden], bust: true });
      return { playerCards: session.playerHand, dealerCards: [...session.dealerHand, session.dealerHidden], bust: true, gameResult: result };
    }

    return { playerCards: session.playerHand, dealerCards: session.dealerHand, bust: false };
  },

  async blackjackStand(sessionId: string): Promise<GameResult> {
    if (!activeGameSession || activeGameSession.id !== sessionId) throw new Error('NOT_YOUR_SESSION');
    const session = activeGameSession as any;

    // Dealer plays
    session.dealerHand.push(session.dealerHidden);
    while (handValue(session.dealerHand) < 17) {
      session.dealerHand.push(session.deck.pop()!);
    }

    const playerValue = handValue(session.playerHand);
    const dealerValue = handValue(session.dealerHand);
    const dealerBust = dealerValue > 21;
    const won = dealerBust || playerValue > dealerValue;
    const push = playerValue === dealerValue && !dealerBust;

    if (push) {
      // Return bet
      const result = await this.completeGame(sessionId, true, session.bet, { playerHand: session.playerHand, dealerHand: session.dealerHand, push: true });
      return result;
    }

    const grossPayout = won ? session.bet * 2 : 0;
    return this.completeGame(sessionId, won, grossPayout, { playerHand: session.playerHand, dealerHand: session.dealerHand, playerValue, dealerValue });
  },

  async blackjackDouble(sessionId: string): Promise<GameResult> {
    if (!activeGameSession || activeGameSession.id !== sessionId) throw new Error('NOT_YOUR_SESSION');
    const session = activeGameSession as any;

    // Double the bet
    if (session.bet > currentWallet.balance) throw new Error('INSUFFICIENT_BALANCE');
    currentWallet.balance -= session.bet;
    session.bet *= 2;

    const card = session.deck.pop()!;
    session.playerHand.push(card);

    const playerValue = handValue(session.playerHand);
    if (playerValue > 21) {
      const result = await this.completeGame(sessionId, false, 0, { playerHand: session.playerHand, dealerHand: [...session.dealerHand, session.dealerHidden], doubled: true, bust: true });
      return result;
    }

    // Dealer plays
    session.dealerHand.push(session.dealerHidden);
    while (handValue(session.dealerHand) < 17) {
      session.dealerHand.push(session.deck.pop()!);
    }

    const dealerValue = handValue(session.dealerHand);
    const dealerBust = dealerValue > 21;
    const won = dealerBust || playerValue > dealerValue;
    const push = playerValue === dealerValue && !dealerBust;

    if (push) {
      const result = await this.completeGame(sessionId, true, session.bet, { playerHand: session.playerHand, dealerHand: session.dealerHand, push: true, doubled: true });
      return result;
    }

    const grossPayout = won ? session.bet * 2 : 0;
    return this.completeGame(sessionId, won, grossPayout, { playerHand: session.playerHand, dealerHand: session.dealerHand, playerValue, dealerValue, doubled: true });
  },

  // Keno
  async playKeno(bet: number, selectedNumbers: number[]): Promise<{ session: GameSession; result: GameResult }> {
    const session = await this.startGame('keno', bet, { selectedNumbers });
    const kenoSeed = `${session.serverSeed}:${session.clientSeed}:${session.nonce}`;
    const winningNumbers: number[] = [];
    while (winningNumbers.length < 10) {
      const num = Math.floor(randomFloat(`${kenoSeed}:${winningNumbers.length}`) * 40) + 1;
      if (!winningNumbers.includes(num)) winningNumbers.push(num);
    }

    const matches = selectedNumbers.filter(n => winningNumbers.includes(n)).length;
    const kenoMultipliers: Record<number, number> = { 0: 0, 1: 0, 2: 1, 3: 2, 4: 5, 5: 10, 6: 25, 7: 100, 8: 500, 9: 1000, 10: 5000 };
    const multiplier = kenoMultipliers[matches] || 0;
    const won = multiplier > 0;
    const grossPayout = won ? Math.floor(bet * multiplier) : 0;
    const gameResult = await this.completeGame(session.id, won, grossPayout, { selectedNumbers, winningNumbers, matches, multiplier });
    return { session, result: gameResult };
  },
};

// Helper functions
function calculateMinesMultiplier(revealed: number, mines: number): number {
  let multiplier = 1;
  const totalTiles = 25;
  for (let i = 0; i < revealed; i++) {
    multiplier *= (totalTiles - mines - i) > 0 ? (totalTiles - i) / (totalTiles - mines - i) : 1;
  }
  return multiplier * 0.97; // House edge
}

function createDeck(seed: string): string[] {
  const suits = ['♠', '♥', '♦', '♣'];
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const deck: string[] = [];
  for (const suit of suits) {
    for (const value of values) {
      deck.push(`${value}${suit}`);
    }
  }
  // Shuffle using seed
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(randomFloat(`${seed}:shuffle:${i}`) * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function handValue(hand: string[]): number {
  let value = 0;
  let aces = 0;
  for (const card of hand) {
    const v = card.replace(/[♠♥♦♣]/g, '');
    if (v === 'A') { aces++; value += 11; }
    else if (['K', 'Q', 'J'].includes(v)) value += 10;
    else value += parseInt(v);
  }
  while (value > 21 && aces > 0) { value -= 10; aces--; }
  return value;
}

function isBlackjack(hand: string[]): boolean {
  return hand.length === 2 && handValue(hand) === 21;
}

export { hashSeed, calculateTax, GAME_TAX_RATE };
