import { createContext, useContext, useState, ReactNode } from "react";

export interface UserAccount {
  name: string;
  email: string;
  password: string;
  role: "customer" | "admin";
}

interface AuthContextValue {
  user: UserAccount | null;
  isAdmin: boolean;
  login: (email: string, password: string) => { success: boolean; error: string; isAdmin: boolean };
  register: (name: string, email: string, password: string) => { success: boolean; error: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const USERS_KEY = "ykonline_users";
const SESSION_KEY = "ykonline_session";

const ADMIN_ACCOUNT: UserAccount = {
  name: "Admin YKonline",
  email: "admin@ykonlineshop.com",
  password: "YKadmin2026!",
  role: "admin",
};

function getStoredUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUsers(users: UserAccount[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getSession(): UserAccount | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(user: UserAccount | null) {
  if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  else localStorage.removeItem(SESSION_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserAccount | null>(() => getSession());

  const isAdmin = user?.role === "admin";

  const login = (email: string, password: string) => {
    // Check admin first
    if (email.toLowerCase() === ADMIN_ACCOUNT.email && password === ADMIN_ACCOUNT.password) {
      setUser(ADMIN_ACCOUNT);
      saveSession(ADMIN_ACCOUNT);
      return { success: true, error: "", isAdmin: true };
    }

    // Check registered users
    const users = getStoredUsers();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!found) {
      return { success: false, error: "No account found with this email. Please register first.", isAdmin: false };
    }

    if (found.password !== password) {
      return { success: false, error: "Incorrect password. Please try again.", isAdmin: false };
    }

    setUser(found);
    saveSession(found);
    return { success: true, error: "", isAdmin: false };
  };

  const register = (name: string, email: string, password: string) => {
    // Check if admin email
    if (email.toLowerCase() === ADMIN_ACCOUNT.email) {
      return { success: false, error: "This email is reserved. Please use another email." };
    }

    const users = getStoredUsers();

    // Check if already registered
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: "An account with this email already exists. Please log in." };
    }

    if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters." };
    }

    const newUser: UserAccount = { name, email, password, role: "customer" };
    saveUsers([...users, newUser]);
    setUser(newUser);
    saveSession(newUser);
    return { success: true, error: "" };
  };

  const logout = () => {
    setUser(null);
    saveSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
