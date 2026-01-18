const file = require('fs').promises; // .promises (from Nodejs) signifies placeholder value thats gonna be available in the future
   const path = require('path');
   const { checkConflicts } = require("./main.js");


   // Airport Class
   class Airport {
       // Hard-coding the reference data provided on GitHub using a map
       // maps airport code (String) to list (containing the airport name (Str), city (Str), latitude (decimal), and longitude (decimal)
       static ICAOCodes = {
       "CYYZ": ["Toronto Pearson", "Toronto, ON", 43.68, -79.63], // longitude should be -ve because it's going West
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
       "CYXE": ["Saskatoon International", "Saskatoon, SK", 52.17, -106.70]
       };


       constructor(icaoCode) {
           const AirportData = Airport.ICAOCodes[icaoCode];
           if (!AirportData) {
               throw new Error(`${icaoCode} could not be found`);
           }


           this.icaoCode = icaoCode;
           this.name = AirportData[0];
           this.city = AirportData[1];
           this.latitude = AirportData[2];
           this.longitude = AirportData[3];
       }


       static getAirport(icaoCode) {
           return new Airport(icaoCode);
       }
   } // end of Airport class




   class CommonWaypoint {
       constructor(coords) {
           // (for reference) this is the waypoint format from the github description:
           // 49.97N/110.935W  (Alberta/Saskatchewan border)
           const [lat, long] = coords.split('/');
           this.latitude = parseFloat(lat.replace(/[NS]/g, ''));
           this.longitude = parseFloat(long.replace(/[EW]/g, ''));
          
           if (lat.endsWith('S')) {
               this.latitude = -this.latitude;
           }
           if (long.endsWith('W')) {
               this.longitude = -this.longitude;
           }
       }
   }




   // Aircraft Type Class
   class AircraftType {
       // combining the "Constraints" data with the "Aircraft Types" data
       static AircraftTypes = {
           //Passenger Aircrafts
               //Wide-body
           "Boeing 787-9": {
                   frame: "Wide-body",
                   constraints: {
                       minAltitude: 31000, maxAltitude: 43000, minOptimalRange: 37000, maxOptimalRange: 41000,
                       minCruiseSpeed: 480, maxCruiseSpeed: 505, minSpeed: 430, maxSpeed: 505
                   }
               },
               "Boeing 777-300ER": {
                   frame: "Wide-body",
                   constraints: {
                       minAltitude: 31000, maxAltitude: 43000, minOptimalRange: 37000, maxOptimalRange: 41000,
                       minCruiseSpeed: 480, maxCruiseSpeed: 505, minSpeed: 430, maxSpeed: 505
                   }
               },
               "Airbus A330": {
                   frame: "Wide-body",
                   constraints: {
                       minAltitude: 31000, maxAltitude: 43000, minOptimalRange: 37000, maxOptimalRange: 41000,
                       minCruiseSpeed: 480, maxCruiseSpeed: 505, minSpeed: 430, maxSpeed: 505
                   }
               },
               //Narrow-body
               "Boeing 737-800": {
                   frame: "Narrow-body",
                   constraints: {
                       minAltitude: 28000, maxAltitude: 39000, minOptimalRange: 33000, maxOptimalRange: 37000,
                       minCruiseSpeed: 465, maxCruiseSpeed: 485, minSpeed: 415, maxSpeed: 505
                   }
               },
               "Boeing 737 MAX 8": {
                   frame: "Narrow-body",
                   constraints: {
                       minAltitude: 28000, maxAltitude: 39000, minOptimalRange: 33000, maxOptimalRange: 37000,
                       minCruiseSpeed: 465, maxCruiseSpeed: 485, minSpeed: 415, maxSpeed: 505
                   }
               },
               "Airbus A320": {
                   frame: "Narrow-body",
                   constraints: {
                       minAltitude: 28000, maxAltitude: 39000, minOptimalRange: 33000, maxOptimalRange: 37000,
                       minCruiseSpeed: 465, maxCruiseSpeed: 485, minSpeed: 415, maxSpeed: 505
                   }
               },
               "Airbus A321": {
                   frame: "Narrow-body",
                   constraints: {
                       minAltitude: 28000, maxAltitude: 39000, minOptimalRange: 33000, maxOptimalRange: 37000,
                       minCruiseSpeed: 465, maxCruiseSpeed: 485, minSpeed: 415, maxSpeed: 505
                   }
               },
               //Regional
               "Dash 8-400": {
                   frame: "Regional",
                   constraints: {
                       minAltitude: 22000, maxAltitude: 28000, minOptimalRange: 24000, maxOptimalRange: 26000,
                       minCruiseSpeed: 360, maxCruiseSpeed: 360, minSpeed: 310, maxSpeed: 410
                   }
               },
               "Embraer E195-E2": {
                   frame: "Regional",
                   constraints: {
                       minAltitude: 22000, maxAltitude: 28000, minOptimalRange: 24000, maxOptimalRange: 26000,
                       minCruiseSpeed: 360, maxCruiseSpeed: 360, minSpeed: 310, maxSpeed: 410
                   }
               },
               "Airbus A220-300": {
                   frame: "Regional",
                   constraints: {
                       minAltitude: 22000, maxAltitude: 28000, minOptimalRange: 24000, maxOptimalRange: 26000,
                       minCruiseSpeed: 360, maxCruiseSpeed: 360, minSpeed: 310, maxSpeed: 410
                   }
               },
               //Cargo
               "Boeing 767-300F": {
                   frame: "Regional",
                   constraints: {
                       minAltitude: 28000, maxAltitude: 41000, minOptimalRange: 35000, maxOptimalRange: 39000,
                       minCruiseSpeed: 460, maxCruiseSpeed: 480, minSpeed: 410, maxSpeed: 505
                   }
               },
               "Boeing 757-200F": {
                   frame: "Regional",
                   constraints: {
                       minAltitude: 28000, maxAltitude: 41000, minOptimalRange: 35000, maxOptimalRange: 39000,
                       minCruiseSpeed: 460, maxCruiseSpeed: 480, minSpeed: 410, maxSpeed: 505
                   }
               },
               "Airbus A300-600F": {
                   frame: "Regional",
                   constraints: {
                       minAltitude: 28000, maxAltitude: 41000, minOptimalRange: 35000, maxOptimalRange: 39000,
                       minCruiseSpeed: 460, maxCruiseSpeed: 480, minSpeed: 410, maxSpeed: 505
                   }
               }
       };




       constructor(aircraftType) {
           const typeData = AircraftType.AircraftTypes[aircraftType];
           if (!typeData) {
               throw new Error(`${aircraftType} could not be found`);
           }


           this.aircraftType = aircraftType;
           this.frame = typeData.frame;
           this.constraints = typeData.constraints;
       }


       //helper methods
       static getAircraftType(aircraftType) {
           return new AircraftType(aircraftType);
       }


       isInAltitudeRange (altitude) {
           return altitude >= this.constraints.minAltitude && altitude <= this.constraints.maxAltitude;
       }


       isOptimal (altitude) {
           return altitude >= this.constraints.minOptimalRange && altitude <= this.constraints.maxOptimalRange;
       }


       isInSpeedRange(speed) {
           return speed >= this.constraints.minSpeed && speed <= this.constraints.maxSpeed;
       }
   } //end of AircraftType class




   /* (Just for reference) JSON data structure:
   [
   {
       "ACID": "ACA101",
       "Plane type": "Boeing 787-9",
       "route": "49.97N/110.935W 49.64N/92.114W",
       "altitude": 37000,
       "departure airport": "CYYZ",
       "arrival airport": "CYVR",
       "departure time": 1736244000,
       "aircraft speed": 485.0,
       "passengers": 280,
       "is_cargo": false
   }
   ]
   */


   // Flight Class
   class Flight {
       constructor(flightData) {
           this.acid = flightData.ACID;
           this.aircraftType = new AircraftType(flightData["Plane type"]);


           // not really sure what/how to assign to  "route" variable yet
           // this.route =
           this.altitude = flightData["altitude"];
           this.departureAirport = Airport.getAirport(flightData["departure airport"]);
           this.arrivalAirport = Airport.getAirport(flightData["arrival airport"]);
           this.departureTime = new Date(flightData["departure time"] * 1000); // converting from seconds to milliseconds
           this.aircraftSpeed = flightData["aircraft speed"];
           this.passengers = flightData["passengers"];
           this.isCargo = flightData["is_cargo"];
       }
   } // end of Flight class




   //Storing Flights
   class FlightLog {
       constructor() {
           this.flights = [];
       }


       addFlight(flightInfo) {
           try {
               const flightObj = new Flight(flightInfo);
               this.flights.push(flightObj); // adding flight to an array that stores the flights
               return flightObj;
          
           } catch (error) {
               console.error(`Could not add flight ${flightInfo}to flight array`, error.message);
               return null;
           }
       }


       getFlight(acid) {
           return this.flights.find(flight=> flight.acid === acid);
       }


       getAirport(icaoCode) {
           return this.flights.filter(flight => flight.departureAirport.icaoCode === icaoCode || flight.arrivalAirport.icaoCode === icaoCode);
       }


       getAircraftType(aircraftType) {
           return this.flights.filter(flight => flight.aircraftType.aircraftType === aircraftType);
      
       }


       // could displat all total state of all the flights (i.e., total number of passengers, the cargo, etc.,?)




   }


   //function to build the flightLog upon submitting the JSON file
