import { BookOpen } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StoryCard from "@/components/StoryCard";
import FloatingActionButton from "@/components/FloatingActionButton";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const stories = await prisma.story.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <Header />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        {/* Section Title */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-1.5 rounded-full bg-orange-500" />
          <h2 className="text-2xl font-bold text-gray-800">Mới nhất</h2>
        </div>

        {/* Stories Grid */}
        {stories.length > 0 ? (
          <div className="stagger-children mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {stories.map((story) => (
              <StoryCard
                key={story.id}
                id={story.id}
                title={story.title}
                coverImage={story.coverImage}
                isNew={story.isNew}
              />
            ))}
          </div>
        ) : (
          <div className="mt-16 flex flex-col items-center justify-center text-center animate-fade-in">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-50">
              <BookOpen className="h-10 w-10 text-orange-400" />
            </div>
            <h3 className="mt-6 text-lg font-semibold text-gray-700">
              Chưa có truyện nào
            </h3>
            <p className="mt-2 max-w-sm text-sm text-gray-500">
              Hiện tại chưa có truyện nào được đăng. Hãy quay lại sau để khám
              phá những câu chuyện thú vị nhé!
            </p>
          </div>
        )}
      </main>

      <Footer />
      <FloatingActionButton />
    </>
  );
}
