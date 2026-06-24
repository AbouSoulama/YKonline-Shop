import { supabase, isSupabaseConfigured } from "./supabase";
import { getAuthRedirectUrl } from "./siteUrl";

export async function sendConfirmationEmail(email: string, name: string): Promise<void> {
  if (!isSupabaseConfigured) return;

  const redirectTo = getAuthRedirectUrl();

  // Supabase built-in resend
  await supabase.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: redirectTo },
  });

  // Custom branded email via edge function (uses Resend if configured)
  await supabase.functions.invoke("send-confirmation-email", {
    body: { email, name, redirectTo },
  });
}
