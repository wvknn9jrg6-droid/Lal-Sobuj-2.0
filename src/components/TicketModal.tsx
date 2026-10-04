import React from 'react';
import { PassengerBooking } from '../types';
import { X, Printer, Bus, CheckCircle2, AlertTriangle, QrCode } from 'lucide-react';

interface TicketModalProps {
  booking: PassengerBooking;
  onClose: () => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({ booking, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Modal Top Control Bar (Hidden on print) */}
        <div className="bg-slate-900 text-white p-3.5 px-5 flex items-center justify-between print:hidden">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Passenger e-Ticket & Receipt
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Ticket</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Ticket Content Container */}
        <div className="p-6 sm:p-8 overflow-y-auto print:p-0 print:m-0" id="printable-ticket">
          {/* Ticket Outer Decorative Box */}
          <div className="border-2 border-slate-800 rounded-2xl p-5 sm:p-6 relative bg-white">
            {/* Header Branding */}
            <div className="flex items-start justify-between border-b-2 border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-800 p-1 flex items-center justify-center shadow-xs border border-emerald-900">
                  <div className="w-6 h-6 rounded-full bg-rose-600 flex items-center justify-center">
                    <Bus className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tight text-slate-900 leading-tight">
                    LAL SOBUJ 2.0
                  </h1>
                  <p className="text-xs font-bold text-emerald-800 tracking-wide">
                    লাল সবুজ পরিবহন · Inter-District Luxury Express
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Official Passenger Traveling Voucher
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
                  PNR Number
                </span>
                <span className="font-mono text-base font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  {booking.pnr}
                </span>
              </div>
            </div>

            {/* Coach & Seat Highlight Row */}
            <div className="bg-slate-900 text-white rounded-xl p-3 px-4 mb-4 flex flex-wrap items-center justify-between gap-2 font-mono">
              <div className="flex items-center gap-3">
                <span className="text-slate-400 text-xs">COACH:</span>
                <span className="text-base font-black text-emerald-400">{booking.coachNumber}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-slate-400 text-xs">SEAT NO:</span>
                <span className="text-lg font-black text-white bg-rose-600 px-2.5 py-0.5 rounded shadow-xs">
                  {booking.seatNumber} ({booking.deck === 'upper' ? 'Upper Deck' : 'Lower Deck'})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-xs">STATUS:</span>
                <span className="text-xs font-bold uppercase bg-slate-800 text-emerald-300 px-2 py-0.5 rounded border border-slate-700">
                  {booking.status}
                </span>
              </div>
            </div>

            {/* Passenger & Journey Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs mb-4 pb-4 border-b border-dashed border-slate-300">
              <div className="space-y-1">
                <span className="text-slate-400 uppercase font-bold text-[10px]">Passenger Name</span>
                <p className="font-bold text-slate-900 text-sm">{booking.passengerName}</p>
                <p className="font-mono text-slate-600">{booking.phone}</p>
                <p className="text-slate-500">Gender: {booking.gender}</p>
              </div>

              <div className="space-y-1 text-right">
                <span className="text-slate-400 uppercase font-bold text-[10px]">Issuing Details</span>
                <p className="font-medium text-slate-800">{booking.counter}</p>
                <p className="font-mono text-[11px] text-slate-500">
                  {new Date(booking.bookedAt).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })}
                </p>
                <p className="text-slate-500">Mode: {booking.paymentMethod}</p>
              </div>
            </div>

            {/* Boarding and Dropping points */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 grid grid-cols-2 gap-3 text-xs mb-4">
              <div>
                <span className="text-emerald-800 font-bold uppercase text-[10px] block mb-0.5">
                  ▶ Boarding Station
                </span>
                <p className="font-bold text-slate-900">{booking.boardingPoint}</p>
                <p className="text-[11px] text-slate-500">Report 20 mins before departure</p>
              </div>

              <div className="text-right border-l border-slate-200 pl-3">
                <span className="text-rose-700 font-bold uppercase text-[10px] block mb-0.5">
                  ■ Dropping Station
                </span>
                <p className="font-bold text-slate-900">{booking.droppingPoint}</p>
                <p className="text-[11px] text-slate-500">Designated Counter Stop</p>
              </div>
            </div>

            {/* Financial Due and Fare breakdown */}
            <div className="border border-slate-300 rounded-xl p-3 text-xs mb-4">
              <div className="grid grid-cols-3 gap-2 text-center pb-2 border-b border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Fare</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">৳{booking.fare}</span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-700 uppercase font-bold block">Paid Amount</span>
                  <span className="font-mono font-bold text-emerald-800 text-sm">৳{booking.paidAmount}</span>
                </div>
                <div>
                  <span className="text-[10px] text-rose-700 uppercase font-bold block">Due Balance</span>
                  <span className={`font-mono font-bold text-sm ${booking.dueAmount > 0 ? 'text-rose-700' : 'text-slate-800'}`}>
                    ৳{booking.dueAmount}
                  </span>
                </div>
              </div>

              {/* Due Alert Banner if due exists */}
              {booking.dueAmount > 0 ? (
                <div className="mt-2.5 p-2 bg-rose-50 border border-rose-300 rounded-lg flex items-center justify-between text-rose-900 font-bold">
                  <div className="flex items-center gap-1.5 text-xs">
                    <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span>DUE TO BE COLLECTED AT COUNTER:</span>
                  </div>
                  <span className="font-mono text-base text-rose-700">৳{booking.dueAmount}</span>
                </div>
              ) : (
                <div className="mt-2 text-center text-[11px] text-emerald-800 font-semibold flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Ticket Fare Paid in Full. No Due Balance.</span>
                </div>
              )}
            </div>

            {/* Bottom Barcode / QR Simulation & Signatures */}
            <div className="pt-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-12 h-12 text-slate-800" />
                <div className="space-y-0.5">
                  <div className="font-mono text-[9px] text-slate-400">VERIFIED SYSTEM E-TICKET</div>
                  <div className="h-4 w-28 bg-slate-800 rounded-xs flex items-center justify-around px-0.5">
                    <div className="w-1 h-full bg-white"></div>
                    <div className="w-0.5 h-full bg-white"></div>
                    <div className="w-2 h-full bg-white"></div>
                    <div className="w-1 h-full bg-white"></div>
                    <div className="w-0.5 h-full bg-white"></div>
                    <div className="w-1.5 h-full bg-white"></div>
                  </div>
                </div>
              </div>

              <div className="text-right space-y-1">
                <div className="h-6 border-b border-slate-400 w-28 ml-auto"></div>
                <span className="text-[10px] text-slate-400 font-mono block">Authorized Counter Seal</span>
              </div>
            </div>

            {/* Small Footer Notice */}
            <p className="text-[9px] text-slate-400 text-center mt-3 pt-2 border-t border-slate-200">
              Helpline: 01711-000000 · Keep this e-ticket during traveling · Smoking is strictly prohibited inside coach.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
