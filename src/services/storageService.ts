import { Coach, DeckConfig, PassengerBooking, RouteItem, Seat } from '../types';

const STORAGE_KEY_COACHES = 'lal_sobuj_2_coaches_v1';
const STORAGE_KEY_ROUTES = 'lal_sobuj_2_routes_v1';

export const DEFAULT_ROUTES: RouteItem[] = [
  {
    id: 'route_dhaka_lakshmipur',
    name: 'Dhaka to Lakshmipur',
    from: 'Dhaka',
    to: 'Lakshmipur',
    distanceKm: 165,
    durationHours: '4.5 hrs',
    boardingPoints: [
      'Sayedabad Counter 01',
      'Sayedabad Counter 02',
      'Arambagh Counter',
      'Malibagh Counter',
      'Abdullahpur Counter',
      'Gabtoli Counter',
      'Chittagong Road Counter'
    ],
    droppingPoints: [
      'Chandraganj Bazar Counter',
      'Mandari Counter',
      'Lakshmipur Central Bus Terminal',
      'Jhumur Cinema Hall Counter',
      'Raypur Bus Stand Counter'
    ],
    defaultFare: 750
  },
  {
    id: 'route_dhaka_sonapur',
    name: 'Dhaka to Sonapur',
    from: 'Dhaka',
    to: 'Sonapur',
    distanceKm: 185,
    durationHours: '5.0 hrs',
    boardingPoints: [
      'Sayedabad Counter 01',
      'Arambagh Counter',
      'Malibagh Counter',
      'Abdullahpur Counter',
      'Chittagong Road Counter'
    ],
    droppingPoints: [
      'Comilla Bypass',
      'Feni Mahipal Counter',
      'Begumganj Chowrasta',
      'Chaumuhani Rail Gate Counter',
      'Maijdee Court Counter',
      'Sonapur Zero Point Counter'
    ],
    defaultFare: 800
  },
  {
    id: 'route_dhaka_chattogram',
    name: 'Dhaka to Chattogram',
    from: 'Dhaka',
    to: 'Chattogram',
    distanceKm: 245,
    durationHours: '5.5 hrs',
    boardingPoints: [
      'Sayedabad Counter 01',
      'Arambagh Counter',
      'Fakirapool Counter',
      'Abdullahpur Counter',
      'Kallayanpur Counter',
      'Chittagong Road Counter'
    ],
    droppingPoints: [
      'Sitakunda Counter',
      'Bhatiari Stand',
      'AK Khan Gate Counter',
      'GEC Circle Counter',
      'Dampara Central Bus Station'
    ],
    defaultFare: 1100
  }
];

export function generateSeatsForDeck(config: DeckConfig, fare: number): Seat[] {
  const seats: Seat[] = [];
  const rowLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];
  const prefix = config.deckType === 'upper' ? 'U-' : '';

  for (let r = 0; r < config.rows; r++) {
    const letter = rowLetters[r] || `R${r + 1}`;
    const isBackRow = config.hasBackRow && r === config.rows - 1;

    if (isBackRow) {
      // 5 seats in back row
      for (let c = 0; c < 5; c++) {
        seats.push({
          id: `${config.deckType}_${letter}${c + 1}`,
          deck: config.deckType,
          row: r,
          col: c,
          seatNumber: `${prefix}${letter}${c + 1}`,
          status: 'available',
          fare
        });
      }
      continue;
    }

    if (config.layout === '1+1') {
      // Left 1, Right 1
      seats.push({
        id: `${config.deckType}_${letter}1`,
        deck: config.deckType,
        row: r,
        col: 0,
        seatNumber: `${prefix}${letter}1`,
        status: 'available',
        fare
      });
      seats.push({
        id: `${config.deckType}_${letter}2`,
        deck: config.deckType,
        row: r,
        col: 1,
        seatNumber: `${prefix}${letter}2`,
        status: 'available',
        fare
      });
    } else if (config.layout === '2+2') {
      // Left 2 (col 0,1), Right 2 (col 2,3)
      for (let c = 0; c < 4; c++) {
        seats.push({
          id: `${config.deckType}_${letter}${c + 1}`,
          deck: config.deckType,
          row: r,
          col: c,
          seatNumber: `${prefix}${letter}${c + 1}`,
          status: 'available',
          fare
        });
      }
    } else if (config.layout === '1+2') {
      // Left 1 (col 0), Right 2 (col 1, 2)
      for (let c = 0; c < 3; c++) {
        seats.push({
          id: `${config.deckType}_${letter}${c + 1}`,
          deck: config.deckType,
          row: r,
          col: c,
          seatNumber: `${prefix}${letter}${c + 1}`,
          status: 'available',
          fare
        });
      }
    } else if (config.layout === '2+1') {
      // Left 2 (col 0, 1), Right 1 (col 2)
      for (let c = 0; c < 3; c++) {
        seats.push({
          id: `${config.deckType}_${letter}${c + 1}`,
          deck: config.deckType,
          row: r,
          col: c,
          seatNumber: `${prefix}${letter}${c + 1}`,
          status: 'available',
          fare
        });
      }
    }
  }

  return seats;
}

