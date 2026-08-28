import type { ReactNode } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Props = {
  start: string
  end: string
  onStartChange: (value: string) => void
  onEndChange: (value: string) => void
  onSearch: () => void
  children?: ReactNode
  searching?: boolean
}

export function DateRangeSearchBar({
  start,
  end,
  onStartChange,
  onEndChange,
  onSearch,
  children,
  searching,
}: Props) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-background p-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:flex-wrap">
        <div className="grid gap-1.5">
          <Label htmlFor="range-start">시작일</Label>
          <Input
            id="range-start"
            type="date"
            value={start}
            max={end}
            onChange={(e) => onStartChange(e.target.value)}
            className="w-[160px]"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="range-end">종료일</Label>
          <Input
            id="range-end"
            type="date"
            value={end}
            min={start}
            onChange={(e) => onEndChange(e.target.value)}
            className="w-[160px]"
          />
        </div>
        {children}
      </div>
      <Button onClick={onSearch} disabled={searching} className="gap-2">
        <Search className="size-4" />
        조회
      </Button>
    </div>
  )
}
