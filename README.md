# Online Test Platform

MERN starter project for an online examination/test platform.

## Structure

- `client` - React 19 + Vite + Tailwind CSS frontend
- `server` - Express + MongoDB backend

## Setup

### 1. Install dependencies

```bash
npm install
npm run install-all
```

### 2. Environment variables

Copy:

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

Update the values in both files.

### 3. Run

```bash
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:5000

Authentication currently uses email and password. Institute signups submit an application for superadmin review; administrator roles are provisioned by an operator and cannot be selected during public registration.

The landing page highlights six recent published tests and the six most-used approved institutes. Signed-in learners can review recent results from their dashboard. Administrators have separate student, test-attempt, and recorded-revenue views.
