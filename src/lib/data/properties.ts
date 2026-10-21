import type { ResidentialCategory, LocationSlug, PropertyStatus } from "@/types";
import { MEDIA_BASE } from "@/lib/media";

export interface StaticProperty {
  id: string;
  slug: string;
  name: string;
  category: ResidentialCategory;
  location: LocationSlug;
  locationLabel: string;
  configuration: string;
  sizeRange: string;
  status: PropertyStatus;
  coverImage: string;
  images: string[];
  isFeatured: boolean;
  price?: string;
  priceOnRequest?: boolean;
  description?: string[];
  highlights?: string[];
  builtUpArea?: string;
  plotArea?: string;
  floor?: string;
  suitableFor?: string;
  amenitiesSummary?: string;
  seoTitle?: string;
  seoDescription?: string;
  isActive?: boolean;
  imageAlts?: Record<string, string>;
}

const ALL_STATIC_PROPERTIES: StaticProperty[] = [
  {
    id: "ikebana",
    slug: "5-bhk-3300-6300-sindhu-bhavan",
    name: "Ikebana",
    category: "apartment",
    location: "sindhu-bhavan",
    locationLabel: "Sindhu Bhavan",
    configuration: "5 BHK Luxury Residences",
    sizeRange: "Approx. 3,300 – 6,300 sq.ft.",
    status: "near-possession",
    coverImage: "/properties/ikebana/ikebana1.png",
    images: [
      "/properties/ikebana/ikebana1.png",
      "/properties/ikebana/ikebana-living2.png",
      "/properties/ikebana/ikebana-bedroom-3.png",
      "/properties/ikebana/ikebana-4.png",
    ],
    isFeatured: true,
    price: "₹10.50 Cr – ₹15.00 Cr",
    priceOnRequest: true,
    description: [
      "An exclusive luxury residence on Sindhu Bhavan Road, offering spacious 5 BHK homes, green open spaces, premium amenities, and a highly connected central Ahmedabad address.",
    ],
    amenitiesSummary: "Sky-level pool, gym, gardens, lounge, sports, library, theatre & more",
    highlights: [
      "Double-height living rooms with floor-to-ceiling glazing",
      "State-of-the-art private screening theatre and clubhouse",
      "Spacious wrap-around sundecks with customizable private plunge pools",
      "Concierge services and robust multi-tiered HNI security systems"
    ],
    builtUpArea: "Approx. 3,300 – 6,300 sq.ft.",
    floor: "5 BHK",
    suitableFor: "HNI families looking for premium vertical estates with high privacy and security"
  },
  {
    id: "maruti-360",
    slug: "4-5-bhk-duplex-5700-7500-iskon-ambli",
    name: "Maruti 360",
    category: "apartment",
    location: "iskon-ambli",
    locationLabel: "Bodakdev",
    configuration: "4 & 5 BHK Suites, Duplexes & Penthouses",
    sizeRange: "Approx. 2,087 – 7,024 sq.ft.",
    status: "under-construction",
    coverImage: "/properties/maruti-360/maruti-360-view.jpg",
    images: [
      "/properties/maruti-360/maruti-360-view.jpg",
      "/properties/maruti-360/maruti-360-bedroom-2.png",
      "/properties/maruti-360/maruti-360-pool-3.png",
      "/properties/maruti-360/maruti360-play-area-4.png",
    ],
    isFeatured: true,
    price: "₹5.50 Cr – ₹8.25 Cr",
    priceOnRequest: false,
    description: [
      "A landmark high-rise beside Karnavati Club, offering expansive luxury suites, unobstructed green views, and an elevated lifestyle across a twin-tower residential development.",
    ],
    amenitiesSummary: "41st-floor viewing gallery, infinity pool, gym, wellness centre, mini theatre, clubhouse, banquet hall, yoga deck, indoor games & landscaped jogging track.",
    highlights: [
      "Single apartment per floor layouts for ultimate privacy",
      "360-degree panoramic views of Iskon-Ambli corridor",
      "Grand entry lobby with triple-height clearance",
      "Eco-friendly building design with IGBC Gold certification"
    ],
    builtUpArea: "Approx. 2,087 – 7,024 sq.ft.",
    floor: "4 & 5 BHK",
    suitableFor: "Discerning owners desiring single-apartment-per-floor privacy in the prime luxury zone"
  },
  {
    id: "pashmina",
    slug: "4-5-bhk-penthouse-5200-7500-sindhu-bhavan",
    name: "Pashmina",
    category: "apartment",
    location: "sindhu-bhavan",
    locationLabel: "Bodakdev",
    configuration: "4 & 5 BHK Residences",
    sizeRange: "Approx. 2,714 – 5,236 sq.ft.",
    status: "ready-to-move",
    coverImage: "/properties/pashmina/pashmina.jpg",
    images: [
      "/properties/pashmina/pashmina.jpg",
      "/properties/pashmina/pashmina.jpeg",
      "/properties/pashmina/pashmina1.png",
    ],
    isFeatured: true,
    price: "₹6.20 Cr – ₹9.50 Cr",
    priceOnRequest: false,
    description: [
      "A high-rise luxury address in Bodakdev, designed around expansive residences, panoramic verandahs, premium club spaces, and a secure, green living environment.",
    ],
    amenitiesSummary: "50,000 sq. ft. clubhouse, gym, indoor games, community hall, lawns, children's zones, podium garden & smart security.",
    highlights: [
      "Ready to move in with completed luxury finishes",
      "Extremely spacious layout with dual master suites",
      "Centrally located near top dining and retail options",
      "Beautifully landscaped central gardens and walking tracks"
    ],
    builtUpArea: "Approx. 2,714 – 5,236 sq.ft.",
    floor: "4 & 5 BHK",
    suitableFor: "Buyers seeking immediate-possession ready luxury residences in high-connectivity zones"
  },
  {
    id: "swati-senor",
    slug: "5-bhk-8000-10000-iskon-ambli",
    name: "Swati Senor",
    category: "apartment",
    location: "iskon-ambli",
    locationLabel: "Iskon-Ambli",
    configuration: "5 BHK Apartments",
    sizeRange: "4,311 sq.ft. onwards",
    status: "ready-to-move",
    coverImage: "/properties/swati-senor/swati-senor-2-hall.jpg",
    images: [
      "/properties/swati-senor/swati-senor-2-hall.jpg",
      "/properties/swati-senor/swati-senor-3-dining-area.jpg",
      "/properties/swati-senor/swati-senor-4-gallery.jpg",
      "/properties/swati-senor/swati-senor-5-bedroom.jpg",
      "/properties/swati-senor/swati-senor-6-pool.jpg",
    ],
    isFeatured: true,
    price: "₹8.00 Cr – ₹10.00 Cr",
    priceOnRequest: true,
    description: [
      "An exclusive large-format residence on Iscon–Ambli Road, created for buyers seeking a spacious single-level home, sophisticated common spaces, and a central luxury address.",
    ],
    amenitiesSummary: "Banquet hall, gym, mini theatre, indoor games, children's play area, toddler zone, designed foyer, CCTV & allotted parking.",
    highlights: [
      "Sky mansions with massive 8,000+ sq.ft. footprints",
      "Temperature-controlled private swimming pool and deck",
      "Fully equipped fitness sanctuary and private dining room",
      "Advanced 5-tier security and dedicated valet service"
    ],
    builtUpArea: "4,311 sq.ft. onwards",
    floor: "5 BHK",
    suitableFor: "Families looking for palatial room dimensions and top-tier wellness clubhouse amenities"
  },
  {
    id: "anurita",
    slug: "4-bhk-villa-950-plot-700-built-sindhu-bhavan",
    name: "Anurita",
    category: "bungalow",
    location: "sindhu-bhavan",
    locationLabel: "Thaltej",
    configuration: "4 & 5 BHK Villas",
    sizeRange: "Approx. 2,809 – 3,517 sq.ft.",
    status: "ready-to-move",
    coverImage: "/properties/anurita/anurita-1.jpg",
    images: [
      "/properties/anurita/anurita-1.jpg",
      "/properties/anurita/anurita-2-bungalows-img.jpg",
      "/properties/anurita/anurita-3-living-room.jpg",
      "/properties/anurita/anurita-4-bedroom.jpg",
    ],
    isFeatured: true,
    price: "₹14.50 Cr",
    priceOnRequest: false,
    description: [
      "An exclusive gated villa enclave in Thaltej, created for private family living with expansive homes, landscaped surroundings, and a thoughtful mix of wellness, recreation, and security-led amenities.",
    ],
    amenitiesSummary: "Clubhouse, gym, yoga/meditation spaces, party lawn, multipurpose hall, children's zones & 24/7 security.",
    highlights: [
      "Private garden lawn and large outdoor party deck",
      "Standalone villa layout with absolute boundary privacy",
      "Dedicated personal elevator and automated security systems",
      "Private servant quarters and 4-car parking garage"
    ],
    builtUpArea: "Approx. 2,809 – 3,517 sq.ft.",
    plotArea: "950 sq.yd. Plot",
    floor: "4 & 5 BHK",
    suitableFor: "VIP buyers wanting standalone boundary privacy and dedicated personal grounds"
  },
  {
    id: "belagio",
    slug: "4-5-bhk-6100-8500-iskon-ambli",
    name: "Belagio",
    category: "apartment",
    location: "iskon-ambli",
    locationLabel: "Iskon-Ambli",
    configuration: "4 & 5 BHK",
    sizeRange: "Approx. 3,071 – 4,095 sq.ft.",
    status: "under-construction",
    coverImage: "/properties/belagio/belagio-1.jpg",
    images: [
      "/properties/belagio/belagio-1.jpg",
      "/properties/belagio/belagio-2.jpg",
      "/properties/belagio/belagio-3.jpg",
      "/properties/belagio/belagio-pool.jpg",
    ],
    isFeatured: true,
    price: "₹5.50 Cr – ₹8.50 Cr",
    priceOnRequest: true,
    description: [
      "An ultra-luxury residential address near Iscon Cross Road, offering expansive homes, refined interiors, and a private, resort-style lifestyle in one of Ahmedabad's most connected premium neighbourhoods.",
    ],
    amenitiesSummary: "Pool, gym, theatre, clubhouse, banquet hall, indoor games, library, jacuzzi, garden, jogging track & kids' play area.",
    highlights: [
      "European architectural theme with premium stone finishes",
      "Infinity-edge pool overlooking landscaped gardens",
      "Grand banqueting facility for resident celebrations",
      "Double-height sky lounges for community interaction"
    ],
    builtUpArea: "Approx. 3,071 – 4,095 sq.ft.",
    floor: "4 & 5 BHK",
    suitableFor: "Connoisseurs seeking classic European architectural themes and expansive sky lounge amenities"
  },
  {
    id: "anamika",
    slug: "4-5-bhk-duplex-3200-10000-sindhu-bhavan",
    name: "Anamika",
    category: "apartment",
    location: "sindhu-bhavan",
    locationLabel: "Bodakdev",
    configuration: "4 & 5 BHK Apartments",
    sizeRange: "Approx. 1,767 – 3,346 sq.ft.",
    status: "under-construction",
    coverImage: "/properties/anamika/anamika2.jpg",
    images: [
      "/properties/anamika/anamika2.jpg",
      "/properties/anamika/anamika.jpg",
      "/properties/anamika/anamika4-bedroom.jpg",
    ],
    isFeatured: true,
    description: [
      "Contemporary high-rise living in Bodakdev, offering spacious family residences with an additional living space and a club-style lifestyle environment for recreation, wellness, social gatherings, and everyday comfort.",
    ],
    amenitiesSummary: "Clubhouse, swimming pool with deck, banquet lawn, multifunction hall, landscaped gardens, drop-off zones & CCTV security.",
    builtUpArea: "Approx. 1,767 – 3,346 sq.ft.",
    floor: "4 & 5 BHK",
  },
  {
    id: "triveni-84",
    slug: "4-bhk-penthouse-duplex-3700-6500-iskon-ambli",
    name: "Triveni 84",
    category: "apartment",
    location: "iskon-ambli",
    locationLabel: "Iskon-Ambli",
    configuration: "4 BHK Residences & 5 BHK Duplex Penthouses",
    sizeRange: "Approx. 1,942 sq.ft. onwards for 4 BHK",
    status: "under-construction",
    coverImage: "/properties/triveni-84/triveni-1.jpg",
    images: [
      "/properties/triveni-84/triveni-1.jpg",
      "/properties/triveni-84/triveni2-kids-play-area.jpeg",
      "/properties/triveni-84/triveni3-yoga.jpeg",
      "/properties/triveni-84/triveni4-gym.jpeg",
      "/properties/triveni-84/triveni5-banquet-hall.jpeg",
    ],
    isFeatured: false,
    description: [
      "A limited-edition address on Iscon–Ambli Road, designed for private large-format living with only two residences per floor, generous open spaces, and wellness-led shared amenities.",
    ],
    amenitiesSummary: "Gym, yoga room, games room, co-working space, banquet area, landscaped garden, toddler zone, wellness floor & secured parking.",
    builtUpArea: "Approx. 1,942 sq.ft. onwards for 4 BHK",
    floor: "4 & 5 BHK",
  },
  {
    id: "avant",
    slug: "4-bhk-duplex-4500-8000-sindhu-bhavan",
    name: "Avant",
    category: "apartment",
    location: "sindhu-bhavan",
    locationLabel: "Bodakdev",
    configuration: "4 BHK Apartments",
    sizeRange: "Approx. 2,502 – 2,895 sq.ft.",
    status: "ready-to-move",
    coverImage: "/properties/avant/avant1.png",
    images: [
      "/properties/avant/avant1.png",
      "/properties/avant/avant-2-hall.jpg",
      "/properties/avant/avant-3-park.avif",
    ],
    isFeatured: false,
    description: [
      "A green, eco-conscious residential address just off Sindhu Bhavan Road, offering large homes with deep verandas, generous outdoor spaces, and a leisure-focused setting for modern family living.",
    ],
    amenitiesSummary: "Covered pool, skywalk, clubhouse, indoor games, kids' play area, adventure zone, café, lake, walking trail & BBQ lawn.",
    builtUpArea: "Approx. 2,502 – 2,895 sq.ft.",
    floor: "4 BHK",
  },
  {
    id: "capstone",
    slug: "4-bhk-penthouse-duplex-5200-9000-thaltej",
    name: "Capstone",
    category: "apartment",
    location: "thaltej",
    locationLabel: "Shilaj",
    configuration: "4 BHK",
    sizeRange: "Approx. 2,860 – 2,888 sq.ft.",
    status: "under-construction",
    coverImage: "/properties/capstone/capstone-1-courtyard.jpg",
    images: [
      "/properties/capstone/capstone-1-courtyard.jpg",
      "/properties/capstone/capstone-2-living.jpg",
      "/properties/capstone/capstone-3-aerial.jpg",
      "/properties/capstone/capstone-4-gameroom.jpg",
      "/properties/capstone/capstone-5-hometheater.jpg",
      "/properties/capstone/capstone-6-kidsplay.jpg",
    ],
    isFeatured: true,
    price: "₹3.50 Cr – ₹5.50 Cr",
    priceOnRequest: true,
    description: [
      "A low-density, four-side-open residential development in Shilaj, created for buyers who value generous layouts, open views, large balconies, and the privacy of only two residences per floor.",
    ],
    amenitiesSummary: "Clubhouse, landscaped garden, children's play area, CCTV, visitor parking, rainwater harvesting, power backup & 24/7 security.",
    highlights: [
      "Prime Thaltej location with scenic vistas and excellent connectivity",
      "Exclusive duplex layouts with high-volume double-height spaces",
      "Rooftop infinity pool, fitness club, and bespoke social lounge",
      "Advanced smart home automation and 24/7 automated private security"
    ],
    builtUpArea: "Approx. 2,860 – 2,888 sq.ft.",
    floor: "4 BHK",
    suitableFor: "VIP buyers desiring high-volume duplex living near the prime western corridor"
  },
  {
    id: "eminence-96",
    slug: "4-bhk-duplex-3800-7000-thaltej",
    name: "Eminence 96",
    category: "apartment",
    location: "thaltej",
    locationLabel: "Thaltej",
    configuration: "4 BHK | 5 BHK Penthouse Duplex",
    sizeRange: "From approx. 1,649 sq.ft. for 4 BHK; 3,336 sq.ft. for 5 BHK",
    status: "ready-to-move",
    coverImage: "/properties/eminence-96/emini96-1.png",
    images: [
      "/properties/eminence-96/emini96-1.png",
      "/properties/eminence-96/eminence-96-2-gym.webp",
      "/properties/eminence-96/eminence-96-3-pool.webp",
      "/properties/eminence-96/eminence-96-4-seting-area.webp",
    ],
    isFeatured: false,
    description: [
      "A contemporary luxury residence near Thaltej–Shilaj Road, combining spacious family homes and penthouse duplexes with wellness, recreation, and landscaped community spaces.",
    ],
    amenitiesSummary: "Covered pool, gym, theatre, banquet hall, terrace garden, indoor games, landscaped garden, waterbody & children's play areas.",
    builtUpArea: "From approx. 1,649 sq.ft. for 4 BHK; 3,336 sq.ft. for 5 BHK",
    floor: "4 & 5 BHK",
  },
  {
    id: "belrosa",
    slug: "4-5-bhk-duplex-penthouse-5500-11000-vaishno-devi",
    name: "Belrosa",
    category: "apartment",
    location: "vaishno-devi",
    locationLabel: "Vaishnodevi Circle",
    configuration: "4 & 5 BHK Simplex | 5 & 6 BHK Duplex",
    sizeRange: "Approx. 2,942 – 6,911 sq.ft.",
    status: "pre-launch",
    coverImage: "/properties/belrosa/belrosa-1.jpg",
    images: [
      "/properties/belrosa/belrosa-1.jpg",
      "/properties/belrosa/belrosa-2-hall.jpg",
      "/properties/belrosa/belrosa-3-view.jpg",
      "/properties/belrosa/living-dining.jpg",
    ],
    isFeatured: false,
    description: [
      "A landmark high-rise within Shantigram, designed around private foyers, sweeping golf-course views, expansive layouts, and a sky-high lifestyle for families seeking scale, privacy, and prestige.",
    ],
    amenitiesSummary: "Sky Club with infinity pool, spa, sauna, gym, banquet hall, home theatre, reading nook, billiards & indoor games.",
    builtUpArea: "Approx. 2,942 – 6,911 sq.ft.",
    floor: "4, 5 & 6 BHK",
  },
  {
    id: "rashmi",
    slug: "4-bhk-penthouse-duplex-3200-6500-thaltej",
    name: "Rashmi",
    category: "apartment",
    location: "thaltej",
    locationLabel: "Shantipura",
    configuration: "3 & 4 BHK Apartments",
    sizeRange: "Approx. 1,163 – 1,694 sq.ft.",
    status: "pre-launch",
    coverImage: "",
    images: [],
    isFeatured: false,
    description: [
      "A contemporary gated residential development on Link-in Road, offering well-planned family homes with leisure amenities, landscaped outdoor spaces, and convenient access to the wider South-West Ahmedabad corridor.",
    ],
    amenitiesSummary: "Swimming pool, gym, mini theatre, banquet hall, party lawn, indoor games, outdoor seating & toddler play area.",
    builtUpArea: "Approx. 1,163 – 1,694 sq.ft.",
    floor: "3 & 4 BHK",
  },
  {
    id: "vaikunth",
    slug: "4-bhk-villa-390-plot-440-built-shilaj",
    name: "Vaikunth",
    category: "bungalow",
    location: "shilaj",
    locationLabel: "Shilaj",
    configuration: "4 BHK Villas",
    sizeRange: "Approx. 2,393 – 2,757 sq.ft.",
    status: "near-possession",
    coverImage: "/properties/vaikunth/vaikunth-1.png",
    images: [
      "/properties/vaikunth/vaikunth-1.png",
      "/properties/vaikunth/vaikunth-2-pool.png",
      "/properties/vaikunth/vaikunth-3.png",
    ],
    isFeatured: true,
    description: [
      "An ultra-premium bungalow enclave near Shilaj, offering spacious private homes, tree-lined surroundings, and a calm yet well-connected lifestyle along the Bopal–Ambli corridor.",
    ],
    amenitiesSummary: "Swimming pool, mini water park, gym, indoor games, multipurpose court, landscaped spaces, senior sit-outs & children's play areas.",
    builtUpArea: "Approx. 2,393 – 2,757 sq.ft.",
    floor: "4 BHK",
  },
  {
    id: "northpark",
    slug: "4-bhk-villa-500-plot-550-built-vaishno-devi",
    name: "Northpark",
    category: "bungalow",
    location: "vaishno-devi",
    locationLabel: "Vaishnodevi Circle",
    configuration: "4 BHK Villas",
    sizeRange: "Approx. 3,375 – 3,791 sq.ft.",
    status: "under-construction",
    coverImage: "/properties/northpark/northpark-1.jpg",
    images: [
      "/properties/northpark/northpark-1.jpg",
      "/properties/northpark/northpark-2-bung.jpg",
      "/properties/northpark/northpark-3-hall.jpg",
      "/properties/northpark/northpark-04-dainnig.jpg",
      "/properties/northpark/northpark-5-bedroom.jpg",
    ],
    isFeatured: true,
    description: [
      "An exclusive independent villa address within Shantigram, bringing together expansive layouts, landscaped outdoor spaces, private decks, and the comfort of township living.",
    ],
    amenitiesSummary: "Clubhouse, gym, children's play area, party lawn, outdoor seating, large decks and terraces, plus golf club membership benefits.",
    builtUpArea: "Approx. 3,375 – 3,791 sq.ft.",
    floor: "4 BHK",
  },
  {
    id: "kalrav-alpines",
    slug: "premium-plots-1100-2000-shilaj",
    name: "Kalrav Alpines",
    category: "plot",
    location: "shilaj",
    locationLabel: "Nandoli",
    configuration: "Residential Villa Plots",
    sizeRange: "1,100 sq.yd. onwards",
    status: "under-construction",
    coverImage: "/properties/kalrav-alpines/kalrav-alpines-1.jpg",
    images: ["/properties/kalrav-alpines/kalrav-alpines-1.jpg"],
    isFeatured: true,
    description: [
      "A low-density plotted villa community in Nandoli, created for families looking to build a private retreat with generous land, open surroundings, and leisure-led community spaces.",
    ],
    amenitiesSummary: "Swimming pool, clubhouse, theatre, pool table, reserved parking, CCTV, power backup & 24/7 security.",
    plotArea: "1,100 sq.yd. onwards",
  },
  {
    id: "westpark",
    slug: "premium-plots-700-2500-vaishno-devi",
    name: "Westpark",
    category: "plot",
    location: "vaishno-devi",
    locationLabel: "Vaishnodevi Circle",
    configuration: "Customisable Luxury Villas / 5 BHK layouts",
    sizeRange: "Starting approx. 3,853 sq.ft.",
    status: "under-construction",
    coverImage: "/properties/westpark/westpark-1.jpeg",
    images: [
      "/properties/westpark/westpark-1.jpeg",
      "/properties/westpark/westpark-2-bun.jpg",
    ],
    isFeatured: true,
    description: [
      "A limited villa community within Shantigram, created for buyers seeking a customisable home, green golf-side surroundings, and the scale and privacy of township living.",
    ],
    amenitiesSummary: "Clubhouse, celebration lawn, yoga zone, walking track, box cricket, multipurpose court, children's play area, senior sit-outs & golf promenade access.",
    builtUpArea: "Starting approx. 3,853 sq.ft.",
    floor: "5 BHK",
  },
  {
    id: "atman",
    slug: "4-bhk-5000-iskon-ambli",
    name: "Atman",
    category: "apartment",
    location: "iskon-ambli",
    locationLabel: "Iskon-Ambli",
    configuration: "4 BHK Residences",
    sizeRange: "Approx. 2,399 – 2,764 sq.ft.",
    status: "ready-to-move",
    coverImage: "/properties/atman/atman-1.jpg",
    images: [
      "/properties/atman/atman-1.jpg",
      "/properties/atman/atman-2.jpg",
    ],
    isFeatured: false,
    description: [
      "A low-density, design-led residential address in Ambli, centred around spacious homes, green open spaces, a serene waterbody, and lifestyle amenities designed for refined family living.",
    ],
    amenitiesSummary: "Central waterbody, landscaped gardens, Jain Derasar, children's play area, sit-outs, basement parking & 24/7 security.",
    builtUpArea: "Approx. 2,399 – 2,764 sq.ft.",
    floor: "4 BHK",
  },
  {
    id: "shaligram-luxuria",
    slug: "4-bhk-penthouse-3800-7500-iskon-ambli",
    name: "Shaligram Luxuria",
    category: "apartment",
    location: "iskon-ambli",
    locationLabel: "Iskon-Ambli",
    configuration: "4 BHK Apartments & 5 BHK Penthouses",
    sizeRange: "Approx. 1,888 – 3,648 sq.ft.",
    status: "near-possession",
    coverImage: "/properties/shaligram-luxuria/shaligram-luxuria-1.jpg",
    images: [
      "/properties/shaligram-luxuria/shaligram-luxuria-1.jpg",
      "/properties/shaligram-luxuria/shaligram-luxuria-2-gym.jpg",
      "/properties/shaligram-luxuria/shaligram-luxuria-3.jpg",
    ],
    isFeatured: false,
    description: [
      "A refined residential address in Ambli, combining spacious apartments and penthouses with landscaped community spaces, recreation zones, and a family-oriented luxury lifestyle.",
    ],
    amenitiesSummary: "Gym, lounge and library, badminton court, indoor games, multipurpose hall, landscaped garden, children's area & CCTV security.",
    builtUpArea: "Approx. 1,888 – 3,648 sq.ft.",
    floor: "4 & 5 BHK",
  },
  {
    id: "kimana",
    slug: "4-5-bhk-6000-8000-iskon-ambli",
    name: "Kimana",
    category: "apartment",
    location: "iskon-ambli",
    locationLabel: "Iskon-Ambli",
    configuration: "4, 5, 6 & 7 BHK Apartments, Duplexes & Penthouses",
    sizeRange: "Approx. 2,984 – 6,162 sq.ft.",
    status: "near-possession",
    coverImage: "/properties/kimana/kimana.jpg",
    images: [
      "/properties/kimana/kimana.jpg",
      "/properties/kimana/kimana-2.jpg",
      "/properties/kimana/kimana-3.jpg",
    ],
    isFeatured: false,
    description: [
      "A private, large-format residential address in Ambli, designed around spacious homes, refined interiors, landscaped surroundings, and an elevated lifestyle for discerning families.",
    ],
    amenitiesSummary: "Swimming pool, gym, theatre, banquet hall, indoor games, jogging track, landscaped garden, children's area, senior sit-out & 24/7 security.",
    builtUpArea: "Approx. 2,984 – 6,162 sq.ft.",
    floor: "4, 5, 6 & 7 BHK",
  },
  {
    id: "nehru-nagar-project",
    slug: "nehru-nagar-project",
    name: "Nehru Nagar Project",
    category: "apartment",
    location: "other",
    locationLabel: "Nehru Nagar",
    configuration: "4 & 5 BHK",
    sizeRange: "3,000–6,000 sq. ft.",
    status: "pre-launch",
    coverImage: "/properties/nehru-nagar/nehru-nagar-1.jpeg",
    images: [
      "/properties/nehru-nagar/nehru-nagar-1.jpeg",
      "/properties/nehru-nagar/nehru-nagar-2.jpeg",
      "/properties/nehru-nagar/nehru-nagar-3.jpeg",
      "/properties/nehru-nagar/nehru-nagar-4.jpeg",
    ],
    isFeatured: true,
    priceOnRequest: true,
    description: [
      "A centrally located high-rise development offering spacious family residences, generous open spaces, and strong everyday connectivity in the heart of Ahmedabad.",
    ],
    highlights: [
      "70% open space",
      "150 m from Jain Derasar",
      "25 storeys",
      "10 buildings & 600 units",
    ],
    builtUpArea: "3,000–6,000 sq. ft.",
    floor: "4 & 5 BHK",
    isActive: true,
  },
  {
    id: "vastrapur-project",
    slug: "vastrapur-project",
    name: "Vastrapur Project",
    category: "apartment",
    location: "other",
    locationLabel: "Vastrapur",
    configuration: "3, 4 & 5 BHK",
    sizeRange: "3,000–4,700 sq. ft.*",
    status: "under-construction",
    coverImage: "/properties/vastrapur/vastrapur-3-facade.jpg",
    images: [
      "/properties/vastrapur/vastrapur-3-facade.jpg",
      "/properties/vastrapur/vastrapur-1-balcony.jpg",
      "/properties/vastrapur/vastrapur-2-pool.jpg",
    ],
    isFeatured: true,
    priceOnRequest: true,
    description: [
      "A premium residential development in Vastrapur, designed for upscale urban living with spacious configurations, Italian marble finishes, and a lower-density tower layout.",
    ],
    highlights: [
      "60% open space",
      "Italian marble flooring",
      "4 towers",
      "17 storeys & 220 units",
    ],
    builtUpArea: "3,000–4,700 sq. ft.*",
    floor: "3, 4 & 5 BHK",
    isActive: true,
  },
];

function getMediaUrl(localPath: string): string {
  if (!localPath) return "";
  if (localPath.startsWith("http")) return localPath;
  if (localPath.startsWith("/properties/")) {
    return `${MEDIA_BASE}${localPath}`;
  }
  return localPath;
}

export const STATIC_PROPERTIES = ALL_STATIC_PROPERTIES
  .filter((p) => (p.coverImage && p.coverImage !== "") || p.isActive === true)
  .map((p) => ({
    ...p,
    coverImage: getMediaUrl(p.coverImage),
    images: p.images.map(getMediaUrl),
  }));

export const FEATURED_PROPERTIES = STATIC_PROPERTIES.filter((p) => p.isFeatured);
