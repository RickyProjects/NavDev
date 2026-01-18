// Uses window.checkConflicts from main.js

class Airport {
  static ICAOCodes = {
    "CYYZ": ["Toronto Pearson", "Toronto, ON", 43.68, -79.63],
    "CYVR": ["Vancouver International", "Vancouver, OBC", 49.19, -123.18],
    "CYUL": ["Montreal-Trudeau", "Montreal, QC", 45.47, -73.74],
    "CYYC": ["Calgary International", "Calgary, AB", 51.11, -114.02],
    "CYOW": ["Ottawa Macdonald-Cartier", "Ottawa, ON", 45.32, -75.67],
    "CYWG": ["Winnipeg Richardson", "Winnipeg, MB", 49.91, -97.24],
    "CYHZ": ["Halifax Stanfield", "Halifax, NS", 44.88, -63.51],
    "CYEG": ["Edmonton International", "Edmonton, AB", 53.31, -113.58],
    "CYQB": ["Quebec City Jean Lesage", "Quebec City, QC", 46.79, -71.39],
    "CYYJ": ["Victoria International", "Victoria, BC", 48.65, -123.43],
    "CYYT": ["St. John's International", "St. John's, NL", 47.62, -52.75],
    "CYXE": ["Saskatoon International", "Saskatoon, SK", 52.17, -106.70],
  };

  constructor(icaoCode) {
    const d = Airport.ICAOCodes[icaoCode];
    if (!d) throw new Error(`${icaoCode} could not be found`);
    this.icaoCode = icaoCode;
    this.name = d[0];
    this.city = d[1];
    this.latitude = d[2];
    this.longitude = d[3];
  }

  static getAirport(icaoCode) {
    return new Airport(icaoCode);
  }
}

class AircraftType {
  static AircraftTypes = {
    "Boeing 787-9": { frame: "Wide-body", constraints: { minAltitude: 31000, maxAltitude: 43000, minOptimalRange: 37000, maxOptimalRange: 41000, minCruiseSpeed: 480, maxCruiseSpeed: 505, minSpeed: 430, maxSpeed: 505 } },
    "Boeing 777-300ER": { frame: "Wide-body", constraints: { minAltitude: 31000, maxAltitude: 43000, minOptimalRange: 37000, maxOptimalRange: 41000, minCruiseSpeed: 480, maxCruiseSpeed: 505, minSpeed: 430, maxSpeed: 505 } },
    "Airbus A330": { frame: "Wide-body", constraints: { minAltitude: 31000, maxAltitude: 43000, minOptimalRange: 37000, maxOptimalRange: 41000, minCruiseSpeed: 480, maxCruiseSpeed: 505, minSpeed: 430, maxSpeed: 505 } },

    "Boeing 737-800": { frame: "Narrow-body", constraints: { minAltitude: 28000, maxAltitude: 39000, minOptimalRange: 33000, maxOptimalRange: 37000, minCruiseSpeed: 465, maxCruiseSpeed: 485, minSpeed: 415, maxSpeed: 505 } },
    "Boeing 737 MAX 8": { frame: "Narrow-body", constraints: { minAltitude: 28000, maxAltitude: 39000, minOptimalRange: 33000, maxOptimalRange: 37000, minCruiseSpeed: 465, maxCruiseSpeed: 485, minSpeed: 415, maxSpeed: 505 } },
    "Airbus A320": { frame: "Narrow-body", constraints: { minAltitude: 28000, maxAltitude: 39000, minOptimalRange: 33000, maxOptimalRange: 37000, minCruiseSpeed: 465, maxCruiseSpeed: 485, minSpeed: 415, maxSpeed: 505 } },
    "Airbus A321": { frame: "Narrow-body", constraints: { minAltitude: 28000, maxAltitude: 39000, minOptimalRange: 33000, maxOptimalRange: 37000, minCruiseSpeed: 465, maxCruiseSpeed: 485, minSpeed: 415, maxSpeed: 505 } },

    "Dash 8-400": { frame: "Regional", constraints: { minAltitude: 22000, maxAltitude: 28000, minOptimalRange: 24000, maxOptimalRange: 26000, minCruiseSpeed: 360, maxCruiseSpeed: 360, minSpeed: 310, maxSpeed: 410 } },
    "Embraer E195-E2": { frame: "Regional", constraints: { minAltitude: 22000, maxAltitude: 28000, minOptimalRange: 24000, maxOptimalRange: 26000, minCruiseSpeed: 360, maxCruiseSpeed: 360, minSpeed: 310, maxSpeed: 410 } },
    "Airbus A220-300": { frame: "Regional", constraints: { minAltitude: 22000, maxAltitude: 28000, minOptimalRange: 24000, maxOptimalRange: 26000, minCruiseSpeed: 360, maxCruiseSpeed: 360, minSpeed: 310, maxSpeed: 410 } },

    "Boeing 767-300F": { frame: "Regional", constraints: { minAltitude: 28000, maxAltitude: 41000, minOptimalRange: 35000, maxOptimalRange: 39000, minCruiseSpeed: 460, maxCruiseSpeed: 480, minSpeed: 410, maxSpeed: 505 } },
    "Boeing 757-200F": { frame: "Regional", constraints: { minAltitude: 28000, maxAltitude: 41000, minOptimalRange: 35000, maxOptimalRange: 39000, minCruiseSpeed: 460, maxCruiseSpeed: 480, minSpeed: 410, maxSpeed: 505 } },
    "Airbus A300-600F": { frame: "Regional", constraints: { minAltitude: 28000, maxAltitude: 41000, minOptimalRange: 35000, maxOptimalRange: 39000, minCruiseSpeed: 460, maxCruiseSpeed: 480, minSpeed: 410, maxSpeed: 505 } },
  };