export function buildCoachSeats(
  deckType: 'single' | 'double',
  baseFare: number,
  lowerConfig: DeckConfig,
  upperConfig?: DeckConfig
): Seat[] {
  const lowerSeats = generateSeatsForDeck(lowerConfig, baseFare);
  if (deckType === 'double' && upperConfig) {
    const upperSeats = generateSeatsForDeck(upperConfig, Math.round(baseFare * 1.15)); // upper deck premium
    return [...lowerSeats, ...upperSeats];
  }
  return lowerSeats;
}

function getTodayDateString(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

export function generateInitialCoaches(): Coach[] {
  const today = getTodayDateString();

  // 1. Coach LS-101 (Dhaka to Lakshmipur - Single Deck 2+2)
  const lower1: DeckConfig = { deckName: 'Main Deck', rows: 10, layout: '2+2', hasBackRow: true, deckType: 'lower' };
  const seats101 = buildCoachSeats('single', 750, lower1);

  // 2. Coach LS-105 (Dhaka to Lakshmipur - Double Deck Sleeper 1+1 Upper & Lower)
  const lower105: DeckConfig = { deckName: 'Lower Deck', rows: 7, layout: '1+1', hasBackRow: false, deckType: 'lower' };
  const upper105: DeckConfig = { deckName: 'Upper Sleeper Deck', rows: 7, layout: '1+1', hasBackRow: false, deckType: 'upper' };
  const seats105 = buildCoachSeats('double', 1350, lower105, upper105);

  // 3. Coach LS-108 (Dhaka to Lakshmipur - Single Deck 2+2 Economy Non-AC)
  const lower108: DeckConfig = { deckName: 'Main Deck', rows: 10, layout: '2+2', hasBackRow: true, deckType: 'lower' };
  const seats108 = buildCoachSeats('single', 550, lower108);

  // 4. Coach LS-202 (Dhaka to Sonapur - Single Deck 1+2 Business Class)
  const lower202: DeckConfig = { deckName: 'Business Cabin', rows: 10, layout: '1+2', hasBackRow: false, deckType: 'lower' };
  const seats202 = buildCoachSeats('single', 950, lower202);

  // 5. Coach LS-208 (Dhaka to Sonapur - Double Deck 2+2 Lower, 1+2 Upper)
  const lower208: DeckConfig = { deckName: 'Lower Deck', rows: 8, layout: '2+2', hasBackRow: false, deckType: 'lower' };
  const upper208: DeckConfig = { deckName: 'Upper Royal Deck', rows: 8, layout: '1+2', hasBackRow: false, deckType: 'upper' };
  const seats208 = buildCoachSeats('double', 850, lower208, upper208);

  // 6. Coach LS-301 (Dhaka to Chattogram - Single Deck 2+1 Luxury Multi-Axle)
  const lower301: DeckConfig = { deckName: 'Executive Cabin', rows: 10, layout: '2+1', hasBackRow: true, deckType: 'lower' };
  const seats301 = buildCoachSeats('single', 1200, lower301);

  // 7. Coach LS-307 (Dhaka to Chattogram - Double Deck 2+2 Lower & Upper)
  const lower307: DeckConfig = { deckName: 'Lower Deck', rows: 8, layout: '2+2', hasBackRow: false, deckType: 'lower' };
  const upper307: DeckConfig = { deckName: 'Upper Deck', rows: 8, layout: '2+2', hasBackRow: false, deckType: 'upper' };
  const seats307 = buildCoachSeats('double', 1100, lower307, upper307);

  // Seed some realistic bookings to demonstrate all statuses (sold, booked, locked, reserved)
  const seedBookings = (seats: Seat[], coachId: string, coachNum: string) => {
    // Seat A1: Sold (Fully paid)
    if (seats[0]) {
      seats[0].status = 'sold';
      seats[0].booking = {
        id: `book_${coachId}_0`,
        pnr: `PNR-LS${Math.floor(100000 + Math.random() * 900000)}`,
        seatNumber: seats[0].seatNumber,
        deck: seats[0].deck,
        passengerName: 'Rafiqul Islam',
        phone: '01712-345678',
        gender: 'Male',
        boardingPoint: 'Sayedabad Counter 01',
        droppingPoint: 'Lakshmipur Central Bus Terminal',
        status: 'sell',
        fare: seats[0].fare,
        paidAmount: seats[0].fare,
        dueAmount: 0,
        paymentMethod: 'bKash',
        bookedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        counter: 'Sayedabad-01',
        coachId,
        coachNumber: coachNum
      };
    }
    // Seat A2: Booked with Due
    if (seats[1]) {
      seats[1].status = 'booked';
      const due = 250;
      seats[1].booking = {
        id: `book_${coachId}_1`,
        pnr: `PNR-LS${Math.floor(100000 + Math.random() * 900000)}`,
        seatNumber: seats[1].seatNumber,
        deck: seats[1].deck,
        passengerName: 'Farhana Akhter',
        phone: '01819-876543',
        gender: 'Female',
        boardingPoint: 'Arambagh Counter',
        droppingPoint: 'Chandraganj Bazar Counter',
        status: 'book',
        fare: seats[1].fare,
        paidAmount: seats[1].fare - due,
        dueAmount: due,
        paymentMethod: 'Cash',
        bookedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        counter: 'Arambagh-Main',
        notes: 'Will pay balance ৳250 at boarding counter',
        coachId,
        coachNumber: coachNum
      };
    }
    // Seat B1: Locked (counter query hold)
    if (seats[2]) {
      seats[2].status = 'locked';
      seats[2].booking = {
        id: `book_${coachId}_2`,
        pnr: `PNR-LS${Math.floor(100000 + Math.random() * 900000)}`,
        seatNumber: seats[2].seatNumber,
        deck: seats[2].deck,
        passengerName: 'Anisur Rahman (Hold)',
        phone: '01911-223344',
        gender: 'Male',
        boardingPoint: 'Sayedabad Counter 01',
        droppingPoint: 'Jhumur Cinema Hall Counter',
        status: 'lock',
        fare: seats[2].fare,
        paidAmount: 0,
        dueAmount: seats[2].fare,
        paymentMethod: 'Due',
        bookedAt: new Date(Date.now() - 1800000).toISOString(),
        counter: 'Sayedabad-01',
        notes: 'Hold for 30 mins phone inquiry',
        coachId,
        coachNumber: coachNum
      };
    }
    // Seat B2: Reserved (VIP / Quota)
    if (seats[3]) {
      seats[3].status = 'reserved';
      seats[3].booking = {
        id: `book_${coachId}_3`,
        pnr: `PNR-LS${Math.floor(100000 + Math.random() * 900000)}`,
        seatNumber: seats[3].seatNumber,
        deck: seats[3].deck,
        passengerName: 'Admin / VIP Quota',
        phone: '01700-000000',
        gender: 'Male',
        boardingPoint: 'Sayedabad Counter 01',
        droppingPoint: 'Lakshmipur Central Bus Terminal',
        status: 'reservation',
        fare: seats[3].fare,
        paidAmount: 0,
        dueAmount: seats[3].fare,
        paymentMethod: 'Due',
        bookedAt: new Date(Date.now() - 7200000).toISOString(),
        counter: 'Central-HQ',
        notes: 'HQ Management Seat Reservation',
        coachId,
        coachNumber: coachNum
      };
    }
  };

  seedBookings(seats101, 'coach_ls101', 'LS-101');
  seedBookings(seats105, 'coach_ls105', 'LS-105');
  seedBookings(seats202, 'coach_ls202', 'LS-202');
  seedBookings(seats301, 'coach_ls301', 'LS-301');

  return [
    {
      id: 'coach_ls101',
      coachNumber: 'LS-101',
      regNumber: 'DHAKA METRO-BA 15-4421',
      model: 'Hyundai Universe Express Noble',
      routeId: 'route_dhaka_lakshmipur',
      routeName: 'Dhaka to Lakshmipur',
      departureTime: '07:30 AM',
      departureDate: today,
      startingCounter: 'Sayedabad Counter 01',
      destinationCounter: 'Jhumur Cinema Hall Counter',
      deckType: 'single',
      coachClass: 'Executive AC',
      baseFare: 750,
      lowerDeckConfig: lower1,
      seats: seats101,
      isActive: true,
      amenities: ['Air Conditioned', 'Mineral Water', 'High Speed WiFi', 'USB Phone Charging', 'CCTV Security']
    },
    {
      id: 'coach_ls105',
      coachNumber: 'LS-105 (Sleeper)',
      regNumber: 'DHAKA METRO-BA 18-9901',
      model: 'MAN Double Decker Sleeper Suite',
      routeId: 'route_dhaka_lakshmipur',
      routeName: 'Dhaka to Lakshmipur',
      departureTime: '09:30 AM',
      departureDate: today,
      startingCounter: 'Arambagh Counter',
      destinationCounter: 'Lakshmipur Central Bus Terminal',
      deckType: 'double',
      coachClass: 'Sleeper Suite AC',
      baseFare: 1350,
      lowerDeckConfig: lower105,
      upperDeckConfig: upper105,
      seats: seats105,
      isActive: true,
      amenities: ['Individual Sleeper Berth', 'Reading Light', 'Blanket & Pillow', 'Air Conditioned', 'Mineral Water', 'Charging Port']
    },
    {
      id: 'coach_ls108',
      coachNumber: 'LS-108',
      regNumber: 'DHAKA METRO-JA 11-2033',
      model: 'Hino 1J Plus Express',
      routeId: 'route_dhaka_lakshmipur',
      routeName: 'Dhaka to Lakshmipur',
      departureTime: '03:15 PM',
      departureDate: today,
      startingCounter: 'Sayedabad Counter 02',
      destinationCounter: 'Raypur Bus Stand Counter',
      deckType: 'single',
      coachClass: 'Economy Non-AC',
      baseFare: 550,
      lowerDeckConfig: lower108,
      seats: seats108,
      isActive: true,
      amenities: ['Comfortable Pushback Seats', 'Curtains', 'Luggage Compartment', 'First Aid Box']
    },
    {
      id: 'coach_ls202',
      coachNumber: 'LS-202 (Business)',
      regNumber: 'DHAKA METRO-BA 16-7788',
      model: 'Scania Touring HD Business Class',
      routeId: 'route_dhaka_sonapur',
      routeName: 'Dhaka to Sonapur',
      departureTime: '08:00 AM',
      departureDate: today,
      startingCounter: 'Sayedabad Counter 01',
      destinationCounter: 'Sonapur Zero Point Counter',
      deckType: 'single',
      coachClass: 'Business Class AC',
      baseFare: 950,
      lowerDeckConfig: lower202,
      seats: seats202,
      isActive: true,
      amenities: ['1+2 Ultra Wide Recliners', 'Calf Rest', 'High Speed WiFi', 'Mineral Water', 'Charging Port']
    },
    {
      id: 'coach_ls208',
      coachNumber: 'LS-208 (Royal Double)',
      regNumber: 'DHAKA METRO-BA 19-3312',
      model: 'Volvo B11R Double Deck Luxury',
      routeId: 'route_dhaka_sonapur',
      routeName: 'Dhaka to Sonapur',
      departureTime: '02:00 PM',
      departureDate: today,
      startingCounter: 'Malibagh Counter',
      destinationCounter: 'Maijdee Court Counter',
      deckType: 'double',
      coachClass: 'Executive AC',
      baseFare: 850,
      lowerDeckConfig: lower208,
      upperDeckConfig: upper208,
      seats: seats208,
      isActive: true,
      amenities: ['Upper Panoramic View', 'Dual Climate AC', 'Snack Box', 'Emergency Exit', 'CCTV Monitored']
    },
    {
      id: 'coach_ls301',
      coachNumber: 'LS-301 (Multi-Axle)',
      regNumber: 'DHAKA METRO-BA 17-6655',
      model: 'Scania Multi-Axle K410IB',
      routeId: 'route_dhaka_chattogram',
      routeName: 'Dhaka to Chattogram',
      departureTime: '07:00 AM',
      departureDate: today,
      startingCounter: 'Sayedabad Counter 01',
      destinationCounter: 'Dampara Central Bus Station',
      deckType: 'single',
      coachClass: 'Executive AC',
      baseFare: 1200,
      lowerDeckConfig: lower301,
      seats: seats301,
      isActive: true,
      amenities: ['Smooth Air Suspension', 'Individual AC Vents', 'Mineral Water', 'Fast Charging', 'Luggage Tagging']
    },
    {
      id: 'coach_ls307',
      coachNumber: 'LS-307 (Double Deck)',
      regNumber: 'DHAKA METRO-BA 20-1122',
      model: 'MAN Lion’s Coach Double Deck',
      routeId: 'route_dhaka_chattogram',
      routeName: 'Dhaka to Chattogram',
      departureTime: '11:15 PM',
      departureDate: today,
      startingCounter: 'Arambagh Counter',
      destinationCounter: 'AK Khan Gate Counter',
      deckType: 'double',
      coachClass: 'Executive AC',
      baseFare: 1100,
      lowerDeckConfig: lower307,
      upperDeckConfig: upper307,
      seats: seats307,
      isActive: true,
      amenities: ['Night Light Mode', 'Comfort Footrest', 'Snacks', 'Dual LCD Screens', 'Emergency Assist']
    }
  ];
}

// ---------------- Storage API ---------------- //

export function getStoredRoutes(): RouteItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ROUTES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_ROUTES, JSON.stringify(DEFAULT_ROUTES));
      return DEFAULT_ROUTES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_ROUTES;
  } catch {
    return DEFAULT_ROUTES;
  }
}

