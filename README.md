# GCS Calendar Dashboard

A comprehensive web application for visualizing and managing ActiveCampaign deal distribution data for Global Citizen Solutions. The dashboard provides a calendar-style interface organized by deal owners, countries, and programs with real-time metrics and interactive features.

## 🎯 Overview

The GCS Calendar Dashboard transforms ActiveCampaign deal data into an intuitive, scannable calendar view that displays deal distribution across time periods. It features a three-level hierarchy (Owner → Country → Program) with color-coded intensity visualization and comprehensive totals.

## ✨ Key Features

### Data Visualization
- **Calendar Views**: Toggle between Week (last 7 days) and Day (today only) views
- **Three-Level Hierarchy**: Organize deals by Owner → Primary Country → Primary Program
- **Color Intensity**: Visual representation of deal volume (0-5+ deals per cell)
- **Interactive Cells**: Click any cell to view detailed deal information in a modal
- **Real-Time Totals**: Row and column totals with grand total calculation

### Smart Program Classification
- **D7 Visa Splitting**: Automatically splits Portugal's "Passive Income Visa" into:
  - D7 Cold (Eligible Cold)
  - D7 Hot (Eligible Hot)
  - D7 (Unknown eligibility)
- **Program Abbreviations**: 
  - CBD (Citizenship by Descent)
  - CBI (Citizenship by Investment)

### Data Management
- **Automatic Filtering**: Excludes system owner "Global Citizen Solutions Operator"
- **Date-Based Filtering**: Only shows deals with valid distribution times in the selected date range
- **Parallel Processing**: Uses 20 concurrent workers for efficient API data fetching
- **Rate Limiting**: Respects ActiveCampaign API limits (5 requests/second)

### User Experience
- **Sticky Headers**: Main header and date labels remain visible while scrolling
- **Sticky Totals**: Total row and column stay visible for easy reference
- **Loading Progress**: Multi-phase loading indicator with percentage completion
- **Refresh Notifications**: Visual feedback for data refresh operations
- **Password Protection**: Secure access with configurable password

## 🏗️ Architecture

### Tech Stack
- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Date Utilities**: date-fns
- **Deployment**: Vercel (serverless)
- **API Integration**: ActiveCampaign API via Vercel serverless proxy

### Project Structure
```
gcs-calendar-dashboard/
├── api/
│   └── proxy.ts                 # Vercel serverless function for ActiveCampaign API
├── src/
│   ├── components/
│   │   ├── CalendarGrid.tsx     # Main calendar table with totals
│   │   ├── CalendarHeader.tsx   # View toggle and refresh controls
│   │   ├── DealListModal.tsx    # Modal for displaying deal details
│   │   ├── HierarchyRow.tsx     # Individual row rendering (owner/country/program)
│   │   ├── LoadingProgress.tsx  # Multi-phase loading indicator
│   │   ├── Login.tsx            # Password authentication
│   │   └── RefreshNotification.tsx # Toast notifications
│   ├── services/
│   │   └── api.ts               # API client with rate limiting
│   ├── utils/
│   │   ├── dateUtils.ts         # Date parsing and formatting
│   │   └── hierarchyUtils.ts    # Hierarchy building and calculations
│   ├── types.ts                 # TypeScript interfaces
│   ├── App.tsx                  # Main application component
│   ├── main.tsx                 # Application entry point
│   └── index.css                # Global styles and Tailwind config
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── vercel.json                  # Vercel deployment configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- ActiveCampaign account with API access
- Vercel account (for deployment)

### Installation

1. **Clone the repository**
```bash
   git clone <repository-url>
   cd gcs-calendar-dashboard
```

2. **Install dependencies**
```bash
   npm install
```

3. **Set up environment variables**
   
   Create a `.env` file in the project root:
```env
   VITE_API_BASE_URL=https://globalcitizensolutions89584.api-us1.com
   ACTIVECAMPAIGN_API_KEY=your_activecampaign_api_key_here
```

4. **Run development server**
```bash
   npm run dev
```
   
   The app will be available at `http://localhost:5173`

