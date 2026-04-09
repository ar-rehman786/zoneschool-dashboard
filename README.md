# ZoneSchool Market Intelligence Dashboard

Market Intelligence Agent dashboard for Zone School (Dr. Peter Goldman).
Built for MBP Marketing by Auto Link.

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## Environment Variables

The app requires these environment variables for GoHighLevel integration:

| Variable | Description |
|---|---|
| `GHL_API_KEY` | GoHighLevel API key (Private Integration Token) |
| `GHL_LOCATION_ID` | GHL Location ID |

### Local Development

Create a `.env.local` file in the project root:

```
GHL_API_KEY=your-api-key-here
GHL_LOCATION_ID=your-location-id-here
```

### Vercel Deployment

Add both variables in the Vercel dashboard:

1. Go to your project **Settings** > **Environment Variables**
2. Add `GHL_API_KEY` with your GoHighLevel API key
3. Add `GHL_LOCATION_ID` with your GHL Location ID (e.g. `Y5YU7rItAcB9Uvzfjj5I`)
4. Select all environments (Production, Preview, Development)
5. Redeploy for changes to take effect

```bash
# Or via Vercel CLI
vercel env add GHL_API_KEY
vercel env add GHL_LOCATION_ID
vercel
```

## Project Structure

```
├── app/
│   ├── api/leads/route.ts    # API endpoint for N8N webhook
│   ├── globals.css            # Tailwind + custom styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Main dashboard page
├── components/
│   ├── OverviewPanel.tsx      # Stat cards + summary
│   ├── MarketFitLanguage.tsx  # AI-extracted language patterns
│   ├── UrgencyChart.tsx       # Urgency distribution charts
│   ├── LeadSegments.tsx       # Hot/Warm/Cold lead tabs
│   ├── AllRespondents.tsx     # Full respondent list
│   ├── GoalBreakdown.tsx      # Goal distribution chart
│   └── TopRoadblocks.tsx      # Ranked roadblocks
├── lib/
│   ├── types.ts               # TypeScript interfaces
│   └── sample-data.ts         # Sample data (8 leads)
```

## Architecture

```
GoHighLevel Form → GHL Workflow → N8N Webhook → AI Processing → POST /api/leads → GHL Custom Fields → Dashboard
```

**Database:** GoHighLevel contacts with `zs_*` custom fields. No separate database required.

**POST /api/leads** — Updates GHL contact custom fields (requires `contact_id` in payload)  
**GET /api/leads** — Fetches all GHL contacts with `zs_urgency_level` filled, returns as leads array

## Next Steps

1. **Real-time Updates**: Add WebSocket or SSE for live dashboard updates
2. **Authentication**: Add basic auth to protect the dashboard
