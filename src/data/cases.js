/* The case studies, all within Karakalpakstan.

   `lat`/`lon` are the districts' real coordinates — RegionMap projects them
   through the map's georeference, so no pin is positioned by eye. Districts
   were chosen partly for spread: the southern oasis towns sit close enough
   together that two pins there would overlap at any sensible pin size. */

export const REGIONS = [
  { id: 'all', label: 'All' },
  { id: 'aral', label: 'Aral North' },
  { id: 'delta', label: 'Amudarya Delta' },
  { id: 'south', label: 'Southern Oasis' },
]

export const CASES = [
  {
    id: 'nukus',
    region: 'delta',
    district: 'Nukus',
    place: 'Nukus District',
    location: 'Nukus, Karakalpakstan',
    family: 'Seytniyazov Family',
    familyFull: 'The Seytniyazov Family',
    systemSize: '10.2 kW',
    savings: '$18,420',
    lat: 42.46,
    lon: 59.61,
    quote:
      '“Going solar gave us more than savings—it gave us peace of mind.”',
    image: '/images/solar-capture-day.png',
    imagePosition: 'center 58%',
    alt: 'A single-storey home at golden hour, its metal roof lined with solar panels above a white facade.',
  },
  {
    id: 'muynak',
    region: 'aral',
    district: 'Muynak',
    place: 'Muynak District',
    location: 'Muynak, Karakalpakstan',
    family: 'Reymov Family',
    familyFull: 'The Reymov Family',
    systemSize: '8.4 kW',
    savings: '$14,210',
    lat: 43.77,
    lon: 59.03,
    quote:
      '“We are far from everything out here. The roof made the house independent of how far the line runs.”',
    image: '/images/solar-house-day.png',
    imagePosition: '22% center',
    alt: 'A low white house with black roof panels, surrounded by green planting under a clear sky.',
  },
  {
    id: 'kungrad',
    region: 'aral',
    district: 'Kungrad',
    place: 'Kungrad District',
    location: 'Kungrad, Karakalpakstan',
    family: 'Utemuratov Family',
    familyFull: 'The Utemuratov Family',
    systemSize: '9.6 kW',
    savings: '$16,980',
    lat: 43.05,
    lon: 58.85,
    quote:
      '“The dust here is hard on everything. We rinse the panels twice a season and they keep paying us back.”',
    image: '/images/solar-house-night.png',
    imagePosition: 'center 62%',
    alt: 'A solar-panelled home at night, warm light spilling from its windows across the garden.',
  },
  {
    id: 'takhtakupir',
    region: 'aral',
    district: 'Takhtakupir',
    place: 'Takhtakupir District',
    location: 'Takhtakupir, Karakalpakstan',
    family: 'Sarsenbaev Family',
    familyFull: 'The Sarsenbaev Family',
    systemSize: '7.8 kW',
    savings: '$13,490',
    lat: 43.03,
    lon: 60.32,
    quote:
      '“A small roof, a small system, and a bill that finally reads zero every month.”',
    image: '/images/solar-home-night.png',
    imagePosition: 'center 55%',
    alt: 'A home in the evening with solar panels on the roof catching the last of the light above lit windows.',
  },
  {
    id: 'chimboy',
    region: 'delta',
    district: 'Chimboy',
    place: 'Chimboy District',
    location: 'Chimboy, Karakalpakstan',
    family: 'Allambergenov Family',
    familyFull: 'The Allambergenov Family',
    systemSize: '9.1 kW',
    savings: '$15,230',
    lat: 42.94,
    lon: 59.78,
    quote:
      '“The pump for the garden used to decide our bill. Now it runs all afternoon and nobody counts the hours.”',
    image: '/images/solar-house-day.png',
    imagePosition: '62% center',
    alt: 'A white single-storey home with black solar panels across its roof under a clear blue sky.',
  },
  {
    id: 'turtkul',
    region: 'south',
    district: 'Turtkul',
    place: 'Turtkul District',
    location: 'Turtkul, Karakalpakstan',
    family: 'Jumaniyazov Family',
    familyFull: 'The Jumaniyazov Family',
    systemSize: '8.7 kW',
    savings: '$15,640',
    lat: 41.55,
    lon: 61.0,
    quote:
      '“Summer used to mean a bill we dreaded. Now the hottest months are the ones that earn the most.”',
    image: '/images/solar-capture-day.png',
    imagePosition: 'center 38%',
    alt: 'Solar panels along the pitched roof of a modern home, lit by low evening sun.',
  },
]

export const DEFAULT_CASE_ID = 'nukus'

export const STATS = [
  { icon: 'home', value: '5,200+', label: 'Homes powered' },
  { icon: 'leaf', value: '18.7M+', label: 'kg CO₂ avoided' },
  { icon: 'shield', value: '7', label: 'Years guaranteed' },
  { icon: 'activity', value: '24/7', label: 'Smart monitoring' },
]
