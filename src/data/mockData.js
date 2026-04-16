// ===== Mock Data for BetKing =====

export const sports = [
  { id: 'football', name: 'Football', icon: '⚽', count: 142 },
  { id: 'cricket', name: 'Cricket', icon: '🏏', count: 87 },
  { id: 'tennis', name: 'Tennis', icon: '🎾', count: 56 },
  { id: 'basketball', name: 'Basketball', icon: '🏀', count: 43 },
  { id: 'baseball', name: 'Baseball', icon: '⚾', count: 28 },
  { id: 'hockey', name: 'Ice Hockey', icon: '🏒', count: 21 },
  { id: 'mma', name: 'MMA', icon: '🥊', count: 15 },
  { id: 'esports', name: 'Esports', icon: '🎮', count: 34 },
];

export const liveMatches = [
  {
    id: 1, sport: 'football', league: 'Premier League',
    teamA: 'Manchester United', teamB: 'Liverpool',
    scoreA: 2, scoreB: 1, time: "67'", isLive: true,
    odds: { home: 2.10, draw: 3.40, away: 3.75 },
  },
  {
    id: 2, sport: 'football', league: 'La Liga',
    teamA: 'Barcelona', teamB: 'Real Madrid',
    scoreA: 1, scoreB: 1, time: "34'", isLive: true,
    odds: { home: 1.85, draw: 3.60, away: 4.20 },
  },
  {
    id: 3, sport: 'cricket', league: 'IPL 2026',
    teamA: 'Mumbai Indians', teamB: 'Chennai Super Kings',
    scoreA: 186, scoreB: 142, time: '15.3 Ov', isLive: true,
    odds: { home: 1.55, draw: null, away: 2.45 },
  },
  {
    id: 4, sport: 'tennis', league: 'ATP Masters',
    teamA: 'C. Alcaraz', teamB: 'J. Sinner',
    scoreA: 2, scoreB: 1, time: 'Set 4', isLive: true,
    odds: { home: 1.72, draw: null, away: 2.15 },
  },
  {
    id: 5, sport: 'basketball', league: 'NBA',
    teamA: 'LA Lakers', teamB: 'Golden State',
    scoreA: 89, scoreB: 94, time: 'Q3 8:42', isLive: true,
    odds: { home: 2.30, draw: null, away: 1.65 },
  },
];

export const upcomingMatches = [
  {
    id: 101, sport: 'football', league: 'Champions League',
    teamA: 'Bayern Munich', teamB: 'PSG',
    startTime: '2026-04-07T18:00:00Z', isLive: false,
    odds: { home: 1.90, draw: 3.50, away: 4.00 },
  },
  {
    id: 102, sport: 'football', league: 'Serie A',
    teamA: 'AC Milan', teamB: 'Juventus',
    startTime: '2026-04-07T20:00:00Z', isLive: false,
    odds: { home: 2.40, draw: 3.20, away: 3.10 },
  },
  {
    id: 103, sport: 'cricket', league: 'IPL 2026',
    teamA: 'Royal Challengers', teamB: 'Delhi Capitals',
    startTime: '2026-04-08T14:00:00Z', isLive: false,
    odds: { home: 1.75, draw: null, away: 2.10 },
  },
  {
    id: 104, sport: 'tennis', league: 'Roland Garros',
    teamA: 'R. Nadal', teamB: 'N. Djokovic',
    startTime: '2026-04-08T10:00:00Z', isLive: false,
    odds: { home: 2.00, draw: null, away: 1.85 },
  },
  {
    id: 105, sport: 'basketball', league: 'NBA',
    teamA: 'Boston Celtics', teamB: 'Milwaukee Bucks',
    startTime: '2026-04-07T23:30:00Z', isLive: false,
    odds: { home: 1.80, draw: null, away: 2.05 },
  },
  {
    id: 106, sport: 'football', league: 'Bundesliga',
    teamA: 'Borussia Dortmund', teamB: 'RB Leipzig',
    startTime: '2026-04-09T17:30:00Z', isLive: false,
    odds: { home: 2.15, draw: 3.40, away: 3.30 },
  },
];

export const myBets = [
  {
    id: 'BET001', match: 'Man United vs Liverpool', selection: 'Man United Win',
    odds: 2.10, stake: 500, potentialWin: 1050, status: 'open',
    sport: 'football', placedAt: '2026-04-06T10:30:00Z',
  },
  {
    id: 'BET002', match: 'Mumbai Indians vs CSK', selection: 'Mumbai Indians Win',
    odds: 1.55, stake: 1000, potentialWin: 1550, status: 'open',
    sport: 'cricket', placedAt: '2026-04-06T12:15:00Z',
  },
  {
    id: 'BET003', match: 'Barcelona vs Atletico', selection: 'Over 2.5 Goals',
    odds: 1.85, stake: 300, potentialWin: 555, status: 'won',
    sport: 'football', placedAt: '2026-04-05T18:00:00Z',
  },
  {
    id: 'BET004', match: 'Alcaraz vs Djokovic', selection: 'Alcaraz Win',
    odds: 2.20, stake: 750, potentialWin: 1650, status: 'lost',
    sport: 'tennis', placedAt: '2026-04-04T11:00:00Z',
  },
  {
    id: 'BET005', match: 'LA Lakers vs Celtics', selection: 'Lakers +5.5',
    odds: 1.90, stake: 200, potentialWin: 380, status: 'won',
    sport: 'basketball', placedAt: '2026-04-03T22:00:00Z',
  },
];

