import React, { useState } from 'react';
import { Coach, DeckConfig, DeckType, CoachClass, RouteItem, SeatLayoutType } from '../types';
import { getStoredRoutes, buildCoachSeats, saveCoach } from '../services/storageService';
import { X, Bus, Layers, Check, Settings2, Plus, AlertCircle } from 'lucide-react';

interface CoachFormModalProps {
  initialCoach?: Coach | null;
  onClose: () => void;
  onSaved: (coach: Coach) => void;
}

export const CoachFormModal: React.FC<CoachFormModalProps> = ({
  initialCoach,
  onClose,
  onSaved
}) => {
  const routes = getStoredRoutes();

  // Basic info state
  const [coachNumber, setCoachNumber] = useState(initialCoach?.coachNumber || 'LS-');
  const [regNumber, setRegNumber] = useState(initialCoach?.regNumber || 'DHAKA METRO-BA ');
  const [model, setModel] = useState(initialCoach?.model || 'Hyundai Universe Express Noble');
  const [routeId, setRouteId] = useState(initialCoach?.routeId || routes[0]?.id || 'route_dhaka_lakshmipur');
  const [coachClass, setCoachClass] = useState<CoachClass>(initialCoach?.coachClass || 'Executive AC');
  const [departureTime, setDepartureTime] = useState(initialCoach?.departureTime || '08:30 AM');
  const [departureDate, setDepartureDate] = useState(
    initialCoach?.departureDate || new Date().toISOString().split('T')[0]
  );
  const [baseFare, setBaseFare] = useState<number>(initialCoach?.baseFare || 750);
  const [startingCounter, setStartingCounter] = useState(
    initialCoach?.startingCounter || 'Sayedabad Counter 01'
  );
  const [destinationCounter, setDestinationCounter] = useState(
    initialCoach?.destinationCounter || 'Lakshmipur Central Bus Terminal'
  );
  const [isActive, setIsActive] = useState<boolean>(initialCoach ? initialCoach.isActive : true);

  // Deck Mode
  const [deckType, setDeckType] = useState<DeckType>(initialCoach?.deckType || 'single');

  // Lower Deck Config
  const [lowerLayout, setLowerLayout] = useState<SeatLayoutType>(
    initialCoach?.lowerDeckConfig.layout || '2+2'
  );
  const [lowerRows, setLowerRows] = useState<number>(initialCoach?.lowerDeckConfig.rows || 10);
  const [lowerHasBackRow, setLowerHasBackRow] = useState<boolean>(
    initialCoach?.lowerDeckConfig.hasBackRow ?? true
  );

  // Upper Deck Config (for Double Deck)
  const [upperLayout, setUpperLayout] = useState<SeatLayoutType>(
    initialCoach?.upperDeckConfig?.layout || '1+1'
  );
  const [upperRows, setUpperRows] = useState<number>(initialCoach?.upperDeckConfig?.rows || 8);
  const [upperHasBackRow, setUpperHasBackRow] = useState<boolean>(
    initialCoach?.upperDeckConfig?.hasBackRow ?? false
  );

  // Amenities
  const [amenities, setAmenities] = useState<string[]>(
    initialCoach?.amenities || [
      'Air Conditioned',
      'Mineral Water',
      'High Speed WiFi',
      'USB Phone Charging',
      'CCTV Security'
    ]
  );

  const selectedRoute = routes.find(r => r.id === routeId) || routes[0];

  const handleRouteChange = (newRouteId: string) => {
    setRouteId(newRouteId);
    const r = routes.find(item => item.id === newRouteId);
    if (r) {
      if (r.boardingPoints.length > 0) setStartingCounter(r.boardingPoints[0]);
      if (r.droppingPoints.length > 0) setDestinationCounter(r.droppingPoints[0]);
      if (!initialCoach) setBaseFare(r.defaultFare);
    }
  };

  const calculateTotalSeats = () => {
    let lowerCount = 0;
    const perRowLower = lowerLayout === '1+1' ? 2 : lowerLayout === '2+2' ? 4 : 3;
    lowerCount = lowerRows * perRowLower;
    if (lowerHasBackRow) {
      lowerCount = (lowerRows - 1) * perRowLower + 5;
    }

    if (deckType === 'single') return lowerCount;

    let upperCount = 0;
    const perRowUpper = upperLayout === '1+1' ? 2 : upperLayout === '2+2' ? 4 : 3;
    upperCount = upperRows * perRowUpper;
    if (upperHasBackRow) {
      upperCount = (upperRows - 1) * perRowUpper + 5;
    }
    return lowerCount + upperCount;
  };

  const handleToggleAmenity = (amenity: string) => {
    if (amenities.includes(amenity)) {
      setAmenities(amenities.filter(a => a !== amenity));
    } else {
      setAmenities([...amenities, amenity]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!coachNumber.trim()) {
      alert('Please enter a coach number (e.g. LS-101)');
      return;
    }

    const lowerConfig: DeckConfig = {
      deckName: deckType === 'double' ? 'Lower Deck' : 'Main Deck',
      rows: lowerRows,
      layout: lowerLayout,
      hasBackRow: lowerHasBackRow,
      deckType: 'lower'
    };

    let upperConfig: DeckConfig | undefined = undefined;
    if (deckType === 'double') {
      upperConfig = {
        deckName: 'Upper Deck',
        rows: upperRows,
        layout: upperLayout,
        hasBackRow: upperHasBackRow,
        deckType: 'upper'
      };
    }

    // Preserve existing booked seats if editing with same layout, else generate seats
    let seats = initialCoach?.seats || [];
    const layoutChanged =
      !initialCoach ||
      initialCoach.deckType !== deckType ||
      initialCoach.lowerDeckConfig.layout !== lowerLayout ||
      initialCoach.lowerDeckConfig.rows !== lowerRows ||
      (deckType === 'double' &&
        (initialCoach.upperDeckConfig?.layout !== upperLayout ||
          initialCoach.upperDeckConfig?.rows !== upperRows));

    if (layoutChanged) {
      seats = buildCoachSeats(deckType, baseFare, lowerConfig, upperConfig);
    } else {
      // Update fare if changed
      seats = seats.map(s => ({
        ...s,
        fare: s.deck === 'upper' ? Math.round(baseFare * 1.15) : baseFare
      }));
    }

    const coachData: Coach = {
      id: initialCoach?.id || `coach_${Date.now()}`,
      coachNumber: coachNumber.trim(),
      regNumber: regNumber.trim(),
      model: model.trim(),
      routeId: selectedRoute.id,
      routeName: selectedRoute.name,
      departureTime: departureTime.trim(),
      departureDate,
      startingCounter,
      destinationCounter,
      deckType,
      coachClass,
      baseFare,
      lowerDeckConfig: lowerConfig,
      upperDeckConfig: upperConfig,
      seats,
      isActive,
      amenities
    };

    saveCoach(coachData);
    onSaved(coachData);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center border border-emerald-600">
              <Bus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                {initialCoach ? 'Edit Coach & Seat Configuration' : 'Create New Lal Sobuj Coach'}
              </h2>
              <p className="text-xs text-slate-400">
                Configure routes, decks (single/double), and seat arrangements (1+1, 2+2, 1+2, 2+1)
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {/* Section 1: Basic Identifiers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                Coach Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. LS-101"
                value={coachNumber}
                onChange={e => setCoachNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:outline-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                Bus Reg Number
              </label>
              <input
                type="text"
                placeholder="e.g. DHAKA METRO-BA 14-8822"
                value={regNumber}
                onChange={e => setRegNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-slate-900 focus:outline-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                Coach Model
              </label>
              <select
                value={model}
                onChange={e => setModel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 bg-white focus:outline-emerald-500"
              >
                <option value="Hyundai Universe Express Noble">Hyundai Universe Express Noble</option>
                <option value="Scania K410IB Multi-Axle">Scania K410IB Multi-Axle</option>
                <option value="Volvo B11R Double Deck Luxury">Volvo B11R Double Deck Luxury</option>
                <option value="MAN Double Decker Sleeper Suite">MAN Double Decker Sleeper Suite</option>
                <option value="Hino 1J Plus Express">Hino 1J Plus Express</option>
                <option value="Mercedes-Benz Travego">Mercedes-Benz Travego</option>
              </select>
            </div>
          </div>

          {/* Section 2: Route & Counters */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Route & Departure Schedule
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assigned Route <span className="text-rose-500">*</span>
                </label>
                <select
                  value={routeId}
                  onChange={e => handleRouteChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium text-slate-900 focus:outline-emerald-500"
                >
                  {routes.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Coach Class
                </label>
                <select
                  value={coachClass}
                  onChange={e => setCoachClass(e.target.value as CoachClass)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium text-slate-900 focus:outline-emerald-500"
                >
                  <option value="Executive AC">Executive AC</option>
                  <option value="Sleeper Suite AC">Sleeper Suite AC</option>
                  <option value="Business Class AC">Business Class AC</option>
                  <option value="Economy Non-AC">Economy Non-AC</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Base Ticket Fare (৳) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="100"
                  step="50"
                  value={baseFare}
                  onChange={e => setBaseFare(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:outline-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Departure Time
                </label>
                <input
                  type="text"
                  placeholder="e.g. 07:30 AM"
                  value={departureTime}
                  onChange={e => setDepartureTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Starting Counter
                </label>
                <select
                  value={startingCounter}
                  onChange={e => setStartingCounter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900"
                >
                  {selectedRoute.boardingPoints.map(p => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Destination Counter
                </label>
                <select
                  value={destinationCounter}
                  onChange={e => setDestinationCounter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900"
                >
                  {selectedRoute.droppingPoints.map(p => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: DECK & SEAT CONFIGURATION */}
          <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-700" />
                  Deck Architecture & Seat Layout Configuration
                </h3>
                <p className="text-[11px] text-slate-500">
                  Select single or double deck and choose seat arrangements (1+1, 2+2, 1+2, 2+1)
                </p>
              </div>

              {/* Total Seats Pill */}
              <div className="bg-emerald-700 text-white font-mono font-bold text-xs px-3 py-1 rounded-xl shadow-xs">
                Total: {calculateTotalSeats()} Seats
              </div>
            </div>

            {/* Deck Selector: Single Deck vs. Double Deck */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeckType('single')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  deckType === 'single'
                    ? 'bg-white border-emerald-600 shadow-sm ring-2 ring-emerald-500/20'
                    : 'bg-slate-50 border-slate-200 hover:bg-white text-slate-600'
                }`}
              >
                <div className="font-bold text-slate-900 flex items-center justify-between">
                  <span>Single Deck Coach</span>
                  {deckType === 'single' && <Check className="w-4 h-4 text-emerald-600" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Single level cabin with custom row and aisle setup
                </p>
              </button>

              <button
                type="button"
                onClick={() => setDeckType('double')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  deckType === 'double'
                    ? 'bg-white border-emerald-600 shadow-sm ring-2 ring-emerald-500/20'
                    : 'bg-slate-50 border-slate-200 hover:bg-white text-slate-600'
                }`}
              >
                <div className="font-bold text-slate-900 flex items-center justify-between">
                  <span>Double Deck Coach</span>
                  {deckType === 'double' && <Check className="w-4 h-4 text-emerald-600" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Two levels: Lower Deck & Upper Sleeper/Executive Deck
                </p>
              </button>
            </div>

            {/* Lower / Main Deck Settings */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                {deckType === 'double' ? 'Lower Deck Configuration' : 'Main Deck Configuration'}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Seat Pattern Layout
                  </label>
                  <select
                    value={lowerLayout}
                    onChange={e => setLowerLayout(e.target.value as SeatLayoutType)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 bg-white"
                  >
                    <option value="2+2">2+2 (Standard Express - 4 seats/row)</option>
                    <option value="1+1">1+1 (Luxury Recliner/Sleeper - 2 seats/row)</option>
                    <option value="1+2">1+2 (Business Class - 3 seats/row)</option>
                    <option value="2+1">2+1 (Executive Comfort - 3 seats/row)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Number of Rows
                  </label>
                  <input
                    type="number"
                    min="4"
                    max="14"
                    value={lowerRows}
                    onChange={e => setLowerRows(Number(e.target.value) || 4)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-slate-900"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={lowerHasBackRow}
                      onChange={e => setLowerHasBackRow(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-medium text-slate-700">
                      Include 5-Seat Continuous Back Row
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Upper Deck Settings if Double Deck */}
            {deckType === 'double' && (
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                  Upper Deck Configuration
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Upper Deck Layout
                    </label>
                    <select
                      value={upperLayout}
                      onChange={e => setUpperLayout(e.target.value as SeatLayoutType)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 bg-white"
                    >
                      <option value="1+1">1+1 (Sleeper Berths / VIP Suites)</option>
                      <option value="2+2">2+2 (Panoramic Standard Deck)</option>
                      <option value="1+2">1+2 (Executive Upper Deck)</option>
                      <option value="2+1">2+1 (Comfort Royal Deck)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Upper Rows Count
                    </label>
                    <input
                      type="number"
                      min="4"
                      max="14"
                      value={upperRows}
                      onChange={e => setUpperRows(Number(e.target.value) || 4)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={upperHasBackRow}
                        onChange={e => setUpperHasBackRow(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-xs font-medium text-slate-700">
                        Include Upper Back Row
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Amenities & Status */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Onboard Amenities & Services
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                'Air Conditioned',
                'Individual Sleeper Berth',
                'Mineral Water',
                'High Speed WiFi',
                'USB Phone Charging',
                'CCTV Security',
                'Blanket & Pillow',
                'Snack Box',
                'Air Suspension',
                'Reading Light'
              ].map(amenity => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => handleToggleAmenity(amenity)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                    amenities.includes(amenity)
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {amenity}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs font-bold text-slate-800">
                Mark Coach as Active (Visible on Home Route List)
              </span>
            </label>
          </div>

          {/* Submit Actions */}
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
              <Check className="w-4 h-4" />
              <span>{initialCoach ? 'Save Changes' : 'Create & Activate Coach'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