//    function buildFlightLogFromJSON(flightArray) {
//        if (!Array.isArray(flightArray)) {
//            throw new Error("Input JSON must be an array of flights");
//        }


//        const flightLog = new FlightLog();
//        for (const flight of flightArray) {
//            flightLog.addFlight(flight);
//        }
//        return flightLog;
//    }






       async function readFile(fileName) {
           try {
               const flightData = await file.readFile(fileName, 'utf8');
               const flightReadIn = JSON.parse(flightData);


               const flightLogInstance = new FlightLog();


               for (const flight of flightReadIn) {
                   flightLogInstance.addFlight(flight);
               }


               console.log(`Loaded ${flightLogInstance.flights.length} flights`);


               return flightLogInstance;


           } catch (error) {
               console.error(`Could not read ${fileName}:`, error.message);
               throw error;
           }
       }


       function altitudeCandidatesFromConstraints(constraints) {
 // Prefer optimal range, fallback to min/max altitude range
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


   // Prefer changing the lower-impact flight:
   // cargo first, else fewer passengers
   const changeOrder = [];
   if (fA.isCargo !== fB.isCargo) {
       changeOrder.push(fA.isCargo ? A : B);
       changeOrder.push(fA.isCargo ? B : A);
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


       // Need >=2000 ft separation (since conflict is within 2000)
       let best = null;
       for (const alt of cand) {
       if (Math.abs(alt - other) >= 2000) {
           const delta = Math.abs(alt - cur);
           if (!best || delta < best.delta) {
           best = {
               id: idToChange,
               from: cur,
               to: alt,
               delta,
               typeLabel,
               optMin: cons.minOptimalRange,
               optMax: cons.maxOptimalRange
           };
           }
       }
       }
       return best;
   }


   for (const id of changeOrder) {
       const proposal = bestChangeFor(id);
       if (proposal) return proposal;
   }


   return null; // no altitude-only fix found within constraints
   }


   function wrap360(deg) {
       return (deg % 360 + 360) % 360;
       }


       function initialBearingDeg(from, to) {
       const toRad = d => d * Math.PI / 180;
       const toDeg = r => r * 180 / Math.PI;


       const lat1 = toRad(from.lat), lon1 = toRad(from.lon);
       const lat2 = toRad(to.lat),   lon2 = toRad(to.lon);
       const dLon = lon2 - lon1;


       const y = Math.sin(dLon) * Math.cos(lat2);
       const x = Math.cos(lat1) * Math.sin(lat2) -
                   Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);


       return wrap360(toDeg(Math.atan2(y, x)));
       }


   function pickCruiseAltitudeFt(flight) {
       const c = flight.aircraftType.constraints;


       const min = Math.ceil(c.minOptimalRange / 1000) * 1000;
       const max = Math.floor(c.maxOptimalRange / 1000) * 1000;


       const from = { lat: flight.departureAirport.latitude, lon: flight.departureAirport.longitude };
       const to   = { lat: flight.arrivalAirport.latitude,   lon: flight.arrivalAirport.longitude };


       //determines whether the plane is moving eastbound or westbound
       const brg = initialBearingDeg(from, to);
       const eastbound = brg < 180;


       //determines the altitude depending on the direction of the flight
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


       // deterministic pick based on flight id
       let hash = 0;
       for (const ch of flight.acid) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
       return usable[hash % usable.length];
   }


   function pickCruiseSpeedKts(flight) {
       const c = flight.aircraftType.constraints;


       // uses minCruiseSpeed/maxCruiseSpeed if present; else fall back to minSpeed/maxSpeed
       const lo = c.minCruiseSpeed ?? c.minSpeed;
       const hi = c.maxCruiseSpeed ?? c.maxSpeed;


       // picks speed based on flight id
       let hash = 0;
       for (const ch of flight.acid) hash = (hash * 33 + ch.charCodeAt(0)) >>> 0;
       return lo + (hash % (hi - lo + 1));
   }


   function getStringProposal(fix) {
       if (!fix) {
           return "No valid altitude change found within aircraft constraints; suggest delaying one flight by 300 seconds.";
       }


       return (
           `Set ${fix.id} altitude from ${fix.from} ft to ${fix.to} ft ` +
           `(${fix.typeLabel}, optimal ${fix.optMin}-${fix.optMax} ft)`
       );
   }


   function flightToPlaneShape(flight, simStartUnixSec) {
 //flight.departureTime is a date object in flight, so changes to milliseconds
       const departUnixSec = flight.departureTime.getTime() / 1000;


       //information transferred to conflict finding logic
       return {
       id: flight.acid,


       //main.js takes {lat, lon}
       from: { lat: flight.departureAirport.latitude, lon: flight.departureAirport.longitude },
       to:   { lat: flight.arrivalAirport.latitude,   lon: flight.arrivalAirport.longitude },


       altitudeFt: pickCruiseAltitudeFt(flight),


       //main.js takes speed in knots
       speed: pickCruiseSpeedKts(flight),


       //main.js expects departureTime seconds since start of simulation
       departureTime: departUnixSec - simStartUnixSec
   };
   }
  
       async function main() {
           try {
               const lossOfSeparations = [];
               // find file path regardless of where script is run from
               const filePath = path.join(
                   __dirname,
                   'input',
                   'canadian_flights_250.json'
               );


               console.log('Using data file:', filePath);


               const flightLog = await readFile(filePath);


               const flightById = new Map(flightLog.flights.map(f => [f.acid, f]));


               console.log('Total flights:', flightLog.flights.length);


               //const testFlight = flightLog.getFlight('FDX227');
               //console.log('Test flight FDX227:', testFlight);


               //converting information from flightLog into info that main.js can understand
               const simStartUnixSec = Math.min(...flightLog.flights.map(f => f.departureTime.getTime() / 1000));
               const planes = flightLog.flights.map(f => flightToPlaneShape(f, simStartUnixSec));
               const planesById = new Map(planes.map(p => [p.id, p]));


               console.log("Planes ready for conflict sim:", planes.length);


               //starts the simulation
               // ---- FAST BATCH RUN (no real-time waiting) ----


               // starts the simulation
               let T = 0;                 // seconds since sim start
               const tickMs = 1000;       // keep 1000ms = 1s sim step for same accuracy as your current run
               const dt = tickMs / 1000;  // seconds per step


               //figures out when to stop
               const lastDeparture = Math.max(...planes.map(p => p.departureTime));
               const maxFlightSeconds = 8 * 3600; // 8 hours buffer
               const endT = lastDeparture + maxFlightSeconds;


               // prevents printing the same conflict every tick
               const activeConflicts = new Map();


               console.log(`Batch sim running from T=0 to T=${Math.floor(endT)} (dt=${dt}s)...`);


               for (; T <= endT; T += dt) {


               if (T % 600 === 0) {
                   //console.log(`T=${T}s`);
               }


               const conflicts = checkConflicts(planes, T);


               const nowKeys = new Set();


               for (const c of conflicts) {
                   const key = [c.planeA, c.planeB].sort().join("|");
                   nowKeys.add(key);


                   // conflict just started
                   if (!activeConflicts.has(key)) {
                       activeConflicts.set(key, c.time);
                   }
               }




               for (const [key, startTime] of activeConflicts.entries()) {
                   if (!nowKeys.has(key)) {
                       const [A, B] = key.split("|");
                       console.log(
                       `LOSS OF SEPARATION between ${A} and ${B} from T=${startTime}s to T=${T}s`
                       );


                       const fix = suggestAltitudeFix(A, B, flightById, planesById);
                       if (fix) {
                       console.log(
                           `Fix: set ${fix.id} altitude ${fix.from} -> ${fix.to} ` +
                           `(${fix.typeLabel} optimal ${fix.optMin}-${fix.optMax})`
                       );
                       } else {
                           console.log(`Fix: altitude change not found within constraints; suggest delaying one flight by 300s`);
                       }
                       lossOfSeparations.push({
                       planeA: A,
                       planeB: B,
                       startTime: startTime,
                       endTime: T,
                       duration: T - startTime
                       });


                       activeConflicts.delete(key);
                       }
                   }
               }


               console.log("Batch sim done.");
               console.table(lossOfSeparations);
              




           } catch (error) {
               console.error('Could not run main:', error.message);
           }
       }


       main(); //calling main function


    //    async function runSimulation(flightArray) {
    //        const lossOfSeparations = [];


    //        const flightLog = buildFlightLogFromJSON(flightArray);
    //        const flightById = new Map(flightLog.flights.map(f => [f.acid, f]));


    //        const simStartUnixSec = Math.min(
    //            ...flightLog.flights.map(f => f.departureTime.getTime() / 1000)
    //        );


    //        const planes = flightLog.flights.map(f =>
    //            flightToPlaneShape(f, simStartUnixSec)
    //        );


    //        const planesById = new Map(planes.map(p => [p.id, p]));


    //        let T = 0;
    //        const dt = 1;
    //        const lastDeparture = Math.max(...planes.map(p => p.departureTime));
    //        const endT = lastDeparture + 8 * 3600;


    //        const activeConflicts = new Map();


    //        for (; T <= endT; T += dt) {
    //            const conflicts = checkConflicts(planes, T);
    //            const nowKeys = new Set();


    //            for (const c of conflicts) {
    //            const key = [c.planeA, c.planeB].sort().join("|");
    //            nowKeys.add(key);


    //            if (!activeConflicts.has(key)) {
    //                activeConflicts.set(key, c.time);
    //            }
    //            }


    //            for (const [key, startTime] of activeConflicts.entries()) {
    //            if (!nowKeys.has(key)) {
    //                const [A, B] = key.split("|");


    //                const fix = suggestAltitudeFix(A, B, flightById, planesById);


    //                lossOfSeparations.push({
    //                planeA: A,
    //                planeB: B,
    //                startTime,
    //                endTime: T,
    //                duration: T - startTime,
    //                fix: fix ? getStringProposal(fix) : null
    //                });


    //                activeConflicts.delete(key);
    //            }
    //            }
    //        }


    //        return {
    //            totalFlights: flightLog.flights.length,
    //            conflicts: lossOfSeparations
    //        };
    //        }


    //        module.exports = { runSimulation };
