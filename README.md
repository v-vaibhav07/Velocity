<div align="center">

# 🚗 RYDEX

### Smart Multi-Vehicle Booking Platform

**One platform. Every vehicle. Bikes to heavy transport trucks.**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Realtime-Socket.io-010101?logo=socket.io)](https://socket.io/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel)](https://velocity-three-xi.vercel.app)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](#license)

[Live Demo](https://velocity-three-xi.vercel.app) · [Report Bug](#) · [Request Feature](#)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Why RYDEX](#why-rydex)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Core Features](#core-features)
- [Data Model](#data-model)
- [API Design](#api-design)
- [Real-Time Layer](#real-time-layer)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [Deployment](#deployment)
- [Performance & Scaling Notes](#performance--scaling-notes)
- [Security Considerations](#security-considerations)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**RYDEX** is a full-stack, multi-tenant vehicle booking platform that unifies five distinct transport categories — **Bike, Auto, Car, Loading, and Truck** — into a single booking pipeline. It supports three first-class user roles (**Customer**, **Partner/Driver**, **Admin**), each with a dedicated dashboard, and models the operational complexity of a real logistics marketplace: partner onboarding with video KYC, vehicle verification, live route computation, dynamic vehicle availability, and earnings analytics.

The system is designed the way a real ride-hailing/logistics backend would need to be — not as a CRUD demo, but around the actual hard problems: **geospatial matching, real-time state propagation, multi-role authorization, and a verification pipeline that gates supply-side trust before a partner can accept jobs.**

## Why RYDEX

Most "Uber clone" side projects stop at booking a single vehicle type between two points. RYDEX intentionally goes further:

| Problem | How RYDEX addresses it |
|---|---|
| Heterogeneous fleet (2-wheeler → heavy truck) in one flow | Single booking state machine parameterized by vehicle class, not five separate flows |
| Trust on the supply side | Partner approval pipeline: application → video KYC → vehicle document review → admin sign-off |
| "No vehicles found" is a real state, not an error | Explicit empty-state UX (`Vehicles Not Found`) instead of silent failure, with `Retry Search` |
| Admin needs signal, not noise | Dashboard surfaces only actionable queues (`Pending Partner Reviews`, `Pending Video KYC`, `Pending Vehicle Reviews`) with live counts |
| Long-haul vs local rides behave differently | Route engine returns distance + ETA up front (e.g. 262.8 km / ~631 min) so pricing/assignment logic can branch on trip class |

## System Architecture

```
┌──────────────────────┐        ┌──────────────────────────┐        ┌──────────────────────┐
│   Client (Next.js)    │ HTTPS  │   API Layer (Express)     │  TCP   │   MongoDB Atlas        │
│  - Customer web app   │◄──────►│  - REST controllers       │◄──────►│  - Users               │
│  - Partner web app    │        │  - Auth middleware (JWT)  │        │  - Bookings            │
│  - Admin dashboard    │        │  - Role-based guards       │        │  - Vehicles            │
└──────────┬────────────┘        └────────────┬──────────────┘        │  - Partners / KYC docs │
           │                                    │                      └───────────────────────┘
           │ WebSocket (Socket.io)               │
           ▼                                    ▼
┌──────────────────────┐        ┌──────────────────────────┐
│  Realtime Gateway      │◄──────►│  Matching / Geo Service   │
│  - Live driver location│        │  - Nearby vehicle search  │
│  - Booking status push │        │  - Route/ETA computation  │
│  - Admin queue updates │        │  - Distance-based ranking │
└──────────────────────┘        └──────────────────────────┘
```

**Design principle:** the REST API owns durable state (bookings, KYC, approvals); Socket.io owns *ephemeral, high-frequency* state (live location, status transitions, admin badge counts) so the database isn't hammered with write-heavy polling.

## Tech Stack

**Frontend**
- Next.js 14 (App Router) — SSR for the marketing/landing page, CSR for authenticated dashboards
- React 18, Tailwind CSS for the design system
- Client-side map rendering for pickup/drop route visualization

**Backend**
- Node.js + Express — REST API, versioned under `/api/v1`
- Socket.io — real-time booking status, live partner location, admin dashboard badges
- JWT-based authentication with role claims (`customer`, `partner`, `admin`)
- Multer / cloud storage integration for KYC video and vehicle document uploads

**Data**
- MongoDB (Mongoose ODM) — flexible schema for heterogeneous vehicle types and evolving KYC workflows
- Geospatial indexes (`2dsphere`) for nearby-vehicle queries

**Infra**
- Deployed on Vercel (frontend + serverless API routes) / Render or Railway for the persistent Socket.io process
- MongoDB Atlas for managed data storage

> Swap any of the above for your actual choices — this section is written to be the "trust me, I know what I'm doing" section recruiters skim first, so keep it accurate.

## Core Features

### Customer
- **Unified vehicle selector** — Bike, Auto, Car, Loading, Truck in one screen with clear use-case labels ("Quick & affordable", "Heavy transport")
- **Structured booking flow** — vehicle → mobile verification → route → confirmation, with step progress indicator
- **Live route preview** — pickup/drop rendered on a map with computed distance and ETA before confirming
- **Graceful empty states** — explicit "Vehicles Not Found" state with retry, instead of a spinner that never resolves
- **Booking history** — persisted booking list with status filters

### Partner (Driver)
- **Guided onboarding** — become-a-partner flow gated behind KYC
- **Video KYC submission** — asynchronous review queue, not instant/fake approval
- **Vehicle document review** — separate pipeline from identity KYC
- **My Bookings** — assigned-ride queue, scoped strictly to the authenticated partner

### Admin
- **Command-center dashboard** — total / approved / pending / rejected partner counts at a glance
- **Actionable queues, not logs** — `Pending Partner Reviews`, `Pending Video KYC`, `Pending Vehicle Reviews`, each with live badge counts
- **Earnings analytics** — daily earnings trend, best day, daily average, today's total, week-over-week delta
- **Zero-state handling** — "All caught up!" state so admins can trust an empty queue actually means nothing is pending, not that data failed to load

## Data Model

```
User
 ├─ _id, name, phone, role: [customer | partner | admin]
 ├─ authProvider, passwordHash
 └─ createdAt

Partner (extends User)
 ├─ kycStatus: [pending | in_review | approved | rejected]
 ├─ kycVideoUrl
 ├─ vehicles: [Vehicle]
 └─ approvalHistory: [{ status, reviewedBy, reviewedAt }]

Vehicle
 ├─ _id, partnerId, type: [bike | auto | car | loading | truck]
 ├─ documents: [{ type, url, verified }]
 └─ reviewStatus: [pending | approved | rejected]

Booking
 ├─ _id, customerId, partnerId (nullable until matched)
 ├─ vehicleType, pickup: { address, lat, lng }, drop: { address, lat, lng }
 ├─ distanceKm, etaMinutes
 ├─ status: [searching | no_vehicles | assigned | in_progress | completed | cancelled]
 └─ createdAt, updatedAt

Earnings
 ├─ partnerId (or platform-level for admin view)
 ├─ date, amount
 └─ aggregation: [daily | weekly]
```

## API Design

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
GET    /api/v1/auth/me

POST   /api/v1/bookings                # create booking request
GET    /api/v1/bookings/:id
GET    /api/v1/bookings/mine           # role-aware: customer vs partner scope
PATCH  /api/v1/bookings/:id/status

GET    /api/v1/vehicles/nearby         # geo query, ?lat=&lng=&type=
POST   /api/v1/vehicles                # partner registers a vehicle
PATCH  /api/v1/vehicles/:id/review     # admin only

POST   /api/v1/partners/apply
POST   /api/v1/partners/kyc-video
PATCH  /api/v1/partners/:id/approve    # admin only
PATCH  /api/v1/partners/:id/reject     # admin only

GET    /api/v1/admin/dashboard/summary # partner counts, pending queues
GET    /api/v1/admin/earnings/daily
```

All partner/admin routes are protected by role-based middleware — a customer JWT hitting `/admin/*` returns `403`, not a filtered response. Authorization is enforced server-side, never inferred from what the UI hides.

## Real-Time Layer

Socket.io channels are scoped per-role to avoid broadcast noise:

| Event | Direction | Payload |
|---|---|---|
| `booking:status` | server → customer | `{ bookingId, status, partnerLocation? }` |
| `partner:location` | partner → server → customer | `{ bookingId, lat, lng }` |
| `admin:queue:update` | server → admin | `{ pendingPartners, pendingKyc, pendingVehicles }` |
| `booking:new` | server → nearby partners | `{ bookingId, pickup, vehicleType }` |

Admin dashboard badge counts and the "All caught up!" state are driven by `admin:queue:update` rather than polling, so the queue reflects reality within a socket round-trip instead of a fixed refresh interval.

## Project Structure

```
rydex/
├── apps/
│   ├── web/                  # Next.js frontend
│   │   ├── app/
│   │   │   ├── (customer)/book, /search, /bookings
│   │   │   ├── (partner)/onboarding, /kyc, /bookings
│   │   │   └── (admin)/dashboard
│   │   └── components/
│   └── api/                  # Express backend
│       ├── src/
│       │   ├── controllers/
│       │   ├── models/
│       │   ├── middleware/   # auth, role guards
│       │   ├── sockets/
│       │   └── services/     # matching, geo, kyc
│       └── tests/
├── packages/
│   └── shared/                # shared types/constants between web & api
└── docker-compose.yml
```

## Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB (local or Atlas connection string)
- npm or pnpm

### Installation

```bash
git clone https://github.com/<your-org>/rydex.git
cd rydex

# install dependencies for both apps
npm install --workspaces

# run backend
cd apps/api && npm run dev

# run frontend (separate terminal)
cd apps/web && npm run dev
```

App will be available at `http://localhost:3000`, API at `http://localhost:4000`.

## Environment Variables

Create `.env` in `apps/api`:

```env
PORT=4000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/rydex
JWT_SECRET=your_jwt_secret
SOCKET_CORS_ORIGIN=http://localhost:3000
CLOUD_STORAGE_BUCKET=rydex-kyc-uploads
MAPS_API_KEY=your_maps_provider_key
```

Create `.env.local` in `apps/web`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
NEXT_PUBLIC_MAPS_API_KEY=your_maps_provider_key
```

## Testing

```bash
# unit + integration tests (API)
cd apps/api && npm run test

# component tests (web)
cd apps/web && npm run test

# e2e (Playwright/Cypress)
npm run test:e2e
```

## Deployment

- **Frontend:** deployed on Vercel — [velocity-three-xi.vercel.app](https://velocity-three-xi.vercel.app)
- **API + Socket.io:** deployed to a long-running Node host (Render/Railway/EC2) since Vercel's serverless functions aren't suited to persistent WebSocket connections
- **Database:** MongoDB Atlas, provisioned with a `2dsphere` index on `vehicle.location` for geo queries

## Performance & Scaling Notes

- Nearby-vehicle search uses MongoDB geospatial indexes (`$nearSphere`) rather than in-memory distance calculation, keeping the query O(log n) against the index instead of scanning the full vehicle collection.
- Booking status changes are pushed via Socket.io rooms scoped to `booking:<id>`, not global broadcast, so connected-client count doesn't degrade message latency as the platform grows.
- Admin dashboard aggregates (earnings, pending counts) are candidates for a materialized/cached read model if partner volume grows past what live aggregation can serve within budget — noted here as a deliberate future optimization, not an oversight.

## Security Considerations

- Role claims are embedded in the JWT and re-validated server-side on every protected route — the client never self-reports its role.
- KYC video and vehicle documents are stored in access-controlled cloud storage with signed, time-limited URLs, not public buckets.
- Rate limiting on `/auth/*` and `/bookings` to mitigate brute-force and booking-spam abuse.
- Input validation at the API boundary (e.g. `zod`/`joi`) so malformed geo-coordinates or vehicle types can't reach the database layer.

## Roadmap

- [ ] Dynamic pricing engine (surge pricing by demand/vehicle-type)
- [ ] In-app chat between customer and partner
- [ ] Payment gateway integration
- [ ] Automated (non-manual) KYC checks via document OCR
- [ ] Multi-language support
- [ ] Partner earnings payout automation

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit with conventional commits: `feat: add live driver ETA recalculation`
4. Open a PR with a clear description of the change and screenshots for UI changes

## License

Distributed under the MIT License. See `LICENSE` for details.

---

<div align="center">
Built with a focus on the parts that are actually hard: trust, geo-matching, and real-time state — not just CRUD.
</div>
