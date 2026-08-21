import { create } from "zustand"
import { sleep } from "@/mocks/utils"

type AuthStatus = "checking" | "authenticated" | "anonymous"

type AuthState = {
  status: AuthStatus
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
}

// Auth is mocked for now (no backend/DB dependency) — any non-empty
// email/password combination succeeds, and the session persists across
// reloads via localStorage so it behaves like a real login.
const MOCK_SESSION_KEY = "mock-auth-session"

export const useAuth = create<AuthState>((set) => ({
  status: localStorage.getItem(MOCK_SESSION_KEY) ? "authenticated" : "anonymous",

  async login(email, password) {
    await sleep(200)
    if (!email.trim() || !password.trim()) return false

    localStorage.setItem(MOCK_SESSION_KEY, email)
    set({ status: "authenticated" })
    return true
  },

  async logout() {
    await sleep(100)
    localStorage.removeItem(MOCK_SESSION_KEY)
    set({ status: "anonymous" })
  },
}))