  constructor(type) {
    const d = AircraftType.AircraftTypes[type];
    if (!d) throw new Error(`${type} could not be found`);
    this.aircraftType = type;
    this.frame = d.frame;
    this.constraints = d.constraints;
  }
}

class Flight {
  constructor(flightData) {
    this.acid = flightData.ACID;
    this.aircraftType = new AircraftType(flightData["Plane type"]);
    this.altitude = flightData["altitude"];
    this.departureAirport = Airport.getAirport(flightData["departure airport"]);
    this.arrivalAirport = Airport.getAirport(flightData["arrival airport"]);
    this.departureTime = new Date(flightData["departure time"] * 1000);
    this.aircraftSpeed = flightData["aircraft speed"];
    this.passengers = flightData["passengers"];
    this.isCargo = flightData["is_cargo"];
  }
}

class FlightLog {
  constructor() { this.flights = []; }
  addFlight(info, log) {
    try {
      const f = new Flight(info);
      this.flights.push(f);
      return f;
    } catch (e) {
      log(`Could not add flight: ${e.message}`);
      return null;
    }
  }
}

function altitudeCandidatesFromConstraints(constraints) {
  const min = (constraints.minOptimalRange ?? constraints.minAltitude);
  const max = (constraints.maxOptimalRange ?? constraints.maxAltitude);
  const lo = Math.ceil(min / 1000) * 1000;
  const hi = Math.floor(max / 1000) * 1000;
  const alts = [];
  for (let a = lo; a <= hi; a += 1000) alts.push(a);
  return alts;
}

function suggestAltitudeFix(A, B, flightById, planesById) {
  const fA = flightById.get(A);
  const fB = flightById.get(B);
  const pA = planesById.get(A);
  const pB = planesById.get(B);
  if (!fA || !fB || !pA || !pB) return null;

  const curA = pA.altitudeFt;
  const curB = pB.altitudeFt;

  const cA = fA.aircraftType.constraints;
  const cB = fB.aircraftType.constraints;

  const candA = altitudeCandidatesFromConstraints(cA);
  const candB = altitudeCandidatesFromConstraints(cB);

  const changeOrder = [];
  if (fA.isCargo !== fB.isCargo) {
    changeOrder.push(fA.isCargo ? A : B, fA.isCargo ? B : A);
  } else {
    changeOrder.push((fA.passengers <= fB.passengers) ? A : B);
    changeOrder.push((fA.passengers <= fB.passengers) ? B : A);
  }

  function bestChangeFor(idToChange) {
    const cur = (idToChange === A) ? curA : curB;
    const other = (idToChange === A) ? curB : curA;
    const cand = (idToChange === A) ? candA : candB;
    const cons = (idToChange === A) ? cA : cB;
    const typeLabel = (idToChange === A) ? fA.aircraftType.aircraftType : fB.aircraftType.aircraftType;

    let best = null;
    for (const alt of cand) {
      if (Math.abs(alt - other) >= 2000) {
        const delta = Math.abs(alt - cur);
        if (!best || delta < best.delta) {
          best = { id: idToChange, from: cur, to: alt, delta, typeLabel, optMin: cons.minOptimalRange, optMax: cons.maxOptimalRange };
        }
      }
    }
    return best;
  }

  for (const id of changeOrder) {
    const proposal = bestChangeFor(id);
    if (proposal) return proposal;
  }
  return null;
}

function wrap360(deg) { return (deg % 360 + 360) % 360; }

function initialBearingDeg(from, to) {
  const toRad = d => d * Math.PI / 180;
  const toDeg = r => r * 180 / Math.PI;
  const lat1 = toRad(from.lat), lon1 = toRad(from.lon);
  const lat2 = toRad(to.lat),   lon2 = toRad(to.lon);
  const dLon = lon2 - lon1;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return wrap360(toDeg(Math.atan2(y, x)));
}

