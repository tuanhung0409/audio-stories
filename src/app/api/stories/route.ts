import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadAudioToSupabase } from "@/lib/supabase";

/**
 * GET /api/stories
 * Returns all stories ordered by creation date (newest first).
 */
export async function GET() {
  try {
    const stories = await prisma.story.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(stories);
  } catch (error) {
    console.error("Failed to fetch stories:", error);
    return NextResponse.json(
      { error: "Failed to fetch stories" },
      { status: 500 }
    );
  }
}

/**
 * Converts a title string into a URL-friendly slug.
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

/**
 * POST /api/stories
 * Creates a new story with TTS audio generation.
 *
 * IMPORTANT: Vercel serverless functions have a 10-second timeout on the Hobby plan
 * and 60 seconds on Pro. The TTS API call + Supabase upload may exceed this limit
 * for very long text content. Consider using Vercel's maxDuration config or
 * a background job queue for production use with long stories.
 */
export async function POST(request: Request) {
  // Check admin authentication
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("admin-auth");

  if (!authCookie || authCookie.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, coverImage, textContent, labeledContent } = await request.json();

    if (!title || !coverImage || !textContent) {
      return NextResponse.json(
        { error: "Missing required fields: title, coverImage, textContent" },
        { status: 400 }
      );
    }

    // Text sent to TTS: use labeled version if available, otherwise raw content
    const ttsText = labeledContent?.trim() || textContent;

    let audioUrl = "";
    let warning: string | undefined;

    // Attempt TTS generation and audio upload
    try {
      const ttsApiUrl = process.env.CUSTOM_TTS_API_URL;
      if (!ttsApiUrl) {
        throw new Error("CUSTOM_TTS_API_URL is not configured");
      }

      // Build TTS request body — send labeled content (with emotion tags) to TTS
      const ttsBody = {
        text: ttsText,
        default_emotion: process.env.TTS_DEFAULT_EMOTION ?? "neutral",
        temperature: parseFloat(process.env.TTS_TEMPERATURE ?? "0.6"),
        top_k: parseInt(process.env.TTS_TOP_K ?? "30", 10),
        silence_ms: parseInt(process.env.TTS_SILENCE_MS ?? "50", 10),
        join_method: process.env.TTS_JOIN_METHOD ?? "ola",
        ola_frame_ms: parseInt(process.env.TTS_OLA_FRAME_MS ?? "40", 10),
        ola_hop_ms: parseInt(process.env.TTS_OLA_HOP_MS ?? "10", 10),
        crossfade_ms: parseInt(process.env.TTS_CROSSFADE_MS ?? "120", 10),
      };

      const ttsResponse = await fetch(ttsApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ttsBody),
      });

      if (!ttsResponse.ok) {
        const errText = await ttsResponse.text().catch(() => "");
        throw new Error(
          `TTS API returned ${ttsResponse.status}: ${ttsResponse.statusText}${errText ? ` — ${errText}` : ""}`
        );
      }

      const audioArrayBuffer = await ttsResponse.arrayBuffer();
      const audioBuffer = Buffer.from(audioArrayBuffer);

      const slug = slugify(title) || "story";
      // VieNeu TTS returns WAV audio
      const fileName = `${Date.now()}-${slug}.wav`;

      audioUrl = await uploadAudioToSupabase(audioBuffer, fileName);
    } catch (ttsError) {
      console.error("TTS generation failed:", ttsError);
      warning =
        "Story saved but audio generation failed. You can regenerate audio later.";
    }

    // Save story to database regardless of TTS result
    const story = await prisma.story.create({
      data: {
        title,
        coverImage,
        textContent,
        audioUrl,
      },
    });

    return NextResponse.json(
      {
        ...story,
        ...(warning ? { warning } : {}),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create story:", error);
    return NextResponse.json(
      { error: "Failed to create story" },
      { status: 500 }
    );
  }
}
