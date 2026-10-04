import React, { useState, useEffect } from 'react';
import { Coach, PassengerBooking, RouteItem } from '../types';
import { getStoredRoutes, bookSeatsOnCoach } from '../services/storageService';
import { X, Check, DollarSign, User, Phone, MapPin, Ticket, ShieldCheck, AlertCircle } from 'lucide-react';

interface BookingFormModalProps {
  coach: Coach;
  selectedSeatNumbers: string[];
  onClose: () => void;
  onSuccess: (bookings: PassengerBooking[]) => void;
}

export const BookingFormModal: React.FC<BookingFormModalProps> = ({
  coach,
  selectedSeatNumbers,
  onClose,
  onSuccess
}) => {
  const [passengerName, setPassengerName] = useState('');
  const [phone, setPhone] = useState('01');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [boardingPoint, setBoardingPoint] = useState(coach.startingCounter);
  const [droppingPoint, setDroppingPoint] = useState(coach.destinationCounter);
  const [status, setStatus] = useState<'sell' | 'book' | 'lock' | 'reservation'>('sell');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'bKash' | 'Nagad' | 'Card' | 'Due'>('Cash');
  const [counterName, setCounterName] = useState('Sayedabad Counter 01');
  const [notes, setNotes] = useState('');
  const [discount, setDiscount] = useState<number>(0);

  // Calculate seat fares
  const selectedSeats = coach.seats.filter(s => selectedSeatNumbers.includes(s.seatNumber));
  const baseSubtotal = selectedSeats.reduce((sum, s) => sum + s.fare, 0);
  const totalFare = Math.max(0, baseSubtotal - discount);

  // Paid and due state
  const [amountPaid, setAmountPaid] = useState<number>(totalFare);

  useEffect(() => {
    // Default amount paid based on status
    if (status === 'sell') {
      setAmountPaid(totalFare);
      if (paymentMethod === 'Due') setPaymentMethod('Cash');
    } else if (status === 'lock' || status === 'reservation') {
      setAmountPaid(0);
      setPaymentMethod('Due');
    } else if (status === 'book') {
      // Advance partial payment default (e.g. 50%)
      setAmountPaid(Math.round(totalFare / 2));
      setPaymentMethod('bKash');
    }
  }, [status, totalFare]);

  // Retrieve route stops
  const routes = getStoredRoutes();
  const currentRoute = routes.find(r => r.id === coach.routeId || r.name === coach.routeName);

  const boardingOptions = currentRoute?.boardingPoints || [
    'Sayedabad Counter 01',
    'Arambagh Counter',
    'Malibagh Counter',
    'Abdullahpur Counter',
    'Chittagong Road Counter'
  ];

  const droppingOptions = currentRoute?.droppingPoints || [
    'Lakshmipur Central Bus Terminal',
    'Jhumur Cinema Hall Counter',
    'Sonapur Zero Point Counter',
    'Maijdee Court Counter',
    'Dampara Central Bus Station'
  ];

  const dueAmount = Math.max(0, totalFare - amountPaid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!passengerName.trim()) {
      alert('Please enter passenger name');
      return;
    }

    if (!phone.trim() || phone.length < 9) {
      alert('Please enter a valid phone number (e.g. 01712345678)');
      return;
    }

    const createdBookings = bookSeatsOnCoach(
      coach.id,
      selectedSeatNumbers,
      {
        passengerName: passengerName.trim(),
        phone: phone.trim(),
        gender,
        boardingPoint,
        droppingPoint,
        paidAmount: amountPaid,
        dueAmount,
        counter: counterName
      },
      status,
      paymentMethod,
      amountPaid,
      notes
    );

    onSuccess(createdBookings);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-emerald-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-800 flex items-center justify-center border border-emerald-700">
              <Ticket className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                Passenger Booking Form · <span className="font-mono text-emerald-300">{coach.coachNumber}</span>
              </h2>
              <p className="text-xs text-emerald-200/80">
                {coach.routeName} · Departure: {coach.departureTime}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-emerald-200 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Seats Banner */}
        <div className="bg-emerald-50/80 border-b border-emerald-100 p-3 px-5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
              Selected Seat(s):
            </span>
            {selectedSeats.map(s => (
              <span
                key={s.id}
                className="bg-emerald-600 text-white font-mono font-bold text-xs px-2.5 py-0.5 rounded-lg shadow-xs"
              >
                {s.seatNumber} ({s.deck === 'upper' ? 'Upper' : 'Lower'})
              </span>
            ))}
          </div>

          <div className="text-xs font-mono font-bold text-slate-700">
            Total Seats: <span className="text-emerald-800">{selectedSeatNumbers.length}</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* Status Selection Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Booking Status / Operation Mode <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setStatus('sell')}
                className={`py-2 px-3 rounded-xl font-bold text-xs border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  status === 'sell'
                    ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>🔴 SELL</span>
                <span className="text-[10px] opacity-80">(Confirmed)</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('book')}
                className={`py-2 px-3 rounded-xl font-bold text-xs border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  status === 'book'
                    ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>🔵 BOOK</span>
                <span className="text-[10px] opacity-80">(Advance/Due)</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('lock')}
                className={`py-2 px-3 rounded-xl font-bold text-xs border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  status === 'lock'
                    ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>🟡 LOCK</span>
                <span className="text-[10px] opacity-80">(Hold)</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('reservation')}
                className={`py-2 px-3 rounded-xl font-bold text-xs border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  status === 'reservation'
                    ? 'bg-purple-600 text-white border-purple-700 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>🟣 RESERVATION</span>
                <span className="text-[10px] opacity-80">(VIP)</span>
              </button>
            </div>
          </div>

          {/* Passenger Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Passenger Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Md. Tanvir Ahmed"
                  value={passengerName}
                  onChange={e => setPassengerName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-emerald-500 focus:border-emerald-500 text-slate-900 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number (Mobile) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  required
                  placeholder="017XXXXXXXX"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-emerald-500 focus:border-emerald-500 font-mono text-slate-900 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Gender & Counter */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Passenger Gender
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Male', 'Female', 'Other'] as const).map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`py-2 px-2 rounded-xl font-medium text-xs border transition-colors cursor-pointer ${
                      gender === g
                        ? 'bg-slate-900 text-white border-slate-900 font-bold'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Issuing Counter / Operator
              </label>
              <input
                type="text"
                value={counterName}
                onChange={e => setCounterName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-emerald-500 text-slate-800"
              />
            </div>
          </div>

          {/* Boarding and Dropping Points */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Boarding Point (Counter) <span className="text-rose-500">*</span>
              </label>
              <select
                value={boardingPoint}
                onChange={e => setBoardingPoint(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-emerald-500 text-slate-900 bg-white"
              >
                {boardingOptions.map(opt => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dropping Point (Counter) <span className="text-rose-500">*</span>
              </label>
              <select
                value={droppingPoint}
                onChange={e => setDroppingPoint(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-emerald-500 text-slate-900 bg-white"
              >
                {droppingOptions.map(opt => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Fare & Due Calculation Card */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Fare, Payment & Due Breakdown
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Seat Base Fare:</span>
                <span className="font-bold text-slate-800 font-mono text-sm">৳{baseSubtotal}</span>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Special Discount:</span>
                <input
                  type="number"
                  min="0"
                  max={baseSubtotal}
                  value={discount}
                  onChange={e => setDiscount(Number(e.target.value) || 0)}
                  className="w-full font-bold font-mono text-slate-800 border-b border-slate-200 focus:outline-none"
                />
              </div>

              <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                <span className="text-emerald-800 block text-[11px] font-semibold">Total Net Fare:</span>
                <span className="font-extrabold text-emerald-800 font-mono text-base">৳{totalFare}</span>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 block text-[11px]">Amount Paid:</span>
                  <button
                    type="button"
                    onClick={() => setAmountPaid(totalFare)}
                    className="text-[10px] text-emerald-700 font-bold hover:underline"
                  >
                    Full
                  </button>
                </div>
                <input
                  type="number"
                  min="0"
                  max={totalFare}
                  value={amountPaid}
                  onChange={e => setAmountPaid(Number(e.target.value) || 0)}
                  className="w-full font-bold font-mono text-slate-900 border-b border-slate-200 focus:outline-none text-base"
                />
              </div>
            </div>

            {/* Clear Due Highlight */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700">Calculated Outstanding Due:</span>
                {dueAmount > 0 ? (
                  <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-lg border border-rose-300 font-mono text-sm">
                    ৳{dueAmount} DUE
                  </span>
                ) : (
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-lg border border-emerald-300 font-mono text-xs flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-700" />
                    PAID IN FULL (৳0 DUE)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Payment Mode:</span>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as any)}
                  className="px-2 py-1 rounded-lg border border-slate-300 bg-white font-medium text-xs text-slate-800"
                >
                  <option value="Cash">Cash</option>
                  <option value="bKash">bKash</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Card">Card</option>
                  <option value="Due">Due / Credit</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notes / Remarks */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Counter Notes / Passenger Remarks (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Passenger luggage 2 large bags, reporting 15 mins prior"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-emerald-500 text-slate-800"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs cursor-pointer transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 px-6 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md cursor-pointer transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Confirm & Issue ({status.toUpperCase()})</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
