import { CreateArenaCard } from "@/components/dashboard/CreateArenaCard";
import { JoinArenaCard } from "@/components/dashboard/JoinArenaCard";
import { CategorySection } from "@/components/dashboard/CategorySection";
import { GAME_ROOMS } from "@/lib/constants/game-rooms";

export default function DashboardPage() {
  // Group game rooms by category
  const categories = Array.from(
    new Set(GAME_ROOMS.map((room) => room.category)),
  );

  return (
    <main className="mx-auto max-w-[1400px] space-y-8 px-6 py-10 pb-20 md:px-12 lg:px-16">
      {/* Hero Section */}
      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-[1.1fr_1.5fr]">
        <JoinArenaCard />
        <CreateArenaCard />
      </div>

      {/* Categories Section */}
      <div className="space-y-8">
        {categories.map((category) => (
          <CategorySection
            key={category}
            title={category}
            courses={GAME_ROOMS.filter(
              (room) => room.category === category,
            ).map((room) => ({
              title: room.topic_material,
              progress: (room.usersRegistered / room.max_player) * 100,
              usersRegistered: room.usersRegistered,
              usersTotal: room.max_player,
              questionsCount: room.total_question,
              iconPath: room.image_url,
              players: room.players,
            }))}
          />
        ))}
      </div>
    </main>
  );
}
