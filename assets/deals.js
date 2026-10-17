// Ulta Beauty and Sephora deals gathered by web search (Ulta on 2026-10-16,
// Sephora on 2026-10-17). Neither retailer's sale page could be fetched, so
// each deal links to the report it came from.
// Prices, codes and end dates change: confirm on ulta.com before buying.
// `ends` is the last day of the offer (inclusive); null when no end date was given.
// `image` is a product photo and `logo` a brand logo (paths under assets/img/ or URLs).
// Cards show the photo, else the logo, else a colour swatch; a file that fails to load falls back the same way.
// `retailer` is the store the deal is at.
// Images: product photos from each brand's own store; retailer logos from Wikimedia Commons.
window.DEALS_CHECKED = "2026-10-17";
window.DEALS = [
  {
    id: "siia-luminous-foundation", brand: "SIIA Cosmetics", name: "Luminous Longwear Liquid Foundation",
    desc: "Part of a SIIA markdown on lipsticks, foundations, concealers and contour sticks",
    category: "Face", shape: "pan", color: "#D9A98A", shades: [],
    price: 14.40, was: 36, offer: null, code: null, ends: "2026-10-17", limited: false,
    image: "assets/img/siia-luminous-foundation.jpg", logo: null,
    retailer: "Ulta Beauty",
    url: "https://www.dealnews.com/Ulta-Beauty-SIIA-Cosmetics-Deals-Up-to-50-off-free-shipping-w-35/22289139.html", source: "dealnews"
  },
  {
    id: "kopari-ceramide-cream", brand: "Kopari", name: "Moisture Whipped Ceramide Cream",
    desc: "Listed as an example from Ulta's skin care, makeup, hair and fragrance sale",
    category: "Skincare", shape: "pan", color: "#E3C9B8", shades: [],
    price: 22, was: 44, offer: null, code: null, ends: null, limited: false,
    image: "assets/img/kopari-ceramide-cream.jpg", logo: null,
    retailer: "Ulta Beauty",
    url: "https://www.dealnews.com/s581/Ulta/", source: "dealnews"
  },
  {
    id: "ulta-collection-gift", brand: "Ulta Beauty Collection", name: "Free gift with $22+",
    desc: "Spend $22 on Ulta Beauty Collection and pick a free gift",
    category: "Offers", shape: "pan", color: "#C97B84", shades: [],
    price: null, was: null, offer: "Free gift", code: null, ends: "2026-11-21", limited: false,
    image: null, logo: "assets/img/ulta-beauty-logo.svg",
    retailer: "Ulta Beauty",
    url: "https://www.dealnews.com/Ulta-Beauty-Collection-Free-Gift-w-Purchase-Free-gift-w-22-shipping-varies/22216081.html", source: "dealnews"
  },
  {
    id: "bopis-10-off-40", brand: "Ulta Beauty", name: "$10 off $40 in-store pickup",
    desc: "Promo code for buy-online, pick-up-in-store orders of $40 or more",
    category: "Offers", shape: "pan", color: "#8E2F4B", shades: [],
    price: null, was: null, offer: "$10 off", code: null, ends: "2026-10-18", limited: false,
    image: null, logo: "assets/img/ulta-beauty-logo.svg",
    retailer: "Ulta Beauty",
    url: "https://www.marieclaire.com/coupons/ulta.com", source: "Marie Claire"
  },
  {
    id: "member-20-off", brand: "Ulta Beauty", name: "20% off for Rewards members",
    desc: "Online code for Ulta Beauty Rewards members; exclusions apply",
    category: "Offers", shape: "pan", color: "#A86B3C", shades: [],
    price: null, was: null, offer: "20% off", code: null, ends: "2026-10-16", limited: false,
    image: null, logo: "assets/img/ulta-beauty-logo.svg",
    retailer: "Ulta Beauty",
    url: "https://www.marieclaire.com/coupons/ulta.com", source: "Marie Claire"
  },
  {
    id: "sephora-4x-moisturizers", brand: "Sephora", name: "4x points on moisturizers",
    desc: "Beauty Insider members earn 4x points on 270+ moisturizers, including Olaplex, OUAI and Charlotte Tilbury",
    category: "Offers", shape: "pan", color: "#2E1E1A", shades: [],
    price: null, was: null, offer: "4x points", code: "4XHYDRATE", ends: "2026-10-21", limited: false,
    image: null, logo: "assets/img/sephora-logo.svg",
    retailer: "Sephora",
    url: "https://www.dealnews.com/Sephora-Moisturizers-Bonus-Points-Deals-4-x-points-free-shipping/22288840.html", source: "dealnews"
  },
  {
    id: "sephora-sample-bag", brand: "Sephora", name: "Free sample bag with $55+",
    desc: "Pick a free bag of samples when you spend $55 or more",
    category: "Offers", shape: "pan", color: "#C97B84", shades: [],
    price: null, was: null, offer: "Free gift", code: null, ends: null, limited: false,
    image: null, logo: "assets/img/sephora-logo.svg",
    retailer: "Sephora",
    url: "https://www.dealnews.com/Sephora-Free-Sample-Bag-Deals-Free-sample-bag-w-55-free-shipping/22288876.html", source: "dealnews"
  },
  {
    id: "sephora-collection-masks", brand: "Sephora Collection", name: "Face masks: buy 3, get the 4th free",
    desc: "Mix and match Sephora Collection face masks",
    category: "Skincare", shape: "pan", color: "#E3B9A0", shades: [],
    price: null, was: null, offer: "Buy 3, get 1", code: null, ends: null, limited: false,
    image: null, logo: "assets/img/sephora-logo.svg",
    retailer: "Sephora",
    url: "https://www.dealnews.com/Sephora-Collection-Face-Mask-Deals-Buy-3-get-4-th-for-free-free-shipping/22284314.html", source: "dealnews"
  }
];
