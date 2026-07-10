# Aurov Reality Portal

React + Vite frontend-only Real Estate Management Portal.

## Current Update

Implemented fully data-driven dashboard analytics and image upload workflow using React Context API + browser Local Storage / IndexedDB simulation.

### Functional Data-Driven Analytics

- Bookings Overview chart reads actual Local Storage data:
  - Demo Bookings
  - Property Reservations
  - Property Purchases
  - Site Visits
- Sales Overview chart reads actual sold properties:
  - Monthly Revenue
  - Total Revenue
  - Sales Count
- Property Status chart reads actual properties:
  - Available
  - Reserved
  - Sold
- Team Progress reads actual assigned tasks:
  - Completed Tasks / Total Assigned Tasks × 100
- Static chart arrays and dummy CRM values are removed from the active app data layer.

### Venture and Property Uploads

- MD / Operational Head can create ventures with local image upload.
- MD / Operational Head can create Plots, Flats, and Villas with local image upload.
- Supported image types: JPG, JPEG, PNG, WEBP.
- Uploaded images are converted to Base64 for frontend simulation and persisted locally.
- Images appear instantly in:
  - Management venture/property pages
  - Customer venture cards
  - Customer venture details
  - Customer property cards
  - Customer property details

### Customer Workflow

- Customer can view newly created ventures and properties.
- Customer can open venture/property details.
- Customer can Book Demo, Contact Us, and Reserve Property.
- Customer actions create Local Storage leads and bookings visible to:
  - Sales Manager
  - Operational Head
  - Managing Director

## Run

```bash
npm install
npm run dev
```

## Build Test

```bash
npm run build
```

Build has been tested successfully.
