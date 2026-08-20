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

// 배치 하나당 선 하나 + 범례 한 줄이라, 배치가 많으면(수십 개) 범례가 읽을 수 없을
// 만큼 길어진다. 이 기준을 넘으면 개별 배치는 범례에서 빼고 상/하한선만 남긴다.
const MAX_LEGEND_SERIES = 8

export function GradationCurveChart({ series, lowLine, highLine }: Props) {
  const suppressSeriesLegend = series.length > MAX_LEGEND_SERIES
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
      <LineChart data={rows} margin={{ top: 26, right: 12, bottom: 28, left: 0 }}>
        <CartesianGrid stroke={GRID_STROKE} vertical={false} />
        <XAxis dataKey="label" tick={AXIS_TICK}>
          <Label value="체 크기 (mm)" position="insideBottom" offset={-22} fontSize={11} fill="#6b7280" />
        </XAxis>
        <YAxis domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} tick={AXIS_TICK} width={52}>
          <Label value="통과율 (%)" position="top" offset={16} fontSize={11} fill="#6b7280" />
        </YAxis>
        <Tooltip />
        <Legend verticalAlign="bottom" iconSize={12} wrapperStyle={LEGEND_STYLE} />
        {series.map((s, si) => (
          <Line
            key={si}
            type="monotone"
            dataKey={`s${si}`}
            name={s.label}
            legendType={suppressSeriesLegend ? "none" : undefined}
            stroke={PALETTE[si % PALETTE.length]}
            strokeWidth={1.5}
            strokeOpacity={suppressSeriesLegend ? 0.5 : 1}
            dot={{ r: 2 }}
            activeDot={{ r: 4 }}
            isAnimationActive
            animationDuration={500}
            animationEasing="ease-out"
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
            isAnimationActive
            animationDuration={500}
            animationEasing="ease-out"
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
            isAnimationActive
            animationDuration={500}
            animationEasing="ease-out"
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  )
}
