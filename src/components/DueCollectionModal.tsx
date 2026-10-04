import React, { useState } from 'react';
import { PassengerBooking } from '../types';
import { collectSeatDue } from '../services/storageService';
import { X, DollarSign, CheckCircle2, User, Phone, Bus } from 'lucide-react';

interface DueCollectionModalProps {
  booking: PassengerBooking;
  onClose: () => void;
  onSuccess: () => void;
}

export const DueCollectionModal: React.FC<DueCollectionModalProps> = ({
  booking,
  onClose,
  onSuccess
}) => {
  const [payAmount, setPayAmount] = useState<number>(booking.dueAmount);
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'bKash' | 'Nagad' | 'Card'>('Cash');
  const [receiptNote, setReceiptNote] = useState('Due collected at counter');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (payAmount <= 0) return;

    collectSeatDue(booking.coachId, booking.seatNumber, payAmount);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-rose-900 text-white p-4 flex items-center justify-between border-b border-rose-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-800 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-rose-200" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Collect Due Payment</h3>
              <p className="text-[11px] text-rose-200">PNR: {booking.pnr}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-rose-200 hover:text-white hover:bg-rose-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs sm:text-sm">
          {/* Passenger details */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Passenger:</span>
              <strong className="text-slate-900">{booking.passengerName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Phone:</span>
              <span className="font-mono text-slate-800">{booking.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Coach / Seat:</span>
              <span className="font-mono font-bold text-slate-900">
                {booking.coachNumber} · Seat {booking.seatNumber}
              </span>
            </div>
            <div className="pt-1.5 border-t border-slate-200 flex justify-between font-mono">
              <span className="text-slate-500">Total Fare / Already Paid:</span>
              <span>
                ৳{booking.fare} / <span className="text-emerald-700">৳{booking.paidAmount}</span>
              </span>
            </div>
            <div className="flex justify-between font-mono text-rose-700 font-bold">
              <span>Outstanding Due:</span>
              <span className="text-sm">৳{booking.dueAmount}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Amount to Collect (৳) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              required
              min="1"
              max={booking.dueAmount}
              value={payAmount}
              onChange={e => setPayAmount(Number(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl border border-rose-300 font-mono font-bold text-lg text-rose-800 bg-rose-50/40 focus:outline-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
            <select
              value={paymentMode}
              onChange={e => setPaymentMode(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
            >
              <option value="Cash">Cash at Counter</option>
              <option value="bKash">bKash Merchant Pay</option>
              <option value="Nagad">Nagad Pay</option>
              <option value="Card">POS Card</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
            <input
              type="text"
              value={receiptNote}
              onChange={e => setReceiptNote(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-5 py-2 rounded-xl flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Received</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
