<div align="center">

# RYDEX
### Enterprise-Grade Multi-Role Smart Mobility Platform

<img src="./public/logo.png" width="150"/>

### Building the Future of Intelligent Vehicle Booking

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)]
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)]
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)]
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)]
[![NodeJS](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)]
[![Socket.IO](https://img.shields.io/badge/WebSocket-Socket.IO-black)]
[![License](https://img.shields.io/badge/license-MIT-blue)]

Live Demo • Documentation • API • Architecture

</div>

---

# Overview

RYDEX is a full-stack intelligent transportation platform designed to support
real-world ride booking, commercial logistics, fleet management, KYC verification,
role-based administration, partner onboarding, and scalable dispatching.

Unlike traditional CRUD-based booking systems, RYDEX is designed around
production software engineering principles including modular architecture,
role isolation, asynchronous workflows, secure authentication,
and scalable backend services.

The platform supports multiple transportation categories including

- Bike
- Auto
- Car
- Loading Vehicles
- Trucks

with a unified booking pipeline.

---

# Why this project?

Most college projects stop at authentication and CRUD.

RYDEX focuses on solving actual engineering problems:

- Multi-role authentication
- Enterprise access control
- Route computation
- Live location handling
- Vehicle discovery
- Partner verification workflow
- Admin moderation
- Booking lifecycle management
- Modular backend APIs
- Production deployment

This project is intentionally built to resemble how large-scale transportation
platforms like Uber, Ola and Rapido organize their systems.

---

# Core Features

## User

- JWT Authentication
- Secure Login
- Vehicle Booking
- Pickup & Drop Selection
- Route Visualization
- Booking History
- Booking Status Tracking
- Responsive UI
- Protected Routes

---

## Partner

Drivers can register as partners.

Features include

- Profile Management
- Vehicle Registration
- Document Upload
- Video KYC
- Verification Status
- Ride Acceptance
- Ride Completion

---

## Admin Dashboard

The admin system provides centralized moderation.

### Partner Review

- Approve Partners
- Reject Partners
- View Submitted Documents
- Review Vehicle Information

### Video KYC

- Pending Queue
- Review Workflow
- Approve / Reject

### Vehicle Review

- Verify Documents
- Validate Registration
- Fleet Management

### Analytics

- Daily Earnings
- Weekly Earnings
- Pending Reviews
- Approved Partners
- Rejected Partners

---

# System Architecture

```
                       Client
                          │
               Next.js App Router
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
     Middleware      Authentication     Route Guards
        │                 │                 │
        └────────────── API Layer ──────────┘
                          │
                 Express REST Services
                          │
       ┌──────────────────┼──────────────────┐
       │                  │                  │
 Authentication      Booking Engine     Admin APIs
       │                  │                  │
       └──────────────────┼──────────────────┘
                          │
                     MongoDB Atlas
```

---

# High-Level Design

```
User
 │
 │
 ▼

Authentication

 │

 ▼

Booking Service

 │

 ▼

Route Engine

 │

 ▼

Nearby Vehicle Discovery

 │

 ▼

Booking Allocation

 │

 ▼

Driver Acceptance

 │

 ▼

Trip Completion
```

---

# Authentication Flow

```
Client

↓

Login Request

↓

Password Hash Verification

↓

JWT Generation

↓

HTTP Only Token

↓

Protected APIs

↓

Role Verification

↓

Requested Resource
```

---

# Booking Lifecycle

```
Idle

↓

Vehicle Selected

↓

Pickup Added

↓

Destination Added

↓

Fare Generated

↓

Booking Created

↓

Searching Driver

↓

Driver Accepted

↓

Ride Started

↓

Ride Completed
```

---

# Folder Structure

```
src/

│

├── app/

│     ├── admin/
│     ├── api/
│     ├── user/
│     ├── partner/
│     ├── auth/

│

├── components/

│     ├── booking/
│     ├── dashboard/
│     ├── maps/
│     ├── ui/

│

├── hooks/

├── lib/

├── services/

├── middleware/

├── models/

├── types/

└── utils/
```

---

# Technology Stack

## Frontend

- Next.js 16
- React 19
- TypeScript
- TailwindCSS
- Framer Motion
- Lucide Icons

---

## Backend

- Node.js
- Express
- REST APIs
- JWT Authentication
- Bcrypt
- Middleware-based Validation

---

## Database

MongoDB Atlas

Collections include

```
Users
Partners
Vehicles
Bookings
Payments
Notifications
VideoKYC
Reviews
Sessions
```

---

# Security

✔ Password Hashing

✔ JWT Authentication

✔ Route Protection

✔ Middleware Authorization

✔ Role Based Access Control

✔ Input Validation

✔ Secure API Design

✔ Environment Variables

✔ Server-side Authentication

---

# Scalability Considerations

The project is designed so individual services can later be separated into
microservices without major refactoring.

Possible decomposition:

```
Authentication Service

Booking Service

Notification Service

Partner Service

Admin Service

Payment Service

Maps Service
```

---

# Performance Optimizations

- Lazy Loading
- Dynamic Imports
- Optimized API Calls
- Component Memoization
- Route Caching
- Modular Components
- Reusable Hooks
- Server Components
- Client Components Separation

---

# Engineering Decisions

Instead of storing everything inside a single controller,
the project separates responsibilities into

- Services
- Middleware
- Components
- APIs
- Models
- Utilities

This keeps the codebase maintainable,
testable,
and extensible.

---

# Future Roadmap

- Live Driver Tracking
- AI Route Optimization
- Dynamic Surge Pricing
- Wallet Integration
- Stripe Payments
- UPI Integration
- Ride Scheduling
- Fleet Analytics
- WebSockets
- Push Notifications
- Driver Heat Maps
- Recommendation Engine
- AI Fraud Detection

---

# Screenshots

## Landing Page

- Modern responsive landing page
- Vehicle categories
- Authentication

## Booking

- Vehicle selection
- Pickup / Drop
- Route preview

## Route Search

- Interactive Maps
- Distance Calculation
- Ride Discovery

## Dashboard

- Partner Analytics
- Earnings
- Reviews

## Admin Panel

- Partner Verification
- Video KYC
- Fleet Review

---

# Local Setup

```bash
git clone https://github.com/yourusername/rydex.git

cd rydex

npm install

npm run dev
```

---

# Environment Variables

```
MONGODB_URI=

JWT_SECRET=

NEXT_PUBLIC_MAP_API_KEY=

NEXTAUTH_SECRET=

NEXTAUTH_URL=
```

---

# Lessons Learned

Building RYDEX required solving problems involving

- authentication
- authorization
- modular architecture
- API design
- reusable React components
- scalable backend organization
- production deployment
- asynchronous workflows
- secure state management

The project evolved significantly from a simple booking interface into an enterprise-style transportation platform.

---

# Repository Statistics

```
Frontend
    ↓

80+ React Components

↓

30+ API Routes

↓

Multiple User Roles

↓

Authentication

↓

Admin Dashboard

↓

Booking Engine

↓

Partner Verification

↓

Vehicle Management
```

---

# Inspiration

Uber

Rapido

Ola

Bolt

Lyft

---

# Author

**Vaibhav Yadav**

B.Tech Computer Science

Indian Institute of Technology Patna

GitHub: https://github.com/v-vaibhav07

LinkedIn: *(Add your profile)*

---

# If you found this project interesting

⭐ Star the repository

🍴 Fork it

🚀 Build upon it

Contributions are welcome.

---
