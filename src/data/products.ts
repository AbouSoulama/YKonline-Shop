export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  longDescription: string;
  price: number;
  oldPrice?: number;
  size: string;
  type: "Raw" | "Whipped" | "Set";
  usage: string[];
  image: string;
  gallery: string[];
  rating: number;
  reviews: number;
  stock: number;
  badge?: string;
  ingredients: string;
  storage: string;
  benefits: string[];
  howToUse: { area: string; method: string }[];
}

// Use SVG data URIs for fast, reliable, offline-friendly imagery
const img = (label: string, tone: "raw" | "whipped" | "set" = "raw") => {
  const palettes = {
    raw: { bg: "#FAF3E7", jar: "#8B5A2B", accent: "#0B6623", text: "#0B6623" },
    whipped: { bg: "#fff1e0", jar: "#FF7900", accent: "#FF7900", text: "#8B5A2B" },
    set: { bg: "#e8f3ea", jar: "#0B6623", accent: "#FF7900", text: "#0B6623" },
  };
  const p = palettes[tone];
  const svg = `
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='0' y2='1'>
        <stop offset='0%' stop-color='${p.bg}'/>
        <stop offset='100%' stop-color='#ffffff'/>
      </linearGradient>
      <radialGradient id='s' cx='50%' cy='30%' r='60%'>
        <stop offset='0%' stop-color='${p.jar}' stop-opacity='0.95'/>
        <stop offset='100%' stop-color='${p.jar}' stop-opacity='0.75'/>
      </radialGradient>
    </defs>
    <rect width='600' height='600' fill='url(#g)'/>
    <circle cx='120' cy='120' r='50' fill='${p.accent}' opacity='0.15'/>
    <circle cx='500' cy='480' r='70' fill='${p.accent}' opacity='0.1'/>
    <g transform='translate(300 330)'>
      <ellipse cx='0' cy='140' rx='150' ry='20' fill='#000' opacity='0.08'/>
      <rect x='-130' y='-150' width='260' height='280' rx='24' fill='url(#s)'/>
      <rect x='-130' y='-170' width='260' height='40' rx='12' fill='${p.jar}'/>
      <rect x='-100' y='-60' width='200' height='130' rx='10' fill='#ffffff' opacity='0.95'/>
      <text x='0' y='-20' text-anchor='middle' font-family='Poppins, sans-serif' font-size='22' font-weight='700' fill='${p.text}'>YKonline</text>
      <text x='0' y='10' text-anchor='middle' font-family='Poppins, sans-serif' font-size='16' font-weight='600' fill='${p.accent}'>SHEA BUTTER</text>
      <text x='0' y='45' text-anchor='middle' font-family='Open Sans, sans-serif' font-size='14' fill='#6b7280'>${label}</text>
    </g>
    <text x='300' y='80' text-anchor='middle' font-family='Poppins, sans-serif' font-size='28' font-weight='700' fill='${p.text}'>Organic | Natural</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const RAW_IMAGE = "/images/raw-shea-jar.jpg";
const WHIPPED_IMAGE = "/images/whipped-shea-jar.jpg";
const SET_IMAGE = "/images/shea-discovery-set.jpg";

export const products: Product[] = [
  {
    id: "raw-100g",
    name: "Unrefined Organic Raw Shea Butter",
    tagline: "The ideal size to discover the benefits of natural shea.",
    description:
      "An organic raw shea butter, rich and versatile, perfect for nourishing dry areas, softening skin and caring for hair.",
    longDescription:
      "A pure, unrefined organic shea butter selected for its richness and authenticity. Its generous texture melts upon contact with the warmth of your hands and helps provide comfort, softness and suppleness to the skin. Ideal for body, hands, feet, hair and massage, a versatile beauty essential for the whole family.",
    price: 12.9,
    oldPrice: 14.9,
    size: "100g",
    type: "Raw",
    usage: ["Skin", "Hair", "Baby/Family", "Massage"],
    image: RAW_IMAGE,
    gallery: [RAW_IMAGE, img("100g Raw", "raw"), img("Texture", "raw")],
    rating: 4.9,
    reviews: 248,
    stock: 120,
    badge: "Best Seller",
    ingredients: "Butyrospermum Parkii Butter. 100% pure, unrefined, organic.",
    storage: "Store in a dry place, away from heat and direct light.",
    benefits: [
      "Nourishes dry areas of the body",
      "Contributes to skin comfort and softness",
      "Protects and helps soften hair lengths",
      "Versatile use for the whole family",
    ],
    howToUse: [
      { area: "Body", method: "Take a small amount, warm between hands, then apply to the body." },
      { area: "Skin", method: "Massage onto clean skin, focusing on dry areas (elbows, knees, feet)." },
      { area: "Hair", method: "Apply to lengths and ends, or as an oil treatment before shampoo." },
      { area: "Feet & Hands", method: "Apply generously in the evening for soft, nourished skin." },
    ],
  },
  {
    id: "raw-250g",
    name: "Unrefined Organic Raw Shea Butter",
    tagline: "The essential natural care for the whole family.",
    description:
      "Generous size for regular use. Rich, natural and versatile, it accompanies the beauty routines of the whole family.",
    longDescription:
      "Our 250g format is perfect for regular use. Pure, unrefined and organic, this shea butter accompanies your daily beauty routine and helps nourish, protect and soften your skin and hair naturally.",
    price: 24.9,
    oldPrice: 28.9,
    size: "250g",
    type: "Raw",
    usage: ["Skin", "Hair", "Baby/Family", "Massage"],
    image: RAW_IMAGE,
    gallery: [RAW_IMAGE, img("250g Raw", "raw"), img("Family", "raw")],
    rating: 4.95,
    reviews: 412,
    stock: 80,
    badge: "Most Popular",
    ingredients: "Butyrospermum Parkii Butter. 100% pure, unrefined, organic.",
    storage: "Store in a dry place, away from heat and direct light.",
    benefits: [
      "Nourishes the skin durably",
      "Protects against skin dryness",
      "Softens rough areas",
      "Suitable for the whole family",
    ],
    howToUse: [
      { area: "Body", method: "Take a small amount, warm between hands, then apply to the body." },
      { area: "Skin", method: "Massage onto clean skin, focusing on dry areas." },
      { area: "Hair", method: "Apply to lengths and ends, or as an oil treatment before shampoo." },
      { area: "Feet & Hands", method: "Apply generously in the evening." },
    ],
  },
  {
    id: "raw-500g",
    name: "Unrefined Organic Raw Shea Butter",
    tagline: "The large economical size for regular routines.",
    description:
      "Ideal for families, frequent use or natural care enthusiasts. Body care, hands and feet, hair, massage, homemade cosmetic preparation.",
    longDescription:
      "Our 500g family size offers the best value for money. Perfect for daily use by the whole family, for lovers of natural care, or for the preparation of homemade cosmetics.",
    price: 42.9,
    oldPrice: 49.9,
    size: "500g",
    type: "Raw",
    usage: ["Skin", "Hair", "Baby/Family", "Massage"],
    image: RAW_IMAGE,
    gallery: [RAW_IMAGE, img("500g Raw", "raw"), img("Family", "raw")],
    rating: 4.9,
    reviews: 189,
    stock: 45,
    badge: "Best Value",
    ingredients: "Butyrospermum Parkii Butter. 100% pure, unrefined, organic.",
    storage: "Store in a dry place, away from heat and direct light.",
    benefits: [
      "Excellent value for money",
      "Suitable for families and intensive use",
      "Perfect for homemade cosmetic preparations",
      "Multi-purpose: body, hair, massage",
    ],
    howToUse: [
      { area: "Body", method: "Apply a small amount after showering on damp skin." },
      { area: "Hair", method: "Oil treatment before shampoo or daily care on lengths." },
      { area: "Massage", method: "Warm and use as a massage butter for a relaxing moment." },
      { area: "DIY", method: "Base ingredient for your homemade cosmetic recipes." },
    ],
  },
  {
    id: "whipped-150ml",
    name: "Organic Whipped Shea Butter",
    tagline: "All the richness of shea in a light and airy texture.",
    description:
      "Whipped texture that melts quickly on the skin. Perfect for those who love generous yet easy-to-use care products.",
    longDescription:
      "A light, airy, whipped shea butter that penetrates quickly without leaving a greasy film. All the richness of organic shea, in a texture that is easy to apply and pleasant to use every day.",
    price: 19.9,
    oldPrice: 22.9,
    size: "150ml",
    type: "Whipped",
    usage: ["Skin", "Hair", "Baby/Family"],
    image: WHIPPED_IMAGE,
    gallery: [WHIPPED_IMAGE, img("150ml Whipped", "whipped"), img("Texture", "whipped")],
    rating: 4.85,
    reviews: 310,
    stock: 90,
    badge: "New",
    ingredients: "Butyrospermum Parkii Butter, whipped. 100% natural, organic.",
    storage: "Store in a cool, dry place away from direct sunlight.",
    benefits: [
      "Light, airy texture",
      "Fast absorption, non-greasy finish",
      "Nourishes and softens the skin",
      "Pleasant, delicate scent",
    ],
    howToUse: [
      { area: "Body", method: "Apply generously after showering on clean, damp skin." },
      { area: "Face", method: "A small amount is enough for soft, nourished skin." },
      { area: "Hair", method: "Apply a dab to lengths and ends to soften hair." },
      { area: "Hands", method: "Use daily for soft, protected hands." },
    ],
  },
  {
    id: "discovery-set",
    name: "YKonline Shop Discovery Set",
    tagline: "The ideal set to discover or gift natural shea care.",
    description:
      "A selection of products to create a complete natural beauty routine. Ideal for gifting, discovery or travel.",
    longDescription:
      "Our Discovery Set brings together our most popular products in a practical, gift-ready format. Perfect for discovering the benefits of natural shea butter, treating yourself, or offering a thoughtful gift.",
    price: 39.9,
    oldPrice: 49.9,
    size: "Set",
    type: "Set",
    usage: ["Skin", "Hair", "Baby/Family"],
    image: SET_IMAGE,
    gallery: [SET_IMAGE, img("Gift", "set"), img("Routine", "set")],
    rating: 5,
    reviews: 156,
    stock: 30,
    badge: "Gift Idea",
    ingredients: "Butyrospermum Parkii Butter. Multiple formats included.",
    storage: "Store in a dry place, away from heat and direct light.",
    benefits: [
      "Complete natural beauty routine",
      "Perfect for first orders or discovery",
      "Ideal as a gift",
      "Travel-friendly format",
    ],
    howToUse: [
      { area: "Morning", method: "A small amount of whipped butter to start the day." },
      { area: "Evening", method: "Raw butter for nourishing night-time care." },
      { area: "Once a week", method: "Hair oil treatment for soft, nourished lengths." },
      { area: "As needed", method: "Targeted application on dry areas." },
    ],
  },
  {
    id: "family-pack",
    name: "Family Shea Butter Pack",
    tagline: "The generous pack for the whole family's natural care.",
    description:
      "A generous pack combining raw and whipped shea butter to meet the needs of the whole family, from the youngest to the oldest.",
    longDescription:
      "The Family Pack is our most complete offer. It includes a large jar of raw shea butter and a jar of whipped butter, so that each member of the family can find the texture and use that suits them best.",
    price: 59.9,
    oldPrice: 72.9,
    size: "Pack",
    type: "Set",
    usage: ["Skin", "Hair", "Baby/Family", "Massage"],
    image: SET_IMAGE,
    gallery: [SET_IMAGE, img("Family", "set"), img("Routine", "set")],
    rating: 4.95,
    reviews: 98,
    stock: 25,
    badge: "Family",
    ingredients: "Butyrospermum Parkii Butter. Raw and whipped formats.",
    storage: "Store in a dry place, away from heat and direct light.",
    benefits: [
      "Two textures for the whole family",
      "Excellent value for money",
      "Multi-purpose uses",
      "Authentic, natural product",
    ],
    howToUse: [
      { area: "Adults", method: "Raw butter for rich, nourishing body care." },
      { area: "Children", method: "Whipped butter for light, easy-to-apply care." },
      { area: "Hair", method: "Raw butter as an oil treatment, whipped for daily use." },
      { area: "Massage", method: "Warm raw butter for a relaxing family massage." },
    ],
  },
];

export const getProductById = (id: string) => products.find((p) => p.id === id);

export const getRelatedProducts = (id: string, limit = 4) =>
  products.filter((p) => p.id !== id).slice(0, limit);
