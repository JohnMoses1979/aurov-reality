// import React, { useState, useEffect, useMemo, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Logo, inrShort } from './Logo.js';
// import SmartImage from './SmartImage.js';
// import WatercolorWash from './WatercolorWash.js';
// import { Reveal, AnimatedNumber } from './anim.js';
// import { IMAGES, GRADIENTS } from './images.js';
// import { ventures } from './homeData.js';
// import './home.css';

// /* ============= GLOWING GLITTER HERO + POSTER / VIDEO / IMAGE LOOP ============= */

// // const HERO_VIDEO_SOURCES = [
// //   '/videos/video2.mp4',
// //   '/videos/hero-background.mp4',
// //   '/dist/videos/hero-background.mp4',
// //   './videos/hero-background.mp4',
// // ]; 


// const HERO_VIDEO_SOURCES = [
//   '/videos/hero-background.mp4',
// ];

// const POSTER_VISIBLE_TIME = 5000;
// const IMAGE_VISIBLE_TIME = 3000;

// const HERO_REAL_ESTATE_IMAGES = [
//   {
//     image: '/images/image1.jpg',
//     gradient: GRADIENTS.navy,
//     alt: 'Premium glass tower skyline',
//   },
//   {
//     image: '/images/image2.jpg',
//     gradient: GRADIENTS.mix,
//     alt: 'Luxury villa community',
//   },
//   {
//     image: '/images/image3.jpg',
//     gradient: GRADIENTS.teal,
//     alt: 'Open plotting layout',
//   },
//   {
//     image: '/images/image4.jpg',
//     gradient: GRADIENTS.green,
//     alt: 'Modern apartment community',
//   },
// ];

// const ABOUT_WALKTHROUGH_VIDEO = '/videos/video2.mp4';
// const ABOUT_WALKTHROUGH_URL = 'https://www.aurovreality.com/walkthrough';




// function GlowingGlitterHero({ goLogin, ventures }) {
//   const available = ventures.reduce(
//     (a, v) => a + v.units.filter((u) => u.status === 'available').length,
//     0
//   );

//   const [heroMode, setHeroMode] = useState('poster');
//   const [videoSrcIndex, setVideoSrcIndex] = useState(0);
//   const [imageIndex, setImageIndex] = useState(0);

//   const videoRef = useRef(null);
//   const currentVideoSrc = HERO_VIDEO_SOURCES[videoSrcIndex];

//   // Balanced particles:
//   // - fewer particles
//   // - some small, some medium, some bigger
//   // - slightly faster movement
//   // - particles only on poster
//   const particles = useMemo(
//     () =>
//       Array.from({ length: 110 }, (_, i) => {
//         const isBig = i % 13 === 0;
//         const isMedium = i % 5 === 0;

//         return {
//           id: i,
//           left: Math.random() * 100,
//           top: Math.random() * 100,
//           size: isBig
//             ? Math.random() * 5 + 5
//             : isMedium
//               ? Math.random() * 3.8 + 3
//               : Math.random() * 2.3 + 1,
//           duration: Math.random() * 5 + 4,
//           delay: Math.random() * 3.5,
//           opacity: isBig
//             ? Math.random() * 0.34 + 0.2
//             : Math.random() * 0.42 + 0.14,
//           blurAmount: isBig ? Math.random() * 1.4 + 0.4 : Math.random() * 0.7,
//           tone: i % 5,
//         };
//       }),
//     []
//   );

//   const bokehParticles = useMemo(
//     () =>
//       Array.from({ length: 18 }, (_, i) => {
//         const isBig = i % 4 === 0;

//         return {
//           id: i,
//           left: Math.random() * 100,
//           top: Math.random() * 100,
//           size: isBig ? Math.random() * 24 + 18 : Math.random() * 13 + 7,
//           duration: Math.random() * 7 + 6,
//           delay: Math.random() * 4,
//           opacity: isBig ? Math.random() * 0.13 + 0.05 : Math.random() * 0.14 + 0.04,
//         };
//       }),
//     []
//   );

//   const lightStreaks = useMemo(
//     () =>
//       Array.from({ length: 5 }, (_, i) => ({
//         id: i,
//         left: Math.random() * 100,
//         top: Math.random() * 100,
//         width: Math.random() * 95 + 60,
//         rotation: Math.random() * 18 - 9,
//         duration: Math.random() * 4 + 4,
//         delay: Math.random() * 4,
//         opacity: Math.random() * 0.18 + 0.08,
//       })),
//     []
//   );

//   const starBursts = useMemo(
//     () =>
//       Array.from({ length: 10 }, (_, i) => ({
//         id: i,
//         left: Math.random() * 100,
//         top: Math.random() * 100,
//         size: Math.random() * 7 + 4,
//         duration: Math.random() * 2.2 + 1.8,
//         delay: Math.random() * 3.5,
//         opacity: Math.random() * 0.34 + 0.18,
//       })),
//     []
//   );

//   useEffect(() => {
//     if (heroMode !== 'poster') return undefined;

//     const timer = window.setTimeout(() => {
//       setHeroMode('video');
//     }, POSTER_VISIBLE_TIME);

//     return () => window.clearTimeout(timer);
//   }, [heroMode]);

//   useEffect(() => {
//     if (heroMode !== 'image') return undefined;

//     const timer = window.setTimeout(() => {
//       setImageIndex((currentIndex) => {
//         if (currentIndex >= HERO_REAL_ESTATE_IMAGES.length - 1) {
//           setHeroMode('poster');
//           return 0;
//         }

//         return currentIndex + 1;
//       });
//     }, IMAGE_VISIBLE_TIME);

//     return () => window.clearTimeout(timer);
//   }, [heroMode, imageIndex]);

//   useEffect(() => {
//     const video = videoRef.current;
//     if (!video || heroMode !== 'video') return undefined;

//     let cancelled = false;

//     video.load();

//     const startVideo = async () => {
//       try {
//         video.currentTime = 0;

//         const playPromise = video.play();

//         if (playPromise && typeof playPromise.then === 'function') {
//           await playPromise;
//         }
//       } catch (error) {
//         if (!cancelled) {
//           if (videoSrcIndex < HERO_VIDEO_SOURCES.length - 1) {
//             setVideoSrcIndex((index) => index + 1);
//           } else {
//             setImageIndex(0);
//             setHeroMode('image');
//           }
//         }
//       }
//     };

//     startVideo();

//     return () => {
//       cancelled = true;
//     };
//   }, [heroMode, videoSrcIndex]);

//   const showPoster = heroMode === 'poster';
//   const showImages = heroMode === 'image';

//   return (
//     <section className="aurov-hero relative w-full min-h-screen overflow-hidden flex items-center justify-center pt-24">
//       <div className="absolute inset-0 bg-gradient-to-br from-[#061944] via-[#08365d] to-[#07543d]" />

//       {/* VIDEO SCREEN - left/right padding only */}
//       <div
//         className={`hero-video-layer hero-media-frame ${
//           heroMode === 'video' ? 'opacity-100' : 'opacity-0 pointer-events-none'
//         }`}
//         aria-hidden={heroMode !== 'video'}
//       >
//         <div className="hero-media-shell">
//           <video
//             ref={videoRef}
//             key={currentVideoSrc}
//             src={currentVideoSrc}
//             className="hero-video"
//             muted
//             playsInline
//             preload="auto"
//             onEnded={() => {
//               setImageIndex(0);
//               setHeroMode('image');
//             }}
//             onError={() => {
//               if (videoSrcIndex < HERO_VIDEO_SOURCES.length - 1) {
//                 setVideoSrcIndex((index) => index + 1);
//               } else {
//                 setImageIndex(0);
//                 setHeroMode('image');
//               }
//             }}
//           />

//           <div className="hero-media-inner-glow" />
//         </div>

//         <div className="absolute inset-0 bg-gradient-to-b from-[#04132f]/30 via-transparent to-[#04132f]/35" />
//       </div>

//       {/* REAL ESTATE IMAGES SCREEN - left/right padding only */}
//       <div
//         className={`hero-image-layer hero-media-frame ${
//           showImages ? 'opacity-100' : 'opacity-0 pointer-events-none'
//         }`}
//         aria-hidden={!showImages}
//       >
//         <div className="hero-media-shell">
//           {HERO_REAL_ESTATE_IMAGES.map((slide, index) => (
//             <SmartImage
//               key={`hero-realestate-${index}`}
//               src={slide.image}
//               alt={slide.alt}
//               gradient={slide.gradient}
//               className={`hero-realestate-image ${
//                 index === imageIndex && showImages ? 'is-active' : ''
//               }`}
//             />
//           ))}

//           <div className="hero-media-inner-glow" />
//         </div>

//         <div className="hero-image-overlay" />
//         <div className="hero-image-shine" />
//       </div>

//       {/* PARTICLES ONLY WHEN POSTER COMES */}
//       {showPoster && (
//         <div className="hero-cinematic-particles" aria-hidden="true">
//           <div className="hero-star-noise" />

//           {bokehParticles.map((particle) => (
//             <span
//               key={`bokeh-${particle.id}`}
//               className="hero-bokeh-particle"
//               style={{
//                 left: `${particle.left}%`,
//                 top: `${particle.top}%`,
//                 width: `${particle.size}px`,
//                 height: `${particle.size}px`,
//                 opacity: particle.opacity,
//                 animationDuration: `${particle.duration}s`,
//                 animationDelay: `${particle.delay}s`,
//               }}
//             />
//           ))}

//           {particles.map((particle) => (
//             <span
//               key={`particle-${particle.id}`}
//               className={`hero-glow-particle particle-tone-${particle.tone}`}
//               style={{
//                 left: `${particle.left}%`,
//                 top: `${particle.top}%`,
//                 width: `${particle.size}px`,
//                 height: `${particle.size}px`,
//                 opacity: particle.opacity,
//                 filter: `blur(${particle.blurAmount}px)`,
//                 animationDuration: `${particle.duration}s`,
//                 animationDelay: `${particle.delay}s`,
//               }}
//             />
//           ))}

//           {lightStreaks.map((streak) => (
//             <span
//               key={`streak-${streak.id}`}
//               className="hero-light-streak"
//               style={{
//                 left: `${streak.left}%`,
//                 top: `${streak.top}%`,
//                 width: `${streak.width}px`,
//                 opacity: streak.opacity,
//                 '--streak-rotation': `${streak.rotation}deg`,
//                 animationDuration: `${streak.duration}s`,
//                 animationDelay: `${streak.delay}s`,
//               }}
//             />
//           ))}

//           {starBursts.map((star) => (
//             <span
//               key={`star-${star.id}`}
//               className="hero-star-burst"
//               style={{
//                 left: `${star.left}%`,
//                 top: `${star.top}%`,
//                 width: `${star.size}px`,
//                 height: `${star.size}px`,
//                 opacity: star.opacity,
//                 animationDuration: `${star.duration}s`,
//                 animationDelay: `${star.delay}s`,
//               }}
//             />
//           ))}
//         </div>
//       )}

//       {/* POSTER BACKGROUND - full screen, no padding */}
//       <div
//         className={`hero-poster-layer ${
//           showPoster ? 'opacity-100' : 'opacity-0 pointer-events-none'
//         }`}
//       >
//         <div className="absolute top-20 left-10 w-96 h-96 bg-[#00e5ff]/10 rounded-full blur-[110px] animate-float opacity-45" />
//         <div
//           className="absolute bottom-20 right-10 w-96 h-96 bg-[#2dd912]/10 rounded-full blur-[110px] animate-float opacity-35"
//           style={{ animationDelay: '2s' }}
//         />
//         <div
//           className="absolute top-1/2 left-1/3 w-80 h-80 bg-[#008B8B]/10 rounded-full blur-[90px] animate-float opacity-30"
//           style={{ animationDelay: '4s' }}
//         />
//         <div className="hero-lens-flare hero-lens-flare-one" />
//         <div className="hero-lens-flare hero-lens-flare-two" />
//         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#061944]/55" />
//       </div>

//       {/* POSTER CONTENT */}
//       <div
//         className={`hero-content relative z-10 text-center px-6 py-12 ${
//           showPoster ? 'opacity-100' : 'opacity-0 pointer-events-none'
//         }`}
//       >
//         <div className="mb-8 animate-scale-in">
//           <div className="inline-block relative">
//             <div className="absolute inset-0 bg-gradient-to-r from-[#00e5ff] to-[#2dd912] rounded-[32px] blur-2xl opacity-35 animate-pulse" />
//             <div className="hero-logo-card relative z-10">
//               <Logo className="hero-main-logo" />
//             </div>
//           </div>
//         </div>

//         <div className="mb-6 hero-title-wrap">
//           <h1 className="hero-title font-display font-extrabold text-white animate-slide-up leading-tight">
//             <span>AUROV</span>{' '}
//             <span className="hero-title-reality">REALITY</span>
//           </h1>
//         </div>

//         <div className="flex items-center justify-center gap-4 mb-8">
//           <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-[#2dd912]" />
//           <div className="w-2.5 h-2.5 rounded-full bg-[#2dd912] animate-pulse-glow" />
//           <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-[#2dd912]" />
//         </div>

//         <div className="overflow-hidden mb-10">
//           <p className="text-xl sm:text-2xl text-white/86 tracking-wide font-light animate-slide-up-delayed">
//             Thoughtfully Planned Communities Across Hyderabad
//           </p>
//         </div>

//         <div className="flex gap-8 sm:gap-16 justify-center mb-12 opacity-0 animate-fadeInDown [animation-delay:600ms] flex-wrap">
//           <StatCard value={ventures.length} label="Active ventures" />
//           <StatCard value={available} label="Units available" suffix="+" />
//           <StatCard value={4} label="Prime locations" />
//         </div>

//         <div className="flex flex-wrap gap-6 justify-center opacity-0 animate-fadeInDown [animation-delay:800ms]">
//           <button
//             onClick={goLogin}
//             className="relative px-8 py-4 bg-gradient-to-r from-[#00b67a] to-[#2dd912] text-white font-semibold rounded-xl overflow-hidden group hover:shadow-2xl hover:shadow-[#2dd912]/40 transition-all duration-300"
//           >
//             <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
//             <span className="relative flex items-center gap-2">
//               Explore Live Layouts <span>→</span>
//             </span>
//           </button>

//           <a
//             href="#contact"
//             className="relative px-8 py-4 border-2 border-[#2dd912] text-[#bfffb6] font-semibold rounded-xl overflow-hidden group hover:bg-[#2dd912]/10 transition-all duration-300"
//           >
//             <div className="absolute inset-0 bg-[#2dd912]/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
//             <span className="relative flex items-center gap-2">
//               Book Site Visit <span>→</span>
//             </span>
//           </a>
//         </div>
//       </div>

//       <div
//         className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce transition-opacity duration-500 ${
//           showPoster ? 'opacity-100' : 'opacity-0'
//         }`}
//       >
//         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#2dd912]">
//           <path
//             d="M12 5v14M5 12l7 7 7-7"
//             stroke="currentColor"
//             strokeWidth="2"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//           />
//         </svg>
//       </div>
//     </section>
//   );
// }

// function StatCard({ value, label, suffix = '' }) {
//   return (
//     <div className="text-center">
//       <div className="font-display font-extrabold text-4xl sm:text-5xl text-green mb-2">
//         {value}
//         {suffix}
//       </div>
//       <div className="text-white/70 text-sm uppercase tracking-widest">{label}</div>
//     </div>
//   );
// }

// export default function HomePage() {
//   const navigate = useNavigate();

//   const goLogin = () => navigate('/login');
//   const goRegister = () => navigate('/login');

//   return (
//     <div className="aurov-home font-sans text-ink bg-white">
//       <Nav goLogin={goLogin} goRegister={goRegister} />
//       <GlowingGlitterHero goLogin={goLogin} ventures={ventures} />
//       <TrustBar />
//       <About />
//       <Upcoming goLogin={goLogin} />
//       <Ventures ventures={ventures} goLogin={goLogin} />
//       <Masterplan />
//       <PhaseSpotlight />
//       <LocationAdvantages />
//       <SiteLocation />
//       <Amenities />
//       <Gallery />
//       <Testimonials />
//       <Faqs />
//       <Enquiry goLogin={goLogin} />
//       <Footer />
//     </div>
//   );
// }

// /* ---------------- NAV ---------------- */

// function Nav({ goLogin, goRegister }) {
//   const [scrolled, setScrolled] = useState(false);
//   const [open, setOpen] = useState(false);

//   useEffect(() => {
//     const onScroll = () => setScrolled(window.scrollY > 20);

//     window.addEventListener('scroll', onScroll);

//     return () => window.removeEventListener('scroll', onScroll);
//   }, []);

//   const links = [
//     ['#about', 'About'],
//     ['#ventures', 'Ventures'],
//     ['#masterplan', 'Masterplan'],
//     ['#spotlight', 'Phases'],
//     ['#amenities', 'Amenities'],
//     ['#location', 'Location'],
//     ['#gallery', 'Gallery'],
//     ['#contact', 'Contact'],
//   ];

//   return (
//     <header
//       className={`fixed top-0 inset-x-0 z-50 transition ${
//         scrolled
//           ? 'bg-white/95 backdrop-blur border-b border-ink/10 shadow-sm'
//           : 'bg-white/70 backdrop-blur-sm'
//       }`}
//     >
//       <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
//         <div className="rounded-lg transition">
//           <Logo className="h-9" />
//         </div>

//         <nav className="hidden lg:flex items-center gap-7">
//           {links.map(([h, l]) => (
//             <a key={h} href={h} className="text-sm font-medium transition text-ink/70 hover:text-navy">
//               {l}
//             </a>
//           ))}
//         </nav>

//         <div className="flex items-center gap-3">
//           <a href="tel:+919000012345" className="hidden sm:block text-sm font-semibold text-navy">
//             +91 90000 12345
//           </a>

//           <button
//             onClick={goRegister}
//             className="hidden sm:block rounded-xl border border-navy/15 bg-white text-navy px-4 py-2 text-sm font-semibold hover:border-navy/35 transition"
//           >
//             Register
//           </button>

//           <button
//             onClick={goLogin}
//             className="rounded-xl bg-green text-white px-4 py-2 text-sm font-semibold hover:brightness-95 transition"
//           >
//             Enquire / Sign in
//           </button>

//           <button onClick={() => setOpen(!open)} className="lg:hidden text-ink">
//             <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
//               <path
//                 d="M4 6h16M4 12h16M4 18h16"
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 strokeLinecap="round"
//               />
//             </svg>
//           </button>
//         </div>
//       </div>

//       {open && (
//         <div className="lg:hidden bg-white border-t border-ink/10 px-6 py-4 flex flex-col gap-3">
//           {links.map(([h, l]) => (
//             <a key={h} href={h} onClick={() => setOpen(false)} className="text-sm font-medium text-ink/70">
//               {l}
//             </a>
//           ))}

//           <button
//             onClick={() => {
//               setOpen(false);
//               goRegister();
//             }}
//             className="rounded-xl border border-navy/15 bg-white text-navy px-4 py-2 text-sm font-semibold text-left"
//           >
//             Register
//           </button>
//         </div>
//       )}
//     </header>
//   );
// }

// /* ---------------- OLD HERO KEPT BUT NOT USED ---------------- */

// function Hero({ goLogin, ventures }) {
//   const available = ventures.reduce(
//     (a, v) => a + v.units.filter((u) => u.status === 'available').length,
//     0
//   );

//   const [currentSlide, setCurrentSlide] = useState(0);

//   const heroSlides = [
//     { image: IMAGES.heroAerial, gradient: GRADIENTS.mix, overlay: 'rgba(1,48,138,0.4)' },
//     { image: IMAGES.plotsAerial, gradient: GRADIENTS.green, overlay: 'rgba(14,109,130,0.4)' },
//     { image: IMAGES.aboutSite, gradient: GRADIENTS.teal, overlay: 'rgba(52,195,27,0.3)' },
//   ];

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
//     }, 5000);

//     return () => clearInterval(timer);
//   }, [heroSlides.length]);

//   return (
//     <section className="relative bg-gradient-to-b from-navy via-ink to-navy overflow-hidden pt-24 pb-0 min-h-screen flex items-center justify-center">
//       <div className="absolute inset-0 overflow-hidden">
//         <ParticleBackground />
//       </div>

//       <div className="absolute inset-0">
//         {heroSlides.map((slide, idx) => (
//           <div
//             key={idx}
//             className={`absolute inset-0 transition-opacity duration-1000 ${
//               idx === currentSlide ? 'opacity-100' : 'opacity-0'
//             }`}
//           >
//             <SmartImage
//               src={slide.image}
//               alt="Aurov township"
//               className="absolute inset-0 w-full h-full object-cover"
//               gradient={slide.gradient}
//             />
//           </div>
//         ))}
//       </div>

//       <div className="absolute inset-0 bg-gradient-to-b from-navy/60 via-navy/70 to-navy/80" />

//       <div className="relative z-10 max-w-6xl mx-auto px-6 text-center py-20">
//         <div className="space-y-6 mb-12">
//           <div className="inline-block">
//             <span className="text-green text-sm font-semibold uppercase tracking-[0.3em] opacity-0 animate-fadeInDown">
//               Premium Communities
//             </span>
//           </div>

