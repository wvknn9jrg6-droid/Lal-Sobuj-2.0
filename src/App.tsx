/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Coach, PassengerBooking, RouteItem, Seat } from './types';
import {
  getStoredCoaches,
  getStoredRoutes,
  resetAllData,
  getAllBookings
} from './services/storageService';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { SeatPlanModal } from './components/SeatPlanModal';
import { BookingFormModal } from './components/BookingFormModal';
import { SeatDetailsModal } from './components/SeatDetailsModal';
import { TicketModal } from './components/TicketModal';
import { AdminPanel } from './components/AdminPanel';
import { SearchTicketModal } from './components/SearchTicketModal';
import { CoachFormModal } from './components/CoachFormModal';
import { DollarSign, Bus, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { DueCollectionModal } from './components/DueCollectionModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'home' | 'admin' | 'dueLedger'>('home');

  // Stored state
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [routes, setRoutes] = useState<RouteItem[]>([]);

  // Modals state
  const [activeSeatPlanCoach, setActiveSeatPlanCoach] = useState<Coach | null>(null);
  const [bookingFormTarget, setBookingFormTarget] = useState<{
    coach: Coach;
    selectedSeatNumbers: string[];
  } | null>(null);
  const [activeSeatDetails, setActiveSeatDetails] = useState<{
    coach: Coach;
    seat: Seat;
  } | null>(null);
  const [activeTicket, setActiveTicket] = useState<PassengerBooking | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null);
  const [isCoachFormOpen, setIsCoachFormOpen] = useState(false);
  const [dueCollectionTarget, setDueCollectionTarget] = useState<PassengerBooking | null>(null);

  // Notification Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const loadData = () => {
    const loadedCoaches = getStoredCoaches();
    const loadedRoutes = getStoredRoutes();
    setCoaches(loadedCoaches);
    setRoutes(loadedRoutes);

    // Keep active seat plan coach updated with fresh seat states if open
    if (activeSeatPlanCoach) {
      const refreshed = loadedCoaches.find(c => c.id === activeSeatPlanCoach.id);
      if (refreshed) {
        setActiveSeatPlanCoach(refreshed);
      }
    }
  };

  useEffect(() => {
    loadData();
    const handleDataChange = () => {
      loadData();
    };
    window.addEventListener('lalsobuj_data_change', handleDataChange);
    return () => {
      window.removeEventListener('lalsobuj_data_change', handleDataChange);
    };
  }, [activeSeatPlanCoach?.id]);

  const handleOpenSeatPlan = (coach: Coach) => {
    setActiveSeatPlanCoach(coach);
  };

  const handleOpenBookingForm = (coach: Coach, selectedSeatNumbers: string[]) => {
    setBookingFormTarget({ coach, selectedSeatNumbers });
  };

  const handleBookingSuccess = (createdBookings: PassengerBooking[]) => {
    setBookingFormTarget(null);
    setActiveSeatPlanCoach(null);
    loadData();

    if (createdBookings.length > 0) {
      showToast(`Successfully issued ${createdBookings.length} seat ticket(s)! PNR: ${createdBookings[0].pnr}`);
      // Open ticket voucher for the first booked seat
      setActiveTicket(createdBookings[0]);
    }
  };

  const handleViewSeatDetails = (coach: Coach, seat: Seat) => {
    setActiveSeatDetails({ coach, seat });
  };

  const handleResetData = () => {
    if (confirm('Reset entire system database to default Lal Sobuj fleet? All custom modifications will be reset.')) {
      resetAllData();
      loadData();
      showToast('System database reset to initial Lal Sobuj fleet!');
    }
  };

  // Due ledger view
  const allBookings = getAllBookings();
  const dueBookings = allBookings.filter(b => (b.dueAmount || 0) > 0);
  const totalDueAmount = dueBookings.reduce((sum, b) => sum + b.dueAmount, 0);

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
      {/* Universal Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenSearchTicket={() => setIsSearchOpen(true)}
        onResetData={handleResetData}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {currentTab === 'home' && (
          <HomePage
            coaches={coaches}
            routes={routes}
            onOpenSeatPlan={handleOpenSeatPlan}
            onEditCoach={coach => {
              setEditingCoach(coach);
              setIsCoachFormOpen(true);
            }}
          />
        )}

        {currentTab === 'admin' && (
          <AdminPanel
            onOpenSeatPlan={handleOpenSeatPlan}
            onViewTicket={ticket => setActiveTicket(ticket)}
          />
        )}

        {currentTab === 'dueLedger' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
            {/* Due Ledger Top Ribbon */}
            <div className="bg-rose-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-rose-900 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-2xl tracking-tight">Counter Due & Receivables Ledger</span>
                  <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                    REAL-TIME SYNC
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-rose-200/80">
                  Track and collect outstanding fares from passengers who booked with pending payments.
                </p>
              </div>

              <div className="bg-rose-900/90 border border-rose-700/80 rounded-2xl p-4 text-right flex items-center gap-4">
                <div>
                  <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider block">
                    Total Outstanding Due
                  </span>
                  <span className="text-3xl font-black font-mono text-white">৳{totalDueAmount.toLocaleString()}</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-rose-800 flex items-center justify-center font-bold text-xl text-rose-300">
                  !
                </div>
              </div>
            </div>

            {/* Due table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Passengers with Due Balance ({dueBookings.length})
                </span>
                <button
                  onClick={() => setCurrentTab('home')}
                  className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Coaches
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                    <tr>
                      <th className="p-3.5 pl-5">PNR / Issue Date</th>
                      <th className="p-3.5">Passenger Name</th>
                      <th className="p-3.5">Mobile Number</th>
                      <th className="p-3.5">Coach & Seat</th>
                      <th className="p-3.5">Boarding Point</th>
                      <th className="p-3.5">Fare / Paid</th>
                      <th className="p-3.5 font-bold text-rose-700">Due Amount</th>
                      <th className="p-3.5 pr-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dueBookings.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-10 text-center text-slate-400">
                          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                          <span className="font-semibold text-slate-700">All passenger dues are fully settled!</span>
                          <p className="text-xs text-slate-400 mt-1">There are no outstanding counter dues.</p>
                        </td>
                      </tr>
                    ) : (
                      dueBookings.map(b => (
                        <tr key={b.id} className="hover:bg-rose-50/20 transition-colors">
                          <td className="p-3.5 pl-5 font-mono font-bold text-slate-900">
                            {b.pnr}
                            <p className="text-[11px] text-slate-400 font-normal">
                              {new Date(b.bookedAt).toLocaleDateString()}
                            </p>
                          </td>

                          <td className="p-3.5 font-bold text-slate-900">{b.passengerName}</td>

                          <td className="p-3.5 font-mono text-emerald-800 font-medium">
                            <a href={`tel:${b.phone}`} className="hover:underline">
                              {b.phone}
                            </a>
                          </td>

                          <td className="p-3.5 font-mono">
                            <span className="font-semibold text-slate-800">{b.coachNumber}</span>
                            <div className="text-rose-600 font-bold">
                              Seat {b.seatNumber} ({b.deck === 'upper' ? 'Upper' : 'Lower'})
                            </div>
                          </td>

                          <td className="p-3.5 text-xs text-slate-600 truncate max-w-xs">{b.boardingPoint}</td>

                          <td className="p-3.5 font-mono">
                            ৳{b.fare} total / <span className="text-emerald-700">৳{b.paidAmount} paid</span>
                          </td>

                          <td className="p-3.5 font-mono font-bold text-rose-700 text-sm">৳{b.dueAmount}</td>

                          <td className="p-3.5 pr-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setDueCollectionTarget(b)}
                                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
                              >
                                <DollarSign className="w-3.5 h-3.5" />
                                <span>Collect Due</span>
                              </button>

                              <button
                                onClick={() => setActiveTicket(b)}
                                className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100"
                                title="View e-Ticket"
                              >
                                🎫
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
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-black text-white">LAL SOBUJ 2.0</span>
            <span>·</span>
            <span>লাল সবুজ পরিবহন অনলাইন সার্ভিস</span>
            <span>·</span>
            <span>Sayedabad HQ Central Server</span>
          </div>

          <p className="text-slate-500 font-mono text-[11px]">
            Real-time Coach Layouts · Fare & Due Persistence Engine · Responsive Multi-Device
          </p>
        </div>
      </footer>

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 animate-slideUp">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-xs sm:text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Interactive Modals */}

      {/* 1. Interactive Seat Plan Modal */}
      {activeSeatPlanCoach && (
        <SeatPlanModal
          coach={activeSeatPlanCoach}
          onClose={() => setActiveSeatPlanCoach(null)}
          onOpenBookingForm={handleOpenBookingForm}
          onViewSeatDetails={handleViewSeatDetails}
        />
      )}

      {/* 2. Passenger Booking Form Modal */}
      {bookingFormTarget && (
        <BookingFormModal
          coach={bookingFormTarget.coach}
          selectedSeatNumbers={bookingFormTarget.selectedSeatNumbers}
          onClose={() => setBookingFormTarget(null)}
          onSuccess={handleBookingSuccess}
        />
      )}

      {/* 3. Occupied Seat Details Modal */}
      {activeSeatDetails && (
        <SeatDetailsModal
          coach={activeSeatDetails.coach}
          seat={activeSeatDetails.seat}
          onClose={() => {
            setActiveSeatDetails(null);
            loadData();
          }}
          onViewTicket={ticket => {
            setActiveSeatDetails(null);
            setActiveTicket(ticket);
          }}
        />
      )}

      {/* 4. Passenger e-Ticket Voucher Modal */}
      {activeTicket && (
        <TicketModal booking={activeTicket} onClose={() => setActiveTicket(null)} />
      )}

      {/* 5. Search Ticket / PNR Modal */}
      {isSearchOpen && (
        <SearchTicketModal
          onClose={() => setIsSearchOpen(false)}
          onSelectBooking={booking => setActiveTicket(booking)}
        />
      )}

      {/* 6. Quick Coach Edit Config Modal */}
      {isCoachFormOpen && (
        <CoachFormModal
          initialCoach={editingCoach}
          onClose={() => {
            setIsCoachFormOpen(false);
            setEditingCoach(null);
          }}
          onSaved={() => {
            setIsCoachFormOpen(false);
            setEditingCoach(null);
            loadData();
            showToast('Coach configuration updated successfully!');
          }}
        />
      )}

      {/* 7. Quick Due Collection Modal */}
      {dueCollectionTarget && (
        <DueCollectionModal
          booking={dueCollectionTarget}
          onClose={() => setDueCollectionTarget(null)}
          onSuccess={() => {
            loadData();
            showToast('Payment received and due balance cleared!');
          }}
        />
      )}
    </div>
  );
}
