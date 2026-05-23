import Link from "next/link";
import Image from "next/image";

interface StoryCardProps {
  id: string;
  title: string;
  coverImage: string;
  isNew: boolean;
}

export default function StoryCard({
  id,
  title,
  coverImage,
  isNew,
}: StoryCardProps) {
  return (
    <Link
      href={`/story/${id}`}
      className="group block overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={coverImage}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
        />

        {/* NEW Badge */}
        {isNew && (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white shadow-md">
            NEW
          </span>
        )}
      </div>

      {/* Title */}
      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-gray-800 transition-colors group-hover:text-orange-500">
          {title}
        </h3>
      </div>
    </Link>
  );
}