export function saveRoutes(routes: RouteItem[]): void {
  localStorage.setItem(STORAGE_KEY_ROUTES, JSON.stringify(routes));
  notifyDataChange();
}

export function saveRoute(route: RouteItem): void {
  const current = getStoredRoutes();
  const index = current.findIndex(r => r.id === route.id);
  if (index >= 0) {
    current[index] = route;
  } else {
    current.push(route);
  }
  saveRoutes(current);
}

export function deleteRoute(routeId: string): void {
  const current = getStoredRoutes().filter(r => r.id !== routeId);
  saveRoutes(current);
}

export function getStoredCoaches(): Coach[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COACHES);
    if (!raw) {
      const initial = generateInitialCoaches();
      localStorage.setItem(STORAGE_KEY_COACHES, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : generateInitialCoaches();
  } catch {
    return generateInitialCoaches();
  }
}

export function saveCoaches(coaches: Coach[]): void {
  localStorage.setItem(STORAGE_KEY_COACHES, JSON.stringify(coaches));
  notifyDataChange();
}

export function saveCoach(coach: Coach): void {
  const coaches = getStoredCoaches();
  const index = coaches.findIndex(c => c.id === coach.id);
  if (index >= 0) {
    coaches[index] = coach;
  } else {
    coaches.unshift(coach);
  }
  saveCoaches(coaches);
}

