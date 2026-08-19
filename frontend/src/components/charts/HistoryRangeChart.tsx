import { Chart } from "react-chartjs-2"
import type { ChartData, ChartOptions } from "chart.js"

type Props = {
  labels: string[]
  ranges: [number, number][]
  averages: number[]
  lowLine?: number
  highLine?: number
}

export function HistoryRangeChart({ labels, ranges, averages, lowLine, highLine }: Props) {
  const hasThresholds = typeof lowLine === "number" && typeof highLine === "number"

  const chartData: ChartData<"bar" | "line"> = {
    labels,
    datasets: [
      {
        type: "bar" as const,
        label: "범위",
        data: ranges,
        backgroundColor: "#d1d5db",
        borderRadius: 4,
        barThickness: 16,
      },
      {
        type: "line" as const,
        label: "입도분포",
        data: averages,
        borderColor: "#0d9488",
        backgroundColor: "#0d9488",
        pointRadius: 3,
        borderWidth: 1.5,
        tension: 0,
      },
      ...(hasThresholds
        ? [
            {
              type: "line" as const,
              label: "하한선",
              data: labels.map(() => lowLine as number),
              borderColor: "#6366f1",
              borderWidth: 2,
              pointRadius: 0,
              borderDash: [6, 4],
            },
            {
              type: "line" as const,
              label: "상한선",
              data: labels.map(() => highLine as number),
              borderColor: "#14b8a6",
              borderWidth: 2,
              pointRadius: 0,
              borderDash: [6, 4],
            },
          ]
        : []),
    ],
  }

  const allValues = [...ranges.flat(), ...averages, ...(hasThresholds ? [lowLine!, highLine!] : [])]
  const minVal = Math.min(...allValues)
  const maxVal = Math.max(...allValues)
  const padding = Math.max((maxVal - minVal) * 0.15, 0.1)

  const options: ChartOptions<"bar" | "line"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: Math.floor(minVal - padding),
        max: Math.ceil(maxVal + padding),
        ticks: { stepSize: 0.1 },
      },
      x: { grid: { display: false } },
    },
    plugins: {
      legend: { position: "bottom", labels: { boxWidth: 12, boxHeight: 12 } },
    },
  }

  return <Chart type="bar" data={chartData} options={options} />
}
