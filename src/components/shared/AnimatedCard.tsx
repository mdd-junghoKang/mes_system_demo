import type { ReactNode } from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"

type Props = {
  className?: string
  children: ReactNode
}

// ChartCard/StatTile 같은 공용 컴포넌트를 안 쓰고 페이지에서 바로
// `rounded-lg border` 카드를 마크업하는 곳(모니터링 페이지 등)에 같은
// fade+slide-up 진입 애니메이션을 주기 위한 얇은 래퍼.
export function AnimatedCard({ className, children }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn("rounded-lg border bg-background p-4", className)}
    >
      {children}
    </motion.div>
  )
}
