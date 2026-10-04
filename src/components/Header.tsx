import React, { useState, useEffect } from 'react';
import { Bus, ShieldAlert, LayoutDashboard, Search, RefreshCw, DollarSign, Clock, Users } from 'lucide-react';
import { getStoredCoaches } from '../services/storageService';

interface HeaderProps {
  currentTab: 'home' | 'admin' | 'dueLedger';
  setCurrentTab: (tab: 'home' | 'admin' | 'dueLedger') => void;
  onOpenSearchTicket: () => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  onOpenSearchTicket,
  onResetData
}) => {
  const [stats, setStats] = useState({
    activeCoaches: 0,
    totalBookings: 0,
    totalDue: 0,
    totalRevenue: 0
  });

  const [timeStr, setTimeStr] = useState('');

  const calculateStats = () => {
    const coaches = getStoredCoaches();
    let totalBookings = 0;
    let totalDue = 0;
    let totalRevenue = 0;

    coaches.forEach(c => {
      c.seats.forEach(s => {
        if (s.booking) {
          totalBookings++;
          totalDue += s.booking.dueAmount || 0;
          totalRevenue += s.booking.paidAmount || 0;
        }
      });
    });

    setStats({
      activeCoaches: coaches.filter(c => c.isActive).length,
      totalBookings,
      totalDue,
      totalRevenue
    });
  };

  useEffect(() => {
    calculateStats();
    const handleDataChange = () => calculateStats();
    window.addEventListener('lalsobuj_data_change', handleDataChange);

    const updateClock = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);

    return () => {
      window.removeEventListener('lalsobuj_data_change', handleDataChange);
      clearInterval(timer);
    };
  }, []);

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
      {/* Top micro bar with system status */}
      <div className="bg-emerald-900/90 text-emerald-100 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-emerald-800/50">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium text-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Lal Sobuj Express Bus Network 2.0
          </span>
          <span className="text-emerald-400/60 hidden sm:inline">|</span>
          <span className="hidden sm:inline text-emerald-200/90">
            Dhaka · Lakshmipur · Sonapur · Maijdee · Chattogram
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1 text-emerald-200 font-mono">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            {timeStr || 'Dhaka Time'}
          </span>
          <span className="text-emerald-300 font-semibold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700/50">
            Counter #01 (Sayedabad HQ)
          </span>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo and Brand */}
          <div className="flex items-center justify-between">
            <div
              onClick={() => setCurrentTab('home')}
              className="flex items-center gap-3 cursor-pointer group select-none"
            >
              {/* Bangladeshi Lal Sobuj (Red Circle in Green Square) transport insignia */}
              <div className="w-11 h-11 rounded-xl bg-emerald-700 p-1 flex items-center justify-center shadow-lg shadow-emerald-950/40 relative overflow-hidden group-hover:bg-emerald-600 transition-colors border border-emerald-500/40">
                <div className="w-5 h-5 rounded-full bg-rose-600 shadow-inner flex items-center justify-center">
                  <Bus className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xl tracking-tight text-white flex items-center">
                    LAL SOBUJ <span className="text-rose-500 ml-1">2.0</span>
                  </span>
                  <span className="bg-rose-600/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                    Official
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium tracking-wide">
                  লাল সবুজ পরিবহন · Inter-District Express Fleet
                </p>
              </div>
            </div>

            {/* Mobile quick actions */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={onOpenSearchTicket}
                className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                title="Search Ticket / PNR"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700/80">
              <button
                onClick={() => setCurrentTab('home')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentTab === 'home'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                <Bus className="w-3.5 h-3.5" />
                Active Coaches
              </button>

              <button
                onClick={() => setCurrentTab('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentTab === 'admin'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Admin Panel
              </button>

              <button
                onClick={() => setCurrentTab('dueLedger')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentTab === 'dueLedger'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-rose-300 hover:text-rose-100 hover:bg-slate-700/60'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                Due Ledger
                {stats.totalDue > 0 && (
                  <span className="ml-1 bg-rose-950 text-rose-300 font-mono text-[10px] px-1.5 py-0.2 rounded font-bold border border-rose-700/60">
                    ৳{stats.totalDue}
                  </span>
                )}
              </button>
            </div>

            {/* Quick search button */}
            <button
              onClick={onOpenSearchTicket}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search PNR</span>
            </button>

            {/* Quick refresh seed */}
            <button
              onClick={onResetData}
              title="Reset test data to fresh Lal Sobuj fleet"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs border border-slate-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Live Metrics Row */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Bus className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">Active Coaches:</span>
            <span className="font-semibold text-white font-mono">{stats.activeCoaches}</span>
          </div>

          <div className="flex items-center gap-2 text-slate-300">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-400">Total Bookings:</span>
            <span className="font-semibold text-white font-mono">{stats.totalBookings}</span>
          </div>

          <div className="flex items-center gap-2 text-slate-300">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">Total Collected:</span>
            <span className="font-semibold text-emerald-400 font-mono">৳{stats.totalRevenue.toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-2 text-slate-300">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-slate-400">Total Due Amount:</span>
            <span className="font-bold text-rose-400 font-mono">৳{stats.totalDue.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
