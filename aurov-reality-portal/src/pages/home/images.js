// Central image catalogue. All images are free-to-use photos from Unsplash,
// hotlinked via the images.unsplash.com CDN with sizing params for performance.
// Each <SmartImage> falls back to a branded gradient if a URL ever fails to load,
// so the layout stays intact regardless.
//
// To swap an image: open the photo on unsplash.com, copy its photo-XXXX id from
// the URL, and replace the id below.

const U = (id, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

export const IMAGES = {
  // hero / banners
  heroAerial: U('photo-1582407947304-fd86f028f716', 1920), // aerial of suburban housing
  heroCity: U('photo-1486406146926-c627a92ad1ab', 1920),   // modern city towers
  ctaLand: U('photo-1500382017468-9049fed747ef', 1920),    // open green land

  // ventures
  greenMeadows: U('photo-1500382017468-9049fed747ef'),     // open green field/plots
  ridgeview: U('photo-1416331108676-a22ccb276e35'),        // green landscape ridge
  skyline: U('photo-1545324418-cc1a3fa10c00'),             // apartment tower
  parkside: U('photo-1460317442991-0ec209397118'),         // apartments by greenery

  // gallery / amenities
  clubhouse: U('photo-1571902943202-507ec2618e8f'),        // modern interior
  pool: U('photo-1571896349842-33c89424de2d'),             // swimming pool
  park: U('photo-1519331379826-f10be5486c6f'),             // park greenery
  interior: U('photo-1600585154340-be6161a56a0c'),         // living room
  villa: U('photo-1600596542815-ffad4c1539a9'),            // modern house exterior
  road: U('photo-1502920917128-1aa500764cbd'),             // tree-lined avenue

  // testimonials avatars
  person1: U('photo-1507003211169-0a1dd7228f2d', 200),
  person2: U('photo-1494790108377-be9c29b29330', 200),
  person3: U('photo-1500648767791-00dcc994a43e', 200),

  // masterplan / about
  masterplan: U('photo-1524813686514-a57563d77965', 1400), // aerial plan-like
  aboutSite: U('photo-1448630360428-65456885c650', 1200),  // building/aerial
  upcoming: U('photo-1613977257363-707ba9348227', 1400),   // premium villa community
  phase1: U('photo-1613490493576-7fde63acd811', 900),       // modern home
  phase2: U('photo-1564013799919-ab600027ffc6', 900),       // house exterior
  phase3: U('photo-1512917774080-9991f1c4c750', 900),       // luxury home
  plotsAerial: U('photo-1500382017468-9049fed747ef', 900),  // open plots/land
}

// brand gradients used as graceful fallbacks per slot
export const GRADIENTS = {
  navy: 'linear-gradient(135deg,#01308A,#012a6f)',
  teal: 'linear-gradient(135deg,#006D82,#01308A)',
  green: 'linear-gradient(135deg,#34C31B,#006D82)',
  mix: 'linear-gradient(135deg,#01308A,#006D82 55%,#34C31B 130%)',
}
