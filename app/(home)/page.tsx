import { CreateArenaCard } from "@/components/dashboard/CreateArenaCard";
import { JoinArenaCard } from "@/components/dashboard/JoinArenaCard";
import { CategorySection } from "@/components/dashboard/CategorySection";
import { MatchProgressBar } from "@/components/match/MatchProgressBar";
import { GAME_ROOMS } from "@/lib/constants/game-rooms";
import { PlayerList } from "@/components/match/PlayerList";
import { PlayerCard } from "@/components/match/PlayerCard";

export default async function HomePage() {
  const groupedRooms = GAME_ROOMS.reduce((acc, room) => {
    if (!acc[room.category]) acc[room.category] = [];
    acc[room.category].push(room);
    return acc;
  }, {} as Record<string, typeof GAME_ROOMS>);

  const MOCK_PLAYERS = [
    {
      id: "p1",
      name: "Yanto_Gamer",
      character: "Slime",
      image: "/default/Slime.webp",
      health: 80,
      maxHealth: 100,
    },
    {
      id: "p2",
      name: "Griffin_Master",
      character: "Griffin",
      image: "/default/Griffin.webp",
      health: 100,
      maxHealth: 100,
    }
  ]

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

      <MatchProgressBar />

      <PlayerList players={MOCK_PLAYERS} />

      <PlayerCard
        player={{
          id: "p1",
          name: "Budi_Gamer",
          character: "Slime",
          image: "/default/Slime.webp",
          health: 80,
          maxHealth: 100
        }}
        isMe={true}
      />
    </main>
  );
}
