import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { GRID_STROKE } from "./utils"

type Props = {
  labels: (string | number)[]
  counts: number[]
  color?: string
}

export function HistogramChart({ labels, counts, color = "#2563eb" }: Props) {
  const rows = labels.map((label, i) => ({ label: String(label), count: counts[i] }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={rows} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
        <CartesianGrid stroke={GRID_STROKE} vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#6b7280" }} />
        <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} width={40} allowDecimals={false} />
        <Tooltip />
        <Bar
          dataKey="count"
          name="빈도"
          fill={color}
          radius={[3, 3, 0, 0]}
          barSize={18}
          isAnimationActive={false}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
