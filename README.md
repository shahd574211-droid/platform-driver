# Driver Recruitment Platform

A professional driver recruitment and management system built with Next.js 16, Prisma 7, and PostgreSQL.

## Features

- **Dashboard**: View and manage driver candidates with real-time data
- **Status Filtering**: Filter candidates by status (Pending, Completed, Rejected, Call Back)
- **Search & Filter**: Search by phone number and filter by city
- **Candidate Management**: View candidate details, media, and update status
- **Call Feedback Tracking**: Log call attempts and notes
- **Agent Tracking**: Track which agent is currently viewing a candidate
- **Auto-Refresh**: Data automatically refreshes every 30 seconds
- **WhatsApp Integration**: Webhook API for receiving candidate data from WhatsApp Bot

## Tech Stack

- **Framework**: Next.js 16 (App Router) with Server Actions
- **Database**: PostgreSQL with Prisma 7.3.0 ORM
- **Authentication**: JWT-based Bearer Token security
- **UI Library**: Shadcn/ui with Ant Design-inspired styling
- **Data Fetching**: TanStack Query with auto-refetch
- **Validation**: Zod for input validation
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:
```bash
cd platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your database connection string:
```
DATABASE_URL="postgresql://username:password@localhost:5432/driver_recruitment?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
```

4. Generate Prisma client and push schema:
```bash
npm run db:generate
npm run db:push
```

5. Seed the database with demo data:
```bash
npm run db:seed
```

6. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Credentials

- **Admin**: admin@example.com / password123
- **Agent**: agent@example.com / password123

## API Routes

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Candidates
- `GET /api/candidates` - List candidates with pagination and filters
- `GET /api/candidates/:id` - Get candidate details
- `PATCH /api/candidates/:id` - Update candidate status

### Feedbacks
- `POST /api/feedbacks` - Create call feedback

### Webhook
- `POST /api/webhook/whatsapp` - Receive candidate data from WhatsApp Bot

## WhatsApp Webhook Integration

Send POST requests to `/api/webhook/whatsapp` with Bearer token authentication:

```bash
curl -X POST http://localhost:3000/api/webhook/whatsapp \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "whatsapp_phone_number": "+964123456789",
    "city_name": "Baghdad",
    "nid_front_url": "https://example.com/nid-front.jpg",
    "nid_back_url": "https://example.com/nid-back.jpg",
    "driver_license_url": "https://example.com/license.jpg",
    "selfie_url": "https://example.com/selfie.jpg",
    "verification_video_url": "https://example.com/video.mp4",
    "car_status": "Has Own Car",
    "car_model": "Toyota Corolla",
    "car_year": "2020"
  }'
```

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes
│   ├── dashboard/     # Dashboard page
│   ├── login/         # Login page
│   ├── register/      # Register page
│   ├── 403/           # Access denied page
│   ├── globals.css    # Global styles
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Home page (redirects)
├── components/
│   ├── dashboard/     # Dashboard components
│   ├── layout/        # Layout components
│   └── ui/            # UI components (Shadcn)
├── hooks/             # Custom React hooks
├── lib/               # Utility functions
│   ├── auth.ts        # Authentication utilities
│   ├── prisma.ts      # Prisma client
│   ├── utils.ts       # Helper functions
│   └── validations.ts # Zod schemas
├── services/          # Database services
│   ├── candidate.service.ts
│   └── feedback.service.ts
└── middleware.ts      # Auth middleware
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with demo data

## License

MIT
