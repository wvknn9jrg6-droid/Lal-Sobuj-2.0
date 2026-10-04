import React, { useState, useMemo } from 'react';
import { Coach, RouteItem } from '../types';
import { CoachCard } from './CoachCard';
import { Bus, MapPin, Calendar, Search, Filter, Sparkles, Clock, ArrowRight } from 'lucide-react';

interface HomePageProps {
  coaches: Coach[];
  routes: RouteItem[];
  onOpenSeatPlan: (coach: Coach) => void;
  onEditCoach?: (coach: Coach) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  coaches,
  routes,
  onOpenSeatPlan,
  onEditCoach
}) => {
  const [selectedRouteId, setSelectedRouteId] = useState<string>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'time' | 'fareAsc' | 'fareDesc' | 'seats'>('time');

  // Date shortcuts
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  const dayAfterStr = dayAfter.toISOString().split('T')[0];

  // Filter active coaches
  const activeCoaches = useMemo(() => {
    return coaches.filter(c => {
      if (!c.isActive) return false;

      // Route filter
      if (selectedRouteId !== 'ALL' && c.routeId !== selectedRouteId && c.routeName !== selectedRouteId) {
        return false;
      }

      // Class filter
      if (selectedClass !== 'ALL' && c.coachClass !== selectedClass) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesNum = c.coachNumber.toLowerCase().includes(query);
        const matchesModel = c.model.toLowerCase().includes(query);
        const matchesCounter =
          c.startingCounter.toLowerCase().includes(query) ||
          c.destinationCounter.toLowerCase().includes(query);
        const matchesRoute = c.routeName.toLowerCase().includes(query);
        if (!matchesNum && !matchesModel && !matchesCounter && !matchesRoute) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'fareAsc') return a.baseFare - b.baseFare;
      if (sortBy === 'fareDesc') return b.baseFare - a.baseFare;
      if (sortBy === 'seats') {
        const availA = a.seats.filter(s => s.status === 'available').length;
        const availB = b.seats.filter(s => s.status === 'available').length;
        return availB - availA;
      }
      // default: time string sort
      return a.departureTime.localeCompare(b.departureTime);
    });
  }, [coaches, selectedRouteId, selectedClass, searchQuery, sortBy]);

  // Group coaches by Route
  const groupedByRoute = useMemo(() => {
    const map = new Map<string, { route: RouteItem | null; coaches: Coach[] }>();

    // Initial populate with existing routes
    routes.forEach(r => {
      map.set(r.name, { route: r, coaches: [] });
    });

    activeCoaches.forEach(c => {
      if (!map.has(c.routeName)) {
        map.set(c.routeName, { route: null, coaches: [] });
      }
      map.get(c.routeName)!.coaches.push(c);
    });

    return Array.from(map.entries()).filter(([_, data]) => data.coaches.length > 0);
  }, [activeCoaches, routes]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white p-6 sm:p-8 shadow-md border border-emerald-800/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-rose-600 text-white font-mono text-[11px] font-black uppercase px-2 py-0.5 rounded tracking-wider shadow-xs">
              Lal Sobuj Paribahan
            </span>
            <span className="text-emerald-300 text-xs font-semibold">
              Live Inter-District Fleet Dispatch
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Book Express Seats & Double Deckers
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/80 max-w-2xl leading-relaxed">
            Instant online seat plan preview matching live coach configuration. Select your preferred seat,
            lock or issue tickets with transparent fare and due tracking across Dhaka, Lakshmipur, Sonapur & Chattogram.
          </p>
        </div>

        {/* Quick Date Ribbon */}
        <div className="mt-5 pt-4 border-t border-emerald-800/50 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-emerald-200">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>Travel Date:</span>
            <div className="flex items-center gap-1 ml-1">
              <button
                onClick={() => setSelectedDate(todayStr)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  selectedDate === todayStr
                    ? 'bg-emerald-500 text-slate-950 shadow-xs'
                    : 'bg-emerald-950/80 text-emerald-200 hover:bg-emerald-800/80 border border-emerald-700/60'
                }`}
              >
                Today ({todayStr.slice(5)})
              </button>

              <button
                onClick={() => setSelectedDate(tomorrowStr)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  selectedDate === tomorrowStr
                    ? 'bg-emerald-500 text-slate-950 shadow-xs'
                    : 'bg-emerald-950/80 text-emerald-200 hover:bg-emerald-800/80 border border-emerald-700/60'
                }`}
              >
                Tomorrow ({tomorrowStr.slice(5)})
              </button>

              <button
                onClick={() => setSelectedDate(dayAfterStr)}
                className={`hidden sm:inline-block px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  selectedDate === dayAfterStr
                    ? 'bg-emerald-500 text-slate-950 shadow-xs'
                    : 'bg-emerald-950/80 text-emerald-200 hover:bg-emerald-800/80 border border-emerald-700/60'
                }`}
              >
                Day After ({dayAfterStr.slice(5)})
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-200">
            <span>Active Coaches Onboard:</span>
            <strong className="text-white bg-emerald-800/80 px-2 py-0.5 rounded border border-emerald-700">
              {activeCoaches.length} Coaches
            </strong>
          </div>
        </div>
      </div>

      {/* Route Filter Navigation Pills / Tabs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            Filter By Travel Corridor
          </span>

          <span className="text-xs text-slate-400 font-mono">
            Showing {activeCoaches.length} scheduled trips
          </span>
        </div>

        {/* Route Segmented Control Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedRouteId('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedRouteId === 'ALL'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All Corridors ({coaches.filter(c => c.isActive).length})
          </button>

          {routes.map(route => {
            const count = coaches.filter(
              c => c.isActive && (c.routeId === route.id || c.routeName === route.name)
            ).length;

            return (
              <button
                key={route.id}
                onClick={() => setSelectedRouteId(route.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedRouteId === route.id || selectedRouteId === route.name
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{route.name}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  selectedRouteId === route.id
                    ? 'bg-emerald-950 text-emerald-200'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search coach (e.g. LS-101), counter, time..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-emerald-500 bg-slate-50/50"
          />
        </div>

        {/* Right side controls: Class & Sort */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Class filter */}
          <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Class:</span>
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="w-full sm:w-auto px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white"
            >
              <option value="ALL">All Classes</option>
              <option value="Executive AC">Executive AC</option>
              <option value="Sleeper Suite AC">Sleeper Suite AC</option>
              <option value="Business Class AC">Business Class AC</option>
              <option value="Economy Non-AC">Economy Non-AC</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Sort:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full sm:w-auto px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white"
            >
              <option value="time">Departure Time</option>
              <option value="fareAsc">Fare (Low → High)</option>
              <option value="fareDesc">Fare (High → Low)</option>
              <option value="seats">Available Seats</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Coaches Sections: Organized by Route */}
      {activeCoaches.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 p-6 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
            <Bus className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">No active coaches found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No coaches match your current filters. Try changing travel route, coach class, or clear search keyword.
          </p>
          <button
            onClick={() => {
              setSelectedRouteId('ALL');
              setSelectedClass('ALL');
              setSearchQuery('');
            }}
            className="text-xs font-bold text-emerald-700 hover:underline"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedByRoute.map(([routeName, data]) => {
            const routeItem = data.route;
            return (
              <div key={routeName} className="space-y-4">
                {/* Route Header Strip */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-l-4 border-l-emerald-600">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                        {routeName}
                      </h2>
                      <span className="bg-emerald-100 text-emerald-800 font-mono text-xs font-bold px-2 py-0.5 rounded">
                        {data.coaches.length} Scheduled Coach{data.coaches.length > 1 ? 'es' : ''}
                      </span>
                    </div>

                    {routeItem && (
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span>Distance: {routeItem.distanceKm} km</span>
                        <span>·</span>
                        <span>Avg Travel: {routeItem.durationHours}</span>
                        <span>·</span>
                        <span>
                          Boarding: {routeItem.boardingPoints.slice(0, 3).join(', ')} ...
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-800">
                    <span className="text-slate-400">Click Coach Number to Open Seat Plan</span>
                  </div>
                </div>

                {/* Coach Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {data.coaches.map(coach => (
                    <CoachCard
                      key={coach.id}
                      coach={coach}
                      onOpenSeatPlan={onOpenSeatPlan}
                      onEditCoach={onEditCoach}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
