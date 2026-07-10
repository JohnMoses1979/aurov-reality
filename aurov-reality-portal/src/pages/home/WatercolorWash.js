import React, { useId } from 'react'

// Painterly watercolor wash overlay in the Aurov brand colours (navy / teal /
// green). Pure SVG (turbulence + displacement) so it always renders with no
// images/network.
//
// variant:
//   'hero' / 'cta'  -> bold banner washes (multiply over a photo)
//   'soft'          -> faint washes for use behind light page sections
export default function WatercolorWash({ variant = 'hero', opacity = 0.7, className = '' }) {
  const id = useId().replace(/:/g, '')
  const fBleed = `bleed-${id}`, fEdge = `edge-${id}`, fPaper = `paper-${id}`
  const gNavy = `gn-${id}`, gTeal = `gt-${id}`, gGreen = `gg-${id}`

  const SETS = {
    hero: [
      { cx: 500, cy: 140, rx: 460, ry: 360, g: gNavy },
      { cx: 180, cy: 470, rx: 340, ry: 320, g: gTeal },
      { cx: 820, cy: 470, rx: 360, ry: 320, g: gGreen },
      { cx: 500, cy: 600, rx: 300, ry: 240, g: gTeal },
    ],
    cta: [
      { cx: 180, cy: 520, rx: 360, ry: 300, g: gGreen },
      { cx: 560, cy: 150, rx: 380, ry: 320, g: gNavy },
      { cx: 860, cy: 430, rx: 320, ry: 300, g: gTeal },
      { cx: 360, cy: 280, rx: 280, ry: 260, g: gTeal },
    ],
    soft: [
      { cx: 120, cy: 120, rx: 320, ry: 280, g: gTeal },
      { cx: 900, cy: 200, rx: 300, ry: 280, g: gGreen },
      { cx: 780, cy: 600, rx: 320, ry: 280, g: gNavy },
    ],
  }
  const blobs = SETS[variant] || SETS.hero
  const isSoft = variant === 'soft'

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <svg width="100%" height="100%" viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice"
        style={{ display: 'block', mixBlendMode: isSoft ? 'normal' : 'multiply' }}>
        <defs>
          <filter id={fBleed} x="-25%" y="-25%" width="150%" height="150%">
            <feTurbulence type="fractalNoise" baseFrequency="0.011 0.015" numOctaves="5" seed="11" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={isSoft ? 55 : 80} xChannelSelector="R" yChannelSelector="G" result="disp" />
            <feGaussianBlur in="disp" stdDeviation={isSoft ? 18 : 10} />
          </filter>
          <radialGradient id={gNavy} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#01308A" stopOpacity={isSoft ? 0.5 : 1} />
            <stop offset="60%" stopColor="#01308A" stopOpacity={isSoft ? 0.28 : 0.7} />
            <stop offset="100%" stopColor="#01308A" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={gTeal} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#006D82" stopOpacity={isSoft ? 0.5 : 1} />
            <stop offset="60%" stopColor="#006D82" stopOpacity={isSoft ? 0.28 : 0.7} />
            <stop offset="100%" stopColor="#006D82" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={gGreen} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#34C31B" stopOpacity={isSoft ? 0.5 : 0.95} />
            <stop offset="60%" stopColor="#34C31B" stopOpacity={isSoft ? 0.26 : 0.65} />
            <stop offset="100%" stopColor="#34C31B" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g filter={`url(#${fBleed})`} opacity={opacity}>
          {blobs.map((b, i) => (
            <ellipse key={i} cx={b.cx} cy={b.cy} rx={b.rx} ry={b.ry} fill={`url(#${b.g})`} />
          ))}
        </g>
      </svg>

      {!isSoft && (
        <svg width="100%" height="100%" viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice"
          style={{ display: 'block', mixBlendMode: 'soft-light', position: 'absolute', inset: 0 }}>
          <defs>
            <filter id={fEdge} x="-25%" y="-25%" width="150%" height="150%">
              <feTurbulence type="fractalNoise" baseFrequency="0.02 0.022" numOctaves="4" seed="5" result="n" />
              <feDisplacementMap in="SourceGraphic" in2="n" scale="55" />
              <feGaussianBlur stdDeviation="2.5" />
            </filter>
          </defs>
          <g filter={`url(#${fEdge})`} opacity="0.5" fill="none" strokeWidth="3">
            {blobs.map((b, i) => (
              <ellipse key={i} cx={b.cx} cy={b.cy} rx={b.rx * 0.82} ry={b.ry * 0.82} stroke={i % 2 ? '#001133' : '#002244'} />
            ))}
          </g>
        </svg>
      )}

      <svg width="100%" height="100%" preserveAspectRatio="none"
        style={{ display: 'block', position: 'absolute', inset: 0, mixBlendMode: 'overlay', opacity: isSoft ? 0.25 : 0.4 }}>
        <defs>
          <filter id={fPaper}><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="3" /></filter>
        </defs>
        <rect width="100%" height="100%" filter={`url(#${fPaper})`} />
      </svg>
    </div>
  )
}
