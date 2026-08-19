import { Bar } from "react-chartjs-2"
import type { ChartData, ChartOptions } from "chart.js"

type Props = {
  labels: string[]
  values: number[]
}

function colorFor(value: number) {
  if (value < -0.3) return "#ef4444"
  if (value < 0) return "#f59e0b"
  return "#22c55e"
}

export function MaterialDeviationChart({ labels, values }: Props) {
  const maxAbs = Math.max(...values.map((v) => Math.abs(v)), 0.1)
  const step = maxAbs > 5 ? 1 : maxAbs > 1 ? 0.5 : 0.1
  const bound = Math.ceil(maxAbs / step) * step

  const chartData: ChartData<"bar"> = {
    labels,
    datasets: [
      {
        label: "차이율 (%)",
        data: values,
        backgroundColor: values.map(colorFor),
        borderRadius: 3,
      },
    ],
  }

  const options: ChartOptions<"bar"> = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { min: -bound, max: bound, grid: { color: "#e5e7eb" } },
      y: { ticks: { font: { size: 11 } } },
    },
    plugins: { legend: { display: false } },
  }

  return <Bar data={chartData} options={options} />
}
