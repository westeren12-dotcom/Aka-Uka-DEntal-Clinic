# 🦷 Dental Clinic Telegram Bot + Admin Management System

A production-ready Telegram-based digital receptionist for dental clinics that handles patients, services, pricing, online booking, reminders, doctors, and admin analytics.

## 🏗️ Architecture

```
├── src/
│   ├── bot/           # Telegram Bot (Telegraf)
│   │   ├── commands/   # Bot command handlers
│   │   ├── keyboards/  # Inline keyboard layouts
│   │   └── middlewares/ # Auth & session middleware
│   ├── api/           # Express REST API
│   │   ├── routes/     # API route definitions
│   │   └── middleware/ # Auth, validation middleware
│   ├── services/      # Business logic layer
│   ├── utils/         # Config, Prisma client
│   └── types/         # TypeScript types
├── prisma/            # Database schema & seed
│   └── schema.prisma
├── admin/             # React + Vite Admin Dashboard
│   └── src/
│       ├── pages/      # Dashboard pages
│       ├── components/ # Reusable components
│       └── services/   # API client
└── .env.example
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- A Telegram Bot Token (from [@BotFather](https://t.me/BotFather))

### 1. Clone & Install

```bash
git clone <repo-url>
cd dental-clinic-bot

# Install backend dependencies
npm install

# Install admin dashboard dependencies
cd admin && npm install && cd ..
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your settings:
- `DATABASE_URL` — PostgreSQL connection string
- `BOT_TOKEN` — Telegram bot token
- `ADMIN_TELEGRAM_IDS` — Comma-separated Telegram IDs of admins
- `JWT_SECRET` — Secret key for JWT tokens
- `CLINIC_NAME` — Your clinic name

### 3. Setup Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database with sample data
npm run prisma:seed
```

### 4. Start Development

```bash
# Start bot and API server
npm run dev:bot & npm run dev:api

# In another terminal, start admin dashboard
npm run dev:admin
```

- **API Server**: http://localhost:3001
- **Admin Dashboard**: http://localhost:5173
- **Bot**: Running via Telegraf

### 5. Login to Admin Dashboard

Use the seeded admin account:
- **Telegram ID**: `100000001`
- **Password**: `admin123`

## 📱 Telegram Bot Features

### Patient Commands
- `/start` — Main menu with inline keyboard navigation
- 📅 **Book Appointment** — Full booking flow (service → doctor → date → time → confirm)
- 🦷 **Services** — View all dental services
- 💰 **Prices** — View service pricing
- 👨‍⚕️ **Doctors** — View doctor profiles
- 📋 **My Appointments** — Manage appointments
- 📍 **Location** — Clinic address & Google Maps
- 📞 **Contact Us** — Contact information
- ❓ **FAQ** — AI-powered receptionist

### Admin Commands
- `/today` — Today's appointments
- `/earnings` — Today's revenue breakdown
- `/appointments` — Upcoming appointments
- `/patients` — Patient statistics
- `/doctors` — Doctor schedules
- `/services` — Service management
- `/stats` — Full analytics report
- `/broadcast` — Send announcements to all patients

### Appointment Booking Flow
1. Patient selects service
2. Patient selects doctor (filtered by service)
3. Patient picks a date (only working days shown)
4. Patient picks an available time slot
5. Patient enters name and phone
6. Confirmation summary shown
7. Appointment saved with double-booking protection

### Reminders
- 📬 24 hours before appointment
- 📬 2 hours before appointment
- Patients can confirm, reschedule, or cancel

## 🖥️ Admin Dashboard

### Pages
- **Dashboard** — Overview with stat cards and charts
- **Appointments** — Filter and manage appointments
- **Patients** — Patient list with search
- **Doctors** — CRUD for doctors
- **Services** — Manage services and pricing
- **Analytics** — Revenue and appointment charts
- **Settings** — Clinic info and FAQ management
- **Admin Users** — Role-based access control

### Tech Stack
- React 18 + TypeScript
- Vite for fast builds
- Tailwind CSS for styling
- Recharts for data visualization
- Axios for API calls

## 🔐 Security

- **JWT Authentication** — Secure API access
- **Role-Based Access Control** — OWNER, MANAGER, RECEPTIONIST
- **Telegram Admin Authorization** — Only authorized IDs can use admin commands
- **Password Hashing** — bcryptjs with configurable rounds
- **Input Validation** — Zod schemas for all inputs
- **Rate Limiting** — Express rate limiter
- **Helmet** — HTTP security headers
- **No Secrets in Code** — All secrets via environment variables

## 🗄️ Database Models

| Model | Description |
|-------|-------------|
| Admin | Admin users with roles |
| Patient | Telegram users (patients) |
| Doctor | Clinic doctors with schedules |
| Service | Dental services with pricing |
| Appointment | Patient appointments |
| Payment | Payment tracking |
| Notification | Notification history |
| ClinicSettings | Configurable clinic info |
| FAQ | Frequently asked questions |
| AdminActivityLog | Admin action audit trail |

## 🌐 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Admin login |
| POST | /api/auth/register | Register new admin |
| GET | /api/auth/me | Get current admin |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/dashboard/stats | Dashboard overview |
| GET | /api/dashboard/revenue | Revenue statistics |
| GET | /api/dashboard/weekly-revenue | 7-day revenue chart data |
| GET | /api/dashboard/appointment-stats | Appointment statistics |
| GET | /api/dashboard/patient-stats | Patient statistics |

### Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/appointments | List all (paginated) |
| GET | /api/appointments/today | Today's appointments |
| GET | /api/appointments/upcoming | Upcoming appointments |
| POST | /api/appointments | Create appointment |
| PATCH | /api/appointments/:id/status | Update status |
| PATCH | /api/appointments/:id/reschedule | Reschedule |
| DELETE | /api/appointments/:id | Cancel appointment |

### Doctors
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/doctors | List all doctors |
| POST | /api/doctors | Create doctor |
| PUT | /api/doctors/:id | Update doctor |
| DELETE | /api/doctors/:id | Delete doctor |

### Services
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/services | List all services |
| POST | /api/services | Create service |
| PUT | /api/services/:id | Update service |
| PATCH | /api/services/:id/price | Update price |
| DELETE | /api/services/:id | Delete service |

### Settings & FAQ
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/settings | Get clinic settings |
| PUT | /api/settings | Update settings |
| GET | /api/settings/faqs | List FAQs |
| POST | /api/settings/faqs | Create FAQ |
| PUT | /api/settings/faqs/:id | Update FAQ |
| DELETE | /api/settings/faqs/:id | Delete FAQ |

## 🏭 Production Deployment

### Build
```bash
npm run build
cd admin && npm run build
```

### Environment Variables (Production)
```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/dental_clinic
BOT_TOKEN=your-production-bot-token
JWT_SECRET=use-a-strong-random-secret
```

### Recommended: Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
COPY prisma/ ./prisma/
RUN npx prisma generate
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

## 📋 Development Commands

```bash
# Development
npm run dev           # Start bot + API
npm run dev:bot       # Bot only
npm run dev:api       # API only
npm run dev:admin     # Admin dashboard only

# Database
npm run prisma:generate   # Generate Prisma client
npm run prisma:migrate    # Run migrations
npm run prisma:push       # Push schema to DB
npm run prisma:seed       # Seed database
npm run prisma:studio     # Open Prisma Studio

# Build
npm run build         # Build everything
npm run typecheck     # TypeScript check
npm run lint          # ESLint

# Production
npm start             # Start bot
npm run start:api     # Start API server
```

## 📄 License

MIT