//           <h1 className="font-display font-extrabold tracking-tight text-white">
//             <span className="block text-5xl sm:text-6xl lg:text-7xl opacity-0 animate-fadeInDown [animation-delay:100ms]">
//               Thoughtfully
//             </span>
//             <span className="block text-5xl sm:text-6xl lg:text-7xl mt-2 opacity-0 animate-fadeInDown [animation-delay:200ms]">
//               Planned <span className="text-green">Communities</span>
//             </span>
//             <span className="block text-3xl sm:text-4xl lg:text-5xl mt-4 text-white/80 font-light opacity-0 animate-fadeInDown [animation-delay:300ms]">
//               where you live &amp; grow
//             </span>
//           </h1>
//         </div>

//         <div className="opacity-0 animate-fadeInDown [animation-delay:400ms] mb-10">
//           <span className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur border border-white/20 px-4 py-2 text-sm font-semibold text-white">
//             <span className="h-2 w-2 rounded-full bg-green animate-pulse" />
//             HMDA &amp; RERA approved · Now selling
//           </span>
//         </div>

//         <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-12 opacity-0 animate-fadeInDown [animation-delay:500ms] leading-relaxed">
//           Live, interactive layouts — see exactly what's available, held, or sold. Reserve your space in minutes.
//         </p>

//         <div className="flex flex-wrap gap-4 justify-center mb-12 opacity-0 animate-fadeInDown [animation-delay:600ms]">
//           <button
//             onClick={goLogin}
//             className="pulse-cta shine rounded-xl bg-green text-white px-8 py-4 font-semibold hover:brightness-110 transition shadow-lg shadow-green/50 text-base"
//           >
//             Explore live layouts
//           </button>

//           <a
//             href="#contact"
//             className="shine rounded-xl bg-white/20 backdrop-blur text-white px-8 py-4 font-semibold hover:bg-white/30 transition border border-white/30 text-base"
//           >
//             Book a site visit
//           </a>
//         </div>

//         <div className="flex gap-8 sm:gap-16 justify-center opacity-0 animate-fadeInDown [animation-delay:700ms] flex-wrap">
//           <HeroStat value={ventures.length} l="Active ventures" />
//           <HeroStat value={available} suffix="+" l="Units available" />
//           <HeroStat value={4} l="Prime locations" />
//         </div>

//         <div className="flex gap-2 justify-center mt-16 opacity-0 animate-fadeInDown [animation-delay:800ms]">
//           {heroSlides.map((_, idx) => (
//             <button
//               key={idx}
//               onClick={() => setCurrentSlide(idx)}
//               className={`h-2 rounded-full transition-all duration-300 ${
//                 idx === currentSlide ? 'bg-green w-8' : 'bg-white/40 w-2 hover:bg-white/60'
//               }`}
//               aria-label={`Go to slide ${idx + 1}`}
//             />
//           ))}
//         </div>
//       </div>

//       <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
//         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white/60">
//           <path
//             d="M12 5v14M5 12l7 7 7-7"
//             stroke="currentColor"
//             strokeWidth="2"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//           />
//         </svg>
//       </div>
//     </section>
//   );
// }

// function ParticleBackground() {
//   const particles = Array.from({ length: 50 }, (_, i) => ({
//     id: i,
//     left: Math.random() * 100,
//     top: Math.random() * 100,
//     size: Math.random() * 3 + 1,
//     duration: Math.random() * 10 + 5,
//     delay: Math.random() * 2,
//   }));

//   return (
//     <div className="absolute inset-0">
//       {particles.map((particle) => (
//         <div
//           key={particle.id}
//           className="absolute rounded-full bg-white/30 animate-float"
//           style={{
//             left: `${particle.left}%`,
//             top: `${particle.top}%`,
//             width: `${particle.size}px`,
//             height: `${particle.size}px`,
//             animation: `float ${particle.duration}s ease-in-out infinite`,
//             animationDelay: `${particle.delay}s`,
//             filter: 'blur(0.5px)',
//           }}
//         />
//       ))}
//     </div>
//   );
// }

// function HeroStat({ value, suffix = '', l }) {
//   return (
//     <div>
//       <AnimatedNumber
//         value={value}
//         suffix={suffix}
//         className="font-display font-extrabold text-3xl sm:text-4xl text-white"
//       />
//       <div className="text-white/70 text-sm mt-1">{l}</div>
//     </div>
//   );
// }

// /* ---------------- REST COMPONENTS ---------------- */

// function TrustBar() {
//   const items = ['HMDA & RERA approved', 'Clear marketable titles', 'Bank-loan ready', '15+ years building Hyderabad'];

//   return (
//     <div className="bg-green text-white">
//       <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-center gap-x-10 gap-y-2 text-sm font-medium">
//         {items.map((t, i) => (
//           <span key={i} className="flex items-center gap-2">
//             <Check light /> {t}
//           </span>
//         ))}
//       </div>
//     </div>
//   );
// }

// function About() {
//   const aboutVideoRef = useRef(null);
//   const [isAboutVideoPlaying, setIsAboutVideoPlaying] = useState(false);

//   const startAboutVideo = async () => {
//     const video = aboutVideoRef.current;
//     if (!video) return;

//     try {
//       video.muted = false;
//       video.volume = 1;
//       await video.play();
//       setIsAboutVideoPlaying(true);
//     } catch (error) {
//       console.log('Video play blocked:', error);
//     }
//   };

//   const pauseAboutVideo = () => {
//     const video = aboutVideoRef.current;
//     if (!video) return;

//     video.pause();
//     setIsAboutVideoPlaying(false);
//   };

//   return (
//     <section id="about" className="relative overflow-hidden py-24">
//       <WatercolorWash variant="soft" opacity={0.5} />

//       <div className="relative max-w-7xl mx-auto px-6">
//         <div className="grid lg:grid-cols-2 gap-12 items-center">
//           <div className="relative">
//             <div
//               className="about-video-card rounded-3xl overflow-hidden h-[420px] shadow-xl relative"
//               style={{ background: 'linear-gradient(135deg,#01308A,#006D82 60%,#34C31B 140%)' }}
//             >
//               <video
//                 ref={aboutVideoRef}
//                 className="about-video-bg"
//                 src={ABOUT_WALKTHROUGH_VIDEO}
//                 playsInline
//                 preload="metadata"
//                 onPlay={() => setIsAboutVideoPlaying(true)}
//                 onPause={() => setIsAboutVideoPlaying(false)}
//                 onEnded={() => setIsAboutVideoPlaying(false)}
//               />

//               <WatercolorWash variant="hero" opacity={0.32} />
//               <div className="about-video-soft-overlay" />

//               <div className="absolute inset-0 flex flex-col items-center justify-center text-white group z-10">
//                 {!isAboutVideoPlaying ? (
//                   <button
//                     type="button"
//                     onClick={startAboutVideo}
//                     className="about-video-control-btn"
//                     aria-label="Start walkthrough video with sound"
//                   >
//                     <span className="h-16 w-16 rounded-full bg-white/90 flex items-center justify-center shadow-xl group-hover:scale-110 transition">
//                       <svg width="26" height="26" viewBox="0 0 24 24" fill="#01308A">
//                         <path d="M8 5v14l11-7z" />
//                       </svg>
//                     </span>
//                     <span className="mt-4 font-medium">Start project walkthrough</span>
//                     <span className="text-white/70 text-xs mt-1">Tap to play with sound</span>
//                   </button>
//                 ) : (
//                   <button
//                     type="button"
//                     onClick={pauseAboutVideo}
//                     className="about-video-control-btn"
//                     aria-label="Pause walkthrough video"
//                   >
//                     <span className="h-16 w-16 rounded-full bg-white/90 flex items-center justify-center shadow-xl group-hover:scale-110 transition">
//                       <svg width="26" height="26" viewBox="0 0 24 24" fill="#01308A">
//                         <path d="M7 5h4v14H7V5zm6 0h4v14h-4V5z" />
//                       </svg>
//                     </span>
//                     <span className="mt-4 font-medium">Pause project walkthrough</span>
//                     <span className="text-white/70 text-xs mt-1">Video playing with sound</span>
//                   </button>
//                 )}

//                 <a
//                   href={ABOUT_WALKTHROUGH_URL}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="about-video-open-link"
//                 >
//                   Open website →
//                 </a>
//               </div>
//             </div>

//             <div className="absolute -bottom-6 -right-2 sm:right-6 bg-white rounded-2xl shadow-lg border border-ink/10 px-6 py-4">
//               <div className="font-display font-extrabold text-3xl text-navy">
//                 460<span className="text-green">+</span>
//               </div>
//               <div className="text-xs text-ink/50">acres planned across ventures</div>
//             </div>
//           </div>

//           <div>
//             <Eyebrow>About Aurov Reality</Eyebrow>

//             <h2 className="font-display font-extrabold text-5xl sm:text-6xl leading-tight text-ink mt-2 mb-5">
//               Thoughtfully designed places to live and grow
//             </h2>

//             <p className="text-ink/70 leading-relaxed mb-4">
//               Aurov Reality develops gated plot layouts and modern apartments across Hyderabad's
//               fastest-growing corridors. Every venture is planned around clear roads, generous open
//               space, and amenities that communities actually use.
//             </p>

//             <p className="text-ink/70 leading-relaxed mb-6">
//               What sets us apart is transparency: each venture has a live, interactive layout where
//               you can inspect any plot or flat — its size, facing, boundaries and price — and see in
//               real time whether it's available, held, or sold.
//             </p>

//             <div className="grid sm:grid-cols-3 gap-4">
//               <Mini n="4" l="Active ventures" />
//               <Mini n="HMDA" l="Approved layouts" />
//               <Mini n="10 min" l="From the ORR" />
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

// function Mini({ n, l }) {
//   return (
//     <div className="rounded-2xl border border-ink/10 bg-mist p-4">
//       <div className="font-display font-bold text-xl text-navy">{n}</div>
//       <div className="text-xs text-ink/50 mt-0.5">{l}</div>
//     </div>
//   );
// }

// function Ventures({ ventures, goLogin }) {
//   return (
//     <section id="ventures" className="bg-white py-24">
//       <div className="max-w-7xl mx-auto px-6">
//         <Reveal>
//           <Centered
//             eyebrow="Our ventures"
//             title="Project spotlight"
//             sub="Each venture comes with a live, interactive layout. Sign in to open the site map, inspect any plot or flat, and reserve in minutes."
//           />
//         </Reveal>

//         <div className="grid md:grid-cols-2 gap-8 mt-12">
//           {ventures.map((v, idx) => {
//             const avail = v.units.filter((u) => u.status === 'available').length;

//             return (
//               <Reveal key={v.id} delay={idx * 110} className="h-full">
//                 <article className="lift group rounded-3xl overflow-hidden bg-white border border-ink/10 h-full">
//                   <div className="relative h-60">
//                     <SmartImage
//                       src={v.image}
//                       alt={v.name}
//                       className="absolute inset-0 w-full h-full group-hover:scale-105 transition duration-500"
//                       gradient={v.type === 'flat' ? GRADIENTS.teal : GRADIENTS.green}
//                     />

//                     <div
//                       className="absolute inset-0"
//                       style={{ background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.6) 100%)' }}
//                     />

//                     <span
//                       className={`absolute top-4 left-4 text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full text-white ${
//                         v.type === 'flat' ? 'bg-teal' : 'bg-green'
//                       }`}
//                     >
//                       {v.type === 'flat' ? 'Flats' : 'Open Plots'}
//                     </span>

//                     <span className="absolute top-4 right-4 text-xs text-white/90 bg-black/30 rounded-full px-2.5 py-1">
//                       {v.possession}
//                     </span>

//                     <div className="absolute bottom-4 left-4 right-4 text-white">
//                       <h3 className="font-display font-bold text-2xl">{v.name}</h3>
//                       <p className="text-white/80 text-sm">{v.location}</p>
//                     </div>
//                   </div>

//                   <div className="p-6">
//                     <p className="text-ink/70 mb-4">{v.tagline}</p>

//                     <div className="flex flex-wrap gap-1.5 mb-5">
//                       {v.amenities.slice(0, 4).map((a) => (
//                         <span key={a} className="text-xs bg-mist text-ink/60 px-2.5 py-1 rounded-full">
//                           {a}
//                         </span>
//                       ))}
//                     </div>

//                     <div className="flex items-center justify-between border-t border-ink/10 pt-4">
//                       <div>
//                         <div className="text-xs text-ink/40">Starting from</div>
//                         <div className="font-display font-bold text-xl text-navy">{inrShort(v.priceFrom)}</div>
//                       </div>

//                       <div className="text-right">
//                         <div className="text-xs text-ink/40">Available</div>
//                         <div className="font-display font-bold text-green">
//                           {avail} / {v.units.length}
//                         </div>
//                       </div>
//                     </div>

//                     <button
//                       onClick={goLogin}
//                       className="shine w-full mt-5 rounded-xl bg-navy text-white py-2.5 text-sm font-semibold hover:brightness-110 transition"
//                     >
//                       View live layout →
//                     </button>
//                   </div>
//                 </article>
//               </Reveal>
//             );
//           })}
//         </div>
//       </div>
//     </section>
//   );
// }

// function Masterplan() {
//   const plans = [
//     { src: IMAGES.masterplan, label: 'Township masterplan', grad: GRADIENTS.navy },
//     { src: IMAGES.plotsAerial, label: 'Plot layout plan', grad: GRADIENTS.green },
//     { src: IMAGES.aboutSite, label: 'Amenity zones', grad: GRADIENTS.teal },
//   ];

//   return (
//     <section id="masterplan" className="brand-section relative overflow-hidden py-24 text-white">
//       <WatercolorWash variant="cta" opacity={0.3} />

//       <div className="relative max-w-7xl mx-auto px-6">
//         <Reveal>
//           <Centered
//             light
//             eyebrow="Site plan"
//             title="Masterplans — Aurov ventures"
//             sub="Wide internal roads, avenue plantation, and amenity zones — planned before a single plot is sold."
//           />
//         </Reveal>

//         <div className="grid md:grid-cols-3 gap-6 mt-12">
//           {plans.map((p, i) => (
//             <Reveal key={i} delay={i * 110}>
//               <figure className="lift rounded-3xl overflow-hidden border border-white/15 shadow-lg bg-white">
//                 <div className="h-56">
//                   <SmartImage src={p.src} alt={p.label} className="w-full h-full" gradient={p.grad} />
//                 </div>
//                 <figcaption className="px-5 py-3 text-sm font-medium text-ink/70">{p.label}</figcaption>
//               </figure>
//             </Reveal>
//           ))}
//         </div>

//         <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
//           {[
//             ['40–60 ft', 'internal roads'],
//             ['8+ acres', 'landscaped greenery'],
//             ['100%', 'gated & secured'],
//             ['Avenue', 'tree plantation'],
//           ].map(([n, l]) => (
//             <div key={l} className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur p-5 text-center">
//               <div className="font-display font-extrabold text-2xl text-white">{n}</div>
//               <div className="text-xs text-white/70 mt-1">{l}</div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }


// function Upcoming({ goLogin }) {
//   const features = [
//     'Net-zero design',
//     'Clubhouse & pool',
//     'EV charging',
//     'Organic gardens',
//     '100ft approach road',
//     'Near upcoming metro',
//   ];

//   return (
//     <section className="brand-section relative overflow-hidden py-24 text-white">
//       <WatercolorWash variant="cta" opacity={0.35} />

//       <div className="relative max-w-7xl mx-auto px-6">
//         <Reveal>
//           <Centered
//             light
//             eyebrow="Coming soon"
//             title="Upcoming from Aurov"
//             sub="A preview of the next Aurov community taking shape."
//           />
//         </Reveal>

//         <Reveal>
//           <div className="grid lg:grid-cols-2 gap-0 mt-12 rounded-3xl overflow-hidden border border-ink/10 bg-white shadow-sm lift">
//             <div className="relative min-h-[300px]">
//               <SmartImage
//                 src={IMAGES.upcoming}
//                 alt="Aurov Windgrove"
//                 className="absolute inset-0 w-full h-full"
//                 gradient={GRADIENTS.mix}
//               />

//               <span className="absolute top-4 left-4 text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full text-white bg-green">
//                 Pre-launch
//               </span>
//             </div>

//             <div className="p-8 lg:p-10 bg-white text-[#1B1B1B]">
//               <h3 className="font-display font-extrabold text-3xl text-[#1B1B1B] mb-2">
//                 Aurov Windgrove
//               </h3>

//               <p className="text-[#667085] text-sm mb-4">
//                 Inole, Hyderabad · 70+ acres
//               </p>

//               <p className="text-[#344054] leading-relaxed mb-4">
//                 A sustainable, low-density community of premium plots and garden villas wrapped in
//                 native landscaping. Designed around solar power, EV charging, rainwater harvesting,
//                 and a central green spine — an eco-conscious address in the next growth corridor.
//               </p>

//               <ul className="grid grid-cols-2 gap-2 mb-6 text-sm text-[#344054]">
//                 {features.map((feature) => (
//                   <li key={feature} className="flex items-center gap-2 text-[#344054]">
//                     <span className="h-1.5 w-1.5 rounded-full bg-green shrink-0" />
//                     <span>{feature}</span>
//                   </li>
//                 ))}
//               </ul>

//               <button
//                 onClick={goLogin}
//                 className="shine rounded-xl bg-navy text-white px-6 py-3 font-semibold hover:brightness-110 transition"
//               >
//                 Register your interest
//               </button>
//             </div>
//           </div>
//         </Reveal>
//       </div>
//     </section>
//   );
// }

// function PhaseSpotlight() {
//   const phases = [
//     {
//       tag: 'Phase 1',
//       title: 'Green Meadows — ready plots',
//       img: IMAGES.phase1,
//       side: 'left',
//       body:
//         'HMDA-approved open plots on 8 acres of landscaped greenery, with 40–60 ft roads, avenue plantation, a clubhouse and overhead tank. Infrastructure complete and ready for registration.',
//     },
//     {
//       tag: 'Phase 2',
//       title: 'Ridgeview — premium plots',
//       img: IMAGES.phase2,
//       side: 'right',
//       body:
//         'East-facing premium plots minutes from the ORR, with underground drainage, solar street lights and a jogging track. Gated entry and a planned amenity core.',
//     },
//     {
//       tag: 'Phase 3',
//       title: 'Skyline & Parkside — flats',
//       img: IMAGES.phase3,
//       side: 'left',
//       body:
//         '2 & 3 BHK apartments with infinity pool, gym, covered parking and 24×7 security — lake- and park-facing towers in Kokapet and Tellapur.',
//     },
//   ];

//   return (
//     <section id="spotlight" className="max-w-7xl mx-auto px-6 py-24">
//       <Reveal>
//         <Centered
//           eyebrow="Project spotlight"
//           title="Our phases at a glance"
//           sub="From ready-to-register plots to flats nearing possession — explore each phase."
//         />
//       </Reveal>

//       <div className="space-y-16 mt-14">
//         {phases.map((p, i) => (
//           <Reveal key={i}>
//             <div
//               className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-center ${
//                 p.side === 'right' ? 'lg:[&>*:first-child]:order-2' : ''
//               }`}
//             >
//               <div className="grid grid-cols-2 gap-3">
//                 <div className="rounded-2xl overflow-hidden h-44 col-span-2">
//                   <SmartImage src={p.img} alt={p.title} className="w-full h-full lift" gradient={GRADIENTS.teal} />
//                 </div>

//                 <div className="rounded-2xl overflow-hidden h-28">
//                   <SmartImage src={IMAGES.interior} alt="" className="w-full h-full" gradient={GRADIENTS.navy} />
//                 </div>

//                 <div className="rounded-2xl overflow-hidden h-28">
//                   <SmartImage src={IMAGES.clubhouse} alt="" className="w-full h-full" gradient={GRADIENTS.green} />
//                 </div>
//               </div>

//               <div>
//                 <span className="text-xs font-semibold uppercase tracking-widest text-teal">{p.tag}</span>
//                 <h3 className="font-display font-extrabold text-3xl text-ink mt-2 mb-3">{p.title}</h3>
//                 <p className="text-ink/70 leading-relaxed">{p.body}</p>
//               </div>
//             </div>
//           </Reveal>
//         ))}
//       </div>
//     </section>
//   );
// }

// function SiteLocation() {
//   return (
//     <section id="location" className="max-w-7xl mx-auto px-6 py-24">
//       <Reveal>
//         <Centered
//           eyebrow="Site location"
//           title="Find us on the map"
//           sub="Our ventures sit along Hyderabad's western and southern growth corridors."
//         />
//       </Reveal>

//       <Reveal>
//         <div className="mt-12 rounded-3xl overflow-hidden border border-ink/10 shadow-sm h-[420px]">
//           <iframe
//             title="Aurov ventures — Hyderabad"
//             src="https://www.google.com/maps?q=Hyderabad,+Telangana&z=11&output=embed"
//             width="100%"
//             height="100%"
//             style={{ border: 0 }}
//             loading="lazy"
//             referrerPolicy="no-referrer-when-downgrade"
//             allowFullScreen
//           />
//         </div>
//       </Reveal>
//     </section>
//   );
// }

