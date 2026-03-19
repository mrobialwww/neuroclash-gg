import { CreateArenaCard } from "@/components/dashboard/CreateArenaCard";
import { JoinArenaCard } from "@/components/dashboard/JoinArenaCard";
import { CategorySection } from "@/components/dashboard/CategorySection";
import { GAME_ROOMS } from "@/lib/constants/game-rooms";
import { userService } from "@/services/auth/userService";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const dashboardData = user ? await userService.getDashboardData(user.id) : null;
  
  // Group game rooms by category
  const categories = Array.from(
    new Set(GAME_ROOMS.map((room) => room.category)),
  );

  const groupedRooms = GAME_ROOMS.reduce((acc, room) => {
    if (!acc[room.category]) acc[room.category] = [];
    acc[room.category].push(room);
    return acc;
  }, {} as Record<string, typeof GAME_ROOMS>);

  return (
    <main className="mx-auto max-w-[1400px] space-y-8 px-6 py-10 pb-20 md:px-12 lg:px-16">
      {/* Hero Section */}
      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-[1.1fr_1.5fr]">
        <JoinArenaCard
          rankName={dashboardData?.rankName || "Bronze"}
          rankScore={dashboardData?.trophy || 0}
          rankImageUrl={dashboardData?.rankImageUrl || "/rank/bronze.webp"}
        />

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
              id: room.game_room_id,
              title: room.topic_material,
              progress: (room.usersRegistered / room.max_player) * 100,
              usersRegistered: room.usersRegistered,
              usersTotal: room.max_player,
              questionsCount: room.total_question,
              iconPath: room.image_url,
              players: room.players,
              difficulty: room.difficulty,
            }))}
          />
        ))}
      </div>
    </main>
  );
}
