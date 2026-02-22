# APIFORGE Frontend

Next.js 16 frontend for the APIFORGE application with React 19 and Tailwind CSS for internship assignment.

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm or yarn
- Backend API running on `http://localhost:8000`

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/mrigangha/apiforge_frontend.git
cd apiforge_frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure the API URL

Open `lib/store.js` and make sure the backend URL is correct:

```js
export const BACKEND_API = "http://localhost:8000";
```

### 4. Start the development server

```bash
npm run dev
```

The app will be available at **http://localhost:3000**

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Pages

| Route | File | Description |
|-------|------|-------------|
| `/login` | `app/login/page.jsx` | User login |
| `/register` | `app/register/page.jsx` | User registration |
| `/profile` | `app/profile/page.jsx` | User profile + token refresh |
| `/dashboard` | `app/dashboard/page.jsx` | Post management (CRUD) |
| `/posts/new` | `app/posts/new/page.jsx` | Create new post |
| `/admin/dashboard` | `app/admin/dashboard/page.jsx` | Admin panel (admin role only) |

## Authentication Flow

The app uses JWT access tokens + httpOnly refresh token cookies:

1. **Login** → receives `access_token` (stored in memory) + `refresh_token` (httpOnly cookie set by backend)
2. **Page load** → `/profile` attempts to refresh the access token using the cookie
3. **Protected pages** → redirect to `/profile?redirect=/original-page` if no token
4. **Profile** → silently refreshes token, then redirects back to original page
5. **Admin pages** → redirect non-admin users 

---

## Auth Context

Access token is stored in React context (in-memory only, cleared on page refresh):

```js
import { useAuth } from "../lib/AuthContext";

const { accessToken, setAccessToken } = useAuth();
```

---

## Environment

If you want to use environment variables instead of hardcoding the API URL:

Create a `.env.local` file:

```env
NEXT_PUBLIC_BACKEND_API=http://localhost:8000
```

Then update `lib/store.js`:

```js
export const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;
```

---

## Tech Stack

| Tech | Version |
|------|---------|
| Next.js | 16.1.6 |
| React | 19.2.3 |
| Tailwind CSS | 4.x |
| TypeScript | 5.x |