// function LocationAdvantages() {
//   const groups = [
//     { t: '10 mins', items: ['ORR', 'Upcoming Metro', 'IT Park', 'Medical College'] },
//     { t: '30 mins', items: ['Financial District', 'Kokapet / Neopolis', 'Top schools', 'Universities'] },
//     { t: '45 mins', items: ['Hi-Tech City', 'Airport', 'IIT Hyderabad'] },
//   ];

//   return (
//     <section className="brand-section relative overflow-hidden py-24 text-white">
//       <WatercolorWash variant="cta" opacity={0.3} />

//       <div className="relative max-w-7xl mx-auto px-6">
//         <Reveal>
//           <Centered
//             light
//             eyebrow="Connectivity"
//             title="Location advantages"
//             sub="Seamless access to Hyderabad's growth corridors via the ORR and upcoming metro."
//           />
//         </Reveal>

//         <div className="grid md:grid-cols-3 gap-6 mt-12">
//           {groups.map((g, idx) => (
//             <Reveal key={g.t} delay={idx * 110}>
//               <div className="lift rounded-3xl bg-white/10 backdrop-blur border border-white/20 p-6 h-full">
//                 <div className="flex items-center gap-3 mb-4">
//                   <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
//                     <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-white">
//                       <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
//                       <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
//                     </svg>
//                   </div>

//                   <div className="font-display font-extrabold text-2xl text-white">Within {g.t}</div>
//                 </div>

//                 <ul className="space-y-2">
//                   {g.items.map((i) => (
//                     <li key={i} className="flex items-center gap-2 text-white/85 text-sm">
//                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-white shrink-0">
//                         <path
//                           d="M12 21s-7-5.5-7-11a7 7 0 1114 0c0 5.5-7 11-7 11z"
//                           stroke="currentColor"
//                           strokeWidth="2"
//                         />
//                         <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="2" />
//                       </svg>
//                       {i}
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             </Reveal>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

// function Amenities() {
//   const indoor = [
//     ['Clubhouse', 'M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6'],
//     ['A/C gym', 'M6 7v10M18 7v10M4 9h2M18 9h2M4 15h2M18 15h2M6 12h12'],
//     ['Yoga / aerobics', 'M12 4a2 2 0 100 4 2 2 0 000-4zM6 21l3-7 3 2 3-2 3 7M9 14l-2-4h10l-2 4'],
//     ['Multipurpose hall', 'M3 9l9-6 9 6M5 9v11h14V9M9 20v-6h6v6'],
//     ['Indoor games', 'M4 6h16v12H4zM8 6v12M16 6v12'],
//     ['Library', 'M5 4h4v16H5zM10 4h4v16h-4zM16 5l3 1-3 14-3-1'],
//     ['Convenience store', 'M4 9h16l-1 11H5L4 9zM4 9l2-5h12l2 5M9 13h6'],
//     ['Society office', 'M6 21V7l6-4 6 4v14M10 12h4M10 16h4'],
//   ];

//   const outdoor = [
//     ['Swimming pool', 'M2 17c2 0 2 1 4 1s2-1 4-1 2 1 4 1 2-1 4-1 2 1 4 1M5 14V6a2 2 0 014 0M15 14V6a2 2 0 014 0'],
//     ["Kids' pool", 'M2 18c2 0 2 1 4 1s2-1 4-1 2 1 4 1 2-1 4-1M7 14a3 3 0 016 0'],
//     ['Play area', 'M12 3v6M8 9h8l-2 6H10L8 9zM9 21l1-6M15 21l-1-6'],
//     ['Jogging track', 'M13 4a2 2 0 100 4 2 2 0 000-4zM5 21l4-8 3 2v6M9 13l-2-4 5-1 3 3 3 1'],
//     ['Open lawn', 'M3 20h18M5 20c0-5 2-9 7-9s7 4 7 9M9 11V5M9 5l3-2'],
//     ['Landscaped parks', 'M12 3a5 5 0 015 5c0 3-5 8-5 8s-5-5-5-8a5 5 0 015-5zM12 16v5'],
//     ['Box cricket', 'M4 20l9-9M14 5l5 5M13 6l5 5-2 2-5-5z'],
//     ['Pet park', 'M5 11a2 2 0 100-4 2 2 0 000 4zM19 11a2 2 0 100-4 2 2 0 000 4zM9 8a2 2 0 100-4 2 2 0 000 4zM15 8a2 2 0 100-4 2 2 0 000 4zM12 12c-3 0-5 2-5 5h10c0-3-2-5-5-5z'],
//   ];

//   return (
//     <section id="amenities" className="brand-section relative overflow-hidden py-24 text-white">
//       <WatercolorWash variant="cta" opacity={0.3} />

//       <div className="relative max-w-7xl mx-auto px-6">
//         <Reveal>
//           <Centered
//             light
//             eyebrow="Lifestyle"
//             title="Amenities & facilities"
//             sub="A diverse array of amenities for a well-rounded living experience — indoors and out."
//           />
//         </Reveal>

//         <Reveal>
//           <h3 className="font-display font-bold text-xl text-white mt-12 mb-5">Indoor amenities</h3>
//         </Reveal>

//         <IconGrid items={indoor} />

//         <Reveal>
//           <h3 className="font-display font-bold text-xl text-white mt-12 mb-5">Outdoor amenities</h3>
//         </Reveal>

//         <IconGrid items={outdoor} />
//       </div>
//     </section>
//   );
// }

// function IconGrid({ items }) {
//   return (
//     <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//       {items.map(([label, d], i) => (
//         <Reveal key={label} delay={i * 50}>
//           <div className="lift rounded-2xl border border-white/20 bg-white/10 backdrop-blur p-5 text-center h-full">
//             <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-3">
//               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
//                 <path d={d} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
//               </svg>
//             </div>

//             <div className="text-sm text-white/85">{label}</div>
//           </div>
//         </Reveal>
//       ))}
//     </div>
//   );
// }

// function Gallery() {
//   const shots = [
//     { src: IMAGES.clubhouse, label: 'Clubhouse', grad: GRADIENTS.navy, span: 'sm:col-span-2 sm:row-span-2' },
//     { src: IMAGES.pool, label: 'Swimming pool', grad: GRADIENTS.teal, span: '' },
//     { src: IMAGES.park, label: 'Landscaped parks', grad: GRADIENTS.green, span: '' },
//     { src: IMAGES.road, label: 'Tree-lined avenues', grad: GRADIENTS.teal, span: '' },
//     { src: IMAGES.interior, label: 'Sample interiors', grad: GRADIENTS.navy, span: '' },
//   ];

//   return (
//     <section id="gallery" className="bg-white py-24">
//       <div className="max-w-7xl mx-auto px-6">
//         <Reveal>
//           <Centered
//             eyebrow="Gallery"
//             title="Life at Aurov"
//             sub="Amenities and surroundings designed for how communities actually live."
//           />
//         </Reveal>

//         <div className="grid sm:grid-cols-3 lg:grid-cols-4 auto-rows-[180px] gap-4 mt-12">
//           {shots.map((s, i) => (
//             <Reveal key={i} delay={i * 80} className={s.span}>
//               <div className="lift relative rounded-2xl overflow-hidden group h-full w-full">
//                 <SmartImage
//                   src={s.src}
//                   alt={s.label}
//                   className="absolute inset-0 w-full h-full group-hover:scale-105 transition duration-500"
//                   gradient={s.grad}
//                 />

//                 <div
//                   className="absolute inset-0"
//                   style={{ background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.6) 100%)' }}
//                 />

//                 <span className="absolute bottom-3 left-4 text-white font-medium text-sm">{s.label}</span>
//               </div>
//             </Reveal>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

// function Testimonials() {
//   const items = [
//     {
//       q: 'The live layout made all the difference — I could see the exact plot, its boundaries and price before visiting. Booked in a week.',
//       n: 'Sandeep Reddy',
//       r: 'Green Meadows',
//       img: IMAGES.person1,
//     },
//     {
//       q: 'No back-and-forth on what was available. The colour map was honest, and the EMI calculator helped me plan the 3 BHK confidently.',
//       n: 'Lakshmi Menon',
//       r: 'Skyline Residences',
//       img: IMAGES.person2,
//     },
//     {
//       q: 'Site visit was a two-tap booking and the paperwork was genuinely clear. Easiest land purchase I have made.',
//       n: 'Imran Khan',
//       r: 'Ridgeview Plots',
//       img: IMAGES.person3,
//     },
//   ];

//   return (
//     <section className="brand-section relative overflow-hidden py-24 text-white">
//       <WatercolorWash variant="cta" opacity={0.3} />

//       <div className="relative max-w-7xl mx-auto px-6">
//         <Reveal>
//           <Centered light eyebrow="Owners" title="What our buyers say" sub="A few words from owners across our ventures." />
//         </Reveal>

//         <div className="grid md:grid-cols-3 gap-6 mt-12">
//           {items.map((t, i) => (
//             <figure key={i} className="lift rounded-2xl bg-white/10 backdrop-blur border border-white/20 p-6">
//               <div className="text-white text-sm mb-3">★★★★★</div>

//               <blockquote className="text-white/90 text-sm leading-relaxed mb-5">{t.q}</blockquote>

//               <figcaption className="flex items-center gap-3">
//                 <SmartImage
//                   src={t.img}
//                   alt={t.n}
//                   className="h-10 w-10 rounded-full overflow-hidden shrink-0"
//                   gradient={GRADIENTS.green}
//                 />

//                 <div>
//                   <div className="text-white font-medium text-sm">{t.n}</div>
//                   <div className="text-white/60 text-xs">{t.r}</div>
//                 </div>
//               </figcaption>
//             </figure>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

// function Faqs() {
//   const faqs = [
//     [
//       'What do Aurov ventures cost?',
//       'Open plots start around ₹12 lakh and flats from about ₹68 lakh, depending on venture, size and facing. Exact prices are shown live on each unit in the layout.',
//     ],
//     [
//       'Are the layouts approved?',
//       'Yes — our plot ventures are HMDA-approved with clear, marketable titles, and our flat projects are RERA-registered.',
//     ],
//     [
//       'Can I get a home loan?',
//       'All ventures are bank-loan ready. The built-in EMI calculator lets you estimate instalments on any unit before you commit.',
//     ],
//     [
//       'How do I book a site visit?',
//       'Sign in, open a venture, and use "Book site visit" to pick a date and slot. Our team confirms it from the admin side.',
//     ],
//     [
//       'How does reservation work?',
//       'Select an available (green) unit, reserve it (turns yellow), complete the payment, and on admin approval it is confirmed as booked (red).',
//     ],
//   ];

//   const [open, setOpen] = useState(0);

//   return (
//     <section className="bg-white py-24">
//       <div className="max-w-3xl mx-auto px-6">
//         <Reveal>
//           <Centered eyebrow="FAQs" title="Frequently asked questions" />
//         </Reveal>

//         <div className="mt-10 space-y-3">
//           {faqs.map(([q, a], i) => (
//             <div key={i} className="rounded-2xl bg-white border border-ink/10 overflow-hidden">
//               <button
//                 onClick={() => setOpen(open === i ? -1 : i)}
//                 className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
//               >
//                 <span className="font-medium text-ink">{q}</span>
//                 <span className={`text-green text-xl transition ${open === i ? 'rotate-45' : ''}`}>+</span>
//               </button>

//               {open === i && <div className="px-5 pb-4 text-sm text-ink/65 leading-relaxed">{a}</div>}
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

// function Enquiry({ goLogin }) {
//   const [sent, setSent] = useState(false);
//   const [form, setForm] = useState({ name: '', phone: '', interest: 'Open plots' });

//   const submit = () => {
//     if (form.name && form.phone) setSent(true);
//   };

//   return (
//     <section id="contact" className="relative py-24">
//       <SmartImage
//         src={IMAGES.ctaLand}
//         alt="Open land at sunrise"
//         className="absolute inset-0 w-full h-full"
//         gradient={GRADIENTS.mix}
//       />

//       <WatercolorWash variant="cta" opacity={0.6} />

//       <div className="absolute inset-0 bg-ink/70" />

//       <div className="relative max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
//         <div className="text-white">
//           <Eyebrow light>Quick enquiry</Eyebrow>

//           <h2 className="font-display font-extrabold text-4xl mt-2 mb-4">Ready to see what's available?</h2>

//           <p className="text-white/80 mb-6">
//             Leave your details and our team will walk you through the live layouts, or sign in now to explore them yourself.
//           </p>

//           <div className="space-y-3 text-white/90 text-sm">
//             <p className="flex items-center gap-3">
//               <Dot /> Sales office · Banjara Hills, Hyderabad
//             </p>
//             <p className="flex items-center gap-3">
//               <Dot /> +91 90000 12345 · sales@aurov.com
//             </p>
//             <p className="flex items-center gap-3">
//               <Dot /> Open all days · 9:30 AM – 7:00 PM
//             </p>
//           </div>

//           <div className="mt-6 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl h-56">
//             <iframe
//               title="Aurov Reality sales office — Banjara Hills, Hyderabad"
//               src="https://www.google.com/maps?q=Banjara+Hills,+Hyderabad,+Telangana&z=14&output=embed"
//               width="100%"
//               height="100%"
//               style={{ border: 0 }}
//               loading="lazy"
//               referrerPolicy="no-referrer-when-downgrade"
//               allowFullScreen
//             />
//           </div>

//           <a
//             href="https://www.google.com/maps/search/?api=1&query=Banjara+Hills+Hyderabad"
//             target="_blank"
//             rel="noopener noreferrer"
//             className="inline-flex items-center gap-2 mt-3 text-sm text-white/90 hover:text-white transition"
//           >
//             <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
//               <path
//                 d="M12 21s-7-5.5-7-11a7 7 0 1114 0c0 5.5-7 11-7 11z"
//                 stroke="currentColor"
//                 strokeWidth="2"
//               />
//               <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="2" />
//             </svg>
//             Open in Google Maps →
//           </a>
//         </div>

//         <div className="rounded-2xl bg-white p-6 shadow-2xl">
//           {sent ? (
//             <div className="text-center py-8">
//               <div className="h-12 w-12 rounded-full bg-green/15 text-green flex items-center justify-center mx-auto mb-3">
//                 <Check big />
//               </div>

//               <h3 className="font-display font-bold text-xl text-ink mb-1">
//                 Thanks, {form.name.split(' ')[0]}!
//               </h3>

//               <p className="text-ink/60 text-sm">
//                 Our team will call you on {form.phone} shortly. Meanwhile, explore the live layouts.
//               </p>

//               <button
//                 onClick={goLogin}
//                 className="mt-4 rounded-xl bg-navy text-white px-5 py-2.5 text-sm font-semibold hover:brightness-110 transition"
//               >
//                 Explore now
//               </button>
//             </div>
//           ) : (
//             <>
//               <h3 className="font-display font-bold text-xl text-ink mb-4">Request a callback</h3>

//               <Label>Name</Label>
//               <Input
//                 value={form.name}
//                 onChange={(e) => setForm({ ...form, name: e.target.value })}
//                 placeholder="Your name"
//               />

//               <Label>Phone</Label>
//               <Input
//                 value={form.phone}
//                 onChange={(e) => setForm({ ...form, phone: e.target.value })}
//                 placeholder="+91 …"
//               />

//               <Label>Interested in</Label>
//               <select
//                 value={form.interest}
//                 onChange={(e) => setForm({ ...form, interest: e.target.value })}
//                 className="w-full rounded-xl border border-ink/15 px-3.5 py-2.5 mb-4 outline-none focus:border-navy"
//               >
//                 <option>Open plots</option>
//                 <option>Flats</option>
//                 <option>Both</option>
//               </select>

//               <button
//                 onClick={submit}
//                 className="w-full rounded-xl bg-green text-white py-3 font-semibold hover:brightness-95 transition"
//               >
//                 Request callback
//               </button>

//               <p className="text-xs text-ink/40 mt-3 text-center">Enquiries are routed to our sales team.</p>
//             </>
//           )}
//         </div>
//       </div>
//     </section>
//   );
// }

// function Footer() {
//   return (
//     <footer className="bg-ink text-white/70">
//       <div className="max-w-7xl mx-auto px-6 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
//         <div>
//           <div className="bg-white/95 rounded-lg px-2 py-1 w-fit mb-3">
//             <Logo className="h-9" />
//           </div>

//           <p className="text-sm text-white/50 max-w-xs">
//             Open plots and flats across Hyderabad, sold with live layouts and clear paperwork.
//           </p>
//         </div>

//         <FooterCol title="Quick links" items={['About', 'Ventures', 'Masterplan', 'Amenities', 'Gallery', 'Contact']} />
//         <FooterCol title="Ventures" items={['Green Meadows', 'Ridgeview Plots', 'Skyline Residences', 'Parkside Towers']} />
//         <FooterCol title="Visit" items={['Banjara Hills office', '+91 90000 12345', 'sales@aurov.com', 'HMDA / RERA approved']} />
//       </div>

//       <div className="border-t border-white/10">
//         <div className="max-w-7xl mx-auto px-6 py-5 text-xs text-white/40 flex flex-wrap justify-between gap-2">
//           <span>© {new Date().getFullYear()} Aurov Reality. All rights reserved.</span>
//           <span>Photos via Unsplash · Used for presentation purposes</span>
//         </div>
//       </div>
//     </footer>
//   );
// }

// function FooterCol({ title, items }) {
//   return (
//     <div>
//       <h4 className="text-white font-medium text-sm mb-3">{title}</h4>

//       <ul className="space-y-2 text-sm">
//         {items.map((i) => (
//           <li key={i} className="hover:text-white transition cursor-default">
//             {i}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }

// function Eyebrow({ children, light }) {
//   return (
//     <span className={`text-xs font-semibold uppercase tracking-widest ${light ? 'text-green' : 'text-teal'}`}>
//       {children}
//     </span>
//   );
// }

// function Centered({ eyebrow, title, sub, light }) {
//   return (
//     <div className="text-center max-w-3xl mx-auto">
//       <Eyebrow light={light}>{eyebrow}</Eyebrow>

//       <h2
//         className={`font-display font-extrabold text-5xl sm:text-6xl leading-tight mt-3 mb-4 ${
//           light ? 'text-white' : 'text-ink'
//         }`}
//       >
//         {title}
//       </h2>

//       {sub && <p className={`text-lg ${light ? 'text-white/80' : 'text-ink/60'} leading-relaxed`}>{sub}</p>}
//     </div>
//   );
// }

// function Check({ big, light }) {
//   return (
//     <svg
//       width={big ? 24 : 16}
//       height={big ? 24 : 16}
//       viewBox="0 0 24 24"
//       fill="none"
//       className={light ? 'text-white' : 'text-green'}
//     >
//       <path
//         d="M20 6L9 17l-5-5"
//         stroke="currentColor"
//         strokeWidth="3"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//       />
//     </svg>
//   );
// }

// function Dot() {
//   return <span className="h-2 w-2 rounded-full bg-green shrink-0" />;
// }

// function Label({ children }) {
//   return <label className="block text-sm font-medium text-ink/70 mb-1">{children}</label>;
// }

// function Input(props) {
//   return <input {...props} className="w-full rounded-xl border border-ink/15 px-3.5 py-2.5 mb-3 outline-none focus:border-navy" />;
// }  






































// import React, { useState, useEffect, useMemo, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Logo, inrShort } from './Logo.js';
// import SmartImage from './SmartImage.js';
// import WatercolorWash from './WatercolorWash.js';
// import { Reveal, AnimatedNumber } from './anim.js';
// import { IMAGES, GRADIENTS } from './images.js';
// import { ventures } from './homeData.js';
// import './home.css';




// const HERO_VIDEO_SOURCES = [
//   '/videos/hero-background.mp4',
// ];

// const POSTER_VISIBLE_TIME = 5000;
// const IMAGE_VISIBLE_TIME = 3000;

// const HERO_REAL_ESTATE_IMAGES = [
//   {
//     image: '/images/image1.jpg',
//     gradient: GRADIENTS.navy,
//     alt: 'Premium glass tower skyline',
//   },
//   {
//     image: '/images/image2.jpg',
//     gradient: GRADIENTS.mix,
//     alt: 'Luxury villa community',
//   },
//   {
//     image: '/images/image3.jpg',
//     gradient: GRADIENTS.teal,
//     alt: 'Open plotting layout',
//   },
//   {
//     image: '/images/image4.jpg',
//     gradient: GRADIENTS.green,
//     alt: 'Modern apartment community',
//   },
// ];

// const ABOUT_WALKTHROUGH_VIDEO = '/videos/video2.mp4';
// const ABOUT_WALKTHROUGH_URL = 'https://www.aurovreality.com/walkthrough';




// function GlowingGlitterHero({ goLogin, ventures }) {
//   const available = ventures.reduce(
//     (a, v) => a + v.units.filter((u) => u.status === 'available').length,
//     0
//   );

//   const [heroMode, setHeroMode] = useState('poster');
//   const [videoSrcIndex, setVideoSrcIndex] = useState(0);
//   const [imageIndex, setImageIndex] = useState(0);

