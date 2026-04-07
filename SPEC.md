# ESL Conversation AI Chatbot - System Specification

## 1. Project Overview

### Project Name
**ESL Speak** - AI-Powered English Conversation Practice Platform

### Core Functionality
Một hệ thống chatbot hỗ trợ người học ESL luyện kỹ năng hội thoại tiếng Anh với AI, phân tích phát âm, và phản hồi cá nhân hóa dựa trên ZPD.

### Target Users
- Sinh viên và người đi làm cần cải thiện tiếng Anh giao tiếp
- Người muốn luyện phát âm và ngữ pháp trong ngữ cảnh thực tế

---

## 2. Technical Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Backend | Node.js + Express.js + TypeScript |
| Database | MongoDB (via Mongoose ODM) |
| AI/LLM | Google Gemini API (gemini-2.0-flash) |
| ASR | Browser Web Speech API / Whisper API |
| TTS | Browser Web Speech API / Google TTS |
| Phoneme Analysis | Custom phonetic matching library |
| Auth | JWT + bcrypt |

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │ Scenario │  │ Chat UI  │  │ Voice    │  │ Pronunciation│ │
│  │ Selector │  │          │  │ Recorder │  │ Feedback     │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST API / WebSocket
┌──────────────────────────▼──────────────────────────────────┐
│                      API SERVER LAYER                        │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │ Auth       │  │ Conversation  │  │ Speech Analysis      │ │
│  │ Controller │  │ Controller    │  │ Controller           │ │
│  └────────────┘  └──────────────┘  └──────────────────────┘ │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │ Scenario   │  │ ZPD +        │  │ HITL (Teacher)       │ │
│  │ Controller │  │ Scaffolding  │  │ Controller          │ │
│  └────────────┘  └──────────────┘  └──────────────────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                     AI SERVICE LAYER                         │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │ Gemini     │  │ Phoneme      │  │ ZPD Difficulty       │ │
│  │ Service    │  │ Analyzer      │  │ Adapter              │ │
│  └────────────┘  └──────────────┘  └──────────────────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                      DATA LAYER                              │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │ Users      │  │ Scenarios    │  │ Conversations        │ │
│  └────────────┘  └──────────────┘  └──────────────────────┘ │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │ Speech     │  │ Teacher      │  │ Learning Progress    │ │
│  │ Records    │  │ Reviews      │  │                      │ │
│  └────────────┘  └──────────────┘  └──────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Database Schema (MongoDB)

### 4.1 Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique),
  passwordHash: String,
  name: String,
  role: Enum['student', 'teacher', 'admin'],
  level: Enum['beginner', 'elementary', 'pre-intermediate', 'intermediate', 'upper-intermediate', 'advanced'],
  currentZPD: {
    minLevel: Number,
    maxLevel: Number,
    currentLevel: Number
  },
  targetScenarioIds: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

### 4.2 Scenarios Collection
```javascript
{
  _id: ObjectId,
  title: String,
  titleVietnamese: String,
  description: String,
  descriptionVietnamese: String,
  category: Enum['daily-life', 'travel', 'business', 'academic', 'social'],
  level: Enum['beginner', 'elementary', 'pre-intermediate', 'intermediate', 'upper-intermediate', 'advanced'],
  difficulty: Number (1-10),
  tags: [String],
  role: {  // AI role in this scenario
    name: String,
    personality: String,
    accent: String,
    speakingStyle: String
  },
  prompts: [  // Initial conversation starters
    {
      order: Number,
      text: String,
      context: String
    }
  ],
  vocabulary: [  // Key vocabulary for this scenario
    {
      word: String,
      phonetic: String,
      meaningVietnamese: String,
      example: String
    }
  ],
  grammarPoints: [String],
  expectedPhrases: [String],  // Common phrases learner should use
  flaggablePhrases: [String], // Phrases that need teacher review
  estimatedDuration: Number (minutes),
  isActive: Boolean
}
```

