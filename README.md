# MortgageOS 🏦

The modern, secure Operating System for digital lending. A full-stack Next.js application managing the end-to-end mortgage lifecycle from borrower application to underwriter decision.

## 🚀 Features

### 1. 🏡 Borrower Portal
- **Application Wizard:** Step-by-step intake form (Purchase vs. Refinance).
- **Dynamic Forms:** JSON-driven inputs for Income, Assets, and Property.
- **Document Hub:** Drag-and-drop PDF upload with progress tracking.
- **Real-time Status:** Live timeline showing application progress (Processing -> Underwriting -> Clear to Close).

### 2. 💼 Lender Workbench
- **Pipeline Dashboard:** Kanban-style view of active loans.
- **Smart Workbench:** Risk Engine automatically calculates DTI (Debt-to-Income) ratios.
- **PDF Generator:** One-click generation of the official 1003 Loan Summary.
- **Internal Notes:** Private communication channel for underwriting teams.

### 3. 🛡️ Admin & Security
- **RBAC:** Strict Role-Based Access Control (Borrower, Lender, Super Admin).
- **Audit Trails:** Immutable logs of every login, status change, and file upload.
- **Compliance:** Middleware-enforced route protection.

## 🛠️ Tech Stack
- **Framework:** Next.js (Pages Router)
- **Database:** SQLite (Dev) / PostgreSQL (Prod) via Prisma ORM
- **Styling:** Tailwind CSS + Lucide Icons
- **Auth:** HttpOnly Cookies + JWT (Iron Session)
- **Validation:** Zod Schemas
- **Utils:** SWR (Data Fetching), jsPDF (PDF Gen), React Hot Toast

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm install