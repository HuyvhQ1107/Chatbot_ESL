# ESL Speak - AI-Powered English Conversation Practice Platform

A comprehensive system helping ESL learners practice English conversation with AI tutors, pronunciation analysis, and personalized learning paths.

## Features

- **Scenario-Based Learning**: Practice in 8+ realistic scenarios (restaurant, job interview, airport, etc.)
- **AI Conversation Partner**: Gemini-powered AI tutor that adapts to your level
- **Voice Recognition**: Real-time speech-to-text using Web Speech API
- **Pronunciation Analysis**: Phoneme-level feedback to improve speaking
- **ZPD Adaptive Learning**: AI adjusts difficulty based on your performance
- **Human-in-the-Loop**: Teachers can review flagged conversations
- **Progress Tracking**: Detailed statistics and mastery levels

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB with Mongoose ODM
- **AI**: Google Gemini API (gemini-2.0-flash)
- **Speech**: Browser Web Speech API

## Project Structure

```
d:\ESL.2\
├── backend/                    # Express API server
│   ├── src/
│   │   ├── config/            # Database & env config
│   │   ├── controllers/       # API controllers
│   │   ├── models/            # Mongoose models
│   │   ├── services/          # Business logic (Gemini, Phoneme, ZPD)
│   │   ├── middleware/        # Auth, error handling, rate limiting
│   │   ├── routes/           # API routes
│   │   └── data/             # Seed data
│   └── package.json
│
├── frontend/                   # Next.js app
│   ├── src/
│   │   ├── app/              # App router pages
│   │   ├── components/        # React components
│   │   ├── hooks/            # Custom hooks
│   │   ├── lib/              # API client
│   │   ├── store/            # Zustand state
│   │   └── types/            # TypeScript types
│   └── package.json
│
├── SPEC.md                     # System specification
└── README.md                   # This file
```

## Setup

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Google Gemini API key

### Backend Setup

```bash
cd backend
npm install
```

Edit `.env` with your MongoDB URI and Gemini API key.

```bash
# Start development server
npm run dev

# Seed the database with scenarios
npm run seed
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

## Demo Accounts

After running `npm run seed`:

| Role | Email | Password |
|------|-------|----------|
| Teacher | teacher@eslspeak.com | teacher123 |
| Admin | admin@eslspeak.com | admin123 |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| GET | /api/scenarios | List scenarios |
| GET | /api/scenarios/recommended | Get recommended scenarios |
| POST | /api/conversations | Start conversation |
| POST | /api/conversations/:id/messages | Send message |
| POST | /api/speech/analyze | Analyze pronunciation |
| GET | /api/progress/dashboard | Get dashboard stats |

## Scenarios Included

1. **At the Restaurant** (Beginner) - Ordering food, making reservations
2. **At the Airport** (Elementary) - Check-in, boarding, directions
3. **Making Friends** (Pre-Intermediate) - Introducing yourself, small talk
4. **Job Interview** (Intermediate) - Common interview questions
5. **Business Meeting** (Upper-Intermediate) - Presenting ideas, negotiations
6. **Academic Discussion** (Advanced) - Debating topics, research
7. **At the Doctor's Office** (Elementary) - Describing symptoms
8. **Shopping for Clothes** (Beginner) - Asking about sizes, prices

## Key Technologies

### ZPD (Zone of Proximal Development)
The system tracks your performance and adjusts the difficulty level dynamically:
- Score > 85%: Move to harder scenarios
- Score 50-85%: Stay at current level
- Score < 50%: Provide scaffolding and easier content

### Phoneme Analysis
The phoneme service analyzes pronunciation at the phoneme level, identifying common problem pairs:
- L vs R (common for Asian speakers)
- V vs W
- TH vs S
- And more...

### Human-in-the-Loop
When pronunciation score is low or user requests it, conversations are flagged for teacher review.

## License

MIT License
