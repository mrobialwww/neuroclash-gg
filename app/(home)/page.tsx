import { CategorySection } from "@/components/dashboard/CategorySection";
import { OverlayJoinCardWrapper } from "@/components/home/OverlayJoinCardWrapper";
import { gameRoomService } from "@/services/gameRoomService";
import Image from "next/image";

export default async function HomePage() {
  const randomRooms = await gameRoomService.getRandomPublicRooms(4);

  return (
    <main className="mx-auto max-w-[1400px] space-y-8 px-6 py-10 pb-20 md:px-12 lg:px-16">
      {/* Hero Section */}
      <div className="min-h-[55vh] md:min-h-[65vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-10 md:gap-14 w-full">
          {/* Logo */}
          <div className="w-[65vw] sm:w-[50vw] md:w-[400px] lg:w-[500px] h-auto flex items-center justify-center">
            <Image
              src="/common/Logo_Neuroclash.svg"
              alt="Neuroclash"
              width={600}
              height={240}
              className="w-full h-auto object-contain"
              priority
            />
          </div>

          {/* TextField + OverlayJoinCard (client interactivity) */}
          <OverlayJoinCardWrapper />
        </div>
      </div>

      {/* Categories Section */}
      {randomRooms.length > 0 && (
        <div className="space-y-8">
          <CategorySection title="Daftar Arena" rooms={randomRooms} />
        </div>
      )}
    </main>
  );
}