export const transactions = [
  { id: 'TXN001', type: 'deposit', amount: 5000, method: 'UPI', status: 'completed', date: '2026-04-06T09:00:00Z' },
  { id: 'TXN002', type: 'withdraw', amount: 2000, method: 'Bank Transfer', status: 'pending', date: '2026-04-05T14:00:00Z' },
  { id: 'TXN003', type: 'deposit', amount: 10000, method: 'UPI', status: 'completed', date: '2026-04-04T11:30:00Z' },
  { id: 'TXN004', type: 'bet', amount: 500, method: 'Wallet', status: 'completed', date: '2026-04-06T10:30:00Z' },
  { id: 'TXN005', type: 'win', amount: 555, method: 'Wallet', status: 'completed', date: '2026-04-05T20:00:00Z' },
  { id: 'TXN006', type: 'deposit', amount: 3000, method: 'Card', status: 'completed', date: '2026-04-02T16:00:00Z' },
  { id: 'TXN007', type: 'withdraw', amount: 5000, method: 'UPI', status: 'completed', date: '2026-04-01T12:00:00Z' },
];

export const adminUsers = [
  { id: 1, name: 'Rahul Sharma', email: 'rahul@email.com', balance: 12500, bets: 34, status: 'active', joined: '2026-01-15' },
  { id: 2, name: 'Priya Patel', email: 'priya@email.com', balance: 8200, bets: 21, status: 'active', joined: '2026-02-03' },
  { id: 3, name: 'Amit Kumar', email: 'amit@email.com', balance: 450, bets: 67, status: 'suspended', joined: '2025-11-20' },
  { id: 4, name: 'Sneha Gupta', email: 'sneha@email.com', balance: 23100, bets: 12, status: 'active', joined: '2026-03-10' },
  { id: 5, name: 'Vikram Singh', email: 'vikram@email.com', balance: 0, bets: 5, status: 'blocked', joined: '2026-01-28' },
  { id: 6, name: 'Ananya Reddy', email: 'ananya@email.com', balance: 6700, bets: 45, status: 'active', joined: '2025-12-05' },
  { id: 7, name: 'Karan Mehta', email: 'karan@email.com', balance: 15800, bets: 89, status: 'active', joined: '2025-10-14' },
  { id: 8, name: 'Deepa Nair', email: 'deepa@email.com', balance: 3200, bets: 18, status: 'active', joined: '2026-03-22' },
];

export const adminStats = {
  totalUsers: 12847,
  activeUsers: 3421,
  totalBets: 45892,
  activeBets: 1256,
  totalRevenue: 2845000,
  todayRevenue: 124500,
  totalPayouts: 1950000,
  pendingWithdrawals: 43,
};

export const revenueData = [
  { month: 'Oct', revenue: 180000, payouts: 120000 },
  { month: 'Nov', revenue: 220000, payouts: 150000 },
  { month: 'Dec', revenue: 310000, payouts: 210000 },
  { month: 'Jan', revenue: 280000, payouts: 190000 },
  { month: 'Feb', revenue: 350000, payouts: 230000 },
  { month: 'Mar', revenue: 420000, payouts: 280000 },
  { month: 'Apr', revenue: 124500, payouts: 82000 },
];

export const markets = [
  {
    name: 'Match Result',
    options: [
      { label: 'Man United', odds: 2.10 },
      { label: 'Draw', odds: 3.40 },
      { label: 'Liverpool', odds: 3.75 },
    ],
  },
  {
    name: 'Over/Under 2.5',
    options: [
      { label: 'Over 2.5', odds: 1.85 },
      { label: 'Under 2.5', odds: 1.95 },
    ],
  },
  {
    name: 'Both Teams to Score',
    options: [
      { label: 'Yes', odds: 1.65 },
      { label: 'No', odds: 2.20 },
    ],
  },
  {
    name: 'Correct Score',
    options: [
      { label: '2-1', odds: 8.50 },
      { label: '1-1', odds: 6.00 },
      { label: '2-0', odds: 7.50 },
      { label: '0-1', odds: 9.00 },
      { label: '3-1', odds: 12.00 },
      { label: '2-2', odds: 11.00 },
    ],
  },
  {
    name: 'First Goal Scorer',
    options: [
      { label: 'M. Rashford', odds: 5.50 },
      { label: 'M. Salah', odds: 4.00 },
      { label: 'B. Fernandes', odds: 6.50 },
      { label: 'D. Nunez', odds: 5.00 },
    ],
  },
  {
    name: 'Half Time Result',
    options: [
      { label: 'Man United', odds: 2.80 },
      { label: 'Draw', odds: 2.20 },
      { label: 'Liverpool', odds: 3.50 },
    ],
  },
];