//   const videoRef = useRef(null);
//   const currentVideoSrc = HERO_VIDEO_SOURCES[videoSrcIndex];

//   // Balanced particles:
//   // - fewer particles
//   // - some small, some medium, some bigger
//   // - slightly faster movement
//   // - particles only on poster
//   const particles = useMemo(
//     () =>
//       Array.from({ length: 110 }, (_, i) => {
//         const isBig = i % 13 === 0;
//         const isMedium = i % 5 === 0;

//         return {
//           id: i,
//           left: Math.random() * 100,
//           top: Math.random() * 100,
//           size: isBig
//             ? Math.random() * 5 + 5
//             : isMedium
//               ? Math.random() * 3.8 + 3
//               : Math.random() * 2.3 + 1,
//           duration: Math.random() * 5 + 4,
//           delay: Math.random() * 3.5,
//           opacity: isBig
//             ? Math.random() * 0.34 + 0.2
//             : Math.random() * 0.42 + 0.14,
//           blurAmount: isBig ? Math.random() * 1.4 + 0.4 : Math.random() * 0.7,
//           tone: i % 5,
//         };
//       }),
//     []
//   );

//   const bokehParticles = useMemo(
//     () =>
//       Array.from({ length: 18 }, (_, i) => {
//         const isBig = i % 4 === 0;

//         return {
//           id: i,
//           left: Math.random() * 100,
//           top: Math.random() * 100,
//           size: isBig ? Math.random() * 24 + 18 : Math.random() * 13 + 7,
//           duration: Math.random() * 7 + 6,
//           delay: Math.random() * 4,
//           opacity: isBig ? Math.random() * 0.13 + 0.05 : Math.random() * 0.14 + 0.04,
//         };
//       }),
//     []
//   );

//   const lightStreaks = useMemo(
//     () =>
//       Array.from({ length: 5 }, (_, i) => ({
//         id: i,
//         left: Math.random() * 100,
//         top: Math.random() * 100,
//         width: Math.random() * 95 + 60,
//         rotation: Math.random() * 18 - 9,
//         duration: Math.random() * 4 + 4,
//         delay: Math.random() * 4,
//         opacity: Math.random() * 0.18 + 0.08,
//       })),
//     []
//   );

//   const starBursts = useMemo(
//     () =>
//       Array.from({ length: 10 }, (_, i) => ({
//         id: i,
//         left: Math.random() * 100,
//         top: Math.random() * 100,
//         size: Math.random() * 7 + 4,
//         duration: Math.random() * 2.2 + 1.8,
//         delay: Math.random() * 3.5,
//         opacity: Math.random() * 0.34 + 0.18,
//       })),
//     []
//   );

//   useEffect(() => {
//     if (heroMode !== 'poster') return undefined;

//     const timer = window.setTimeout(() => {
//       setHeroMode('video');
//     }, POSTER_VISIBLE_TIME);

//     return () => window.clearTimeout(timer);
//   }, [heroMode]);

//   useEffect(() => {
//     if (heroMode !== 'image') return undefined;

//     const timer = window.setTimeout(() => {
//       setImageIndex((currentIndex) => {
//         if (currentIndex >= HERO_REAL_ESTATE_IMAGES.length - 1) {
//           setHeroMode('poster');
//           return 0;
//         }

//         return currentIndex + 1;
//       });
//     }, IMAGE_VISIBLE_TIME);

//     return () => window.clearTimeout(timer);
//   }, [heroMode, imageIndex]);

//   useEffect(() => {
//     const video = videoRef.current;
//     if (!video || heroMode !== 'video') return undefined;

//     let cancelled = false;

//     video.load();

//     const startVideo = async () => {
//       try {
//         video.currentTime = 0;

//         const playPromise = video.play();

//         if (playPromise && typeof playPromise.then === 'function') {
//           await playPromise;
//         }
//       } catch (error) {
//         if (!cancelled) {
//           if (videoSrcIndex < HERO_VIDEO_SOURCES.length - 1) {
//             setVideoSrcIndex((index) => index + 1);
//           } else {
//             setImageIndex(0);
//             setHeroMode('image');
//           }
//         }
//       }
//     };

//     startVideo();

//     return () => {
//       cancelled = true;
//     };
//   }, [heroMode, videoSrcIndex]);

//   const showPoster = heroMode === 'poster';
//   const showImages = heroMode === 'image';

//   return (
//     <section className="aurov-hero relative w-full min-h-screen overflow-hidden flex items-center justify-center pt-24">
//       <div className="absolute inset-0 bg-gradient-to-br from-[#061944] via-[#08365d] to-[#07543d]" />

//       {/* VIDEO SCREEN - left/right padding only */}
//       <div
//         className={`hero-video-layer hero-media-frame ${
//           heroMode === 'video' ? 'opacity-100' : 'opacity-0 pointer-events-none'
//         }`}
//         aria-hidden={heroMode !== 'video'}
//       >
//         <div className="hero-media-shell">
//           <video
//             ref={videoRef}
//             key={currentVideoSrc}
//             src={currentVideoSrc}
//             className="hero-video"
//             muted
//             playsInline
//             preload="auto"
//             onEnded={() => {
//               setImageIndex(0);
//               setHeroMode('image');
//             }}
//             onError={() => {
//               if (videoSrcIndex < HERO_VIDEO_SOURCES.length - 1) {
//                 setVideoSrcIndex((index) => index + 1);
//               } else {
//                 setImageIndex(0);
//                 setHeroMode('image');
//               }
//             }}
//           />

//           <div className="hero-media-inner-glow" />
//         </div>

//         <div className="absolute inset-0 bg-gradient-to-b from-[#04132f]/30 via-transparent to-[#04132f]/35" />
//       </div>

//       {/* REAL ESTATE IMAGES SCREEN - left/right padding only */}
//       <div
//         className={`hero-image-layer hero-media-frame ${
//           showImages ? 'opacity-100' : 'opacity-0 pointer-events-none'
//         }`}
//         aria-hidden={!showImages}
//       >
//         <div className="hero-media-shell">
//           {HERO_REAL_ESTATE_IMAGES.map((slide, index) => (
//             <SmartImage
//               key={`hero-realestate-${index}`}
//               src={slide.image}
//               alt={slide.alt}
//               gradient={slide.gradient}
//               className={`hero-realestate-image ${
//                 index === imageIndex && showImages ? 'is-active' : ''
//               }`}
//             />
//           ))}

//           <div className="hero-media-inner-glow" />
//         </div>

//         <div className="hero-image-overlay" />
//         <div className="hero-image-shine" />
//       </div>

//       {/* PARTICLES ONLY WHEN POSTER COMES */}
//       {showPoster && (
//         <div className="hero-cinematic-particles" aria-hidden="true">
//           <div className="hero-star-noise" />

//           {bokehParticles.map((particle) => (
//             <span
//               key={`bokeh-${particle.id}`}
//               className="hero-bokeh-particle"
//               style={{
//                 left: `${particle.left}%`,
//                 top: `${particle.top}%`,
//                 width: `${particle.size}px`,
//                 height: `${particle.size}px`,
//                 opacity: particle.opacity,
//                 animationDuration: `${particle.duration}s`,
//                 animationDelay: `${particle.delay}s`,
//               }}
//             />
//           ))}

//           {particles.map((particle) => (
//             <span
//               key={`particle-${particle.id}`}
//               className={`hero-glow-particle particle-tone-${particle.tone}`}
//               style={{
//                 left: `${particle.left}%`,
//                 top: `${particle.top}%`,
//                 width: `${particle.size}px`,
//                 height: `${particle.size}px`,
//                 opacity: particle.opacity,
//                 filter: `blur(${particle.blurAmount}px)`,
//                 animationDuration: `${particle.duration}s`,
//                 animationDelay: `${particle.delay}s`,
//               }}
//             />
//           ))}

//           {lightStreaks.map((streak) => (
//             <span
//               key={`streak-${streak.id}`}
//               className="hero-light-streak"
//               style={{
//                 left: `${streak.left}%`,
//                 top: `${streak.top}%`,
//                 width: `${streak.width}px`,
//                 opacity: streak.opacity,
//                 '--streak-rotation': `${streak.rotation}deg`,
//                 animationDuration: `${streak.duration}s`,
//                 animationDelay: `${streak.delay}s`,
//               }}
//             />
//           ))}

//           {starBursts.map((star) => (
//             <span
//               key={`star-${star.id}`}
//               className="hero-star-burst"
//               style={{
//                 left: `${star.left}%`,
//                 top: `${star.top}%`,
//                 width: `${star.size}px`,
//                 height: `${star.size}px`,
//                 opacity: star.opacity,
//                 animationDuration: `${star.duration}s`,
//                 animationDelay: `${star.delay}s`,
//               }}
//             />
//           ))}
//         </div>
//       )}

//       {/* POSTER BACKGROUND - full screen, no padding */}
//       <div
//         className={`hero-poster-layer ${
//           showPoster ? 'opacity-100' : 'opacity-0 pointer-events-none'
//         }`}
//       >
//         <div className="absolute top-20 left-10 w-96 h-96 bg-[#00e5ff]/10 rounded-full blur-[110px] animate-float opacity-45" />
//         <div
//           className="absolute bottom-20 right-10 w-96 h-96 bg-[#2dd912]/10 rounded-full blur-[110px] animate-float opacity-35"
//           style={{ animationDelay: '2s' }}
//         />
//         <div
//           className="absolute top-1/2 left-1/3 w-80 h-80 bg-[#008B8B]/10 rounded-full blur-[90px] animate-float opacity-30"
//           style={{ animationDelay: '4s' }}
//         />
//         <div className="hero-lens-flare hero-lens-flare-one" />
//         <div className="hero-lens-flare hero-lens-flare-two" />
//         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#061944]/55" />
//       </div>

//       {/* POSTER CONTENT */}
//       <div
//         className={`hero-content relative z-10 text-center px-6 py-12 ${
//           showPoster ? 'opacity-100' : 'opacity-0 pointer-events-none'
//         }`}
//       >
//         <div className="mb-8 animate-scale-in">
//           <div className="inline-block relative">
//             <div className="absolute inset-0 bg-gradient-to-r from-[#00e5ff] to-[#2dd912] rounded-[32px] blur-2xl opacity-35 animate-pulse" />
//             <div className="hero-logo-card relative z-10">
//               <Logo className="hero-main-logo" />
//             </div>
//           </div>
//         </div>

//         <div className="mb-6 hero-title-wrap">
//           <h1 className="hero-title font-display font-extrabold text-white animate-slide-up leading-tight">
//             <span>AUROV</span>{' '}
//             <span className="hero-title-reality">REALITY</span>
//           </h1>
//         </div>

//         <div className="flex items-center justify-center gap-4 mb-8">
//           <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-[#2dd912]" />
//           <div className="w-2.5 h-2.5 rounded-full bg-[#2dd912] animate-pulse-glow" />
//           <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-[#2dd912]" />
//         </div>

//         <div className="overflow-hidden mb-10">
//           <p className="text-xl sm:text-2xl text-white/86 tracking-wide font-light animate-slide-up-delayed">
//             Thoughtfully Planned Communities Across Hyderabad
//           </p>
//         </div>

//         <div className="flex gap-8 sm:gap-16 justify-center mb-12 opacity-0 animate-fadeInDown [animation-delay:600ms] flex-wrap">
//           <StatCard value={ventures.length} label="Active ventures" />
//           <StatCard value={available} label="Units available" suffix="+" />
//           <StatCard value={4} label="Prime locations" />
//         </div>

//         <div className="flex flex-wrap gap-6 justify-center opacity-0 animate-fadeInDown [animation-delay:800ms]">
//           <button
//             onClick={goLogin}
//             className="relative px-8 py-4 bg-gradient-to-r from-[#00b67a] to-[#2dd912] text-white font-semibold rounded-xl overflow-hidden group hover:shadow-2xl hover:shadow-[#2dd912]/40 transition-all duration-300"
//           >
//             <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
//             <span className="relative flex items-center gap-2">
//               Explore Live Layouts <span>→</span>
//             </span>
//           </button>

//           <a
//             href="#contact"
//             className="relative px-8 py-4 border-2 border-[#2dd912] text-[#bfffb6] font-semibold rounded-xl overflow-hidden group hover:bg-[#2dd912]/10 transition-all duration-300"
//           >
//             <div className="absolute inset-0 bg-[#2dd912]/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
//             <span className="relative flex items-center gap-2">
//               Book Site Visit <span>→</span>
//             </span>
//           </a>
//         </div>
//       </div>

//       <div
//         className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce transition-opacity duration-500 ${
//           showPoster ? 'opacity-100' : 'opacity-0'
//         }`}
//       >
//         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#2dd912]">
//           <path
//             d="M12 5v14M5 12l7 7 7-7"
//             stroke="currentColor"
//             strokeWidth="2"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//           />
//         </svg>
//       </div>
//     </section>
//   );
// }

// function StatCard({ value, label, suffix = '' }) {
//   return (
//     <div className="text-center">
//       <div className="font-display font-extrabold text-4xl sm:text-5xl text-green mb-2">
//         {value}
//         {suffix}
//       </div>
//       <div className="text-white/70 text-sm uppercase tracking-widest">{label}</div>
//     </div>
//   );
// }

// export default function HomePage() {
//   const navigate = useNavigate();

//   const goLogin = () => navigate('/login');
//   const goRegister = () => navigate('/login');

//   return (
//     <div className="aurov-home font-sans text-ink bg-white">
//       <Nav goLogin={goLogin} goRegister={goRegister} />
//       <GlowingGlitterHero goLogin={goLogin} ventures={ventures} />
//       <TrustBar />
//       <About />
//       <Upcoming goLogin={goLogin} />
//       <Ventures ventures={ventures} goLogin={goLogin} />
//       <Masterplan />
//       <PhaseSpotlight />
//       <LocationAdvantages />
//       <SiteLocation />
//       <Amenities />
//       <Gallery />
//       <Testimonials />
//       <Faqs />
//       <Enquiry goLogin={goLogin} />
//       <Footer />
//     </div>
//   );
// }

// /* ---------------- NAV ---------------- */

// function Nav({ goLogin, goRegister }) {
//   const [scrolled, setScrolled] = useState(false);
//   const [open, setOpen] = useState(false);

//   useEffect(() => {
//     const onScroll = () => setScrolled(window.scrollY > 20);

//     window.addEventListener('scroll', onScroll);

//     return () => window.removeEventListener('scroll', onScroll);
//   }, []);

//   const links = [
//     ['#about', 'About'],
//     ['#ventures', 'Ventures'],
//     ['#masterplan', 'Masterplan'],
//     ['#spotlight', 'Phases'],
//     ['#amenities', 'Amenities'],
//     ['#location', 'Location'],
//     ['#gallery', 'Gallery'],
//     ['#contact', 'Contact'],
//   ];

//   return (
//     <header
//       className={`fixed top-0 inset-x-0 z-50 transition ${
//         scrolled
//           ? 'bg-white/95 backdrop-blur border-b border-ink/10 shadow-sm'
//           : 'bg-white/70 backdrop-blur-sm'
//       }`}
//     >
//       <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
//         <div className="rounded-lg transition">
//           <Logo className="h-9" />
//         </div>

//         <nav className="hidden lg:flex items-center gap-7">
//           {links.map(([h, l]) => (
//             <a key={h} href={h} className="text-sm font-medium transition text-ink/70 hover:text-navy">
//               {l}
//             </a>
//           ))}
//         </nav>

//         <div className="flex items-center gap-3">
//           <a href="tel:+919000012345" className="hidden sm:block text-sm font-semibold text-navy">
//             +91 90000 12345
//           </a>

//           <button
//             onClick={goRegister}
//             className="hidden sm:block rounded-xl border border-navy/15 bg-white text-navy px-4 py-2 text-sm font-semibold hover:border-navy/35 transition"
//           >
//             Register
//           </button>

//           <button
//             onClick={goLogin}
//             className="rounded-xl bg-green text-white px-4 py-2 text-sm font-semibold hover:brightness-95 transition"
//           >
//             Enquire / Sign in
//           </button>

//           <button onClick={() => setOpen(!open)} className="lg:hidden text-ink">
//             <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
//               <path
//                 d="M4 6h16M4 12h16M4 18h16"
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 strokeLinecap="round"
//               />
//             </svg>
//           </button>
//         </div>
//       </div>

//       {open && (
//         <div className="lg:hidden bg-white border-t border-ink/10 px-6 py-4 flex flex-col gap-3">
//           {links.map(([h, l]) => (
//             <a key={h} href={h} onClick={() => setOpen(false)} className="text-sm font-medium text-ink/70">
//               {l}
//             </a>
//           ))}

//           <button
//             onClick={() => {
//               setOpen(false);
//               goRegister();
//             }}
//             className="rounded-xl border border-navy/15 bg-white text-navy px-4 py-2 text-sm font-semibold text-left"
//           >
//             Register
//           </button>
//         </div>
//       )}
//     </header>
//   );
// }

// /* ---------------- OLD HERO KEPT BUT NOT USED ---------------- */

// function Hero({ goLogin, ventures }) {
//   const available = ventures.reduce(
//     (a, v) => a + v.units.filter((u) => u.status === 'available').length,
//     0
//   );

//   const [currentSlide, setCurrentSlide] = useState(0);

//   const heroSlides = [
//     { image: IMAGES.heroAerial, gradient: GRADIENTS.mix, overlay: 'rgba(1,48,138,0.4)' },
//     { image: IMAGES.plotsAerial, gradient: GRADIENTS.green, overlay: 'rgba(14,109,130,0.4)' },
//     { image: IMAGES.aboutSite, gradient: GRADIENTS.teal, overlay: 'rgba(52,195,27,0.3)' },
//   ];

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
//     }, 5000);

//     return () => clearInterval(timer);
//   }, [heroSlides.length]);

//   return (
//     <section className="relative bg-gradient-to-b from-navy via-ink to-navy overflow-hidden pt-24 pb-0 min-h-screen flex items-center justify-center">
//       <div className="absolute inset-0 overflow-hidden">
//         <ParticleBackground />
//       </div>

//       <div className="absolute inset-0">
//         {heroSlides.map((slide, idx) => (
//           <div
//             key={idx}
//             className={`absolute inset-0 transition-opacity duration-1000 ${
//               idx === currentSlide ? 'opacity-100' : 'opacity-0'
//             }`}
//           >
//             <SmartImage
//               src={slide.image}
//               alt="Aurov township"
//               className="absolute inset-0 w-full h-full object-cover"
//               gradient={slide.gradient}
//             />
//           </div>
//         ))}
//       </div>

//       <div className="absolute inset-0 bg-gradient-to-b from-navy/60 via-navy/70 to-navy/80" />

//       <div className="relative z-10 max-w-6xl mx-auto px-6 text-center py-20">
//         <div className="space-y-6 mb-12">
//           <div className="inline-block">
//             <span className="text-green text-sm font-semibold uppercase tracking-[0.3em] opacity-0 animate-fadeInDown">
//               Premium Communities
//             </span>
//           </div>

//           <h1 className="font-display font-extrabold tracking-tight text-white">
//             <span className="block text-5xl sm:text-6xl lg:text-7xl opacity-0 animate-fadeInDown [animation-delay:100ms]">
//               Thoughtfully
//             </span>
//             <span className="block text-5xl sm:text-6xl lg:text-7xl mt-2 opacity-0 animate-fadeInDown [animation-delay:200ms]">
//               Planned <span className="text-green">Communities</span>
//             </span>
//             <span className="block text-3xl sm:text-4xl lg:text-5xl mt-4 text-white/80 font-light opacity-0 animate-fadeInDown [animation-delay:300ms]">
//               where you live &amp; grow
//             </span>
//           </h1>
//         </div>

//         <div className="opacity-0 animate-fadeInDown [animation-delay:400ms] mb-10">
//           <span className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur border border-white/20 px-4 py-2 text-sm font-semibold text-white">
//             <span className="h-2 w-2 rounded-full bg-green animate-pulse" />
//             HMDA &amp; RERA approved · Now selling
//           </span>
//         </div>

//         <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-12 opacity-0 animate-fadeInDown [animation-delay:500ms] leading-relaxed">
//           Live, interactive layouts — see exactly what's available, held, or sold. Reserve your space in minutes.
//         </p>

//         <div className="flex flex-wrap gap-4 justify-center mb-12 opacity-0 animate-fadeInDown [animation-delay:600ms]">
//           <button
//             onClick={goLogin}
//             className="pulse-cta shine rounded-xl bg-green text-white px-8 py-4 font-semibold hover:brightness-110 transition shadow-lg shadow-green/50 text-base"
//           >
//             Explore live layouts
//           </button>

//           <a
//             href="#contact"
//             className="shine rounded-xl bg-white/20 backdrop-blur text-white px-8 py-4 font-semibold hover:bg-white/30 transition border border-white/30 text-base"
//           >
//             Book a site visit
//           </a>
//         </div>

