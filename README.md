# Chirpy

A social media API built with TypeScript, featuring user authentication, chirp creation and retrieval, and comprehensive metrics tracking.

## Acknowledgments

This project was developed as part of the Boot.dev backend development journey and was guided throughout the learning process.

## Project Structure

```
src/
├── api/              # API route handlers
│   ├── auth.ts       # Authentication endpoints
│   ├── chirps.ts     # Chirps (posts) endpoints
│   ├── users.ts      # User management endpoints
│   ├── login.ts      # Login endpoint
│   ├── reset.ts      # Password reset endpoint
│   ├── metrics.ts    # Metrics tracking
│   ├── readiness.ts  # Health check endpoint
│   └── middleware.ts # Custom middleware
├── db/               # Database configuration
│   ├── schema.ts     # Database schema definitions
│   ├── queries/      # Database query functions
│   └── migrations/   # Database migrations
├── app/              # Frontend assets
│   ├── index.html
│   └── assets/
├── auth.ts           # Authentication logic
├── config.ts         # Configuration
└── index.ts          # Application entry point
```

## Prerequisites

- Node.js
- PostgreSQL database
- npm or yarn package manager

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env` file (or as needed by your setup)

4. Run database migrations:
   ```bash
   npm run db:migrate
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```
This will build the TypeScript code and start the server. The application will be available at `http://localhost:8080`

### Build Only
```bash
npm run build
```
Compiles TypeScript to JavaScript in the `dist/` directory.

### Start (Production)
```bash
npm run start
```
Runs the compiled JavaScript directly.

## API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/refresh` - Refresh access token
- `POST /api/revoke` - Revoke refresh token

### Chirps
- `GET /api/chirps` - Get all chirps (supports `sort=asc|desc` and `authorId` query parameters)
- `GET /api/chirps/:chirpId` - Get a specific chirp by ID
- `POST /api/chirps` - Create a new chirp
- `DELETE /api/chirps/:chirpId` - Delete a chirp

### Users
- `POST /api/users` - Create a new user
- `PUT /api/users` - Update user profile

### Admin
- `GET /api/healthz` - Health check endpoint
- `GET /admin/metrics` - Application metrics
- `POST /admin/reset` - Reset database

### Webhooks
- `POST /api/polka/webhooks` - Polka webhook for Chirpy Red updates

## Technology Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL with Drizzle ORM
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** Argon2
- **Build Tool:** TypeScript Compiler (tsc)

## Database

The project uses Drizzle ORM for database management with PostgreSQL. Migrations are stored in `src/db/migrations/`.

### Running Migrations
Migrations are automatically applied on application startup.