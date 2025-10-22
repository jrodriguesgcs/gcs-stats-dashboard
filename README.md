# GCS Calendar Dashboard

A calendar view for ActiveCampaign deals showing distribution grouped by Owner → Country → Program hierarchy.

## Features

- **Week View**: Last 7 days (today + 6 days before)
- **Day View**: Today only
- **3-Level Hierarchy**: Deal Owner → Primary Country → Primary Program
- **Deal Placement**: Based on DISTRIBUTION Time (field 15)
- **Read-Only Metrics**: Click deals to view details

## Requirements

### ActiveCampaign Setup

Required custom fields:
- Field 15: DISTRIBUTION Time (format: mm-dd-yyyy hh:mm)
- Field 52: Primary Program of Interest
- Field 53: Primary Country of Interest

### Environment Variables

Create a `.env` file in the root (or set in Vercel):
```
AC_API_URL=https://yourinstance.api-us1.com
AC_API_TOKEN=your_api_token_here
```

## Local Development
```bash
# Install root dependencies
npm install

# Install API dependencies
cd api && npm install && cd ..

# Run development server
npm run dev
```

Visit http://localhost:5173 and login with password: `Welcome-GCS-Dashboard-2025`

## Deployment to Vercel

### Via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

### Via GitHub

1. Push to GitHub
2. Import repository in Vercel dashboard
3. Set environment variables in Vercel project settings:
   - `AC_API_URL`
   - `AC_API_TOKEN`
4. Deploy

## Project Structure
```
├── api/              # Vercel serverless functions
│   └── proxy.ts      # ActiveCampaign API proxy
├── src/
│   ├── components/   # React components
│   ├── services/     # API client
│   ├── utils/        # Date and hierarchy utilities
│   └── types.ts      # TypeScript definitions
└── ...config files
```

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- date-fns
- Vercel Serverless Functions

## License

© 2025 Global Citizen Solutions