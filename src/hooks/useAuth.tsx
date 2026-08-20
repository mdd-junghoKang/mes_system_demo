import { createContext, useContext, useState, type ReactNode } from "react"
import { sleep } from "@/mocks/utils"

type AuthStatus = "checking" | "authenticated" | "anonymous"

type AuthContextValue = {
  status: AuthStatus
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

// Auth is mocked for now (no backend/DB dependency) — any non-empty
// email/password combination succeeds, and the session persists across
// reloads via localStorage so it behaves like a real login.
const MOCK_SESSION_KEY = "mock-auth-session"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(
    localStorage.getItem(MOCK_SESSION_KEY) ? "authenticated" : "anonymous",
  )

  async function login(email: string, password: string) {
    await sleep(200)
    if (!email.trim() || !password.trim()) return false

    localStorage.setItem(MOCK_SESSION_KEY, email)
    setStatus("authenticated")
    return true
  }

  async function logout() {
    await sleep(100)
    localStorage.removeItem(MOCK_SESSION_KEY)
    setStatus("anonymous")
  }

  return (
    <AuthContext.Provider value={{ status, login, logout }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
