import React, { useRef, useEffect, useState } from 'react'

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Reveal: fades/slides children in when they scroll into view.
// direction: 'up' | 'left' | 'right' | 'none'
export function Reveal({ children, direction = 'up', delay = 0, className = '', as: Tag = 'div' }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (prefersReduced()) { setShown(true); return }
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { setShown(true); obs.unobserve(e.target) }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const offset = { up: 'translateY(28px)', left: 'translateX(-28px)', right: 'translateX(28px)', none: 'none' }[direction]

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : offset,
        transition: `opacity .7s cubic-bezier(.22,.61,.36,1) ${delay}ms, transform .7s cubic-bezier(.22,.61,.36,1) ${delay}ms`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </Tag>
  )
}

// AnimatedNumber: counts up to `value` when scrolled into view.
// Supports an optional suffix (e.g. '+') and prefix.
export function AnimatedNumber({ value, suffix = '', prefix = '', duration = 1400, className = '' }) {
  const ref = useRef(null)
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (prefersReduced()) { setDisplay(value); return }
    const el = ref.current
    if (!el) return
    let raf
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const start = performance.now()
          const tick = (now) => {
            const p = Math.min(1, (now - start) / duration)
            // easeOutCubic
            const eased = 1 - Math.pow(1 - p, 3)
            setDisplay(Math.round(eased * value))
            if (p < 1) raf = requestAnimationFrame(tick)
          }
          raf = requestAnimationFrame(tick)
          obs.unobserve(e.target)
        }
      })
    }, { threshold: 0.5 })
    obs.observe(el)
    return () => { obs.disconnect(); cancelAnimationFrame(raf) }
  }, [value, duration])

  return <span ref={ref} className={className}>{prefix}{display}{suffix}</span>
}
