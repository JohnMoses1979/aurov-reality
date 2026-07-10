import React from 'react';
import logo from '../../assets/aurov-logo.png';

// Brand logo (ported verbatim from the reference site).
export function Logo({ className = 'h-9' }) {
  return <img src={logo} alt="Aurov Reality" className={className} />;
}

// Indian-currency short formatter (₹ Cr / ₹ L), ported from reference components.jsx.
const inr = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export const inrShort = (n) => {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`;
  return inr(n);
};