### 4.3 Conversations Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: Users),
  scenarioId: ObjectId (ref: Scenarios),
  messages: [
    {
      id: String,
      role: Enum['user', 'assistant', 'system'],
      content: String,
      audioUrl: String,
      transcription: String,
      pronunciationScore: Number (0-100),
      phoneticAnalysis: {
        phonemes: [{
          phoneme: String,
          expected: String,
          match: Boolean,
          confidence: Number
        }],
        problemPhonemes: [String]
      },
      timestamp: Date
    }
  ],
  status: Enum['active', 'completed', 'flagged', 'reviewed'],
  flaggedForReview: Boolean,
  reviewFlags: [{
    messageId: String,
    reason: String,
    flaggedAt: Date
  }],
  sessionScore: Number (0-100),
  zpdAtTime: {
    minLevel: Number,
    maxLevel: Number,
    currentLevel: Number
  },
  startedAt: Date,
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 4.4 SpeechRecords Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  conversationId: ObjectId,
  messageId: String,
  audioUrl: String,
  transcription: String,
  expectedTranscript: String,
  pronunciationScore: Number (0-100),
  phonemeAnalysis: {
    phonemes: [{
      phoneme: String,
      expected: String,
      actual: String,
      match: Boolean,
      confidence: Number,
      spectrogramUrl: String
    }],
    problemPhonemes: [String],
    suggestions: [String]
  },
  createdAt: Date
}
```

### 4.5 TeacherReviews Collection (HITL)
```javascript
{
  _id: ObjectId,
  conversationId: ObjectId,
  teacherId: ObjectId (ref: Users),
  reviews: [{
    messageId: String,
    originalText: String,
    correctedText: String,
    explanation: String,
    grammarNotes: String,
    pronunciationNotes: String,
    type: Enum['grammar', 'vocabulary', 'pronunciation', 'fluency', 'general'],
    severity: Enum['minor', 'major', 'critical']
  }],
  overallFeedback: String,
  recommendedLevel: String,
  recommendedScenarios: [ObjectId],
  status: Enum['pending', 'in-progress', 'completed'],
  createdAt: Date,
  completedAt: Date
}
```

### 4.6 LearningProgress Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  scenarioId: ObjectId,
  attempts: [{
    attemptNumber: Number,
    score: Number,
    date: Date,
    weakAreas: [String],
    strongAreas: [String]
  }],
  totalAttempts: Number,
  bestScore: Number,
  averageScore: Number,
  weakPhonemes: [{ phoneme: String, count: Number }],
  weakGrammarPoints: [String],
  vocabularyLearned: [{
    word: String,
    timesEncountered: Number,
    correctUsageCount: Number
  }],
  currentStreak: Number,
  longestStreak: Number,
  lastPracticedAt: Date,
  masteryLevel: Number (0-100)
}
```

---

## 5. Core Features & Modules

### 5.1 Scenario-based Learning Module
- **Scenario Library**: Pre-built scenarios categorized by topic/level
- **Dynamic Difficulty**: AI adjusts role difficulty based on learner ZPD
- **Context Memory**: System remembers conversation context across turns
- **Vocabulary Hints**: System provides scaffolded hints using ZPD theory

### 5.2 ZPD & Scaffolding System
- **Level Assessment**: Initial diagnostic test determines user level
- **Dynamic ZPD Calculation**:
  - If user scores > 80% → ZPD moves up (challenging)
  - If user scores < 50% → ZPD moves down (scaffolding)
  - If user scores 50-80% → ZPD stays (optimal learning zone)
- **Scaffolding Types**:
  - Vocabulary hints (show meaning before user speaks)
  - Sentence starters (complete partial sentences)
  - Grammar reminders (subtle corrections)
  - Comprehension checks (AI asks clarifying questions)

### 5.3 Speech Recognition & Analysis
- **ASR Integration**: Browser Web Speech API for real-time transcription
- **Phoneme-level Analysis**:
  - Compare user's phonemes against expected pronunciation
  - Identify problem phonemes (th/v, l/r, etc.)
  - Generate specific correction suggestions
- **Pronunciation Scoring**: 0-100 score based on phoneme accuracy
- **TTS for Native Pronunciation**: AI reads correct answers aloud

