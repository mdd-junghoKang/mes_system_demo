type TooltipPayloadItem = {
  name?: string
  value?: number | string
  color?: string
}

type Props = {
  active?: boolean
  label?: string | number
  payload?: TooltipPayloadItem[]
  valueSuffix?: string
}

/**
 * Recharts 기본 Tooltip은 흰 박스에 그림자만 살짝 있는 정도라 카드 UI와 톤이 안
 * 맞는다. 앱 전체 팝오버/카드와 같은 토큰(rounded-lg, border, shadow-md)을 써서
 * 그래프에 마우스를 올렸을 때도 "같은 제품" 느낌이 나게 한다.
 */
export function ChartTooltip({ active, label, payload, valueSuffix = "" }: Props) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
      <p className="mb-1 font-medium text-muted-foreground">{label}</p>
      <div className="flex flex-col gap-0.5">
        {payload.map((p, i) => (
          <p key={i} className="flex items-center gap-1.5 whitespace-nowrap">
            {p.color && (
              <span className="inline-block size-2 shrink-0 rounded-full" style={{ background: p.color }} />
            )}
            <span>{p.name}</span>
            <span className="font-semibold tabular-nums">
              {typeof p.value === "number"
                ? Number.isInteger(p.value)
                  ? p.value.toLocaleString()
                  : p.value.toFixed(2)
                : p.value}
              {valueSuffix}
            </span>
          </p>
        ))}
      </div>
    </div>
  )
}
