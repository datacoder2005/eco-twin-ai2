# EcoTwin AI 🌱

EcoTwin AI is a complete, production-ready Carbon Footprint Awareness and Reduction Platform. It empowers citizens to track, simulate, and lower their personal carbon footprint through personalized digital twins, gamified active missions, and Gemini AI coaching.

---

## Why EcoTwin AI Is Different (Value Proposition)

> **The Innovation**: Traditional carbon trackers tell users what happened in the past. EcoTwin AI predicts what will happen in the future.
> 
> By utilizing a sustainability digital twin powered by Gemini, users can compare their current trajectory against an optimized future, simulate planetary-scale impact (scaling their actions to 1 million citizens), and receive real-time personalized local action plans.

---

## Architecture Flow Diagram

```
User (Browser / PWA)
 │
 ├── Next.js App Router (Frontend deployed on Vercel)
 │    │
 │    ├── Firebase Authentication (User management)
 │    ├── Firestore Database (Low-latency user states & logs)
 │    ├── Firebase Storage (Receipt image uploads)
 │    └── Firebase Analytics (Feature interactions & tracking)
 │
 └── Cloud Run Backend APIs
      │
      ├── Vertex AI / Gemini 2.5 Pro & Vision (AI Coaching, Vision Parser, Future Twin projections)
      └── Cloud Scheduler (Weekly cron job triggering report aggregation & FCM pushes)
```

---

## Technology Stack

- **Frontend**: Next.js 15 App Router, TypeScript, Tailwind CSS v4, Lucide Icons, Framer Motion
- **Backend & Cloud Infrastructure**: Firebase (Auth, Firestore DB, Storage, Analytics, Cloud Messaging), Cloud Run APIs, Cloud Scheduler
- **AI Models**: Vertex AI Gemini 2.5 Pro (Weekly Reports & Coach), Gemini 2.5 Flash / Vision (Receipt Scanner)

---

## Key Features

1. **User Authentication**: Simple sandbox mock sign-in + Firebase Auth credentials fallback.
2. **Onboarding Wizard**: 6-step interactive habits configuration calculating baseline CO₂ emissions and EcoScore.
3. **Carbon Savings Wallet**: Translates metric carbon saved to Indian Rupees (INR) based on real-world local costs:
   - **Electricity**: ₹8.00 per kWh saved
   - **Fuel**: ₹103.00 per Liter saved (Petrol)
   - **Water**: ₹0.02 per Liter saved (₹20 per kL)
   - **Sustainable Diet Swaps**: ₹150.00 per swap
4. **Carbon Twin ("Future Self Mode")**: Visualizes 12-month projections of the user's actual trajectory vs optimized reductions.
5. **AI Sustainability Coach**: Chatbot with suggested prompt tabs for energy, diet, and travel advice.
6. **Receipt Analyzer**: Upload grocery receipts. Gemini Vision scans items, calculates footprint, and suggests local brand alternatives.
7. **Future Earth Simulator**: Lifestyle sliders demonstrating planetary-scale effects if 1 million citizens adopted the user's plan.
8. **Eco Missions & Community Forest**: Gamification with XP rewards, level badges, and virtual trees added based on community CO₂ offset milestones.

---

## Firestore Database Schemas

- **`users`**: Profile states, current levels, streaks, onboarding configs.
- **`savings`**: Cumulative wallet records (CO₂, electricity, fuel, water saved, INR money saved).
- **`carbon_history`**: Weekly logs of category emission weights.
- **`receipt_analyses`**: Vision receipts metadata.
- **`weekly_reports`**: Markdown-based weekly summaries and delta metrics.
- **`notifications`**: User notifications and FCM read-states.
- **`leaderboard`**: Cached public ranking lists (Block client-side writes).
- **`community_forest`**: Global tree milestone aggregates.

---

## Firestore Index Configurations

Ensure the following composite indexes are deployed for collection groups:
- **`leaderboard`**: `ecoScore` DESC, `co2SavedKg` DESC
- **`carbon_history/{userId}/logs`**: `date` DESC, `ecoScore` DESC
- **`missions`**: `status` ASC, `deadline` DESC

---

## Standard Hackathon Pitch Demo Flow (2–3 Minutes)

1. **Onboarding Integration**: Click "Auto-fill & Launch Demo Account". Answer habits slider step questionnaire to initialize the digital twin and generate a baseline **EcoScore**.
2. **Dashboard Overview**: Review the **Carbon Savings Wallet** showing emissions savings converted directly to **INR (₹)**. Observe the **Carbon Footprint Trend** chart.
3. **Receipt Camera (Gemini Vision)**: Click "Receipt Vision" tab, select a grocery shopping list image. The simulated scanning animation will parse items, display estimated CO₂ footprint, and suggest local alternatives.
4. **Future Earth Simulator**: Open "Simulator" tab. Toggle sliders (like AC power or petrol commutes) and see the visual Globe glow greener as global tree equivalents scale up to 1 million citizens.
5. **Community Forest**: Check the growing tree milestones on the dashboard, representing collective global citizen savings.
6. **Cloud Scheduler Cron**: Click "Run Weekly Report Job" on the dashboard to trigger Cloud Run's Gemini workflow, creating a weekly report notification alert instantly.

---

## Local Setup Instructions

### Prerequisites
- Node.js (v20+ recommended)
- NPM

### Installation
1. Clone this repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.
  
5. Live app : [http://localhost:3000](http://localhost:3000) in your browser.

> **Note on API Keys**: If no `NEXT_PUBLIC_GEMINI_API_KEY` is provided inside `.env`, the platform operates in standalone **Interactive Mock Mode**, allowing judges to test every AI feature out-of-the-box using simulated Gemini outputs.
