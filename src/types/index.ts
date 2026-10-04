export type SeatStatus = 'available' | 'selected' | 'booked' | 'sold' | 'locked' | 'reserved';

export type SeatLayoutType = '1+1' | '2+2' | '1+2' | '2+1';

export type DeckType = 'single' | 'double';

export type CoachClass = 'Executive AC' | 'Economy Non-AC' | 'Sleeper Suite AC' | 'Business Class AC';

export interface PassengerBooking {
  id: string;
  pnr: string;
  seatNumber: string;
  deck: 'lower' | 'upper';
  passengerName: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Other';
  boardingPoint: string;
  droppingPoint: string;
  status: 'reservation' | 'book' | 'lock' | 'sell';
  fare: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: 'Cash' | 'bKash' | 'Nagad' | 'Card' | 'Due';
  bookedAt: string;
  counter: string;
  notes?: string;
  coachId: string;
  coachNumber: string;
}

export interface Seat {
  id: string; // e.g., "lower_A1"
  deck: 'lower' | 'upper';
  row: number;
  col: number; // 0 to 3
  seatNumber: string; // e.g. "A1", "A2", "B1"
  status: SeatStatus;
  fare: number;
  booking?: PassengerBooking;
}

export interface DeckConfig {
  deckName: string;
  rows: number;
  layout: SeatLayoutType;
  hasBackRow: boolean; // e.g., 5 seats in back row
  deckType: 'lower' | 'upper';
}

export interface Coach {
  id: string;
  coachNumber: string;
  regNumber: string;
  model: string;
  routeId: string;
  routeName: string;
  departureTime: string;
  departureDate: string;
  startingCounter: string;
  destinationCounter: string;
  deckType: DeckType;
  coachClass: CoachClass;
  baseFare: number;
  lowerDeckConfig: DeckConfig;
  upperDeckConfig?: DeckConfig;
  seats: Seat[];
  isActive: boolean;
  amenities: string[];
}

export interface RouteItem {
  id: string;
  name: string;
  from: string;
  to: string;
  distanceKm: number;
  durationHours: string;
  boardingPoints: string[];
  droppingPoints: string[];
  defaultFare: number;
}
