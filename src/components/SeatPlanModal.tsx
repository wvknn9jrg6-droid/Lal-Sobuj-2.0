import React, { useState } from 'react';
import { Coach, DeckConfig, PassengerBooking, Seat, SeatStatus } from '../types';
import { X, Layers, Users, ShieldAlert, ArrowRight, UserCheck, Lock, Bookmark, Eye, Check } from 'lucide-react';

interface SeatPlanModalProps {
  coach: Coach;
  onClose: () => void;
  onOpenBookingForm: (coach: Coach, selectedSeatNumbers: string[]) => void;
  onViewSeatDetails: (coach: Coach, seat: Seat) => void;
}

export const SeatPlanModal: React.FC<SeatPlanModalProps> = ({
  coach,
  onClose,
  onOpenBookingForm,
  onViewSeatDetails
}) => {
  const [activeDeck, setActiveDeck] = useState<'lower' | 'upper'>('lower');
  const [selectedSeatNumbers, setSelectedSeatNumbers] = useState<string[]>([]);

  // Filter seats for current active deck
  const currentDeckSeats = coach.seats.filter(s => s.deck === activeDeck);
  const currentDeckConfig: DeckConfig =
    activeDeck === 'lower' ? coach.lowerDeckConfig : (coach.upperDeckConfig || coach.lowerDeckConfig);

  // Group seats by row
  const rowNumbers = Array.from(new Set(currentDeckSeats.map(s => s.row))).sort((a, b) => a - b);

  const toggleSelectSeat = (seat: Seat) => {
    if (seat.status !== 'available') {
      // Seat already occupied/locked/booked -> view details modal
      onViewSeatDetails(coach, seat);
      return;
    }

    if (selectedSeatNumbers.includes(seat.seatNumber)) {
      setSelectedSeatNumbers(prev => prev.filter(num => num !== seat.seatNumber));
    } else {
      setSelectedSeatNumbers(prev => [...prev, seat.seatNumber]);
    }
  };

  const handleProceedBooking = () => {
    if (selectedSeatNumbers.length === 0) return;
    onOpenBookingForm(coach, selectedSeatNumbers);
  };

  // Helper to render seat styling based on status
  const getSeatStyle = (seat: Seat) => {
    const isSelected = selectedSeatNumbers.includes(seat.seatNumber);

    if (isSelected) {
      return 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-400 scale-[1.03]';
    }

    switch (seat.status) {
      case 'sold':
        return 'bg-rose-600 text-white border-rose-700 hover:bg-rose-700';
      case 'booked':
        return 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700';
      case 'locked':
        return 'bg-amber-500 text-white border-amber-600 hover:bg-amber-600';
      case 'reserved':
        return 'bg-purple-600 text-white border-purple-700 hover:bg-purple-700';
      case 'available':
      default:
        return 'bg-white text-slate-800 border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/60';
    }
  };

  const selectedSeatsData = coach.seats.filter(s => selectedSeatNumbers.includes(s.seatNumber));
  const selectedTotalFare = selectedSeatsData.reduce((sum, s) => sum + s.fare, 0);

  const lowerSeatsCount = coach.seats.filter(s => s.deck === 'lower').length;
  const lowerAvailCount = coach.seats.filter(s => s.deck === 'lower' && s.status === 'available').length;
  const upperSeatsCount = coach.seats.filter(s => s.deck === 'upper').length;
  const upperAvailCount = coach.seats.filter(s => s.deck === 'upper' && s.status === 'available').length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xl sm:text-2xl font-black text-emerald-400">
                {coach.coachNumber}
              </span>
              <span className="bg-slate-800 text-slate-200 text-xs font-semibold px-2 py-0.5 rounded border border-slate-700">
                {coach.routeName}
              </span>
              <span className="bg-rose-950 text-rose-300 text-xs font-semibold px-2 py-0.5 rounded border border-rose-800 font-mono">
                {coach.departureTime}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {coach.model} · {coach.startingCounter} → {coach.destinationCounter}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Close Seat Plan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Deck Switcher Tabs if Double Deck */}
        {coach.deckType === 'double' && (
          <div className="bg-slate-100 p-2 sm:px-6 border-b border-slate-200 flex items-center justify-center gap-3">
            <button
              onClick={() => setActiveDeck('lower')}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                activeDeck === 'lower'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Lower Deck ({coach.lowerDeckConfig.layout})</span>
              <span className="ml-1 text-[11px] font-mono opacity-90">
                {lowerAvailCount}/{lowerSeatsCount} Free
              </span>
            </button>

            <button
              onClick={() => setActiveDeck('upper')}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                activeDeck === 'upper'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Upper Deck ({coach.upperDeckConfig?.layout || '1+1'})</span>
              <span className="ml-1 text-[11px] font-mono opacity-90">
                {upperAvailCount}/{upperSeatsCount} Free
              </span>
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50/50">
          {/* Seat Layout View (Bus Frame) */}
          <div className="lg:col-span-8 flex flex-col items-center">
            {/* Bus Exterior Container */}
            <div className="w-full max-w-md bg-white rounded-3xl border-2 border-slate-300 shadow-sm p-4 sm:p-6 relative">
              {/* Front Cabin Windshield & Driver Area */}
              <div className="pb-4 mb-4 border-b-2 border-dashed border-slate-200 flex items-center justify-between px-2">
                {/* Passenger Door Entry (Left side in Bangladesh) */}
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>Passenger Entry Door</span>
                </div>

                {/* Driver Cabin (Right-Hand Drive) */}
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                  <span>Driver</span>
                  <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center font-mono font-bold text-xs shadow-inner">
                    ⎈
                  </div>
                </div>
              </div>

              {/* Rows of Seats */}
              <div className="space-y-2.5">
                {rowNumbers.map(rowIdx => {
                  const rowSeats = currentDeckSeats.filter(s => s.row === rowIdx);
                  const isBackRow =
                    currentDeckConfig.hasBackRow && rowIdx === Math.max(...rowNumbers);

                  if (isBackRow) {
                    // Continuous 5 seats across rear
                    return (
                      <div key={rowIdx} className="pt-2">
                        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                          {rowSeats.map(seat => renderSeatButton(seat))}
                        </div>
                      </div>
                    );
                  }

                  // Standard layout patterns
                  return (
                    <div key={rowIdx} className="flex items-center justify-between gap-1 sm:gap-2">
                      {renderRowSeats(rowSeats, currentDeckConfig.layout)}
                    </div>
                  );
                })}
              </div>

              {/* Rear Engine / Luggage indicator */}
              <div className="mt-5 pt-3 border-t border-slate-200 text-center">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">
                  —— Rear Engine & Luggage Cabin ——
                </span>
              </div>
            </div>

            {/* Color Legend */}
            <div className="w-full max-w-md mt-4 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 text-center">
                Seat Color Codes & Status
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-lg bg-white border-2 border-slate-300 mb-1"></div>
                  <span className="text-[11px] text-slate-600 font-medium">Available</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-xs mb-1">
                    ✓
                  </div>
                  <span className="text-[11px] text-emerald-700 font-medium">Selected</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-lg bg-rose-600 text-white font-bold flex items-center justify-center text-[10px] mb-1">
                    ৳
                  </div>
                  <span className="text-[11px] text-rose-700 font-medium">Sold</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] mb-1">
                    B
                  </div>
                  <span className="text-[11px] text-blue-700 font-medium">Booked</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-lg bg-amber-500 text-white font-bold flex items-center justify-center text-[10px] mb-1">
                    🔒
                  </div>
                  <span className="text-[11px] text-amber-700 font-medium">Locked</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-lg bg-purple-600 text-white font-bold flex items-center justify-center text-[10px] mb-1">
                    ★
                  </div>
                  <span className="text-[11px] text-purple-700 font-medium">Reserved</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Selected Seats & Booking Summary */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                Selected Seats ({selectedSeatNumbers.length})
              </h3>

              {selectedSeatNumbers.length === 0 ? (
                <div className="text-center py-6 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-xs text-slate-500 font-medium">
                    Click any available seat on the plan to select it.
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Click booked/sold seats to view passenger info or update dues.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {selectedSeatsData.map(seat => (
                      <div
                        key={seat.id}
                        className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 font-mono font-bold text-xs px-2.5 py-1 rounded-lg"
                      >
                        <span>{seat.seatNumber}</span>
                        <span className="text-slate-400">·</span>
                        <span>৳{seat.fare}</span>
                        <button
                          onClick={() => toggleSelectSeat(seat)}
                          className="ml-1 text-slate-400 hover:text-rose-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Seats Count:</span>
                      <span className="font-mono font-semibold">{selectedSeatNumbers.length} seat(s)</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Coach Fare:</span>
                      <span className="font-mono font-semibold">৳{coach.baseFare} / seat</span>
                    </div>
                    <div className="flex justify-between text-slate-900 font-bold text-sm pt-2 border-t border-slate-100">
                      <span>Total Fare:</span>
                      <span className="font-mono text-emerald-700 text-base">৳{selectedTotalFare}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleProceedBooking}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <span>Proceed to Book / Issue</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Coach Quick Specs Box */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3 text-xs">
              <span className="font-bold text-slate-700 block uppercase tracking-wider text-[11px]">
                Coach Specification
              </span>
              <div className="space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span className="text-slate-400">Registration:</span>
                  <span className="font-mono font-medium text-slate-900">{coach.regNumber}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="text-slate-400">Model:</span>
                  <span className="font-medium text-slate-900">{coach.model}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="text-slate-400">Departure:</span>
                  <span className="font-mono font-bold text-rose-600">{coach.departureTime}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="text-slate-400">Boarding:</span>
                  <span className="font-medium text-slate-900 text-right">{coach.startingCounter}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="text-slate-400">Dropping:</span>
                  <span className="font-medium text-slate-900 text-right">{coach.destinationCounter}</span>
                </div>
              </div>

              {coach.amenities && coach.amenities.length > 0 && (
                <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1">
                  {coach.amenities.map(a => (
                    <span key={a} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                      {a}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Helper to render an individual seat button
  function renderSeatButton(seat?: Seat) {
    if (!seat) {
      return <div className="w-10 h-10 sm:w-11 sm:h-11"></div>;
    }

    const isSelected = selectedSeatNumbers.includes(seat.seatNumber);
    const hasDue = (seat.booking?.dueAmount || 0) > 0;

    return (
      <button
        key={seat.id}
        type="button"
        onClick={() => toggleSelectSeat(seat)}
        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl border flex flex-col items-center justify-center font-mono font-bold text-xs relative transition-all duration-150 cursor-pointer ${getSeatStyle(
          seat
        )}`}
        title={`Seat ${seat.seatNumber} - ${seat.status.toUpperCase()} (৳${seat.fare}) ${
          seat.booking ? `\nPassenger: ${seat.booking.passengerName}\nPhone: ${seat.booking.phone}\nDue: ৳${seat.booking.dueAmount}` : ''
        }`}
      >
        <span>{seat.seatNumber}</span>

        {/* Small badge / indicator */}
        {seat.status === 'available' && !isSelected && (
          <span className="text-[8px] font-normal text-slate-400 leading-none">৳{seat.fare}</span>
        )}

        {isSelected && (
          <span className="text-[8px] font-bold text-white leading-none">✓</span>
        )}

        {seat.status === 'locked' && (
          <Lock className="w-2.5 h-2.5 absolute top-1 right-1 text-white" />
        )}

        {seat.status === 'reserved' && (
          <Bookmark className="w-2.5 h-2.5 absolute top-1 right-1 text-white" />
        )}

        {/* Due indicator dot */}
        {hasDue && (
          <span
            className="w-2 h-2 rounded-full bg-amber-300 border border-slate-900 absolute top-0.5 left-0.5"
            title={`Due: ৳${seat.booking?.dueAmount}`}
          ></span>
        )}

        {/* Female passenger indicator */}
        {seat.booking?.gender === 'Female' && (
          <span
            className="w-1.5 h-1.5 rounded-full bg-pink-300 absolute bottom-0.5 right-0.5"
            title="Female Passenger"
          ></span>
        )}
      </button>
    );
  }

  // Helper to render rows matching layout
  function renderRowSeats(rowSeats: Seat[], layout: DeckConfig['layout']) {
    if (layout === '1+1') {
      // Left 1, Aisle, Right 1
      const leftSeat = rowSeats[0];
      const rightSeat = rowSeats[1];
      return (
        <>
          <div className="w-1/3 flex justify-start">{renderSeatButton(leftSeat)}</div>
          <div className="w-1/3 flex items-center justify-center text-[10px] text-slate-300 font-mono">
            AISLE
          </div>
          <div className="w-1/3 flex justify-end">{renderSeatButton(rightSeat)}</div>
        </>
      );
    }

    if (layout === '2+2') {
      // Left 2 (col 0, 1), Aisle, Right 2 (col 2, 3)
      const left1 = rowSeats.find(s => s.col === 0);
      const left2 = rowSeats.find(s => s.col === 1);
      const right1 = rowSeats.find(s => s.col === 2);
      const right2 = rowSeats.find(s => s.col === 3);
      return (
        <>
          <div className="flex items-center gap-1 sm:gap-2">
            {renderSeatButton(left1)}
            {renderSeatButton(left2)}
          </div>
          <div className="flex-1 flex items-center justify-center text-[9px] text-slate-300 font-mono tracking-wider">
            AISLE
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            {renderSeatButton(right1)}
            {renderSeatButton(right2)}
          </div>
        </>
      );
    }

    if (layout === '1+2') {
      // Left 1 (col 0), Aisle, Right 2 (col 1, 2)
      const left1 = rowSeats.find(s => s.col === 0);
      const right1 = rowSeats.find(s => s.col === 1);
      const right2 = rowSeats.find(s => s.col === 2);
      return (
        <>
          <div className="flex items-center">{renderSeatButton(left1)}</div>
          <div className="flex-1 flex items-center justify-center text-[9px] text-slate-300 font-mono tracking-wider">
            AISLE
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            {renderSeatButton(right1)}
            {renderSeatButton(right2)}
          </div>
        </>
      );
    }

    if (layout === '2+1') {
      // Left 2 (col 0, 1), Aisle, Right 1 (col 2)
      const left1 = rowSeats.find(s => s.col === 0);
      const left2 = rowSeats.find(s => s.col === 1);
      const right1 = rowSeats.find(s => s.col === 2);
      return (
        <>
          <div className="flex items-center gap-1 sm:gap-2">
            {renderSeatButton(left1)}
            {renderSeatButton(left2)}
          </div>
          <div className="flex-1 flex items-center justify-center text-[9px] text-slate-300 font-mono tracking-wider">
            AISLE
          </div>
          <div className="flex items-center">{renderSeatButton(right1)}</div>
        </>
      );
    }

    return null;
  }
};
