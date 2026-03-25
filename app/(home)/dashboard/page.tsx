import { CreateArenaCard } from "@/components/dashboard/CreateArenaCard";
import { JoinArenaCard } from "@/components/dashboard/JoinArenaCard";
import { CategorySection } from "@/components/dashboard/CategorySection";
import { createClient } from "@/lib/supabase/server";
import { userService } from "@/services/auth/userService";
import { gameRoomService } from "@/services/gameRoomService";


export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Parallel fetch: user data + public grouped rooms + user's own rooms
  const [dashboardData, groupedRooms, userRooms] = await Promise.all([
    user ? userService.getDashboardData(user.id) : null,
    gameRoomService.getGroupedPublicRooms(),
    user ? gameRoomService.getUserRooms(user.id) : [],
  ]);

  // Helper formatting for category titles
  const formatTopicTitle = (topic: string) => {
    const t = topic.toLowerCase();
    if (t === "bahasaindonesia") return "Bahasa Indonesia";
    if (t === "bahasainggris") return "Bahasa Inggris";
    return topic.charAt(0).toUpperCase() + topic.slice(1);
  };

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

      <div className="space-y-12">
        {/* Arena Kamu Section (Personalized) */}
        {userRooms && userRooms.length > 0 && (
          <CategorySection
            key="arena-kamu"
            title="Arena Kamu"
            rooms={userRooms}
          />
        )}

        {/* Categories Section (Public) */}
        {groupedRooms.map((group) => {
          // Filter to ensure only public rooms are shown in categorized sections
          const publicRooms = group.rooms.filter(r => r.room_visibility === 'public');

          if (publicRooms.length === 0) return null;

          return (
            <CategorySection
              key={group.topic}
              title={formatTopicTitle(group.topic)}
              rooms={publicRooms}
            />
          );
        })}
      </div>
    </main>
  );
}