function pickCruiseAltitudeFt(flight) {
  const c = flight.aircraftType.constraints;
  const min = Math.ceil(c.minOptimalRange / 1000) * 1000;
  const max = Math.floor(c.maxOptimalRange / 1000) * 1000;

  const from = { lat: flight.departureAirport.latitude, lon: flight.departureAirport.longitude };
  const to   = { lat: flight.arrivalAirport.latitude,   lon: flight.arrivalAirport.longitude };

  const brg = initialBearingDeg(from, to);
  const eastbound = brg < 180;
  const wantOdd = eastbound;

  const candidates = [];
  for (let alt = min; alt <= max; alt += 1000) {
    const fl = Math.round(alt / 1000);
    const isOdd = (fl % 2) === 1;
    if (isOdd === wantOdd) candidates.push(alt);
  }

  const usable = candidates.length ? candidates : (() => {
    const all = [];
    for (let alt = min; alt <= max; alt += 1000) all.push(alt);
    return all;
  })();

  let hash = 0;
  for (const ch of flight.acid) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return usable[hash % usable.length];
}

function pickCruiseSpeedKts(flight) {
  const c = flight.aircraftType.constraints;
  const lo = c.minCruiseSpeed ?? c.minSpeed;
  const hi = c.maxCruiseSpeed ?? c.maxSpeed;
  let hash = 0;
  for (const ch of flight.acid) hash = (hash * 33 + ch.charCodeAt(0)) >>> 0;
  return lo + (hash % (hi - lo + 1));
}

function flightToPlaneShape(flight, simStartUnixSec) {
  const departUnixSec = flight.departureTime.getTime() / 1000;
  return {
    id: flight.acid,
    from: { lat: flight.departureAirport.latitude, lon: flight.departureAirport.longitude },
    to:   { lat: flight.arrivalAirport.latitude,   lon: flight.arrivalAirport.longitude },
    altitudeFt: pickCruiseAltitudeFt(flight),
    speed: pickCruiseSpeedKts(flight),
    departureTime: departUnixSec - simStartUnixSec,
  };
}

// This yields to the browser occasionally so the UI stays responsive
async function yieldToUI() {
  await new Promise(requestAnimationFrame);
}

// Main entry: takes parsed JSON array and a log function
async function runInBrowser(flightArray, log) {
  const lossOfSeparations = [];

  const flightLog = new FlightLog();
  for (const f of flightArray) flightLog.addFlight(f, log);

  log(`Loaded ${flightLog.flights.length} flights`);
  log(`Total flights: ${flightLog.flights.length}`);

  const flightById = new Map(flightLog.flights.map(f => [f.acid, f]));

  const simStartUnixSec = Math.min(...flightLog.flights.map(f => f.departureTime.getTime() / 1000));
  const planes = flightLog.flights.map(f => flightToPlaneShape(f, simStartUnixSec));
  const planesById = new Map(planes.map(p => [p.id, p]));

  log(`Planes ready for conflict sim: ${planes.length}`);

  let T = 0;
  const dt = 1;

  const lastDeparture = Math.max(...planes.map(p => p.departureTime));
  const maxFlightSeconds = 8 * 3600;
  const endT = lastDeparture + maxFlightSeconds;

  const activeConflicts = new Map();

  log(`Batch sim running from T=0 to T=${Math.floor(endT)} (dt=${dt}s)...`);

  for (; T <= endT; T += dt) {
    const conflicts = window.checkConflicts(planes, T);

    const nowKeys = new Set();
    for (const c of conflicts) {
      const key = [c.planeA, c.planeB].sort().join("|");
      nowKeys.add(key);
      if (!activeConflicts.has(key)) activeConflicts.set(key, c.time);
    }

    for (const [key, startTime] of activeConflicts.entries()) {
      if (!nowKeys.has(key)) {
        const [A, B] = key.split("|");

        log(`LOSS OF SEPARATION between ${A} and ${B} from T=${startTime}s to T=${T}s`);

        const fix = suggestAltitudeFix(A, B, flightById, planesById);
        if (fix) {
          log(`Fix: set ${fix.id} altitude ${fix.from} -> ${fix.to} (${fix.typeLabel} optimal ${fix.optMin}-${fix.optMax})`);
        } else {
          log(`Fix: altitude change not found within constraints; suggest delaying one flight by 300s`);
        }

        lossOfSeparations.push({ planeA: A, planeB: B, startTime, endTime: T, duration: T - startTime });
        activeConflicts.delete(key);
      }
    }

    // Yield every 50 sim seconds so the UI updates “in a timely fashion”
    if (T % 50 === 0) await yieldToUI();
  }

  log("Simulation Complete!");
  log(`Total conflicts: ${lossOfSeparations.length}`);

  return {
    totalFlights: planes.length,
    conflicts: lossOfSeparations,
  };
}

// expose to the page
window.runInBrowser = runInBrowser;
