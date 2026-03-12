import { MainButton } from "@/components/common/MainButton";
import { CourseCard } from "./CourseCard";
import { AvatarItem } from "./AvatarCircles";

interface CategoryProps {
  title: string;
  courses: Array<{
    title: string;
    progress: number;
    usersRegistered: number;
    usersTotal: number;
    questionsCount: number;
    iconPath: string;
    players: AvatarItem[];
  }>;
}

export function CategorySection({ title, courses }: CategoryProps) {
  return (
    <div className="w-full">
      {/* Header section */}
      <div className="flex items-center justify-between mb-4 md:mb-6 px-1">
        <h2 className="text-2xl md:text-3xl font-bold text-[#555555] ">
          {title}
        </h2>
        <MainButton
          variant="blue"
          className="bg-[#658BFF] hover:bg-[#3D79F3] px-6 py-2 h-auto text-sm md:text-base border-none shadow-none"
        >
          Lihat Lebih
        </MainButton>
      </div>

      {/* Cards list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {courses.map((course, index) => (
          <div key={index} className="flex justify-center">
            <CourseCard {...course} />
          </div>
        ))}
      </div>
    </div>
  );
}
