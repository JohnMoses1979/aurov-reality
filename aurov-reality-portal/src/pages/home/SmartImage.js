import React, { useState } from 'react'

// Renders an Unsplash (or any) image. If it fails to load, falls back to a
// branded gradient so the page never shows a broken image.
export default function SmartImage({ src, alt = '', className = '', gradient, children }) {
  const [failed, setFailed] = useState(false)
  const fallback = gradient || 'linear-gradient(135deg,#01308A,#006D82 60%,#34C31B 140%)'
  if (failed || !src) {
    return (
      <div className={className} style={{ background: fallback }} role="img" aria-label={alt}>
        {children}
      </div>
    )
  }
  return (
    <div className={className} style={{ position: 'relative', overflow: 'hidden' }}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(true)}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
      {children}
    </div>
  )
}
