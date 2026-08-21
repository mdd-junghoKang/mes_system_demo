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

import { ChartTooltip } from "./ChartTooltip"
import { buildDateTimeTicks, AXIS_TICK, GRID_STROKE, paddedDomain } from "./utils"

type Props = {
  labels: string[]
  data: number[]
  seriesLabel: string
  yTitle: string
  lowLine?: number
  highLine?: number
  /** 툴팁에 값 뒤에 붙일 단위 (예: "%"). 안 넘기면 단위 없이 숫자만 표시한다. */
  valueSuffix?: string
}

export function TrendLineChart({
  labels,
  data,
  seriesLabel,
  yTitle,
  lowLine,
  highLine,
  valueSuffix = "",
}: Props) {
  const hasThresholds = typeof lowLine === "number" && typeof highLine === "number"
  const rows = labels.map((label, i) => ({ label, value: data[i] }))
  const domain = paddedDomain(hasThresholds ? [...data, lowLine, highLine] : data)
  const { ticks, format: formatTick } = buildDateTimeTicks(labels)

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={rows} margin={{ top: 26, right: 12, bottom: 20, left: 0 }}>
        <CartesianGrid stroke={GRID_STROKE} vertical={false} />
        <XAxis dataKey="label" tick={AXIS_TICK} ticks={ticks} tickFormatter={formatTick}>
          <Label value="TIME" position="insideBottom" offset={-14} fontSize={11} fill="#6b7280" />
        </XAxis>
        {/* 세로로 회전된 한 글자씩 쌓인 제목은 읽기 힘들어서, 축 위에 가로로 눕혀서 표시한다. */}
        <YAxis domain={domain} tick={AXIS_TICK} width={52}>
          <Label value={yTitle} position="top" offset={16} fontSize={11} fill="#6b7280" />
        </YAxis>
        <Tooltip content={<ChartTooltip valueSuffix={valueSuffix} />} />
        {/* 상한/하한은 서로 다른 두 정보가 아니라 "정상 범위 하나"의 위아래 경계라서,
            인디고/틸처럼 다른 색을 쓰면 색이 늘어나기만 하고 구분할 의미가 없다.
            같은 중립 회색으로 통일해서 실제 데이터 선(파랑)만 눈에 띄게 한다. */}
        {hasThresholds && (
          <ReferenceLine y={lowLine} stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="6 4">
            <Label value={`하한 ${lowLine}`} position="insideBottomRight" fontSize={10} fill="#64748b" />
          </ReferenceLine>
        )}
        {hasThresholds && (
          <ReferenceLine y={highLine} stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="6 4">
            <Label value={`상한 ${highLine}`} position="insideTopRight" fontSize={10} fill="#64748b" />
          </ReferenceLine>
        )}
        <Line
          type="linear"
          dataKey="value"
          name={seriesLabel}
          stroke="#2563eb"
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 4 }}
          isAnimationActive
          animationDuration={700}
          animationEasing="ease-out"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
