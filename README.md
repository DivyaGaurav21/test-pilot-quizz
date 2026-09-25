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

## Google Login

Set your Google OAuth Client ID in:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

and configure the same client ID on the backend.