//         <div className="flex gap-8 sm:gap-16 justify-center opacity-0 animate-fadeInDown [animation-delay:700ms] flex-wrap">
//           <HeroStat value={ventures.length} l="Active ventures" />
//           <HeroStat value={available} suffix="+" l="Units available" />
//           <HeroStat value={4} l="Prime locations" />
//         </div>

//         <div className="flex gap-2 justify-center mt-16 opacity-0 animate-fadeInDown [animation-delay:800ms]">
//           {heroSlides.map((_, idx) => (
//             <button
//               key={idx}
//               onClick={() => setCurrentSlide(idx)}
//               className={`h-2 rounded-full transition-all duration-300 ${
//                 idx === currentSlide ? 'bg-green w-8' : 'bg-white/40 w-2 hover:bg-white/60'
//               }`}
//               aria-label={`Go to slide ${idx + 1}`}
//             />
//           ))}
//         </div>
//       </div>

//       <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
//         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white/60">
//           <path
//             d="M12 5v14M5 12l7 7 7-7"
//             stroke="currentColor"
//             strokeWidth="2"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//           />
//         </svg>
//       </div>
//     </section>
//   );
// }

// function ParticleBackground() {
//   const particles = Array.from({ length: 50 }, (_, i) => ({
//     id: i,
//     left: Math.random() * 100,
//     top: Math.random() * 100,
//     size: Math.random() * 3 + 1,
//     duration: Math.random() * 10 + 5,
//     delay: Math.random() * 2,
//   }));

//   return (
//     <div className="absolute inset-0">
//       {particles.map((particle) => (
//         <div
//           key={particle.id}
//           className="absolute rounded-full bg-white/30 animate-float"
//           style={{
//             left: `${particle.left}%`,
//             top: `${particle.top}%`,
//             width: `${particle.size}px`,
//             height: `${particle.size}px`,
//             animation: `float ${particle.duration}s ease-in-out infinite`,
//             animationDelay: `${particle.delay}s`,
//             filter: 'blur(0.5px)',
//           }}
//         />
//       ))}
//     </div>
//   );
// }

// function HeroStat({ value, suffix = '', l }) {
//   return (
//     <div>
//       <AnimatedNumber
//         value={value}
//         suffix={suffix}
//         className="font-display font-extrabold text-3xl sm:text-4xl text-white"
//       />
//       <div className="text-white/70 text-sm mt-1">{l}</div>
//     </div>
//   );
// }

// /* ---------------- REST COMPONENTS ---------------- */

// function TrustBar() {
//   const items = ['HMDA & RERA approved', 'Clear marketable titles', 'Bank-loan ready', '15+ years building Hyderabad'];

//   return (
//     <div className="bg-green text-white">
//       <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-center gap-x-10 gap-y-2 text-sm font-medium">
//         {items.map((t, i) => (
//           <span key={i} className="flex items-center gap-2">
//             <Check light /> {t}
//           </span>
//         ))}
//       </div>
//     </div>
//   );
// }

// function About() {
//   const aboutVideoRef = useRef(null);
//   const [isAboutVideoPlaying, setIsAboutVideoPlaying] = useState(false);

//   const toggleAboutVideo = async () => {
//     const video = aboutVideoRef.current;
//     if (!video) return;

//     try {
//       if (video.paused) {
//         video.muted = false;
//         video.volume = 1;
//         await video.play();
//         setIsAboutVideoPlaying(true);
//       } else {
//         video.pause();
//         setIsAboutVideoPlaying(false);
//       }
//     } catch (error) {
//       console.log('Video play error:', error);
//     }
//   };

//   return (
//     <section id="about" className="relative overflow-hidden py-24">
//       <WatercolorWash variant="soft" opacity={0.5} />

//       <div className="relative max-w-7xl mx-auto px-6">
//         <div className="grid lg:grid-cols-2 gap-12 items-center">
//           <div className="relative">
//             <div className="about-video-card rounded-3xl overflow-hidden h-[420px] shadow-xl relative">
//               <video
//                 ref={aboutVideoRef}
//                 className="about-video-bg"
//                 src={ABOUT_WALKTHROUGH_VIDEO}
//                 playsInline
//                 preload="metadata"
//                 onPlay={() => setIsAboutVideoPlaying(true)}
//                 onPause={() => setIsAboutVideoPlaying(false)}
//                 onEnded={() => setIsAboutVideoPlaying(false)}
//               />

//               <button
//                 type="button"
//                 onClick={toggleAboutVideo}
//                 className="about-video-center-btn"
//                 aria-label={isAboutVideoPlaying ? 'Pause video' : 'Start video'}
//               >
//                 {!isAboutVideoPlaying ? (
//                   <svg width="28" height="28" viewBox="0 0 24 24" fill="#01308A">
//                     <path d="M8 5v14l11-7z" />
//                   </svg>
//                 ) : (
//                   <svg width="26" height="26" viewBox="0 0 24 24" fill="#01308A">
//                     <path d="M7 5h4v14H7V5zm6 0h4v14h-4V5z" />
//                   </svg>
//                 )}
//               </button>
//             </div>

//             <div className="absolute -bottom-6 -right-2 sm:right-6 bg-white rounded-2xl shadow-lg border border-ink/10 px-6 py-4">
//               <div className="font-display font-extrabold text-3xl text-navy">
//                 460<span className="text-green">+</span>
//               </div>
//               <div className="text-xs text-ink/50">
//                 acres planned across ventures
//               </div>
//             </div>
//           </div>

//           <div>
//             <Eyebrow>About Aurov Reality</Eyebrow>

//             <h2 className="font-display font-extrabold text-5xl sm:text-6xl leading-tight text-ink mt-2 mb-5">
//               Thoughtfully designed places to live and grow
//             </h2>

//             <p className="text-ink/70 leading-relaxed mb-4">
//               Aurov Reality develops gated plot layouts and modern apartments across Hyderabad's
//               fastest-growing corridors. Every venture is planned around clear roads, generous
//               open space, and amenities that communities actually use.
//             </p>

//             <p className="text-ink/70 leading-relaxed mb-6">
//               What sets us apart is transparency: each venture has a live, interactive layout where
//               you can inspect any plot or flat — its size, facing, boundaries and price — and see in
//               real time whether it's available, held, or sold.
//             </p>

//             <div className="grid sm:grid-cols-3 gap-4">
//               <Mini n="4" l="Active ventures" />
//               <Mini n="HMDA" l="Approved layouts" />
//               <Mini n="10 min" l="From the ORR" />
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }
// function Mini({ n, l }) {
//   return (
//     <div className="rounded-2xl border border-ink/10 bg-mist p-4">
//       <div className="font-display font-bold text-xl text-navy">{n}</div>
//       <div className="text-xs text-ink/50 mt-0.5">{l}</div>
//     </div>
//   );
// }

// function Ventures({ ventures, goLogin }) {
//   return (
//     <section id="ventures" className="bg-white py-24">
//       <div className="max-w-7xl mx-auto px-6">
//         <Reveal>
//           <Centered
//             eyebrow="Our ventures"
//             title="Project spotlight"
//             sub="Each venture comes with a live, interactive layout. Sign in to open the site map, inspect any plot or flat, and reserve in minutes."
//           />
//         </Reveal>

//         <div className="grid md:grid-cols-2 gap-8 mt-12">
//           {ventures.map((v, idx) => {
//             const avail = v.units.filter((u) => u.status === 'available').length;

//             return (
//               <Reveal key={v.id} delay={idx * 110} className="h-full">
//                 <article className="lift group rounded-3xl overflow-hidden bg-white border border-ink/10 h-full">
//                   <div className="relative h-60">
//                     <SmartImage
//                       src={v.image}
//                       alt={v.name}
//                       className="absolute inset-0 w-full h-full group-hover:scale-105 transition duration-500"
//                       gradient={v.type === 'flat' ? GRADIENTS.teal : GRADIENTS.green}
//                     />

//                     <div
//                       className="absolute inset-0"
//                       style={{ background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.6) 100%)' }}
//                     />

//                     <span
//                       className={`absolute top-4 left-4 text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full text-white ${
//                         v.type === 'flat' ? 'bg-teal' : 'bg-green'
//                       }`}
//                     >
//                       {v.type === 'flat' ? 'Flats' : 'Open Plots'}
//                     </span>

//                     <span className="absolute top-4 right-4 text-xs text-white/90 bg-black/30 rounded-full px-2.5 py-1">
//                       {v.possession}
//                     </span>

//                     <div className="absolute bottom-4 left-4 right-4 text-white">
//                       <h3 className="font-display font-bold text-2xl">{v.name}</h3>
//                       <p className="text-white/80 text-sm">{v.location}</p>
//                     </div>
//                   </div>

//                   <div className="p-6">
//                     <p className="text-ink/70 mb-4">{v.tagline}</p>

//                     <div className="flex flex-wrap gap-1.5 mb-5">
//                       {v.amenities.slice(0, 4).map((a) => (
//                         <span key={a} className="text-xs bg-mist text-ink/60 px-2.5 py-1 rounded-full">
//                           {a}
//                         </span>
//                       ))}
//                     </div>

//                     <div className="flex items-center justify-between border-t border-ink/10 pt-4">
//                       <div>
//                         <div className="text-xs text-ink/40">Starting from</div>
//                         <div className="font-display font-bold text-xl text-navy">{inrShort(v.priceFrom)}</div>
//                       </div>

//                       <div className="text-right">
//                         <div className="text-xs text-ink/40">Available</div>
//                         <div className="font-display font-bold text-green">
//                           {avail} / {v.units.length}
//                         </div>
//                       </div>
//                     </div>

//                     <button
//                       onClick={goLogin}
//                       className="shine w-full mt-5 rounded-xl bg-navy text-white py-2.5 text-sm font-semibold hover:brightness-110 transition"
//                     >
//                       View live layout →
//                     </button>
//                   </div>
//                 </article>
//               </Reveal>
//             );
//           })}
//         </div>
//       </div>
//     </section>
//   );
// }

// function Masterplan() {
//   const plans = [
//     { src: IMAGES.masterplan, label: 'Township masterplan', grad: GRADIENTS.navy },
//     { src: IMAGES.plotsAerial, label: 'Plot layout plan', grad: GRADIENTS.green },
//     { src: IMAGES.aboutSite, label: 'Amenity zones', grad: GRADIENTS.teal },
//   ];

//   return (
//     <section id="masterplan" className="brand-section relative overflow-hidden py-24 text-white">
//       <WatercolorWash variant="cta" opacity={0.3} />

//       <div className="relative max-w-7xl mx-auto px-6">
//         <Reveal>
//           <Centered
//             light
//             eyebrow="Site plan"
//             title="Masterplans — Aurov ventures"
//             sub="Wide internal roads, avenue plantation, and amenity zones — planned before a single plot is sold."
//           />
//         </Reveal>

//         <div className="grid md:grid-cols-3 gap-6 mt-12">
//           {plans.map((p, i) => (
//             <Reveal key={i} delay={i * 110}>
//               <figure className="lift rounded-3xl overflow-hidden border border-white/15 shadow-lg bg-white">
//                 <div className="h-56">
//                   <SmartImage src={p.src} alt={p.label} className="w-full h-full" gradient={p.grad} />
//                 </div>
//                 <figcaption className="px-5 py-3 text-sm font-medium text-ink/70">{p.label}</figcaption>
//               </figure>
//             </Reveal>
//           ))}
//         </div>

//         <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
//           {[
//             ['40–60 ft', 'internal roads'],
//             ['8+ acres', 'landscaped greenery'],
//             ['100%', 'gated & secured'],
//             ['Avenue', 'tree plantation'],
//           ].map(([n, l]) => (
//             <div key={l} className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur p-5 text-center">
//               <div className="font-display font-extrabold text-2xl text-white">{n}</div>
//               <div className="text-xs text-white/70 mt-1">{l}</div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }


// function Upcoming({ goLogin }) {
//   const features = [
//     'Net-zero design',
//     'Clubhouse & pool',
//     'EV charging',
//     'Organic gardens',
//     '100ft approach road',
//     'Near upcoming metro',
//   ];

//   return (
//     <section className="brand-section relative overflow-hidden py-24 text-white">
//       <WatercolorWash variant="cta" opacity={0.35} />

//       <div className="relative max-w-7xl mx-auto px-6">
//         <Reveal>
//           <Centered
//             light
//             eyebrow="Coming soon"
//             title="Upcoming from Aurov"
//             sub="A preview of the next Aurov community taking shape."
//           />
//         </Reveal>

//         <Reveal>
//           <div className="grid lg:grid-cols-2 gap-0 mt-12 rounded-3xl overflow-hidden border border-ink/10 bg-white shadow-sm lift">
//             <div className="relative min-h-[300px]">
//               <SmartImage
//                 src={IMAGES.upcoming}
//                 alt="Aurov Windgrove"
//                 className="absolute inset-0 w-full h-full"
//                 gradient={GRADIENTS.mix}
//               />

//               <span className="absolute top-4 left-4 text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full text-white bg-green">
//                 Pre-launch
//               </span>
//             </div>

//             <div className="p-8 lg:p-10 bg-white text-[#1B1B1B]">
//               <h3 className="font-display font-extrabold text-3xl text-[#1B1B1B] mb-2">
//                 Aurov Windgrove
//               </h3>

//               <p className="text-[#667085] text-sm mb-4">
//                 Inole, Hyderabad · 70+ acres
//               </p>

//               <p className="text-[#344054] leading-relaxed mb-4">
//                 A sustainable, low-density community of premium plots and garden villas wrapped in
//                 native landscaping. Designed around solar power, EV charging, rainwater harvesting,
//                 and a central green spine — an eco-conscious address in the next growth corridor.
//               </p>

//               <ul className="grid grid-cols-2 gap-2 mb-6 text-sm text-[#344054]">
//                 {features.map((feature) => (
//                   <li key={feature} className="flex items-center gap-2 text-[#344054]">
//                     <span className="h-1.5 w-1.5 rounded-full bg-green shrink-0" />
//                     <span>{feature}</span>
//                   </li>
//                 ))}
//               </ul>

//               <button
//                 onClick={goLogin}
//                 className="shine rounded-xl bg-navy text-white px-6 py-3 font-semibold hover:brightness-110 transition"
//               >
//                 Register your interest
//               </button>
//             </div>
//           </div>
//         </Reveal>
//       </div>
//     </section>
//   );
// }

// function PhaseSpotlight() {
//   const phases = [
//     {
//       tag: 'Phase 1',
//       title: 'Green Meadows — ready plots',
//       img: IMAGES.phase1,
//       side: 'left',
//       body:
//         'HMDA-approved open plots on 8 acres of landscaped greenery, with 40–60 ft roads, avenue plantation, a clubhouse and overhead tank. Infrastructure complete and ready for registration.',
//     },
//     {
//       tag: 'Phase 2',
//       title: 'Ridgeview — premium plots',
//       img: IMAGES.phase2,
//       side: 'right',
//       body:
//         'East-facing premium plots minutes from the ORR, with underground drainage, solar street lights and a jogging track. Gated entry and a planned amenity core.',
//     },
//     {
//       tag: 'Phase 3',
//       title: 'Skyline & Parkside — flats',
//       img: IMAGES.phase3,
//       side: 'left',
//       body:
//         '2 & 3 BHK apartments with infinity pool, gym, covered parking and 24×7 security — lake- and park-facing towers in Kokapet and Tellapur.',
//     },
//   ];

//   return (
//     <section id="spotlight" className="max-w-7xl mx-auto px-6 py-24">
//       <Reveal>
//         <Centered
//           eyebrow="Project spotlight"
//           title="Our phases at a glance"
//           sub="From ready-to-register plots to flats nearing possession — explore each phase."
//         />
//       </Reveal>

//       <div className="space-y-16 mt-14">
//         {phases.map((p, i) => (
//           <Reveal key={i}>
//             <div
//               className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-center ${
//                 p.side === 'right' ? 'lg:[&>*:first-child]:order-2' : ''
//               }`}
//             >
//               <div className="grid grid-cols-2 gap-3">
//                 <div className="rounded-2xl overflow-hidden h-44 col-span-2">
//                   <SmartImage src={p.img} alt={p.title} className="w-full h-full lift" gradient={GRADIENTS.teal} />
//                 </div>

//                 <div className="rounded-2xl overflow-hidden h-28">
//                   <SmartImage src={IMAGES.interior} alt="" className="w-full h-full" gradient={GRADIENTS.navy} />
//                 </div>

//                 <div className="rounded-2xl overflow-hidden h-28">
//                   <SmartImage src={IMAGES.clubhouse} alt="" className="w-full h-full" gradient={GRADIENTS.green} />
//                 </div>
//               </div>

//               <div>
//                 <span className="text-xs font-semibold uppercase tracking-widest text-teal">{p.tag}</span>
//                 <h3 className="font-display font-extrabold text-3xl text-ink mt-2 mb-3">{p.title}</h3>
//                 <p className="text-ink/70 leading-relaxed">{p.body}</p>
//               </div>
//             </div>
//           </Reveal>
//         ))}
//       </div>
//     </section>
//   );
// }

// function SiteLocation() {
//   return (
//     <section id="location" className="max-w-7xl mx-auto px-6 py-24">
//       <Reveal>
//         <Centered
//           eyebrow="Site location"
//           title="Find us on the map"
//           sub="Our ventures sit along Hyderabad's western and southern growth corridors."
//         />
//       </Reveal>

//       <Reveal>
//         <div className="mt-12 rounded-3xl overflow-hidden border border-ink/10 shadow-sm h-[420px]">
//           <iframe
//             title="Aurov ventures — Hyderabad"
//             src="https://www.google.com/maps?q=Hyderabad,+Telangana&z=11&output=embed"
//             width="100%"
//             height="100%"
//             style={{ border: 0 }}
//             loading="lazy"
//             referrerPolicy="no-referrer-when-downgrade"
//             allowFullScreen
//           />
//         </div>
//       </Reveal>
//     </section>
//   );
// }

// function LocationAdvantages() {
//   const groups = [
//     { t: '10 mins', items: ['ORR', 'Upcoming Metro', 'IT Park', 'Medical College'] },
//     { t: '30 mins', items: ['Financial District', 'Kokapet / Neopolis', 'Top schools', 'Universities'] },
//     { t: '45 mins', items: ['Hi-Tech City', 'Airport', 'IIT Hyderabad'] },
//   ];

//   return (
//     <section className="brand-section relative overflow-hidden py-24 text-white">
//       <WatercolorWash variant="cta" opacity={0.3} />

//       <div className="relative max-w-7xl mx-auto px-6">
//         <Reveal>
//           <Centered
//             light
//             eyebrow="Connectivity"
//             title="Location advantages"
//             sub="Seamless access to Hyderabad's growth corridors via the ORR and upcoming metro."
//           />
//         </Reveal>

//         <div className="grid md:grid-cols-3 gap-6 mt-12">
//           {groups.map((g, idx) => (
//             <Reveal key={g.t} delay={idx * 110}>
//               <div className="lift rounded-3xl bg-white/10 backdrop-blur border border-white/20 p-6 h-full">
//                 <div className="flex items-center gap-3 mb-4">
//                   <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
//                     <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-white">
//                       <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
//                       <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
//                     </svg>
//                   </div>

//                   <div className="font-display font-extrabold text-2xl text-white">Within {g.t}</div>
//                 </div>

//                 <ul className="space-y-2">
//                   {g.items.map((i) => (
//                     <li key={i} className="flex items-center gap-2 text-white/85 text-sm">
//                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-white shrink-0">
//                         <path
//                           d="M12 21s-7-5.5-7-11a7 7 0 1114 0c0 5.5-7 11-7 11z"
//                           stroke="currentColor"
//                           strokeWidth="2"
//                         />
//                         <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="2" />
//                       </svg>
//                       {i}
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             </Reveal>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

// function Amenities() {
//   const indoor = [
//     ['Clubhouse', 'M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6'],
//     ['A/C gym', 'M6 7v10M18 7v10M4 9h2M18 9h2M4 15h2M18 15h2M6 12h12'],
//     ['Yoga / aerobics', 'M12 4a2 2 0 100 4 2 2 0 000-4zM6 21l3-7 3 2 3-2 3 7M9 14l-2-4h10l-2 4'],
//     ['Multipurpose hall', 'M3 9l9-6 9 6M5 9v11h14V9M9 20v-6h6v6'],
//     ['Indoor games', 'M4 6h16v12H4zM8 6v12M16 6v12'],
//     ['Library', 'M5 4h4v16H5zM10 4h4v16h-4zM16 5l3 1-3 14-3-1'],
//     ['Convenience store', 'M4 9h16l-1 11H5L4 9zM4 9l2-5h12l2 5M9 13h6'],
//     ['Society office', 'M6 21V7l6-4 6 4v14M10 12h4M10 16h4'],
//   ];

