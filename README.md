# NeuroClash GG 🎮📚

**NeuroClash GG** is a web-based, gamified educational quiz platform that combines the accessibility of modern quiz applications with the competitive mechanics of an auto-battler game (like Magic Chess). Created by **Team Ditolak Magang**, it serves as an exciting, engaging learning experience and a practical tool for students to evaluate their knowledge playfully.

---

## 🎯 Executive Summary

The platform's core innovation lies in utilizing AI to automatically generate questions from user-uploaded materials or available templates. To boost student engagement, it introduces a competitive game loop complete with Solo and Multiplayer modes, Real-time 1v1 Battles, HP systems, Damage calculation, and Comeback mechanics (StarBox).

## ✨ Key Features

-   **Arena & Material Customization**: Hosts can choose default system materials (e.g., "Basic Programming") or upload their own PDF documents. They can customize room parameters such as the maximum number of players (15, 20, 40), difficulty, and the number of questions.
-   **AI Question Generator**: Automatically processes selected PDFs or templates using the Gemini API to generate structured multiple-choice questions (JSON format), complete with answer keys and difficulty levels ordered from easy to hard.
-   **Interactive Battle Phase**: Speed and accuracy matter! The fastest player to answer correctly deals damage to opponents. Timeout or answering incorrectly results in receiving damage.
-   **StarBox (Comeback Mechanic)**: Appears every 5 rounds. The player with the lowest HP gets priority to pick powerful game-changing items like the _Knowledge Book_ (+15% damage), _Healing Potion_ (+30 HP), or _Strong Shield_ (block 50% damage).
-   **Versatile Game Modes**:
    -   **Multiplayer Mode**: Real-time battle arena synchronization against other students via 6-digit room codes.
    -   **Solo Mode**: Practice independently against our adaptive system bot, _Prof. Bubu_.
-   **Character & Skin System**: Players can earn coins from matches to purchase and equip characters with different skin tiers (`default`, `epic`, `legend`) in the Shop.
-   **Player Statistics**: Tracks win rate, average rank, total trophies, and coins earned across all completed game sessions.

## 🏗️ Architecture

NeuroClash GG strictly adheres to the **Route-Repository-Service (RRS)** Clean Architecture pattern alongside modern Next.js conventions to ensure maintainability, testability, and high-performance real-time syncing.

-   **Client Components (`/components`)**: React components (Tailwind styled) focused purely on UI rendering. Uses `isolate` and GPU-accelerated animations for a glitch-free arena experience.
-   **State Layer (`/store`)**: Client-side Zustand stores for global state management (e.g., Timer, HP Bar, Coins), ensuring game logic doesn't block the browser main thread.
-   **API Routes Layer (`/app/api`)**: Serverless HTTP handlers. Strictly routes requests and returns responses. **No direct DB queries are executed here.**
-   **Domain Modules (`/modules`)**: The codebase groups Service and Repository layers by feature (e.g., `/modules/games`).
    -   **Service Layer (`*.service.ts`)**: Core business logic, complex score/damage calculations, AI generation prompting, and data processing.
    -   **Repository Layer (`*.repository.ts`)**: Abstracted database interactions. This is the **only** layer allowed to execute raw Supabase PostgreSQL queries.
-   **Realtime Engine**: Supabase WebSockets handle ultra-low latency broadcasting for damage syncing, timer alignment, and lobby participant updates.

## 🛠️ Tech Stack

Built with a high-performance modern ecosystem ensuring smooth gameplay and real-time synchronization:

-   **Frontend**: Next.js 14+ (App Router), TypeScript, React.js
-   **Styling**: Tailwind CSS
-   **State Management**: Zustand
-   **Backend & Database**: Supabase (PostgreSQL, Auth, Storage), Node.js (Route-Repository-Service architecture)
-   **Real-time Engine**: Supabase Realtime / WebSockets (for timer synchronization and 1v1 damage)
-   **AI Integration**: Google Gemini API (PDF extraction and JSON-based question generation)

## 🚀 Installation & Usage

Follow these steps to set up and run NeuroClash GG locally.

### Prerequisites

-   Node.js (v18+)
-   npm, yarn, or bun
-   A Supabase Project
-   Google Gemini API Key

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

    _(Note: Never commit your `.env` files to version control!)_

4. **Run the development server:**

    ```bash
    npm run dev
    ```

5. **Open the App:**
   Visit [http://localhost:3000](http://localhost:3000) in your browser.

## ➡️ User Flow

### Host Flow

`Login` → `Create Arena` → `Choose Default Material OR Upload PDF` → `Set Max Players & Questions` → `Click Generate AI` → `Share 6-Digit Room Code` → `Start Match` → `Finish Match`

### ⚔️ Student Flow (Multiplayer Battle)

`Login` → `Enter Room Code` → `Select Equipped Character` → `Lobby / Waiting Room` → `Match Starts` → `Question Phase (30s)` → `Damage Calculation Phase` → `StarBox Phase (Every 5 Rounds)` → `Match Ends` → `Receive Coins & Trophies`

### 🤖 Student Flow (Solo Mode)

`Choose Solo Mode` → `Select Topic/Upload PDF` → `Equip Character` → `Battle vs Prof. Bubu (Adaptive Bot)` → `StarBox Phase` → `Match Ends`

### 🛒 Progression & Shop Flow

`Earn Coins from Matches` → `Open Shop` → `Browse Characters & Skins` → `Purchase Skin (requires Default tier first)` → `Equip Character` → `Show Off in Lobby`

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
