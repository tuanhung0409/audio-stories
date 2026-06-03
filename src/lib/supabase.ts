import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side Supabase client using service role key to bypass RLS
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Upload an audio buffer to Supabase Storage and return the public URL.
 */
export async function uploadAudioToSupabase(
  buffer: Buffer,
  fileName: string
): Promise<string> {
  const bucketName = "audio-stories";

  const { data, error } = await supabaseAdmin.storage
    .from(bucketName)
    .upload(fileName, buffer, {
      contentType: "audio/wav",
      upsert: true,
    });

  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from(bucketName).getPublicUrl(data.path);

  return publicUrl;
}
