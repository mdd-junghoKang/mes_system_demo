import { Construction } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function PlaceholderPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="max-w-sm">
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <Construction className="size-8 text-muted-foreground" />
          <p className="text-sm font-medium">준비 중입니다</p>
          <p className="text-sm text-muted-foreground">
            이 페이지는 다음 단계에서 React로 이관될 예정입니다.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
