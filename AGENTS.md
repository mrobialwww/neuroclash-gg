# AGENTS.md - Development Context for Neuroclash.gg

## 1. PROJECT OVERVIEW

**Neuroclash.gg** is a gamified educational quiz platform combining Quizizz-style accessibility with auto-battler game mechanics (Magic Chess-inspired). Students engage in real-time 1v1 battles where answer speed and accuracy determine damage dealt to opponents' HP.

### Core Innovation

- **AI-Powered Question Generation**: Automatically generates quiz questions from teacher-uploaded PDFs or platform templates using Gemini API
- **Competitive Game Loop**: Solo Mode, 1v1 battles, comeback mechanics (StarBox), and skill cards increase student engagement
- **Real-time Battle System**: Speed-based damage calculation with HP tracking and power-up systems

### Tech Stack

```typescript
Frontend: Next.js 14+ (App Router), TypeScript, React, Tailwind CSS, Zustand
Backend: Supabase (PostgreSQL, Auth, Realtime, Storage)
AI: Gemini API (PDF extraction, JSON question generation)
Real-time: Supabase Realtime / WebSocket
Architecture: Route-Repository-Service (RRS)
```

---

## 2. ARCHITECTURE RULES

### Clean Architecture Layers (Strictly Enforced)

```
┌─────────────────────────────────────────────────────────┐
│ API Routes Layer (/app/api)                             │
│ - HTTP handlers only                                     │
│ - Calls Service layer                                    │
│ - NO direct DB queries                                   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Service Layer (/services)                                │
│ - Business logic                                         │
│ - Score calculation, AI integration, data processing     │
│ - Calls Repository layer                                 │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Repository Layer (/repositories)                         │
│ - Raw database queries only                              │
│ - Supabase client interactions                           │
│ - NO business logic                                      │
└─────────────────────────────────────────────────────────┘
```

### State Management (Zustand Store)

```typescript
// Store Layer (/store)
// - Global state management
// - NO direct API calls (use Service abstractions)
// - TypeScript interfaces required
```

### Component Structure

```typescript
// UI Components (/components)
// - Modular, reusable components
// - 'use client' only for interactive components
// - Server Components by default (Next.js 14)
```

---

## 3. CODING STANDARDS

### TypeScript Standards

```typescript
// ✅ REQUIRED
- Strict mode enabled
- Explicit return types for functions
- Interface/Type definitions for all data structures
- NO 'any' types (use 'unknown' if necessary)

// ✅ EXAMPLE
interface BattleResult {
  winner_id: string;
  damage_dealt: number;
  response_time: number;
  is_correct: boolean;
}

async function calculateDamage(result: BattleResult): Promise<number> {
  // Implementation
}
```

### Component Best Practices

```typescript
// Server Component (default)
export default async function GameRoom({ params }: { params: { id: string } }) {
  const data = await fetchGameRoom(params.id);
  return <div>{/* ... */}</div>;
}

// Client Component (when needed)
("use client");
export function InteractiveBattleCard() {
  const [hp, setHp] = useState(100);
  return <div>{/* ... */}</div>;
}
```

### CSS & Visual Protection

```typescript
// Prevent visual glitches in gameplay components
className="isolate overflow-hidden relative"

// Smooth HP animations (lightweight)
transition-all duration-300 ease-out

// Responsive layouts
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
```

---

## 4. GAME MECHANICS & BUSINESS LOGIC

### Battle Phase Logic

```typescript
// Phase 1: Question Display (10s timer)
// Phase 2: Answer Submission
// Phase 3: Damage Calculation

DAMAGE_RULES:
1. Both Correct → Fastest player deals damage
2. One Correct → Correct player deals damage
3. Both Wrong → Both receive damage
4. Timeout → Player receives damage

BASE_DAMAGE = 20
SPEED_MULTIPLIER = (10 - response_time) / 10
FINAL_DAMAGE = BASE_DAMAGE * SPEED_MULTIPLIER
```

### StarBox Comeback Mechanic

```typescript
// Triggers: Every 5 rounds (round % 5 === 0)
// Priority: Lowest HP player picks first
// Power-ups:
- "Kitab Pengetahuan" (Knowledge Book): +15% damage next 3 rounds
- "Ramuan Penyembuh" (Healing Potion): Restore 30 HP
- "Perisai Kokoh" (Strong Shield): Block 50% damage next 2 rounds
```

### Solo Mode

