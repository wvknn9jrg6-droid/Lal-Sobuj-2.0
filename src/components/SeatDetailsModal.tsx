import React, { useState } from 'react';
import { Coach, PassengerBooking, Seat } from '../types';
import { releaseSeat, updateSeatBooking, collectSeatDue } from '../services/storageService';
import { X, Ticket, DollarSign, Trash2, Printer, CheckCircle, ShieldAlert, Phone, MapPin, User, Clock } from 'lucide-react';

interface SeatDetailsModalProps {
  coach: Coach;
  seat: Seat;
  onClose: () => void;
  onViewTicket: (booking: PassengerBooking) => void;
}

export const SeatDetailsModal: React.FC<SeatDetailsModalProps> = ({
  coach,
  seat,
  onClose,
  onViewTicket
}) => {
  const booking = seat.booking;
  const [showDuePayInput, setShowDuePayInput] = useState(false);
  const [payAmount, setPayAmount] = useState(booking?.dueAmount || 0);

  if (!booking) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center space-y-4">
          <p className="text-sm font-semibold text-slate-700">Seat {seat.seatNumber} is Available</p>
          <button
            onClick={onClose}
            className="w-full bg-slate-800 text-white font-bold py-2 rounded-xl text-xs"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const handleRelease = () => {
    if (confirm(`Are you sure you want to cancel and release seat ${seat.seatNumber}? This will remove the passenger booking.`)) {
      releaseSeat(coach.id, seat.seatNumber);
      onClose();
    }
  };

  const handleCollectDue = () => {
    if (payAmount <= 0) return;
    collectSeatDue(coach.id, seat.seatNumber, payAmount);
    setShowDuePayInput(false);
    onClose();
  };

  const handleStatusChange = (newStatus: 'sell' | 'book' | 'lock' | 'reservation') => {
    const updated: PassengerBooking = {
      ...booking,
      status: newStatus,
      paidAmount: newStatus === 'sell' && booking.dueAmount > 0 ? booking.fare : booking.paidAmount,
      dueAmount: newStatus === 'sell' && booking.dueAmount > 0 ? 0 : booking.dueAmount
    };
    updateSeatBooking(coach.id, seat.seatNumber, updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-black text-emerald-400 text-lg">
              {seat.seatNumber}
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Seat Details & Passenger Card
              </h2>
              <p className="text-xs text-slate-400">
                {coach.coachNumber} · {seat.deck === 'upper' ? 'Upper Deck' : 'Lower Deck'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status banner */}
        <div className="p-3 px-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status:</span>
            <span
              className={`text-xs font-black uppercase px-2.5 py-0.5 rounded-lg border ${
                booking.status === 'sell'
                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                  : booking.status === 'book'
                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                  : booking.status === 'lock'
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-purple-100 text-purple-800 border-purple-300'
              }`}
            >
              {booking.status}
            </span>
          </div>

          <span className="text-xs font-mono font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
            {booking.pnr}
          </span>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm">
          {/* Passenger details */}
          <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <User className="w-4 h-4 text-slate-400" /> Passenger:
              </span>
              <span className="font-bold text-slate-900 text-sm">{booking.passengerName}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <Phone className="w-4 h-4 text-slate-400" /> Mobile:
              </span>
              <a
                href={`tel:${booking.phone}`}
                className="font-mono font-bold text-emerald-700 hover:underline"
              >
                {booking.phone}
              </a>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                Gender / Deck:
              </span>
              <span className="font-medium text-slate-800">
                {booking.gender} · {seat.deck === 'upper' ? 'Upper Deck' : 'Lower Deck'}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200 space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <span className="text-slate-500 flex items-center gap-1.5 font-medium flex-shrink-0">
                  <MapPin className="w-4 h-4 text-emerald-600" /> Boarding:
                </span>
                <span className="font-semibold text-slate-900 text-right">{booking.boardingPoint}</span>
              </div>

              <div className="flex items-start justify-between gap-2">
                <span className="text-slate-500 flex items-center gap-1.5 font-medium flex-shrink-0">
                  <MapPin className="w-4 h-4 text-rose-600" /> Dropping:
                </span>
                <span className="font-semibold text-slate-900 text-right">{booking.droppingPoint}</span>
              </div>
            </div>

            {booking.notes && (
              <div className="pt-2 border-t border-slate-200 text-xs text-slate-600 bg-amber-50/50 p-2 rounded-lg border border-amber-200/50">
                <strong>Remarks:</strong> {booking.notes}
              </div>
            )}
          </div>

          {/* Fare & Due Breakdown Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Fare & Payment Status
            </span>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-400 block">Total Fare</span>
                <span className="font-bold font-mono text-slate-900 text-sm">৳{booking.fare}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-[11px] text-emerald-700 block">Paid Amount</span>
                <span className="font-bold font-mono text-emerald-800 text-sm">৳{booking.paidAmount}</span>
              </div>

              <div className={`p-2.5 rounded-xl border ${booking.dueAmount > 0 ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'}`}>
                <span className="text-[11px] text-slate-500 block">Due Balance</span>
                <span className={`font-bold font-mono text-sm ${booking.dueAmount > 0 ? 'text-rose-700' : 'text-slate-700'}`}>
                  ৳{booking.dueAmount}
                </span>
              </div>
            </div>

            {/* Quick Due Collection Section */}
            {booking.dueAmount > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-100">
                {!showDuePayInput ? (
                  <button
                    type="button"
                    onClick={() => setShowDuePayInput(true)}
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Collect Outstanding Due (৳{booking.dueAmount})</span>
                  </button>
                ) : (
                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-rose-900">Enter Payment to Clear Due:</span>
                      <button
                        onClick={() => setShowDuePayInput(false)}
                        className="text-slate-400 hover:text-slate-600 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        max={booking.dueAmount}
                        value={payAmount}
                        onChange={e => setPayAmount(Number(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 rounded-lg border border-rose-300 font-mono font-bold text-slate-900 text-sm bg-white"
                      />
                      <button
                        onClick={handleCollectDue}
                        className="bg-rose-700 hover:bg-rose-800 text-white font-bold px-4 py-1.5 rounded-lg text-xs flex-shrink-0 cursor-pointer"
                      >
                        Receive
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick status switchers */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Change Status
            </span>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleStatusChange('sell')}
                disabled={booking.status === 'sell'}
                className="py-1.5 px-2 rounded-lg text-xs font-semibold border border-slate-200 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-40 cursor-pointer"
              >
                Sell
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange('book')}
                disabled={booking.status === 'book'}
                className="py-1.5 px-2 rounded-lg text-xs font-semibold border border-slate-200 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-40 cursor-pointer"
              >
                Book
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange('lock')}
                disabled={booking.status === 'lock'}
                className="py-1.5 px-2 rounded-lg text-xs font-semibold border border-slate-200 hover:bg-amber-50 hover:text-amber-700 disabled:opacity-40 cursor-pointer"
              >
                Lock
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange('reservation')}
                disabled={booking.status === 'reservation'}
                className="py-1.5 px-2 rounded-lg text-xs font-semibold border border-slate-200 hover:bg-purple-50 hover:text-purple-700 disabled:opacity-40 cursor-pointer"
              >
                Reserve
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleRelease}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-700 hover:bg-rose-100 border border-rose-300 font-bold text-xs transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Cancel Seat</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onViewTicket(booking);
              }}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print e-Ticket</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
