import { useState, type FormEvent } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import logo from "@/assets/logo.png"
import { useAuth } from "@/hooks/useAuth"
import { sleep } from "@/mocks/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function LoginPage() {
  const { status, login } = useAuth()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)

  if (status === "authenticated") {
    return <Navigate to="/main" replace />
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const email = String(form.get("email") ?? "")
    const password = String(form.get("password") ?? "")

    setSubmitting(true)
    const ok = await login(email, password)
    setSubmitting(false)

    if (ok) {
      navigate("/main", { replace: true })
    } else {
      toast.error("이메일 또는 비밀번호가 올바르지 않습니다.")
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/40 p-6">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <img src={logo} alt="Inoblock" className="mb-2 h-11 w-auto object-contain" />
          <CardTitle className="text-xl">Inoblock A-QMS</CardTitle>
          <CardDescription>품질관리 시스템에 로그인하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleLogin}>
            <div className="grid gap-1.5">
              <Label htmlFor="email">이메일</Label>
              <Input id="email" name="email" type="email" placeholder="name@company.com" required />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="password">비밀번호</Label>
              <Input id="password" name="password" type="password" placeholder="8자 이상" required />
            </div>
            <Button type="submit" className="mt-2 w-full" disabled={submitting}>
              {submitting ? "로그인 중..." : "로그인"}
            </Button>
          </form>

          <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
            <DialogTrigger render={<Button variant="ghost" className="mt-3 w-full" />}>
              회원가입
            </DialogTrigger>
            <JoinDialogContent onDone={() => setJoinOpen(false)} />
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )
}

function JoinDialogContent({ onDone }: { onDone: () => void }) {
  const [submitting, setSubmitting] = useState(false)

  async function handleJoin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const name = (form.elements.namedItem("name") as HTMLInputElement).value.trim()
    const password = (form.elements.namedItem("password") as HTMLInputElement).value.trim()
    const confirmPassword = (
      form.elements.namedItem("confirm-password") as HTMLInputElement
    ).value.trim()

    if (password !== confirmPassword) {
      toast.error("같은 비밀번호를 입력해주세요")
      return
    }
    if (password.length < 8) {
      toast.error("비밀번호는 8자 이상이어야 합니다")
      return
    }
    if (name.length < 2) {
      toast.error("이름은 최소 2글자 이상으로 입력해주세요")
      return
    }

    // Mocked: no backend/DB — join just validates locally and succeeds.
    setSubmitting(true)
    await sleep(300)
    setSubmitting(false)
    toast.success("회원가입이 완료되었습니다.")
    onDone()
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>회원가입</DialogTitle>
        <DialogDescription>새 계정을 생성합니다.</DialogDescription>
      </DialogHeader>
      <form className="grid gap-4" onSubmit={handleJoin}>
        <div className="grid gap-1.5">
          <Label htmlFor="join-email">이메일</Label>
          <Input id="join-email" name="email" type="email" required />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="join-name">이름</Label>
          <Input id="join-name" name="name" type="text" required />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="join-password">비밀번호</Label>
          <Input id="join-password" name="password" type="password" required />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="join-confirm-password">비밀번호 확인</Label>
          <Input id="join-confirm-password" name="confirm-password" type="password" required />
        </div>
        <Button type="submit" disabled={submitting}>
          {submitting ? "가입 중..." : "회원가입"}
        </Button>
      </form>
    </DialogContent>
  )
}
