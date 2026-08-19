import {
  CartesianGrid,
  Label,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AXIS_TICK, GRID_STROKE, LEGEND_STYLE, tickInterval } from "@/components/charts/utils"
import type { CuringCardRow } from "@/types/lotCardData"

const ZONE_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#0ea5e9", "#8b5cf6"]
const ZONES = [1, 2, 3, 4, 5, 6]

export function CuringCardModal({ rows }: { rows: CuringCardRow[] }) {
  const chartRows = rows.map((r) => {
    const row: Record<string, string | number> = { label: r.DATETIME }
    ZONES.forEach((zone) => {
      row[`ZONE_${zone}`] = r[`ZONE_${zone}` as keyof CuringCardRow] as number
    })
    return row
  })

  return (
    <DialogContent className="sm:max-w-3xl">
      <DialogHeader>
        <DialogTitle>양생 온도 추이</DialogTitle>
      </DialogHeader>
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartRows} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid stroke={GRID_STROKE} vertical={false} />
            <XAxis dataKey="label" tick={AXIS_TICK} interval={tickInterval(chartRows.length, 8)} />
            <YAxis tick={AXIS_TICK} width={52}>
              <Label value="°C" angle={-90} position="insideLeft" fontSize={11} fill="#6b7280" />
            </YAxis>
            <Tooltip formatter={(value) => `${value}°C`} />
            <Legend verticalAlign="bottom" iconSize={12} wrapperStyle={LEGEND_STYLE} />
            {ZONES.map((zone, i) => (
              <Line
                key={zone}
                type="monotone"
                dataKey={`ZONE_${zone}`}
                name={`ZONE ${zone}`}
                stroke={ZONE_COLORS[i]}
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 3 }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </DialogContent>
  )
}
