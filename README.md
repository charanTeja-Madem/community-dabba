# Community Dabba Service Manager

Community Dabba Service Manager is a full-stack MERN application for managing home-tiffin subscriptions, weekly menus, meal skips, delivery addresses, payments, and admin analytics.

## Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB Atlas
- Auth: JWT
- Styling: Tailwind CSS
- Icons: Lucide React
- Charts: Recharts

## Project Structure

- `backend/` contains the Express API, MongoDB models, controllers, routes, middleware, and utilities.
- `frontend/` contains the React application, shared components, pages, context, and service layer.

## Local Setup

### 1. Backend

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Set these values in `backend/.env`:

- `PORT`
- `MONGODB_URI`
- `JWT_SECRET`
- `NODE_ENV`
- `CLIENT_URL`

### 2. Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Set `VITE_API_URL` in `frontend/.env` to point to your backend API.

## Deployment

### Backend on Render or Railway

- Connect the `backend/` folder as the service root.
- Build command: `npm install`
- Start command: `npm start`
- Add environment variables from `backend/.env.example`.

### Frontend on Vercel

- Connect the `frontend/` folder as the project root.
- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Set `VITE_API_URL` to the deployed backend URL.

## Key API Areas

- Authentication: register, login, profile, password reset
- Customers: dashboard, subscriptions, skip meals, addresses, payments
- Admin: analytics, users, menus, notifications, delivery data

## Notes

- The app uses reusable UI components and protected routes.
- The backend is organized with MVC-style controllers, routes, middleware, and models.
- Sample UI data is included so the frontend feels complete even before connecting live data sources.