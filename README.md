# SaStays - Real-Time Booking & Property Management System

A comprehensive, production-ready platform for property owners to manage accommodation listings, bookings, payments, and guest interactions with real-time synchronization.

## 📈 Project Progress (as of July 2025)

This project is under active development and implements the majority of the core features described in the Product Functional Description (PFD) v2.0. Below is a summary of what is complete and what remains:

### ✅ Completed

- Core booking system with real-time calendar sync and double-booking prevention
- Basic listing management (create, edit, amenities, house rules, guest requirements)
- Owner dashboard with performance metrics and earnings tracking
- Multi-platform payment integration (Ozow, PayFast, Zapper, SnapScan)
- Guest communication (unified inbox)
- Automated post-stay review requests (email)
- Payout management for owners
- Security, CI/CD, monitoring, and multi-language support

### 🟡 In Progress / Partially Complete

- Custom pricing for specific dates and discounts (weekly/monthly)
- Additional fees (cleaning, extra guests, pets)
- Owner and guest notification system (email/SMS)
- Guest review and rating workflow
- Performance dashboard and analytics

### ⏳ Still To Be Done

- Advanced listing management: co-hosting, multi-property management
- Multi-calendar view for hosts with multiple listings
- External calendar synchronization (e.g., Google Calendar)
- Saved replies, scheduled messages, and photo/video messaging in guest communication
- Full end-to-end testing of all payment providers and QR code flows
- Detailed POPIA compliance audit and documentation
- Advanced analytics, AI-powered pricing, and virtual tours (future roadmap)
- Mobile app (future roadmap)
- Blockchain, IoT, and multi-currency support (future roadmap)

## 🚀 Features

### Core Functionality

- **Listing Management**: Create, edit, and manage property listings with photos, amenities, house rules, and guest requirements
- **Real-Time Bookings**: Instant booking with calendar synchronization and double-booking prevention
- **Multi-Platform Payments**: Integration with South African payment providers (Ozow, PayFast, Zapper, SnapScan)
- **Owner Dashboard**: Performance metrics, earnings tracking, and property management
- **Guest Communication**: Unified inbox for owner-guest messaging
- **Automated Reviews**: Post-stay rating system with automated email requests
- **Payout Management**: Bank account setup for owner payments

### Technical Features

- **Real-time Calendar Sync**: Prevents double bookings across all platforms
- **Dual Notifications**: Email and SMS notifications for owners
- **POPIA Compliance**: Secure customer data management
- **Multi-language Support**: English, Afrikaans, Xhosa, Zulu
- **Responsive Design**: Mobile-first approach
- **Production Ready**: Docker, CI/CD, monitoring, backups

## 🏗️ Architecture

```
Frontend (React + TypeScript)
├── Property Management
├── Booking System
├── Owner Dashboard
├── Guest Communication
└── Payment Integration

Backend (Node.js + Express)
├── RESTful API
├── Real-time Updates
├── Payment Webhooks
├── Email/SMS Services
└── Database Management

Database (PostgreSQL)
├── Properties
├── Bookings
├── Customers
├── Transactions
├── Reviews
├── Messages
└── Payout Methods

Infrastructure
├── Docker & Docker Compose
├── Redis (Caching)
├── Supabase (Auth/Storage)
├── Cloudinary (File Storage)
└── Monitoring (Sentry)
```

## 🛠️ Tech Stack

### Frontend

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Shadcn/ui** for components
- **React Router** for navigation
- **Supabase** for authentication

### Backend

- **Node.js** with Express
- **PostgreSQL** for database
- **Redis** for caching
- **JWT** for authentication
- **Nodemailer** for emails
- **Twilio** for SMS

### Infrastructure

- **Docker** & **Docker Compose**
- **GitHub Actions** for CI/CD
- **Sentry** for monitoring
- **Cloudinary** for file storage

## 📋 Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (or use Docker)
- Redis (or use Docker)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd SaStays-master
```

### 2. Environment Setup

```bash
# Copy environment template
cp server/env.template server/.env

# Edit the .env file with your actual values
nano server/.env
```

### 3. Start with Docker

```bash
# Build and start all services
docker-compose up --build -d

# Check service status
docker-compose ps
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **Database**: localhost:5432
- **Redis**: localhost:6379

## 🔧 Development Setup

### Frontend Development

```bash
cd src
npm install
npm run dev
```

### Backend Development

```bash
cd server
npm install
npm run dev
```

### Database Setup

```bash
# Run the SQL migrations
psql -h localhost -U postgres -d coastal_booking -f server/database.sql
```

## 🧪 Testing

### Run All Tests

