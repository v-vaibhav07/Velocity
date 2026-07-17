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
| Auth | NextAuth (Auth.js) · Google OAuth |
| Realtime | Socket.io (standalone server) |
| Video/Voice | ZegoCloud |
| Maps & Geocoding | Geoapify |
| Media Storage | Cloudinary |
| Payments | Razorpay |
| AI | Google Gemini API |
| Email | Nodemailer (Gmail SMTP) |
| Database | MongoDB Atlas (geospatial) |
| Deploy | Vercel (web) + persistent Node host (Socket.io) |

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

```mermaid
flowchart TB
    subgraph Client["🖥️ CLIENT — Next.js 14"]
        C1["Customer App"]
        C2["Partner App"]
        C3["Admin Dashboard"]
    end

    subgraph API["⚙️ API LAYER — Express + JWT"]
        A1["REST Controllers"]
        A2["Role-Based Auth Guards"]
    end

    subgraph RT["🔴 REALTIME GATEWAY — Socket.io"]
        R1["Live Location"]
        R2["Live Booking Status"]
        R3["Live Admin Queues"]
    end

    subgraph GEO["📍 MATCHING / GEO SERVICE"]
        G1["2dsphere Nearby Search"]
        G2["Route + ETA Engine"]
    end

    subgraph DB["🗄️ MongoDB Atlas"]
        D1[("Users")]
        D2[("Bookings")]
        D3[("Vehicles")]
        D4[("KYC Records")]
    end

    Client -- HTTPS --> API
    Client == WebSocket ==> RT
    API --> DB
    API --> GEO
    RT --> GEO
    GEO --> DB

    style Client fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#f8fafc
    style API fill:#1e1b4b,stroke:#818cf8,stroke-width:2px,color:#f8fafc
    style RT fill:#3b0764,stroke:#e879f9,stroke-width:2px,color:#f8fafc
    style GEO fill:#052e16,stroke:#4ade80,stroke-width:2px,color:#f8fafc
    style DB fill:#422006,stroke:#facc15,stroke-width:2px,color:#f8fafc
```

**Durable state** (bookings, KYC, earnings) → REST + MongoDB.
**Ephemeral state** (live location, live status, live queue counts) → Socket.io.

This split is the core design decision: nothing that's only true "right now" ever touches a database write.

<br/>

## 🔒 Partner Verification

```mermaid
flowchart LR
    A["📝 Apply"] --> B["🎥 Video KYC"] --> C["🚗 Vehicle Docs"] --> D["✅ Admin Approval"] --> E["🟢 Live"]

    style A fill:#1e293b,stroke:#94a3b8,color:#f8fafc
    style B fill:#1e293b,stroke:#94a3b8,color:#f8fafc
    style C fill:#1e293b,stroke:#94a3b8,color:#f8fafc
    style D fill:#1e293b,stroke:#94a3b8,color:#f8fafc
    style E fill:#052e16,stroke:#4ade80,color:#f8fafc
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

**`.env` (Next.js app)**
```env
MONGODB_URL="mongodb+srv://<user>:<password>@<cluster>.mongodb.net"
AUTH_SECRET="<generate-with-openssl-rand-base64-32>"

AUTH_GOOGLE_ID="<google-oauth-client-id>"
AUTH_GOOGLE_SECRET="<google-oauth-client-secret>"

EMAIL="<gmail-address>"
PASS="<gmail-app-password>"

CLOUDINARY_CLOUD_NAME="<cloudinary-cloud-name>"
CLOUDINARY_API_KEY="<cloudinary-api-key>"
CLOUDINARY_API_SECRET="<cloudinary-api-secret>"

NEXT_PUBLIC_ZEGO_APP_ID="<zego-app-id>"
NEXT_PUBLIC_ZEGO_SERVER_SECRET="<zego-server-secret>"

NEXT_PUBLIC_SOCKET_SERVER_URL="http://localhost:8000"
NEXT_PUBLIC_GEOAPIFY_API_KEY="<geoapify-api-key>"

RAZORPAY_KEY_ID="<razorpay-key-id>"
RAZORPAY_KEY_SECRET="<razorpay-key-secret>"
NEXT_PUBLIC_RAZORPAY_KEY_ID="<razorpay-key-id>"

GEMINI_API_URL="https://generativelanguage.googleapis.com/v1beta/models/<model>:generateContent?key=<gemini-api-key>"

NEXT_BASE_URL="http://localhost:3000"
```

**`.env` (Socket.io server)**
```env
PORT=8000
MONGODB_URL="mongodb+srv://<user>:<password>@<cluster>.mongodb.net"
```

> ⚠️ **Never commit `.env` files.** Add them to `.gitignore` and use your host's secret manager (Vercel Environment Variables, etc.) in production. If any real credentials were ever pasted into a chat, ticket, or commit — rotate them immediately.

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
