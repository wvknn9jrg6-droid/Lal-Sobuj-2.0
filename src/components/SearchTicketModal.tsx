import React, { useState } from 'react';
import { PassengerBooking } from '../types';
import { getAllBookings } from '../services/storageService';
import { X, Search, Ticket, User, Phone, Printer, DollarSign } from 'lucide-react';

interface SearchTicketModalProps {
  onClose: () => void;
  onSelectBooking: (booking: PassengerBooking) => void;
}

export const SearchTicketModal: React.FC<SearchTicketModalProps> = ({
  onClose,
  onSelectBooking
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const allBookings = getAllBookings();

  const results = searchTerm.trim()
    ? allBookings.filter(b => {
        const term = searchTerm.toLowerCase();
        return (
          b.pnr.toLowerCase().includes(term) ||
          b.phone.includes(term) ||
          b.passengerName.toLowerCase().includes(term) ||
          b.coachNumber.toLowerCase().includes(term) ||
          b.seatNumber.toLowerCase().includes(term)
        );
      })
    : [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center">
              <Search className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-bold text-sm">Search Ticket / PNR / Passenger</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input */}
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              autoFocus
              placeholder="Enter PNR number, Mobile number (e.g. 01712...), or Name"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-emerald-500 bg-white text-sm"
            />
          </div>
        </div>

        {/* Results */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
          {!searchTerm.trim() ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              Type passenger mobile, PNR number (e.g. PNR-LS...), or name to look up ticket vouchers.
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No passenger tickets found matching &quot;{searchTerm}&quot;.
            </div>
          ) : (
            results.map(b => (
              <div
                key={b.id}
                onClick={() => {
                  onSelectBooking(b);
                  onClose();
                }}
                className="p-3 bg-white rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 cursor-pointer transition-all flex items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-800 text-xs bg-emerald-100 px-1.5 py-0.5 rounded">
                      {b.pnr}
                    </span>
                    <strong className="text-slate-900 text-xs sm:text-sm">{b.passengerName}</strong>
                    <span className="text-[10px] text-slate-400 font-mono">({b.phone})</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Coach: <strong className="text-slate-800">{b.coachNumber}</strong> · Seat: <strong className="text-rose-600">{b.seatNumber}</strong> ({b.deck === 'upper' ? 'Upper' : 'Lower'})
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {b.boardingPoint} → {b.droppingPoint}
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="font-mono font-bold text-xs text-slate-900">৳{b.fare}</div>
                  {b.dueAmount > 0 ? (
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1 py-0.5 rounded border border-rose-200">
                      ৳{b.dueAmount} DUE
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-700 font-bold">Paid</span>
                  )}
                  <button className="block ml-auto mt-1 text-[11px] text-emerald-700 font-bold hover:underline">
                    View Ticket →
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