export function deleteCoach(coachId: string): void {
  const coaches = getStoredCoaches().filter(c => c.id !== coachId);
  saveCoaches(coaches);
}

export function updateCoachSeats(coachId: string, updatedSeats: Seat[]): void {
  const coaches = getStoredCoaches();
  const index = coaches.findIndex(c => c.id === coachId);
  if (index >= 0) {
    coaches[index].seats = updatedSeats;
    saveCoaches(coaches);
  }
}

export function bookSeatsOnCoach(
  coachId: string,
  seatNumbers: string[],
  bookingData: Omit<PassengerBooking, 'id' | 'pnr' | 'seatNumber' | 'deck' | 'fare' | 'bookedAt' | 'coachId' | 'coachNumber' | 'status' | 'paymentMethod'>,
  status: 'reservation' | 'book' | 'lock' | 'sell',
  paymentMethod: PassengerBooking['paymentMethod'],
  paidAmountTotal: number,
  notes?: string
): PassengerBooking[] {
  const coaches = getStoredCoaches();
  const coach = coaches.find(c => c.id === coachId);
  if (!coach) return [];

  const createdBookings: PassengerBooking[] = [];
  const count = seatNumbers.length;
  const paidPerSeat = count > 0 ? Math.round(paidAmountTotal / count) : 0;

  coach.seats = coach.seats.map(seat => {
    if (seatNumbers.includes(seat.seatNumber)) {
      const pnr = `PNR-LS${Math.floor(100000 + Math.random() * 900000)}`;
      const dueAmount = Math.max(0, seat.fare - paidPerSeat);

      const booking: PassengerBooking = {
        id: `book_${Date.now()}_${seat.seatNumber}`,
        pnr,
        seatNumber: seat.seatNumber,
        deck: seat.deck,
        passengerName: bookingData.passengerName,
        phone: bookingData.phone,
        gender: bookingData.gender,
        boardingPoint: bookingData.boardingPoint,
        droppingPoint: bookingData.droppingPoint,
        status,
        fare: seat.fare,
        paidAmount: status === 'sell' && paidAmountTotal >= seat.fare * count ? seat.fare : paidPerSeat,
        dueAmount: status === 'sell' && paidAmountTotal >= seat.fare * count ? 0 : dueAmount,
        paymentMethod,
        bookedAt: new Date().toISOString(),
        counter: bookingData.counter || 'Sayedabad Counter 01',
        notes: notes || '',
        coachId: coach.id,
        coachNumber: coach.coachNumber
      };

      createdBookings.push(booking);

      let seatStatus: Seat['status'] = 'booked';
      if (status === 'sell') seatStatus = 'sold';
      else if (status === 'lock') seatStatus = 'locked';
      else if (status === 'reservation') seatStatus = 'reserved';

      return {
        ...seat,
        status: seatStatus,
        booking
      };
    }
    return seat;
  });

  saveCoaches(coaches);
  return createdBookings;
}

