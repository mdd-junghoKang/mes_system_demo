import { Line } from "react-chartjs-2"
import type { ChartData, ChartOptions } from "chart.js"
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { CuringCardRow } from "@/types/lotCardData"

const ZONE_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#0ea5e9", "#8b5cf6"]

export function CuringCardModal({ rows }: { rows: CuringCardRow[] }) {
  const chartData: ChartData<"line"> = {
    labels: rows.map((r) => r.DATETIME),
    datasets: [1, 2, 3, 4, 5, 6].map((zone, i) => ({
      label: `ZONE ${zone}`,
      data: rows.map((r) => r[`ZONE_${zone}` as keyof CuringCardRow] as number),
      borderColor: ZONE_COLORS[i],
      backgroundColor: ZONE_COLORS[i],
      pointRadius: 0,
      borderWidth: 1.5,
      tension: 0.2,
    })),
  }

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { y: { title: { display: true, text: "°C" } } },
    plugins: {
      legend: { position: "bottom", labels: { boxWidth: 12, boxHeight: 12 } },
      tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y}°C` } },
    },
  }

  return (
    <DialogContent className="sm:max-w-3xl">
      <DialogHeader>
        <DialogTitle>양생 온도 추이</DialogTitle>
      </DialogHeader>
      <div className="h-[320px]">
        <Line data={chartData} options={options} />
      </div>
    </DialogContent>
  )
}
