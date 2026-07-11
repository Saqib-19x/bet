import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const client = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 15000,
  // Skip ngrok's free-tier browser-warning HTML interstitial. Harmless on
  // non-ngrok hosts; required when API_URL points at *.ngrok-free.dev.
  headers: { 'ngrok-skip-browser-warning': 'true' },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

const unwrap = (p) => p.then((r) => r.data).catch((e) => {
  const msg = e.response?.data?.error || e.message || 'Request failed';
  throw new Error(msg);
});

export const auth = {
  register: (data) => unwrap(client.post('/auth/register', data)),
  login: (data) => unwrap(client.post('/auth/login', data)),
  me: () => unwrap(client.get('/auth/me')),
  updateProfile: (data) => unwrap(client.put('/auth/profile', data)),
  changePassword: (data) => unwrap(client.put('/auth/change-password', data)),
};

export const matches = {
  list: (params) => unwrap(client.get('/matches', { params })),
  live: (params) => unwrap(client.get('/matches/live', { params })),
  upcoming: (params) => unwrap(client.get('/matches/upcoming', { params })),
  detail: (id) => unwrap(client.get(`/matches/${id}`)),
  markets: (id) => unwrap(client.get(`/matches/${id}/markets`)),
  stats: (id) => unwrap(client.get(`/matches/${id}/stats`)),
};

export const bets = {
  place: (data) => unwrap(client.post('/bets', data)),
  list: (params) => unwrap(client.get('/bets', { params })),
  detail: (id) => unwrap(client.get(`/bets/${id}`)),
  cashoutQuote: (id) => unwrap(client.get(`/bets/${id}/cashout-quote`)),
  cashout: (id, acceptedAmount) => unwrap(client.post(`/bets/${id}/cashout`, { acceptedAmount })),
};

export const wallet = {
  balance: () => unwrap(client.get('/wallet/balance')),
  deposit: (data) => unwrap(client.post('/wallet/deposit', data)),
  withdraw: (data) => unwrap(client.post('/wallet/withdraw', data)),
  transactions: (params) => unwrap(client.get('/wallet/transactions', { params })),
};

export const admin = {
  stats: () => unwrap(client.get('/admin/stats')),
  risk: () => unwrap(client.get('/admin/risk')),
  quickRecharge: (data) => unwrap(client.post('/admin/quick-recharge', data)),
  // Matches
  createMatch: (data) => unwrap(client.post('/admin/matches', data)),
  deleteManualMatches: () => unwrap(client.delete('/admin/matches/manual')),
  updateMatch: (id, data) => unwrap(client.put(`/admin/matches/${id}`, data)),
  updateScore: (id, data) => unwrap(client.put(`/admin/matches/${id}/score`, data)),
  declareResult: (id, data) => unwrap(client.put(`/admin/matches/${id}/result`, data)),
  setMatchStream: (id, data) => unwrap(client.put(`/admin/matches/${id}/stream`, data)),
  refreshSquad: (id) => unwrap(client.post(`/admin/matches/${id}/refresh-squad`)),
  postCommentary: (id, text, type = 'admin') => unwrap(client.post(`/admin/matches/${id}/commentary`, { text, type })),
  deleteMatch: (id) => unwrap(client.delete(`/admin/matches/${id}`)),
  // Markets
  marketTemplates: (sport) => unwrap(client.get('/admin/market-templates', { params: { sport } })),
  createMarket: (matchId, data) => unwrap(client.post(`/admin/matches/${matchId}/markets`, data)),
  updateMarket: (id, data) => unwrap(client.put(`/admin/markets/${id}`, data)),
  settleMarket: (id, data) => unwrap(client.put(`/admin/markets/${id}/settle`, data)),
  toggleSuspend: (id) => unwrap(client.put(`/admin/markets/${id}/suspend`)),
  deleteMarket: (id) => unwrap(client.delete(`/admin/markets/${id}`)),
  marketExposure: (id) => unwrap(client.get(`/admin/markets/${id}/exposure`)),
  // Users
  users: (params) => unwrap(client.get('/admin/users', { params })),
  createUser: (data) => unwrap(client.post('/admin/users', data)),
  updateUserStatus: (id, status) => unwrap(client.put(`/admin/users/${id}/status`, { status })),
  adjustBalance: (id, data) => unwrap(client.put(`/admin/users/${id}/balance`, data)),
  // Bets
  bets: (params) => unwrap(client.get('/admin/bets', { params })),
  settleBet: (id, status) => unwrap(client.put(`/admin/bets/${id}/settle`, { status })),
  // Transactions
  transactions: (params) => unwrap(client.get('/admin/transactions', { params })),
  approveTransaction: (id, action) => unwrap(client.put(`/admin/transactions/${id}/approve`, { action })),
  // Scraper
  fetchScraper: () => unwrap(client.post('/admin/scraper/fetch')),
  scraperStatus: () => unwrap(client.get('/admin/scraper/status')),
  toggleScraper: (enabled) => unwrap(client.put('/admin/scraper/toggle', { enabled })),
  // Bookmaker odds
  refreshBookmakerOdds: () => unwrap(client.post('/admin/odds/refresh')),
};

export { API_URL };
export default client;
