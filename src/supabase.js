import { createClient } from "@supabase/supabase-js";

/* These come from Netlify environment variables (Site settings → Environment
   variables). The URL and anon key are PUBLIC by design — data is protected
   by Row Level Security + the shared login, not by hiding the key. */
const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const SHARED_EMAIL = import.meta.env.VITE_SHARED_EMAIL;

export const supabase = createClient(url, anon);

/* ---- key/value storage backed by the `kv` table ---- */
export async function sget(key){
  const { data, error } = await supabase.from("kv").select("value").eq("key", key).maybeSingle();
  if(error){ console.error("[Hub] read failed for", key, error); return null; }
  if(!data) return null;
  return data.value; // jsonb is already parsed
}
export async function sset(key, val){
  const { error } = await supabase.from("kv").upsert({ key, value: val, updated_at: new Date().toISOString() });
  if(error){ console.error("[Hub] save failed for", key, error); }
  return !error;
}

/* ---- shared-password auth (one Supabase user the whole team signs into) ---- */
export async function getSession(){ const { data } = await supabase.auth.getSession(); return data.session; }
export async function signInWithPassword(password){ return supabase.auth.signInWithPassword({ email: SHARED_EMAIL, password }); }
export async function signOut(){ return supabase.auth.signOut(); }

/* ---- hotel map image upload, backed by Supabase Storage (bucket: "hub-media") ----
   Storing the image as a file (not a giant base64 string in the database) keeps
   every other save in the app fast and small. Returns a public URL on success. */
export async function uploadMapImage(file){
  try {
    const ext = (file.name.split(".").pop() || "png").toLowerCase();
    const path = `hotel-map/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("hub-media").upload(path, file, { upsert: true });
    if (upErr) { console.error(upErr); return null; }
    const { data } = supabase.storage.from("hub-media").getPublicUrl(path);
    return data?.publicUrl || null;
  } catch (e) {
    console.error(e);
    return null;
  }
}
