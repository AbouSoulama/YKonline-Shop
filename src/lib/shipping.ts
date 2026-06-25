import { STORE_ADDRESS, STORE_COORDS, SHIPPING_RATE_PER_KM } from "../constants/site";

interface Coords {
  lat: number;
  lng: number;
}

const US_FLAT_STANDARD = 5.99;
const US_FLAT_EXPRESS = 9.99;
const MAX_DISTANCE_KM = 800;
const MAX_SHIPPING_COST = 49;

function isUnitedStates(country: string): boolean {
  const c = country.trim().toLowerCase();
  return c === "united states" || c === "usa" || c === "us" || c === "united states of america";
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

async function geocode(address: string, country?: string): Promise<Coords | null> {
  try {
    const query = encodeURIComponent(address);
    const countryCode = country && isUnitedStates(country) ? "&countrycodes=us" : "";
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1${countryCode}`,
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
  if (isUnitedStates(country)) {
    return { distanceKm: 0, cost: US_FLAT_STANDARD, expressCost: US_FLAT_EXPRESS };
  }

  const fullAddress = `${address}, ${city}, ${country}`;
  const destination = await geocode(fullAddress, country)
    ?? await geocode(`${city}, ${country}`, country);

  const dest = destination ?? STORE_COORDS;
  let distanceKm = Math.round(haversineKm(STORE_COORDS, dest) * 10) / 10;

  if (distanceKm > MAX_DISTANCE_KM) {
    distanceKm = MAX_DISTANCE_KM;
  }

  const rawCost = Math.round(distanceKm * SHIPPING_RATE_PER_KM * 100) / 100;
  const cost = Math.min(Math.max(rawCost, SHIPPING_RATE_PER_KM), MAX_SHIPPING_COST);
  const expressCost = Math.min(Math.round(cost * 1.5 * 100) / 100, MAX_SHIPPING_COST + 10);

  return { distanceKm, cost, expressCost };
}

export { STORE_ADDRESS };
