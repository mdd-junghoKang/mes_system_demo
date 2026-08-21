import {
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { ChartTooltip } from "./ChartTooltip"
import { GRID_STROKE, LEGEND_STYLE } from "./utils"

type Series = {
  label: string
  data: number[]
  color: string
}

type Props = {
  labels: string[]
  series: Series[]
  yTitle?: string
}

export function CountBarChart({ labels, series, yTitle = "건수" }: Props) {
  const rows = labels.map((label, i) => {
    const row: Record<string, string | number> = { label }
    series.forEach((s, si) => {
      row[`s${si}`] = s.data[i]
    })
    return row
  })

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={rows} margin={{ top: 26, right: 12, bottom: 0, left: 0 }}>
        <CartesianGrid stroke={GRID_STROKE} vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#6b7280" }} />
        <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} width={44} allowDecimals={false}>
          <Label value={yTitle} position="top" offset={16} fontSize={11} fill="#6b7280" />
        </YAxis>
        <Tooltip content={<ChartTooltip valueSuffix="건" />} />
        <Legend verticalAlign="bottom" iconSize={12} wrapperStyle={LEGEND_STYLE} />
        {series.map((s, si) => (
          <Bar
            key={si}
            dataKey={`s${si}`}
            name={s.label}
            fill={s.color}
            radius={[4, 4, 0, 0]}
            barSize={24}
            isAnimationActive
            animationDuration={500}
            animationEasing="ease-out"
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
