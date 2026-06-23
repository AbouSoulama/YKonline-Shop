import { supabase, isSupabaseConfigured } from "./supabase";
import { validateEmail } from "./validation";

const LOCAL_KEY = "ykonline_newsletter";

export async function subscribeToNewsletter(email: string): Promise<{ success: boolean; message: string }> {
  const emailError = validateEmail(email);
  if (emailError) return { success: false, message: emailError };

  const normalized = email.trim().toLowerCase();

  if (!isSupabaseConfigured) {
    try {
      const existing: string[] = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
      if (existing.includes(normalized)) {
        return { success: true, message: "You are already subscribed to our newsletter." };
      }
      localStorage.setItem(LOCAL_KEY, JSON.stringify([...existing, normalized]));
      return { success: true, message: "Thank you! You are now subscribed to our newsletter." };
    } catch {
      return { success: false, message: "Subscription failed. Please try again." };
    }
  }

  const { error } = await supabase
    .from("newsletter_subscribers")
    .upsert({ email: normalized, active: true }, { onConflict: "email" });

  if (error) {
    if (error.code === "23505") {
      return { success: true, message: "You are already subscribed to our newsletter." };
    }
    return { success: false, message: "Subscription failed. Please try again later." };
  }

  return { success: true, message: "Thank you! You are now subscribed to our newsletter." };
}
