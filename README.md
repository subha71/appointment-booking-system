# Appointment Booking System

A full-stack web application for booking appointments with available time slots. Built with Ruby on Rails (backend API) and React (frontend).

## Features

- 📅 View available time slots for the week
- ⏰ Book appointments (Monday-Friday, 9:00 AM - 4:30 PM, 30-minute intervals)
- 📋 View all booked appointments
- ❌ Cancel appointments
- 🚫 Prevents double-booking
- 🕐 IST (Indian Standard Time) timezone support
- ✅ Full validation (business hours, no past dates, no weekends)

## Tech Stack

### Backend
- Ruby 3.0.1
- Rails 7.1.6 (API-only mode)
- PostgreSQL (production) / SQLite3 (development)
- Puma web server

### Frontend
- React 19.1.1
- Vite (build tool)
- Axios (HTTP client)
- CSS3

## Project Structure

```
appointment-booking-system/
├── backend/                 # Rails API
│   ├── app/
│   │   ├── controllers/     # API endpoints
│   │   └── models/          # Business logic & validations
│   ├── config/
│   │   ├── database.yml     # Database configuration
│   │   └── routes.rb        # API routes
│   ├── Gemfile              # Ruby dependencies
│   └── Procfile             # Railway deployment config
├── frontend/                # React app
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API client
│   │   └── App.jsx          # Main component
│   ├── package.json         # Node dependencies
│   └── vite.config.js       # Vite configuration
└── build-frontend.sh        # Production build script
```

## Local Development Setup

### Prerequisites

- Ruby 3.0.1
- Node.js 16+ and npm
- SQLite3

### Backend Setup

```bash
cd backend

# Install dependencies
bundle install

# Setup database
rails db:create db:migrate

# Start server on port 3001
rails server -p 3001
```

Backend runs at: http://localhost:3001

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server on port 3000
npm run dev
```

Frontend runs at: http://localhost:3000

## API Endpoints

### Base URL
- Development: `http://localhost:3001/api/v1`
- Production: `https://appointment-booking-system-production-407b.up.railway.app/api/v1`

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/appointments` | Get all appointments |
| GET | `/appointments/available` | Get available time slots |
| POST | `/appointments` | Create new appointment |
| DELETE | `/appointments/:id` | Cancel appointment |

### Example Request

```bash
# Get available slots
curl "http://localhost:3001/api/v1/appointments/available?start_date=2025-01-10&end_date=2025-01-17"

# Create appointment
curl -X POST http://localhost:3001/api/v1/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "appointment": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "date_time": "2025-01-15T10:00:00",
      "reason": "Consultation"
    }
  }'
```

## Business Rules

- **Operating Hours:** Monday-Friday, 9:00 AM - 4:30 PM (IST)
- **Slot Duration:** 30 minutes
- **Time Slots:** 9:00, 9:30, 10:00, ..., 4:00, 4:30
- **Restrictions:**
  - No appointments on weekends
  - No appointments in the past
  - No double-booking (enforced by database constraint)
  - Valid email format required

## Testing

Test the API using the included test script:

```bash
cd backend
bash ../test_api.sh
```

All 13 tests should pass ✅

## Deployment to Railway

### Quick Start

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy on Railway:**
   - Go to [railway.app](https://railway.app)
   - Click "Start a New Project"
   - Choose "Deploy from GitHub repo"
   - Select your repository
   - Add PostgreSQL database
   - Set root directory to `backend`
   - Generate domain

### How Deployment Works

Railway automatically:
1. Installs Ruby gems (`bundle install`)
2. Builds React frontend (`npm run build`)
3. Copies React build to `backend/public/`
4. Runs database migrations (`rails db:migrate`)
5. Starts Rails server

### Architecture

```
Railway Server (Single Domain)
├── Rails Backend
│   ├── /api/v1/* → API responses (JSON)
│   └── /* → React frontend (static files)
└── PostgreSQL Database
```

**Benefits:**
- ✅ No CORS issues (same domain)
- ✅ Single platform to manage
- ✅ Automatic HTTPS
- ✅ Free tier available

### Environment Variables

Railway auto-configures most variables. Required ones:

```
DATABASE_URL=auto_set_by_postgres_service (link via Variable Reference)
SECRET_KEY_BASE=generate_with_rails_secret
PORT=auto_set_by_railway
RAILS_ENV=production (optional, defaults to production)
```

**Setting up environment variables:**
1. Add PostgreSQL database service in Railway
2. In your Rails service, go to Variables tab
3. Click "Variable Reference" to link `DATABASE_URL` from Postgres service
4. Generate `SECRET_KEY_BASE` locally: `bundle exec rails secret`
5. Add `SECRET_KEY_BASE` with the generated value

### Build Process

The `Procfile` defines Railway's deployment steps:

```
web: bundle exec rails db:migrate && bundle exec rails server -p $PORT -e production
```

**Important Notes:**
- Migrations run automatically on each deployment as part of the web process
- React frontend must be pre-built and committed to `backend/public/` folder
- Railway uses Railpack (not nixpacks), so migrations are in the web command

### Testing Production Build Locally

```bash
# Build frontend
cd frontend
npm run build

# Copy to Rails public folder
cd ..
rm -rf backend/public/*
cp -r frontend/dist/* backend/public/

# Run Rails in production mode
cd backend
RAILS_ENV=production bundle exec rails server
```

Visit http://localhost:3000

### Troubleshooting Deployment

**Build fails:**
- Check deployment logs in Railway dashboard
- Verify `RAILS_MASTER_KEY` is set
- Ensure Ruby/Node versions match

**App deploys but doesn't work:**
- Check `DATABASE_URL` is configured
- Verify migrations ran: `railway logs`
- Test API endpoints directly

**Static files not loading:**
- Ensure `public/index.html` exists after build
- Check `config.public_file_server.enabled = true` in `config/environments/production.rb`

### Updating Your App

After making changes:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Railway automatically redeploys!

## Key Configuration Files

### Backend

**database.yml** - Database configuration
```yaml
production:
  adapter: postgresql
  url: <%= ENV['DATABASE_URL'] %>
```

**routes.rb** - Catch-all route for React
```ruby
get '*path', to: 'application#fallback_index_html'
```

**production.rb** - Serve static files and configure hosts
```ruby
config.public_file_server.enabled = true
config.hosts << "appointment-booking-system-production-407b.up.railway.app"
```

**application.rb** - Timezone configuration
```ruby
config.time_zone = "Kolkata"  # IST timezone
```

### Frontend

**api.js** - Environment-aware API URLs
```javascript
// Don't set VITE_API_URL in .env - let this automatic detection work:
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:3001');
```

**.env** - Keep empty for automatic environment detection
```bash
# Don't set VITE_API_URL here - it's auto-detected based on environment
```

## License

This project was created as an interview assessment.

---

**Built with ❤️ using Rails & React**
