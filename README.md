<div align="center">

<img src="https://img.shields.io/badge/-RYDEX-000000?style=for-the-badge" alt="RYDEX"/>

### Book any vehicle. Bikes to heavy trucks. One platform.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![Node](https://img.shields.io/badge/Node-Express-339933?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Realtime-Socket.io-010101?logo=socket.io)](https://socket.io/)
[![Vercel](https://img.shields.io/badge/Live-Vercel-black?logo=vercel)](https://velocity-three-xi.vercel.app)
[![MIT](https://img.shields.io/badge/License-MIT-blue)](#license)

**[Live Demo](https://velocity-three-xi.vercel.app)** &nbsp;·&nbsp; **[Report Bug](#)** &nbsp;·&nbsp; **[Request Feature](#)**

</div>

<br/>

## ✨ What is RYDEX

A multi-vehicle booking platform — Bike, Auto, Car, Loading, Truck — with real customer/partner/admin roles, live tracking, and a partner verification pipeline. Not a toy clone.

<br/>

## 🧱 Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 · React 18 · Tailwind |
| Backend | Node.js · Express · JWT |
| Realtime | Socket.io |
| Database | MongoDB Atlas (geospatial) |
| Deploy | Vercel + persistent Node host |

<br/>

## 🚀 Features

**Customer**
- 5 vehicle classes in one booking flow
- Live route preview — distance + ETA before you confirm
- Clean empty states (`No vehicles found` → `Retry`)
- Booking history

**Partner**
- Guided onboarding
- Video KYC
- Vehicle document review
- Live assigned-rides queue

**Admin**
- Partner counts at a glance — total / approved / pending / rejected
- 3 review queues: partner KYC, video KYC, vehicle docs
- Daily earnings — best day, daily avg, today, week-over-week
- Zero-state clarity: `All caught up!`

<br/>

## 🏗️ Architecture

```
Client (Next.js) ──HTTPS──▶ API (Express + JWT) ──▶ MongoDB Atlas
       │                                              (users, bookings,
       └──WebSocket──▶ Realtime Gateway (Socket.io)    vehicles, KYC)
                              │
                              ▼
                    Matching / Geo Service
                    (2dsphere nearby search)
```

Durable state (bookings, KYC, earnings) → REST + MongoDB.
Ephemeral state (live location, live status, live queue counts) → Socket.io.

<br/>

## 🔒 Partner Verification

```
apply → video KYC → vehicle docs → admin approval → live
```

Three independent gates, not one boolean — identity, vehicle, and admin sign-off can each fail for different reasons.

<br/>

## 📡 Realtime Events

| Event | Scope |
|---|---|
| `booking:status` | `booking:<id>` |
| `partner:location` | `booking:<id>` |
| `booking:new` | nearby partners |
| `admin:queue:update` | admin |

<br/>

## 🗂️ Data Model

```
User      → role: customer | partner | admin
Partner   → kycStatus, kycVideoUrl
Vehicle   → type, location (2dsphere), documents, reviewStatus
Booking   → vehicleType, pickup, drop, distanceKm, etaMinutes, status
Earnings  → partnerId, date, amount
```

<br/>

## 🔌 API

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login

POST   /api/v1/bookings
GET    /api/v1/bookings/mine
PATCH  /api/v1/bookings/:id/status

GET    /api/v1/vehicles/nearby
PATCH  /api/v1/vehicles/:id/review      # admin

POST   /api/v1/partners/apply
POST   /api/v1/partners/kyc-video
PATCH  /api/v1/partners/:id/approve     # admin

GET    /api/v1/admin/dashboard/summary
```

<br/>

## 📁 Structure

```
rydex/
├── apps/
│   ├── web/   → Next.js (customer / partner / admin)
│   └── api/   → Express (controllers, models, sockets, services)
└── packages/shared/
```

<br/>

## ⚡ Quick Start

```bash
git clone https://github.com/<your-org>/rydex.git
cd rydex && npm install --workspaces

cd apps/api && npm run dev      # :4000
cd apps/web && npm run dev      # :3000
```

**`apps/api/.env`**
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
SOCKET_CORS_ORIGIN=http://localhost:3000
MAPS_API_KEY=...
```

**`apps/web/.env.local`**
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

<br/>

## 🧪 Testing

```bash
npm run test        # unit + integration
npm run test:e2e     # end-to-end
```

<br/>

## 🗺️ Roadmap

- [ ] Surge pricing
- [ ] In-app chat
- [ ] Payments
- [ ] OCR-based auto KYC
- [ ] Multi-language

<br/>

## 🤝 Contributing

```bash
git checkout -b feature/your-feature
git commit -m "feat: add live ETA recalculation"
```
Open a PR with a clear description + screenshots for UI changes.

<br/>

## 📄 License

MIT

<br/>

<div align="center">

**Built for the hard parts — trust, geo-matching, real-time state.**

</div>
