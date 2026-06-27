const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEmail(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return "Email is required.";
  if (!EMAIL_REGEX.test(trimmed)) return "Please enter a valid email address.";
  if (trimmed.includes("+") && trimmed.split("@")[0].includes("+")) {
    // allow plus addressing — still valid
  }
  return null;
}

export function validateName(name: string): string | null {
  const trimmed = name.trim();
  if (trimmed.length < 2) return "Name must be at least 2 characters.";
  if (trimmed.length > 80) return "Name is too long.";
  if (!/^[\p{L}\s'-]+$/u.test(trimmed)) {
    return "Name can only contain letters, spaces, hyphens and apostrophes.";
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
  if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter.";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number.";
  if (/\s/.test(password)) return "Password must not contain spaces.";
  return null;
}

export function validatePhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8) return "Please enter a valid phone number.";
  return null;
}

export function validatePostalCode(postalCode: string, country = "United States"): string | null {
  const trimmed = postalCode.trim();
  if (!trimmed) return "ZIP / postal code is required.";
  const isUS = ["united states", "usa", "us", "united states of america"].includes(country.trim().toLowerCase());
  if (isUS && !/^\d{5}(-\d{4})?$/.test(trimmed)) {
    return "Please enter a valid US ZIP code (e.g. 20602 or 20602-1234).";
  }
  if (trimmed.length < 3 || trimmed.length > 12) {
    return "Please enter a valid postal code.";
  }
  return null;
}

export function validateState(state: string, country = "United States"): string | null {
  const trimmed = state.trim();
  const isUS = ["united states", "usa", "us", "united states of america"].includes(country.trim().toLowerCase());
  if (isUS && !trimmed) return "Please select your state.";
  if (trimmed && trimmed.length > 50) return "State name is too long.";
  return null;
}
