import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";

const AuthContext = createContext(null);
const STORAGE_KEY = "nexusflow.auth";


export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function restoreSession() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          // Confirm the stored token is still valid instead of trusting it blindly.
          const { user: freshUser } = await api.me(parsed.token);
          setUser(freshUser);
          setToken(parsed.token);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
      setReady(true);
    }
    restoreSession();
  }, []);

  function persist(nextUser, nextToken) {
    setUser(nextUser);
    setToken(nextToken);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: nextUser, token: nextToken }));
  }

  async function login(email, password) {
    const { user: loggedInUser, token: nextToken } = await api.login(email, password);
    persist(loggedInUser, nextToken);
    return loggedInUser;
  }

  async function signup(name, email, password) {
    const { user: newUser, token: nextToken } = await api.signup(name, email, password);
    persist(newUser, nextToken);
    return newUser;
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  /** Refreshes the cached user (e.g. after a Settings save) without a full re-login. */
  function updateUser(nextUser) {
    setUser(nextUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: nextUser, token }));
  }

  return (
    <AuthContext.Provider value={{ user, token, ready, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth() must be used inside <AuthProvider>");
  return ctx;
}