```typescript
// Bot Configuration
BOT_ID = "prof-bubu";
BOT_NAME = "Prof. Bubu";
BOT_DIFFICULTY = "adaptive"; // Matches player skill level
BOT_RESPONSE_TIME = random(3, 7); // seconds
```

### Statistics Calculation

```typescript
// User Statistics (Updated on game completion)
winrate = (total_rank_1 / total_match) * 100

placement_ratio = Σ(placement / max_players) for each game
average_rank = (placement_ratio / total_match) * 100

// Example:
// Game 1: 5th place out of 10 → 5/10 = 0.5
// Game 2: 6th place out of 10 → 6/10 = 0.6
// placement_ratio = 0.5 + 0.6 = 1.1
```

---

## 5. API ROUTES SPECIFICATION

### Authentication & User Management

#### `GET /api/users/[user_id]`

```typescript
// Retrieves user profile details
Response: {
  user_id: string;
  username: string;
  total_trophy: number;
  coin: number;
  total_match: number;
  total_rank_1: number;
  placement_ratio: number;
  created_at: string;
  updated_at: string;
}
```

---

### Character & Skin System

#### `GET /api/characters?skin_level={level}&user_id={id}`

```typescript
// Get available skins in shop (LEFT JOIN for ownership status)
Query Params:
  - skin_level: 'default' | 'epic' | 'legend'
  - user_id: string

Response: {
  character_id: number;
  name: string;
  skin_level: 'default' | 'epic' | 'legend';
  cost: number;
  image_url: string;
  is_owned: boolean; // from LEFT JOIN
}[]
```

#### `GET /api/user-character/[user_id]`

```typescript
// Get all owned characters (INNER JOIN)
Response: {
  character_id: number;
  name: string;
  skin_level: string;
  is_used: boolean;
  purchased_at: string;
}
[];
```

#### `GET /api/user-character/[user_id]?is_used=true`

```typescript
// Get currently equipped character
Response: {
  character_id: number;
  name: string;
  image_url: string;
  skin_level: string;
}
```

#### `POST /api/user-character`

```typescript
// Purchase skin (Database Transaction: check coin, check base ownership, deduct coin, add record)
Body: {
  user_id: string;
  character_id: number;
  cost: number;
  base_character: string;
  skin_level: 'epic' | 'legend';
}

Business Rules:
1. User must own 'default' version before buying epic/legend
2. User coin must be >= cost
3. Transaction: INSERT user_characters + UPDATE users.coin

Response: {
  success: boolean;
  new_balance: number;
}
```

#### `POST /api/user-character/[user_id]`

```typescript
// Equip character (set is_used = true for selected, false for others)
Body: {
  character_id: number;
}

Response: {
  success: boolean;
  equipped_character_id: number;
}
```

---

### Game Room Management

#### `GET /api/game-rooms?room_visibility={visibility}&room_status={status}`

```typescript
// List public available rooms
Query Params:
  - room_visibility: 'public' | 'private'
  - room_status: 'open' | 'ongoing' | 'finished'

Response: {
  game_room_id: string;
  room_code: string;
  title: string;
  topic_material: string;
  max_player: number;
  current_players: number;
  difficulty: 'mudah' | 'sedang' | 'sulit';
  image_url: string;
  created_by: string;
  created_at: string;
}[]
```

#### `GET /api/game-rooms/[game_room_id]`

```typescript
// Get specific room details
Response: {
  game_room_id: string;
  user_id: string;
  room_code: string;
  topic_material: string;
  title: string;
  max_player: number;
  total_question: number;
  total_round: number;
  difficulty: string;
  image_url: string;
  room_status: 'open' | 'ongoing' | 'finished';
  room_visibility: 'public' | 'private';
  questions: {
    theme_materials: string;
    list_questions: Question[];
  };
  created_at: string;
}
```

#### `GET /api/game-rooms/code/[room_code]`

```typescript
// Join room via 6-digit code
Params: room_code (e.g., "1AGT2025")

Response: Same as GET /api/game-rooms/[game_room_id]
```

#### `POST /api/game-rooms`

```typescript
// Create new game room
Body: {
  user_id: string;
  room_code: string; // 8 chars alphanumeric
  topic_material: string;
  title: string;
  max_player: number; // 15, 20, or 40
  total_question: number; // 15, 20, or 40
  total_round: number;
  difficulty: 'mudah' | 'sedang' | 'sulit';
  image_url: string;
  room_status: 'open';
  room_visibility: 'public' | 'private';
  questions: {
    theme_materials: string;
    list_questions: Question[]; // From AI generation
  };
}

Prerequisites:
1. Call POST /api/quiz (AI generation) first
2. Get questions JSON from AI response
3. Create room with generated questions

Response: {
  game_room_id: string;
  room_code: string;
}
```

