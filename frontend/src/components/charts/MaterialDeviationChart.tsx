import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { GRID_STROKE } from "./utils"

type Props = {
  labels: string[]
  values: number[]
}

function colorFor(value: number) {
  if (value < -0.3) return "#ef4444"
  if (value < 0) return "#f59e0b"
  return "#22c55e"
}

export function MaterialDeviationChart({ labels, values }: Props) {
  const maxAbs = Math.max(...values.map((v) => Math.abs(v)), 0.1)
  const step = maxAbs > 5 ? 1 : maxAbs > 1 ? 0.5 : 0.1
  const bound = Math.ceil(maxAbs / step) * step

  const rows = labels.map((label, i) => ({ label, value: values[i] }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={rows}
        layout="vertical"
        margin={{ top: 8, right: 16, bottom: 0, left: 0 }}
      >
        <CartesianGrid stroke={GRID_STROKE} horizontal={false} />
        <XAxis type="number" domain={[-bound, bound]} tick={{ fontSize: 11, fill: "#6b7280" }} />
        <YAxis
          type="category"
          dataKey="label"
          tick={{ fontSize: 11, fill: "#6b7280" }}
          width={90}
        />
        <Tooltip formatter={(value) => `${Number(value).toFixed(2)} %`} />
        <ReferenceLine x={0} stroke="#9ca3af" />
        <Bar dataKey="value" name="차이율 (%)" radius={3} isAnimationActive={false}>
          {rows.map((r, i) => (
            <Cell key={i} fill={colorFor(r.value)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
