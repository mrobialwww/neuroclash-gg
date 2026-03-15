import { CreateArenaCard } from "@/components/dashboard/CreateArenaCard";
import { JoinArenaCard } from "@/components/dashboard/JoinArenaCard";
import { CategorySection } from "@/components/dashboard/CategorySection";
import { GAME_ROOMS } from "@/lib/constants/game-rooms";

export default async function HomePage() {
  const groupedRooms = GAME_ROOMS.reduce((acc, room) => {
    if (!acc[room.category]) acc[room.category] = [];
    acc[room.category].push(room);
    return acc;
  }, {} as Record<string, typeof GAME_ROOMS>);

  const options = [
    { id: "1", label: "A", text: "Jalin Digital Transformation" },
    { id: "2", label: "B", text: "Jalin AI Service Platform" },
    { id: "3", label: "C", text: "Centralized AI Gateway" },
    { id: "4", label: "D", text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
  ];

  return (
    <main className="mx-auto max-w-[1400px] space-y-8 px-6 py-10 pb-20 md:px-12 lg:px-16">
      {/* Hero Section */}
      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-[1.1fr_1.5fr]">
        <JoinArenaCard />
        <CreateArenaCard />
      </div>

      {/* Categories Section */}
      <div className="space-y-8">
        {Object.entries(groupedRooms).map(([category, rooms]) => (
          <CategorySection
            key={category}
            title={category}
            courses={rooms.map((room) => ({
              id: room.game_room_id,
              title: room.topic_material,
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
