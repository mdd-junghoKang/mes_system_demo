import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/store/useAuth"
import { Loader2 } from "lucide-react"

export function ProtectedRoute() {
  const { status } = useAuth()

  if (status === "checking") {
    return (
      <div className="flex h-svh items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (status === "anonymous") {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