#### `PATCH /api/game-rooms/[game_room_id]`

```typescript
// Update room status or visibility
Body: {
  room_status?: 'open' | 'ongoing' | 'finished';
  room_visibility?: 'public' | 'private';
}

Use Cases:
- Host clicks "Start" → room_status = 'ongoing'
- Host clicks "Finish" → room_status = 'finished'
- Host toggles visibility → room_visibility updated
```

---

### Quiz & Gameplay

#### `GET /api/quiz/questions/[game_room_id]?question_order={n}`

```typescript
// Fetch specific question by round order
Query Params:
  - question_order: number (1-based index)

Response: {
  question_id: string;
  game_room_id: string;
  question_text: string;
  question_order: number;
  difficulty_level: number;
  created_at: string;
}
```

#### `GET /api/quiz/questions/answers/[question_id]`

```typescript
// Get 4 answer options for a question
Response: {
  answer_id: string;
  question_id: string;
  answer_text: string;
  is_correct: boolean;
  answer_order: number;
}
[];
```

#### `POST /api/quiz/user-answer`

```typescript
// Record user's answer for a round
Body: {
  user_id: string;
  answer_id: string;
}

Response: {
  user_answer_id: string;
  is_correct: boolean;
  answered_at: string;
}
```

---

### User Game Sessions

#### `POST /api/user-game/join/[game_room_id]`

```typescript
// Register user participation when joining room
Body: {
  user_id: string;
}

Response: {
  user_game_id: string;
  status: "in_progress";
}
```

#### `PATCH /api/user-game/submit/[game_room_id]`

```typescript
// Finalize game results (Database Transaction: update user_games + users)
Body: {
  user_id: string;
  trophy_won: number;
  coins_earned: number;
  placement: number; // 1 = first place, 2 = second, etc.
}

Transaction Logic:
1. UPDATE user_games SET status='completed', trophy_won, coins_earned
2. UPDATE users SET:
   - total_trophy += trophy_won
   - coin += coins_earned
   - total_match += 1
   - total_rank_1 += (placement === 1 ? 1 : 0)
   - placement_ratio += (placement / max_players)

Response: {
  success: boolean;
  updated_stats: UserStats;
}
```

#### `GET /api/user-game/history/[user_id]`

```typescript
// Get user's game history
Response: {
  user_game_id: string;
  game_room_id: string;
  room_title: string;
  topic_material: string;
  trophy_won: number;
  coins_earned: number;
  placement: number;
  status: "completed";
  played_at: string;
}
[];
```

#### `GET /api/user-game/[user_game_id]`

```typescript
// Get detailed game result with answer history
Response: {
  user_game_id: string;
  game_room_id: string;
  trophy_won: number;
  coins_earned: number;
  placement: number;
  questions: {
    question_text: string;
    user_answer: string;
    correct_answer: string;
    is_correct: boolean;
    answered_at: string;
  }
  [];
}
```

#### `GET /api/user-game/participants/[game_room_id]`

```typescript
// Get all participants in a specific room
Response: {
  user_id: string;
  username: string;
  character_name: string;
  character_image: string;
  current_hp: number;
  placement: number | null;
  status: "in_progress" | "completed";
}
[];
```

---

## 6. AI INTEGRATION

### Gemini API Question Generation

```typescript
// Endpoint: POST /api/quiz
// Input: PDF file OR material template

Request:
{
  material_source: 'upload' | 'template';
  pdf_file?: File; // if upload
  template_id?: string; // if template
  total_questions: number; // 15, 20, or 40
  difficulty: 'mudah' | 'sedang' | 'sulit';
}

AI Processing Flow:
1. Extract text from PDF (if upload) or load template
2. Prompt Gemini: "Generate {total_questions} multiple-choice questions..."
3. Parse JSON response with validation
4. Order questions by difficulty (easy → hard)

Response Format:
{
  theme_materials: string;
  list_questions: [
    {
      question_text: string;
      question_order: number;
      difficulty_level: 1 | 2 | 3;
      answers: [
        {
          answer_text: string;
          is_correct: boolean;
          answer_order: number;
        }
      ]
    }
  ]
}
```

---

## 7. REAL-TIME FEATURES (Supabase Realtime)

### WebSocket Channels