export function updateSeatBooking(coachId: string, seatNumber: string, updatedBooking: PassengerBooking): void {
  const coaches = getStoredCoaches();
  const coach = coaches.find(c => c.id === coachId);
  if (!coach) return;

  coach.seats = coach.seats.map(s => {
    if (s.seatNumber === seatNumber) {
      let seatStatus: Seat['status'] = 'booked';
      if (updatedBooking.status === 'sell') seatStatus = 'sold';
      else if (updatedBooking.status === 'lock') seatStatus = 'locked';
      else if (updatedBooking.status === 'reservation') seatStatus = 'reserved';

      return {
        ...s,
        status: seatStatus,
        booking: updatedBooking
      };
    }
    return s;
  });

  saveCoaches(coaches);
}

export function releaseSeat(coachId: string, seatNumber: string): void {
  const coaches = getStoredCoaches();
  const coach = coaches.find(c => c.id === coachId);
  if (!coach) return;

  coach.seats = coach.seats.map(s => {
    if (s.seatNumber === seatNumber) {
      return {
        ...s,
        status: 'available',
        booking: undefined
      };
    }
    return s;
  });

  saveCoaches(coaches);
}

export function collectSeatDue(coachId: string, seatNumber: string, amountToPay: number): void {
  const coaches = getStoredCoaches();
  const coach = coaches.find(c => c.id === coachId);
  if (!coach) return;

  coach.seats = coach.seats.map(s => {
    if (s.seatNumber === seatNumber && s.booking) {
      const newPaid = s.booking.paidAmount + amountToPay;
      const newDue = Math.max(0, s.booking.fare - newPaid);
      const isNowFullyPaid = newDue === 0;

      const updatedBooking: PassengerBooking = {
        ...s.booking,
        paidAmount: newPaid,
        dueAmount: newDue,
        status: isNowFullyPaid && s.booking.status === 'book' ? 'sell' : s.booking.status
      };

      return {
        ...s,
        status: isNowFullyPaid && s.status === 'booked' ? 'sold' : s.status,
        booking: updatedBooking
      };
    }
    return s;
  });

  saveCoaches(coaches);
}

