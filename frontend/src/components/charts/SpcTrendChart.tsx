import {
  CartesianGrid,
  Label,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { AXIS_TICK, GRID_STROKE, LEGEND_STYLE, tickInterval } from "./utils"

type Props = {
  labels: string[]
  dim1: number[]
  dim2: number[]
  dim3: number[]
  ucl?: number
  lcl?: number
  avg?: number
}

const SERIES = [
  { key: "dim1", label: "치수1", color: "#2563eb" },
  { key: "dim2", label: "치수2", color: "#16a34a" },
  { key: "dim3", label: "치수3", color: "#ea580c" },
] as const

export function SpcTrendChart({ labels, dim1, dim2, dim3, ucl, lcl, avg }: Props) {
  const hasLimits = typeof ucl === "number" && typeof lcl === "number"
  const rows = labels.map((label, i) => ({
    label,
    dim1: dim1[i],
    dim2: dim2[i],
    dim3: dim3[i],
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={rows} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
        <CartesianGrid stroke={GRID_STROKE} vertical={false} />
        <XAxis dataKey="label" tick={AXIS_TICK} interval={tickInterval(rows.length, 10)} />
        <YAxis tick={AXIS_TICK} width={52} />
        <Tooltip />
        <Legend verticalAlign="bottom" iconSize={12} wrapperStyle={LEGEND_STYLE} />
        {hasLimits && (
          <ReferenceLine y={ucl} stroke="#dc2626" strokeWidth={1.5} strokeDasharray="6 4">
            <Label value={`UCL ${ucl}`} position="insideTopRight" fontSize={10} fill="#dc2626" />
          </ReferenceLine>
        )}
        {hasLimits && (
          <ReferenceLine y={lcl} stroke="#dc2626" strokeWidth={1.5} strokeDasharray="6 4">
            <Label value={`LCL ${lcl}`} position="insideBottomRight" fontSize={10} fill="#dc2626" />
          </ReferenceLine>
        )}
        {typeof avg === "number" && (
          <ReferenceLine y={avg} stroke="#0f172a" strokeWidth={1} strokeDasharray="2 2">
            <Label value={`평균 ${avg}`} position="insideTopLeft" fontSize={10} fill="#0f172a" />
          </ReferenceLine>
        )}
        {SERIES.map((s) => (
          <Line
            key={s.key}
            type="linear"
            dataKey={s.key}
            name={s.label}
            stroke={s.color}
            strokeWidth={1.5}
            dot={{ r: 1.5 }}
            activeDot={{ r: 3 }}
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
