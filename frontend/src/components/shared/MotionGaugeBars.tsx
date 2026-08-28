import { motion } from "motion/react"

const MOTION_KEYS = Array.from({ length: 10 }, (_, i) => String(202 + i))

type Props = {
  getValue: (key: string) => number
}

export function MotionGaugeBars({ getValue }: Props) {
  return (
    <div className="flex flex-col gap-2.5">
      {MOTION_KEYS.map((key) => {
        const raw = getValue(key)
        const value = Math.min(Math.max(raw, 0), 10)
        return (
          <div key={key} className="flex items-center gap-2">
            <span className="w-10 shrink-0 text-xs text-muted-foreground">{key}</span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${(value / 10) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <span className="w-8 shrink-0 text-right text-xs text-muted-foreground">{value}</span>
          </div>
        )
      })}
    </div>
  )
}
