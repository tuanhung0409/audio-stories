import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export type LabelingProvider = "gemini" | "openrouter";

interface LabelingSettings {
  provider: LabelingProvider;
  geminiApiKey?: string;
  openrouterApiKey?: string;
}

// Simple in-memory store (in production, use database)
let settingsStore: LabelingSettings = {
  provider: "openrouter",
};

/**
 * GET /api/admin/labeling-settings
 * Returns current labeling settings (provider only, not secrets)
 */
export async function GET() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("admin-auth");

  if (!authCookie || authCookie.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    provider: settingsStore.provider,
  });
}

/**
 * POST /api/admin/labeling-settings
 * Update labeling settings (provider and optional API keys)
 */
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("admin-auth");

  if (!authCookie || authCookie.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { provider, geminiApiKey, openrouterApiKey } = body;

    if (!provider || !["gemini", "openrouter"].includes(provider)) {
      return NextResponse.json(
        { error: "Invalid provider" },
        { status: 400 }
      );
    }

    // Update settings
    if (provider === "gemini" && geminiApiKey) {
      settingsStore.geminiApiKey = geminiApiKey;
    }
    if (provider === "openrouter" && openrouterApiKey) {
      settingsStore.openrouterApiKey = openrouterApiKey;
    }
    settingsStore.provider = provider;

    return NextResponse.json({ success: true, provider });
  } catch (error) {
    console.error("Settings error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}

/**
 * Get current settings (internal use, includes secrets)
 */
export function getSettings(): LabelingSettings {
  return settingsStore;
}
