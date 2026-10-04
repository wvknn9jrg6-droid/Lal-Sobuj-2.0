import React, { useState } from 'react';
import { RouteItem } from '../types';
import { getStoredRoutes, saveRoute, deleteRoute } from '../services/storageService';
import { X, MapPin, Plus, Trash2, Check, ArrowRight } from 'lucide-react';

interface RouteManagerModalProps {
  onClose: () => void;
  onRoutesUpdated: () => void;
}

export const RouteManagerModal: React.FC<RouteManagerModalProps> = ({
  onClose,
  onRoutesUpdated
}) => {
  const [routes, setRoutes] = useState<RouteItem[]>(getStoredRoutes());
  const [editingRoute, setEditingRoute] = useState<RouteItem | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [from, setFrom] = useState('Dhaka');
  const [to, setTo] = useState('');
  const [distanceKm, setDistanceKm] = useState(180);
  const [durationHours, setDurationHours] = useState('5.0 hrs');
  const [defaultFare, setDefaultFare] = useState(800);
  const [boardingPointsStr, setBoardingPointsStr] = useState('');
  const [droppingPointsStr, setDroppingPointsStr] = useState('');

  const handleStartEdit = (r: RouteItem) => {
    setEditingRoute(r);
    setIsCreatingNew(false);
    setName(r.name);
    setFrom(r.from);
    setTo(r.to);
    setDistanceKm(r.distanceKm);
    setDurationHours(r.durationHours);
    setDefaultFare(r.defaultFare);
    setBoardingPointsStr(r.boardingPoints.join('\n'));
    setDroppingPointsStr(r.droppingPoints.join('\n'));
  };

  const handleStartCreate = () => {
    setEditingRoute(null);
    setIsCreatingNew(true);
    setName('Dhaka to ');
    setFrom('Dhaka');
    setTo('');
    setDistanceKm(200);
    setDurationHours('5.0 hrs');
    setDefaultFare(850);
    setBoardingPointsStr('Sayedabad Counter 01\nArambagh Counter\nMalibagh Counter\nChittagong Road Counter');
    setDroppingPointsStr('Central Bus Terminal\nCity Counter');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const boardingList = boardingPointsStr
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const droppingList = droppingPointsStr
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const newRoute: RouteItem = {
      id: editingRoute?.id || `route_${Date.now()}`,
      name: name.trim(),
      from: from.trim(),
      to: to.trim() || name.replace(/Dhaka to /i, '').trim(),
      distanceKm,
      durationHours,
      defaultFare,
      boardingPoints: boardingList.length > 0 ? boardingList : ['Sayedabad Counter 01'],
      droppingPoints: droppingList.length > 0 ? droppingList : ['Destination Counter']
    };

    saveRoute(newRoute);
    setRoutes(getStoredRoutes());
    setEditingRoute(null);
    setIsCreatingNew(false);
    onRoutesUpdated();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this route?')) {
      deleteRoute(id);
      setRoutes(getStoredRoutes());
      onRoutesUpdated();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center border border-emerald-600">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                Route Management Center
              </h2>
              <p className="text-xs text-slate-400">
                Configure official Lal Sobuj travel corridors, boarding counters, and dropping points
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

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {!editingRoute && !isCreatingNew ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Active Routes ({routes.length})
                </span>
                <button
                  onClick={handleStartCreate}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Route</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {routes.map(r => (
                  <div
                    key={r.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{r.name}</span>
                        <span className="text-xs font-mono font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                          ৳{r.defaultFare} Default
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {r.distanceKm} km · ~{r.durationHours} travel time
                      </p>
                      <p className="text-[11px] text-slate-500">
                        <strong>Counters:</strong> {r.boardingPoints.length} Boarding · {r.droppingPoints.length} Dropping
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStartEdit(r)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-300 hover:bg-white text-slate-700"
                      >
                        Edit Counters
                      </button>
                      {routes.length > 1 && (
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200"
                          title="Delete route"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Route Edit / Create Form */
            <form onSubmit={handleSave} className="space-y-4 text-xs sm:text-sm">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-bold text-slate-900">
                  {isCreatingNew ? 'Create New Route' : `Edit Route: ${editingRoute?.name}`}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEditingRoute(null);
                    setIsCreatingNew(false);
                  }}
                  className="text-xs text-slate-500 hover:underline"
                >
                  Back to List
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Route Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dhaka to Lakshmipur"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Default Seat Fare (৳)
                  </label>
                  <input
                    type="number"
                    value={defaultFare}
                    onChange={e => setDefaultFare(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Origin</label>
                  <input
                    type="text"
                    value={from}
                    onChange={e => setFrom(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Destination</label>
                  <input
                    type="text"
                    value={to}
                    onChange={e => setTo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Distance (Km)</label>
                  <input
                    type="number"
                    value={distanceKm}
                    onChange={e => setDistanceKm(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Travel Duration</label>
                  <input
                    type="text"
                    value={durationHours}
                    onChange={e => setDurationHours(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>

              {/* Boarding and Dropping Points Lists (one per line) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <div>
                  <label className="block text-xs font-bold text-emerald-800 mb-1">
                    Boarding Points (One per line)
                  </label>
                  <textarea
                    rows={6}
                    value={boardingPointsStr}
                    onChange={e => setBoardingPointsStr(e.target.value)}
                    placeholder="Sayedabad Counter 01&#10;Arambagh Counter&#10;Malibagh Counter"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:outline-emerald-500"
                  />
                  <span className="text-[10px] text-slate-400">
                    Each line becomes a counter option in booking dropdown.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-rose-800 mb-1">
                    Dropping Points (One per line)
                  </label>
                  <textarea
                    rows={6}
                    value={droppingPointsStr}
                    onChange={e => setDroppingPointsStr(e.target.value)}
                    placeholder="Lakshmipur Central Bus Terminal&#10;Jhumur Cinema Hall Counter"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:outline-emerald-500"
                  />
                  <span className="text-[10px] text-slate-400">
                    Destination drop-off counters.
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setEditingRoute(null);
                    setIsCreatingNew(false);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-5 py-2 rounded-xl flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Route</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
