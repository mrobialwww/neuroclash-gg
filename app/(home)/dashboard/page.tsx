import { CreateArenaCard } from "@/components/dashboard/CreateArenaCard";
import { JoinArenaCard } from "@/components/dashboard/JoinArenaCard";
import { CategorySection } from "@/components/dashboard/CategorySection";
import { createClient } from "@/lib/supabase/server";
import { userService } from "@/services/auth/userService";
import { gameRoomService } from "@/services/gameRoomService";


export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Parallel fetch: user data + game rooms
  const [dashboardData, groupedRooms] = await Promise.all([
    user ? userService.getDashboardData(user.id) : null,
    gameRoomService.getGroupedPublicRooms(),
  ]);

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
        {groupedRooms.map((group) => (
          <CategorySection
            key={group.topic}
            title={group.topic}
            rooms={group.rooms}
          />
        ))}
      </div>
    </main>
  );
}
