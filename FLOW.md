This document is work in progress. Information is probably outdated. Dont't trust, verify.

# Table of Contents

- [Technical](#technical)
- [Features](#features)
- [Flow](#flow)
- [Roadmap](#roadmap)

---

## 🏗️ Technical

### Technology Stack

- Frontend: Next.js 14 (App Router), React 18, TypeScript
- UI: Tailwind CSS, shadcn/ui components
- Storage: IndexedDB (local), localStorage (configuration)
- PWA: Service Worker, Web App Manifest
- Payments: Lightning Network (LUD-16/LUD-21), NFC Web API

### Arquitectura local-first

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │    │   IndexedDB     │    │  Lightning      │
│                 │◄──►│                 │    │  Network        │
│ • Shop          │    │ • Products      │    │                 │
│ • Cart          │    │ • Categories    │    │ • LNURL-pay     │
│ • Payments      │    │ • Cart Items    │    │ • Invoices      │
│ • Settings      │    │ • Settings      │    │ • Verification  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## ✅ Features

### Core PoS

✅ **Product and Category Management**
- Full CRUD with drag & drop for reordering
- Local storage in IndexedDB
- Intuitive editing interface

✅ **Shopping Cart System**
- Add/Remove products
- Modify quantities
- Persistence between sessions

✅ **Payment Processing**
- Automatic Lightning invoice generation
- QR codes for payments
- Payment verification (LUD-21)
- NFC support for Android

### Technical Features

✅ **Complete PWA**
- Installable on mobile devices
- Works offline
- Service Worker for caching

✅ **Lightning Authentication**
- Lightning Address validation
- Operator configuration for tips

✅ **Flexible Configuration**
- Multiple currencies (USD, ARS, EUR)
- Lightning Address configuration
- Local data cleansing

---

## 🔄 Flow

### 1. Onboarding

```
Home → Lightning Address Setup → Dashboard
```

### 2. Store Configuration

```
Dashboard → Shop → Edit → Add Categories → Add Products
```

### 3. Sales Process

```
Shop → Add to Cart → Cart Review → Payment → Success
```

### 4. Management

```
Dashboard → Settings → Currency Configuration
```

---

## 🚀 Roadmap

### Phase 1: Analytics Foundation

* Implement local event system
* Integration with PostHog/Mixpanel (see alternatives)
* Basic metrics dashboard
* Tracking of critical funnels

### Phase 2: Cloud Sync

* Backend API for synchronization
* User account system
* Automatic data backup
* Multi-device synchronization

### Phase 3: Advanced Features

* Advanced sales reports
* NFC support for Android
* Printer integration
* Analysis of best-selling products

### Phase 4: Scale & Growth

* Multiple stores per user
* Collaborators and permissions
* Integrations with other services
* Public API for developers