//   const outdoor = [
//     ['Swimming pool', 'M2 17c2 0 2 1 4 1s2-1 4-1 2 1 4 1 2-1 4-1 2 1 4 1M5 14V6a2 2 0 014 0M15 14V6a2 2 0 014 0'],
//     ["Kids' pool", 'M2 18c2 0 2 1 4 1s2-1 4-1 2 1 4 1 2-1 4-1M7 14a3 3 0 016 0'],
//     ['Play area', 'M12 3v6M8 9h8l-2 6H10L8 9zM9 21l1-6M15 21l-1-6'],
//     ['Jogging track', 'M13 4a2 2 0 100 4 2 2 0 000-4zM5 21l4-8 3 2v6M9 13l-2-4 5-1 3 3 3 1'],
//     ['Open lawn', 'M3 20h18M5 20c0-5 2-9 7-9s7 4 7 9M9 11V5M9 5l3-2'],
//     ['Landscaped parks', 'M12 3a5 5 0 015 5c0 3-5 8-5 8s-5-5-5-8a5 5 0 015-5zM12 16v5'],
//     ['Box cricket', 'M4 20l9-9M14 5l5 5M13 6l5 5-2 2-5-5z'],
//     ['Pet park', 'M5 11a2 2 0 100-4 2 2 0 000 4zM19 11a2 2 0 100-4 2 2 0 000 4zM9 8a2 2 0 100-4 2 2 0 000 4zM15 8a2 2 0 100-4 2 2 0 000 4zM12 12c-3 0-5 2-5 5h10c0-3-2-5-5-5z'],
//   ];

//   return (
//     <section id="amenities" className="brand-section relative overflow-hidden py-24 text-white">
//       <WatercolorWash variant="cta" opacity={0.3} />

//       <div className="relative max-w-7xl mx-auto px-6">
//         <Reveal>
//           <Centered
//             light
//             eyebrow="Lifestyle"
//             title="Amenities & facilities"
//             sub="A diverse array of amenities for a well-rounded living experience — indoors and out."
//           />
//         </Reveal>

//         <Reveal>
//           <h3 className="font-display font-bold text-xl text-white mt-12 mb-5">Indoor amenities</h3>
//         </Reveal>

//         <IconGrid items={indoor} />

//         <Reveal>
//           <h3 className="font-display font-bold text-xl text-white mt-12 mb-5">Outdoor amenities</h3>
//         </Reveal>

//         <IconGrid items={outdoor} />
//       </div>
//     </section>
//   );
// }

// function IconGrid({ items }) {
//   return (
//     <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//       {items.map(([label, d], i) => (
//         <Reveal key={label} delay={i * 50}>
//           <div className="lift rounded-2xl border border-white/20 bg-white/10 backdrop-blur p-5 text-center h-full">
//             <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-3">
//               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
//                 <path d={d} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
//               </svg>
//             </div>

//             <div className="text-sm text-white/85">{label}</div>
//           </div>
//         </Reveal>
//       ))}
//     </div>
//   );
// }

// function Gallery() {
//   const shots = [
//     { src: IMAGES.clubhouse, label: 'Clubhouse', grad: GRADIENTS.navy, span: 'sm:col-span-2 sm:row-span-2' },
//     { src: IMAGES.pool, label: 'Swimming pool', grad: GRADIENTS.teal, span: '' },
//     { src: IMAGES.park, label: 'Landscaped parks', grad: GRADIENTS.green, span: '' },
//     { src: IMAGES.road, label: 'Tree-lined avenues', grad: GRADIENTS.teal, span: '' },
//     { src: IMAGES.interior, label: 'Sample interiors', grad: GRADIENTS.navy, span: '' },
//   ];

//   return (
//     <section id="gallery" className="bg-white py-24">
//       <div className="max-w-7xl mx-auto px-6">
//         <Reveal>
//           <Centered
//             eyebrow="Gallery"
//             title="Life at Aurov"
//             sub="Amenities and surroundings designed for how communities actually live."
//           />
//         </Reveal>

//         <div className="grid sm:grid-cols-3 lg:grid-cols-4 auto-rows-[180px] gap-4 mt-12">
//           {shots.map((s, i) => (
//             <Reveal key={i} delay={i * 80} className={s.span}>
//               <div className="lift relative rounded-2xl overflow-hidden group h-full w-full">
//                 <SmartImage
//                   src={s.src}
//                   alt={s.label}
//                   className="absolute inset-0 w-full h-full group-hover:scale-105 transition duration-500"
//                   gradient={s.grad}
//                 />

//                 <div
//                   className="absolute inset-0"
//                   style={{ background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.6) 100%)' }}
//                 />

//                 <span className="absolute bottom-3 left-4 text-white font-medium text-sm">{s.label}</span>
//               </div>
//             </Reveal>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

// function Testimonials() {
//   const items = [
//     {
//       q: 'The live layout made all the difference — I could see the exact plot, its boundaries and price before visiting. Booked in a week.',
//       n: 'Sandeep Reddy',
//       r: 'Green Meadows',
//       img: IMAGES.person1,
//     },
//     {
//       q: 'No back-and-forth on what was available. The colour map was honest, and the EMI calculator helped me plan the 3 BHK confidently.',
//       n: 'Lakshmi Menon',
//       r: 'Skyline Residences',
//       img: IMAGES.person2,
//     },
//     {
//       q: 'Site visit was a two-tap booking and the paperwork was genuinely clear. Easiest land purchase I have made.',
//       n: 'Imran Khan',
//       r: 'Ridgeview Plots',
//       img: IMAGES.person3,
//     },
//   ];

//   return (
//     <section className="brand-section relative overflow-hidden py-24 text-white">
//       <WatercolorWash variant="cta" opacity={0.3} />

//       <div className="relative max-w-7xl mx-auto px-6">
//         <Reveal>
//           <Centered light eyebrow="Owners" title="What our buyers say" sub="A few words from owners across our ventures." />
//         </Reveal>

//         <div className="grid md:grid-cols-3 gap-6 mt-12">
//           {items.map((t, i) => (
//             <figure key={i} className="lift rounded-2xl bg-white/10 backdrop-blur border border-white/20 p-6">
//               <div className="text-white text-sm mb-3">★★★★★</div>

//               <blockquote className="text-white/90 text-sm leading-relaxed mb-5">{t.q}</blockquote>

//               <figcaption className="flex items-center gap-3">
//                 <SmartImage
//                   src={t.img}
//                   alt={t.n}
//                   className="h-10 w-10 rounded-full overflow-hidden shrink-0"
//                   gradient={GRADIENTS.green}
//                 />

//                 <div>
//                   <div className="text-white font-medium text-sm">{t.n}</div>
//                   <div className="text-white/60 text-xs">{t.r}</div>
//                 </div>
//               </figcaption>
//             </figure>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

// function Faqs() {
//   const faqs = [
//     [
//       'What do Aurov ventures cost?',
//       'Open plots start around ₹12 lakh and flats from about ₹68 lakh, depending on venture, size and facing. Exact prices are shown live on each unit in the layout.',
//     ],
//     [
//       'Are the layouts approved?',
//       'Yes — our plot ventures are HMDA-approved with clear, marketable titles, and our flat projects are RERA-registered.',
//     ],
//     [
//       'Can I get a home loan?',
//       'All ventures are bank-loan ready. The built-in EMI calculator lets you estimate instalments on any unit before you commit.',
//     ],
//     [
//       'How do I book a site visit?',
//       'Sign in, open a venture, and use "Book site visit" to pick a date and slot. Our team confirms it from the admin side.',
//     ],
//     [
//       'How does reservation work?',
//       'Select an available (green) unit, reserve it (turns yellow), complete the payment, and on admin approval it is confirmed as booked (red).',
//     ],
//   ];

//   const [open, setOpen] = useState(0);

//   return (
//     <section className="bg-white py-24">
//       <div className="max-w-3xl mx-auto px-6">
//         <Reveal>
//           <Centered eyebrow="FAQs" title="Frequently asked questions" />
//         </Reveal>

//         <div className="mt-10 space-y-3">
//           {faqs.map(([q, a], i) => (
//             <div key={i} className="rounded-2xl bg-white border border-ink/10 overflow-hidden">
//               <button
//                 onClick={() => setOpen(open === i ? -1 : i)}
//                 className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
//               >
//                 <span className="font-medium text-ink">{q}</span>
//                 <span className={`text-green text-xl transition ${open === i ? 'rotate-45' : ''}`}>+</span>
//               </button>

//               {open === i && <div className="px-5 pb-4 text-sm text-ink/65 leading-relaxed">{a}</div>}
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

// function Enquiry({ goLogin }) {
//   const [sent, setSent] = useState(false);
//   const [form, setForm] = useState({ name: '', phone: '', interest: 'Open plots' });

//   const submit = () => {
//     if (form.name && form.phone) setSent(true);
//   };

//   return (
//     <section id="contact" className="relative py-24">
//       <SmartImage
//         src={IMAGES.ctaLand}
//         alt="Open land at sunrise"
//         className="absolute inset-0 w-full h-full"
//         gradient={GRADIENTS.mix}
//       />

//       <WatercolorWash variant="cta" opacity={0.6} />

//       <div className="absolute inset-0 bg-ink/70" />

//       <div className="relative max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
//         <div className="text-white">
//           <Eyebrow light>Quick enquiry</Eyebrow>

//           <h2 className="font-display font-extrabold text-4xl mt-2 mb-4">Ready to see what's available?</h2>

//           <p className="text-white/80 mb-6">
//             Leave your details and our team will walk you through the live layouts, or sign in now to explore them yourself.
//           </p>

//           <div className="space-y-3 text-white/90 text-sm">
//             <p className="flex items-center gap-3">
//               <Dot /> Sales office · Banjara Hills, Hyderabad
//             </p>
//             <p className="flex items-center gap-3">
//               <Dot /> +91 90000 12345 · sales@aurov.com
//             </p>
//             <p className="flex items-center gap-3">
//               <Dot /> Open all days · 9:30 AM – 7:00 PM
//             </p>
//           </div>

//           <div className="mt-6 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl h-56">
//             <iframe
//               title="Aurov Reality sales office — Banjara Hills, Hyderabad"
//               src="https://www.google.com/maps?q=Banjara+Hills,+Hyderabad,+Telangana&z=14&output=embed"
//               width="100%"
//               height="100%"
//               style={{ border: 0 }}
//               loading="lazy"
//               referrerPolicy="no-referrer-when-downgrade"
//               allowFullScreen
//             />
//           </div>

//           <a
//             href="https://www.google.com/maps/search/?api=1&query=Banjara+Hills+Hyderabad"
//             target="_blank"
//             rel="noopener noreferrer"
//             className="inline-flex items-center gap-2 mt-3 text-sm text-white/90 hover:text-white transition"
//           >
//             <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
//               <path
//                 d="M12 21s-7-5.5-7-11a7 7 0 1114 0c0 5.5-7 11-7 11z"
//                 stroke="currentColor"
//                 strokeWidth="2"
//               />
//               <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="2" />
//             </svg>
//             Open in Google Maps →
//           </a>
//         </div>

//         <div className="rounded-2xl bg-white p-6 shadow-2xl">
//           {sent ? (
//             <div className="text-center py-8">
//               <div className="h-12 w-12 rounded-full bg-green/15 text-green flex items-center justify-center mx-auto mb-3">
//                 <Check big />
//               </div>

//               <h3 className="font-display font-bold text-xl text-ink mb-1">
//                 Thanks, {form.name.split(' ')[0]}!
//               </h3>

//               <p className="text-ink/60 text-sm">
//                 Our team will call you on {form.phone} shortly. Meanwhile, explore the live layouts.
//               </p>

//               <button
//                 onClick={goLogin}
//                 className="mt-4 rounded-xl bg-navy text-white px-5 py-2.5 text-sm font-semibold hover:brightness-110 transition"
//               >
//                 Explore now
//               </button>
//             </div>
//           ) : (
//             <>
//               <h3 className="font-display font-bold text-xl text-ink mb-4">Request a callback</h3>

//               <Label>Name</Label>
//               <Input
//                 value={form.name}
//                 onChange={(e) => setForm({ ...form, name: e.target.value })}
//                 placeholder="Your name"
//               />

//               <Label>Phone</Label>
//               <Input
//                 value={form.phone}
//                 onChange={(e) => setForm({ ...form, phone: e.target.value })}
//                 placeholder="+91 …"
//               />

//               <Label>Interested in</Label>
//               <select
//                 value={form.interest}
//                 onChange={(e) => setForm({ ...form, interest: e.target.value })}
//                 className="w-full rounded-xl border border-ink/15 px-3.5 py-2.5 mb-4 outline-none focus:border-navy"
//               >
//                 <option>Open plots</option>
//                 <option>Flats</option>
//                 <option>Both</option>
//               </select>

//               <button
//                 onClick={submit}
//                 className="w-full rounded-xl bg-green text-white py-3 font-semibold hover:brightness-95 transition"
//               >
//                 Request callback
//               </button>

//               <p className="text-xs text-ink/40 mt-3 text-center">Enquiries are routed to our sales team.</p>
//             </>
//           )}
//         </div>
//       </div>
//     </section>
//   );
// }

// function Footer() {
//   return (
//     <footer className="bg-ink text-white/70">
//       <div className="max-w-7xl mx-auto px-6 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
//         <div>
//           <div className="bg-white/95 rounded-lg px-2 py-1 w-fit mb-3">
//             <Logo className="h-9" />
//           </div>

//           <p className="text-sm text-white/50 max-w-xs">
//             Open plots and flats across Hyderabad, sold with live layouts and clear paperwork.
//           </p>
//         </div>

//         <FooterCol title="Quick links" items={['About', 'Ventures', 'Masterplan', 'Amenities', 'Gallery', 'Contact']} />
//         <FooterCol title="Ventures" items={['Green Meadows', 'Ridgeview Plots', 'Skyline Residences', 'Parkside Towers']} />
//         <FooterCol title="Visit" items={['Banjara Hills office', '+91 90000 12345', 'sales@aurov.com', 'HMDA / RERA approved']} />
//       </div>

//       <div className="border-t border-white/10">
//         <div className="max-w-7xl mx-auto px-6 py-5 text-xs text-white/40 flex flex-wrap justify-between gap-2">
//           <span>© {new Date().getFullYear()} Aurov Reality. All rights reserved.</span>
//           <span>Photos via Unsplash · Used for presentation purposes</span>
//         </div>
//       </div>
//     </footer>
//   );
// }

// function FooterCol({ title, items }) {
//   return (
//     <div>
//       <h4 className="text-white font-medium text-sm mb-3">{title}</h4>

//       <ul className="space-y-2 text-sm">
//         {items.map((i) => (
//           <li key={i} className="hover:text-white transition cursor-default">
//             {i}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }

// function Eyebrow({ children, light }) {
//   return (
//     <span className={`text-xs font-semibold uppercase tracking-widest ${light ? 'text-green' : 'text-teal'}`}>
//       {children}
//     </span>
//   );
// }

// function Centered({ eyebrow, title, sub, light }) {
//   return (
//     <div className="text-center max-w-3xl mx-auto">
//       <Eyebrow light={light}>{eyebrow}</Eyebrow>

//       <h2
//         className={`font-display font-extrabold text-5xl sm:text-6xl leading-tight mt-3 mb-4 ${
//           light ? 'text-white' : 'text-ink'
//         }`}
//       >
//         {title}
//       </h2>

//       {sub && <p className={`text-lg ${light ? 'text-white/80' : 'text-ink/60'} leading-relaxed`}>{sub}</p>}
//     </div>
//   );
// }

// function Check({ big, light }) {
//   return (
//     <svg
//       width={big ? 24 : 16}
//       height={big ? 24 : 16}
//       viewBox="0 0 24 24"
//       fill="none"
//       className={light ? 'text-white' : 'text-green'}
//     >
//       <path
//         d="M20 6L9 17l-5-5"
//         stroke="currentColor"
//         strokeWidth="3"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//       />
//     </svg>
//   );
// }

// function Dot() {
//   return <span className="h-2 w-2 rounded-full bg-green shrink-0" />;
// }

// function Label({ children }) {
//   return <label className="block text-sm font-medium text-ink/70 mb-1">{children}</label>;
// }

// function Input(props) {
//   return <input {...props} className="w-full rounded-xl border border-ink/15 px-3.5 py-2.5 mb-3 outline-none focus:border-navy" />;
// }  





















































import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo, inrShort } from './Logo.js';
import SmartImage from './SmartImage.js';
import WatercolorWash from './WatercolorWash.js';
import { Reveal, AnimatedNumber } from './anim.js';
import { IMAGES, GRADIENTS } from './images.js';
import { ventures } from './homeData.js';
import './home.css';




const HERO_VIDEO_SOURCES = [
  '/videos/hero-background.mp4',
];

const POSTER_VISIBLE_TIME = 5000;
const IMAGE_VISIBLE_TIME = 3000;

const HERO_REAL_ESTATE_IMAGES = [
  {
    image: '/images/image1.jpg',
    gradient: GRADIENTS.navy,
    alt: 'Premium glass tower skyline',
  },
  {
    image: '/images/image2.jpg',
    gradient: GRADIENTS.mix,
    alt: 'Luxury villa community',
  },
  {
    image: '/images/image3.jpg',
    gradient: GRADIENTS.teal,
    alt: 'Open plotting layout',
  },
  {
    image: '/images/image4.jpg',
    gradient: GRADIENTS.green,
    alt: 'Modern apartment community',
  },
];

const ABOUT_WALKTHROUGH_VIDEO = '/videos/video2.mp4';
const ABOUT_WALKTHROUGH_URL = 'https://www.aurovreality.com/walkthrough';