### Building for Production
```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

## 🔧 Configuration

### Application Password
The default password is set in `src/App.tsx`:
```typescript
const APP_PASSWORD = 'Welcome-GCS-Dashboard-2025';
```

### ActiveCampaign Custom Fields
The application uses the following custom field IDs:
- **Field 6**: Eligibility (for D7 Cold/Hot distinction)
- **Field 15**: Distribution Time (primary date field)
- **Field 52**: Primary Program
- **Field 53**: Primary Country

### API Rate Limiting
Configured in `src/services/api.ts`:
```typescript
const RATE_LIMIT = 5;        // requests per second
const WORKER_COUNT = 20;     // parallel workers
```

## 📊 Data Flow

### 1. Authentication
User enters password → Validated against `APP_PASSWORD` → Access granted

### 2. Data Loading (4 Phases)
1. **Metadata Phase**: Fetch all ActiveCampaign users (for owner names)
2. **Deals Phase**: Fetch deals from last 7 days
3. **Custom Fields Phase**: Fetch custom fields for each deal (parallel processing)
4. **Merge Phase**: Combine data and build hierarchy

### 3. Hierarchy Building
```
Raw Deals → Filter by date & owner → Normalize program names → 
Group by Owner → Group by Country → Group by Program → Sort alphabetically
```

### 4. Display
- Flatten hierarchy for rendering
- Calculate totals (row and column)
- Apply color intensity based on deal count
- Render with sticky headers and totals

## 🎨 Visual Design

### Color Scheme
- **Owner Banners**: Blue 600 (`bg-blue-600`)
- **Owner Totals**: Blue 800 (`bg-blue-800`)
- **Country Rows**: Gray 50 (`bg-gray-50`)
- **Program Rows**: White (`bg-white`)
- **Program Totals**: Blue 200 (`bg-blue-200`)
- **Bottom Total Row**: Blue 800 (`bg-blue-800`)
- **Total Column Header**: Blue 800 (`bg-blue-800`)

### Deal Count Color Intensity
| Deals | Background | Text Color |
|-------|-----------|------------|
| 0 | White | Gray 400 |
| 1 | Blue 50 | Gray 900 |
| 2 | Blue 100 | Gray 900 |
| 3 | Blue 200 | Gray 900 |
| 4 | Blue 300 | White (bold) |
| 5+ | Blue 400 | White (bold) |

### Layout
- **Label Column**: 200px fixed width, sticky left
- **Date Columns**: 1fr flexible width
- **Total Column**: 1fr flexible width, sticky right
- **Row Height**: Minimum 48px

## 🔐 Security

### API Key Protection
- API key stored in environment variables
- Never exposed to client-side code
- Proxied through Vercel serverless function

### Password Authentication
- Simple password protection for dashboard access
- Password stored in application code (consider moving to environment variables for production)

## 📈 Performance

### Optimization Strategies
1. **Parallel Processing**: 20 concurrent workers for custom field fetching
2. **Rate Limiting**: Smart throttling to respect API limits
3. **Memoization**: React state management prevents unnecessary re-renders
4. **Lazy Loading**: Components render only visible data
5. **Efficient Filtering**: Date-based filtering happens early in the pipeline

### Typical Load Times
- **Metadata Phase**: 2-3 seconds
- **Deals Phase**: 3-5 seconds
- **Custom Fields Phase**: 20-30 seconds (for ~1000 deals)
- **Total**: 25-40 seconds for full data load

## 🚢 Deployment

### Vercel Deployment

1. **Install Vercel CLI**
```bash
   npm install -g vercel
```

2. **Deploy**
```bash
   vercel
```

3. **Set Environment Variables**
   In Vercel dashboard:
   - `ACTIVECAMPAIGN_API_KEY`: Your ActiveCampaign API key
   - `VITE_API_BASE_URL`: Your ActiveCampaign API base URL

4. **Production Deployment**
```bash
   vercel --prod
```

### Environment Variables in Vercel
Navigate to: Project Settings → Environment Variables

Add:
- `ACTIVECAMPAIGN_API_KEY` (Sensitive)
- `VITE_API_BASE_URL` (Plain Text)

## 🧪 Development

### Running Tests
```bash
npm run test
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

## 📝 API Reference

### Vercel Proxy Endpoint
**URL**: `/api/proxy`

**Method**: GET

**Query Parameters**:
- `endpoint`: ActiveCampaign API endpoint to call

**Example**:
```
/api/proxy?endpoint=/api/3/deals?limit=100
```

**Response**: JSON from ActiveCampaign API

## 🐛 Troubleshooting

### Deals Not Appearing
1. Check that Distribution Time (field 15) is populated
2. Verify deals are within the last 7 days (for week view)
3. Confirm owner is not the excluded system owner
4. Check browser console for API errors

### Slow Loading
1. Reduce `WORKER_COUNT` if hitting rate limits
2. Check network connection
3. Verify ActiveCampaign API is responding
4. Consider caching strategy for frequently accessed data

### Date Parsing Issues
The app handles ISO 8601 format: `2025-10-22T08:03:35+01:00`
If dates aren't parsing, check the `parseDistributionTime` function in `src/utils/dateUtils.ts`

## 📚 Additional Resources

### ActiveCampaign API Documentation
- [API Overview](https://developers.activecampaign.com/reference/overview)
- [Deals API](https://developers.activecampaign.com/reference/deals)
- [Custom Fields](https://developers.activecampaign.com/reference/custom-fields)

### Technologies Used
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [date-fns](https://date-fns.org/docs/Getting-Started)
- [Vercel Documentation](https://vercel.com/docs)

## 👥 Contributing

1. Create a feature branch
```bash
   git checkout -b feature/your-feature-name
```

2. Make your changes and commit
```bash
   git add .
   git commit -m "Feature: Description of your feature"
```

3. Push to remote
```bash
   git push origin feature/your-feature-name
```

4. Create a Pull Request

## 📄 License

© 2025 Global Citizen Solutions - All Rights Reserved

## 🆘 Support

For issues, questions, or feature requests, please contact the development team or create an issue in the repository.

---

**Version**: 1.0.0  
**Last Updated**: October 2025  
**Maintained by**: Global Citizen Solutions CRM Team