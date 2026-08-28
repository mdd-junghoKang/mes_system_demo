import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAggInfo, sortedActiveLines } from "@/hooks/useAggInfo"
import type { AggInfoRow } from "@/types/dashboard"

type Props = {
  value: string | null
  onChange: (lineInfo: string) => void
  filter?: (line: AggInfoRow) => boolean
}

export function LineSelector({ value, onChange, filter }: Props) {
  const { data } = useAggInfo()
  const active = data ? sortedActiveLines(data.agg_info) : []
  const lines = filter ? active.filter(filter) : active
  const current = lines.find((line) => line.LINE_INFO === value)

  return (
    <div className="grid gap-1.5">
      <Label htmlFor="line-selector">라인</Label>
      {/* 라인 개수가 늘어날 때마다 버튼 그룹이 줄바꿈되면서 레이아웃이 들쭉날쭉해지던
          문제를, 개수와 무관하게 폭이 고정되는 select로 바꿔서 해결한다. */}
      <Select value={value ?? ""} onValueChange={(v) => v && onChange(v)}>
        <SelectTrigger id="line-selector" className="w-45">
          <SelectValue placeholder="라인 선택">
            {current ? `${current.LINE_INFO}:${current.AGG_INFO}` : "라인 선택"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {lines.map((line) => (
            <SelectItem key={line.LINE_INFO} value={line.LINE_INFO}>
              {line.LINE_INFO}:{line.AGG_INFO}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
