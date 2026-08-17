// Fiber coverage zones in Kinshasa, RDC
// Each zone represents a commune/area where Liquid Home fiber is available
// Coordinates are approximate bounding polygons around major Kinshasa communes

export interface CoverageZone {
  id: string;
  name: string;
  commune: string;
  // Polygon coordinates [lat, lng]
  polygon: [number, number][];
  status: "available" | "coming-soon";
  color: string;
}

export const KINSHASA_CENTER: [number, number] = [-4.315704, 15.285092];

export const COVERAGE_ZONES: CoverageZone[] = [
  {
    id: "gombe",
    name: "Gombe",
    commune: "Gombe",
    status: "available",
    color: "#F89E3C",
    polygon: [
      [-4.3125, 15.2820],
      [-4.3120, 15.3010],
      [-4.3280, 15.3020],
      [-4.3310, 15.2870],
      [-4.3260, 15.2790],
      [-4.3125, 15.2820],
    ],
  },
  {
    id: "ngaliema",
    name: "Ngaliema",
    commune: "Ngaliema",
    status: "available",
    color: "#F89E3C",
    polygon: [
      [-4.3260, 15.2790],
      [-4.3310, 15.2870],
      [-4.3450, 15.2880],
      [-4.3460, 15.2730],
      [-4.3350, 15.2680],
      [-4.3260, 15.2790],
    ],
  },
  {
    id: "kintambo",
    name: "Kintambo",
    commune: "Kintambo",
    status: "available",
    color: "#F89E3C",
    polygon: [
      [-4.3350, 15.2680],
      [-4.3460, 15.2730],
      [-4.3460, 15.2880],
      [-4.3310, 15.2870],
      [-4.3260, 15.2790],
      [-4.3350, 15.2680],
    ],
  },
  {
    id: "bandalungwa",
    name: "Bandalungwa",
    commune: "Bandalungwa",
    status: "available",
    color: "#F89E3C",
    polygon: [
      [-4.3310, 15.2870],
      [-4.3450, 15.2880],
      [-4.3520, 15.2950],
      [-4.3480, 15.3020],
      [-4.3350, 15.3025],
      [-4.3310, 15.2870],
    ],
  },
  {
    id: "kasa-vubu",
    name: "Kasa-Vubu",
    commune: "Kasa-Vubu",
    status: "available",
    color: "#F89E3C",
    polygon: [
      [-4.3350, 15.3025],
      [-4.3480, 15.3020],
      [-4.3520, 15.3120],
      [-4.3383, 15.3120],
      [-4.3350, 15.3025],
    ],
  },
  {
    id: "limete",
    name: "Limete",
    commune: "Limete",
    status: "available",
    color: "#F89E3C",
    polygon: [
      [-4.3383, 15.3120],
      [-4.3520, 15.3120],
      [-4.3550, 15.3250],
      [-4.3417, 15.3280],
      [-4.3360, 15.3150],
      [-4.3383, 15.3120],
    ],
  },
  {
    id: "lemba",
    name: "Lemba",
    commune: "Lemba",
    status: "available",
    color: "#F89E3C",
    polygon: [
      [-4.3417, 15.3280],
      [-4.3550, 15.3250],
      [-4.3617, 15.3400],
      [-4.3550, 15.3500],
      [-4.3450, 15.3450],
      [-4.3417, 15.3280],
    ],
  },
  {
    id: "ngiri-ngiri",
    name: "Ngiri-Ngiri",
    commune: "Ngiri-Ngiri",
    status: "available",
    color: "#F89E3C",
    polygon: [
      [-4.3520, 15.3120],
      [-4.3550, 15.3250],
      [-4.3650, 15.3225],
      [-4.3620, 15.3100],
      [-4.3520, 15.3120],
    ],
  },
  {
    id: "selembao",
    name: "Selembao",
    commune: "Selembao",
    status: "coming-soon",
    color: "#888888",
    polygon: [
      [-4.3550, 15.2950],
      [-4.3700, 15.2950],
      [-4.3750, 15.3100],
      [-4.3650, 15.3225],
      [-4.3550, 15.3250],
      [-4.3520, 15.3120],
      [-4.3480, 15.3020],
      [-4.3550, 15.2950],
    ],
  },
  {
    id: "bumbu",
    name: "Bumbu",
    commune: "Bumbu",
    status: "coming-soon",
    color: "#888888",
    polygon: [
      [-4.3750, 15.3100],
      [-4.3900, 15.3150],
      [-4.3950, 15.3250],
      [-4.3850, 15.3350],
      [-4.3700, 15.3300],
      [-4.3650, 15.3225],
      [-4.3750, 15.3100],
    ],
  },
  {
    id: "makala",
    name: "Makala",
    commune: "Makala",
    status: "coming-soon",
    color: "#888888",
    polygon: [
      [-4.3850, 15.3350],
      [-4.3950, 15.3250],
      [-4.4050, 15.3300],
      [-4.4020, 15.3450],
      [-4.3900, 15.3450],
      [-4.3850, 15.3350],
    ],
  },
  {
    id: "kinshasa-centre",
    name: "Kinshasa Centre",
    commune: "Centre-ville",
    status: "available",
    color: "#F89E3C",
    polygon: [
      [-4.3125, 15.2820],
      [-4.3260, 15.2790],
      [-4.3350, 15.2680],
      [-4.3280, 15.2580],
      [-4.3150, 15.2620],
      [-4.3100, 15.2750],
      [-4.3125, 15.2820],
    ],
  },
];

export function findZoneAt(lat: number, lng: number): CoverageZone | null {
  // 1. Ray-casting point-in-polygon algorithm
  for (const zone of COVERAGE_ZONES) {
    if (pointInPolygon([lat, lng], zone.polygon)) {
      return zone;
    }
  }

  // 2. Tolerance check for close border points (within ~600m)
  for (const zone of COVERAGE_ZONES) {
    let minLat = Infinity,
      maxLat = -Infinity,
      minLng = Infinity,
      maxLng = -Infinity;
    for (const [zLat, zLng] of zone.polygon) {
      if (zLat < minLat) minLat = zLat;
      if (zLat > maxLat) maxLat = zLat;
      if (zLng < minLng) minLng = zLng;
      if (zLng > maxLng) maxLng = zLng;
    }
    const pad = 0.003;
    if (lat >= minLat - pad && lat <= maxLat + pad && lng >= minLng - pad && lng <= maxLng + pad) {
      return zone;
    }
  }

  return null;
}

function pointInPolygon(point: [number, number], polygon: [number, number][]): boolean {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}
