import React, { useState } from 'react';
import { Coach, PassengerBooking, RouteItem } from '../types';
import {
  getStoredCoaches,
  getStoredRoutes,
  saveCoach,
  deleteCoach,
  getAllBookings,
  resetAllData,
  exportAllData,
  importAllData
} from '../services/storageService';
import {
  Bus,
  Plus,
  Edit,
  Trash2,
  Copy,
  Layers,
  MapPin,
  DollarSign,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Printer,
  AlertTriangle,
  Eye,
  CheckCircle
} from 'lucide-react';
import { CoachFormModal } from './CoachFormModal';
import { RouteManagerModal } from './RouteManagerModal';
import { DueCollectionModal } from './DueCollectionModal';

interface AdminPanelProps {
  onOpenSeatPlan: (coach: Coach) => void;
  onViewTicket: (booking: PassengerBooking) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onOpenSeatPlan, onViewTicket }) => {
  const [activeSubTab, setActiveSubTab] = useState<'coaches' | 'routes' | 'bookings' | 'settings'>('coaches');

  const [coaches, setCoaches] = useState<Coach[]>(getStoredCoaches());
  const [routes, setRoutes] = useState<RouteItem[]>(getStoredRoutes());
  const [bookings, setBookings] = useState<PassengerBooking[]>(getAllBookings());

  // Coach modal state
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null);
  const [isCoachFormOpen, setIsCoachFormOpen] = useState(false);

  // Route modal state
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);

  // Due modal state
  const [dueModalBooking, setDueModalBooking] = useState<PassengerBooking | null>(null);

  // Filters
  const [coachSearch, setCoachSearch] = useState('');
  const [routeFilter, setRouteFilter] = useState('ALL');
  const [bookingFilter, setBookingFilter] = useState<'all' | 'due' | 'sell' | 'book' | 'lock' | 'reservation'>('all');
  const [bookingSearch, setBookingSearch] = useState('');

  const refreshAll = () => {
    setCoaches(getStoredCoaches());
    setRoutes(getStoredRoutes());
    setBookings(getAllBookings());
  };

  const handleCreateCoach = () => {
    setEditingCoach(null);
    setIsCoachFormOpen(true);
  };

  const handleEditCoach = (c: Coach) => {
    setEditingCoach(c);
    setIsCoachFormOpen(true);
  };

  const handleDuplicateCoach = (c: Coach) => {
    const copyNumber = `${c.coachNumber}-DUP`;
    const newCoach: Coach = {
      ...c,
      id: `coach_${Date.now()}`,
      coachNumber: copyNumber,
      // Fresh empty seats with same layout
      seats: c.seats.map(s => ({
        ...s,
        id: `${s.deck}_${s.seatNumber}_${Date.now()}`,
        status: 'available',
        booking: undefined
      }))
    };
    saveCoach(newCoach);
    refreshAll();
  };

  const handleDeleteCoach = (coachId: string, coachNum: string) => {
    if (confirm(`Are you sure you want to permanently delete coach ${coachNum}?`)) {
      deleteCoach(coachId);
      refreshAll();
    }
  };

  const handleToggleCoachActive = (coach: Coach) => {
    const updated = { ...coach, isActive: !coach.isActive };
    saveCoach(updated);
    refreshAll();
  };

  const handleExportBackup = () => {
    const json = exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lal_sobuj_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      const content = evt.target?.result as string;
      if (content) {
        if (importAllData(content)) {
          alert('Database restored successfully from backup!');
          refreshAll();
        } else {
          alert('Failed to parse backup JSON file.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (confirm('Reset entire system database to default Lal Sobuj fleet? All custom modifications will be reset.')) {
      resetAllData();
      refreshAll();
    }
  };

  // Filtered coaches
  const filteredCoaches = coaches.filter(c => {
    const matchesSearch =
      c.coachNumber.toLowerCase().includes(coachSearch.toLowerCase()) ||
      c.regNumber.toLowerCase().includes(coachSearch.toLowerCase()) ||
      c.model.toLowerCase().includes(coachSearch.toLowerCase());
    const matchesRoute = routeFilter === 'ALL' || c.routeId === routeFilter || c.routeName === routeFilter;
    return matchesSearch && matchesRoute;
  });

  // Filtered bookings
  const filteredBookings = bookings.filter(b => {
    const matchesSearch =
      b.passengerName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.phone.includes(bookingSearch) ||
      b.pnr.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.seatNumber.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.coachNumber.toLowerCase().includes(bookingSearch.toLowerCase());

    if (!matchesSearch) return false;

    if (bookingFilter === 'due') {
      return (b.dueAmount || 0) > 0;
    }
    if (bookingFilter !== 'all') {
      return b.status === bookingFilter;
    }
    return true;
  });

  const totalOutstandingDue = bookings.reduce((sum, b) => sum + (b.dueAmount || 0), 0);
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.paidAmount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner & Title */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-2xl tracking-tight">Admin Operations Center</span>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
              Fleet Control
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Create and configure coaches, assign routes, manage single/double deck layouts, and track dues.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCreateCoach}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Coach</span>
          </button>

          <button
            onClick={() => setIsRouteModalOpen(true)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>Manage Routes</span>
          </button>
        </div>
      </div>

      {/* Sub navigation tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('coaches')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeSubTab === 'coaches'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Bus className="w-4 h-4" />
          <span>Coaches & Layouts ({coaches.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('bookings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeSubTab === 'bookings'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Bookings & Due Ledger ({bookings.length})</span>
          {totalOutstandingDue > 0 && (
            <span className="bg-rose-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-mono">
              ৳{totalOutstandingDue} Due
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('routes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeSubTab === 'routes'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Routes & Counters ({routes.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('settings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeSubTab === 'settings'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Backup & Persistence</span>
        </button>
      </div>

      {/* SUB-TAB 1: COACHES MANAGEMENT */}
      {activeSubTab === 'coaches' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search coach number, model..."
                value={coachSearch}
                onChange={e => setCoachSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Route:</span>
              <select
                value={routeFilter}
                onChange={e => setRouteFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-1.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white font-medium"
              >
                <option value="ALL">All Travel Routes</option>
                {routes.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Coaches Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="p-3.5 pl-5">Coach No / Reg</th>
                    <th className="p-3.5">Route</th>
                    <th className="p-3.5">Deck & Layout</th>
                    <th className="p-3.5">Departure</th>
                    <th className="p-3.5">Seats & Fare</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 pr-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCoaches.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        No coaches found matching criteria. Click &quot;Create New Coach&quot; above.
                      </td>
                    </tr>
                  ) : (
                    filteredCoaches.map(coach => {
                      const avail = coach.seats.filter(s => s.status === 'available').length;
                      const sold = coach.seats.filter(s => s.status === 'sold').length;
                      const booked = coach.seats.filter(s => s.status === 'booked').length;

                      return (
                        <tr key={coach.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5 pl-5">
                            <div className="font-mono font-black text-slate-900 text-sm flex items-center gap-1.5">
                              <span>{coach.coachNumber}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                              {coach.regNumber} · {coach.model}
                            </p>
                          </td>

                          <td className="p-3.5">
                            <span className="font-bold text-slate-800">{coach.routeName}</span>
                            <p className="text-[11px] text-slate-400 truncate max-w-xs">
                              {coach.startingCounter} → {coach.destinationCounter}
                            </p>
                          </td>

                          <td className="p-3.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium text-slate-800">
                                {coach.deckType === 'double' ? 'Double Deck' : 'Single Deck'}
                              </span>
                              <span className="bg-slate-100 text-slate-700 font-mono text-[10px] px-1.5 py-0.5 rounded border border-slate-200">
                                {coach.lowerDeckConfig.layout}
                              </span>
                              {coach.deckType === 'double' && (
                                <span className="bg-emerald-50 text-emerald-800 font-mono text-[10px] px-1.5 py-0.5 rounded border border-emerald-200">
                                  Upper: {coach.upperDeckConfig?.layout || '1+1'}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500">{coach.coachClass}</span>
                          </td>

                          <td className="p-3.5 font-mono">
                            <span className="font-bold text-rose-600">{coach.departureTime}</span>
                            <p className="text-[11px] text-slate-400">{coach.departureDate}</p>
                          </td>

                          <td className="p-3.5 font-mono">
                            <div className="font-bold text-slate-900">৳{coach.baseFare}</div>
                            <p className="text-[11px] text-slate-500">
                              {avail}/{coach.seats.length} Free · {sold} Sold · {booked} Booked
                            </p>
                          </td>

                          <td className="p-3.5">
                            <button
                              onClick={() => handleToggleCoachActive(coach)}
                              className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                                coach.isActive
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : 'bg-slate-100 text-slate-500 border-slate-200'
                              }`}
                            >
                              {coach.isActive ? 'Active' : 'Inactive'}
                            </button>
                          </td>

                          <td className="p-3.5 pr-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => onOpenSeatPlan(coach)}
                                className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                                title="Open Interactive Seat Plan"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleEditCoach(coach)}
                                className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors"
                                title="Edit Coach Configuration"
                              >
                                <Edit className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleDuplicateCoach(coach)}
                                className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors"
                                title="Duplicate Schedule"
                              >
                                <Copy className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleDeleteCoach(coach.id, coach.coachNumber)}
                                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                                title="Delete Coach"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: BOOKINGS & DUE LEDGER */}
      {activeSubTab === 'bookings' && (
        <div className="space-y-4">
          {/* Metrics summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Total Bookings
                </span>
                <span className="text-2xl font-black text-slate-900 font-mono">{bookings.length}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                🎫
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block">
                  Total Collected Revenue
                </span>
                <span className="text-2xl font-black text-emerald-800 font-mono">
                  ৳{totalRevenue.toLocaleString()}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                ৳
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-xs flex items-center justify-between bg-rose-50/20">
              <div>
                <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider block">
                  Total Outstanding Dues
                </span>
                <span className="text-2xl font-black text-rose-700 font-mono">
                  ৳{totalOutstandingDue.toLocaleString()}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                !
              </div>
            </div>
          </div>

          {/* Search & Status Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search passenger, phone, PNR..."
                value={bookingSearch}
                onChange={e => setBookingSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-emerald-500"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setBookingFilter('all')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold border ${
                  bookingFilter === 'all'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                All ({bookings.length})
              </button>

              <button
                onClick={() => setBookingFilter('due')}
                className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                  bookingFilter === 'due'
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                }`}
              >
                Outstanding Due Only
              </button>

              <button
                onClick={() => setBookingFilter('sell')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold border ${
                  bookingFilter === 'sell'
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Sold
              </button>

              <button
                onClick={() => setBookingFilter('book')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold border ${
                  bookingFilter === 'book'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Booked
              </button>

              <button
                onClick={() => setBookingFilter('lock')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold border ${
                  bookingFilter === 'lock'
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Locked
              </button>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="p-3.5 pl-5">PNR / Date</th>
                    <th className="p-3.5">Passenger Details</th>
                    <th className="p-3.5">Coach & Seat</th>
                    <th className="p-3.5">Boarding / Dropping</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Fare & Due</th>
                    <th className="p-3.5 pr-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        No bookings found matching filter.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map(b => (
                      <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 pl-5 font-mono">
                          <span className="font-bold text-slate-900">{b.pnr}</span>
                          <p className="text-[11px] text-slate-400">
                            {new Date(b.bookedAt).toLocaleDateString()}
                          </p>
                        </td>

                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{b.passengerName}</div>
                          <p className="font-mono text-[11px] text-slate-500">{b.phone}</p>
                          <span className="text-[10px] text-slate-400">{b.gender}</span>
                        </td>

                        <td className="p-3.5 font-mono">
                          <span className="font-bold text-slate-800">{b.coachNumber}</span>
                          <div className="text-emerald-700 font-black">
                            Seat {b.seatNumber} ({b.deck === 'upper' ? 'Upper' : 'Lower'})
                          </div>
                        </td>

                        <td className="p-3.5 text-xs">
                          <p className="font-medium text-slate-800 truncate max-w-xs">{b.boardingPoint}</p>
                          <p className="text-slate-400 truncate max-w-xs">→ {b.droppingPoint}</p>
                        </td>

                        <td className="p-3.5">
                          <span
                            className={`text-xs font-bold uppercase px-2 py-0.5 rounded border ${
                              b.status === 'sell'
                                ? 'bg-rose-100 text-rose-800 border-rose-300'
                                : b.status === 'book'
                                ? 'bg-blue-100 text-blue-800 border-blue-300'
                                : b.status === 'lock'
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : 'bg-purple-100 text-purple-800 border-purple-300'
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>

                        <td className="p-3.5 font-mono">
                          <div className="font-semibold text-slate-700">
                            ৳{b.fare} <span className="text-slate-400 font-normal">total</span>
                          </div>
                          {b.dueAmount > 0 ? (
                            <span className="inline-block text-rose-700 font-bold bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200 text-[11px]">
                              ৳{b.dueAmount} DUE
                            </span>
                          ) : (
                            <span className="text-emerald-700 font-bold text-[11px]">Paid in full</span>
                          )}
                        </td>

                        <td className="p-3.5 pr-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {b.dueAmount > 0 && (
                              <button
                                onClick={() => setDueModalBooking(b)}
                                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-xs cursor-pointer"
                                title="Collect Due Payment"
                              >
                                <DollarSign className="w-3.5 h-3.5" />
                                <span>Collect Due</span>
                              </button>
                            )}

                            <button
                              onClick={() => onViewTicket(b)}
                              className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors"
                              title="Print / View e-Ticket"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: ROUTES & COUNTERS */}
      {activeSubTab === 'routes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Configured Travel Corridors ({routes.length})
            </span>
            <button
              onClick={() => setIsRouteModalOpen(true)}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Configure / Add Routes</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {routes.map(r => (
              <div key={r.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-base">{r.name}</h3>
                  <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-xs">
                    ৳{r.defaultFare}
                  </span>
                </div>

                <div className="text-xs text-slate-500 space-y-1">
                  <p>
                    <strong>Distance:</strong> {r.distanceKm} km · ~{r.durationHours}
                  </p>
                  <p>
                    <strong>Boarding Counters ({r.boardingPoints.length}):</strong>
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {r.boardingPoints.map(p => (
                      <span key={p} className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                        {p}
                      </span>
                    ))}
                  </div>

                  <p className="pt-1">
                    <strong>Dropping Counters ({r.droppingPoints.length}):</strong>
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {r.droppingPoints.map(p => (
                      <span key={p} className="text-[10px] bg-rose-50 text-rose-800 px-1.5 py-0.5 rounded">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => setIsRouteModalOpen(true)}
                    className="text-xs font-semibold text-emerald-700 hover:underline"
                  >
                    Edit Counters →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: BACKUP & PERSISTENCE */}
      {activeSubTab === 'settings' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6 max-w-2xl">
          <div>
            <h3 className="font-bold text-base text-slate-900">Database Persistence & System Backup</h3>
            <p className="text-xs text-slate-500 mt-1">
              All coaches, configured seat layouts, routes, passenger tickets, and due balances are stored
              persistently in browser localStorage. You can export complete backups and restore them at any time.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="font-bold text-xs text-slate-800 uppercase tracking-wider block">
                Export Database
              </span>
              <p className="text-xs text-slate-500">
                Download a JSON backup of all current coaches, seat allocations, routes, and bookings.
              </p>
              <button
                onClick={handleExportBackup}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export JSON Backup</span>
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="font-bold text-xs text-slate-800 uppercase tracking-wider block">
                Restore Database
              </span>
              <p className="text-xs text-slate-500">
                Upload a previous JSON backup to restore routes, coaches, and booking records.
              </p>
              <label className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center">
                <Upload className="w-4 h-4" />
                <span>Import Backup JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-xs text-rose-900 block">
                  Reset Fleet to Fresh Seed State
                </span>
                <p className="text-xs text-rose-700">
                  Resets the database back to authentic Lal Sobuj 2.0 coaches and demonstration bookings.
                </p>
              </div>
              <button
                onClick={handleResetData}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset to Seed Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {isCoachFormOpen && (
        <CoachFormModal
          initialCoach={editingCoach}
          onClose={() => setIsCoachFormOpen(false)}
          onSaved={() => {
            setIsCoachFormOpen(false);
            refreshAll();
          }}
        />
      )}

      {isRouteModalOpen && (
        <RouteManagerModal
          onClose={() => setIsRouteModalOpen(false)}
          onRoutesUpdated={() => refreshAll()}
        />
      )}

      {dueModalBooking && (
        <DueCollectionModal
          booking={dueModalBooking}
          onClose={() => setDueModalBooking(null)}
          onSuccess={() => refreshAll()}
        />
      )}
    </div>
  );
};
