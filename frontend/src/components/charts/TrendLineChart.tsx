import {
  CartesianGrid,
  Label,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { AXIS_TICK, GRID_STROKE, paddedDomain, tickInterval } from "./utils"

type Props = {
  labels: string[]
  data: number[]
  seriesLabel: string
  yTitle: string
  lowLine?: number
  highLine?: number
}

export function TrendLineChart({ labels, data, seriesLabel, yTitle, lowLine, highLine }: Props) {
  const hasThresholds = typeof lowLine === "number" && typeof highLine === "number"
  const rows = labels.map((label, i) => ({ label, value: data[i] }))
  const domain = paddedDomain(hasThresholds ? [...data, lowLine, highLine] : data)

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={rows} margin={{ top: 8, right: 12, bottom: 20, left: 0 }}>
        <CartesianGrid stroke={GRID_STROKE} vertical={false} />
        <XAxis dataKey="label" tick={AXIS_TICK} interval={tickInterval(rows.length, 8)}>
          <Label value="TIME" position="insideBottom" offset={-14} fontSize={11} fill="#6b7280" />
        </XAxis>
        <YAxis domain={domain} tick={AXIS_TICK} width={52}>
          <Label value={yTitle} angle={-90} position="insideLeft" fontSize={11} fill="#6b7280" />
        </YAxis>
        <Tooltip formatter={(value) => Number(value).toFixed(2)} />
        {hasThresholds && (
          <ReferenceLine y={lowLine} stroke="#6366f1" strokeWidth={2} strokeDasharray="6 4">
            <Label value={`하한 ${lowLine}`} position="insideBottomRight" fontSize={10} fill="#6366f1" />
          </ReferenceLine>
        )}
        {hasThresholds && (
          <ReferenceLine y={highLine} stroke="#14b8a6" strokeWidth={2} strokeDasharray="6 4">
            <Label value={`상한 ${highLine}`} position="insideTopRight" fontSize={10} fill="#14b8a6" />
          </ReferenceLine>
        )}
        <Line
          type="linear"
          dataKey="value"
          name={seriesLabel}
          stroke="#e11d48"
          strokeWidth={1.5}
          dot={{ r: 1.5 }}
          activeDot={{ r: 3 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
