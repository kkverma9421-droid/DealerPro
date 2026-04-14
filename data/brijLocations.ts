export interface BrijCity {
  name:       string
  district:   string
  region:     string
  localities: string[]
}

// Primary Brij / Mathura district coverage
// Add Agra, Noida, Delhi NCR at the bottom when needed
export const BRIJ_CITIES: BrijCity[] = [
  {
    name: 'Mathura',
    district: 'Mathura',
    region: 'Brij',
    localities: [
      'Krishna Nagar',
      'Dampier Nagar',
      'Civil Lines',
      'Govind Nagar',
      'Janam Bhumi Area',
      'NH-2 Delhi Highway',
      'Vrindavan Road',
      'Chhatikara Road',
      'Township',
      'Masani Road',
      'Deeg Gate',
      'Holi Gate',
      'Bhadravan',
      'Old City',
      'Railway Station Area',
      'Mathura Junction Road',
      'Yatri Niwas Area',
      'Sarojini Nagar',
      'Aurangabad',
      'Kans Qila Road',
      'Vikas Nagar',
      'Shastri Nagar',
      'Rameshwar Nagar',
      'Prem Nagar',
      'Pushkar Nagar',
      'Radha Nagar',
      'Agra Road',
      'Aligarh Road',
      'Industrial Area',
      'Mandi Samiti Area',
    ],
  },
  {
    name: 'Vrindavan',
    district: 'Mathura',
    region: 'Brij',
    localities: [
      'Raman Reti',
      'VIP Road',
      'Parikrama Marg',
      'Chhatikara Road',
      'ISKCON Road',
      'Sunrakh Road',
      'Prem Mandir Area',
      'Akshay Patra Area',
      'Pagal Baba Area',
      'Banke Bihari Temple Area',
      'Nidhivan Area',
      'Govind Nagar',
      'Bhaktivedanta Swami Marg',
      'Kaliya Ghat Road',
      'Kesi Ghat Road',
      'Madhuvan Area',
      'Shahji Temple Road',
      'Radha Damodar Area',
      'Mathura Road',
      'Madan Mohan Area',
      'Seva Kunj Road',
      'Old Vrindavan',
      'New Colony',
      'Raskhan Road',
      'Gopeshwar Road',
    ],
  },
  {
    name: 'Govardhan',
    district: 'Mathura',
    region: 'Brij',
    localities: [
      'Parikrama Marg',
      'Radha Kund Road',
      'Shyam Kund Area',
      'Jatipura',
      'Manasi Ganga Area',
      'Mukut Mukharvind Area',
      'Dan Ghati Temple Road',
      'Punchari Ka Lota Area',
      'Apsara Kund Area',
      'Main Bazar',
      'Mathura Road',
      'Aamna Village',
      'Annakut Area',
    ],
  },
  {
    name: 'Barsana',
    district: 'Mathura',
    region: 'Brij',
    localities: [
      'Ladli Ji Temple Area',
      'Main Market',
      'Maan Garh Road',
      'Parikrama Marg',
      'Radha Rani Temple Road',
      'Nandgaon Road',
      'Vrishabhanu Kund Area',
      'Kusum Sarovar Road',
      'Pili Pokhar Area',
      'Old Barsana',
    ],
  },
  {
    name: 'Gokul',
    district: 'Mathura',
    region: 'Brij',
    localities: [
      'Raman Reti',
      'Gokul Barrage Area',
      'Brahmaand Ghat Road',
      'Thakurani Ghat Area',
      'Navneet Priya Temple Area',
      'Chintaharan Ghat Road',
      'Yamuna Kinare',
      'Main Road Gokul',
      'Mathura Road',
    ],
  },
  {
    name: 'Baldeo',
    district: 'Mathura',
    region: 'Brij',
    localities: [
      'Dauji Temple Area',
      'Main Bazar Baldeo',
      'Kshirsagar Kund Road',
      'Yamuna Road',
      'Mathura Road Baldeo',
      'Old Town Baldeo',
      'Market Area',
    ],
  },
  {
    name: 'Chhata',
    district: 'Mathura',
    region: 'Brij',
    localities: [
      'Main Market Chhata',
      'NH-2 Highway',
      'Agra Road',
      'Mathura Road',
      'Bazar Area',
      'Transport Nagar',
      'Anaj Mandi Area',
      'Railway Station Road',
    ],
  },
  {
    name: 'Kosi Kalan',
    district: 'Mathura',
    region: 'Brij',
    localities: [
      'Main Market Kosi',
      'NH-2 Highway',
      'Mathura Road',
      'Delhi Road',
      'Govardhan Road',
      'Bazar Kosi',
      'Anaj Mandi',
      'Industrial Area Kosi',
      'New Colony',
    ],
  },
  {
    name: 'Raya',
    district: 'Mathura',
    region: 'Brij',
    localities: [
      'Main Bazar Raya',
      'Mathura Road',
      'Agra Road',
      'NH-19 Bypass',
      'Yamuna Kinare',
      'Market Area',
      'Old Town Raya',
    ],
  },
  {
    name: 'Nandgaon',
    district: 'Mathura',
    region: 'Brij',
    localities: [
      'Nand Bhavan Temple Area',
      'Main Bazar Nandgaon',
      'Barsana Road',
      'Parikrama Marg',
      'Pavana Sarovar Road',
      'Ter Kadamba Area',
      'Old Village Nandgaon',
    ],
  },
  {
    name: 'Farah',
    district: 'Mathura',
    region: 'Brij',
    localities: [
      'Main Market Farah',
      'Agra Road',
      'Mathura Road',
      'Yamuna Road',
      'Old Town Farah',
      'Market Area',
    ],
  },
  {
    name: 'Mahavan',
    district: 'Mathura',
    region: 'Brij',
    localities: [
      'Brahmaand Ghat Area',
      'Yamuna Kinare',
      'Main Bazar Mahavan',
      'Gokul Road',
      'Mathura Road',
      'Old Town Mahavan',
    ],
  },
]

// ─── Lookup helpers ────────────────────────────────────────────────────────────

export const CITY_NAMES = BRIJ_CITIES.map(c => c.name)

export function getLocalities(cityName: string): string[] {
  return BRIJ_CITIES.find(c => c.name === cityName)?.localities ?? []
}

export function searchCities(query: string): BrijCity[] {
  if (!query.trim()) return BRIJ_CITIES
  const q = query.toLowerCase()
  return BRIJ_CITIES.filter(
    c =>
      c.name.toLowerCase().includes(q) ||
      c.region.toLowerCase().includes(q) ||
      c.district.toLowerCase().includes(q)
  )
}

export function searchLocalities(cityName: string, query: string): string[] {
  const all = getLocalities(cityName)
  if (!query.trim()) return all
  const q = query.toLowerCase()
  return all.filter(l => l.toLowerCase().includes(q))
}