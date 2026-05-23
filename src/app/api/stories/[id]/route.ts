import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * GET /api/stories/[id]
 * Returns a single story by ID.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const story = await prisma.story.findUnique({ where: { id } });

    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    return NextResponse.json(story);
  } catch (error) {
    console.error("Failed to fetch story:", error);
    return NextResponse.json(
      { error: "Failed to fetch story" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/stories/[id]
 * Updates a story's fields. Accepts partial fields: title, coverImage, textContent, isNew.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Check admin authentication
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("admin-auth");

  if (!authCookie || authCookie.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Only allow updating specific fields
    const updateData: Record<string, unknown> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.coverImage !== undefined) updateData.coverImage = body.coverImage;
    if (body.textContent !== undefined) updateData.textContent = body.textContent;
    if (body.isNew !== undefined) updateData.isNew = body.isNew;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const story = await prisma.story.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(story);
  } catch (error) {
    console.error("Failed to update story:", error);
    return NextResponse.json(
      { error: "Failed to update story" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/stories/[id]
 * Deletes a story and its associated audio file from Supabase Storage.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Check admin authentication
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("admin-auth");

  if (!authCookie || authCookie.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch the story first to get the audioUrl
    const story = await prisma.story.findUnique({ where: { id } });

    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    // Delete audio from Supabase Storage if it exists
    if (story.audioUrl) {
      try {
        // Extract the file path from the public URL
        // URL format: https://<project>.supabase.co/storage/v1/object/public/audio-stories/<filename>
        const bucketName = "audio-stories";
        const url = new URL(story.audioUrl);
        const pathPrefix = `/storage/v1/object/public/${bucketName}/`;
        const filePath = url.pathname.startsWith(pathPrefix)
          ? url.pathname.slice(pathPrefix.length)
          : url.pathname.split("/").pop();

        if (filePath) {
          const { error: deleteError } = await supabaseAdmin.storage
            .from(bucketName)
            .remove([filePath]);

          if (deleteError) {
            console.error("Failed to delete audio from Supabase:", deleteError);
          }
        }
      } catch (storageError) {
        // Log but don't fail the deletion if storage cleanup fails
        console.error("Error cleaning up audio file:", storageError);
      }
    }

    // Delete the story from the database
    await prisma.story.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete story:", error);
    return NextResponse.json(
      { error: "Failed to delete story" },
      { status: 500 }
    );
  }
}
