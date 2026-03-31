# NeuroClash GG 🎮📚

**NeuroClash GG** is a web-based, gamified educational quiz platform that combines the accessibility of modern quiz applications with the competitive mechanics of an auto-battler game (like Magic Chess). Created by **Team Ditolak Magang**, it serves as an exciting, engaging learning experience and a practical tool for students to evaluate their knowledge playfully.

---

## 🎯 Executive Summary

The platform's core innovation lies in utilizing AI to automatically generate questions from user-uploaded materials or available templates. To boost student engagement, it introduces a competitive game loop complete with Solo and Multiplayer modes, Real-time 1v1 Battles, HP systems, Damage calculation, and Comeback mechanics (StarBox).

## ✨ Key Features

- **Arena & Material Customization**: Hosts can choose default system materials (e.g., "Basic Programming") or upload their own PDF documents. They can customize room parameters such as the maximum number of players (15, 20, 40) and the number of questions.
- **AI Question Generator**: Automatically processes selected PDFs or templates using the Gemini API to generate structured multiple-choice questions (JSON format), complete with answer keys and difficulty levels.
- **Versatile Game Modes**:
  - **Multiplayer Mode (1v1 / 1v1v1)**: Real-time matchmaking against other students.
  - **Solo Mode**: Play offline or practice independently against our adaptive system bot, *Prof. Bubu*.
- **Live Dashboard & Account System**: Features a real-time leaderboard tracking remaining HP and a 2D Avatar selection screen before matches.
- **Interactive Battle Phase**: Speed and accuracy matter! The fastest player to answer correctly deals damage to opponents. Answer incorrectly, and you receive damage.
- **StarBox (Comeback Mechanic)**: Appears at specific intervals (e.g., every 5 rounds). The player with the lowest HP gets priority to pick powerful game-changing items like the *Knowledge Book*, *Healing Potion*, or *Strong Shield*.

## 🏗️ Architecture

NeuroClash GG strictly adheres to the **Route-Repository-Service (RRS)** Clean Architecture pattern to ensure maintainability, testability, and separation of concerns.

- **API Routes Layer (`/app/api`)**: HTTP request handlers. Strictly no direct DB queries are executed here.
- **Service Layer (`/services`)**: Core business logic, score/damage calculation, AI integration, and data processing.
- **Repository Layer (`/repositories`)**: Abstracted database interactions and raw queries utilizing the Supabase client.
- **State Layer (`/store`)**: Client-side Zustand stores handling session data and real-time UI states.

## 🛠️ Tech Stack

Built with a high-performance modern ecosystem ensuring smooth gameplay and real-time synchronization:

- **Frontend**: Next.js 14+ (App Router), TypeScript, React.js
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Backend & Database**: Supabase (PostgreSQL, Auth, Storage), Node.js (Route-Repository-Service architecture)
- **Real-time Engine**: Supabase Realtime / WebSockets (for timer synchronization and 1v1 damage)
- **AI Integration**: Google Gemini API (PDF extraction and JSON-based question generation)

## 🚀 Installation & Usage

Follow these steps to set up and run NeuroClash GG locally.

### Prerequisites
- Node.js (v18+)
- npm, yarn, or bun
- A Supabase Project
- Google Gemini API Key

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mrobialwww/neuroclash-gg.git
   cd neuroclash-gg
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root directory and add your keys:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_server_service_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

   *(Note: Never commit your `.env` files to version control!)*

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open the App:**
   Visit [http://localhost:3000](http://localhost:3000) in your browser.

## ➡️ User Flow

### Host Flow
`Login` → `Create Arena` → `Choose Default Material OR Upload PDF` → `Set Max Players & Questions` → `Click Generate AI` → `Share Room Code` → `Start Quiz`

### Student Flow (Multiplayer)
`Login` → `Enter Room Code` → `Select Avatar` → `Enter Waiting Room` → `Quiz Starts` → `Warm-up Phase` → `1v1 Battle Phase` → `StarBox Phase` → `Last Man Standing`

### Student Flow (Solo Mode)
`Choose Solo Mode` → `Select Material/Generate Questions` → `Select Avatar` → `Battle vs Bot` → `StarBox Phase` → `Finish Game`

## 🤝 Contributing

We welcome contributions to make NeuroClash GG even better!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure your code strictly follows our **Route-Repository-Service (RRS)** architecture and TypeScript strict mode guidelines.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
