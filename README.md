<div align="center">

# RYDEX

**A unified booking engine for heterogeneous fleets — bikes to heavy trucks, one state machine.**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Realtime-Socket.io-010101?logo=socket.io)](https://socket.io/)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel)](https://velocity-three-xi.vercel.app)
[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](#license)

[Live](https://velocity-three-xi.vercel.app) · [Issues](#) · [Architecture](#the-architecture-in-theory)

</div>

---

> Most booking platforms are built as if they only ever have to solve one problem: match A to B. RYDEX is built around the assumption that the interesting problems start *after* that match — verifying who's allowed to drive, deciding what "nearby" means for a truck versus a bike, and making sure the system's idea of reality never drifts from the driver's.

## Table of Contents

- [The Problem, Stated Properly](#the-problem-stated-properly)
- [The Architecture, in Theory](#the-architecture-in-theory)
- [Tech Stack](#tech-stack)
- [The Trust Problem: Partner Verification](#the-trust-problem-partner-verification)
- [The Matching Problem: Geo Search](#the-matching-problem-geo-search)
- [The Consistency Problem: Real-Time State](#the-consistency-problem-real-time-state)
- [Data Model](#data-model)
- [API Surface](#api-surface)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Testing Philosophy](#testing-philosophy)
- [Deployment](#deployment)
- [Where This Breaks at Scale](#where-this-breaks-at-scale)
- [Security Model](#security-model)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## The Problem, Stated Properly

A ride-hailing app and a freight-booking app look like different products, but they're actually the same problem wearing different clothes: **given a location, a destination, and a class of vehicle, find available supply, price the trip, and hold both sides accountable until it's done.** The mistake most clones make is treating "vehicle type" as a cosmetic filter — a dropdown — instead of what it actually is: a parameter that changes the shape of almost everything downstream. A bike search radius is 2km; a truck search radius might reasonably be 50km. A bike doesn't need a loading dock; a truck booking might. Cramming five fleet categories into one flow only works if the abstraction underneath is genuinely general, not five special cases glued together.

RYDEX is built on that premise: **one booking state machine, parameterized by vehicle class**, rather than five parallel flows that happen to share a UI shell. The vehicle selector you see on the landing page (Bike, Auto, Car, Loading, Truck) isn't five separate products — it's five configurations of the same pipeline: *select class → verify contact → resolve route → match supply → confirm.*

The second thing most clones skip is **trust**. Anyone can build a form that says "become a driver." Almost nobody builds the part where that claim gets checked before the driver is allowed to show up in a customer's search results. RYDEX treats partner onboarding as a pipeline with state, not a toggle — because a marketplace's core liability isn't bad code, it's an unverified stranger arriving at someone's pickup location.

## The Architecture, in Theory

The architectural decision that shapes everything else in this codebase is a distinction between two categories of state that most tutorials collapse into one: **durable state** and **ephemeral state.**

Durable state is anything that must survive a server restart and be queryable historically — a booking record, a KYC decision, an earnings ledger entry. This belongs in MongoDB, behind a REST API, because durability and query flexibility are exactly what a document database with an HTTP interface is good at.

Ephemeral state is anything that's only true *right now* — a driver's current GPS coordinate, whether a booking request is still "searching," how many items are sitting in an admin's review queue at this exact second. Writing this to a database on every update and having clients poll for it is the single most common performance mistake in systems like this: it turns a real-time problem into a database-throughput problem. RYDEX routes ephemeral state through Socket.io instead, so a driver's location update is a message, not a write-then-read round trip.

```
┌───────────────────────┐        ┌──────────────────────────┐        ┌───────────────────────┐
│   Client (Next.js)     │ HTTPS  │   API Layer (Express)      │  TCP   │   MongoDB Atlas         │
│  customer · partner ·  │◄──────►│  REST controllers          │◄──────►│  durable state:         │
│  admin surfaces         │        │  JWT auth + role guards    │        │  users, bookings,       │
└───────────┬─────────────┘        └────────────┬────────────────┘        │  vehicles, KYC records │
            │                                     │                        └────────────────────────┘
            │ WebSocket                            │
            ▼                                     ▼
┌───────────────────────┐        ┌──────────────────────────┐
│  Realtime Gateway        │◄──────►│  Matching / Geo Service    │
│  ephemeral state:        │        │  nearby-vehicle search     │
│  location, live status,  │        │  route + ETA computation   │
│  live queue counts        │        │  candidate ranking         │
└───────────────────────┘        └──────────────────────────┘
```

The consequence of this split is that the REST API can stay simple and cacheable, while the real-time layer can stay lean — it never has to know how to persist anything, only how to fan a message out to the right room.

## Tech Stack

**Frontend — Next.js 14 (App Router), React 18, Tailwind CSS.** The App Router's server-component model lets the marketing/landing surface render statically while the authenticated dashboards (customer, partner, admin) hydrate as client components — no reason to pay a client-side JS cost for a page that's mostly a hero and a CTA.

**Backend — Node.js + Express, JWT auth, Socket.io.** Express rather than a heavier framework because the domain logic here — matching, verification workflows, role guards — benefits more from explicit, readable middleware chains than from convention-heavy abstraction.

**Data — MongoDB via Mongoose, with `2dsphere` geospatial indexing.** A document model fits a domain where "vehicle" means five structurally different things depending on class, and where the KYC/verification schema is still evolving — a rigid relational schema would fight the product at this stage more than it would protect it.

**Infra — Vercel for the frontend, a persistent Node host for the Socket.io process, MongoDB Atlas for storage.** Serverless functions are the wrong runtime for a long-lived WebSocket connection, so the real-time gateway deliberately lives outside Vercel's serverless boundary.

## The Trust Problem: Partner Verification

Every marketplace has a cold-start trust problem on the supply side, and the naive solution — let anyone sign up and start driving — is the one that eventually shows up in the news. RYDEX models partner onboarding as a **state machine with three independent gates**, not one:

```
apply → identity KYC (video) → vehicle document review → admin approval → live
```

The reason these are three separate gates instead of one "verified" boolean is that they fail independently and for different reasons. A person can be who they say they are and still be driving an unregistered vehicle. A vehicle can be legitimate while its owner's identity documents don't match. Collapsing this into a single flag either over-trusts (approve on partial evidence) or under-trusts (block a legitimate partner because one unrelated field is pending). The admin dashboard's `Pending Partner Reviews` / `Pending Video KYC` / `Pending Vehicle Reviews` queues exist because they are genuinely different reviews performed by different criteria — surfacing them separately is a correctness decision, not just a UI choice.

The other deliberate detail here: an empty queue renders as **"All caught up!"** rather than a blank page. In an operational dashboard, "no data" and "system is broken" must never look the same — an admin who can't distinguish "nothing pending" from "the pending-items API silently failed" will eventually stop trusting the dashboard, which defeats its purpose.

## The Matching Problem: Geo Search

"Find nearby vehicles" sounds trivial until you have to define *nearby*. RYDEX resolves this with a MongoDB `2dsphere` index and `$nearSphere` queries rather than pulling every vehicle into memory and computing Haversine distance in application code — the difference is an index-backed query versus a full collection scan, and it's the difference between a system that degrades gracefully as fleet size grows and one that doesn't.

Just as important is what happens when the search comes back empty. A lot of booking flows treat "no drivers found" as an edge case to be hidden behind an infinite spinner. RYDEX treats it as a **first-class state** — the UI explicitly renders "Vehicles Not Found" with a plain-language explanation and a `Retry Search` action, because a user who doesn't know whether to wait, retry, or give up will abandon the flow regardless of what the backend is actually doing.

## The Consistency Problem: Real-Time State

The hardest bug class in any system with a real-time layer isn't a crash — it's *drift*: the client's idea of a booking's status quietly diverging from the server's idea, with no error thrown anywhere. RYDEX avoids optimistic client-side status updates for anything that matters (booking state transitions) and instead treats the server as the single source of truth, pushed via scoped Socket.io rooms:

| Event | Direction | Room scope |
|---|---|---|
| `booking:status` | server → customer | `booking:<id>` |
| `partner:location` | partner → server → customer | `booking:<id>` |
| `booking:new` | server → nearby partners | `geo:<cell>` |
| `admin:queue:update` | server → admin | `admin:global` |

Scoping by room rather than broadcasting globally matters for a reason beyond bandwidth: it means the system's real-time cost scales with *active bookings*, not with *total connected users* — a platform with ten thousand idle connections and fifty live bookings should cost roughly the same to run as one with fifty connections and fifty live bookings.

## Data Model

```
User
 ├─ _id, name, phone, role: customer | partner | admin
 └─ passwordHash, createdAt

Partner (extends User)
 ├─ kycStatus: pending | in_review | approved | rejected
 ├─ kycVideoUrl
 └─ approvalHistory: [{ status, reviewedBy, reviewedAt }]

Vehicle
 ├─ _id, partnerId, type: bike | auto | car | loading | truck
 ├─ location: { type: "Point", coordinates: [lng, lat] }   # 2dsphere-indexed
 ├─ documents: [{ type, url, verified }]
 └─ reviewStatus: pending | approved | rejected

Booking
 ├─ _id, customerId, partnerId (null until matched)
 ├─ vehicleType, pickup { address, lat, lng }, drop { address, lat, lng }
 ├─ distanceKm, etaMinutes
 └─ status: searching | no_vehicles | assigned | in_progress | completed | cancelled

Earnings
 ├─ partnerId, date, amount
 └─ aggregation: daily | weekly
```

## API Surface

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
GET    /api/v1/auth/me

POST   /api/v1/bookings
GET    /api/v1/bookings/:id
GET    /api/v1/bookings/mine            # role-scoped: customer vs partner
PATCH  /api/v1/bookings/:id/status

GET    /api/v1/vehicles/nearby          # ?lat=&lng=&type=
POST   /api/v1/vehicles
PATCH  /api/v1/vehicles/:id/review      # admin only

POST   /api/v1/partners/apply
POST   /api/v1/partners/kyc-video
PATCH  /api/v1/partners/:id/approve     # admin only
PATCH  /api/v1/partners/:id/reject      # admin only

GET    /api/v1/admin/dashboard/summary
GET    /api/v1/admin/earnings/daily
```

Authorization is enforced by decoding the role claim from the JWT on every protected route, server-side, on every request — never inferred from what a client chooses to render. A customer token hitting an admin route gets a `403`; it never sees a filtered response, because a filtered response implies the server trusted the client's framing of the request in the first place.

## Project Structure

```
rydex/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── app/
│   │   │   ├── (customer)/     # book, search, bookings
│   │   │   ├── (partner)/      # onboarding, kyc, bookings
│   │   │   └── (admin)/        # dashboard, reviews, earnings
│   │   └── components/
│   └── api/                    # Express backend
│       ├── src/
│       │   ├── controllers/
│       │   ├── models/
│       │   ├── middleware/     # auth, role guards
│       │   ├── sockets/
│       │   └── services/       # matching, geo, kyc
│       └── tests/
├── packages/
│   └── shared/                 # types/constants shared across web & api
└── docker-compose.yml
```

## Getting Started

```bash
git clone https://github.com/<your-org>/rydex.git
cd rydex
npm install --workspaces

# backend
cd apps/api && npm run dev

# frontend (separate terminal)
cd apps/web && npm run dev
```

Frontend at `http://localhost:3000`, API at `http://localhost:4000`.

## Environment Variables

`apps/api/.env`
```env
PORT=4000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/rydex
JWT_SECRET=your_jwt_secret
SOCKET_CORS_ORIGIN=http://localhost:3000
CLOUD_STORAGE_BUCKET=rydex-kyc-uploads
MAPS_API_KEY=your_maps_provider_key
```

`apps/web/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
NEXT_PUBLIC_MAPS_API_KEY=your_maps_provider_key
```

## Testing Philosophy

Unit tests target the parts of the system where a wrong answer is expensive and non-obvious — matching logic, geo queries, role-guard middleware, KYC state transitions. UI components are tested for the states that are easy to forget: empty (`No bookings yet`), zero-result (`Vehicles Not Found`), and error, not just the happy path with data already populated.

```bash
cd apps/api && npm run test        # unit + integration
cd apps/web && npm run test        # component tests
npm run test:e2e                   # end-to-end
```

## Deployment

- **Frontend** — Vercel: [velocity-three-xi.vercel.app](https://velocity-three-xi.vercel.app)
- **API + Socket.io** — a persistent Node host (Render/Railway/EC2); WebSocket connections need a process that stays alive, which rules out Vercel's serverless functions for this piece specifically
- **Database** — MongoDB Atlas, with a `2dsphere` index on `vehicle.location`

## Where This Breaks at Scale

Being upfront about the current ceiling is more useful than pretending there isn't one. The admin dashboard's earnings and pending-count aggregates are computed live; that's fine at current partner volume and becomes the first thing to cache or pre-aggregate once partner count grows past what a live query can serve inside a reasonable dashboard-load budget. Geo search currently ranks candidates by raw distance — the honest next step is factoring in driver acceptance rate and idle time, which is a ranking problem, not just a proximity one. Both are known, deliberate deferrals, not blind spots discovered later.

## Security Model

- Role claims live in the JWT and are re-validated server-side on every request — the client's UI state is never treated as an authorization signal.
- KYC video and vehicle documents sit behind signed, time-limited URLs in access-controlled storage, not public buckets.
- `/auth/*` and `/bookings` are rate-limited to blunt credential-stuffing and booking-spam abuse.
- Request bodies are validated at the API boundary before touching a model, so a malformed coordinate or an unrecognized vehicle type never reaches the database layer.

## Roadmap

- [ ] Dynamic/surge pricing as a function of local demand-to-supply ratio
- [ ] In-app customer↔partner chat
- [ ] Payment gateway integration
- [ ] Automated document verification (OCR-based) to reduce manual KYC review load
- [ ] Multi-language support
- [ ] Automated partner payout scheduling

## Contributing

1. Fork the repo
2. `git checkout -b feature/your-feature`
3. Commit using conventional commits — `feat: add live ETA recalculation on reroute`
4. Open a PR describing the *why*, not just the *what*; include screenshots for UI changes

## License

MIT — see `LICENSE`.

---

<div align="center">
The features are the easy 80%. The trust pipeline, the geo-matching, and the real-time consistency model are the 20% that's actually the product.
</div>
