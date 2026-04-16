import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { useState } from 'react';
import './styles/global.css';
import './styles/components.css';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import BetSlip from './components/BetSlip';
import BottomNav from './components/BottomNav';

import Home from './pages/Home';
import Sports from './pages/Sports';
import MatchDetail from './pages/MatchDetail';
import LiveBetting from './pages/LiveBetting';
import MyBets from './pages/MyBets';
import Wallet from './pages/Wallet';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';

import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import BetManagement from './pages/admin/BetManagement';
import OddsManagement from './pages/admin/OddsManagement';
import Transactions from './pages/admin/Transactions';
import Settings from './pages/admin/Settings';

function AppLayout({ selections, setSelections, betSlipOpen, setBetSlipOpen }) {
  const addSelection = (sel) => {
    setSelections(prev => {
      const exists = prev.find(s => s.id === sel.id);
      if (exists) return prev.filter(s => s.id !== sel.id);
      return [...prev, sel];
    });
    setBetSlipOpen(true);
  };

  return (
    <>
      <Sidebar />
      <Header />
      <main className="main-content" style={{
        marginRight: betSlipOpen ? 'var(--betslip-width)' : 0,
        transition: 'margin-right var(--transition-base)',
      }}>
        <Outlet context={{ onAddSelection: addSelection }} />
      </main>
      <BetSlip
        isOpen={betSlipOpen}
        onClose={() => setBetSlipOpen(false)}
        selections={selections}
        setSelections={setSelections}
      />
      {/* Floating bet slip toggle */}
      {!betSlipOpen && selections.length > 0 && (
        <button
          onClick={() => setBetSlipOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'linear-gradient(135deg, var(--accent-green), #00c853)',
            color: '#000',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            padding: '14px 24px',
            fontSize: 'var(--font-base)',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 20px rgba(0, 230, 118, 0.4)',
            cursor: 'pointer',
            zIndex: 200,
            animation: 'slideUp 0.3s ease',
          }}
        >
          🎫 Bet Slip ({selections.length})
        </button>
      )}
      <BottomNav />
    </>
  );
}

function UserPage({ Component, addSelection }) {
  return <Component onAddSelection={addSelection} />;
}

export default function App() {
  const [selections, setSelections] = useState([]);
  const [betSlipOpen, setBetSlipOpen] = useState(false);

  const addSelection = (sel) => {
    setSelections(prev => {
      const exists = prev.find(s => s.id === sel.id);
      if (exists) return prev.filter(s => s.id !== sel.id);
      return [...prev, sel];
    });
    setBetSlipOpen(true);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes - no layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* App routes with layout */}
        <Route element={
          <AppLayout
            selections={selections}
            setSelections={setSelections}
            betSlipOpen={betSlipOpen}
            setBetSlipOpen={setBetSlipOpen}
          />
        }>
          <Route path="/" element={<Home onAddSelection={addSelection} />} />
          <Route path="/sports" element={<Sports onAddSelection={addSelection} />} />
          <Route path="/match/:id" element={<MatchDetail onAddSelection={addSelection} />} />
          <Route path="/live" element={<LiveBetting onAddSelection={addSelection} />} />
          <Route path="/my-bets" element={<MyBets />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/profile" element={<Profile />} />

          {/* Admin routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/bets" element={<BetManagement />} />
          <Route path="/admin/odds" element={<OddsManagement />} />
          <Route path="/admin/transactions" element={<Transactions />} />
          <Route path="/admin/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
