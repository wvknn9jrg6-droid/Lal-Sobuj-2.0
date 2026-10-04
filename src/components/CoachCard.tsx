import React from 'react';
import { Coach } from '../types';
import { Clock, MapPin, Layers, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';

interface CoachCardProps {
  coach: Coach;
  onOpenSeatPlan: (coach: Coach) => void;
  onEditCoach?: (coach: Coach) => void;
}

export const CoachCard: React.FC<CoachCardProps> = ({
  coach,
  onOpenSeatPlan,
  onEditCoach
}) => {
  const totalSeats = coach.seats.length;
  const availableSeats = coach.seats.filter(s => s.status === 'available').length;
  const soldSeats = coach.seats.filter(s => s.status === 'sold').length;
  const bookedSeats = coach.seats.filter(s => s.status === 'booked').length;
  const lockedSeats = coach.seats.filter(s => s.status === 'locked').length;
  const reservedSeats = coach.seats.filter(s => s.status === 'reserved').length;

  const totalDueInCoach = coach.seats.reduce((sum, s) => sum + (s.booking?.dueAmount || 0), 0);

  const getDeckSummary = () => {
    if (coach.deckType === 'double') {
      return `Double Deck (${coach.lowerDeckConfig.layout} Lower · ${coach.upperDeckConfig?.layout || '2+2'} Upper)`;
    }
    return `Single Deck (${coach.lowerDeckConfig.layout})`;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      {/* Top Header Strip */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-emerald-50/20">
        <div className="flex items-start justify-between gap-3">
          {/* Clickable Coach Number */}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => onOpenSeatPlan(coach)}
                className="font-mono text-base sm:text-lg font-black tracking-tight text-emerald-800 bg-emerald-100/90 hover:bg-emerald-600 hover:text-white px-2.5 py-1 rounded-lg border border-emerald-300 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                title="Click Coach Number to open interactive Seat Plan"
              >
                <span>{coach.coachNumber}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1 bg-white/60 text-emerald-900 rounded group-hover:bg-emerald-700 group-hover:text-white">
                  Seat Plan ↗
                </span>
              </button>

              <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {coach.coachClass}
              </span>
            </div>

            <p className="text-xs text-slate-500 font-medium mt-1 font-mono">
              {coach.regNumber} · {coach.model}
            </p>
          </div>

          {/* Fare display */}
          <div className="text-right flex-shrink-0">
            <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">Fare from</span>
            <span className="text-xl sm:text-2xl font-black text-rose-600 font-mono tracking-tight">
              ৳{coach.baseFare}
            </span>
          </div>
        </div>
      </div>

      {/* Body: Journey & Timings */}
      <div className="p-4 sm:p-5 space-y-3.5 flex-1">
        {/* Departure Time & Route Counters */}
        <div className="grid grid-cols-2 gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" /> Departure Time
            </span>
            <span className="text-sm sm:text-base font-bold text-slate-900 font-mono">
              {coach.departureTime}
            </span>
            <p className="text-[11px] text-slate-500 truncate" title={coach.startingCounter}>
              {coach.startingCounter}
            </p>
          </div>

          <div className="space-y-1 border-l border-slate-200/80 pl-3">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-600" /> Destination
            </span>
            <span className="text-sm font-bold text-emerald-800 truncate block" title={coach.destinationCounter}>
              {coach.destinationCounter.split(' ')[0]} ...
            </span>
            <p className="text-[11px] text-slate-500 truncate" title={coach.destinationCounter}>
              {coach.destinationCounter}
            </p>
          </div>
        </div>

        {/* Deck and Layout Specs */}
        <div className="flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-1.5 font-medium">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>{getDeckSummary()}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[11px] text-slate-500">Express Super Fast</span>
          </div>
        </div>

        {/* Seat Availability Bar & Counters */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-700">Seat Occupancy</span>
            <span className="font-mono text-xs">
              <strong className="text-emerald-700">{availableSeats}</strong> / {totalSeats} Available
            </span>
          </div>

          {/* Visual progress bar */}
          <div className="w-full h-2.5 rounded-full bg-slate-100 flex overflow-hidden border border-slate-200/60">
            {soldSeats > 0 && (
              <div
                style={{ width: `${(soldSeats / totalSeats) * 100}%` }}
                className="bg-rose-600"
                title={`Sold: ${soldSeats}`}
              />
            )}
            {bookedSeats > 0 && (
              <div
                style={{ width: `${(bookedSeats / totalSeats) * 100}%` }}
                className="bg-blue-600"
                title={`Booked: ${bookedSeats}`}
              />
            )}
            {lockedSeats > 0 && (
              <div
                style={{ width: `${(lockedSeats / totalSeats) * 100}%` }}
                className="bg-amber-500"
                title={`Locked: ${lockedSeats}`}
              />
            )}
            {reservedSeats > 0 && (
              <div
                style={{ width: `${(reservedSeats / totalSeats) * 100}%` }}
                className="bg-purple-600"
                title={`Reserved: ${reservedSeats}`}
              />
            )}
            {availableSeats > 0 && (
              <div
                style={{ width: `${(availableSeats / totalSeats) * 100}%` }}
                className="bg-emerald-500"
                title={`Available: ${availableSeats}`}
              />
            )}
          </div>

          {/* Seat breakdown stats row */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-mono">
            <span className="flex items-center gap-1 text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> {availableSeats} Empty
            </span>
            <span className="flex items-center gap-1 text-rose-700">
              <span className="w-2 h-2 rounded-full bg-rose-600"></span> {soldSeats} Sold
            </span>
            <span className="flex items-center gap-1 text-blue-700">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span> {bookedSeats} Booked
            </span>
            {(lockedSeats > 0 || reservedSeats > 0) && (
              <span className="flex items-center gap-1 text-amber-700">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> {lockedSeats + reservedSeats} Lock/VIP
              </span>
            )}
          </div>

          {/* Coach Due Notification */}
          {totalDueInCoach > 0 && (
            <div className="mt-2.5 py-1 px-2 rounded-lg bg-rose-50 border border-rose-200/80 flex items-center justify-between text-xs text-rose-800">
              <span className="flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                Uncollected Coach Due:
              </span>
              <span className="font-bold font-mono">৳{totalDueInCoach}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="p-4 sm:p-5 pt-0 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onOpenSeatPlan(coach)}
          className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-2.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer group-hover:bg-emerald-600"
        >
          <span>View Seat Plan & Book</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>

        {onEditCoach && (
          <button
            type="button"
            onClick={() => onEditCoach(coach)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-xs font-medium transition-colors"
            title="Edit Coach Settings"
          >
            Config
          </button>
        )}
      </div>
    </div>
  );
};
