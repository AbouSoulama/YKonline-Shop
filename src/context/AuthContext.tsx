import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { validateEmail, validateName, validatePassword } from "../lib/validation";

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
}

interface AuthResult {
  success: boolean;
  error: string;
  isAdmin: boolean;
}

interface AuthContextValue {
  user: UserAccount | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const USERS_KEY = "ykonline_users";
const SESSION_KEY = "ykonline_session";

interface LocalUser {
  name: string;
  email: string;
  password: string;
  role: "customer" | "admin";
}

function getLocalUsers(): LocalUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalUsers(users: LocalUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getLocalSession(): UserAccount | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveLocalSession(user: UserAccount | null) {
  if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  else localStorage.removeItem(SESSION_KEY);
}

async function fetchProfile(userId: string, email: string): Promise<UserAccount | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("name, role")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: userId,
    name: data.name,
    email,
    role: data.role as "customer" | "admin",
  };
}

function mapAuthError(message: string): string {
  if (message.includes("Invalid login credentials")) {
    return "Incorrect email or password. Please try again.";
  }
  if (message.includes("User already registered")) {
    return "An account with this email already exists. Please log in.";
  }
  if (message.includes("Email not confirmed")) {
    return "Please confirm your email before logging in.";
  }
  return message;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!isSupabaseConfigured) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setUser(null);
      return;
    }

    const profile = await fetchProfile(session.user.id, session.user.email ?? "");
    if (profile) setUser(profile);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setUser(getLocalSession());
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id, session.user.email ?? "");
        if (profile) setUser(profile);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id, session.user.email ?? "");
        if (profile) setUser(profile);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Refresh role when changed in Supabase dashboard
  useEffect(() => {
    if (!isSupabaseConfigured || !user?.id) return;

    const onFocus = () => { refreshUser(); };
    window.addEventListener("focus", onFocus);

    const channel = supabase
      .channel(`profile-${user.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${user.id}` },
        (payload) => {
          const row = payload.new as { name: string; role: "customer" | "admin" };
          setUser(prev => prev ? { ...prev, name: row.name, role: row.role } : null);
        },
      )
      .subscribe();

    return () => {
      window.removeEventListener("focus", onFocus);
      supabase.removeChannel(channel);
    };
  }, [user?.id, refreshUser]);

  const isAdmin = user?.role === "admin";

  const loginLocal = (email: string, password: string): AuthResult => {
    const users = getLocalUsers();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!found) {
      return { success: false, error: "No account found with this email. Please register first.", isAdmin: false };
    }
    if (found.password !== password) {
      return { success: false, error: "Incorrect password. Please try again.", isAdmin: false };
    }

    const account: UserAccount = {
      id: `local-${found.email}`,
      name: found.name,
      email: found.email,
      role: found.role,
    };
    setUser(account);
    saveLocalSession(account);
    return { success: true, error: "", isAdmin: account.role === "admin" };
  };

  const login = async (email: string, password: string): Promise<AuthResult> => {
    const emailError = validateEmail(email);
    if (emailError) return { success: false, error: emailError, isAdmin: false };
    if (!password) return { success: false, error: "Password is required.", isAdmin: false };

    if (!isSupabaseConfigured) return loginLocal(email, password);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      return { success: false, error: mapAuthError(error.message), isAdmin: false };
    }
    if (!data.user) {
      return { success: false, error: "Login failed. Please try again.", isAdmin: false };
    }

    const profile = await fetchProfile(data.user.id, data.user.email ?? email);
    if (!profile) {
      return { success: false, error: "Profile not found. Please contact support.", isAdmin: false };
    }

    setUser(profile);
    return { success: true, error: "", isAdmin: profile.role === "admin" };
  };

  const register = async (name: string, email: string, password: string) => {
    const nameError = validateName(name);
    if (nameError) return { success: false, error: nameError };

    const emailError = validateEmail(email);
    if (emailError) return { success: false, error: emailError };

    const passwordError = validatePassword(password);
    if (passwordError) return { success: false, error: passwordError };

    if (!isSupabaseConfigured) {
      const users = getLocalUsers();
      if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        return { success: false, error: "An account with this email already exists. Please log in." };
      }

      saveLocalUsers([...users, { name: name.trim(), email: email.trim().toLowerCase(), password, role: "customer" }]);
      const account: UserAccount = {
        id: `local-${email}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: "customer",
      };
      setUser(account);
      saveLocalSession(account);
      return { success: true, error: "" };
    }

    const normalizedEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: { data: { name: name.trim() } },
    });

    if (error) {
      return { success: false, error: mapAuthError(error.message) };
    }

    if (data.user && !data.session) {
      return {
        success: true,
        error: "Account created! Check your email to confirm, then log in.",
      };
    }

    if (data.user) {
      const profile = await fetchProfile(data.user.id, normalizedEmail);
      if (profile) setUser(profile);
    }

    return { success: true, error: "" };
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    saveLocalSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function confirmLogout(): boolean {
  return window.confirm("Are you sure you want to log out?");
}
