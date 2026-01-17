const file = require('fs').promises; // .promises (from Nodejs) signifies placeholder value thats gonna be available in the future 

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