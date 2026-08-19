import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Label,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { AXIS_TICK, GRID_STROKE, LEGEND_STYLE, paddedDomain } from "./utils"

type Props = {
  labels: string[]
  ranges: [number, number][]
  averages: number[]
  lowLine?: number
  highLine?: number
}

/**
 * min~max 구간을 띄워 그리는(floating) 막대 + 평균 라인.
 * Chart.js는 `data: [[min, max]]`로 floating bar를 직접 지원하지만 Recharts는 없어서,
 * 투명한 `base`(0~min) 막대 위에 `span`(min~max) 막대를 쌓아 같은 모양을 만든다.
 */
export function HistoryRangeChart({ labels, ranges, averages, lowLine, highLine }: Props) {
  const hasThresholds = typeof lowLine === "number" && typeof highLine === "number"

  const rows = labels.map((label, i) => {
    const [lo, hi] = ranges[i] ?? [0, 0]
    return { label, base: lo, span: hi - lo, lo, hi, avg: averages[i] }
  })

  const domain = paddedDomain([
    ...ranges.flat(),
    ...averages,
    ...(hasThresholds ? [lowLine, highLine] : []),
  ])

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={rows} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
        <CartesianGrid stroke={GRID_STROKE} vertical={false} />
        <XAxis dataKey="label" tick={AXIS_TICK} />
        <YAxis domain={domain} tick={AXIS_TICK} width={52} />
        <Tooltip
          formatter={(value, name, item) => {
            if (name === "범위") {
              const p = item?.payload as { lo: number; hi: number }
              return [`${p.lo} ~ ${p.hi}`, "범위"]
            }
            return [Number(value).toFixed(2), String(name)]
          }}
        />
        <Legend verticalAlign="bottom" iconSize={12} wrapperStyle={LEGEND_STYLE} />
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
        <Bar
          dataKey="base"
          stackId="range"
          fill="transparent"
          legendType="none"
          barSize={16}
          isAnimationActive={false}
        />
        <Bar
          dataKey="span"
          name="범위"
          stackId="range"
          fill="#d1d5db"
          radius={[4, 4, 0, 0]}
          barSize={16}
          isAnimationActive={false}
        />
        <Line
          type="linear"
          dataKey="avg"
          name="입도분포"
          stroke="#0d9488"
          strokeWidth={1.5}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
