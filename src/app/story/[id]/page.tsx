import { notFound } from "next/navigation";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AudioPlayer from "@/components/AudioPlayer";
import FloatingActionButton from "@/components/FloatingActionButton";
import { prisma } from "@/lib/prisma";

interface StoryPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: StoryPageProps) {
  const { id } = await params;
  const story = await prisma.story.findUnique({ where: { id } });

  if (!story) {
    return { title: "Không tìm thấy truyện - Rổ Truyện" };
  }

  return {
    title: `${story.title} - Rổ Truyện`,
    description: story.textContent.slice(0, 160),
    openGraph: {
      title: story.title,
      description: story.textContent.slice(0, 160),
      images: [{ url: story.coverImage }],
      type: "article",
    },
  };
}

export default async function StoryPage({ params }: StoryPageProps) {
  const { id } = await params;
  const story = await prisma.story.findUnique({ where: { id } });

  if (!story) {
    notFound();
  }

  return (
    <>
      <Header />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        {/* Cover Image */}
        <div className="relative h-64 w-full overflow-hidden rounded-2xl shadow-md sm:h-80 md:h-96 animate-fade-in">
          <Image
            src={story.coverImage}
            alt={story.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 896px"
            priority
          />
        </div>

        {/* Title */}
        <h1 className="mt-6 text-3xl font-bold text-gray-900 animate-fade-in">
          {story.title}
        </h1>

        {/* Audio Player */}
        {story.audioUrl && (
          <div className="mt-6">
            <AudioPlayer audioUrl={story.audioUrl} title={story.title} />
          </div>
        )}

        {/* Text Content */}
        {story.textContent && (
          <article className="mt-8 animate-fade-in">
            <div className="prose prose-gray max-w-none rounded-2xl bg-white p-6 shadow-sm sm:p-8">
              <div className="whitespace-pre-wrap leading-relaxed text-gray-700">
                {story.textContent}
              </div>
            </div>
          </article>
        )}
      </main>

      <Footer />
      <FloatingActionButton />
    </>
  );
}
