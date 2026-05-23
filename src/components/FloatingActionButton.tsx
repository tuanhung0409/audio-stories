import { MessageSquare } from "lucide-react";

export default function FloatingActionButton() {
  return (
    <button
      type="button"
      aria-label="Liên hệ hỗ trợ"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl animate-pulse-soft"
    >
      <MessageSquare className="h-6 w-6" />
    </button>
  );
}
