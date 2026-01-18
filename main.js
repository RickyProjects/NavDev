const EARTH_RADIUS_M = 6371000;
const NM_TO_M = 1852;
const FT_TO_M = 0.3048;

const HORIZONTAL_LIMIT_M = 5 * NM_TO_M; // 5 NM
const VERTICAL_LIMIT_FT = 2000;         // 2000 ft

function toRad(deg) { return (deg * Math.PI) / 180; }
function toDeg(rad) { return (rad * 180) / Math.PI; }
function clamp01(x) { return Math.max(0, Math.min(1, x)); }

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

function interpolateGreatCircle(start, end, u) {
  const lat1 = toRad(start.lat), lon1 = toRad(start.lon);
  const lat2 = toRad(end.lat),   lon2 = toRad(end.lon);

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

  const dot = Math.max(-1, Math.min(1, A.x * B.x + A.y * B.y + A.z * B.z));
  const omega = Math.acos(dot);

  if (omega < 1e-12) return { lat: start.lat, lon: start.lon };

  const sinOmega = Math.sin(omega);
  const k1 = Math.sin((1 - u) * omega) / sinOmega;
  const k2 = Math.sin(u * omega) / sinOmega;

  const x = k1 * A.x + k2 * B.x;
  const y = k1 * A.y + k2 * B.y;
  const z = k1 * A.z + k2 * B.z;

  const lat = Math.atan2(z, Math.hypot(x, y));
  const lon = Math.atan2(y, x);

  return { lat: toDeg(lat), lon: toDeg(lon) };
}

function planeStateAtTime(plane, T) {
  if (T < plane.departureTime) return { active: false, reason: "waiting" };

  const tau = T - plane.departureTime;

  if (tau < 300) return { active: false, reason: "climb phase" };

  const totalDistM = haversineMeters(plane.from, plane.to);

  const speedMps =
    (plane.speedMps != null) ? plane.speedMps
    : (plane.speed != null) ? plane.speed * 0.514444
    : 0;

  if (speedMps <= 0) return { active: false, reason: "invalid speed" };

  const duration = totalDistM / speedMps;

  if (duration - tau < 300) return { active: false, reason: "descent phase" };

  const u = clamp01(tau / duration);

  if (u >= 1) return { active: false, reason: "arrived" };

  const pos = interpolateGreatCircle(plane.from, plane.to, u);
  const altitudeFt = plane.altitudeFt;

  return { active: true, id: plane.id, pos, altitudeFt };
}

function isLossOfSeparation(stateA, stateB) {
  const horizM = haversineMeters(stateA.pos, stateB.pos);
  const vertFt = Math.abs(stateA.altitudeFt - stateB.altitudeFt);
  return horizM < HORIZONTAL_LIMIT_M && vertFt < VERTICAL_LIMIT_FT;
}

function checkConflicts(planes, T) {
  const activeStates = [];
  for (const plane of planes) {
    const s = planeStateAtTime(plane, T);
    if (s.active) activeStates.push(s);
  }

  const conflicts = [];
  for (let i = 0; i < activeStates.length; i++) {
    for (let j = i + 1; j < activeStates.length; j++) {
      const A = activeStates[i];
      const B = activeStates[j];
      if (isLossOfSeparation(A, B)) {
        conflicts.push({ time: T, planeA: A.id, planeB: B.id });
      }
    }
  }
  return conflicts;
}

// expose to browser
window.checkConflicts = checkConflicts;