export function getAllBookings(): PassengerBooking[] {
  const coaches = getStoredCoaches();
  const bookings: PassengerBooking[] = [];
  for (const c of coaches) {
    for (const s of c.seats) {
      if (s.booking) {
        bookings.push(s.booking);
      }
    }
  }
  return bookings;
}

export function resetAllData(): void {
  localStorage.removeItem(STORAGE_KEY_COACHES);
  localStorage.removeItem(STORAGE_KEY_ROUTES);
  localStorage.setItem(STORAGE_KEY_ROUTES, JSON.stringify(DEFAULT_ROUTES));
  localStorage.setItem(STORAGE_KEY_COACHES, JSON.stringify(generateInitialCoaches()));
  notifyDataChange();
}

export function exportAllData(): string {
  const data = {
    app: 'Lal Sobuj 2.0',
    version: '2.0.0',
    exportedAt: new Date().toISOString(),
    routes: getStoredRoutes(),
    coaches: getStoredCoaches()
  };
  return JSON.stringify(data, null, 2);
}

export function importAllData(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (data.routes && Array.isArray(data.routes)) {
      localStorage.setItem(STORAGE_KEY_ROUTES, JSON.stringify(data.routes));
    }
    if (data.coaches && Array.isArray(data.coaches)) {
      localStorage.setItem(STORAGE_KEY_COACHES, JSON.stringify(data.coaches));
    }
    notifyDataChange();
    return true;
  } catch (e) {
    console.error('Import failed', e);
    return false;
  }
}

function notifyDataChange() {
  window.dispatchEvent(new CustomEvent('lalsobuj_data_change'));
}
