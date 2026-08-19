import { Line } from "react-chartjs-2"
import type { ChartData, ChartOptions } from "chart.js"

type Props = {
  labels: string[]
  dim1: number[]
  dim2: number[]
  dim3: number[]
  ucl?: number
  lcl?: number
  avg?: number
}

export function SpcTrendChart({ labels, dim1, dim2, dim3, ucl, lcl, avg }: Props) {
  const hasLimits = typeof ucl === "number" && typeof lcl === "number"

  const chartData: ChartData<"line"> = {
    labels,
    datasets: [
      { label: "치수1", data: dim1, borderColor: "#2563eb", backgroundColor: "#2563eb", pointRadius: 1.5, borderWidth: 1.5 },
      { label: "치수2", data: dim2, borderColor: "#16a34a", backgroundColor: "#16a34a", pointRadius: 1.5, borderWidth: 1.5 },
      { label: "치수3", data: dim3, borderColor: "#ea580c", backgroundColor: "#ea580c", pointRadius: 1.5, borderWidth: 1.5 },
      ...(hasLimits
        ? [
            {
              label: "UCL",
              data: labels.map(() => ucl as number),
              borderColor: "#dc2626",
              borderWidth: 1.5,
              pointRadius: 0,
              borderDash: [6, 4],
            },
            {
              label: "LCL",
              data: labels.map(() => lcl as number),
              borderColor: "#dc2626",
              borderWidth: 1.5,
              pointRadius: 0,
              borderDash: [6, 4],
            },
          ]
        : []),
      ...(typeof avg === "number"
        ? [
            {
              label: "평균",
              data: labels.map(() => avg as number),
              borderColor: "#0f172a",
              borderWidth: 1,
              pointRadius: 0,
              borderDash: [2, 2],
            },
          ]
        : []),
    ],
  }

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { x: { ticks: { maxTicksLimit: 10 } } },
    plugins: { legend: { position: "bottom", labels: { boxWidth: 12, boxHeight: 12 } } },
  }

  return <Line data={chartData} options={options} />
}
