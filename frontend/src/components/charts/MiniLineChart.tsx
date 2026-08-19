import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { AXIS_TICK, GRID_STROKE, tickInterval } from "./utils"

type Props = {
  labels: string[]
  values: number[]
  seriesLabel: string
  color: string
}

/** 범례·축 제목 없이 추이만 보여주는 소형 라인차트 (모니터링 카드용). */
export function MiniLineChart({ labels, values, seriesLabel, color }: Props) {
  const rows = labels.map((label, i) => ({ label, value: values[i] }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={rows} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid stroke={GRID_STROKE} vertical={false} />
        <XAxis dataKey="label" tick={AXIS_TICK} interval={tickInterval(rows.length, 8)} />
        <YAxis tick={AXIS_TICK} width={40} />
        <Tooltip />
        <Line
          type="linear"
          dataKey="value"
          name={seriesLabel}
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 3 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
