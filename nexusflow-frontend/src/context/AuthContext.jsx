import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);
const STORAGE_KEY = "nexusflow.auth";

/**
 * Wraps the app and exposes { user, token, ready, login, signup, logout }.
 *
 * login()/signup() are stubbed with a short fake delay + basic validation so
 * the full UI flow (form -> loading -> redirect) already works end to end.
 * Once the real backend Auth API (POST /api/auth/login, /signup) is wired
 * up, only the bodies of these two functions need to change — every
 * component that calls useAuth() stays exactly the same.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setUser(parsed.user);
        setToken(parsed.token);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    setReady(true);
  }, []);

  function persist(nextUser, nextToken) {
    setUser(nextUser);
    setToken(nextToken);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: nextUser, token: nextToken }));
  }

  async function login(email, password) {
    await new Promise((resolve) => setTimeout(resolve, 550)); // simulate network

    if (!email || !password) {
      throw new Error("Please enter your email and password.");
    }
    if (password.length < 6) {
      throw new Error("Incorrect email or password.");
    }

    const nextUser = { name: email.split("@")[0], email };
    const nextToken = `demo-token-${Date.now()}`;
    persist(nextUser, nextToken);
    return nextUser;
  }

  async function signup(name, email, password) {
    await new Promise((resolve) => setTimeout(resolve, 550)); // simulate network

    if (!name || !email || !password) {
      throw new Error("All fields are required.");
    }
    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters.");
    }

    const nextUser = { name, email };
    const nextToken = `demo-token-${Date.now()}`;
    persist(nextUser, nextToken);
    return nextUser;
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <AuthContext.Provider value={{ user, token, ready, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth() must be used inside <AuthProvider>");
  return ctx;
}
