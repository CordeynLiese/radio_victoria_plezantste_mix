# Radio Victoria - De Plezantste Mix Voting App

A voting application for Radio Victoria where users can vote on the best mix from a curated list.

## Project Overview

This is a Next.js application that allows voters to:

- Enter their personal information (name, email, city, postal code, country)
- Select their favorite mix from available options
- View voting results (admin only)

The application is built with:

- **Frontend**: Next.js 16, React 19, TypeScript
- **UI Framework**: Material-UI (MUI)
- **Form Validation**: Zod + React Hook Form
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Environment variables configured

### Installation

1. **Install dependencies**

```bash
npm install
```

2. **Configure environment variables**

Create a `.env.local` file in the root directory with:

```env
# Database URL (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/radio_victoria"

# API Authentication
NEXT_PUBLIC_API_SECRET_KEY="your-secret-key"

# Admin results token
ADMIN_RESULTS_TOKEN="your-admin-token"
```

3. **Set up the database**

Initialize and run Prisma migrations:

```bash
# Run migrations
npm run prisma:migrate

# (Optional) Reset database if needed
npm run prisma:reset
```

This will:

- Create all tables (Mix, Vote)
- Apply any pending migrations
- Generate Prisma Client

4. **Populate initial data (Mixes)**

Before users can vote, you need to populate the mixes table. You can either:

**Option A: Use Prisma Studio (GUI)**

```bash
npm run prisma:studio
```

Then create new Mix records with:

- `id`: Unique identifier (auto-generated)
- `artist`: Artist/DJ name (this is the only field you need now)

**Option B: Seed via API**

Use the `/api/populate` endpoint to add mixes (requires API key). This
endpoint no longer accepts a request body: a fixed list of artists is
embedded in the code. Simply send a POST request with an empty body and
the server will insert the hardcoded mix names (skipping duplicates).

You can also use the included npm helper script instead of curling it
manually:

```bash
npm run populate
```

### Development

**Start the development server**

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

## API Endpoints

### Public Endpoints (Require API Key)

- **GET `/api/mix`** - Fetch available mixes
- **POST `/api/vote`** - Submit a vote
- **GET `/api/health`** - Health check

### Admin Endpoints

- **GET `/api/results`** - Get voting results (requires API key + admin token as query parameter)

Example:

```bash
curl -H "x-api-key: your-secret-key" "http://localhost:3000/api/results?token=your-admin-token"
```

## Database Schema

### Mix Model

Represents a mix that can be voted on.

```
- id: String (cuid)
- artist: String
- title: String
- votes: Vote[] (relation)
```

### Vote Model

Represents a single vote from a user.

```
- id: String (cuid)
- email: String (unique)
- emailNormalized: String (unique, for deduplication)
- name: String
- city: String
- zipcode: String
- country: Country enum (BELGIUM | OTHER)
- otherCountry: String (optional)
- mixId: String (foreign key to Mix)
- ipHash: String (for rate limiting)
- createdAt: DateTime (default: now)
```

## Rate Limiting & Validation

- **Per IP**: Maximum 5 votes per IP address
- **Per Email**: One vote per unique email (normalized to handle aliases)
- **Mix Selection**: Required field

## NPM Scripts

```bash
# Development
npm run dev           # Start dev server

# Building & Production
npm run build         # Build for production
npm start             # Start production server

# Linting
npm run lint          # Run ESLint

# Database (Prisma)
npm run prisma:migrate    # Create and apply migrations
npm run prisma:reset      # Reset database (development only)
npm run prisma:studio     # Open Prisma Studio GUI

# Utility
- `npm run populate` – calls the `/api/populate` endpoint using the
   configured `NEXT_PUBLIC_API_SECRET_KEY`. Useful for seeding mixes from the
   command line without writing curl commands.
```

## Common Tasks

### Add a new mix

1. Open Prisma Studio:

   ```bash
   npm run prisma:studio
   ```

2. Click on the Mix model and add a new record

3. Or use the database directly:
   ```sql
   INSERT INTO "Mix" (id, artist)
   VALUES (gen_random_uuid(), 'DJ Name');
   ```

### View voting results

```bash
curl -H "x-api-key: your-secret-key" \
  "http://localhost:3000/api/results?token=your-admin-token"
```

### Clear all votes (dangerous!)

Use Prisma Studio or:

```sql
DELETE FROM "Vote";
```

## Troubleshooting

### Database connection issues

- Check DATABASE_URL is correct
- Ensure PostgreSQL is running
- Verify user has permissions

### Prisma migration issues

If migrations are out of sync:

```bash
# Reset the database (development only!)
npm run prisma:reset

# Or manually check status
npx prisma migrate status
```

### API key errors

- Verify `NEXT_PUBLIC_API_SECRET_KEY` is set in `.env.local`
- Check requests include the header: `x-api-key: your-secret-key`

## Support

For issues or questions about the application, contact the development team.
