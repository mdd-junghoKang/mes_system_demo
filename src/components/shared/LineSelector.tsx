import { Button } from "@/components/ui/button"
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

  return (
    <div className="flex flex-wrap gap-2">
      {lines.map((line) => (
        <Button
          key={line.LINE_INFO}
          type="button"
          size="sm"
          variant={value === line.LINE_INFO ? "default" : "outline"}
          onClick={() => onChange(line.LINE_INFO)}
        >
          {line.LINE_INFO}:{line.AGG_INFO}
        </Button>
      ))}
    </div>
  )
}