```typescript
// Battle Synchronization
supabase
  .channel(`game:${game_room_id}`)
  .on("broadcast", { event: "damage" }, (payload) => {
    // Update HP in real-time
  })
  .on("broadcast", { event: "question_start" }, (payload) => {
    // Sync timer across all clients
  })
  .subscribe();

// Waiting Room Updates
supabase
  .channel(`lobby:${game_room_id}`)
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "user_games",
    },
    (payload) => {
      // Update participant list
    }
  )
  .subscribe();
```

---

## 8. ERROR HANDLING PATTERNS

### API Route Error Responses

```typescript
// Standardized error format
return NextResponse.json(
  {
    error: {
      code: "INSUFFICIENT_COINS",
      message: "Not enough coins to purchase this skin",
      details: { required: 7500, available: 5000 },
    },
  },
  { status: 400 }
);

// Common error codes:
-INSUFFICIENT_COINS -
  BASE_CHARACTER_REQUIRED -
  ROOM_FULL -
  INVALID_ROOM_CODE -
  UNAUTHORIZED -
  RESOURCE_NOT_FOUND;
```

### Transaction Rollback

```typescript
// Always use try-catch for transactions
try {
  await supabase.rpc("purchase_skin_transaction", params);
} catch (error) {
  // Transaction automatically rolled back
  return { success: false, error: error.message };
}
```

---

## 9. PERFORMANCE OPTIMIZATION

### Database Queries

```typescript
// ✅ DO: Select only needed columns
.select('user_id, username, total_trophy')

// ❌ DON'T: Select all columns
.select('*')

// ✅ DO: Use indexes for frequent queries
// Add index on: user_games(user_id), questions(game_room_id, question_order)

// ✅ DO: Paginate large lists
.range(0, 19) // First 20 items
```

### Client-Side Optimization

```typescript
// Lazy load heavy components
const BattleArena = dynamic(() => import("@/components/BattleArena"), {
  loading: () => <LoadingSpinner />,
  ssr: false,
});

// Memoize expensive calculations
const totalDamage = useMemo(
  () => calculateDamage(battleResults),
  [battleResults]
);
```

---

## 10. DEPLOYMENT & ENVIRONMENT

### Environment Variables

```bash
# ⚠️ NEVER commit .env files
# ⚠️ NEVER modify .env in code

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY= # Server-side only
GEMINI_API_KEY= # Server-side only
```

### Build & Deploy Checklist

```bash
# 1. Type check
npm run type-check

# 2. Lint
npm run lint

# 3. Build
npm run build

# 4. Test critical flows
- Room creation → AI generation → Game start
- Battle flow → Damage calculation → Winner determination
- Purchase flow → Transaction rollback on error
```

---

## 11. AGENT INSTRUCTIONS

### When Fixing UI Issues

1. ✅ Check Tailwind responsive classes (`sm:`, `md:`, `lg:`)
2. ✅ Verify `isolate` and `overflow-hidden` on gameplay components
3. ✅ Test hover states and z-index stacking
4. ✅ Ensure animations are GPU-accelerated (`transform`, `opacity`)

### When Fixing Logic Issues

1. ✅ Identify correct layer (Route → Service → Repository)
2. ✅ Add TypeScript types for all function parameters
3. ✅ Use transactions for multi-table updates
4. ✅ Validate input data before processing

### When Integrating APIs

1. ✅ Reference this document for correct endpoints and body structure
2. ✅ Add error handling for all API calls
3. ✅ Use Zustand store for shared state, not prop drilling
4. ✅ Implement loading states and optimistic UI updates

### Forbidden Actions

- ❌ NEVER modify `.env` files
- ❌ NEVER remove documentation comments
- ❌ NEVER write business logic in API routes
- ❌ NEVER use `any` type in TypeScript
- ❌ NEVER query database directly from components

---

## 12. QUICK REFERENCE

### Common File Paths

```
/app/api/                 # API routes
/services/                # Business logic
/repositories/            # Database queries
/store/                   # Zustand stores
/components/              # React components
/lib/                     # Utilities
/types/                   # TypeScript types
```

### Key Database Tables

```
users                     # User profiles & stats
characters                # All available skins
user_characters           # Ownership & equipped status
game_rooms                # Quiz rooms
questions                 # Quiz questions
answers                   # Answer options
user_games                # Game sessions
user_answers              # Answer history
```

### Useful Commands

```bash
npm run dev               # Development server
npm run build             # Production build
npm run type-check        # TypeScript validation
npm run lint              # ESLint check
npx supabase status       # Check DB connection
```

---

**Last Updated:** March 20, 2026
**Project Phase:** Development
**Team:** Tim Ditolak Magang
