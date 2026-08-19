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

import { SIEVE_LABELS } from "@/hooks/useGradationCurve"
import { AXIS_TICK, GRID_STROKE, LEGEND_STYLE } from "./utils"

const PALETTE = ["#e11d48", "#2563eb", "#16a34a", "#ea580c", "#7c3aed", "#0891b2", "#db2777"]

type Props = {
  series: { label: string; data: number[] }[]
  lowLine?: number[]
  highLine?: number[]
}

export function GradationCurveChart({ series, lowLine, highLine }: Props) {
  const rows = SIEVE_LABELS.map((label, i) => {
    const row: Record<string, string | number | undefined> = { label }
    series.forEach((s, si) => {
      row[`s${si}`] = s.data[i]
    })
    if (lowLine) row.low = lowLine[i]
    if (highLine) row.high = highLine[i]
    return row
  })

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={rows} margin={{ top: 8, right: 12, bottom: 20, left: 0 }}>
        <CartesianGrid stroke={GRID_STROKE} vertical={false} />
        <XAxis dataKey="label" tick={AXIS_TICK}>
          <Label value="체 크기 (mm)" position="insideBottom" offset={-14} fontSize={11} fill="#6b7280" />
        </XAxis>
        <YAxis domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} tick={AXIS_TICK} width={52}>
          <Label value="통과율 (%)" angle={-90} position="insideLeft" fontSize={11} fill="#6b7280" />
        </YAxis>
        <Tooltip />
        <Legend verticalAlign="bottom" iconSize={12} wrapperStyle={LEGEND_STYLE} />
        {series.map((s, si) => (
          <Line
            key={si}
            type="monotone"
            dataKey={`s${si}`}
            name={s.label}
            stroke={PALETTE[si % PALETTE.length]}
            strokeWidth={1.5}
            dot={{ r: 2 }}
            activeDot={{ r: 4 }}
            isAnimationActive={false}
          />
        ))}
        {lowLine && (
          <Line
            type="linear"
            dataKey="low"
            name="최소값"
            stroke="#6366f1"
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={false}
            isAnimationActive={false}
          />
        )}
        {highLine && (
          <Line
            type="linear"
            dataKey="high"
            name="최대값"
            stroke="#14b8a6"
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={false}
            isAnimationActive={false}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  )
}