```bash
cd server
npm test
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### API Testing

```bash
# Test the health endpoint
curl http://localhost:5001/health
```

## 🚀 Production Deployment

### 1. Prepare Production Environment

```bash
# Copy production environment template
cp server/env.template server/.env.production

# Fill in production values
nano server/.env.production
```

### 2. Deploy with Script

```bash
# Make deployment script executable
chmod +x deploy.sh

# Deploy to production
./deploy.sh production
```

### 3. Manual Deployment

```bash
# Build and start production services
docker-compose -f docker-compose.prod.yml up --build -d

# Check logs
docker-compose logs -f
```

## 🔐 Environment Variables

### Required Variables

See `server/env.template` for all required environment variables:

- **Database**: PostgreSQL connection details
- **Payment Gateways**: Ozow, PayFast, Zapper, SnapScan credentials
- **Communication**: Twilio (SMS), SendGrid (Email) credentials
- **File Storage**: Cloudinary or Supabase Storage
- **Security**: JWT secrets, encryption keys
- **Monitoring**: Sentry DSN, log levels

## 📊 API Documentation

### Authentication

```bash
# Owner login
POST /api/auth/owner/login
{
  "email": "owner@example.com",
  "password": "password"
}
```

### Properties

```bash
# Create property
POST /api/properties
Authorization: Bearer <token>

# Get properties
GET /api/properties

# Update property
PUT /api/properties/:id
```

### Bookings

```bash
# Create booking
POST /api/bookings
{
  "property_id": 1,
  "start_date": "2024-01-01",
  "end_date": "2024-01-05"
}

# Get booked dates
GET /api/properties/:id/booked-dates
```

### Payments

```bash
# Payment webhook (Ozow)
POST /api/webhook/ozow

# Payment webhook (PayFast)
POST /api/webhook/payfast
```

## 🔄 CI/CD Pipeline

The project includes GitHub Actions for:

- **Automated Testing**: Runs on every push/PR
- **Code Quality**: Linting and formatting checks
- **Security Scanning**: Dependency vulnerability checks
- **Deployment**: Automated deployment to staging/production

## 📈 Monitoring & Logging

### Sentry Integration

- Error tracking and performance monitoring
- Real-time alerts for critical issues
- Release tracking and deployment monitoring

### Logging

- Structured logging with different levels
- Request/response logging
- Database query logging
- Payment transaction logging

## 🔒 Security Features

- **Password Hashing**: bcrypt for all passwords
- **JWT Authentication**: Secure token-based auth
- **CORS Protection**: Configured for production domains
- **Rate Limiting**: API request throttling
- **Input Validation**: All user inputs validated
- **SQL Injection Protection**: Parameterized queries
- **XSS Protection**: Content Security Policy headers

## 📱 Mobile Support

- **Responsive Design**: Works on all device sizes
- **PWA Ready**: Progressive Web App capabilities
- **Touch Optimized**: Mobile-friendly interactions
- **Offline Support**: Basic offline functionality

## 🌍 Internationalization

- **Multi-language**: English, Afrikaans, Xhosa, Zulu
- **Currency**: South African Rand (ZAR)
- **Timezone**: South African Standard Time
- **Date Formatting**: Localized date displays

## 🔧 Maintenance

### Database Backups

```bash
# Manual backup
docker-compose exec db pg_dump -U postgres coastal_booking > backup.sql

# Automated backups (configured in cron)
0 2 * * * /path/to/backup-script.sh
```

### Log Rotation

```bash
# Configure logrotate for production logs
sudo nano /etc/logrotate.d/sastays
```

### Health Checks

```bash
# Check service health
curl http://localhost:5001/health

# Monitor with external tools
# - Uptime Robot
# - Pingdom
# - New Relic
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation
- Ensure all tests pass
- Follow semantic commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation

- [API Documentation](./docs/api.md)
- [Deployment Guide](./docs/deployment.md)
- [Troubleshooting](./docs/troubleshooting.md)

### Getting Help

- **Issues**: Create a GitHub issue
- **Discussions**: Use GitHub Discussions
- **Email**: support@yourdomain.com

## 🗺️ Roadmap

### Phase 1 (Current)

- ✅ Core booking system
- ✅ Payment integration
- ✅ Owner dashboard
- ✅ Guest communication

### Phase 2 (Next)

- 🔄 Advanced analytics
- 🔄 Mobile app
- 🔄 AI-powered pricing
- 🔄 Virtual tours

### Phase 3 (Future)

- 📋 Blockchain integration
- 📋 IoT device integration
- 📋 Advanced automation
- 📋 Multi-currency support

---

**Built with ❤️ for the South African hospitality industry**
