import type { Property, PropertyImage, PropertyStatus } from '@/types'

// Extends Property with fields that exist in the DB but not yet in the shared type
export interface MockProperty extends Property {
  bathrooms?: number
  category?:  string
}

// ─── Image factory ────────────────────────────────────────────────────────────
// Uses Picsum Photos (https://picsum.photos) — free, CDN-backed, seed-stable.
// Same seed always returns the same photograph, so gallery order is deterministic.
function mkImg(
  propId:  string,
  n:       number,
  seed:    string,
  primary = false,
): PropertyImage {
  return {
    id:          `mpi-${propId.replace('mock-', '')}-${n}`,
    property_id: propId,
    image_url:   `https://picsum.photos/seed/${seed}/800/600`,
    is_primary:  primary,
    sort_order:  n,
  }
}

// ─── Date constants ───────────────────────────────────────────────────────────
const SYS    = 'mock-system'
const D2025  = '2025-11-01T08:00:00.000Z'
const D2026A = '2026-01-15T10:30:00.000Z'
const D2026B = '2026-02-20T09:00:00.000Z'
const D2026C = '2026-03-05T11:00:00.000Z'

// ─── Mock properties ──────────────────────────────────────────────────────────
export const mockProperties: MockProperty[] = [

  // ── 1  HariHar Dham Colony · Mathura · Plot ───────────────────────────────
  {
    id:            'mock-1',
    property_id:   'DP-M001',
    title:         '200 Sq Yd Residential Plot — HariHar Dham Colony',
    description:
      'Vastu-friendly corner plot in the fast-developing HariHar Dham Colony, Mathura. ' +
      'Wide approach road, electricity & water connection available. 5 min from ' +
      'Krishna Janmabhoomi. Clear title with immediate possession.',
    city:          'Mathura',
    locality:      'HariHar Dham Colony',
    price:         4500000,
    property_type: 'plot',
    area_sqft:     200,
    bedrooms:      undefined,
    bathrooms:     undefined,
    category:      'residential',
    owner_name:    'Ramesh Kumar Sharma',
    owner_phone:   '+91-9876501234',
    status:        'available' as PropertyStatus,
    featured:      true,
    latitude:      27.4924,
    longitude:     77.6737,
    created_by:    SYS,
    created_at:    D2025,
    updated_at:    D2025,
    // Images: open plot → gated colony entrance → paved internal road → adjacent homes
    property_images: [
      mkImg('mock-1', 0, 'open-land-sunny-plot',      true),
      mkImg('mock-1', 1, 'colony-gated-main-entrance', false),
      mkImg('mock-1', 2, 'wide-paved-colony-road',     false),
      mkImg('mock-1', 3, 'nearby-completed-houses',    false),
    ],
  },

  // ── 2  HariHar Dham Colony · Mathura · Builder Floor ──────────────────────
  {
    id:            'mock-2',
    property_id:   'DP-M002',
    title:         '3 BHK Builder Floor — HariHar Dham Colony, Mathura',
    description:
      'Spacious double-height builder floor in HariHar Dham Colony. Italian marble ' +
      'flooring, modular kitchen, 2-car parking. Located on 30-ft road, 5 min to ' +
      'Mathura city centre. Immediate possession.',
    city:          'Mathura',
    locality:      'HariHar Dham Colony',
    price:         8500000,
    property_type: 'builder_floor',
    area_sqft:     1800,
    bedrooms:      3,
    bathrooms:     3,
    category:      'residential',
    owner_name:    'Sunita Devi Agarwal',
    owner_phone:   '+91-9811234567',
    status:        'available' as PropertyStatus,
    featured:      false,
    latitude:      27.4930,
    longitude:     77.6741,
    created_by:    SYS,
    created_at:    D2026A,
    updated_at:    D2026A,
    // Images: building exterior → ground-floor entry → 30-ft road → facade close-up → colony street
    property_images: [
      mkImg('mock-2', 0, 'builder-floor-front-elevation', true),
      mkImg('mock-2', 1, 'ground-floor-car-parking',      false),
      mkImg('mock-2', 2, 'thirty-foot-colony-road',       false),
      mkImg('mock-2', 3, 'residential-building-facade',   false),
      mkImg('mock-2', 4, 'colony-street-daytime',         false),
    ],
  },

  // ── 3  Mohan Dham Colony · Mathura · Plot ─────────────────────────────────
  {
    id:            'mock-3',
    property_id:   'DP-M003',
    title:         '150 Sq Yd Plot — Mohan Dham Colony, Mathura',
    description:
      'Prime residential plot in Mohan Dham Colony, Mathura. Surrounded by completed ' +
      'bungalows, 24-hr water supply. Gated colony entrance. 10 min to Vrindavan Road ' +
      'and NH-2 highway.',
    city:          'Mathura',
    locality:      'Mohan Dham Colony',
    price:         3200000,
    property_type: 'plot',
    area_sqft:     150,
    bedrooms:      undefined,
    bathrooms:     undefined,
    category:      'residential',
    owner_name:    'Gopal Prasad Gupta',
    owner_phone:   '+91-9760001122',
    status:        'available' as PropertyStatus,
    featured:      false,
    latitude:      27.5012,
    longitude:     77.6800,
    created_by:    SYS,
    created_at:    D2026A,
    updated_at:    D2026A,
    // Images: plot with boundary → gated entrance → surrounding bungalows → access road
    property_images: [
      mkImg('mock-3', 0, 'corner-plot-boundary-wall',  true),
      mkImg('mock-3', 1, 'decorative-colony-gate-arch', false),
      mkImg('mock-3', 2, 'bungalows-lined-colony',      false),
      mkImg('mock-3', 3, 'colony-internal-road-view',   false),
    ],
  },

  // ── 4  Mohan Dham Colony · Mathura · Apartment ────────────────────────────
  {
    id:            'mock-4',
    property_id:   'DP-M004',
    title:         '2 BHK Ready-to-Move Flat — Mohan Dham Colony',
    description:
      'Well-maintained 2 BHK apartment with attached balcony. Society amenities include ' +
      'lift, generator backup, and CCTV. Walking distance from Vrindavan Road bus stop. ' +
      'Perfect for end-use or rental investment.',
    city:          'Mathura',
    locality:      'Mohan Dham Colony',
    price:         5800000,
    property_type: 'apartment',
    area_sqft:     1100,
    bedrooms:      2,
    bathrooms:     2,
    category:      'residential',
    owner_name:    'Priya Nanda Verma',
    owner_phone:   '+91-9412345678',
    status:        'hold' as PropertyStatus,
    featured:      false,
    latitude:      27.5018,
    longitude:     77.6808,
    created_by:    SYS,
    created_at:    D2026B,
    updated_at:    D2026B,
    // Images: apartment block exterior → society entrance → balcony row → lift lobby → common garden
    property_images: [
      mkImg('mock-4', 0, 'apartment-block-mathura-view', true),
      mkImg('mock-4', 1, 'society-arch-entrance-gate',   false),
      mkImg('mock-4', 2, 'balcony-row-apartment-day',    false),
      mkImg('mock-4', 3, 'building-lobby-lift-area',     false),
      mkImg('mock-4', 4, 'society-garden-evening',       false),
    ],
  },

  // ── 5  Radha Kunj Residency · Vrindavan · Villa ───────────────────────────
  {
    id:            'mock-5',
    property_id:   'DP-V001',
    title:         'Premium Villa — Radha Kunj Residency, Vrindavan',
    description:
      'Luxurious 4 BHK villa with private garden in the coveted Radha Kunj Residency, ' +
      'Vrindavan. 24-hr security, clubhouse, swimming pool. 800 m from Prem Mandir. ' +
      'Temple-view from the terrace. A rare opportunity in Vrindavan.',
    city:          'Vrindavan',
    locality:      'Radha Kunj Residency',
    price:         18500000,
    property_type: 'villa',
    area_sqft:     3200,
    bedrooms:      4,
    bathrooms:     5,
    category:      'residential',
    owner_name:    'Ashok Lal Bansari',
    owner_phone:   '+91-9997654321',
    status:        'available' as PropertyStatus,
    featured:      true,
    latitude:      27.5743,
    longitude:     77.6516,
    created_by:    SYS,
    created_at:    D2025,
    updated_at:    D2025,
    // Images: villa front → private garden → main iron gate → terrace view → side elevation
    property_images: [
      mkImg('mock-5', 0, 'luxury-villa-front-vrindavan', true),
      mkImg('mock-5', 1, 'lush-private-garden-lawn',     false),
      mkImg('mock-5', 2, 'ornate-iron-gate-villa',       false),
      mkImg('mock-5', 3, 'rooftop-terrace-open-sky',     false),
      mkImg('mock-5', 4, 'villa-side-compound-wall',     false),
    ],
  },

  // ── 6  Banke Bihari Enclave · Vrindavan · Apartment ──────────────────────
  {
    id:            'mock-6',
    property_id:   'DP-V002',
    title:         '3 BHK Flat — Banke Bihari Enclave, Vrindavan',
    description:
      'Spacious 3 BHK on 4th floor in the serene Banke Bihari Enclave. Italian marble ' +
      'flooring, modular kitchen, power backup. Walking distance to Banke Bihari Temple ' +
      'and Nidhivan. Ideal for pilgrims seeking a permanent Vrindavan home.',
    city:          'Vrindavan',
    locality:      'Banke Bihari Enclave',
    price:         9500000,
    property_type: 'apartment',
    area_sqft:     1450,
    bedrooms:      3,
    bathrooms:     3,
    category:      'residential',
    owner_name:    'Kishori Lal Mishra',
    owner_phone:   '+91-9988776655',
    status:        'available' as PropertyStatus,
    featured:      true,
    latitude:      27.5770,
    longitude:     77.6508,
    created_by:    SYS,
    created_at:    D2026B,
    updated_at:    D2026B,
    // Images: apartment complex → clubhouse exterior → building lobby → 4th floor balcony
    property_images: [
      mkImg('mock-6', 0, 'apartment-complex-vrindavan',  true),
      mkImg('mock-6', 1, 'society-clubhouse-building',   false),
      mkImg('mock-6', 2, 'tiled-building-lobby-clean',   false),
      mkImg('mock-6', 3, 'apartment-balcony-open-view',  false),
    ],
  },

  // ── 7  Banke Bihari Enclave · Vrindavan · Shop ────────────────────────────
  {
    id:            'mock-7',
    property_id:   'DP-V003',
    title:         'Commercial Shop — Banke Bihari Enclave, Vrindavan',
    description:
      'Ground-floor corner shop in Banke Bihari Enclave on high-footfall pilgrim route. ' +
      '320 sq ft, dedicated parking, ideal for prasad shop, religious bookstore, or café. ' +
      'Rental income potential: ₹25,000/month.',
    city:          'Vrindavan',
    locality:      'Banke Bihari Enclave',
    price:         3800000,
    property_type: 'shop',
    area_sqft:     320,
    bedrooms:      undefined,
    bathrooms:     1,
    category:      'commercial',
    owner_name:    'Radha Raman Tiwari',
    owner_phone:   '+91-9876123456',
    status:        'available' as PropertyStatus,
    featured:      false,
    latitude:      27.5765,
    longitude:     77.6512,
    created_by:    SYS,
    created_at:    D2026C,
    updated_at:    D2026C,
    // Images: corner shop frontage → commercial strip street → parking bay → shop shutters
    property_images: [
      mkImg('mock-7', 0, 'corner-shop-frontage-day',     true),
      mkImg('mock-7', 1, 'commercial-strip-market-road', false),
      mkImg('mock-7', 2, 'ground-floor-parking-bay',     false),
      mkImg('mock-7', 3, 'retail-glass-shutter-facade',  false),
    ],
  },

  // ── 8  Govardhan Green City · Govardhan · Eco Plot ───────────────────────
  {
    id:            'mock-8',
    property_id:   'DP-G001',
    title:         '200 Sq Yd Eco Plot — Govardhan Green City',
    description:
      'RERA-approved residential plot in Govardhan Green City Township. Wide 40-ft ' +
      'internal roads, solar street lights, RWH system. 1.5 km from Govardhan Parikrama ' +
      'Marg. Excellent for weekend home or ashram-style living.',
    city:          'Govardhan',
    locality:      'Govardhan Green City',
    price:         2200000,
    property_type: 'plot',
    area_sqft:     200,
    bedrooms:      undefined,
    bathrooms:     undefined,
    category:      'residential',
    owner_name:    'Brij Mohan Yadav',
    owner_phone:   '+91-9456789012',
    status:        'available' as PropertyStatus,
    featured:      false,
    latitude:      27.4977,
    longitude:     77.4730,
    created_by:    SYS,
    created_at:    D2026A,
    updated_at:    D2026A,
    // Images: open eco plot → township main gate → solar-lit road → green belt
    property_images: [
      mkImg('mock-8', 0, 'eco-township-open-plot-green', true),
      mkImg('mock-8', 1, 'township-main-gate-govardhan', false),
      mkImg('mock-8', 2, 'wide-40ft-solar-lit-road',     false),
      mkImg('mock-8', 3, 'green-belt-tree-plantation',   false),
    ],
  },

  // ── 9  Govardhan Green City · Govardhan · Ashram Villa ────────────────────
  {
    id:            'mock-9',
    property_id:   'DP-G002',
    title:         '2 BHK Ashram-Style Villa — Govardhan Green City',
    description:
      'Serene 2 BHK villa with cow-dung plastered walls, tulsi garden, and rooftop ' +
      'terrace with Govardhan Hill view. Rainwater harvesting, solar panels. Perfect ' +
      'for spiritual retreat or permanent residence near Govardhan Dham.',
    city:          'Govardhan',
    locality:      'Govardhan Green City',
    price:         5600000,
    property_type: 'villa',
    area_sqft:     900,
    bedrooms:      2,
    bathrooms:     2,
    category:      'residential',
    owner_name:    'Madan Gopal Sharma',
    owner_phone:   '+91-9334455667',
    status:        'requirement' as PropertyStatus,
    featured:      false,
    latitude:      27.4982,
    longitude:     77.4738,
    created_by:    SYS,
    created_at:    D2026B,
    updated_at:    D2026B,
    // Images: eco villa exterior → tulsi courtyard → rooftop terrace → solar panels → garden view
    property_images: [
      mkImg('mock-9', 0, 'ashram-villa-earthy-exterior', true),
      mkImg('mock-9', 1, 'tulsi-plant-courtyard-home',   false),
      mkImg('mock-9', 2, 'rooftop-terrace-hill-view',    false),
      mkImg('mock-9', 3, 'solar-panels-terrace-roof',    false),
      mkImg('mock-9', 4, 'organic-garden-backyard',      false),
    ],
  },

  // ── 10  Parikrama Marg · Govardhan · Plot ─────────────────────────────────
  {
    id:            'mock-10',
    property_id:   'DP-G003',
    title:         '100 Sq Yd Plot on Parikrama Marg — Govardhan',
    description:
      'Rare plot directly on the sacred Govardhan Parikrama Marg. High footfall area, ' +
      'suitable for dharamshala, yatri niwas, or residential use. All utilities at ' +
      'boundary. Registry and NOC in place.',
    city:          'Govardhan',
    locality:      'Parikrama Marg',
    price:         1800000,
    property_type: 'plot',
    area_sqft:     100,
    bedrooms:      undefined,
    bathrooms:     undefined,
    category:      'residential',
    owner_name:    'Shyam Sundar Das',
    owner_phone:   '+91-9012345678',
    status:        'available' as PropertyStatus,
    featured:      false,
    latitude:      27.4961,
    longitude:     77.4715,
    created_by:    SYS,
    created_at:    D2026C,
    updated_at:    D2026C,
    // Images: road-facing plot → parikrama path street → surrounding land → utility pole at boundary
    property_images: [
      mkImg('mock-10', 0, 'road-facing-open-plot-small', true),
      mkImg('mock-10', 1, 'parikrama-marg-pilgrims-road', false),
      mkImg('mock-10', 2, 'surrounding-open-land-govardhan', false),
    ],
  },
]

// ─── Lookup helpers ───────────────────────────────────────────────────────────

/** Find a mock property by its `id` field (e.g. 'mock-5') */
export function getMockById(id: string): MockProperty | undefined {
  return mockProperties.find(p => p.id === id)
}

/** Returns true when the id looks like a mock id */
export function isMockId(id: string): boolean {
  return id.startsWith('mock-')
}
