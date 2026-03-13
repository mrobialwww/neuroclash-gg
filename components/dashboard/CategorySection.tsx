import { MainButton } from "@/components/common/MainButton";
import { AvatarItem } from "@/components/ui/AvatarCircles";
import { CourseCard } from "./CourseCard";

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
        <h2 className="text-[1.75rem] md:text-3xl font-semibold text-[#555555] tracking-tight">
          {title}
        </h2>
        <MainButton
          variant="blue"
          className="px-6 py-2 h-auto text-sm md:text-base border-none shadow-none"
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