### 5.4 Human-in-the-Loop (HITL)
- **Flag System**: Conversations flagged for teacher review when:
  - Pronunciation score < 60%
  - User requests human feedback
  - AI detects repeated errors
- **Teacher Dashboard**: Teachers review flagged conversations
- **Personalized Feedback**: Teachers provide detailed corrections
- **Level Adjustment**: Teachers can recommend level changes

### 5.5 Conversation Engine (Gemini API)
- **System Prompt**: Carefully crafted prompt for ESL tutoring
- **Role Playing**: AI assumes scenario persona
- **Context Management**: Maintains conversation history
- **Error Handling**: Graceful fallback when API unavailable
- **Rate Limiting**: Respect API quotas

---

## 6. API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/me | Get current user |
| PUT | /api/auth/profile | Update profile |

### Scenarios
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/scenarios | List all scenarios |
| GET | /api/scenarios/:id | Get scenario details |
| GET | /api/scenarios/recommended | Get recommended scenarios |

### Conversations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/conversations | Start new conversation |
| GET | /api/conversations | List user's conversations |
| GET | /api/conversations/:id | Get conversation details |
| POST | /api/conversations/:id/messages | Send message |
| POST | /api/conversations/:id/complete | Complete conversation |
| POST | /api/conversations/:id/flag | Flag for review |

### Speech Analysis
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/speech/analyze | Analyze pronunciation |
| GET | /api/speech/history | Get speech history |

### Teacher Reviews (HITL)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/reviews/pending | Get pending reviews |
| POST | /api/reviews/:id | Submit review |
| GET | /api/reviews/history | Get review history |

### Progress
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/progress | Get learning progress |
| GET | /api/progress/:scenarioId | Get scenario progress |
| POST | /api/progress/assess | Submit assessment results |

---

## 7. Frontend Pages

### 7.1 Public Pages
- `/` - Landing page
- `/login` - Login page
- `/register` - Registration page

### 7.2 Student Pages
- `/dashboard` - Student dashboard
- `/scenarios` - Browse scenarios
- `/scenarios/[id]` - Scenario detail
- `/practice/[id]` - Practice session (main chat)
- `/history` - Conversation history
- `/progress` - Learning progress
- `/review/[id]` - View teacher feedback

### 7.3 Teacher Pages
- `/teacher/dashboard` - Teacher dashboard
- `/teacher/reviews` - Pending reviews
- `/teacher/reviews/[id]` - Review detail

---

## 8. Project Structure

