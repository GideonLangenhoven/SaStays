# SaStays Backend (Node.js/Express)

## Features

- Real-time property listing, booking, and calendar sync
- Multi-provider payments (Ozow, PayFast, Zapper, SnapScan)
- Owner dashboard, reviews, guest messaging, payout management
- Automated post-stay review requests

## Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose

### Setup

1. Copy `.env.example` to `.env` and fill in your secrets.
2. Build and run with Docker Compose:
   ```
   docker-compose up --build
   ```
3. The backend will be available at `http://localhost:5001`.

### Running Tests

```sh
cd server
npm test
```

### Deployment

- Use Docker Compose or deploy to your preferred cloud provider.
- Set all secrets as environment variables in production.

## API Reference

- See `routes.js` for all endpoints.

## Environment Variables

See `.env.example` for all required variables.

## Contributing

- PRs welcome! Please add tests for new features.

## License

MIT
