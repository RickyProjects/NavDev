const EARTH_RADIUS_M = 6371000;     // meters
const NM_TO_M = 1852;               // 1 nautical mile = 1852 meters
const FT_TO_M = 0.3048;             // 1 foot = 0.3048 meters


const HORIZONTAL_LIMIT_M = 5 * NM_TO_M; // 5 NM
const VERTICAL_LIMIT_FT = 2000;         // 2000 ft


// helper functions for angles
function toRad(deg) {
 return (deg * Math.PI) / 180;
}
function toDeg(rad) {
 return (rad * 180) / Math.PI;
}
function clamp01(x) {
 return Math.max(0, Math.min(1, x));
}


//converting latitute and longitude into meters using the Haversine equation


function haversineMeters(a, b) {
 const lat1 = toRad(a.lat), lon1 = toRad(a.lon);
 const lat2 = toRad(b.lat), lon2 = toRad(b.lon);


 const dLat = lat2 - lat1;
 const dLon = lon2 - lon1;


 const s =
   Math.sin(dLat / 2) ** 2 +
   Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;


 return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(s));
}


//great circle interpolation calculates more accurate locations than lat / lon
function interpolateGreatCircle(start, end, u) {
 const lat1 = toRad(start.lat), lon1 = toRad(start.lon);
 const lat2 = toRad(end.lat),   lon2 = toRad(end.lon);


 // convert start/end to 3D unit vectors
 const A = {
   x: Math.cos(lat1) * Math.cos(lon1),
   y: Math.cos(lat1) * Math.sin(lon1),
   z: Math.sin(lat1),
 };
 const B = {
   x: Math.cos(lat2) * Math.cos(lon2),
   y: Math.cos(lat2) * Math.sin(lon2),
   z: Math.sin(lat2),
 };


 // Angle between vectors
 const dot = Math.max(-1, Math.min(1, A.x * B.x + A.y * B.y + A.z * B.z));
 const omega = Math.acos(dot);


 // If extremely close, just return start
 if (omega < 1e-12) return { lat: start.lat, lon: start.lon };


 const sinOmega = Math.sin(omega);
 const k1 = Math.sin((1 - u) * omega) / sinOmega;
 const k2 = Math.sin(u * omega) / sinOmega;


 // Interpolate in 3D
 const x = k1 * A.x + k2 * B.x;
 const y = k1 * A.y + k2 * B.y;
 const z = k1 * A.z + k2 * B.z;


 // Convert back to lat/lon
 const lat = Math.atan2(z, Math.hypot(x, y));
 const lon = Math.atan2(y, x);


 return { lat: toDeg(lat), lon: toDeg(lon) };
}


//converts the curvature of the globe into a 2 dimensional plane for simpler calculations using haversine equation
function planeStateAtTime(plane, T) {
 // if not departed yet, ignore this plane
 if (T < plane.departureTime) {
   return { active: false, reason: "waiting" };
 }


 // time since THIS plane departed (per-flight)
 const tau = T - plane.departureTime; // seconds


 // Ignore first 300 seconds of EACH flight (climb/terminal)
 if (tau < 300) {
   return { active: false, reason: "climb phase" };
 }


 const totalDistM = haversineMeters(plane.from, plane.to);


 const speedMps =
   (plane.speedMps != null) ? plane.speedMps
   : (plane.speed != null) ? plane.speed * 0.514444
   : 0;


 if (speedMps <= 0) return { active: false, reason: "invalid speed" };


 const duration = totalDistM / speedMps;


 // OPTIONAL: ignore last 300 seconds of EACH flight (descent/terminal)
 if (duration - tau < 300) {
   return { active: false, reason: "descent phase" };
 }


 const u = clamp01(tau / duration);


 if (u >= 1) {
   return { active: false, reason: "arrived" };
 }


 const pos = interpolateGreatCircle(plane.from, plane.to, u);


 const altitudeFt = plane.altitudeFt;


 return { active: true, id: plane.id, pos, altitudeFt };
}




//returns true if two planes have lost seperation (are too close)


function isLossOfSeparation(stateA, stateB) {
 // horizontal distance in meters
 const horizM = haversineMeters(stateA.pos, stateB.pos);


 // vertical distance in feet
 const vertFt = Math.abs(stateA.altitudeFt - stateB.altitudeFt);


 return horizM < HORIZONTAL_LIMIT_M && vertFt < VERTICAL_LIMIT_FT;
}


//checks if all planes at a given time T are a safe distance from eachother
function checkConflicts(planes, T) {


 const activeStates = [];
 for (const plane of planes) {
   const planeFlying = planeStateAtTime(plane, T);
   if (planeFlying.active) activeStates.push(planeFlying);
 }


//compares each active plane with every other active plane to check if theyre too close
 const conflicts = [];
 for (let i = 0; i < activeStates.length; i++) {
   for (let j = i + 1; j < activeStates.length; j++) {
     const A = activeStates[i];
     const B = activeStates[j];


     if (isLossOfSeparation(A, B)) {
       conflicts.push({
         time: T,
         planeA: A.id,
         planeB: B.id,
       });
     }
   }
 }


 return conflicts;
}


//main loop
//global clock
let T = 0;
const tickMs = 1000;


// setInterval(() => {
//   const conflicts = checkConflicts(planes, T);


//   const nowKeys = new Set();
//   for (const c of conflicts) {
//     const key = [c.planeA, c.planeB].sort().join("|");
//     nowKeys.add(key);


//     //only prints the conflict zone one time
//     if (!activeConflictKeys.has(key)) {
//       console.log(`LOSS OF SEPARATION START at T=${c.time}s between ${c.planeA} and ${c.planeB}`);
//     }
//   }


//   //conflicts that ended
//   for (const key of activeConflictKeys) {
//     if (!nowKeys.has(key)) {
//       console.log(`LOSS OF SEPARATION END at T=${T}s for ${key}`);
//     }
//   }


//   activeConflictKeys.clear();
//   for (const key of nowKeys) activeConflictKeys.add(key);


//   T += tickMs / 1000;
// }, tickMs);


module.exports = { checkConflicts };

