<CodeContent>
# NeuroClash GG 🎮📚

> **FICPACT CUP 2026 Web Development Competition**
>
> **Theme:** "Ficpact Playground"
> **Sub-Theme:** Interactive Edutainment
>
> **Created by:** Team Ditolak Magang

NeuroClash GG is an innovative, web-based interactive edutainment platform that transforms conventional learning into a highly engaging, competitive gaming experience. Targeted specifically at elementary to high school students (SD-SMA), it combines the accessibility of modern quiz platforms with the thrilling mechanics of an auto-battler game. Battle with your knowledge, deal damage to opponents, and emerge victorious!

---

## 🌟 Core Concept

NeuroClash GG is designed to make learning highly addictive and exciting. By simply answering educational materials, students engage in epic real-time battles supporting 4 to 40 players simultaneously. The faster and more accurately you answer, the more damage you deal to your opponents' HP. With built-in comeback mechanics and skill cards, the competition remains intense from start to finish!

## ✨ Key Features

- **🤖 AI-Powered Question Generator:** Teachers or hosts can instantly generate a structured JSON quiz with multiple choice questions, answers, and difficulty levels simply by uploading a document (e.g., PDF) or picking a preset topic. Powered by the Gemini API!
- **⚔️ Real-Time Massive Multiplayer (4 - 40 Players):** Test your intellect against multiple opponents in real-time. Experience the adrenaline of an auto-battler combined with an educational quiz.
- **🛡️ Dynamic Game Loop (HP & Damage):** Speed and accuracy matter. Answering correctly faster than your opponent deals raw damage to their Health Points (HP). If both answer incorrectly, both take damage.
- **🎁 The StarBox (Comeback Mechanic):** Falling behind? Don't worry! Every few rounds (e.g., every 5th round), the player with the lowest HP gets a priority pick on powerful items (e.g., Knowledge Book, Healing Potion, or Strong Shield) to turn the tide of the battle.
- **🤖 Solo Mode (vs. Bot):** No opponents online? Play offline learning exercises by challenging our highly adaptive bot, _Prof. Bubu_, to sharpen your skills independently.
- **📊 Comprehensive Dashboard & Statistics:** Track your Total Matches, Win Rate, Average Rank, First Places, and showcase your collection of customizable 2D avatars.

## 🛠️ Tech Stack

Built with a modern, high-performance, and battle-tested ecosystem to ensure smooth, real-time gaming capabilities:

- **Frontend:** [Next.js 14+](https://nextjs.org/) (App Router), React, TypeScript
- **Styling:** Tailwind CSS (Focused on responsive layouting, `isolate`, and GPU-accelerated micro-animations for chaotic battle phases)
- **State Management:** Zustand
- **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage)
- **Real-Time Engine:** Supabase Realtime / WebSockets
- **AI Integration:** Google Gemini API

## 🏗️ Architecture

NeuroClash GG strictly adheres to the **Route-Repository-Service (RRS)** Clean Architecture pattern to ensure maintainability, testability, and separation of concerns.

- **API Routes Layer (`/app/api`):** HTTP request handlers. Strictly no direct DB queries are executed here.
- **Service Layer (`/services`):** Core business logic, battle damage algorithms, AI prompting, and result synthesis.
- **Repository Layer (`/repositories`):** Abstracted database interactions and raw queries utilizing the Supabase client.
- **State Layer (`/store`):** Client-side Zustand stores handling session data and real-time battle UI states.

## 🚀 Getting Started

Follow these steps to run the NeuroClash GG platform locally on your machine.

### Prerequisites

- Node.js (v18+)
- npm, yarn, or bun
- A Supabase Project
- Google Gemini API Key

### Installation

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
   Create a `.env` or `.env.local` file in the root directory and add the following keys:

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
   Navigate to [http://localhost:3000](http://localhost:3000) in your web browser.

## 📜 Coding Standards & Best Practices

- **Strict TypeScript:** We enforce absolute strict mode, explicit return types, and unified interfaces. The `any` type is strictly prohibited.
- **Visual Protection:** Uses container isolation (`isolate overflow-hidden relative`) to prevent visual glitches during intense gameplay rendering.
- **Deployment:** NeuroClash GG is fully optimized for Vercel deployment, utilizing caching mechanisms and dynamic loading for heavy battle-arena components.

---

_Made with ❤️ by Tim Ditolak Magang for FICPACT CUP 2026. Coding Your Imagination, Creating Real Impact._
</CodeContent>
