import { supabase, isSupabaseConfigured } from "./supabase";
import { validateEmail, validateName } from "./validation";

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}

export async function submitContactForm(data: ContactFormData): Promise<{ success: boolean; message: string }> {
  const firstNameError = validateName(data.firstName);
  if (firstNameError) return { success: false, message: firstNameError };

  const lastNameError = validateName(data.lastName);
  if (lastNameError) return { success: false, message: lastNameError };

  const emailError = validateEmail(data.email);
  if (emailError) return { success: false, message: emailError };

  if (!data.subject.trim()) return { success: false, message: "Please select a subject." };
  if (data.message.trim().length < 10) {
    return { success: false, message: "Message must be at least 10 characters." };
  }

  if (!isSupabaseConfigured) {
    return {
      success: true,
      message: "Thank you for your message! Our team will respond within 24 hours.",
    };
  }

  const { error } = await supabase.from("contact_messages").insert({
    first_name: data.firstName.trim(),
    last_name: data.lastName.trim(),
    email: data.email.trim().toLowerCase(),
    subject: data.subject.trim(),
    message: data.message.trim(),
  });

  if (error) {
    return { success: false, message: "Unable to send your message. Please try again or email us directly." };
  }

  return {
    success: true,
    message: "Thank you for your message! Our team will respond within 24 hours.",
  };
}
