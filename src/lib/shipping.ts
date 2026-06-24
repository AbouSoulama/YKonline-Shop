import { STORE_ADDRESS, STORE_COORDS, SHIPPING_RATE_PER_KM } from "../constants/site";

interface Coords {
  lat: number;
  lng: number;
}

function haversineKm(a: Coords, b: Coords): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

async function geocode(address: string): Promise<Coords | null> {
  try {
    const query = encodeURIComponent(address);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`,
      { headers: { "Accept-Language": "en", "User-Agent": "YKonlineShop/1.0 (contact@ykonline.shop)" } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.[0]) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

export interface ShippingQuote {
  distanceKm: number;
  cost: number;
  expressCost: number;
}

export async function calculateShipping(address: string, city: string, country: string): Promise<ShippingQuote> {
  const fullAddress = `${address}, ${city}, ${country}`;
  const destination = await geocode(fullAddress);

  if (!destination) {
    // Fallback: estimate from store using partial geocode
    const cityCoords = await geocode(`${city}, ${country}`);
    const dest = cityCoords ?? STORE_COORDS;
    const distanceKm = Math.round(haversineKm(STORE_COORDS, dest) * 10) / 10;
    const cost = Math.round(distanceKm * SHIPPING_RATE_PER_KM * 100) / 100;
    return { distanceKm, cost: Math.max(cost, SHIPPING_RATE_PER_KM), expressCost: Math.round(cost * 1.5 * 100) / 100 };
  }

  const distanceKm = Math.round(haversineKm(STORE_COORDS, destination) * 10) / 10;
  const cost = Math.round(distanceKm * SHIPPING_RATE_PER_KM * 100) / 100;

  return {
    distanceKm,
    cost: Math.max(cost, SHIPPING_RATE_PER_KM),
    expressCost: Math.round(Math.max(cost, SHIPPING_RATE_PER_KM) * 1.5 * 100) / 100,
  };
}

export { STORE_ADDRESS };
