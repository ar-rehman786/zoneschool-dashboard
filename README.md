# ZoneSchool Market Intelligence Dashboard

Market Intelligence Agent dashboard for ZoneSchool (Dr. Peter Goldman).  
Built for MBP Marketing by Auto Link.

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
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
GoHighLevel Form → GHL Workflow → N8N Webhook → AI Processing → POST /api/leads → Dashboard
```

## Next Steps

1. **Database**: Add Supabase/Prisma for persistent storage
2. **N8N Integration**: Wire up the webhook to POST /api/leads
3. **Real-time Updates**: Add WebSocket or SSE for live dashboard updates
4. **Authentication**: Add basic auth to protect the dashboard

## Sample Data

The dashboard includes 8 sample leads with realistic ZoneSchool context:
- 4 Hot leads, 3 Warm leads, 1 Cold lead
- Full AI insights (urgency, sentiment, market readiness)
- Market fit language patterns
- Goal distribution and roadblock analysis
