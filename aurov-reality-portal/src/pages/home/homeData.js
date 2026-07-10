import { IMAGES } from './images.js';

// Self-contained ventures data for the public home page. The reference landing
// page only needs each venture's display fields plus a `units` array whose
// entries carry a `status` ('available' | 'pending' | 'booked'). We generate
// units with the same distribution rules the original store used so the
// "Available / total" counts and hero stats render identically.

function makeUnits(prefix, count, basePrice) {
  const units = [];
  for (let n = 1; n <= count; n++) {
    let status = 'available';
    if (n % 11 === 0) status = 'booked';
    else if (n % 7 === 0) status = 'pending';
    units.push({ id: `${prefix}-${String(n).padStart(3, '0')}`, status, price: basePrice });
  }
  return units;
}

function makeFlatUnits(prefix, floors, perFloor, basePrice) {
  const units = [];
  let n = 1;
  for (let f = 0; f < floors; f++) {
    for (let c = 0; c < perFloor; c++) {
      let status = 'available';
      if (n % 9 === 0) status = 'booked';
      if (n % 6 === 0) status = 'pending';
      units.push({ id: `${prefix}-${n}`, status, price: basePrice });
      n++;
    }
  }
  return units;
}

export const ventures = [
  {
    id: 'V-GRN',
    name: 'Aurov Green Meadows',
    type: 'plot',
    location: 'Shadnagar, Hyderabad',
    tagline: 'HMDA-approved open plots wrapped in 8 acres of landscaped greenery.',
    priceFrom: 1200000,
    amenities: ['Gated community', '40ft & 60ft roads', 'Avenue plantation', 'Overhead tank', 'Clubhouse', 'Children park'],
    possession: 'Ready for registration',
    image: IMAGES.greenMeadows,
    units: makeUnits('GRN', 96, 1200000),
  },
  {
    id: 'V-RDG',
    name: 'Aurov Ridgeview Plots',
    type: 'plot',
    location: 'Mokila, Hyderabad',
    tagline: 'East-facing premium plots minutes from the ORR.',
    priceFrom: 1850000,
    amenities: ['Gated entry', 'Underground drainage', 'Solar street lights', 'Jogging track'],
    possession: 'Q4 2026',
    image: IMAGES.ridgeview,
    units: makeUnits('RDG', 64, 1850000),
  },
  {
    id: 'V-SKY',
    name: 'Aurov Skyline Residences',
    type: 'flat',
    location: 'Kokapet, Hyderabad',
    tagline: '2 & 3 BHK sky homes with panoramic city views.',
    priceFrom: 6800000,
    amenities: ['Infinity pool', 'Gymnasium', 'Power backup', "Kids' play area", 'Covered parking', '24x7 security'],
    possession: 'Q2 2027',
    image: IMAGES.skyline,
    units: makeFlatUnits('SKY', 6, 4, 6800000),
  },
  {
    id: 'V-PRK',
    name: 'Aurov Parkside Towers',
    type: 'flat',
    location: 'Tellapur, Hyderabad',
    tagline: 'Lake-facing 2 & 3 BHK apartments beside a 3-acre park.',
    priceFrom: 7400000,
    amenities: ['Clubhouse', 'Yoga deck', 'EV charging', 'Rainwater harvesting', 'Amphitheatre'],
    possession: 'Q1 2028',
    image: IMAGES.parkside,
    units: makeFlatUnits('PRK', 5, 4, 7400000),
  },
];