```
d:\ESL.2\
├── backend/                    # Node.js/Express backend
│   ├── src/
│   │   ├── config/             # Configuration files
│   │   │   ├── database.ts     # MongoDB connection
│   │   │   └── env.ts          # Environment variables
│   │   ├── controllers/        # Route controllers
│   │   │   ├── auth.controller.ts
│   │   │   ├── scenario.controller.ts
│   │   │   ├── conversation.controller.ts
│   │   │   ├── speech.controller.ts
│   │   │   ├── review.controller.ts
│   │   │   └── progress.controller.ts
│   │   ├── models/             # Mongoose models
│   │   │   ├── User.ts
│   │   │   ├── Scenario.ts
│   │   │   ├── Conversation.ts
│   │   │   ├── SpeechRecord.ts
│   │   │   ├── TeacherReview.ts
│   │   │   └── LearningProgress.ts
│   │   ├── services/           # Business logic
│   │   │   ├── gemini.service.ts
│   │   │   ├── phoneme.service.ts
│   │   │   ├── zpd.service.ts
│   │   │   └── speech.service.ts
│   │   ├── middleware/         # Express middleware
│   │   │   ├── auth.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   └── rateLimit.middleware.ts
│   │   ├── routes/             # API routes
│   │   │   ├── auth.routes.ts
│   │   │   ├── scenario.routes.ts
│   │   │   ├── conversation.routes.ts
│   │   │   ├── speech.routes.ts
│   │   │   ├── review.routes.ts
│   │   │   └── progress.routes.ts
│   │   ├── utils/              # Utility functions
│   │   │   └── helpers.ts
│   │   ├── data/               # Seed data
│   │   │   └── scenarios.data.ts
│   │   └── index.ts            # App entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                    # Next.js frontend
│   ├── src/
│   │   ├── app/                # App router pages
│   │   │   ├── page.tsx        # Landing page
│   │   │   ├── (auth)/
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── register/page.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── scenarios/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── practice/[id]/page.tsx
│   │   │   ├── history/page.tsx
│   │   │   ├── progress/page.tsx
│   │   │   └── teacher/
│   │   │       ├── dashboard/page.tsx
│   │   │       └── reviews/
│   │   │           ├── page.tsx
│   │   │           └── [id]/page.tsx
│   │   │   └── api/            # API client
│   │   │       └── client.ts
│   │   ├── components/         # React components
│   │   │   ├── ui/             # Base UI components
│   │   │   ├── layout/         # Layout components
│   │   │   ├── chat/           # Chat components
│   │   │   ├── voice/          # Voice components
│   │   │   └── scenario/       # Scenario components
│   │   ├── hooks/              # Custom React hooks
│   │   │   ├── useSpeechRecognition.ts
│   │   │   ├── useSpeechSynthesis.ts
│   │   │   └── useConversation.ts
│   │   ├── lib/                # Library utilities
│   │   │   ├── api.ts
│   │   │   ├── auth.ts
│   │   │   └── phonetics.ts
│   │   ├── types/              # TypeScript types
│   │   │   └── index.ts
│   │   └── store/              # State management
│   │       └── conversationStore.ts
│   ├── public/
│   ├── package.json
│   └── tsconfig.json
│
├── SPEC.md                      # This specification
├── README.md                    # Project documentation
└── docker-compose.yml           # Docker setup (optional)
```

---

## 9. Gemini API System Prompt

```system
You are an AI English tutor helping ESL learners practice conversation.
Your role in this scenario is: {scenario.role.name}
Personality: {scenario.role.personality}

Guidelines:
1. Stay in character as the scenario role
2. Use language appropriate to the user's detected level
3. When user makes errors:
   - Minor: Model correct usage naturally in your next response
   - Moderate: Gently provide a subtle correction
   - Major: Offer a clear but kind correction
4. Encourage fluency first, accuracy second
5. Ask follow-up questions to keep conversation going
6. Provide vocabulary hints when user seems stuck (ZPD scaffolding)
7. Keep responses natural, 2-4 sentences normally
8. If user is silent, offer a sentence starter as scaffolding
9. Celebrate small improvements
10. Never be discouraging or overly critical
```

---

## 10. Implementation Phases

### Phase 1: Foundation
- Project setup (backend + frontend scaffolding)
- Database schema and models
- Authentication system
- Basic API structure

### Phase 2: Core Features
- Scenario system with seed data
- Gemini API integration
- Basic chat UI
- Conversation management

### Phase 3: Speech & Pronunciation
- Speech recognition integration
- Phoneme analysis system
- Pronunciation scoring
- TTS for feedback

### Phase 4: Intelligence
- ZPD calculation engine
- Adaptive difficulty
- Scaffolding system
- Progress tracking

### Phase 5: HITL & Polish
- Teacher dashboard
- Review system
- Flagging mechanism
- UI/UX polish

---

## 11. Initial Scenarios (Seed Data)

1. **At the Restaurant** (Beginner) - Ordering food, asking for recommendations
2. **Job Interview** (Intermediate) - Common interview questions
3. **At the Airport** (Elementary) - Check-in, boarding, directions
4. **Making Friends** (Pre-intermediate) - Introducing yourself, small talk
5. **Business Meeting** (Upper-intermediate) - Presenting ideas, negotiations
6. **Academic Discussion** (Advanced) - Debating topics, presenting research

---

## 12. Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/esl_speak
JWT_SECRET=your-super-secret-jwt-key
GEMINI_API_KEY=AIzaSyBLTHJwkSbBsu4anwliB27jJtrlcBb2fyw
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

*Specification Version: 1.0*
*Last Updated: 2026-04-07*