function GlowingGlitterHero({ goLogin, ventures }) {
  const available = ventures.reduce(
    (a, v) => a + v.units.filter((u) => u.status === 'available').length,
    0
  );

  const [heroMode, setHeroMode] = useState('poster');
  const [videoSrcIndex, setVideoSrcIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);

  const videoRef = useRef(null);
  const currentVideoSrc = HERO_VIDEO_SOURCES[videoSrcIndex];

  // Balanced particles:
  // - fewer particles
  // - some small, some medium, some bigger
  // - slightly faster movement
  // - particles only on poster
  const particles = useMemo(
    () =>
      Array.from({ length: 110 }, (_, i) => {
        const isBig = i % 13 === 0;
        const isMedium = i % 5 === 0;

        return {
          id: i,
          left: Math.random() * 100,
          top: Math.random() * 100,
          size: isBig
            ? Math.random() * 5 + 5
            : isMedium
              ? Math.random() * 3.8 + 3
              : Math.random() * 2.3 + 1,
          duration: Math.random() * 5 + 4,
          delay: Math.random() * 3.5,
          opacity: isBig
            ? Math.random() * 0.34 + 0.2
            : Math.random() * 0.42 + 0.14,
          blurAmount: isBig ? Math.random() * 1.4 + 0.4 : Math.random() * 0.7,
          tone: i % 5,
        };
      }),
    []
  );

  const bokehParticles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => {
        const isBig = i % 4 === 0;

        return {
          id: i,
          left: Math.random() * 100,
          top: Math.random() * 100,
          size: isBig ? Math.random() * 24 + 18 : Math.random() * 13 + 7,
          duration: Math.random() * 7 + 6,
          delay: Math.random() * 4,
          opacity: isBig ? Math.random() * 0.13 + 0.05 : Math.random() * 0.14 + 0.04,
        };
      }),
    []
  );

  const lightStreaks = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        width: Math.random() * 95 + 60,
        rotation: Math.random() * 18 - 9,
        duration: Math.random() * 4 + 4,
        delay: Math.random() * 4,
        opacity: Math.random() * 0.18 + 0.08,
      })),
    []
  );

  const starBursts = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 7 + 4,
        duration: Math.random() * 2.2 + 1.8,
        delay: Math.random() * 3.5,
        opacity: Math.random() * 0.34 + 0.18,
      })),
    []
  );

  useEffect(() => {
    if (heroMode !== 'poster') return undefined;

    const timer = window.setTimeout(() => {
      setHeroMode('video');
    }, POSTER_VISIBLE_TIME);

    return () => window.clearTimeout(timer);
  }, [heroMode]);

  useEffect(() => {
    if (heroMode !== 'image') return undefined;

    const timer = window.setTimeout(() => {
      setImageIndex((currentIndex) => {
        if (currentIndex >= HERO_REAL_ESTATE_IMAGES.length - 1) {
          setHeroMode('poster');
          return 0;
        }

        return currentIndex + 1;
      });
    }, IMAGE_VISIBLE_TIME);

    return () => window.clearTimeout(timer);
  }, [heroMode, imageIndex]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || heroMode !== 'video') return undefined;

    let cancelled = false;

    video.load();

    const startVideo = async () => {
      try {
        video.currentTime = 0;

        const playPromise = video.play();

        if (playPromise && typeof playPromise.then === 'function') {
          await playPromise;
        }
      } catch (error) {
        if (!cancelled) {
          if (videoSrcIndex < HERO_VIDEO_SOURCES.length - 1) {
            setVideoSrcIndex((index) => index + 1);
          } else {
            setImageIndex(0);
            setHeroMode('image');
          }
        }
      }
    };

    startVideo();

    return () => {
      cancelled = true;
    };
  }, [heroMode, videoSrcIndex]);

  const showPoster = heroMode === 'poster';
  const showImages = heroMode === 'image';

  return (
    <section className="aurov-hero relative w-full min-h-screen overflow-hidden flex items-center justify-center pt-24">
      <div className="absolute inset-0 bg-gradient-to-br from-[#061944] via-[#08365d] to-[#07543d]" />

      {/* VIDEO SCREEN - left/right padding only */}
      <div
        className={`hero-video-layer hero-media-frame ${
          heroMode === 'video' ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={heroMode !== 'video'}
      >
        <div className="hero-media-shell">
          <video
            ref={videoRef}
            key={currentVideoSrc}
            src={currentVideoSrc}
            className="hero-video"
            muted
            playsInline
            preload="auto"
            onEnded={() => {
              setImageIndex(0);
              setHeroMode('image');
            }}
            onError={() => {
              if (videoSrcIndex < HERO_VIDEO_SOURCES.length - 1) {
                setVideoSrcIndex((index) => index + 1);
              } else {
                setImageIndex(0);
                setHeroMode('image');
              }
            }}
          />

          <div className="hero-media-inner-glow" />
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-[#04132f]/30 via-transparent to-[#04132f]/35" />
      </div>

      {/* REAL ESTATE IMAGES SCREEN - left/right padding only */}
      <div
        className={`hero-image-layer hero-media-frame ${
          showImages ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!showImages}
      >
        <div className="hero-media-shell">
          {HERO_REAL_ESTATE_IMAGES.map((slide, index) => (
            <SmartImage
              key={`hero-realestate-${index}`}
              src={slide.image}
              alt={slide.alt}
              gradient={slide.gradient}
              className={`hero-realestate-image ${
                index === imageIndex && showImages ? 'is-active' : ''
              }`}
            />
          ))}

          <div className="hero-media-inner-glow" />
        </div>

        <div className="hero-image-overlay" />
        <div className="hero-image-shine" />
      </div>

      {/* PARTICLES ONLY WHEN POSTER COMES */}
      {showPoster && (
        <div className="hero-cinematic-particles" aria-hidden="true">
          <div className="hero-star-noise" />

          {bokehParticles.map((particle) => (
            <span
              key={`bokeh-${particle.id}`}
              className="hero-bokeh-particle"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                opacity: particle.opacity,
                animationDuration: `${particle.duration}s`,
                animationDelay: `${particle.delay}s`,
              }}
            />
          ))}

          {particles.map((particle) => (
            <span
              key={`particle-${particle.id}`}
              className={`hero-glow-particle particle-tone-${particle.tone}`}
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                opacity: particle.opacity,
                filter: `blur(${particle.blurAmount}px)`,
                animationDuration: `${particle.duration}s`,
                animationDelay: `${particle.delay}s`,
              }}
            />
          ))}

          {lightStreaks.map((streak) => (
            <span
              key={`streak-${streak.id}`}
              className="hero-light-streak"
              style={{
                left: `${streak.left}%`,
                top: `${streak.top}%`,
                width: `${streak.width}px`,
                opacity: streak.opacity,
                '--streak-rotation': `${streak.rotation}deg`,
                animationDuration: `${streak.duration}s`,
                animationDelay: `${streak.delay}s`,
              }}
            />
          ))}

          {starBursts.map((star) => (
            <span
              key={`star-${star.id}`}
              className="hero-star-burst"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                opacity: star.opacity,
                animationDuration: `${star.duration}s`,
                animationDelay: `${star.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* POSTER BACKGROUND - full screen, no padding */}
      <div
        className={`hero-poster-layer ${
          showPoster ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#00e5ff]/10 rounded-full blur-[110px] animate-float opacity-45" />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-[#2dd912]/10 rounded-full blur-[110px] animate-float opacity-35"
          style={{ animationDelay: '2s' }}
        />
        <div
          className="absolute top-1/2 left-1/3 w-80 h-80 bg-[#008B8B]/10 rounded-full blur-[90px] animate-float opacity-30"
          style={{ animationDelay: '4s' }}
        />
        <div className="hero-lens-flare hero-lens-flare-one" />
        <div className="hero-lens-flare hero-lens-flare-two" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#061944]/55" />
      </div>

      {/* POSTER CONTENT */}
      <div
        className={`hero-content relative z-10 text-center px-6 py-12 ${
          showPoster ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="mb-8 animate-scale-in">
          <div className="inline-block relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#00e5ff] to-[#2dd912] rounded-[32px] blur-2xl opacity-35 animate-pulse" />
            <div className="hero-logo-card relative z-10">
              <Logo className="hero-main-logo" />
            </div>
          </div>
        </div>

        <div className="mb-6 hero-title-wrap">
          <h1 className="hero-title font-display font-extrabold text-white animate-slide-up leading-tight">
            <span>AUROV</span>{' '}
            <span className="hero-title-reality">REALITY</span>
          </h1>
        </div>

        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-[#2dd912]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#2dd912] animate-pulse-glow" />
          <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-[#2dd912]" />
        </div>

        <div className="overflow-hidden mb-10">
          <p className="text-xl sm:text-2xl text-white/86 tracking-wide font-light animate-slide-up-delayed">
            Thoughtfully Planned Communities Across Hyderabad
          </p>
        </div>

        <div className="flex gap-8 sm:gap-16 justify-center mb-12 opacity-0 animate-fadeInDown [animation-delay:600ms] flex-wrap">
          <StatCard value={ventures.length} label="Active ventures" />
          <StatCard value={available} label="Units available" suffix="+" />
          <StatCard value={4} label="Prime locations" />
        </div>

        <div className="flex flex-wrap gap-6 justify-center opacity-0 animate-fadeInDown [animation-delay:800ms]">
          <button
            onClick={goLogin}
            className="relative px-8 py-4 bg-gradient-to-r from-[#00b67a] to-[#2dd912] text-white font-semibold rounded-xl overflow-hidden group hover:shadow-2xl hover:shadow-[#2dd912]/40 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
            <span className="relative flex items-center gap-2">
              Explore Live Layouts <span>→</span>
            </span>
          </button>

          <a
            href="#contact"
            className="relative px-8 py-4 border-2 border-[#2dd912] text-[#bfffb6] font-semibold rounded-xl overflow-hidden group hover:bg-[#2dd912]/10 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-[#2dd912]/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
            <span className="relative flex items-center gap-2">
              Book Site Visit <span>→</span>
            </span>
          </a>
        </div>
      </div>

      <div
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce transition-opacity duration-500 ${
          showPoster ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#2dd912]">
          <path
            d="M12 5v14M5 12l7 7 7-7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </section>
  );
}

function StatCard({ value, label, suffix = '' }) {
  return (
    <div className="text-center">
      <div className="font-display font-extrabold text-4xl sm:text-5xl text-green mb-2">
        {value}
        {suffix}
      </div>
      <div className="text-white/70 text-sm uppercase tracking-widest">{label}</div>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();

  const goLogin = () => navigate('/login');
  const goRegister = () => navigate('/login');

  return (
    <div className="aurov-home font-sans text-ink bg-white">
      <Nav goLogin={goLogin} goRegister={goRegister} />
      <GlowingGlitterHero goLogin={goLogin} ventures={ventures} />
      <TrustBar />
      <About />
      <Upcoming goLogin={goLogin} />
      <Ventures ventures={ventures} goLogin={goLogin} />
      <Masterplan />
      <PhaseSpotlight />
      <LocationAdvantages />
      <SiteLocation />
      <Amenities />
      <Gallery />
      <Testimonials />
      <Faqs />
      <Enquiry goLogin={goLogin} />
      <Footer />
    </div>
  );
}

/* ---------------- NAV ---------------- */

function Nav({ goLogin, goRegister }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);

    window.addEventListener('scroll', onScroll);

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    ['#about', 'About'],
    ['#ventures', 'Ventures'],
    ['#masterplan', 'Masterplan'],
    ['#spotlight', 'Phases'],
    ['#amenities', 'Amenities'],
    ['#location', 'Location'],
    ['#gallery', 'Gallery'],
    ['#contact', 'Contact'],
  ];

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition ${
        scrolled
          ? 'bg-white/95 backdrop-blur border-b border-ink/10 shadow-sm'
          : 'bg-white/70 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="rounded-lg transition">
          <Logo className="h-9" />
        </div>

        <nav className="hidden lg:flex items-center gap-7">
          {links.map(([h, l]) => (
            <a key={h} href={h} className="text-sm font-medium transition text-ink/70 hover:text-navy">
              {l}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a href="tel:+919000012345" className="hidden sm:block text-sm font-semibold text-navy">
            +91 90000 12345
          </a>

          <button
            onClick={goRegister}
            className="hidden sm:block rounded-xl border border-navy/15 bg-white text-navy px-4 py-2 text-sm font-semibold hover:border-navy/35 transition"
          >
            Register
          </button>

          <button
            onClick={goLogin}
            className="rounded-xl bg-green text-white px-4 py-2 text-sm font-semibold hover:brightness-95 transition"
          >
            Enquire / Sign in
          </button>

          <button onClick={() => setOpen(!open)} className="lg:hidden text-ink">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 6h16M4 12h16M4 18h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden bg-white border-t border-ink/10 px-6 py-4 flex flex-col gap-3">
          {links.map(([h, l]) => (
            <a key={h} href={h} onClick={() => setOpen(false)} className="text-sm font-medium text-ink/70">
              {l}
            </a>
          ))}

          <button
            onClick={() => {
              setOpen(false);
              goRegister();
            }}
            className="rounded-xl border border-navy/15 bg-white text-navy px-4 py-2 text-sm font-semibold text-left"
          >
            Register
          </button>
        </div>
      )}
    </header>
  );
}

/* ---------------- OLD HERO KEPT BUT NOT USED ---------------- */

function Hero({ goLogin, ventures }) {
  const available = ventures.reduce(
    (a, v) => a + v.units.filter((u) => u.status === 'available').length,
    0
  );

  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    { image: IMAGES.heroAerial, gradient: GRADIENTS.mix, overlay: 'rgba(1,48,138,0.4)' },
    { image: IMAGES.plotsAerial, gradient: GRADIENTS.green, overlay: 'rgba(14,109,130,0.4)' },
    { image: IMAGES.aboutSite, gradient: GRADIENTS.teal, overlay: 'rgba(52,195,27,0.3)' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [heroSlides.length]);

  return (
    <section className="relative bg-gradient-to-b from-navy via-ink to-navy overflow-hidden pt-24 pb-0 min-h-screen flex items-center justify-center">
      <div className="absolute inset-0 overflow-hidden">
        <ParticleBackground />
      </div>

      <div className="absolute inset-0">
        {heroSlides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              idx === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <SmartImage
              src={slide.image}
              alt="Aurov township"
              className="absolute inset-0 w-full h-full object-cover"
              gradient={slide.gradient}
            />
          </div>
        ))}
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-navy/60 via-navy/70 to-navy/80" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center py-20">
        <div className="space-y-6 mb-12">
          <div className="inline-block">
            <span className="text-green text-sm font-semibold uppercase tracking-[0.3em] opacity-0 animate-fadeInDown">
              Premium Communities
            </span>
          </div>

          <h1 className="font-display font-extrabold tracking-tight text-white">
            <span className="block text-5xl sm:text-6xl lg:text-7xl opacity-0 animate-fadeInDown [animation-delay:100ms]">
              Thoughtfully
            </span>
            <span className="block text-5xl sm:text-6xl lg:text-7xl mt-2 opacity-0 animate-fadeInDown [animation-delay:200ms]">
              Planned <span className="text-green">Communities</span>
            </span>
            <span className="block text-3xl sm:text-4xl lg:text-5xl mt-4 text-white/80 font-light opacity-0 animate-fadeInDown [animation-delay:300ms]">
              where you live &amp; grow
            </span>
          </h1>
        </div>

        <div className="opacity-0 animate-fadeInDown [animation-delay:400ms] mb-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur border border-white/20 px-4 py-2 text-sm font-semibold text-white">
            <span className="h-2 w-2 rounded-full bg-green animate-pulse" />
            HMDA &amp; RERA approved · Now selling
          </span>
        </div>

        <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-12 opacity-0 animate-fadeInDown [animation-delay:500ms] leading-relaxed">
          Live, interactive layouts — see exactly what's available, held, or sold. Reserve your space in minutes.
        </p>

        <div className="flex flex-wrap gap-4 justify-center mb-12 opacity-0 animate-fadeInDown [animation-delay:600ms]">
          <button
            onClick={goLogin}
            className="pulse-cta shine rounded-xl bg-green text-white px-8 py-4 font-semibold hover:brightness-110 transition shadow-lg shadow-green/50 text-base"
          >
            Explore live layouts
          </button>

          <a
            href="#contact"
            className="shine rounded-xl bg-white/20 backdrop-blur text-white px-8 py-4 font-semibold hover:bg-white/30 transition border border-white/30 text-base"
          >
            Book a site visit
          </a>
        </div>

        <div className="flex gap-8 sm:gap-16 justify-center opacity-0 animate-fadeInDown [animation-delay:700ms] flex-wrap">
          <HeroStat value={ventures.length} l="Active ventures" />
          <HeroStat value={available} suffix="+" l="Units available" />
          <HeroStat value={4} l="Prime locations" />
        </div>

        <div className="flex gap-2 justify-center mt-16 opacity-0 animate-fadeInDown [animation-delay:800ms]">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentSlide ? 'bg-green w-8' : 'bg-white/40 w-2 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white/60">
          <path
            d="M12 5v14M5 12l7 7 7-7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </section>
  );
}

function ParticleBackground() {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 10 + 5,
    delay: Math.random() * 2,
  }));

  return (
    <div className="absolute inset-0">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-white/30 animate-float"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animation: `float ${particle.duration}s ease-in-out infinite`,
            animationDelay: `${particle.delay}s`,
            filter: 'blur(0.5px)',
          }}
        />
      ))}
    </div>
  );
}

function HeroStat({ value, suffix = '', l }) {
  return (
    <div>
      <AnimatedNumber
        value={value}
        suffix={suffix}
        className="font-display font-extrabold text-3xl sm:text-4xl text-white"
      />
      <div className="text-white/70 text-sm mt-1">{l}</div>
    </div>
  );
}

/* ---------------- REST COMPONENTS ---------------- */

function TrustBar() {
  const items = ['HMDA & RERA approved', 'Clear marketable titles', 'Bank-loan ready', '15+ years building Hyderabad'];

  return (
    <div className="bg-green text-white">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-center gap-x-10 gap-y-2 text-sm font-medium">
        {items.map((t, i) => (
          <span key={i} className="flex items-center gap-2">
            <Check light /> {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function About() {
  const aboutVideoRef = useRef(null);
  const [isAboutVideoPlaying, setIsAboutVideoPlaying] = useState(false);

  const toggleAboutVideo = async () => {
    const video = aboutVideoRef.current;
    if (!video) return;

    try {
      if (video.paused) {
        video.muted = false;
        video.volume = 1;
        await video.play();
        setIsAboutVideoPlaying(true);
      } else {
        video.pause();
        setIsAboutVideoPlaying(false);
      }
    } catch (error) {
      console.log('Video play error:', error);
    }
  };

  return (
    <section id="about" className="relative overflow-hidden py-24">
      <WatercolorWash variant="soft" opacity={0.5} />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="about-video-card rounded-3xl overflow-hidden h-[420px] shadow-xl relative">
              <video
                ref={aboutVideoRef}
                className="about-video-bg"
                src={ABOUT_WALKTHROUGH_VIDEO}
                playsInline
                preload="metadata"
                onPlay={() => setIsAboutVideoPlaying(true)}
                onPause={() => setIsAboutVideoPlaying(false)}
                onEnded={() => setIsAboutVideoPlaying(false)}
              />

              <button
                type="button"
                onClick={toggleAboutVideo}
                className="about-video-center-btn"
                aria-label={isAboutVideoPlaying ? 'Pause video' : 'Start video'}
              >
                {!isAboutVideoPlaying ? (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="#01308A">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                ) : (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="#01308A">
                    <path d="M7 5h4v14H7V5zm6 0h4v14h-4V5z" />
                  </svg>
                )}
              </button>
            </div>

<div className="grid sm:grid-cols-4 gap-4 mt-8">
  {/* 460+ card */}
  <div className="rounded-2xl border border-ink/10 bg-mist p-4">
    <div className="font-display font-bold text-xl text-navy">
      460<span className="text-green">+</span>
    </div>
    <div className="text-xs text-ink/50 mt-0.5">acres planned across ventures</div>
  </div>
  
  <Mini n="4" l="Active ventures" />
  <Mini n="HMDA" l="Approved layouts" />
  <Mini n="10 min" l="From the ORR" />
</div>
          </div>

          <div>
            <Eyebrow>About Aurov Reality</Eyebrow>

            <h2 className="font-display font-extrabold text-5xl sm:text-6xl leading-tight text-ink mt-2 mb-5">
              Thoughtfully designed places to live and grow
            </h2>

            <p className="text-ink/70 leading-relaxed mb-4">
              Aurov Reality develops gated plot layouts and modern apartments across Hyderabad's
              fastest-growing corridors. Every venture is planned around clear roads, generous
              open space, and amenities that communities actually use.
            </p>

            <p className="text-ink/70 leading-relaxed mb-6">
              What sets us apart is transparency: each venture has a live, interactive layout where
              you can inspect any plot or flat — its size, facing, boundaries and price — and see in
              real time whether it's available, held, or sold.
            </p>


          </div>
        </div>
      </div>
    </section>
  );
}
function Mini({ n, l }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-mist p-4">
      <div className="font-display font-bold text-xl text-navy">{n}</div>
      <div className="text-xs text-ink/50 mt-0.5">{l}</div>
    </div>
  );
}

function Ventures({ ventures, goLogin }) {
  return (
    <section id="ventures" className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-6">
        <Reveal>
          <Centered
            eyebrow="Our ventures"
            title="Project spotlight"
            sub="Each venture comes with a live, interactive layout. Sign in to open the site map, inspect any plot or flat, and reserve in minutes."
          />
        </Reveal>

        <div className="grid md:grid-cols-2 gap-8 mt-12">
          {ventures.map((v, idx) => {
            const avail = v.units.filter((u) => u.status === 'available').length;

            return (
              <Reveal key={v.id} delay={idx * 110} className="h-full">
                <article className="lift group rounded-3xl overflow-hidden bg-white border border-ink/10 h-full">
                  <div className="relative h-60">
                    <SmartImage
                      src={v.image}
                      alt={v.name}
                      className="absolute inset-0 w-full h-full group-hover:scale-105 transition duration-500"
                      gradient={v.type === 'flat' ? GRADIENTS.teal : GRADIENTS.green}
                    />

                    <div
                      className="absolute inset-0"
                      style={{ background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.6) 100%)' }}
                    />

                    <span
                      className={`absolute top-4 left-4 text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full text-white ${
                        v.type === 'flat' ? 'bg-teal' : 'bg-green'
                      }`}
                    >
                      {v.type === 'flat' ? 'Flats' : 'Open Plots'}
                    </span>

                    <span className="absolute top-4 right-4 text-xs text-white/90 bg-black/30 rounded-full px-2.5 py-1">
                      {v.possession}
                    </span>

                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="font-display font-bold text-2xl">{v.name}</h3>
                      <p className="text-white/80 text-sm">{v.location}</p>
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="text-ink/70 mb-4">{v.tagline}</p>

                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {v.amenities.slice(0, 4).map((a) => (
                        <span key={a} className="text-xs bg-mist text-ink/60 px-2.5 py-1 rounded-full">
                          {a}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between border-t border-ink/10 pt-4">
                      <div>
                        <div className="text-xs text-ink/40">Starting from</div>
                        <div className="font-display font-bold text-xl text-navy">{inrShort(v.priceFrom)}</div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs text-ink/40">Available</div>
                        <div className="font-display font-bold text-green">
                          {avail} / {v.units.length}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={goLogin}
                      className="shine w-full mt-5 rounded-xl bg-navy text-white py-2.5 text-sm font-semibold hover:brightness-110 transition"
                    >
                      View live layout →
                    </button>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Masterplan() {
  const plans = [
    { src: IMAGES.masterplan, label: 'Township masterplan', grad: GRADIENTS.navy },
    { src: IMAGES.plotsAerial, label: 'Plot layout plan', grad: GRADIENTS.green },
    { src: IMAGES.aboutSite, label: 'Amenity zones', grad: GRADIENTS.teal },
  ];

  return (
    <section id="masterplan" className="brand-section relative overflow-hidden py-24 text-white">
      <WatercolorWash variant="cta" opacity={0.3} />

      <div className="relative max-w-7xl mx-auto px-6">
        <Reveal>
          <Centered
            light
            eyebrow="Site plan"
            title="Masterplans — Aurov ventures"
            sub="Wide internal roads, avenue plantation, and amenity zones — planned before a single plot is sold."
          />
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {plans.map((p, i) => (
            <Reveal key={i} delay={i * 110}>
              <figure className="lift rounded-3xl overflow-hidden border border-white/15 shadow-lg bg-white">
                <div className="h-56">
                  <SmartImage src={p.src} alt={p.label} className="w-full h-full" gradient={p.grad} />
                </div>
                <figcaption className="px-5 py-3 text-sm font-medium text-ink/70">{p.label}</figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
          {[
            ['40–60 ft', 'internal roads'],
            ['8+ acres', 'landscaped greenery'],
            ['100%', 'gated & secured'],
            ['Avenue', 'tree plantation'],
          ].map(([n, l]) => (
            <div key={l} className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur p-5 text-center">
              <div className="font-display font-extrabold text-2xl text-white">{n}</div>
              <div className="text-xs text-white/70 mt-1">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


function Upcoming({ goLogin }) {
  const features = [
    'Net-zero design',
    'Clubhouse & pool',
    'EV charging',
    'Organic gardens',
    '100ft approach road',
    'Near upcoming metro',
  ];

  return (
    <section className="brand-section relative overflow-hidden py-24 text-white">
      <WatercolorWash variant="cta" opacity={0.35} />

      <div className="relative max-w-7xl mx-auto px-6">
        <Reveal>
          <Centered
            light
            eyebrow="Coming soon"
            title="Upcoming from Aurov"
            sub="A preview of the next Aurov community taking shape."
          />
        </Reveal>

        <Reveal>
          <div className="grid lg:grid-cols-2 gap-0 mt-12 rounded-3xl overflow-hidden border border-ink/10 bg-white shadow-sm lift">
            <div className="relative min-h-[300px]">
              <SmartImage
                src={IMAGES.upcoming}
                alt="Aurov Windgrove"
                className="absolute inset-0 w-full h-full"
                gradient={GRADIENTS.mix}
              />

              <span className="absolute top-4 left-4 text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full text-white bg-green">
                Pre-launch
              </span>
            </div>

            <div className="p-8 lg:p-10 bg-white text-[#1B1B1B]">
              <h3 className="font-display font-extrabold text-3xl text-[#1B1B1B] mb-2">
                Aurov Windgrove
              </h3>

              <p className="text-[#667085] text-sm mb-4">
                Inole, Hyderabad · 70+ acres
              </p>

              <p className="text-[#344054] leading-relaxed mb-4">
                A sustainable, low-density community of premium plots and garden villas wrapped in
                native landscaping. Designed around solar power, EV charging, rainwater harvesting,
                and a central green spine — an eco-conscious address in the next growth corridor.
              </p>

              <ul className="grid grid-cols-2 gap-2 mb-6 text-sm text-[#344054]">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-[#344054]">
                    <span className="h-1.5 w-1.5 rounded-full bg-green shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={goLogin}
                className="shine rounded-xl bg-navy text-white px-6 py-3 font-semibold hover:brightness-110 transition"
              >
                Register your interest
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function PhaseSpotlight() {
  const phases = [
    {
      tag: 'Phase 1',
      title: 'Green Meadows — ready plots',
      img: IMAGES.phase1,
      side: 'left',
      body:
        'HMDA-approved open plots on 8 acres of landscaped greenery, with 40–60 ft roads, avenue plantation, a clubhouse and overhead tank. Infrastructure complete and ready for registration.',
    },
    {
      tag: 'Phase 2',
      title: 'Ridgeview — premium plots',
      img: IMAGES.phase2,
      side: 'right',
      body:
        'East-facing premium plots minutes from the ORR, with underground drainage, solar street lights and a jogging track. Gated entry and a planned amenity core.',
    },
    {
      tag: 'Phase 3',
      title: 'Skyline & Parkside — flats',
      img: IMAGES.phase3,
      side: 'left',
      body:
        '2 & 3 BHK apartments with infinity pool, gym, covered parking and 24×7 security — lake- and park-facing towers in Kokapet and Tellapur.',
    },
  ];

  return (
    <section id="spotlight" className="max-w-7xl mx-auto px-6 py-24">
      <Reveal>
        <Centered
          eyebrow="Project spotlight"
          title="Our phases at a glance"
          sub="From ready-to-register plots to flats nearing possession — explore each phase."
        />
      </Reveal>

      <div className="space-y-16 mt-14">
        {phases.map((p, i) => (
          <Reveal key={i}>
            <div
              className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-center ${
                p.side === 'right' ? 'lg:[&>*:first-child]:order-2' : ''
              }`}
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl overflow-hidden h-44 col-span-2">
                  <SmartImage src={p.img} alt={p.title} className="w-full h-full lift" gradient={GRADIENTS.teal} />
                </div>

                <div className="rounded-2xl overflow-hidden h-28">
                  <SmartImage src={IMAGES.interior} alt="" className="w-full h-full" gradient={GRADIENTS.navy} />
                </div>

                <div className="rounded-2xl overflow-hidden h-28">
                  <SmartImage src={IMAGES.clubhouse} alt="" className="w-full h-full" gradient={GRADIENTS.green} />
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-teal">{p.tag}</span>
                <h3 className="font-display font-extrabold text-3xl text-ink mt-2 mb-3">{p.title}</h3>
                <p className="text-ink/70 leading-relaxed">{p.body}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function SiteLocation() {
  return (
    <section id="location" className="max-w-7xl mx-auto px-6 py-24">
      <Reveal>
        <Centered
          eyebrow="Site location"
          title="Find us on the map"
          sub="Our ventures sit along Hyderabad's western and southern growth corridors."
        />
      </Reveal>

      <Reveal>
        <div className="mt-12 rounded-3xl overflow-hidden border border-ink/10 shadow-sm h-[420px]">
          <iframe
            title="Aurov ventures — Hyderabad"
            src="https://www.google.com/maps?q=Hyderabad,+Telangana&z=11&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </Reveal>
    </section>
  );
}

function LocationAdvantages() {
  const groups = [
    { t: '10 mins', items: ['ORR', 'Upcoming Metro', 'IT Park', 'Medical College'] },
    { t: '30 mins', items: ['Financial District', 'Kokapet / Neopolis', 'Top schools', 'Universities'] },
    { t: '45 mins', items: ['Hi-Tech City', 'Airport', 'IIT Hyderabad'] },
  ];

  return (
    <section className="brand-section relative overflow-hidden py-24 text-white">
      <WatercolorWash variant="cta" opacity={0.3} />

      <div className="relative max-w-7xl mx-auto px-6">
        <Reveal>
          <Centered
            light
            eyebrow="Connectivity"
            title="Location advantages"
            sub="Seamless access to Hyderabad's growth corridors via the ORR and upcoming metro."
          />
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {groups.map((g, idx) => (
            <Reveal key={g.t} delay={idx * 110}>
              <div className="lift rounded-3xl bg-white/10 backdrop-blur border border-white/20 p-6 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-white">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>

                  <div className="font-display font-extrabold text-2xl text-white">Within {g.t}</div>
                </div>

                <ul className="space-y-2">
                  {g.items.map((i) => (
                    <li key={i} className="flex items-center gap-2 text-white/85 text-sm">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-white shrink-0">
                        <path
                          d="M12 21s-7-5.5-7-11a7 7 0 1114 0c0 5.5-7 11-7 11z"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="2" />
                      </svg>
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Amenities() {
  const indoor = [
    ['Clubhouse', 'M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6'],
    ['A/C gym', 'M6 7v10M18 7v10M4 9h2M18 9h2M4 15h2M18 15h2M6 12h12'],
    ['Yoga / aerobics', 'M12 4a2 2 0 100 4 2 2 0 000-4zM6 21l3-7 3 2 3-2 3 7M9 14l-2-4h10l-2 4'],
    ['Multipurpose hall', 'M3 9l9-6 9 6M5 9v11h14V9M9 20v-6h6v6'],
    ['Indoor games', 'M4 6h16v12H4zM8 6v12M16 6v12'],
    ['Library', 'M5 4h4v16H5zM10 4h4v16h-4zM16 5l3 1-3 14-3-1'],
    ['Convenience store', 'M4 9h16l-1 11H5L4 9zM4 9l2-5h12l2 5M9 13h6'],
    ['Society office', 'M6 21V7l6-4 6 4v14M10 12h4M10 16h4'],
  ];

  const outdoor = [
    ['Swimming pool', 'M2 17c2 0 2 1 4 1s2-1 4-1 2 1 4 1 2-1 4-1 2 1 4 1M5 14V6a2 2 0 014 0M15 14V6a2 2 0 014 0'],
    ["Kids' pool", 'M2 18c2 0 2 1 4 1s2-1 4-1 2 1 4 1 2-1 4-1M7 14a3 3 0 016 0'],
    ['Play area', 'M12 3v6M8 9h8l-2 6H10L8 9zM9 21l1-6M15 21l-1-6'],
    ['Jogging track', 'M13 4a2 2 0 100 4 2 2 0 000-4zM5 21l4-8 3 2v6M9 13l-2-4 5-1 3 3 3 1'],
    ['Open lawn', 'M3 20h18M5 20c0-5 2-9 7-9s7 4 7 9M9 11V5M9 5l3-2'],
    ['Landscaped parks', 'M12 3a5 5 0 015 5c0 3-5 8-5 8s-5-5-5-8a5 5 0 015-5zM12 16v5'],
    ['Box cricket', 'M4 20l9-9M14 5l5 5M13 6l5 5-2 2-5-5z'],
    ['Pet park', 'M5 11a2 2 0 100-4 2 2 0 000 4zM19 11a2 2 0 100-4 2 2 0 000 4zM9 8a2 2 0 100-4 2 2 0 000 4zM15 8a2 2 0 100-4 2 2 0 000 4zM12 12c-3 0-5 2-5 5h10c0-3-2-5-5-5z'],
  ];

  return (
    <section id="amenities" className="brand-section relative overflow-hidden py-24 text-white">
      <WatercolorWash variant="cta" opacity={0.3} />

      <div className="relative max-w-7xl mx-auto px-6">
        <Reveal>
          <Centered
            light
            eyebrow="Lifestyle"
            title="Amenities & facilities"
            sub="A diverse array of amenities for a well-rounded living experience — indoors and out."
          />
        </Reveal>

        <Reveal>
          <h3 className="font-display font-bold text-xl text-white mt-12 mb-5">Indoor amenities</h3>
        </Reveal>

        <IconGrid items={indoor} />

        <Reveal>
          <h3 className="font-display font-bold text-xl text-white mt-12 mb-5">Outdoor amenities</h3>
        </Reveal>

        <IconGrid items={outdoor} />
      </div>
    </section>
  );
}

function IconGrid({ items }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {items.map(([label, d], i) => (
        <Reveal key={label} delay={i * 50}>
          <div className="lift rounded-2xl border border-white/20 bg-white/10 backdrop-blur p-5 text-center h-full">
            <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d={d} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <div className="text-sm text-white/85">{label}</div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

function Gallery() {
  const shots = [
    { src: IMAGES.clubhouse, label: 'Clubhouse', grad: GRADIENTS.navy, span: 'sm:col-span-2 sm:row-span-2' },
    { src: IMAGES.pool, label: 'Swimming pool', grad: GRADIENTS.teal, span: '' },
    { src: IMAGES.park, label: 'Landscaped parks', grad: GRADIENTS.green, span: '' },
    { src: IMAGES.road, label: 'Tree-lined avenues', grad: GRADIENTS.teal, span: '' },
    { src: IMAGES.interior, label: 'Sample interiors', grad: GRADIENTS.navy, span: '' },
  ];

  return (
    <section id="gallery" className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-6">
        <Reveal>
          <Centered
            eyebrow="Gallery"
            title="Life at Aurov"
            sub="Amenities and surroundings designed for how communities actually live."
          />
        </Reveal>

        <div className="grid sm:grid-cols-3 lg:grid-cols-4 auto-rows-[180px] gap-4 mt-12">
          {shots.map((s, i) => (
            <Reveal key={i} delay={i * 80} className={s.span}>
              <div className="lift relative rounded-2xl overflow-hidden group h-full w-full">
                <SmartImage
                  src={s.src}
                  alt={s.label}
                  className="absolute inset-0 w-full h-full group-hover:scale-105 transition duration-500"
                  gradient={s.grad}
                />

                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.6) 100%)' }}
                />

                <span className="absolute bottom-3 left-4 text-white font-medium text-sm">{s.label}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const items = [
    {
      q: 'The live layout made all the difference — I could see the exact plot, its boundaries and price before visiting. Booked in a week.',
      n: 'Sandeep Reddy',
      r: 'Green Meadows',
      img: IMAGES.person1,
    },
    {
      q: 'No back-and-forth on what was available. The colour map was honest, and the EMI calculator helped me plan the 3 BHK confidently.',
      n: 'Lakshmi Menon',
      r: 'Skyline Residences',
      img: IMAGES.person2,
    },
    {
      q: 'Site visit was a two-tap booking and the paperwork was genuinely clear. Easiest land purchase I have made.',
      n: 'Imran Khan',
      r: 'Ridgeview Plots',
      img: IMAGES.person3,
    },
  ];

  return (
    <section className="brand-section relative overflow-hidden py-24 text-white">
      <WatercolorWash variant="cta" opacity={0.3} />

      <div className="relative max-w-7xl mx-auto px-6">
        <Reveal>
          <Centered light eyebrow="Owners" title="What our buyers say" sub="A few words from owners across our ventures." />
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {items.map((t, i) => (
            <figure key={i} className="lift rounded-2xl bg-white/10 backdrop-blur border border-white/20 p-6">
              <div className="text-white text-sm mb-3">★★★★★</div>

              <blockquote className="text-white/90 text-sm leading-relaxed mb-5">{t.q}</blockquote>

              <figcaption className="flex items-center gap-3">
                <SmartImage
                  src={t.img}
                  alt={t.n}
                  className="h-10 w-10 rounded-full overflow-hidden shrink-0"
                  gradient={GRADIENTS.green}
                />

                <div>
                  <div className="text-white font-medium text-sm">{t.n}</div>
                  <div className="text-white/60 text-xs">{t.r}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Faqs() {
  const faqs = [
    [
      'What do Aurov ventures cost?',
      'Open plots start around ₹12 lakh and flats from about ₹68 lakh, depending on venture, size and facing. Exact prices are shown live on each unit in the layout.',
    ],
    [
      'Are the layouts approved?',
      'Yes — our plot ventures are HMDA-approved with clear, marketable titles, and our flat projects are RERA-registered.',
    ],
    [
      'Can I get a home loan?',
      'All ventures are bank-loan ready. The built-in EMI calculator lets you estimate instalments on any unit before you commit.',
    ],
    [
      'How do I book a site visit?',
      'Sign in, open a venture, and use "Book site visit" to pick a date and slot. Our team confirms it from the admin side.',
    ],
    [
      'How does reservation work?',
      'Select an available (green) unit, reserve it (turns yellow), complete the payment, and on admin approval it is confirmed as booked (red).',
    ],
  ];

  const [open, setOpen] = useState(0);

  return (
    <section className="bg-white py-24">
      <div className="max-w-3xl mx-auto px-6">
        <Reveal>
          <Centered eyebrow="FAQs" title="Frequently asked questions" />
        </Reveal>

        <div className="mt-10 space-y-3">
          {faqs.map(([q, a], i) => (
            <div key={i} className="rounded-2xl bg-white border border-ink/10 overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? -1 : i)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="font-medium text-ink">{q}</span>
                <span className={`text-green text-xl transition ${open === i ? 'rotate-45' : ''}`}>+</span>
              </button>

              {open === i && <div className="px-5 pb-4 text-sm text-ink/65 leading-relaxed">{a}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Enquiry({ goLogin }) {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', interest: 'Open plots' });

  const submit = () => {
    if (form.name && form.phone) setSent(true);
  };

  return (
    <section id="contact" className="relative py-24">
      <SmartImage
        src={IMAGES.ctaLand}
        alt="Open land at sunrise"
        className="absolute inset-0 w-full h-full"
        gradient={GRADIENTS.mix}
      />

      <WatercolorWash variant="cta" opacity={0.6} />

      <div className="absolute inset-0 bg-ink/70" />

      <div className="relative max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <div className="text-white">
          <Eyebrow light>Quick enquiry</Eyebrow>

          <h2 className="font-display font-extrabold text-4xl mt-2 mb-4">Ready to see what's available?</h2>

          <p className="text-white/80 mb-6">
            Leave your details and our team will walk you through the live layouts, or sign in now to explore them yourself.
          </p>

          <div className="space-y-3 text-white/90 text-sm">
            <p className="flex items-center gap-3">
              <Dot /> Sales office · Banjara Hills, Hyderabad
            </p>
            <p className="flex items-center gap-3">
              <Dot /> +91 90000 12345 · sales@aurov.com
            </p>
            <p className="flex items-center gap-3">
              <Dot /> Open all days · 9:30 AM – 7:00 PM
            </p>
          </div>

          <div className="mt-6 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl h-56">
            <iframe
              title="Aurov Reality sales office — Banjara Hills, Hyderabad"
              src="https://www.google.com/maps?q=Banjara+Hills,+Hyderabad,+Telangana&z=14&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>

          <a
            href="https://www.google.com/maps/search/?api=1&query=Banjara+Hills+Hyderabad"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-3 text-sm text-white/90 hover:text-white transition"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 21s-7-5.5-7-11a7 7 0 1114 0c0 5.5-7 11-7 11z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="2" />
            </svg>
            Open in Google Maps →
          </a>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-2xl">
          {sent ? (
            <div className="text-center py-8">
              <div className="h-12 w-12 rounded-full bg-green/15 text-green flex items-center justify-center mx-auto mb-3">
                <Check big />
              </div>

              <h3 className="font-display font-bold text-xl text-ink mb-1">
                Thanks, {form.name.split(' ')[0]}!
              </h3>

              <p className="text-ink/60 text-sm">
                Our team will call you on {form.phone} shortly. Meanwhile, explore the live layouts.
              </p>

              <button
                onClick={goLogin}
                className="mt-4 rounded-xl bg-navy text-white px-5 py-2.5 text-sm font-semibold hover:brightness-110 transition"
              >
                Explore now
              </button>
            </div>
          ) : (
            <>
              <h3 className="font-display font-bold text-xl text-ink mb-4">Request a callback</h3>

              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
              />

              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 …"
              />

              <Label>Interested in</Label>
              <select
                value={form.interest}
                onChange={(e) => setForm({ ...form, interest: e.target.value })}
                className="w-full rounded-xl border border-ink/15 px-3.5 py-2.5 mb-4 outline-none focus:border-navy"
              >
                <option>Open plots</option>
                <option>Flats</option>
                <option>Both</option>
              </select>

              <button
                onClick={submit}
                className="w-full rounded-xl bg-green text-white py-3 font-semibold hover:brightness-95 transition"
              >
                Request callback
              </button>

              <p className="text-xs text-ink/40 mt-3 text-center">Enquiries are routed to our sales team.</p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-ink text-white/70">
      <div className="max-w-7xl mx-auto px-6 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <div className="bg-white/95 rounded-lg px-2 py-1 w-fit mb-3">
            <Logo className="h-9" />
          </div>

          <p className="text-sm text-white/50 max-w-xs">
            Open plots and flats across Hyderabad, sold with live layouts and clear paperwork.
          </p>
        </div>

        <FooterCol title="Quick links" items={['About', 'Ventures', 'Masterplan', 'Amenities', 'Gallery', 'Contact']} />
        <FooterCol title="Ventures" items={['Green Meadows', 'Ridgeview Plots', 'Skyline Residences', 'Parkside Towers']} />
        <FooterCol title="Visit" items={['Banjara Hills office', '+91 90000 12345', 'sales@aurov.com', 'HMDA / RERA approved']} />
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5 text-xs text-white/40 flex flex-wrap justify-between gap-2">
          <span>© {new Date().getFullYear()} Aurov Reality. All rights reserved.</span>
          <span>Photos via Unsplash · Used for presentation purposes</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }) {
  return (
    <div>
      <h4 className="text-white font-medium text-sm mb-3">{title}</h4>

      <ul className="space-y-2 text-sm">
        {items.map((i) => (
          <li key={i} className="hover:text-white transition cursor-default">
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Eyebrow({ children, light }) {
  return (
    <span className={`text-xs font-semibold uppercase tracking-widest ${light ? 'text-green' : 'text-teal'}`}>
      {children}
    </span>
  );
}

function Centered({ eyebrow, title, sub, light }) {
  return (
    <div className="text-center max-w-3xl mx-auto">
      <Eyebrow light={light}>{eyebrow}</Eyebrow>

      <h2
        className={`font-display font-extrabold text-5xl sm:text-6xl leading-tight mt-3 mb-4 ${
          light ? 'text-white' : 'text-ink'
        }`}
      >
        {title}
      </h2>

      {sub && <p className={`text-lg ${light ? 'text-white/80' : 'text-ink/60'} leading-relaxed`}>{sub}</p>}
    </div>
  );
}

function Check({ big, light }) {
  return (
    <svg
      width={big ? 24 : 16}
      height={big ? 24 : 16}
      viewBox="0 0 24 24"
      fill="none"
      className={light ? 'text-white' : 'text-green'}
    >
      <path
        d="M20 6L9 17l-5-5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Dot() {
  return <span className="h-2 w-2 rounded-full bg-green shrink-0" />;
}

function Label({ children }) {
  return <label className="block text-sm font-medium text-ink/70 mb-1">{children}</label>;
}

function Input(props) {
  return <input {...props} className="w-full rounded-xl border border-ink/15 px-3.5 py-2.5 mb-3 outline-none focus:border-navy" />;
}  































