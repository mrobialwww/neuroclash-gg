import { MainButton } from "@/components/common/MainButton";
import { CourseCard } from "./CourseCard";
import { User } from "@/app/types/User";

interface CategoryProps {
  title: string;
  courses: Array<{
    id: string | number;
    title: string;
    usersRegistered: number;
    usersTotal: number;
    questionsCount: number;
    iconPath: string;
    players: User[];
  }>;
}

export function CategorySection({ title, courses }: CategoryProps) {
  return (
    <div className="w-full">
      {/* Header section */}
      <div className="flex items-center justify-between mb-4 md:mb-6 px-1">
        <h2 className="text-2xl md:text-3xl font-bold text-white">
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
        {courses.map((course) => (
          <div key={course.id} className="flex justify-center">
            <CourseCard {...course} />
          </div>
        ))}
      </div>
    </div>
  );
}
