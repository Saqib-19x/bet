import puppeteer from 'puppeteer-core';
import fs from 'fs';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const APP = 'http://localhost:5173';
const API = 'https://anja-nonfragile-jaycee.ngrok-free.dev';
const OUT = './screenshots';

const H = { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' };

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT);

// 1. Get a fresh admin token + pick a match to show the exchange UI
const login = await fetch(`${API}/api/auth/login`, {
  method: 'POST', headers: H,
  body: JSON.stringify({ email: 'admin@betking.com', password: 'admin123' }),
}).then((r) => r.json());
const token = login.token;
const user = login.user;
console.log('logged in as', user.email);

let matchId = null;
try {
  const list = await fetch(`${API}/api/matches`, { headers: { 'ngrok-skip-browser-warning': 'true', Authorization: `Bearer ${token}` } }).then((r) => r.json());
  const arr = Array.isArray(list) ? list : (list.matches || list.data || []);
  matchId = arr[0]?._id || arr[0]?.id || null;
  console.log('match for exchange UI:', matchId, '(of', arr.length, ')');
} catch (e) { console.log('match list failed', e.message); }

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
  args: ['--no-sandbox', '--hide-scrollbars'],
});
const page = await browser.newPage();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function shot(name, path, { wait = 2800, full = false } = {}) {
  try {
    await page.goto(`${APP}${path}`, { waitUntil: 'networkidle2', timeout: 45000 });
    await sleep(wait);
    await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: full });
    console.log('✓', name, '→', path);
  } catch (e) {
    console.log('✗', name, path, e.message);
  }
}

// 2. Capture the public login screen first (no auth)
await page.goto(APP, { waitUntil: 'networkidle2', timeout: 45000 });
await sleep(1500);
await page.screenshot({ path: `${OUT}/login.png` });
console.log('✓ login');

// 3. Inject auth into localStorage, then capture protected routes
await page.evaluate((t, u) => {
  localStorage.setItem('token', t);
  localStorage.setItem('user', JSON.stringify(u));
}, token, user);

const routes = [
  ['home', '/'],
  ['sports', '/sports'],
  ['live', '/live'],
  ['mybets', '/my-bets'],
  ['wallet', '/wallet'],
  ['profile', '/profile'],
  ['admin-dashboard', '/admin'],
  ['admin-risk', '/admin/risk'],
  ['admin-users', '/admin/users'],
  ['admin-bets', '/admin/bets'],
  ['admin-odds', '/admin/odds'],
  ['admin-transactions', '/admin/transactions'],
  ['admin-settings', '/admin/settings'],
];
if (matchId) routes.splice(3, 0, ['match-exchange', `/match/${matchId}`]);

for (const [name, path] of routes) {
  await shot(name, path, { wait: name === 'match-exchange' ? 4000 : 2800 });
}

await browser.close();
console.log('done — screenshots in', OUT);
