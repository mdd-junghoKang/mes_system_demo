import { create } from "zustand"
import { api } from "@/lib/api"

type AuthStatus = "checking" | "authenticated" | "anonymous"

type AuthState = {
  status: AuthStatus
  checkSession: () => Promise<void>
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
}

export const useAuth = create<AuthState>((set) => ({
  status: "checking",

  async checkSession() {
    try {
      await api.get("/auth/me")
      set({ status: "authenticated" })
    } catch {
      set({ status: "anonymous" })
    }
  },

  async login(email, password) {
    try {
      await api.post("/auth/login", { email, password })
      set({ status: "authenticated" })
      return true
    } catch {
      return false
    }
  },

  async logout() {
    await api.post("/auth/logout")
    set({ status: "anonymous" })
  },
}))
